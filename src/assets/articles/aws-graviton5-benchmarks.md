---
# ~50 chars
title: "AWS Graviton5 Benchmarks"
date: 2026-06-12
# ~100 character
teaser: "Performance evaluation of the new m9g instance family against previous generations (m8g, m7g, and m6g)."
# 320x220
image: /assets/images/blog/thumbnails/m9g.metal-48xl-lstopo.webp
image_alt: CPU and system topology diagram of the m9g.metal-48xl instance.
author: Gergely Daroczi
tags: [benchmark, performance, score, aws, vendor]
---

<a href="https://www.aboutamazon.com/news/aws/aws-graviton-5-cpu-amazon-ec2" target="_blank" rel="noopener">AWS announced the general availability</a>
of the new Graviton5-powered (ARM) `m9g` and `m9gd` instance families, promising "up to 25% better compute performance", "2.6x more L3 cache", "faster memory speeds", "15% higher network bandwidth", and "30% higher IOPS" than the previous generation.

This sounded very exciting already back in December when the new Graviton generation was announced at *AWS re:Invent 2025*, but we only had marketing claims at that time without the ability to actually measure performance -- so I was super happy to dig into the [Spare Cores](https://sparecores.com) data we automatically collected overnight by actually starting all new instance types and running 500+ benchmark workloads on each along with detailed hardware discovery tools.

You can find the raw data under open-source licenses, but here are the direct links for easy human inspection of the related server sizes across 4 Graviton generations (`m6g`, `m7g`, `m8g`, and `m9g`):

* [medium (1 vCPU & 4 GiB RAM)](https://sparecores.com/compare?instances=W3siZGlzcGxheV9uYW1lIjoibTZnLm1lZGl1bSIsInZlbmRvciI6ImF3cyIsInNlcnZlciI6Im02Zy5tZWRpdW0iLCJ6b25lc1JlZ2lvbnMiOltdfSx7ImRpc3BsYXlfbmFtZSI6Im03Zy5tZWRpdW0iLCJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJtN2cubWVkaXVtIiwiem9uZXNSZWdpb25zIjpbXX0seyJkaXNwbGF5X25hbWUiOiJtOGcubWVkaXVtIiwidmVuZG9yIjoiYXdzIiwic2VydmVyIjoibThnLm1lZGl1bSIsInpvbmVzUmVnaW9ucyI6W119LHsiZGlzcGxheV9uYW1lIjoibTlnLm1lZGl1bSIsInZlbmRvciI6ImF3cyIsInNlcnZlciI6Im05Zy5tZWRpdW0iLCJ6b25lc1JlZ2lvbnMiOltdfV0%3D)
* [large (2 vCPU & 8 GiB RAM)](https://sparecores.com/compare?instances=W3siZGlzcGxheV9uYW1lIjoibTZnLmxhcmdlIiwidmVuZG9yIjoiYXdzIiwic2VydmVyIjoibTZnLmxhcmdlIiwiem9uZXNSZWdpb25zIjpbXX0seyJkaXNwbGF5X25hbWUiOiJtN2cubGFyZ2UiLCJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJtN2cubGFyZ2UiLCJ6b25lc1JlZ2lvbnMiOltdfSx7ImRpc3BsYXlfbmFtZSI6Im04Zy5sYXJnZSIsInZlbmRvciI6ImF3cyIsInNlcnZlciI6Im04Zy5sYXJnZSIsInpvbmVzUmVnaW9ucyI6W119LHsiZGlzcGxheV9uYW1lIjoibTlnLmxhcmdlIiwidmVuZG9yIjoiYXdzIiwic2VydmVyIjoibTlnLmxhcmdlIiwiem9uZXNSZWdpb25zIjpbXX1d)
* [xlarge (4 vCPU & 16 GiB RAM)](https://sparecores.com/compare?instances=W3siZGlzcGxheV9uYW1lIjoibTZnLnhsYXJnZSIsInZlbmRvciI6ImF3cyIsInNlcnZlciI6Im02Zy54bGFyZ2UiLCJ6b25lc1JlZ2lvbnMiOltdfSx7ImRpc3BsYXlfbmFtZSI6Im03Zy54bGFyZ2UiLCJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJtN2cueGxhcmdlIiwiem9uZXNSZWdpb25zIjpbXX0seyJkaXNwbGF5X25hbWUiOiJtOGcueGxhcmdlIiwidmVuZG9yIjoiYXdzIiwic2VydmVyIjoibThnLnhsYXJnZSIsInpvbmVzUmVnaW9ucyI6W119LHsiZGlzcGxheV9uYW1lIjoibTlnLnhsYXJnZSIsInZlbmRvciI6ImF3cyIsInNlcnZlciI6Im05Zy54bGFyZ2UiLCJ6b25lc1JlZ2lvbnMiOltdfV0%3D)
* [2xlarge (8 vCPU & 32 GiB RAM)](https://sparecores.com/compare?instances=W3siZGlzcGxheV9uYW1lIjoibTZnLjJ4bGFyZ2UiLCJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJtNmcuMnhsYXJnZSIsInpvbmVzUmVnaW9ucyI6W119LHsiZGlzcGxheV9uYW1lIjoibTdnLjJ4bGFyZ2UiLCJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJtN2cuMnhsYXJnZSIsInpvbmVzUmVnaW9ucyI6W119LHsiZGlzcGxheV9uYW1lIjoibThnLjJ4bGFyZ2UiLCJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJtOGcuMnhsYXJnZSIsInpvbmVzUmVnaW9ucyI6W119LHsiZGlzcGxheV9uYW1lIjoibTlnLjJ4bGFyZ2UiLCJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJtOWcuMnhsYXJnZSIsInpvbmVzUmVnaW9ucyI6W119XQ%3D%3D)
* [4xlarge (16 vCPU & 64 GiB RAM)](https://sparecores.com/compare?instances=W3siZGlzcGxheV9uYW1lIjoibTZnLjR4bGFyZ2UiLCJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJtNmcuNHhsYXJnZSIsInpvbmVzUmVnaW9ucyI6W119LHsiZGlzcGxheV9uYW1lIjoibTdnLjR4bGFyZ2UiLCJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJtN2cuNHhsYXJnZSIsInpvbmVzUmVnaW9ucyI6W119LHsiZGlzcGxheV9uYW1lIjoibThnLjR4bGFyZ2UiLCJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJtOGcuNHhsYXJnZSIsInpvbmVzUmVnaW9ucyI6W119LHsiZGlzcGxheV9uYW1lIjoibTlnLjR4bGFyZ2UiLCJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJtOWcuNHhsYXJnZSIsInpvbmVzUmVnaW9ucyI6W119XQ%3D%3D)
* [8xlarge (32 vCPU & 128 GiB RAM)](https://sparecores.com/compare?instances=W3siZGlzcGxheV9uYW1lIjoibTZnLjh4bGFyZ2UiLCJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJtNmcuOHhsYXJnZSIsInpvbmVzUmVnaW9ucyI6W119LHsiZGlzcGxheV9uYW1lIjoibTdnLjh4bGFyZ2UiLCJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJtN2cuOHhsYXJnZSIsInpvbmVzUmVnaW9ucyI6W119LHsiZGlzcGxheV9uYW1lIjoibThnLjh4bGFyZ2UiLCJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJtOGcuOHhsYXJnZSIsInpvbmVzUmVnaW9ucyI6W119LHsiZGlzcGxheV9uYW1lIjoibTlnLjh4bGFyZ2UiLCJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJtOWcuOHhsYXJnZSIsInpvbmVzUmVnaW9ucyI6W119XQ%3D%3D)
* [12xlarge (48 vCPU & 192 GiB RAM)](https://sparecores.com/compare?instances=W3siZGlzcGxheV9uYW1lIjoibTZnLjEyeGxhcmdlIiwidmVuZG9yIjoiYXdzIiwic2VydmVyIjoibTZnLjEyeGxhcmdlIiwiem9uZXNSZWdpb25zIjpbXX0seyJkaXNwbGF5X25hbWUiOiJtN2cuMTJ4bGFyZ2UiLCJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJtN2cuMTJ4bGFyZ2UiLCJ6b25lc1JlZ2lvbnMiOltdfSx7ImRpc3BsYXlfbmFtZSI6Im04Zy4xMnhsYXJnZSIsInZlbmRvciI6ImF3cyIsInNlcnZlciI6Im04Zy4xMnhsYXJnZSIsInpvbmVzUmVnaW9ucyI6W119LHsiZGlzcGxheV9uYW1lIjoibTlnLjEyeGxhcmdlIiwidmVuZG9yIjoiYXdzIiwic2VydmVyIjoibTlnLjEyeGxhcmdlIiwiem9uZXNSZWdpb25zIjpbXX1d)
* [16xlarge (64 vCPU & 256 GiB RAM)](https://sparecores.com/compare?instances=W3siZGlzcGxheV9uYW1lIjoibTZnLjE2eGxhcmdlIiwidmVuZG9yIjoiYXdzIiwic2VydmVyIjoibTZnLjE2eGxhcmdlIiwiem9uZXNSZWdpb25zIjpbXX0seyJkaXNwbGF5X25hbWUiOiJtN2cuMTZ4bGFyZ2UiLCJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJtN2cuMTZ4bGFyZ2UiLCJ6b25lc1JlZ2lvbnMiOltdfSx7ImRpc3BsYXlfbmFtZSI6Im04Zy4xNnhsYXJnZSIsInZlbmRvciI6ImF3cyIsInNlcnZlciI6Im04Zy4xNnhsYXJnZSIsInpvbmVzUmVnaW9ucyI6W119LHsiZGlzcGxheV9uYW1lIjoibTlnLjE2eGxhcmdlIiwidmVuZG9yIjoiYXdzIiwic2VydmVyIjoibTlnLjE2eGxhcmdlIiwiem9uZXNSZWdpb25zIjpbXX1d)

Larger instance sizes are only available at the `m8g` and `m9g` families, as previous generations maxed at 64 vCPUs:

* [24xlarge (96 vCPU & 384 GiB RAM)](https://sparecores.com/compare?instances=W3siZGlzcGxheV9uYW1lIjoibThnLjI0eGxhcmdlIiwidmVuZG9yIjoiYXdzIiwic2VydmVyIjoibThnLjI0eGxhcmdlIiwiem9uZXNSZWdpb25zIjpbXX0seyJkaXNwbGF5X25hbWUiOiJtOWcuMjR4bGFyZ2UiLCJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJtOWcuMjR4bGFyZ2UiLCJ6b25lc1JlZ2lvbnMiOltdfV0%3D)
* [48xlarge (192 vCPU & 768 GiB RAM)](https://sparecores.com/compare?instances=W3siZGlzcGxheV9uYW1lIjoibThnLjQ4eGxhcmdlIiwidmVuZG9yIjoiYXdzIiwic2VydmVyIjoibThnLjQ4eGxhcmdlIiwiem9uZXNSZWdpb25zIjpbXX0seyJkaXNwbGF5X25hbWUiOiJtOWcuNDh4bGFyZ2UiLCJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJtOWcuNDh4bGFyZ2UiLCJ6b25lc1JlZ2lvbnMiOltdfV0%3D)

And the `metal` versions (note that older generations had much lower vCPU/RAM):

* [metal (64vCPU & 256 GiB RAM @ m6g and m7g; 192 vCPU & 768 GiB RAM @ m8g and m9g)](https://sparecores.com/compare?instances=W3siZGlzcGxheV9uYW1lIjoibTZnLm1ldGFsIiwidmVuZG9yIjoiYXdzIiwic2VydmVyIjoibTZnLm1ldGFsIiwiem9uZXNSZWdpb25zIjpbXX0seyJkaXNwbGF5X25hbWUiOiJtN2cubWV0YWwiLCJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJtN2cubWV0YWwiLCJ6b25lc1JlZ2lvbnMiOltdfSx7ImRpc3BsYXlfbmFtZSI6Im04Zy5tZXRhbC00OHhsIiwidmVuZG9yIjoiYXdzIiwic2VydmVyIjoibThnLm1ldGFsLTQ4eGwiLCJ6b25lc1JlZ2lvbnMiOltdfSx7ImRpc3BsYXlfbmFtZSI6Im05Zy5tZXRhbC00OHhsIiwidmVuZG9yIjoiYXdzIiwic2VydmVyIjoibTlnLm1ldGFsLTQ4eGwiLCJ6b25lc1JlZ2lvbnMiOltdfV0%3D)

While I already spent some time reviewing all this rich data, I'm highlighting the most important aspects below to get you up-to-speed 😄 For demo purposes, I'll refer to the large `2xlarge` instance sizes in the charts below.

## The Specs

The newer generation of CPU indeed brings in clearly visible advantages over the previous generations -- even just looking at the hardware inspection results (although the hypervisor is sometimes just too shy to reveal all the details):

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    title="CPU specs of the large instances of the m6g/m7g/m8g/m9g instance families."
    alt="CPU specs of the large instances of the m6g/m7g/m8g/m9g instance families."
    src="/assets/images/blog/aws-graviton5-benchmarks/cpu-specs.png"/>
  <p>CPU specs of the <code>2xlarge</code> instances of four Graviton families</p>
</div>

Besides the higher frequency, this increase in CPU cache capacity can be beneficial for many workloads: AWS stated that the "chip includes a 5x larger L3 cache" and that "each Graviton5 core has access to 2.6x more L3 cache than Graviton4", while we saw a \~50% increase in the L3 cache amount at this server size.

Note that when looking at the recent `metal` versions, there's indeed a 73728 KiB -> 196608 KiB jump in that metric, all 192 no-HT CPU cores divided into two symmetric NUMA nodes, each with 96-96 vCPUs sharing over 96 MiB L3 cache ([m9g.metal-49xl](https://sparecores.com/server/aws/m9g.metal-48xl)):

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    title="CPU and System Topology of m9g.metal-48xl."
    alt="CPU and System Topology of m9g.metal-48xl."
    src="/assets/images/blog/aws-graviton5-benchmarks/lstopo.png"/>
  <p>CPU and System Topology of <code>m9g.metal-48xl</code></p>
</div>

Fun fact: the 2MiB private L2 cache per core adds up to a massive 384 MiB .. actually over the aggregate L3 cache amount (192 MiB).

The other highly visible change in the specs is related to the network card's speed:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    title="Memory and Network specs of the 2xlarge instances of four Graviton families."
    alt="Memory and Network specs of the 2xlarge instances of four Graviton families."
    src="/assets/images/blog/aws-graviton5-benchmarks/memory-and-network.png"/>
  <p>Memory and network specs of the <code>2xlarge</code> Graviton instances</p>
</div>

This is all in sync with the AWS announcement: "with up to 15% higher network bandwidth and 20% higher EBS bandwidth on average across instance sizes, and up to twice the network bandwidth for the largest instances".

## Pricing & Cost Efficiency

One of the most important bits! By default, we show the best on-demand and spot prices for all selected instance types across the globe, so sometimes preferring some of the less mainstream regions with lower prices:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    title="Pricing and CPU score of the m6g.2xlarge, m7g.2xlarge, m8g.2xlarge, and m9g.2xlarge instances"
    alt="Pricing and CPU score of the m6g.2xlarge, m7g.2xlarge, m8g.2xlarge, and m9g.2xlarge instances"
    src="/assets/images/blog/aws-graviton5-benchmarks/pricing-and-cpu-score.png"/>
  <p>Pricing and CPU score of the <code>m(6|7|8|9)g.2xlarge</code> instances</p>
</div>

The new generation instance is a massive winner when looking at both the single-core and multi-core "SCore" (basically a CPU-only stressing metric of `div16` ops): 16.5% improvement in the single-core, and 17.5% boost over the multi-core score at the same number of vCPUs.

But the price increase is also steep in the above table: while you can get the previous-gen instance sizes at 20-25 US cents per hour (on-demand), the most recent generation costs close to 40 US cents per hour at this instance size .. but note the difference in the related AWS regions: the newest generation is only available in 3 US and 1 EU regions. A fairer comparison is looking at the prices in the same (N. Virginia) region:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    title="Pricing and CPU score of the m6g.2xlarge, m7g.2xlarge, m8g.2xlarge, and m9g.2xlarge instances in the us-east-1 region"
    alt="Pricing and CPU score of the m6g.2xlarge, m7g.2xlarge, m8g.2xlarge, and m9g.2xlarge instances in the us-east-1 region"
    src="/assets/images/blog/aws-graviton5-benchmarks/pricing-and-cpu-score-useast1.png"/>
  <p>Pricing and CPU scores in the same example region (<code>us-east-1</code>)</p>
</div>

Now this is much more promising: the \~39 US cents of the newest gen compares to the 31-36 US cents of the previous gens at much better performance, overall resulting in higher "$Core" (SCore divided by the price showing the amount of SCore you can buy with $1/hr), so higher performance at the unit price. The low spot prices for previous-gen instances at various regions are still tempting, though -- when there's actually related capacity.

## Benchmarks

We have run \~500 benchmark workloads across all these instance families and sizes, including memory bandwidth measurements, OpenSSL speed of hash functions and block ciphers, static web serving, key/value database operations, LLM inference speed, and general benchmarking suites -- such as GeekBench or PassMark. You can find all the related data and charts in the above URLs, but highlighting a few:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    title="Memory bandwidth measurements of the m6g.2xlarge, m7g.2xlarge, m8g.2xlarge, and m9g.2xlarge instances"
    alt="Memory bandwidth measurements of the m6g.2xlarge, m7g.2xlarge, m8g.2xlarge, and m9g.2xlarge instances"
    src="/assets/images/blog/aws-graviton5-benchmarks/memory-bandwidth.png"/>
  <p>Memory bandwidth measurements of the Graviton instances</p>
</div>

The newest gen is the clear winner for all read, write, and mixed operations in terms of memory bandwidth at lower block sizes, but surprisingly underperforms previous generations when the block size reaches the L3 cache size, so the CPU is forced to interact with RAM. This might be valid due to the dual-NUMA design, or a methodology detail, so to confirm this, we not only run `bw_mem` from LMbench, but also our tailored tool ([sc-membench](https://www.reddit.com/r/linux/comments/1qog3qc/modern_memory_bandwidth_and_latency_benchmarks/)) that scales better with many CPU cores and complex NUMA architectures. Unfortunately, we don't yet have the related measurements for the previous gen instances due to funding (we would need to spin up already benchmarked servers again) -- I will follow up on this later. PS If you are from AWS, I appreciate any help with cloud credits for future measurements, as benchmarking thousands of instance types at scale is an expensive pleasure 😊

Benchmarking suites, such as PassMark, show the newest gen instance winning across the board with 16-50% performance improvement, even when comparing to the recent `m8g.2xlarge`:

||m6g.2xlarge|m7g.2xlarge|m8g.2xlarge|m9g.2xlarge|
|:-|:-|:-|:-|:-|
|String Sorting|22.87K|31.62K|37.11K|43.05K|
|Single Threaded|1.11K|1.57K|1.94K|2.46K|
|Prime Numbers|60.27|92.45|138.82|162.59|
|Integer Maths|31.57K|38.16K|41.72K|49.01K|
|Floating Point Maths|23.96K|37.94K|48.48K|61.26K|
|Extended Instructions|4.98K|6.64K|7.37K|10.80K|
|Encryption|1.08K|1.12K|1.50K|2.36K|
|Compression|37.73K|42.25K|53.12K|74.64K|
|**CPU Mark**|**5.22K**|**6.07K**|**7.68K**|**10.87K**|

The overall PassMark score shows that the performance has doubled since the `m6g` generation, and increased by 40% since the previous (`m8g`) gen.

The memory-related PassMark scores are similarly promising:

||m6g.2xlarge|m7g.2xlarge|m8g.2xlarge|m9g.2xlarge|
|:-|:-|:-|:-|:-|
|Memory Write|12.53K|19.66K|21.24K|24.93K|
|Memory Read Uncached|9.17K|18.70K|19.51K|23.80K|
|Memory Read Cached|9.48K|19.66K|21.17K|24.95K|
|Memory Latency|71.56|52.49|48.88|30.71|
|Database Operations|5.17K|8.04K|12.12K|14.92K|
|**Memory Mark**|**1.73K**|**2.87K**|**3.08K**|4.06K|

Note the massive reduction in the memory latency metric, which is well aligned with the AWS announcement. Overall, we measured 30+ percent improvement over the `m8g`.

Let's not forget about the elephant in the room of all tech articles/conference talks/restroom small talk conversations nowadays: LLM inference. Although CPU-only instances are usually not the best fit for serving LLMs, smaller models can perform at very reasonable speed for low-concurrency scenarios. That's what we measured by using `llama.cpp`:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    title="LLM inference (text processing and text generation) speed of the m6g.2xlarge, m7g.2xlarge, m8g.2xlarge, and m9g.2xlarge instances using gemma (2B)"
    alt="LLM inference (text processing and text generation) speed of the m6g.2xlarge, m7g.2xlarge, m8g.2xlarge, and m9g.2xlarge instances using gemma (2B)"
    src="/assets/images/blog/aws-graviton5-benchmarks/llm-inference.png"/>
  <p>LLM inference (text processing and text generation) speed of the <code>m(6|7|8|9)g.2xlarge</code> instances using gemma (2B)</p>
</div>

The `m9g` outperformed previous generations by far, and even managed to perform tasks that older-generation machines timed out on. Although the above screenshot is on Gemma (a 2B parameter LLM), these instances managed to also load and serve the 7B Llama model as well, with 20+ tokens/sec for prompt processing, and 15+ tokens/sec for text generation -- well over 30% improvement compared to `m8g`, and oftentimes 2-3x speed boost compared to `m6g`.

Due to the limit on the number of images one can include in a post, I will not share all the other benchmark results here (e.g. compression and OpenSSL algos, web serving or key/value database ops), but please check the above URLs -- I'm sure you will find some additional interesting data points there.

**Summary**

I know this has been a long post, so TL;DR:

>The new gen servers seem to deliver what it claimed in the announcement 😊

I hope you enjoyed this write-up and found the standardized data on 4 generations of Graviton useful -- please let me know in the comments below!

<hr />

PS This article was originally posted on the [*r/aws* subreddit](https://www.reddit.com/r/aws/comments/1u3yf9r/performance_evaluation_of_the_new_m9g_instance/) on June 12, 2026 -- but right after publishing, it was flagged NSFW and "removed by Reddit's filters". We still have no idea which benchmark score triggered that bot decision (probably still running on `m6g`) 🤐
