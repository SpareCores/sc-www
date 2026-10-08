---
# ~50 chars
title: "Three new conference talks across Europe"
date: 2026-10-05
# ~100 character
teaser: "The Spare Cores team presents in Budapest, Amsterdam, and Warsaw this October and November."
# 320x220
image: /assets/images/blog/thumbnails/devopsdays-warsaw-2026.webp
image_alt: Logo of the DevOpsDays Warsaw 2026 conference.
author: Gergely Daroczi
tags: [conference, talk, slides]
---

After a busy spring and summer of [conferences across Europe and the USA](/article/upcoming-conferences-2026), we are not slowing down for the end of the year. Over the next few weeks, we are presenting three new talks in Budapest (Hungary), Amsterdam (Netherlands), and Warsaw (Poland). Each one looks at the same question from a different angle: what do you actually get when you pick a cloud server type?

## Oct 30: KCD Budapest 2026 (Hungary)

We are back at <a href="https://kcdbudapest.hu/" target="_blank" rel="noopener">Kubernetes Community Days Budapest</a>! Last year's KCD deadline was the final push to ship our [LLM inference speed benchmarks](/article/llm-inference-speed), and this time we are bringing something more Kubernetes-native: **563 Things Karpenter Didn't Know About**.

Karpenter picks nodes based on provider specs, but two instance types with the same vCPU count can show very different single-core speed, memory throughput, and latency, even at similar CPU frequencies. We built a lightweight Kubernetes controller that feeds our 563 benchmark scores into Karpenter `NodePool` specs to target high-performance instance types, without touching Karpenter itself.

## Nov 2: SREday Amsterdam 2026 (Netherlands)

Next stop is <a href="https://sreday.com/2026-amsterdam-q4/" target="_blank" rel="noopener">SREday Amsterdam</a>, where we present **Data-Driven Instance Selection** (<a href="https://sreday.com/2026-amsterdam-q4/Gergely_Daroczi_Spare_Cores_DataDriven_Instance_Selection#speakers-section" target="_blank" rel="noopener">abstract</a>).

Choosing an instance type is still mostly guesswork: pricing and hardware specs are public, but scattered and hard to compare, and they say nothing about real workload performance. We will show how the open-source Spare Cores Navigator data turns this into a simple query: filter by workload characteristics, hardware or compliance constraints, and budget, then rank the candidates by price-performance. If you want a preview, the [Server Navigator](/servers) is the web UI on top of the same data.

## Nov 23-24: DevOpsDays Warsaw 2026 (Poland)

I was in Warsaw for useR! in July, and I'm happy to return so soon for <a href="https://devopsdays.pl/" target="_blank" rel="noopener">DevOpsDays Warsaw</a> with a talk titled **What is a vCPU, Really?**

We track 5000+ instance types across 7 vendors, and a "vCPU" means something different at nearly every one of them. This talk covers how we collect the data behind Spare Cores: public GitHub Actions running Pulumi to start each server type, then containerized hardware discovery and 500+ benchmark workloads (memory bandwidth, LLM inference, Geekbench, PassMark, OpenSSL, static web serving, databases and more), with all results going to public repositories. We will also cover how you can access the data (raw JSON, Python package, API, web UI), and of course the not-so-glorious part: how some of our benchmarking projects went well over the $10k budget. If you are curious about vCPUs in the meantime, see our earlier post on [whether vCPUs truly scale](/article/multi-core-scalability).

<hr />

We are looking forward to seeing you at one of these events! If you want to meet up specifically, or have questions before the talks, feel free to leave a note in the comments below, or reach out to us via our [contact page](/contact).

As always, if you can't make it, slides and video recordings (when available) will appear on our [Talks page](/talks) afterwards. See you there! 👋
