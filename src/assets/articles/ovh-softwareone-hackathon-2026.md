---
# ~50 chars
title: "A 3-Day Hackathon for Augmented Workloads"
date: 2026-04-17
# ~100 character
teaser: "OVHcloud, Crayon/SoftwareOne, and Spare Cores joint effort to profile compound benchmark scores together."
# 320x220
image: /assets/images/blog/thumbnails/ovh-crayon-sparecores-hackathon.webp
image_alt: Participants of the OVHcloud, SoftwareOne, and Spare Cores hackathon gathered around a table, with logos of the three companies.
author: Gergely Daroczi
tags: [benchmark, performance, score, conference]
---

In mid-April, our team spent three days in Paris in a hands-on technical workshop together with cloud architects, data engineers, and product specialists from <a href="https://www.ovhcloud.com/" target="_blank" rel="noopener">OVHcloud</a> and <a href="https://www.crayon.com/" target="_blank" rel="noopener">Crayon/SoftwareOne</a>. The goal was to tackle a problem we have been thinking about for a long time: how can organisations confidently identify the best-value cloud instance for their specific workloads, rather than relying on generic benchmark numbers that often miss the real picture?

The short answer we came up with: build workload-specific compound scores. Here is what we learned along the way.

## The Problem with Raw Benchmarks

Spare Cores collects a large number of independent benchmark results across thousands of cloud servers -- things like CPU performance in single-threaded and multi-threaded scenarios, memory bandwidth, disk throughput, and more. These numbers are precise, reproducible, and comparable. But when an engineer asks "which instance should I pick for my SaaS application?", handing them 15 individual scores is not always helpful.

Traditional benchmark-led comparisons miss the real picture because different workloads weight those dimensions very differently. A CI/CD pipeline cares mostly about burst single-core speed and fast I/O. An ML inference server lives or dies by memory bandwidth and floating point throughput. A data pipeline needs both -- but probably in a ratio specific to that pipeline. None of those ratios are the same.

## What We Built

The core idea we worked on during the hackathon was combining raw Spare Cores benchmark scores into augmented workload profiles: weighted averages of curated benchmarks that produce a single compound score easier to interpret and evaluate. Instead of 15 numbers, you get one score calibrated for your specific use case.

We worked through several real enterprise workload categories during the workshop:

- Compute-heavy applications
- Data pipelines
- LLM and general ML inference
- CI/CD environments
- Database workloads

For each category, the group discussed which benchmarks matter most and what a sensible weighting looks like, then we tested the weights on real data for stability and consistency. The outcome is a methodology for workload-aware cloud recommendations, with transparent performance-per-cost insights and scoring that is straightforward to audit for bias.

This is exactly the kind of work that is hard for any single company to do well on its own. OVHcloud brought deep cloud infrastructure expertise and real customer context. Crayon and SoftwareOne brought advisory experience from helping enterprises navigate cloud decisions every day. Spare Cores contributed the independent benchmarking data and the tooling to slice and combine it. The combination of those three perspectives is what made it possible to move from raw numbers to something production-ready in three days.

## Lessons Learned

A few things that stood out to us from the workshop:

- **Weighting is the hard part.** Choosing benchmark scores to include in a compound metric is relatively straightforward. Agreeing on the weights, e.g. "How much does memory bandwidth matter relative to single-core speed for a given workload?", requires genuine domain knowledge and good benchmark coverage. Getting people in the same room who have that knowledge from different angles was valuable.

- **Transparency matters as much as accuracy.** A compound score that no one can audit is not useful in practice. We spent meaningful time on making the methodology readable and the weights explicit, so customers can understand exactly why one instance ranked higher than another.

- **Bias is a real risk.** Any scoring system that combines raw metrics can embed assumptions that favor certain architectures, regions, or vendors. Building in explicit bias auditing steps from the start is easier than retrofitting them later. This is something we want to carry forward into how we publish workload profiles on the Spare Cores platform.

- **Partnerships accelerate things that are otherwise very slow.** Spare Cores has had the benchmarking data. But connecting that data to the specific workload patterns that enterprise customers actually run required the advisory experience that Crayon/SoftwareOne brought, and the cloud-side context that OVHcloud provided. Three days of focused work together produced something that would have taken much longer in isolation.

## What Comes Next

We are excited about this partnership and the direction it points toward. Workload-aware recommendations and compound performance-per-cost scores are something we want to make available broadly on Spare Cores, not just in the context of this specific collaboration.

The initial weights are currently being implemented in the Spare Cores platform, and we will soon publish the related dynamic charts for each workload category per cloud server, and a cloud server comparision tool to make it easier to compare instances across these different workload profiles. Stay tuned for future news from this collaboration!

## Feedback

If you have questions about the methodology, want to suggest workload profiles we should add, or just want to share how you currently make cloud instance decisions, please leave a message in the comment section below, or <a href="https://meet.sparecores.com/intro" target="_blank" rel="noopener">schedule a call with us</a>.
