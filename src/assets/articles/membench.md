---
# ~50 chars
title: "Modern Memory Bandwidth Benchmarks"
date: 2026-01-26
# ~100 character
teaser: "We open-sourced sc-membench, a modern and flexible memory bandwidth and latency benchmarking tool."
# 320x220
image: /assets/images/blog/thumbnails/membench.webp
image_alt: Screenshot of some sc-membench results on the sparecores.com website showing memory bandwidth for read, write, and copy operations along with the CPU cache hierarchy level markers.
author: Gergely Daroczi
tags: [benchmark, performance, open-source]
---

We have been running
<a href="https://lmbench.sourceforge.net/man/bw_mem.8.html" target="_blank" rel="noopener">`bw_mem`</a>
from LMbench to measure memory bandwidth across 3,000+ cloud server types as part of our ongoing
benchmarking work (described in the
[Unlocking Cloud Compute Performance](/article/cloud-compute-performance-benchmarks) article).
For the most part it held up well, but the results were not always consistent with
the detected L1/L2/L3 cache sizes, and some of the observed numbers were just hard to trust.

Debugging took a while. Part of the issue was cache detection: we heavily relied on `lscpu` output,
which is sometimes wrong or incomplete. We are now investigating `lstopo` as an alternative, which provides more accurate cache information -- although the hypervisor might be still reporting incorrect cache sizes.

But some of the inconsistencies traced back to `bw_mem` itself with no support
for huge pages and unexpected performance slowdowns on servers with 100+ vCPUs.

## Introducing `sc-membench`

At some point it became clear that debugging workarounds around an upstream tool we cannot
change was not the best use of time, so we wrote our own. Today we are open-sourcing
<a href="https://github.com/spareCores/sc-membench" target="_blank" rel="noopener">`sc-membench`</a>.

A quick note on how we built it: we used LLMs for both coding and documentation, but we
carefully validated the results against existing tools and cross-checked against their known
shortcomings. The results look promising so far, and we got some encouraging early feedback
from our direct network. Now it is time to ask for scrutiny from the wider community.

- **Comprehensive workload coverage**: measures read, write, copy bandwidth, and memory latency
  via pointer chasing across the full cache hierarchy from L1 to DRAM.
- **Multi-platform and portable**: tested on `x86` and `arm64` machines across multiple cloud vendors,
  also confirmed to build and run on BSD.
- **Easy to run via Docker**: a pre-built image at `ghcr.io/sparecores/membench:main` means
  zero setup on any Linux host.
- **NUMA-aware thread placement**: OpenMP's `proc_bind(spread)` distributes threads evenly across
  NUMA nodes, and each thread allocates memory locally via `numa_alloc_onnode()`.
- **Adaptive buffer sizes**: cache hierarchy sizes are detected at runtime (via `hwloc` or
  `sysfs`/`sysctl` fallback) and test sizes are derived from actual L1/L2/L3 values, so the
  benchmark always exercises the right boundaries.
- **Automatic huge page handling**: the `-H` flag uses Transparent Huge Pages via
  `madvise(MADV_HUGEPAGE)` for large buffers, no root access or pre-allocation needed. On
  AMD EPYC at the 32 MB L3 boundary we measured a 63% latency improvement with THP enabled.

If you are here for the quick start, feel free to jump ahead to [Running sc-membench](#running-sc-membench).

## Why `bw_mem` Was Not Enough

Honestly, `bw_mem` has been a solid workhorse. It was written in 1996 and it still does
what it says. But running it at scale on modern cloud hardware exposed a few friction points:

- **Strided reads.** The `rd` mode reads "every fourth word", which means only 25% of the
  buffer is actually accessed. The reported bandwidth looks \~4x higher than actual throughput
  unless you switch to `frd` -- we actually missed this in our first runs.

- **Process-based parallelism.** `bw_mem` forks separate processes per thread. This works fine
  for small CPU counts, but at 96 or 192 vCPUs we observed unexpected slowdowns that we could
  not easily reproduce or explain. `sc-membench` uses OpenMP threads instead, which avoids
  process-creation overhead and gives us direct control over thread placement.

- **No huge page support.** `bw_mem` uses `valloc`, so large buffer latency tests pay TLB
  overhead on top of actual memory latency. On a 128 MB buffer with 4 KB pages, you need 32,768
  page table entries -- far beyond the TLB capacity on most CPUs. `sc-membench` handles this
  transparently with `-H`.

- **No statistical reporting for latency.** `bw_mem` reports a single latency number. `sc-membench`
  collects 7-21 independent samples per measurement, reports the median (robust to outliers),
  and continues sampling until the coefficient of variation drops below 5%.

The full list of differences between `sc-membench` and `bw_mem` can be found in the
<a href="https://github.com/spareCores/sc-membench#comparison-with-lmbench" target="_blank" rel="noopener">"Comparison to bw_mem" section of the README</a>.

## What sc-membench Measures

`sc-membench` tests four operation types across a range of buffer sizes that span the
entire cache hierarchy:

- **read**: reads all 64-bit words using XOR accumulation (8 independent accumulators to hint
  at instruction-level parallelism)
- **write**: writes a pattern to all 64-bit words
- **copy**: copies from a source buffer to a destination buffer, reports `buffer_size / time`
  to stay comparable with `bw_mem`
- **latency**: pointer chasing through a linked list in randomized traversal order, pinned to
  CPU 0 with NUMA-local memory; measures true random-access latency without hardware prefetcher
  interference

Buffer sizes are derived from detected cache sizes and cover L1/2, L1, 2xL1, L2/2, L2, 2xL2,
L3/4, L3/2, L3, 2xL3, and 4xL3 per thread. The latency test goes up to 2 GB (or 25% of RAM)
to handle processors with unusually large L3 caches like AMD EPYC 9754 with its 1.1 GB 3D V-Cache.

Output is CSV by default (machine-readable, easy to ingest), or a formatted table with a
composite benchmark score via `-R`:

```sh
Size       Op          Bandwidth      Latency  Threads
----       --          ---------      -------  -------
32 KB      read         2.6 TB/s            -       32
32 KB      write        1.6 TB/s            -       32
32 KB      copy       464.4 GB/s            -       32
32 KB      latency             -       0.9 ns        1
128 KB     read         1.7 TB/s            -       32
128 KB     write      691.7 GB/s            -       32
128 KB     copy       495.5 GB/s            -       32
128 KB     latency             -       2.4 ns        1
...

================================================================================
                           BENCHMARK SUMMARY
================================================================================

BANDWIDTH (MB/s):
  Operation          Peak Weighted Avg
  ---------          ---- ------------
  Read            2612561      1680432
  Write           1605601       850445
  Copy             495476       372027

LATENCY:
  Best latency: 97.2 ns (RAM) at 131072 KB buffer

--------------------------------------------------------------------------------
BENCHMARK SCORE (higher is better):

  Bandwidth Score:      1571.2  (avg peak bandwidth in GB/s)
  Latency Score:          10.3  (1000 / latency_ns)

  >> COMBINED SCORE:      4024  (sqrt(bw_score × latency_score) × 100)
--------------------------------------------------------------------------------
```

The combined score is a geometric mean of bandwidth and latency scores, so neither dimension
dominates. Note that scores are only comparable across runs that used the same default settings
(no `-t`, `-p`, or `-s` flags), and the tool will warn you if they might not be.

## Running `sc-membench`

The fastest path is Docker:

```sh
# basic run
docker run --rm ghcr.io/sparecores/membench:main

# recommended: privileged mode for accurate CPU pinning and huge pages
docker run --rm --privileged ghcr.io/sparecores/membench:main -H -v

# save CSV output to file
docker run --rm --privileged ghcr.io/sparecores/membench:main -H > results.csv
```

To build from source, you need a C11 compiler with OpenMP and optionally `libhwloc-dev`,
`libnuma-dev`, and `libhugetlbfs-dev` for full feature support:

```sh
# Debian/Ubuntu
apt-get install build-essential libhwloc-dev libnuma-dev libhugetlbfs-dev

# build with all features (recommended for servers)
make full
./membench-full -H -v
```

For other Linux distributions and operating systems, you can find the build instructions in the
[README](https://github.com/spareCores/sc-membench#installing-dependencies).

`sc-membench` is also packaged in some distributions. Check
<a href="https://repology.org/project/sc-membench/versions" target="_blank" rel="noopener">repology.org</a>
for the current packaging status.

A few options worth knowing:

- `-H` enables huge pages via THP for buffers >= 4 MB (no setup needed, graceful fallback)
- `-v` / `-vv` prints verbose output including detected cache and NUMA topology
- `-a` auto-scales thread count to find the optimal configuration per buffer size
- `-t SECONDS` sets a runtime limit for quick checks
- `-R` switches to human-readable output with the summary and benchmark scores

## Caveats

The cache detection relies on `hwloc` when available, and falls back to
`/sys/devices/system/cpu/*/cache/` on Linux or `sysctl` on BSD/macOS.
If detection fails, the benchmark falls back to hardcoded defaults (32 KB L1, 256 KB L2, 8 MB L3),
which may not exercise the right size boundaries on your hardware. Running with `-v` will
show what was detected.

On NUMA systems the benchmark requires `--privileged` in Docker (or equivalent capabilities)
for accurate thread pinning and NUMA-local allocation. Without it, results are still useful
but may understate peak bandwidth on multi-socket servers.

We have tested on x86 (AMD and Intel) and arm64 machines across several cloud vendors,
and on FreeBSD. Results on less common hardware are welcome.

Also: we plan to run this across \~5,000 cloud server types from 7 vendors. That is a
meaningful amount of cloud credits. Before burning through them, I would really appreciate
independent validation of the methodology, implementation correctness, and example results.
If something looks off, now is the right time to catch it.

## Feedback

The code is at
<a href="https://github.com/spareCores/sc-membench" target="_blank" rel="noopener">github.com/spareCores/sc-membench</a>.
If you find a bug, spot a methodological issue, or have ideas for missing cases, please
open an issue or pull request there. Or leave a comment below!

We are always looking for and value feedback, so please share your thoughts if you run it
on hardware we have not tested yet 🙏
