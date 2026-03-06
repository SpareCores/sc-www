import os
import subprocess
import time
import multiprocessing
import re
import shutil
import psutil
import requests
import sys
import json
import threading
import importlib
from collections import defaultdict

# --- CONFIGURATION ---
# Use server.mjs for the entry point
SERVER_COMMAND = [
    "node",
    "--inspect",
    "--trace-warnings",
    "dist/sc-www/server/server.mjs",
]
TARGET_BASE = "http://localhost:3000"

NUM_WORKERS = 3
CONCURRENCY = 1  # Lowered for SSR intensity
DURATION = "15s"  # broad coverage mode (8 URLs × ~16s = ~2 min/run)

# --- REPRESENTATIVE URL LIST ---
# One URL per distinct SSR code path. Covers all major rendering branches
# without testing hundreds of near-identical pages (e.g. all hcloud servers).
#
# Groups and rationale:
#   Server detail (no lstopo)  — already validated clean in initial testing
#   Server detail (with lstopo)— different SVG rendering paths
#   Server compare (preset)    — heaviest page; multiple parallel API calls
#   Server compare (custom)    — different compare code path (empty/default state)
#   Article                    — markdown rendering, zero API calls
#   Home                       — lightweight; tests root-level injectors
#   Vendors                    — table-only render, no per-server data

TARGET_URLS = [
    f"{TARGET_BASE}/server/hcloud/cpx21",  # server detail — without lstopo SVG
    f"{TARGET_BASE}/server/aws/t3a.nano",  # server detail — with super simple lstopo SVG
    f"{TARGET_BASE}/server/ovh/c3-256",  # server detail — with many lstopo SVG
    f"{TARGET_BASE}/server/aws/r8a.48xlarge",  # server detail — with multiple lstopo SVG
    f"{TARGET_BASE}/server/gcp/c3d-highcpu-360",  # server detail — with monster lstopo SVG
    f"{TARGET_BASE}/compare",  # compare — empty/default state
    f"{TARGET_BASE}/article/why-use-spare-cores",  # article — markdown, no API
    f"{TARGET_BASE}/",  # home
    f"{TARGET_BASE}/vendors",  # vendors table
]

SNAPSHOT_CACHE = {}
OUTPUT_DIR = "leakDetector"
HEAP_SNAPSHOTS_DIR = os.path.join(OUTPUT_DIR, "heap_snapshots")
RUN_TIMESTAMP = time.strftime("%Y%m%d_%H%M%S")
SNAPSHOT_FILES = {
    "before": os.path.join(
        HEAP_SNAPSHOTS_DIR, f"snapshot_before_{RUN_TIMESTAMP}.heapsnapshot"
    ),
    "after_1": os.path.join(
        HEAP_SNAPSHOTS_DIR, f"snapshot_after_1_{RUN_TIMESTAMP}.heapsnapshot"
    ),
    "after_2": os.path.join(
        HEAP_SNAPSHOTS_DIR, f"snapshot_after_2_{RUN_TIMESTAMP}.heapsnapshot"
    ),
    "after_3": os.path.join(
        HEAP_SNAPSHOTS_DIR, f"snapshot_after_3_{RUN_TIMESTAMP}.heapsnapshot"
    ),
}
SUMMARY_FILE = os.path.join(OUTPUT_DIR, "summary.json")
SUPPRESSED_NODE_EVENTS = {"request", "response"}
VERBOSE_NODE_LOGS = os.environ.get("LEAK_DETECTOR_VERBOSE_NODE_LOGS", "0") == "1"


# --- 1. URL PROVIDER ---
def get_local_urls():
    print(
        f"🗺️  Using {len(TARGET_URLS)} representative URLs across distinct SSR code paths:"
    )
    for url in TARGET_URLS:
        print(f"    {url}")
    return list(TARGET_URLS)


# --- 2. THE LOAD ENGINE & FAIL-SAFE ---
def run_load(url_chunk, result_queue):
    local_error_count = 0
    local_url_errors = defaultdict(int)
    autocannon_command = resolve_command("autocannon") or "autocannon"

    def increment_error_counter(delta, url=None):
        nonlocal local_error_count
        local_error_count += delta
        if url is not None:
            local_url_errors[url] += delta

    try:
        for url in url_chunk:
            print(f"\n🌐 Warming up: {url}")
            try:
                res = requests.get(url, timeout=30)
                icon = "🟢" if res.status_code < 400 else "🔴"
                status_text = f"{res.status_code} ({res.elapsed.total_seconds():.2f}s)"
                print(f"{icon} Warmup done: {url}  [{status_text}]")
                if res.status_code >= 500:
                    print(f"❌  Server returned {res.status_code} on {url}")
                    increment_error_counter(1, url)
            except Exception as e:
                print(f"❌  Warmup failed: {url}  [{e}]")
                increment_error_counter(1, url)
                continue

            result = subprocess.run(
                [
                    autocannon_command,
                    "-c",
                    str(CONCURRENCY),
                    "-d",
                    DURATION,
                    "--renderProgressBar",
                    "false",
                    "--json",
                    url,
                ],
                capture_output=True,
                text=True,
            )

            if result.returncode != 0:
                print(f"❌  autocannon failed for {url} (exit {result.returncode})")
                if result.stderr.strip():
                    print(f"⚠️  autocannon stderr: {result.stderr.strip()}")
                increment_error_counter(1, url)
                continue

            try:
                ac = json.loads(result.stdout)
            except json.JSONDecodeError as e:
                print(f"❌  autocannon returned invalid JSON for {url}: {e}")
                if result.stderr.strip():
                    print(f"⚠️  autocannon stderr: {result.stderr.strip()}")
                increment_error_counter(1, url)
                continue

            rps = ac.get("requests", {}).get("average", 0)
            lat_mean = ac.get("latency", {}).get("mean", 0)
            errors = ac.get("errors", 0) + ac.get("timeouts", 0)
            non2xx = ac.get("non2xx", 0)
            err_str = (
                f"  ⚠️  {errors} errors / {non2xx} non-2xx" if (errors + non2xx) else ""
            )
            print(
                f"✅  Done: {url}  [{rps:.1f} req/s  latency={lat_mean:.0f}ms{err_str}]"
            )
            if errors + non2xx > 0:
                increment_error_counter(errors + non2xx, url)
    finally:
        result_queue.put(
            {
                "error_count": local_error_count,
                "url_errors": dict(local_url_errors),
            }
        )


# --- 3. MONITOR ---
def monitor_memory(pid, stop_event, log_data):
    try:
        proc = psutil.Process(pid)
        while not stop_event.is_set():
            mem_mb = proc.memory_info().rss / (1024 * 1024)
            log_data.append(mem_mb)
            time.sleep(1)
    except psutil.NoSuchProcess:
        pass


# --- HELPERS ---
def countdown(seconds, label, proc=None):
    """Single-line countdown using \r overwrite.
    If proc is given and exits early, abort and return False."""
    for remaining in range(seconds, 0, -1):
        if proc is not None and proc.poll() is not None:
            print(f"\r💀  {label} — server exited early! Aborting.")
            return False
        print(f"\r⏳  {label} — {remaining:3d}s remaining...", end="", flush=True)
        time.sleep(1)
    print(f"\r✅  {label} — done!          ")
    return True


def display_path(path):
    try:
        return os.path.relpath(path)
    except ValueError:
        return path


def node_stdout_reader(proc):
    """Read node stdout and suppress noisy request/response logs by default."""
    for raw in proc.stdout:
        line = raw.decode("utf-8", errors="replace").rstrip()
        if not line:
            continue
        stripped = line.lstrip()
        if stripped.startswith("{") or stripped.startswith("["):
            try:
                obj = json.loads(stripped)
                if isinstance(obj, dict):
                    event = obj.get("event")
                    if event in SUPPRESSED_NODE_EVENTS and not VERBOSE_NODE_LOGS:
                        continue
                print(json.dumps(obj, ensure_ascii=False))
                continue
            except json.JSONDecodeError:
                pass
        print(line)


def stop_process(proc, name="Process", timeout=10):
    if proc is None or proc.poll() is not None:
        return

    proc.terminate()
    try:
        proc.wait(timeout=timeout)
    except subprocess.TimeoutExpired:
        print(f"⚠️  {name} did not terminate gracefully; killing it.")
        proc.kill()
        proc.wait(timeout=5)


def resolve_command(command):
    candidates = [command]
    if os.name == "nt" and not os.path.splitext(command)[1]:
        candidates.extend([f"{command}.cmd", f"{command}.exe", f"{command}.bat"])

    for candidate in candidates:
        resolved = shutil.which(candidate)
        if resolved:
            return resolved

    return None


def ensure_command_available(command):
    if resolve_command(command):
        return True
    print(f"❌  Required command not found on PATH: {command}")
    return False


def ensure_python_module(module_name, package_hint=None):
    if importlib.util.find_spec(module_name) is not None:
        return True

    hint = package_hint or module_name
    print(
        f"❌  Required Python package is missing: {module_name}  (install e.g. 'pip install {hint}')"
    )
    return False


def ensure_prerequisites():
    ok = True
    for command in ("node", "npm", "autocannon"):
        ok = ensure_command_available(command) and ok
    ok = ensure_python_module("websocket", "websocket-client") and ok
    return ok


# --- 4. HEAP SNAPSHOT ---
def take_heap_snapshot(filename="snapshot.heapsnapshot"):
    try:
        websocket = importlib.import_module("websocket")
    except ModuleNotFoundError:
        print(
            "❌  Python package 'websocket-client' is required to take heap snapshots."
        )
        return False

    print(f"📸  Taking heap snapshot → {filename}...")
    try:
        res = requests.get("http://localhost:9229/json", timeout=5)
        if not res.ok:
            print(
                f"❌  Node inspector returned HTTP {res.status_code}; cannot take heap snapshot."
            )
            return False

        targets = res.json()
        if not isinstance(targets, list) or len(targets) == 0:
            print("❌  No inspector targets available; cannot take heap snapshot.")
            return False

        ws_url = targets[0]["webSocketDebuggerUrl"]
    except Exception as e:
        print(f"❌  Could not connect to Node inspector: {e}")
        return False

    chunks = []
    done_event = threading.Event()

    def on_message(ws, message):
        msg = json.loads(message)
        if msg.get("method") == "HeapProfiler.addHeapSnapshotChunk":
            chunks.append(msg["params"]["chunk"])
        elif msg.get("id") == 1:
            done_event.set()

    def on_open(ws):
        ws.send(json.dumps({"id": 0, "method": "HeapProfiler.enable"}))
        ws.send(
            json.dumps(
                {
                    "id": 1,
                    "method": "HeapProfiler.takeHeapSnapshot",
                    "params": {"reportProgress": False},
                }
            )
        )

    ws_app = websocket.WebSocketApp(ws_url, on_message=on_message, on_open=on_open)
    t = threading.Thread(target=ws_app.run_forever)
    t.daemon = True
    t.start()

    if done_event.wait(timeout=60):
        with open(filename, "w", encoding="utf-8") as f:
            f.write("".join(chunks))
        size_mb = os.path.getsize(filename) / (1024 * 1024)
        print(f"💾  Heap snapshot saved: {display_path(filename)} ({size_mb:.1f} MB)")
        success = True
    else:
        print("❌  Heap snapshot timed out.")
        success = False

    ws_app.close()
    t.join(timeout=5)
    return success


def require_snapshot_file(filename):
    if os.path.exists(filename):
        return True

    print(f"❌  Required heap snapshot is missing: {filename}")
    return False


# --- 5. HEAP SNAPSHOT COMPARISON ---
def parse_heapsnapshot(filename):
    if filename in SNAPSHOT_CACHE:
        return SNAPSHOT_CACHE[filename]

    print(f"🔍  Parsing {filename}...")
    with open(filename, "r", encoding="utf-8") as f:
        data = json.load(f)

    snapshot = data["snapshot"]
    meta = snapshot["meta"]
    nodes = data["nodes"]
    strings = data["strings"]

    node_fields = meta["node_fields"]
    node_field_count = len(node_fields)
    name_idx = node_fields.index("name")
    self_size_idx = node_fields.index("self_size")
    type_idx = node_fields.index("type")
    node_types = meta["node_types"][0]

    totals = defaultdict(lambda: {"count": 0, "self_size": 0})

    for i in range(0, len(nodes), node_field_count):
        node_type_id = nodes[i + type_idx]
        node_name_id = nodes[i + name_idx]
        self_size = nodes[i + self_size_idx]

        type_name = (
            node_types[node_type_id] if node_type_id < len(node_types) else "unknown"
        )
        node_name = strings[node_name_id] if node_name_id < len(strings) else ""
        key = f"{type_name}/{node_name}" if node_name else type_name

        totals[key]["count"] += 1
        totals[key]["self_size"] += self_size

    SNAPSHOT_CACHE[filename] = totals
    return totals


KEY_MAX_LEN = 52  # max display width for the constructor column


def fmt_key(key):
    """Collapse whitespace and truncate long keys (e.g. full HTML/JSON strings)."""
    # Collapse all whitespace (newlines, tabs, multiple spaces) to a single space
    clean = re.sub(r"\s+", " ", key).strip()
    if len(clean) > KEY_MAX_LEN:
        return clean[: KEY_MAX_LEN - 3] + "..."
    return clean


def compute_snapshot_diff(before_file, after_file):
    before = parse_heapsnapshot(before_file)
    after = parse_heapsnapshot(after_file)

    all_keys = set(before) | set(after)
    diffs = []
    for key in all_keys:
        b_size = before.get(key, {}).get("self_size", 0)
        a_size = after.get(key, {}).get("self_size", 0)
        b_count = before.get(key, {}).get("count", 0)
        a_count = after.get(key, {}).get("count", 0)
        delta_size = a_size - b_size
        delta_count = a_count - b_count
        if delta_size != 0 or delta_count != 0:
            diffs.append(
                (key, b_size, a_size, delta_size, b_count, a_count, delta_count)
            )

    diffs.sort(key=lambda x: x[3], reverse=True)

    return {
        "before": before,
        "after": after,
        "diffs": diffs,
        "growers": [d for d in diffs if d[3] > 0],
        "shrinkers": [d for d in diffs if d[3] < 0],
        "total_before": sum(v["self_size"] for v in before.values()),
        "total_after": sum(v["self_size"] for v in after.values()),
    }


def compare_snapshots(before_file, after_file, top_n=30):
    diff_data = compute_snapshot_diff(before_file, after_file)
    before = diff_data["before"]
    after = diff_data["after"]
    diffs = diff_data["diffs"]

    # Aggregate rows that collapse to the same display key
    def aggregate(rows):
        seen = {}
        for key, b_sz, a_sz, d_sz, b_cnt, a_cnt, d_cnt in rows:
            dk = fmt_key(key)
            if dk in seen:
                e = seen[dk]
                seen[dk] = (
                    dk,
                    e[1] + b_sz,
                    e[2] + a_sz,
                    e[3] + d_sz,
                    e[4] + b_cnt,
                    e[5] + a_cnt,
                    e[6] + d_cnt,
                )
            else:
                seen[dk] = (dk, b_sz, a_sz, d_sz, b_cnt, a_cnt, d_cnt)
        return list(seen.values())

    COL = KEY_MAX_LEN + 2  # label column width
    HDR = f"  {'Constructor':<{COL}} {'Before(MB)':>10} {'After(MB)':>10} {'Delta(MB)':>10} {'DeltaCount':>10}"
    SEP = "=" * len(HDR)
    DIV = "-" * len(HDR)

    print("\n" + SEP)
    print(f"HEAP SNAPSHOT COMPARISON  ({before_file}  ->  {after_file})")
    print(SEP)
    print(HDR)
    print(DIV)

    grown = aggregate([d for d in diffs if d[3] > 0])
    grown.sort(key=lambda x: x[3], reverse=True)
    grown = grown[:top_n]

    shrunk = aggregate([d for d in diffs if d[3] < 0])
    shrunk.sort(key=lambda x: x[3])
    shrunk = shrunk[:top_n]

    def print_row(label, b_sz, a_sz, d_sz, d_cnt):
        print(
            f"  {label:<{COL}} {b_sz / 1e6:>10.2f} {a_sz / 1e6:>10.2f} {d_sz / 1e6:>+10.2f} {d_cnt:>+10}"
        )

    print(f"\n  🔴 TOP {top_n} GROWERS (potential leaks):")
    for label, b_sz, a_sz, d_sz, b_cnt, a_cnt, d_cnt in grown:
        print_row(label, b_sz, a_sz, d_sz, d_cnt)

    print(f"\n  🟢 TOP {top_n} SHRINKAGES (freed memory):")
    for label, b_sz, a_sz, d_sz, b_cnt, a_cnt, d_cnt in shrunk:
        print_row(label, b_sz, a_sz, d_sz, d_cnt)

    total_before = sum(v["self_size"] for v in before.values())
    total_after = sum(v["self_size"] for v in after.values())
    print("\n" + DIV)
    print_row("TOTAL", total_before, total_after, total_after - total_before, 0)
    print(SEP)


# --- 6. LEAK SUMMARY ---
def summarize_results(before_file, after_file):
    """Parse two snapshots and print a data-driven leak analysis report."""
    diff_data = compute_snapshot_diff(before_file, after_file)
    growers = diff_data["growers"]
    shrinkers = diff_data["shrinkers"]

    total_before = diff_data["total_before"] / 1e6
    total_after = diff_data["total_after"] / 1e6
    total_delta = total_after - total_before

    SEP = "=" * 72
    DIV = "-" * 72

    # Categorise growers
    code_mb = sum(d[3] for d in growers if d[0].startswith("code")) / 1e6
    string_mb = sum(d[3] for d in growers if d[0].startswith("string")) / 1e6
    object_mb = sum(d[3] for d in growers if d[0].startswith("object")) / 1e6
    closure_mb = sum(d[3] for d in growers if d[0].startswith("closure")) / 1e6
    array_mb = sum(d[3] for d in growers if d[0].startswith("array")) / 1e6
    other_mb = max(
        total_delta - code_mb - string_mb - object_mb - closure_mb - array_mb, 0
    )

    total_freed = sum(-d[3] for d in shrinkers) / 1e6

    # Identify retained string patterns
    html_strings = [d for d in growers if d[0].startswith("string/<!DOCTYPE")]
    json_strings = [
        d for d in growers if d[0].startswith("string/{") and '"event"' in d[0]
    ]
    data_strings = [
        d for d in growers if d[0].startswith("string/{") and '"event"' not in d[0]
    ]
    css_strings = [d for d in growers if "font-face" in d[0] or ".css" in d[0]]
    module_strings = [d for d in growers if d[0].startswith("string/import ")]

    # Count new object types (not present before)
    new_types = [
        (k, 0, a_sz, d_sz, 0, a_cnt, d_cnt)
        for k, b_sz, a_sz, d_sz, b_cnt, a_cnt, d_cnt in growers
        if b_sz == 0
    ]

    print("\n" + SEP)
    print("📊  MEMORY LEAK ANALYSIS REPORT")
    print(f"    Comparing: {before_file}  →  {after_file}")
    print(SEP)

    # --- Overall verdict ---
    print(
        f"\n  📦 Heap: {total_before:.2f} MB  →  {total_after:.2f} MB  (net {total_delta:+.2f} MB)"
    )
    print(
        f"  📤 Retained: +{sum(d[3] for d in growers) / 1e6:.2f} MB across {len(growers)} constructor types"
    )
    print(
        f"  📥 Freed:    -{total_freed:.2f} MB across {len(shrinkers)} constructor types"
    )

    if total_delta < 0:
        verdict = "✅  HEAP SHRANK — memory was released after load. Excellent."
    elif total_delta < 1.0:
        verdict = "✅  STABLE — net growth < 1 MB. Likely just V8 JIT warmup."
    elif total_delta < 3.0:
        pct_code = (code_mb / total_delta * 100) if total_delta > 0 else 0
        if pct_code > 60:
            verdict = f"⚠️   MINOR GROWTH ({total_delta:+.2f} MB) — {pct_code:.0f}% is JIT code, probably warmup."
        else:
            verdict = f"⚠️   MINOR GROWTH ({total_delta:+.2f} MB) — watch across multiple iterations."
    elif total_delta < 8.0:
        verdict = f"🟠  MODERATE GROWTH ({total_delta:+.2f} MB) — likely a real leak. See findings below."
    else:
        verdict = f"🔴  SIGNIFICANT GROWTH ({total_delta:+.2f} MB) — strong memory leak indicator. Investigate below."
    print(f"\n  {verdict}")

    # --- Growth breakdown (only non-zero categories) ---
    categories = [
        (
            "🔧 JIT code",
            code_mb,
            "V8 compiles hot functions once — expected on first warmup.",
        ),
        (
            "📝 Strings",
            string_mb,
            "Retained strings: caches, TransferState, or serialised API data.",
        ),
        (
            "🏗️  Objects",
            object_mb,
            "Retained plain objects — Angular service state or scopes.",
        ),
        (
            "🔒 Closures",
            closure_mb,
            "RxJS subscriptions not unsubscribed, or captured references.",
        ),
        ("📚 Arrays", array_mb, "Growing arrays — event listeners, unbounded caches."),
        ("❓ Other", other_mb, "Mixed V8 internals."),
    ]
    has_nonzero = any(mb > 0.01 for _, mb, _ in categories)
    if has_nonzero:
        print(f"\n{DIV}")
        print("  📈 GROWTH BY CATEGORY")
        print(DIV)
        bar_scale = max((mb for _, mb, _ in categories), default=1) or 1
        for label, mb, note in categories:
            if mb < 0.01:
                continue
            pct = mb / total_delta * 100 if total_delta > 0 else 0
            bar = "█" * min(int(mb / bar_scale * 25) + 1, 25)
            print(f"    {label:<18}  {mb:>+7.2f} MB  ({pct:4.0f}%)  {bar}")
            if mb > 0.5:
                print(f"      ↳ {note}")

    # --- Top 10 growing constructors ---
    top_growers = sorted(growers, key=lambda x: x[3], reverse=True)[:10]
    if top_growers:
        print(f"\n{DIV}")
        print("  🔝 TOP 10 GROWING CONSTRUCTORS")
        print(DIV)
        print(f"    {'Constructor':<46} {'Delta MB':>9} {'Delta #':>9} {'After MB':>9}")
        for key, b_sz, a_sz, d_sz, b_cnt, a_cnt, d_cnt in top_growers:
            label = fmt_key(key)
            new_flag = "  ★ NEW" if b_sz == 0 else ""
            print(
                f"    {label:<46} {d_sz / 1e6:>+9.3f} {d_cnt:>+9} {a_sz / 1e6:>9.3f}{new_flag}"
            )

    # --- Specific findings (data-driven) ---
    findings = []

    if html_strings:
        total_html_mb = sum(d[3] for d in html_strings) / 1e6
        max_html = max(html_strings, key=lambda x: x[3])
        findings.append(
            (
                "🔴 Retained rendered HTML strings",
                f"{len(html_strings)} full SSR HTML page(s) in memory (+{total_html_mb:.2f} MB total, "
                f"largest: +{max_html[3] / 1e6:.2f} MB)",
                [
                    "Angular's ApplicationRef or PlatformRef is not being destroyed between requests.",
                    "Ensure server.ts uses createNodeRequestHandler — it isolates each request.",
                    "Check for singleton services that cache rendered HTML or TransferState.",
                ],
            )
        )

    if data_strings:
        total_data_mb = sum(d[3] for d in data_strings) / 1e6
        top3 = sorted(data_strings, key=lambda x: x[3], reverse=True)[:3]
        sample = ", ".join(fmt_key(d[0])[:40] for d in top3)
        findings.append(
            (
                "🔴 Retained large JSON API response strings",
                f"{len(data_strings)} cached JSON string(s) (+{total_data_mb:.2f} MB). Largest: {sample}",
                [
                    "An HttpClient cache stores API responses without eviction.",
                    "Replace shareReplay() with shareReplay({ bufferSize: 1, refCount: true }).",
                    "Check providedIn: 'root' services that store per-request state.",
                    "Verify TransferState is scoped per-request via SERVER_REQUEST_CONTEXT.",
                ],
            )
        )

    if css_strings:
        total_css_mb = sum(d[3] for d in css_strings) / 1e6
        findings.append(
            (
                "⚠️  Retained CSS/font strings",
                f"{len(css_strings)} CSS string(s) (+{total_css_mb:.2f} MB)",
                [
                    "Angular's style injection may cache styles per-request in a shared store.",
                    "Check APP_INITIALIZER or server-side style providers for singleton caches.",
                ],
            )
        )

    if json_strings:
        total_json_mb = sum(d[3] for d in json_strings) / 1e6
        findings.append(
            (
                "⚠️  Log/event JSON strings retained",
                f"{len(json_strings)} log entry string(s) in heap (+{total_json_mb:.2f} MB)",
                [
                    "The logger keeps references to logged objects.",
                ],
            )
        )

    if module_strings:
        total_mod_mb = sum(d[3] for d in module_strings) / 1e6
        findings.append(
            (
                "ℹ️  Module source strings retained",
                f"{len(module_strings)} module string(s) (+{total_mod_mb:.2f} MB)",
                [
                    "Node's module registry retains sources — usually benign.",
                    "Only concerning if count grows unboundedly across test iterations.",
                ],
            )
        )

    if new_types:
        new_total_mb = sum(d[3] for d in new_types) / 1e6
        new_top = sorted(new_types, key=lambda x: x[3], reverse=True)[:5]
        new_names = ", ".join(fmt_key(d[0])[:35] for d in new_top)
        findings.append(
            (
                f"⚠️  {len(new_types)} constructor type(s) appeared that didn't exist in baseline",
                f"+{new_total_mb:.2f} MB in newly-seen types. Top: {new_names}",
                [
                    "These types were not loaded at baseline time — could be lazy modules.",
                ],
            )
        )

    if (
        code_mb > 0
        and total_delta > 0
        and code_mb / total_delta > 0.55
        and total_delta < 6.0
    ):
        findings.append(
            (
                "✅  Growth dominated by JIT compilation",
                f"JIT code is {code_mb / total_delta * 100:.0f}% of total growth ({code_mb:.2f} MB). "
                "This is expected on first load.",
                [
                    "Treat strings, objects, arrays, or closures as more suspicious than code-heavy growth.",
                ],
            )
        )

    if string_mb > 1.0 and string_mb > code_mb:
        findings.append(
            (
                "🔴  Strings are the dominant leak vector",
                f"+{string_mb:.2f} MB in retained strings ({string_mb / total_delta * 100:.0f}% of total growth)",
                [
                    "Serialised API responses, HTML, or CSS are being cached across requests.",
                    "Check HttpTransferCacheOptions — ensure heavy API routes are filtered out.",
                    "Search for in-memory Map/Object caches in Angular services.",
                ],
            )
        )

    if closure_mb > 0.5:
        findings.append(
            (
                "⚠️  Closures growing",
                f"+{closure_mb:.2f} MB in retained closures",
                [
                    "Search for RxJS shareReplay() without { refCount: true }.",
                    "Verify operators like combineLatest/switchMap complete or are unsubscribed.",
                    "Check for event listeners added in ngOnInit without removeEventListener.",
                ],
            )
        )

    if findings:
        print(f"\n{DIV}")
        print("  🔍 FINDINGS & RECOMMENDED FIXES")
        print(DIV)
        for i, (title, summary_text, actions) in enumerate(findings, 1):
            print(f"\n  [{i}] {title}")
            print(f"      {summary_text}")
            if actions:
                print("      What to check:")
                for action in actions:
                    print(f"        • {action}")
    else:
        print(f"\n{DIV}")
        print("  ✅  No significant leak patterns detected in this comparison.")

    print("\n" + SEP + "\n")


def write_summary_json(
    filename,
    phase_files,
    rss_summary=None,
    error_count=0,
    url_errors=None,
):
    report = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "phase_deltas": {},
        "rss": rss_summary or {},
        "errors": {
            "total": error_count,
            "per_url": dict(url_errors or {}),
        },
    }

    for before_file, after_file in phase_files:
        if not (
            require_snapshot_file(before_file) and require_snapshot_file(after_file)
        ):
            continue
        diff_data = compute_snapshot_diff(before_file, after_file)
        key = f"{before_file}->{after_file}"
        report["phase_deltas"][key] = {
            "total_before_mb": round(diff_data["total_before"] / 1e6, 3),
            "total_after_mb": round(diff_data["total_after"] / 1e6, 3),
            "delta_mb": round(
                (diff_data["total_after"] - diff_data["total_before"]) / 1e6, 3
            ),
            "grower_count": len(diff_data["growers"]),
            "shrinker_count": len(diff_data["shrinkers"]),
            "top_growers": [
                {
                    "constructor": fmt_key(item[0]),
                    "delta_mb": round(item[3] / 1e6, 3),
                    "delta_count": item[6],
                }
                for item in diff_data["growers"][:10]
            ],
        }

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"📄  Machine-readable summary saved: {display_path(filename)}")


# --- 7. MAIN ---
if __name__ == "__main__":
    if not ensure_prerequisites():
        sys.exit(1)

    os.makedirs(HEAP_SNAPSHOTS_DIR, exist_ok=True)

    node_command = resolve_command("node") or "node"
    npm_command = resolve_command("npm") or "npm"

    # NG_APP_* vars are baked in at BUILD TIME via import.meta.env, not read at
    # runtime — so we must rebuild the app with the desired backend URL.
    # The local-test Angular configuration bakes http://localhost:8080 into the
    # bundle via esbuild define, so no .env patching is needed.
    LOCAL_BACKEND = "http://localhost:8080"

    dist_server_dir = os.path.join("dist", "sc-www", "server")
    dist_static_dir = os.path.join("dist", "sc-www", "server", "static")
    skip_build = False

    if os.path.isdir(dist_server_dir):
        print(
            "\n📦 An existing build was detected (already built with local backend URL):"
        )
        print(f"    {dist_server_dir}")
        print(f"    {dist_static_dir}")
        print("\n    (s) ⏭️  Skip build — no source changes, use existing dist as-is")
        print("    (b) 🔨  Build     — source code has changed, rebuild required")
        while True:
            choice = input("\n👉 Enter 's' to skip or 'b' to build: ").strip().lower()
            if choice in ("s", "b"):
                break
            print("❌  Invalid choice, please enter 's' or 'b'.")
        skip_build = choice == "s"

    if skip_build:
        print("⏭️   Skipping build. Using existing dist.")
    else:
        print(
            "🔨  Building Angular SSR app with local backend URLs (local-test config)..."
        )
        result = subprocess.run([npm_command, "run", "build:ssr:sc-www:local"])
        if result.returncode != 0:
            print("❌  Build failed. Aborting.")
            sys.exit(1)

    print("🔍  Verifying backend URL is baked into server chunks...")
    expected_url = LOCAL_BACKEND
    server_dir = os.path.join("dist", "sc-www", "server")
    matched_file = None
    total_count = 0
    for fname in os.listdir(server_dir):
        if not fname.endswith(".mjs"):
            continue
        fpath = os.path.join(server_dir, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
        n = content.count(expected_url)
        if n > 0:
            print(f"✅  Found '{expected_url}' {n} time(s) in {fname}.")
            matched_file = fname
            total_count += n
    if not matched_file:
        print(
            f"❌  VERIFICATION FAILED: '{expected_url}' not found in any server chunk."
        )
        print("❌  The build may have used a cached .env value. Aborting.")
        sys.exit(1)
    print(
        f"✅  Verified: '{expected_url}' found {total_count} time(s) across server chunks."
    )

    print("🚀  Starting Angular SSR Server...")

    # Kill any leftover processes from a previous run holding our ports
    for port in (3000, 9229):
        for conn in psutil.net_connections(kind="tcp"):
            if conn.laddr.port == port and conn.pid:
                try:
                    psutil.Process(conn.pid).kill()
                    print(f"🔪  Killed stale process {conn.pid} holding port {port}.")
                except psutil.NoSuchProcess:
                    pass
    time.sleep(1)  # give the OS a moment to release the ports

    runtime_env = {
        **os.environ,
        "NODE_ENV": "production",
        "PORT": "3000",
    }

    # Start the process with these variables — pipe stdout for JSON formatting
    node_proc = subprocess.Popen(
        [node_command, *SERVER_COMMAND[1:]], env=runtime_env, stdout=subprocess.PIPE
    )
    reader_thread = threading.Thread(
        target=node_stdout_reader, args=(node_proc,), daemon=True
    )
    reader_thread.start()

    # Wait for Boot
    time.sleep(5)
    if node_proc.poll() is not None:
        print("💀  Server exited during startup. Aborting.")
        sys.exit(1)

    if not countdown(
        20, "Waiting for server to stabilize before baseline snapshot", node_proc
    ):
        stop_process(node_proc, name="SSR server")
        sys.exit(1)
    if not take_heap_snapshot(SNAPSHOT_FILES["before"]):
        stop_process(node_proc, name="SSR server")
        sys.exit(1)

    urls = get_local_urls()
    if not urls:
        stop_process(node_proc, name="SSR server")
        sys.exit(1)

    chunks = [urls[i::NUM_WORKERS] for i in range(NUM_WORKERS)]

    manager = multiprocessing.Manager()
    memory_logs = manager.list()
    error_counter = 0
    url_errors = defaultdict(int)
    result_queue = multiprocessing.Queue()
    stop_event = multiprocessing.Event()

    monitor = multiprocessing.Process(
        target=monitor_memory, args=(node_proc.pid, stop_event, memory_logs)
    )
    monitor.start()

    def run_phase(phase_num, snapshot_name, label):
        """Run one full autocannon phase: load → cooldown → snapshot."""
        print(
            f"\n⚡  Phase {phase_num}/3: {label} — {NUM_WORKERS} workers (concurrency={CONCURRENCY})..."
        )
        workers = []
        for i in range(NUM_WORKERS):
            p = multiprocessing.Process(target=run_load, args=(chunks[i], result_queue))
            workers.append(p)
            p.start()
        for p in workers:
            p.join()

        phase_error_count = 0
        phase_url_errors = defaultdict(int)
        for _ in workers:
            worker_result = result_queue.get()
            phase_error_count += worker_result["error_count"]
            for url, count in worker_result["url_errors"].items():
                phase_url_errors[url] += count

        if not countdown(
            20,
            f"Phase {phase_num} cooldown — letting GC settle before snapshot",
            node_proc,
        ):
            stop_process(node_proc, name="SSR server")
            sys.exit(1)
        if not take_heap_snapshot(snapshot_name):
            stop_process(node_proc, name="SSR server")
            sys.exit(1)

        return phase_error_count, phase_url_errors

    for phase_num, snapshot_name, label in [
        (1, SNAPSHOT_FILES["after_1"], "warmup run"),
        (2, SNAPSHOT_FILES["after_2"], "first warm run"),
        (3, SNAPSHOT_FILES["after_3"], "authoritative run"),
    ]:
        phase_error_count, phase_url_errors = run_phase(phase_num, snapshot_name, label)
        error_counter += phase_error_count
        for url, count in phase_url_errors.items():
            url_errors[url] += count

    stop_event.set()
    monitor.join()

    # --- COMPARISONS ---
    print("\n" + "=" * 80)
    print(
        "📊  COMPARISON 1/3  (before → after_1)  — first load, includes JIT warmup noise"
    )
    print("=" * 80)
    if not require_snapshot_file(SNAPSHOT_FILES["before"]):
        stop_process(node_proc, name="SSR server")
        sys.exit(1)
    if not require_snapshot_file(SNAPSHOT_FILES["after_1"]):
        stop_process(node_proc, name="SSR server")
        sys.exit(1)
    compare_snapshots(SNAPSHOT_FILES["before"], SNAPSHOT_FILES["after_1"])

    print("\n" + "=" * 80)
    print("📊  COMPARISON 2/3  (after_1 → after_2)  — server warm, first clean signal")
    print("=" * 80)
    if not require_snapshot_file(SNAPSHOT_FILES["after_2"]):
        stop_process(node_proc, name="SSR server")
        sys.exit(1)
    compare_snapshots(SNAPSHOT_FILES["after_1"], SNAPSHOT_FILES["after_2"])

    print("\n" + "=" * 80)
    print("🔬  COMPARISON 3/3  (after_2 → after_3)  — AUTHORITATIVE (steady-state)")
    print("   Constructors growing here with +N objects are DEFINITIVE LEAKS.")
    print("=" * 80)
    if os.path.exists(SNAPSHOT_FILES["after_3"]):
        compare_snapshots(SNAPSHOT_FILES["after_2"], SNAPSHOT_FILES["after_3"])
        # --- SUMMARY ---
        summarize_results(SNAPSHOT_FILES["after_2"], SNAPSHOT_FILES["after_3"])
    else:
        print(
            "⚠️  snapshot_after_3 missing (heap snapshot timed out) — skipping comparison 3/3 and summary."
        )

    # --- FINAL BANNER ---
    snapshots = [f for f in SNAPSHOT_FILES.values() if os.path.exists(f)]
    snapshot_names = " / ".join(display_path(path) for path in snapshots)
    print("\n" + "!" * 50)
    print(f"📄  Snapshots saved: {snapshot_names}")
    print(
        "🔬  Load them in Chrome DevTools (chrome://inspect) → Memory tab for further inspection."
    )
    print("!" * 50)

    stop_process(node_proc, name="SSR server")
    print("🛑  Server terminated. Script exiting.")

    # --- REPORTING ---
    # ANSI colour helpers
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    RESET = "\033[0m"

    def col(text, color):
        return f"{color}{text}{RESET}"

    if memory_logs:
        initial = memory_logs[0]
        peak = max(memory_logs)
        # "settled" = average of last 10 samples (taken during phase 3 cooldown)
        tail = list(memory_logs[-10:])
        settled = sum(tail) / len(tail)

        print("\n" + "=" * 48)
        print("FINAL REPORT")
        print("=" * 48)

        print("\nRSS Memory (Resident Set Size):")
        print(f"  Initial : {initial:.1f} MB")
        print(
            "    ↳ Baseline before any requests — V8 heap + loaded modules + native libs."
        )
        print(f"  Peak    : {peak:.1f} MB")
        print("    ↳ Highest point during load — includes active response buffers,")
        print(
            "      concurrent socket data, and in-flight SSR allocations. Expected to spike."
        )
        print(f"  Settled : {settled:.1f} MB")
        print("    ↳ Average of last 10 samples after phase 3 cooldown.")

        err_val = error_counter
        err_color = GREEN if err_val == 0 else RED
        print(f"\nServer Errors Detected: {col(str(err_val), err_color)}")
        if err_val > 0 and url_errors:
            print("  Per-URL breakdown:")
            for u, cnt in sorted(url_errors.items(), key=lambda x: -x[1]):
                print(f"    {col(str(cnt), RED):>6}  {u}")

        heap_verdict = None
        try:
            snap_b = parse_heapsnapshot(SNAPSHOT_FILES["before"])
            snap_a1 = parse_heapsnapshot(SNAPSHOT_FILES["after_1"])
            snap_a2 = parse_heapsnapshot(SNAPSHOT_FILES["after_2"])
            snap_a3 = parse_heapsnapshot(SNAPSHOT_FILES["after_3"])

            mb_before = sum(v["self_size"] for v in snap_b.values()) / 1e6
            mb_a1 = sum(v["self_size"] for v in snap_a1.values()) / 1e6
            mb_a2 = sum(v["self_size"] for v in snap_a2.values()) / 1e6
            mb_a3 = sum(v["self_size"] for v in snap_a3.values()) / 1e6

            warmup_delta = mb_a1 - mb_before
            warm1_delta = mb_a2 - mb_a1
            auth_delta = mb_a3 - mb_a2

            warmup_str = col(
                f"{warmup_delta:+.1f} MB", YELLOW if warmup_delta < 10 else RED
            )
            print(
                f"\nHeap phase 1  (before  → after_1) : {mb_before:.1f} MB → {mb_a1:.1f} MB  ({warmup_str})  [JIT + first-load noise]"
            )

            c1 = GREEN if warm1_delta < 1.0 else (YELLOW if warm1_delta < 5.0 else RED)
            print(
                f"Heap phase 2  (after_1 → after_2) : {mb_a1:.1f} MB → {mb_a2:.1f} MB  ({col(f'{warm1_delta:+.1f} MB', c1)})  [first warm signal]"
            )

            c2 = GREEN if auth_delta < 1.0 else (YELLOW if auth_delta < 5.0 else RED)
            print(
                f"Heap phase 3  (after_2 → after_3) : {mb_a2:.1f} MB → {mb_a3:.1f} MB  ({col(f'{auth_delta:+.1f} MB', c2)})  [authoritative]"
            )

            if auth_delta < 1.0:
                heap_verdict = col("✅ STABLE — heap growth negligible (<1 MB).", GREEN)
            elif auth_delta < 5.0:
                heap_verdict = col(
                    f"⚠️  MINOR GROWTH — {auth_delta:+.1f} MB in authoritative run. Monitor across more iterations.",
                    YELLOW,
                )
            else:
                heap_verdict = col(
                    f"🔴 LEAK LIKELY — {auth_delta:+.1f} MB heap growth in steady state. See comparison 3/3 above.",
                    RED,
                )
        except Exception as e:
            print(f"(Could not parse snapshots for heap verdict: {e})")

        print()
        if heap_verdict:
            print(f"STATUS: {heap_verdict}")
            if error_counter > 0:
                print(
                    f"        {col(f'⚠️  Note: {error_counter} server errors during load — see per-URL breakdown above.', YELLOW)}"
                )
        elif settled > initial * 1.15:
            print(
                f"STATUS: {col(f'⚠️  RSS grew {settled - initial:.1f} MB after settling — review snapshot comparison above.', YELLOW)}"
            )
        else:
            print(f"STATUS: {col('✅ STABLE — RSS recovered after load.', GREEN)}")

        write_summary_json(
            SUMMARY_FILE,
            [
                (SNAPSHOT_FILES["before"], SNAPSHOT_FILES["after_1"]),
                (SNAPSHOT_FILES["after_1"], SNAPSHOT_FILES["after_2"]),
                (SNAPSHOT_FILES["after_2"], SNAPSHOT_FILES["after_3"]),
            ],
            rss_summary={
                "initial_mb": round(initial, 3),
                "peak_mb": round(peak, 3),
                "settled_mb": round(settled, 3),
            },
            error_count=error_counter,
            url_errors=url_errors,
        )
        print("=" * 48)
