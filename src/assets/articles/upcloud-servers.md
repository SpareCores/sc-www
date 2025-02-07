---
# ~50 chars
title: Welcome 67 new server types from UpCloud!
date: 2025-02-06
# ~100 character
teaser: Excited to share the detailed hardware specs and performance data on UpCloud's all predefined server types.
# 320x220
# cropped from https://upcloud.com/free-migration-upcloud
image: /assets/images/blog/thumbnails/upcloud-banner.webp
image_alt: Clipart of rack servers with gauges and sliders. This images was copied from UpCloud's website.
author: Gergely Daroczi
tags: [benchmark, performance, score, compute power, upcloud, vendor]
---

We are thrilled to announce that
<a href="https://upcloud.com/" target="_blank" rel="noopener noreferrer">UpCloud</a>
has recently been integrated into the Spare Cores ecosystem — joining other
major cloud providers like AWS, GCP, Azure, and
[Hetzner](/article/hetzner-new-cx-servers), and all the UpCloud predefined
server types are now available in our public cloud server listings with detailed
hardware specs and performance data!

## Integration Details

The integration was a collaborative effort between the Spare Cores and UpCloud
teams, and we highly appreciate their support! Here's what happened if you are
interested in the actual implementation details:

1. **SKUs Listing:** We integrated UpCloud's API into our
   [Crawler](https://github.com/sparecores/sc-crawler) to enable it to query the
   list of predefined server types and their high-level specifications from
   UpCloud. Utilizing UpCloud's Python SDK for their API was straightforward.
2. **Data Pipeline**: The Crawler runs on an hourly basis in our [Data
   repository](https://github.com/sparecores/sc-data) to look for new, updated,
   or deprecated server types at all supported vendors.
3. **Pulumi Templates:** We developed UpCloud-specific Pulumi templates in our
   [Runner](https://github.com/sparecores/sc-runner) component to facilitate
   server creation and deletion, including related cloud resources. As UpCloud
   already had a Pulumi provider in Python, this process was quite
   straightforward.
4. **Account Creation:** UpCloud generously provided us with ample cloud credits
   and extended our quotas, allowing us to start all their server types for
   benchmarking, even in parallel, including their largest public node type with
   80 vCPUs and 512 GiB of RAM 😻.
5. **Benchmarking**: The [Inspector](https://github.com/sparecores/sc-inspector)
   continuously scans our database for servers with missing performance data and
   runs the necessary benchmarks as needed.
6. **Results:** The results are automatically published in our SQLite database
   files, public APIs, and webpage.

## Server Families

UpCloud currently offers five server families in three major categories:

- **Developer:** Ideal for smaller projects (99.99% SLA) with complimentary
  network traffic and an IPv4 address.
- **General Purpose**: General Purpose, High CPU and High Memory configurations
  with higher (100%) SLA, network and IPv4 address included, better storage
  performance.
- **Cloud Native**: Highest compute performance and high (100%) SLA, flexible
  storage, network traffic included, but IPv4 comes at an extra cost. Ideal for
  containerized workloads.

We were interested in the actual performance difference of these configuration
options, so first we compared all their server types in the 2 vCPU segment,
where both the Developer and Cloud Native families are available.

## 2 vCPU UpCloud Servers

There are 10 options with 2 vCPUs, ranging from 2 GiB to 16 GiB RAM:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    alt="Table of UpCloud's 2 vCPU server types from sparecores.com/servers."
    src="/assets/images/blog/upcloud-listing-2vcpu.webp"/> 
</div>
<p style="margin: 0px 50px 20px 50px; text-align: center; color: #999;">Image source: <a href="/servers?vcpus_min=2&vcpus_max=2&vendor=upcloud&order_by=min_price&order_dir=asc&columns=1263240" target="_blank">Spare Cores server listing</a>.</p>

All these server options come with the same CPU model (AMD EPYC 7542), resulting
in similar SCore ("Spare Cores Score") values. The SCore represents the number
of `div16` operations using the `stress-ng` CPU stress testing tool, which we
use as a proxy for raw CPU performance. For more details, check out our
[Performance metrics](/article/cloud-compute-performance-benchmarks) blog post.

In less synthetic benchmarks, we also observe very similar performance, with
slight differences due to varying memory configurations. For example, in the
multi-core Geekbench benchmarks:

<iframe
   src="https://sparecores.com/embed/compare/geekbench_multi?instances=W3siZGlzcGxheV9uYW1lIjoiREVWLTJ4Q1BVLTRHQiIsInZlbmRvciI6InVwY2xvdWQiLCJzZXJ2ZXIiOiJERVYtMnhDUFUtNEdCIiwiem9uZXNSZWdpb25zIjpbXX0seyJkaXNwbGF5X25hbWUiOiJERVYtMnhDUFUtOEdCIiwidmVuZG9yIjoidXBjbG91ZCIsInNlcnZlciI6IkRFVi0yeENQVS04R0IiLCJ6b25lc1JlZ2lvbnMiOltdfSx7ImRpc3BsYXlfbmFtZSI6IkRFVi0yeENQVS0xNkdCIiwidmVuZG9yIjoidXBjbG91ZCIsInNlcnZlciI6IkRFVi0yeENQVS0xNkdCIiwiem9uZXNSZWdpb25zIjpbXX0seyJkaXNwbGF5X25hbWUiOiIyeENQVS0yR0IiLCJ2ZW5kb3IiOiJ1cGNsb3VkIiwic2VydmVyIjoiMnhDUFUtMkdCIiwiem9uZXNSZWdpb25zIjpbXX0seyJkaXNwbGF5X25hbWUiOiIyeENQVS00R0IiLCJ2ZW5kb3IiOiJ1cGNsb3VkIiwic2VydmVyIjoiMnhDUFUtNEdCIiwiem9uZXNSZWdpb25zIjpbXX0seyJkaXNwbGF5X25hbWUiOiJISU1FTS0yeENQVS04R0IiLCJ2ZW5kb3IiOiJ1cGNsb3VkIiwic2VydmVyIjoiSElNRU0tMnhDUFUtOEdCIiwiem9uZXNSZWdpb25zIjpbXX0seyJkaXNwbGF5X25hbWUiOiJISU1FTS0yeENQVS0xNkdCIiwidmVuZG9yIjoidXBjbG91ZCIsInNlcnZlciI6IkhJTUVNLTJ4Q1BVLTE2R0IiLCJ6b25lc1JlZ2lvbnMiOltdfSx7ImRpc3BsYXlfbmFtZSI6IkNMT1VETkFUSVZFLTJ4Q1BVLTRHQiIsInZlbmRvciI6InVwY2xvdWQiLCJzZXJ2ZXIiOiJDTE9VRE5BVElWRS0yeENQVS00R0IiLCJ6b25lc1JlZ2lvbnMiOltdfSx7ImRpc3BsYXlfbmFtZSI6IkNMT1VETkFUSVZFLTJ4Q1BVLThHQiIsInZlbmRvciI6InVwY2xvdWQiLCJzZXJ2ZXIiOiJDTE9VRE5BVElWRS0yeENQVS04R0IiLCJ6b25lc1JlZ2lvbnMiOltdfSx7ImRpc3BsYXlfbmFtZSI6IkNMT1VETkFUSVZFLTJ4Q1BVLTE2R0IiLCJ2ZW5kb3IiOiJ1cGNsb3VkIiwic2VydmVyIjoiQ0xPVUROQVRJVkUtMnhDUFUtMTZHQiIsInpvbmVzUmVnaW9ucyI6W119XQ=="
   style="height: 750px; width: 650px; border: 1px solid #34d399; border-radius: 8px; min-height: 400px">
</iframe>

The lower scores belong to the 4 GiB RAM configurations.

## Larger node types at UpCloud

When examining higher-scale models, the Developer plan is no longer available,
but other CPU models are accessible. For instance, in the 16 vCPU
configurations, both the AMD EPYC 7542 and 7543 are available. Although the
newer generation CPU has the same CPU flags/features, it operates at a higher
base clock speed and can achieve higher boost frequencies, translating to better
performance, even in memory bandwidth benchmarks:

<iframe
   src="https://sparecores.com/embed/compare/bw_mem?instances=W3siZGlzcGxheV9uYW1lIjoiSElDUFUtMTZ4Q1BVLTMyR0IiLCJ2ZW5kb3IiOiJ1cGNsb3VkIiwic2VydmVyIjoiSElDUFUtMTZ4Q1BVLTMyR0IiLCJ6b25lc1JlZ2lvbnMiOltdfSx7ImRpc3BsYXlfbmFtZSI6IjE2eENQVS02NEdCIiwidmVuZG9yIjoidXBjbG91ZCIsInNlcnZlciI6IjE2eENQVS02NEdCIiwiem9uZXNSZWdpb25zIjpbXX0seyJkaXNwbGF5X25hbWUiOiJDTE9VRE5BVElWRS0xNnhDUFUtMzJHQiIsInZlbmRvciI6InVwY2xvdWQiLCJzZXJ2ZXIiOiJDTE9VRE5BVElWRS0xNnhDUFUtMzJHQiIsInpvbmVzUmVnaW9ucyI6W119XQ==" 
   style="height: 500px; width: 100%; border: 1px solid #34d399; border-radius: 8px; min-height: 400px">
</iframe>

Scaling up to the largest nodes grants access to the AMD EPYC 9354 Zen 4 gen
CPU, which significantly boosts performance due to a higher base clock speed,
larger CPU caches, and more powerful CPU instructions, such as AVX-512. A good
example might be compression workloads:

<iframe
   src="https://sparecores.com/embed/compare/compress?instances=W3siZGlzcGxheV9uYW1lIjoiODB4Q1BVLTUxMkdCIiwidmVuZG9yIjoidXBjbG91ZCIsInNlcnZlciI6IjgweENQVS01MTJHQiIsInpvbmVzUmVnaW9ucyI6W119LHsiZGlzcGxheV9uYW1lIjoiQ0xPVUROQVRJVkUtODB4Q1BVLTUxMkdCIiwidmVuZG9yIjoidXBjbG91ZCIsInNlcnZlciI6IkNMT1VETkFUSVZFLTgweENQVS01MTJHQiIsInpvbmVzUmVnaW9ucyI6W119XQ==" 
   style="height: 600px; width: 100%; border: 1px solid #34d399; border-radius: 8px; min-height: 600px">
</iframe>

Note that Spare Cores reports on all available CPU flags and features of all
monitored servers, so if you have specific needs for a task, we can help you
find the right server type for your use case.

## Competitors

How does UpCloud compare to other cloud providers? We have updated our
comparison lists of the best multi-core and single-core performance servers on
our main [Server Comparison](/compare) page with the UpCloud offerings.

In general, when considering the older generation Zen CPUs, the SCore values are
not the strongest in the competition. However, the Cloud Native plans offer a
very good performance/price ratio, especially in PassMark workloads, such as
encryption or compression, or some memory read operations.

It's also important to highlight that all UpCloud plans come with dedicated CPU
cores, meaning the cores are not shared with other virtual machines. They are
not limited by boost credits, and the reported virtual processor cores represent
actual physical cores, not hyper-threaded logical cores, which is a significant
advantage compared to Intel-based cloud servers. As a quick example, here's a
comparison of UpCloud's 4-vCPU Cloud Native plan with four generations of 4-vCPU
AWS servers with mixed Intel and ARM CPUs:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    alt="PassMark benchmarks comparing UpCloud's 4-vCPU Cloud Native plan with four generations of 4-vCPU AWS servers."
    src="/assets/images/blog/upcloud-vs-aws-gens.webp"/> 
</div>
<p style="margin: 0px 50px 20px 50px; text-align: center; color: #999;">Data source: <a href="/compare?instances=W3siZGlzcGxheV9uYW1lIjoiYzUubGFyZ2UiLCJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJjNS5sYXJnZSIsInpvbmVzUmVnaW9ucyI6W119LHsiZGlzcGxheV9uYW1lIjoiYzZnLmxhcmdlIiwidmVuZG9yIjoiYXdzIiwic2VydmVyIjoiYzZnLmxhcmdlIiwiem9uZXNSZWdpb25zIjpbXX0seyJkaXNwbGF5X25hbWUiOiJjN2cubGFyZ2UiLCJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJjN2cubGFyZ2UiLCJ6b25lc1JlZ2lvbnMiOltdfSx7ImRpc3BsYXlfbmFtZSI6ImM3aS5sYXJnZSIsInZlbmRvciI6ImF3cyIsInNlcnZlciI6ImM3aS5sYXJnZSIsInpvbmVzUmVnaW9ucyI6W119LHsiZGlzcGxheV9uYW1lIjoiQ0xPVUROQVRJVkUtMnhDUFUtNEdCIiwidmVuZG9yIjoidXBjbG91ZCIsInNlcnZlciI6IkNMT1VETkFUSVZFLTJ4Q1BVLTRHQiIsInpvbmVzUmVnaW9ucyI6W119XQ%3D%3D" target="_blank">Spare Cores comparison</a>.</p>

When evaluating the price, it's also useful to note that UpCloud's pricing
includes generous outgoing (egress) traffic, which is not the case with most
other providers. An IPv4 address is also included in the price for most UpCloud
plans, for which all other providers charge an extra fee ranging from 0.5 to 4
USD/month.

If you need custom configurations, UpCloud supports any combination of vCPUs and
memory amounts with flexible storage, so you are not limited to the predefined
server types mentioned above. This can be a great benefit for those who need to
run specific workloads.

## Final Thoughts

First of all, we are grateful to UpCloud for their support and for making their
servers available for benchmarking! This is a great addition to our ecosystem,
and we look forward to seeing more cloud providers join us.

If you missed something in this post or have any questions, please let us know
in the comments below!

