---
# ~50 chars
title: Measuring PostgreSQL Performance on Cloud Servers
date: 2026-10-02
# ~100 character
teaser: Compare PostgreSQL CPU and memory performance across self-managed and managed cloud databases.
# 320x220
image: /assets/images/blog/thumbnails/benchmark-pgbench-postgres.webp
image_alt: Stylized PostgreSQL and cloud-server illustration representing database benchmark performance.
author: Adam Toth
tags: [benchmark, performance, scalability, score]
---

Many cloud benchmarking projects start with the easy parts: CPU, memory, web
serving, or static file serving. A database benchmark is harder to get right.
PostgreSQL performance depends on more than server speed: it is shaped by
concurrency, transaction mix, query planning, memory layout, and the environment
around the database.

That gap was one of the reasons we built this PostgreSQL benchmark. We wanted a
workload that could be used across thousands of cloud server types while staying
relevant to real database performance. The result is a `pgbench`-driven
benchmark that measures PostgreSQL server behavior on both local and remote
deployments.

## Why we needed a PostgreSQL benchmark

Our [Navigator](https://sparecores.com/servers) project publishes performance
measurements for more than 5,000 cloud server types. Before this benchmark, we
had useful proxies for database performance, but none that scaled well to modern
cloud instances.

PassMark database operations do not scale to larger machines, Redis is not a
relational database, and raw CPU or memory metrics are not the same thing as
database throughput. We needed a benchmark that measures the server's actual
PostgreSQL behavior rather than a partially related proxy.

We built this benchmark to compare PostgreSQL performance across cloud servers
without mixing in workload dimensions that would make the results harder to
interpret.

Some highlights:

- **Comparable measurements**: focus on PostgreSQL CPU and memory behavior
  across self-managed and managed deployments.
- **Two workloads**: a custom CPU-heavy read-only workload and a built-in
  TPC-B-like reference workload.
- **Concurrency profile**: TPM results include measurements at multiple client
  counts, with latency samples.

## What the Benchmark Measures

The image runs `pgbench` against PostgreSQL and reports throughput and
concurrency behavior across multiple client counts. The main score is TPM
(transactions per minute), and this benchmark shows how throughput changes as
concurrency rises and where the server stops scaling cleanly.

The benchmark is designed to be deployment-agnostic. It supports both:

- **IaaS (Infrastructure as a Service):** self-hosted PostgreSQL, with the
  client and database on the same node
- **DBaaS (Database as a Service):** provider-managed PostgreSQL, with the
  client running separately while the database engine is managed by the provider

This makes the benchmark useful for comparing self-managed and managed
PostgreSQL on comparable hardware while keeping the methodology consistent.

## Why `pgbench` Is a Good Fit

`pgbench` is a standard PostgreSQL benchmarking tool, and it is a good fit for
our purpose because it lets us keep the benchmark focused on server behavior
rather than on a specific application workload.

It can be used with two workloads:

- `pgbench_ro` is the default workload for this benchmark. It is a custom
  read-only workload designed to make the server spend meaningful time in
  CPU-heavy PostgreSQL work rather than waiting on storage.
- `pgbench_tpcb` is the built-in TPC-B-like reference workload, useful as a
  conventional OLTP-style comparison point.

The default workload is intentionally tuned to reduce the effect of network
latency and storage performance. The goal is to measure PostgreSQL CPU and
memory behavior, not block storage or network throughput.

## The Default Workload: CPU-Heavy and Cache-Friendly

The default `pgbench_ro` workload is not meant to model a real application
exactly. Instead, it is built to be stable, comparable, and sensitive to server
CPU and memory performance.

It creates a fixed schema and runs a single SQL transaction with several blocks
that exercise different PostgreSQL subsystems:

- index scans and joins
- aggregation and hashing
- regular-expression work
- full-text search
- arrays and GIN (Generalized Inverted Index) indexes
- ordered-set aggregates
- TOAST (The Oversized-Attribute Storage Technique) fetch/decompression
- sequential scan work

The transaction is intentionally synthetic and CPU-heavy. It spreads work across
multiple PostgreSQL components so that no single path dominates the result. That
makes it more useful for comparing different server types than a trivial one-row
`SELECT` benchmark, which can be distorted by network latency or very small
transactional costs.

The benchmark also varies the concurrency profile across a small number of
client counts; the score is based on the highest TPM result in the measured
profile. That gives us a simple headline number while still preserving the
concurrency curve that matters for real server comparisons.

## Running the Benchmark

The image is published as:

```bash
ghcr.io/sparecores/benchmark-pgbench-postgres:main
```

Run the image via Docker. In remote mode, set `SC_DB_HOST` and provide
credentials. In standalone mode, the container starts a local PostgreSQL 18
server.

### Remote Mode

```sh
docker run --rm \
  -e SC_DB_HOST=<postgres-host> \
  -e SC_DB_PASSWORD=<password> \
  -e SC_WORKLOAD=pgbench_ro \
  ghcr.io/sparecores/benchmark-pgbench-postgres:main
```

### Standalone Mode

```sh
docker run --rm ghcr.io/sparecores/benchmark-pgbench-postgres:main
```

In standalone mode, the image starts PostgreSQL locally, applies local tuning,
and runs the benchmark against that instance. In remote mode, the target
database is left as-is; the image does not enforce or check the remote server
version.

## What the Results Look Like

The benchmark emits one JSON object to stdout. The most important fields are:

- `score`: the headline result in TPM
- `score_unit`: `tpm`
- `peak_concurrency`: the client count at the peak result
- `sizes[]`: per-workload-size measurements and their profiles
- `profile[]`: one concurrency measurement at a time, including latency samples
- `latency_ms`: sampled p50, p95, and p99 values in milliseconds

This makes it easy to compare server types not only by headline throughput, but
by how they handle increasing concurrency and whether throughput degrades in a
meaningful way as load rises.

## What This Benchmark Deliberately Excludes

This benchmark is designed to compare server CPU and memory performance, not
every possible database dimension. We deliberately avoid some areas that would
otherwise distract from the core comparison.

The main exclusions are:

- **Disk performance**: storage is separate from the server type in most clouds
- **Network throughput and latency**: the benchmark is designed to be resilient
  to RTT effects
- **Application-specific workloads**: the benchmark is synthetic and not meant
  to predict a specific production workload
- **Engine tuning in DBaaS**: provider-managed services are part of the
  benchmark environment, not something the harness attempts to control

This keeps the results comparable across a wide range of machines and server
classes.

## Summary

This benchmark provides a consistent way to compare PostgreSQL CPU and memory
performance across cloud servers. Its synthetic workloads and controlled setup
make the results useful for server selection, but they do not replace
application-level testing.

## Further Reading

- <a
  href="https://github.com/SpareCores/sc-images/blob/main/images/benchmark-pgbench-postgres/README.md"
  target="_blank" rel="noopener">Benchmark README</a>
- <a
  href="https://github.com/SpareCores/sc-images/blob/main/images/benchmark-pgbench-postgres/docs/workloads.md"
  target="_blank" rel="noopener">Workload documentation</a>
- <a
  href="https://github.com/SpareCores/sc-images/blob/main/images/benchmark-pgbench-postgres/docs/limitations.md"
  target="_blank" rel="noopener">Limitations and exclusions</a>
- <a
  href="https://github.com/SpareCores/sc-images/blob/main/images/benchmark-pgbench-postgres/docs/references.md"
  target="_blank" rel="noopener">Reference glossary</a>

## Feedback

If you have any questions or suggestions, please leave a message in the comment
section below.
