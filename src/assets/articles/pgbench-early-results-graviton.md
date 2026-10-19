---
# ~50 chars
title: "PostgreSQL Benchmark on AWS Graviton"
date: 2026-10-19
# ~100 character
teaser: "Extending the performance evaluations of Graviton instance families with high concurrency database metrics."
# 320x220
image: /assets/images/blog/thumbnails/TODO.webp
image_alt: TODO.
author: Alex Trickey
tags: [benchmark, performance, score, aws]
---

Spare Cores has added a new database benchmark and we’re excited to bring you some early results! We can now measure server performance on PostgreSQL workloads across our full range of monitored servers and we have extended our coverage to include managed PostgreSQL servers at several vendors. The new benchmark consists of a demanding read-only transaction containing subqueries hitting the core PostgreSQL functionality (joins, aggregations, indexes, hashes, TOAST, text search, and much more). The workload is run at four levels of concurrency and the resulting metric is the maximum transactions per minute (TPM) achieved by each server across any concurrency condition. You can check out the details in our benchmark introduction here: 
[Measuring PostgreSQL Performance at Scale](/article/benchmark-pgbench-postgres).

Since this benchmark is also one of our first tests of high concurrency workloads, we wanted our initial look to span the breadth of compute sizes. Given our recent work profiling the AWS Graviton 5-powered families, which includes servers ranging from 1 vCPU (4 GiB RAM) up to 192 vCPUs (and 768 GiB RAM), these felt like a natural choice. Our earlier analysis (which you can review here: [AWS Graviton5 Benchmarks](/article/aws-graviton5-benchmarks)) considered the m9g and m9gd, which have substantially larger L3 memory caches than previous generations. Our tests showed corresponding improvements in memory bandwidth performance for read, write, and mixed operations. These benefits carried over to computing tasks (such as compression, sorting, and mathematical operations), where we saw a 16-50% boost in performance, and to LLM inference where we saw a roughly 30% boost in performance across the board for Gemma (a 2B parameter LLM). Now we are extending these results to include our new high concurrency database benchmarks!

Cutting to the chase, we ran the PostgreSQL benchmark on all of the available Graviton machines in addition to their corresponding Amazon-managed RDS instances. As shown in the figure below, the latest performance followed a similar pattern to our earlier-reported results with TPM increasing with successive generations. Interestingly, we also saw a small XX%-YY% boost in TPM for the Amazon-managed RDS instances over the equivalent database running on the specification-matched EC2 instances (tuned via industry standard methodology). 

PLOT 1

When we consider this data on a per-vCPU basis (shown below), it’s a bit easier to see (a) the improvement across the Graviton generations, (b) the nearly linear scaling of the performance with the vCPU count and (c) the performance boost of RDS over the generic self-managed databases running on EC2. 

PLOT 2

And for those who would prefer to play in the raw numbers, here’s the same data in table form: 

TABLE 1

We’ll be writing more on our database and other high concurrency benchmarks soon. As a sneak peak here's an example of how concurrent database queries perform on two SKUs with and without simultaneous multithreading (specifically, GCPs ... TODO ...).

PLOT 3
