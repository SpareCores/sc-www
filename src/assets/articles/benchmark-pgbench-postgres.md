---
# ~50 chars
title: Measuring PostgreSQL Performance at Scale
date: 2026-10-02
# ~100 character
teaser: Compare PostgreSQL CPU and memory performance across self-managed and managed cloud databases.
# 320x220
image: /assets/images/blog/thumbnails/postgresql-contour.webp
image_alt: PostgreSQL logo, depicting a blue elephant on a transparent background.
author: Adam Toth
tags: [benchmark, performance, scalability, score]
---

Our [Navigator](/servers) project publishes performance measurements for 5000+
cloud server types. Most of them measure the hardware directly: CPU, memory, and
GPU performance, plus synthetic suites such as PassMark and Geekbench, for [50+
benchmark scores](/article/cloud-compute-performance-benchmarks) in total. We
also run application workloads, such as [static web
serving](/article/benchmark-static-webserver) and [LLM inference
speed](/article/llm-inference-speed).

Databases were always on our list. In the static web server post, we promised to
follow up on a Redis use case that came up on Twitter/X, but other priorities
kept coming first, and database benchmarking is hard: PostgreSQL throughput
depends on concurrency, transaction mix, query planning, and memory layout, not
just raw server speed. Our existing scores did not fill the gap either. PassMark
database operations do not scale to larger machines, Redis is not a relational
database, and raw CPU or memory metrics are not the same thing as database
throughput.

So we built a `pgbench`-based benchmark that measures actual PostgreSQL behavior
on both self-hosted and managed PostgreSQL. Some highlights:

- **CPU and memory, not disk or network**: the default, read-only workload uses
  a \~300 MiB dataset that stays in memory, so storage and network performance
  do not show up in the score.
- **From tiny to large servers**: runs on anything from 2 GiB of RAM up to
  servers with hundreds of vCPUs.
- **ARM and x86**: the images are published for both `arm64` and `amd64`.
- **One comparable number**: each run records a concurrency curve with p50, p95,
  and p99 latency at up to four client counts, then reduces it to a single score
  in peak transactions per minute (TPM) that compares the CPU and memory
  performance of any PostgreSQL server.

If you're not interested in the design choices, feel free to skip ahead to
[Running the
Benchmark](/article/benchmark-pgbench-postgres#running-the-benchmark).

## Methodology

`pgbench` is PostgreSQL's standard benchmarking tool, and it can run custom SQL
scripts. This let us write a workload that exercises the database server itself,
instead of modeling the queries of any particular application. The headline
score is TPM (transactions per minute): the highest throughput the server
reached across the measured client counts.

### IaaS and DBaaS

The same image runs against two kinds of deployments:

- **IaaS** (Infrastructure as a Service): self-hosted PostgreSQL, with the
  client and database on the same node.
- **DBaaS** (Database as a Service): provider-managed PostgreSQL, with the
  client on a separate VM connected over a private VPC network.

But why not run the client on a separate machine for IaaS too, like most
published database benchmarks do?

Because it would not change the results, for two reasons. First, the client is
lightweight: on an 8-vCPU run, `pgbench` used under 1% CPU and \~10 MB of
memory, so it takes almost nothing away from the database. Second, the read-only
workload runs heavy queries that take \~100 ms per transaction, so the
round-trip time (RTT) between client and server is a rounding error in the
score. Without that, a client on the same node would give IaaS an unfair
advantage over DBaaS, where the client must connect over the network.

So a second VM per benchmark run, across thousands of server types, would only
add cost. For DBaaS there is no choice: the provider runs the database, so the
client needs its own VM.

### Workload

The default `pgbench_ro` workload is a custom read-only workload that keeps the
server busy with CPU-heavy PostgreSQL work instead of waiting on storage. It is
not meant to model a real application. It creates a fixed schema of \~300 MiB,
small enough to stay in memory, and runs a single SQL transaction with several
blocks that exercise different PostgreSQL subsystems:

- index scans and joins
- aggregation and hashing
- regular-expression work
- full-text search
- arrays and GIN (Generalized Inverted Index) indexes
- ordered-set aggregates
- TOAST (The Oversized-Attribute Storage Technique) fetch and decompression
- sequential scan work

Spreading the work across these components means no single code path dominates
the result. A trivial one-row `SELECT` benchmark, by contrast, is easily
distorted by network latency and per-transaction overhead. See our <a
href="https://github.com/SpareCores/sc-images/blob/main/images/benchmark-pgbench-postgres/docs/workloads.md#pgbench_ro"
target="_blank" rel="noopener">workload documentation</a> for details.

### Concurrency Profile

By default, `pgbench_ro` measures throughput at 1, V/2 (rounded down), V, and 2V
clients, where V is the database server's vCPU count; on small servers,
duplicate points are dropped. The score is the highest TPM among these points,
and the full curve is kept in the output, so you can see where a server stops
scaling cleanly. If you're curious why that point varies so much between
servers, our [multi-core scalability](/article/multi-core-scalability) article
covers the usual suspects.

Note that this is not a quick test: with warmups, a default run takes \~25
minutes per server with 4 or more vCPUs, excluding data preparation. Across
thousands of server types, that adds up. The <a
href="https://github.com/SpareCores/sc-images/blob/main/images/benchmark-pgbench-postgres/docs/usage.md#run-duration"
target="_blank" rel="noopener">run duration docs</a> break down the timing.

## Running the Benchmark

Pull the image:

<pre class="command-line" data-prompt="$"><code class="language-sh">
docker pull ghcr.io/sparecores/benchmark-pgbench-postgres:main
</code></pre>

The image runs in one of two modes, depending on whether `SC_DB_HOST` is set.

### Standalone Mode

With no `SC_DB_HOST`, the container starts its own PostgreSQL 18 server and
benchmarks it:

<pre class="command-line" data-prompt="$"><code class="language-sh">
docker run --rm ghcr.io/sparecores/benchmark-pgbench-postgres:main
</code></pre>

The local server is tuned with a port of <a href="https://pgtune.leopard.in.ua/"
target="_blank" rel="noopener">pgtune</a> based on the detected vCPU count and
memory. The image also raises PostgreSQL's priority with `nice -n -20`, which
only takes effect in a container allowed to change priorities (for example, a
privileged one). The <a
href="https://github.com/SpareCores/sc-images/blob/main/images/benchmark-pgbench-postgres/docs/usage.md#standalone-mode"
target="_blank" rel="noopener">standalone mode docs</a> list the exact settings.

### Remote Mode

Set `SC_DB_HOST` to benchmark an existing server, such as a DBaaS instance:

<pre class="command-line" data-prompt="$" data-continuation-str="\"><code class="language-sh">
docker run --rm \
  -e SC_DB_HOST=&lt;postgres-host&gt; \
  -e SC_DB_PASSWORD=&lt;password&gt; \
  -e SC_DB_VCPUS=&lt;db-vcpus&gt; \
  ghcr.io/sparecores/benchmark-pgbench-postgres:main
</code></pre>

Set `SC_DB_VCPUS` to the database server's vCPU count. It defaults to the CPU
count of the machine running the container, so on a separate client VM the
concurrency points would be sized for the wrong machine. The remote server is
benchmarked as-is: the image does not retune it. See the <a
href="https://github.com/SpareCores/sc-images/blob/main/images/benchmark-pgbench-postgres/docs/usage.md#remote-mode"
target="_blank" rel="noopener">remote mode docs</a> for the prerequisites and
connection settings.

## Reading the Output

The benchmark prints one JSON object to stdout:

- At the top level, `score`, `score_unit` (`tpm`), and `peak_concurrency` come
  from the best-performing workload size.
- `sizes[]` holds one entry per workload size, identified by its `cpu_scale`
  work multiplier.
- Each size has a `profile[]` with one point per client count, including
  `concurrency`, `tpm`, and `latency_ms` with p50, p95, and p99 values.

Comparing the `profile[]` curves tells you more than the headline score: two
servers with the same peak can behave very differently once load goes past their
vCPU count. The <a
href="https://github.com/SpareCores/sc-images/blob/main/images/benchmark-pgbench-postgres/README.md#results"
target="_blank" rel="noopener">README</a> explains the main output fields.

## Caveats

This benchmark compares server CPU and memory performance, not every possible
database dimension. Note the following:

- **Disk performance**: not measured, as storage is sold separately for most
  cloud server types. See <a
  href="https://github.com/SpareCores/sc-images/blob/main/images/benchmark-pgbench-postgres/docs/limitations.md#disk-io-speed"
  target="_blank" rel="noopener">Disk I/O Speed</a>.
- **Network throughput and latency**: the score is agnostic to both, because the
  default workload is heavy enough per transaction that RTT has little effect.
  See <a
  href="https://github.com/SpareCores/sc-images/blob/main/images/benchmark-pgbench-postgres/docs/limitations.md#network-performance"
  target="_blank" rel="noopener">Network Performance</a>.
- **DBaaS engine tuning**: provider-managed settings are part of what is
  measured, not something the benchmark controls.
- **Server version**: the image records the PostgreSQL version and settings only
  in standalone mode. For the results we publish, our harness also collects
  them from DBaaS servers. Only the major version is fixed, as many DBaaS
  providers apply minor upgrades automatically.
- **Application-specific workloads**: the workload is synthetic, so results help
  with server selection but do not replace testing your own application. See <a
  href="https://github.com/SpareCores/sc-images/blob/main/images/benchmark-pgbench-postgres/docs/limitations.md#a-production-workload"
  target="_blank" rel="noopener">A Production Workload</a>.

## Summary

We now proudly publish a PostgreSQL benchmark that runs the same way on
self-hosted and managed databases, and focuses on the CPU and memory work that
differs most between server types. It scales from 2 GiB nodes to servers with
hundreds of vCPUs, on both ARM and x86. The concurrency profile shows not just
how fast a server is, but how well it scales. Since [Navigator](/servers) also
tracks server prices, you can weigh TPM against cost when picking a server.

## Next Steps

We have already benchmarked 700+ cloud server types, and our automation is still
running. Depending on our budget at the different cloud vendors, we hope to wrap
up a much wider coverage in the next few weeks. We will then write up our
findings in a more detailed blog post, so stay tuned!

## Feedback

If you have any questions, concerns, or suggestions, please leave a message in
the comment section below, open a ticket in our <a
href="https://github.com/SpareCores/sc-images" target="_blank"
rel="noopener">GitHub repository</a>, or <a
href="https://meet.sparecores.com/intro" target="_blank" rel="noopener">schedule
a call with us</a> to discuss your needs.
