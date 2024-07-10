---
# ~50 chars
title: A closer look at Hetzner Cloud's new CX servers
date: 2024-07-11
# ~100 character
teaser: Cheaper and better performance compared to the previous generation of shared Intel® Xeon® vCPU plans?
# 320x220
image: /assets/images/blog/thumbnails/hetzner.jpg
image_alt: Hetzner Cloud's CX server family media photo taken from Hetzner.com
author: Gergely Daroczi
tags: [benchmark, performance, score, compute power, hcloud]
---

Hetzner Cloud <a href="https://www.hetzner.com/news/new-cx-plans/" target="_blank" rel="noopener">announced</a>
new cloud plans in the CX line last month, and they also scheduled the deprecation
of the previous generation of the CX servers by the end of the summer,
so we were eager to look at the price and expected performance details of
the old and the new servers at the same time, while we can.

Spare Cores makes it easy to compare the pricing, hardware features and
benchmark scores of any number of servers by selecting those
on our <a href="/servers" target="_blank">server listing pages</a>
(optionally after filtering for e.g. the Hetzner Cloud servers,
and enabling to also show inactive servers), then clicking the "Compare" button.
To get you there faster, we have clicked around
and hereby sharing the direct link to the <a href="/compare?instances=W3sidmVuZG9yIjoiaGNsb3VkIiwic2VydmVyIjoiY3gyMSJ9LHsidmVuZG9yIjoiaGNsb3VkIiwic2VydmVyIjoiY3gyMiJ9LHsidmVuZG9yIjoiaGNsb3VkIiwic2VydmVyIjoiY3B4MTEifSx7InZlbmRvciI6ImhjbG91ZCIsInNlcnZlciI6ImNheDExIn0seyJ2ZW5kb3IiOiJoY2xvdWQiLCJzZXJ2ZXIiOiJjY3gxMyJ9XQ%3D%3D" target="_blank">comparison page of all `hcloud` servers with 2 vCPUs and 2-4 GiB of memory</a>
(you can find some screenshots included from that page below).

## Pricing

Looking at the price change between the lowest end CX servers, it is
trivial to see the good news: CX22 costs only 0.0052 EUR, while
CX21 used to cost 0.0079 EUR per hour (not including VAT and the
optional IPv4 pricing):

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    title="Pricing and CPU features comparison"
    alt="Pricing and CPU features of Hetzner servers compared in a table (data collected an visualized by Spare Cores)"
    src="/assets/images/blog/hcloud-cx-cpu.webp"/>
  <p>Pricing and CPU features comparison</p>
</div>

That's a massive 35% cost reduction!

## General CPU performance

Still focusing on the first few lines of the above comparison table,
you can also see that the new CX22 server offers ~10% better
performance compared to CX21 based on both the single-core and
multi-core Spare Cores Scores (`SCore`), so when looking at the price
per performance (`$Core`), the upgrade is even more visible: there's a
boost from around 250k/USD to 400k/USD.

Although these derived metrics depend on many uncontrollable factors,
such as the USD/EUR exchange rate (as "performance per price" is always
standardized to USD at Spare Cores), or the load of other virtual
servers running on the same hosts -- repeating the benchmarks on different
times of the day resulted in very similar scores, and overall results
proved to be relatively reliable. We also plan to blog about running benchmarks
on parallel virtual machines and for longer time periods to try to control for the
neighboring nodes, but more on that later.

## Hardware features

Looking at the CPU features of CX21 and CX22, there are no visible
differences: both are using shared logical CPU cores of the Intel®
Xeon® Gold family. We have included a few extra Hetzner Cloud nodes
with 2 AMD vCPUs and 2-4 GiB of memory to be able to compare the
similar instance types from the other product lines as well. Note that
the CCX13 comes with a dedicated CPU core, unlike any other above-listed
servers.

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    title="Memory, storage and network features comparison"
    alt="Memory, storage and network features of Hetzner servers compared in a table (data collected an visualized by Spare Cores)"
    src="/assets/images/blog/hcloud-cx-memory-storage.webp"/>
  <p>Memory, storage and network features comparison</p>
</div>

Looking at the related memory, storage and network offerings, there is
a difference in the amount of memory (the CPX11 comes with
only 2 GiB and the CCX13 comes with 8 GiB of memory), but as most
benchmarks depend on the CPU's performance without much impact from
the available memory amount, we assume the below comparisons to be still useful.

Note that the memory module details are rather incomplete in the above table,
e.g. memory speed or the memory modules' generation (such as `DDR4` VS `DDR5`)
are not listed, because although we run hardware inspector tools on the machines,
but the hypervisor (QEMU in this case) hides that information from us.

## Benchmarks

Now the more interesting part!

Let's start by looking at the Geekbench overall scores and the various
benchmarking workloads both when running on a single core, or all (two)
available cores:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    title="Geekbench benchmarks"
    alt="Geekbench benchmark scores of Hetzner servers compared in a radar chart (data collected an visualized by Spare Cores)"
    src="/assets/images/blog/hcloud-cx-geekbench.webp"/>
</div>

The massive advantage of the dedicated physical CPU core of CCX13 is
clearly visible on the single-core results, but when running the benchmarks
on multiple threads, using hyper-threading on that single CPU core lowers
the difference from the other server types. However, the server with a
dedicated CPU is the clear winner of this round, with the CAX11 being the second.

When focusing on the difference between CX21 and CX22, we can confirm
the pattern previously seen with the `SCore` results: the new server offering
has a bit of performance advantage in almost all benchmarking workloads.

CX22 also consistently beats CX21 in our memory bandwidth benchmarks,
especially with larger block sizes:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    title="Memory bandwidth benchmarks"
    alt="Memory bandwidth benchmark scores of Hetzner servers compared in a line chart (data collected an visualized by Spare Cores)"
    src="/assets/images/blog/hcloud-cx-memory-bandwidth.webp"/>
</div>

And CX22 is the winner again when looking at the speed of various
OpenSSL hash functions and block ciphers:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    title="OpenSSL benchmarks"
    alt="OpenSSL benchmark scores of Hetzner servers compared in a barchart (data collected an visualized by Spare Cores)"
    src="/assets/images/blog/hcloud-cx-openssl.webp"/>
</div>

If you are interested in seeing the actual numbers, click on the "Show details"
button to expand the benchmark scores in a table:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    title="OpenSSL benchmarks"
    alt="OpenSSL benchmark scores of Hetzner servers compared in a table (data collected an visualized by Spare Cores)"
    src="/assets/images/blog/hcloud-cx-openssl-table.webp"/>
</div>

Last but not least, we can see clearly visible differences in speed of
compression algos between the listed servers:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    title="Compression algo benchmarks"
    alt="Compression algo benchmark scores of Hetzner servers compared in a line chart (data collected an visualized by Spare Cores)"
    src="/assets/images/blog/hcloud-cx-compression.webp"/>
</div>

## Summary

Overall, even after acknowledging the precision and reliability of the
actual benchmark scores, we saw a clear trend and very plausible
performance boost in the new CX products at a cheaper price 🙌

## Further reading

You can read more about the above-mentioned benchmarking methods in our
<a href="/article/cloud-compute-performance-benchmarks" target="_blank">"
Unlocking Cloud Compute Performance" blog post</a>.

Another blog post is currently being worked on to analyze the
variability of the above-presented performance scores by running the
benchmarks on multiple independent virtual servers at the same time,
also for a longer period (at least a day) -- once available, this post will be updated.

Pairwise comparison of the larger CX servers:

- <a href="/compare?instances=W3sidmVuZG9yIjoiaGNsb3VkIiwic2VydmVyIjoiY3gzMiJ9LHsidmVuZG9yIjoiaGNsb3VkIiwic2VydmVyIjoiY3g0MSJ9XQ%3D%3D" target="_blank">4 VCPUs</a>
- <a href="/compare?instances=W3sidmVuZG9yIjoiaGNsb3VkIiwic2VydmVyIjoiY3g1MiJ9LHsidmVuZG9yIjoiaGNsb3VkIiwic2VydmVyIjoiY3g1MSJ9LHsidmVuZG9yIjoiaGNsb3VkIiwic2VydmVyIjoiY3g0MiJ9XQ%3D%3D" target="_blank">8+ VCPUs</a>
