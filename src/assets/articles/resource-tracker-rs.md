---
# ~50 chars
title: "Resource Tracker in Rust: Single-Binary Monitoring"
date: 2026-04-23
# ~100 character
teaser: "We ported the Resource Tracker to Rust: a ~2 MB binary that tracks CPU, memory, GPU usage, and more."
# 320x220
# https://carbon.now.sh/?bg=rgba%286%2C38%2C58%2C1%29&t=theme%3A0clxiw369o4s&wt=none&l=application%2Fx-sh&width=680&ds=false&dsyoff=20px&dsblur=68px&wc=true&wa=true&pv=31px&ph=28px&ln=false&fl=1&fm=Hack&fs=18px&lh=161%25&si=false&es=1x&wm=false&code=%2524%2520resource-tracker%2520python%2520train-GBM.py%25202%253E%25261%2520%255C%250A%2520%2520%257C%2520jq%2520-c%2520%27.gpu%2520%257C%2520%257Butilization_pct%252C%2520vram_used_bytes%257D%27%2520%250A%257B%2522utilization_pct%2522%253A0.87%252C%2520%2522utilization_pct%2522%253A%252018726%257D%250A%257B%2522utilization_pct%2522%253A0.83%252C%2520%2522utilization_pct%2522%253A%252019143%257D%250A%257B%2522utilization_pct%2522%253A0.84%252C%2520%2522utilization_pct%2522%253A%252021297%257D%250A%257B%2522utilization_pct%2522%253A0.85%252C%2520%2522utilization_pct%2522%253A%252021542%257D%250A%257B%2522utilization_pct%2522%253A0.86%252C%2520%2522utilization_pct%2522%253A%252021483%257D%250A%257B%2522utilization_pct%2522%253A0.82%252C%2520%2522utilization_pct%2522%253A%252021484%257D%250A%257B%2522utilization_pct%2522%253A0.23%252C%2520%2522utilization_pct%2522%253A%25208963%257D%250A%257B%2522utilization_pct%2522%253A0.05%252C%2520%2522utilization_pct%2522%253A%25201429%257D%250A%257B%2522utilization_pct%2522%253A0.01%252C%2520%2522utilization_pct%2522%253A%25201429%257D
image: /assets/images/blog/thumbnails/resource-tracker-rs.webp
image_alt: Terminal showing the resource-tracker binary wrapping a Python training script and emitting JSON metrics per second.
author: Gergely Daroczi
tags: [resource-tracker, open-source]
---

When we released the
[Spare Cores Resource Tracker as a Python package](/article/metaflow-resource-tracker)
last year, the feedback was great -- but two things kept nagging at us.

The first was the CLI wrapper story. The Python tracker works well when you are
already inside a Python process, but wrapping an arbitrary binary -- say a compiled
C++ simulation or a Rust ML model training application -- means spawning Python just to babysit
another process. That felt upside-down.

The second was GPU monitoring. The Python implementation collected GPU metrics by
periodically calling out to `nvidia-smi pmon` via subprocess. At a one-second
sampling interval that overhead is tolerable; push it to sub-second and the
subprocess spawning starts showing up in the numbers you are trying to measure.
We wanted to talk to NVML directly, which is not something you do comfortably from
Python without pulling in heavier dependencies.

So we built
<a href="https://github.com/SpareCores/resource-tracker-rs" target="_blank" rel="noopener">`resource-tracker-rs`</a>,
a Rust port that compiles down to a single ~2 MB binary with no runtime
dependencies beyond a reasonably recent (e.g. no more than 10 years old) glibc.
Drop the binary onto any Linux machine, point it at your process, and you're done.

## Why Rust?

Honestly, Go would have been the more obvious choice for a "just ship a binary"
tool, but Go binaries carry a non-trivial runtime and tend to land in the 10-20 MB
range for something like this -- we wanted to stay under 2 MB. Rust gave us that,
plus near-zero overhead polling (important when you're measuring a process, not
just watching it), and the ability to call into NVML and the AMD GPU libraries
directly.

The result is almost feature-equivalent to the Python version, with CPU, memory, disk, and
network metrics at both the system level and the per-process-tree level -- with a
couple of additions we could not easily back-port to Python without pulling in
more dependencies.

## Getting Started

Precompiled binaries are published as
<a href="https://github.com/SpareCores/resource-tracker-rs/releases" target="_blank" rel="noopener">GitHub Releases</a>
for both `x86_64` and `arm64`. Download, mark executable, and run:

```sh
# auto-guess target architecture
ARCH="$(uname -m | sed -e 's/x86_64/amd64/' -e 's/aarch64/arm64/')"

# find most recent release
URL="$(curl -fsSL https://api.github.com/repos/SpareCores/resource-tracker-rs/releases/latest | sed -n "s#.*\"browser_download_url\": \"\\([^\"]*resource-tracker-[^\"]*-linux-${ARCH}.tar.gz\\)\".*#\\1#p" | sed -n '1p')"

# download and extract
curl -fsSL "$URL" | tar -xvzf - resource-tracker

# run
./resource-tracker --help
```

No Python, no pip, no virtual environment. The `glibc` (minimum 2.17) requirement means it
works out of the box on any modern distro -- Debian, Ubuntu, RHEL, Amazon Linux,
and so on.

We also experimented with statically-linked builds using `musl` instead of
`glibc` for better support for truly minimal environments like Alpine, but GPU
monitoring requires dynamic linking to the NVIDIA and AMD GPU libraries, which
is not supported by `musl`.

## CLI Usage

The most common pattern is the shell-wrapper mode: pass your command (preferably
explicitly after `--` to avoid shell expansion) and the tracker monitors the
child process tree from start to finish, by default using a one-second interval,
then exits with the same exit code as the child process so it is transparent to
CI and job schedulers:

```sh
./resource-tracker python train.py --epochs 50
```

Each second a JSON line is emitted to stderr (or to a file with `--output`):

```json
{
  "cpu": {
    "per_core_pct": [7.65, 0.0, 2.53, 0.0, 5.12, 1.0, 6.06, 0.0],
    "process_child_count": null,
    "process_cores_used": null,
    "process_count": 628,
    "process_disk_read_bytes": null,
    "process_disk_write_bytes": null,
    "process_gpu_usage": 0.1,
    "process_gpu_utilized": 1,
    "process_gpu_vram_mib": 811.69,
    "process_rss_mib": null,
    "process_stime_secs": null,
    "process_utime_secs": null,
    "stime_secs": 0.39,
    "utilization_pct": 0.43,
    "utime_secs": 0.47
  },
  "disk": [{...}, {...}, ...],
  "network": [{...}, {...}, ...],
  "gpu": [{...}, {...}, ...],
  "memory": {
    "active_mib": 25233,
    "available_mib": 72990,
    "buffers_mib": 4,
    "cached_mib": 24943,
    "free_mib": 51127,
    "inactive_mib": 12526,
    "swap_total_mib": 0,
    "swap_used_mib": 0,
    "swap_used_pct": 0.0,
    "total_mib": 96313,
    "used_mib": 20239,
    "used_pct": 21.01
  }
}
```

If you prefer tracking an already-running process, pass its PID with `--pid`.
The tracker will walk the full `/proc` tree and attribute CPU usage from the
root PID down through all its descendants, which means multi-process workloads
like PyTorch data-loader workers or Spark executors are attributed correctly
under a single root.

For recurring jobs a small TOML config file next to the job definition is
cleaner than repeating flags every time:

```toml
[job]
name = "nightly-feature-pipeline"

[tracker]
interval_secs = 5
```

Alternatively, all CLI flags can be set via environment variables as well.

## Streaming to Sentinel

For teams running many batch jobs across multiple machines, tailing a local
JSONL file per run does not scale well. The tracker has optional streaming built
in: set the `SENTINEL_API_TOKEN` environment variable and every run is
registered with the Spare Cores Sentinel service. Metrics are batched,
gzip-compressed, and uploaded to S3 in the background every 60 seconds
(configurable via `TRACKER_UPLOAD_INTERVAL`). On exit, the final batch is
flushed inline so nothing is lost.

```sh
export SENTINEL_API_TOKEN="your-token-here"
export TRACKER_JOB_NAME="gpu-benchmark"
./resource-tracker python train.py
```

From there, Sentinel aggregates the runs centrally and surfaces
right-sizing recommendations -- the same idea as the Python tracker's
`recommend_server()` call, but for the whole team and without any
per-job instrumentation code.

## Next Steps

The
<a href="https://sparecores.github.io/resource-tracker-rs/Usage.html" target="_blank" rel="noopener">full Usage Guide</a>
covers all CLI flags, the TOML config reference, output format details, and
more shell-wrapper examples. The
<a href="https://github.com/SpareCores/resource-tracker-rs" target="_blank" rel="noopener">source code is on GitHub</a>,
as usual, under MPL-2.0.

Thanks to <a href="https://grenetasolutions.com/" target="_blank" rel="noopener">Greneta Solutions</a>
and Avram Aelony, who actually worked on the Rust implementation, for their contributions to the project! 🙇

Stay tuned for more details on the Sentinel service! It is currently in closed
beta -- if you want early access, leave a note in the comments or reach out
directly.
