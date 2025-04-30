---
# ~50 chars
title: LLM Inference Speed Benchmarks
date: 2025-04-30
# ~100 character
teaser: We measured the prompt processing and text generation speed of different LLMs on 2000+ cloud servers.
# 320x220
image: /assets/images/blog/thumbnails/llm-inference-speed.webp
image_alt: Cover image of the Youtube video of the Architecture Weekly interview with Gergely and Attila.
author: Gergely Daroczi
tags: [benchmark, performance, score, llm, featured]
---

We had been planning to benchmark the prompt processing and text generation
speeds of various LLMs for some time, especially after our acceptance into the
[NVIDIA Inception Program](/article/nvidia-inception/). The final push came with
the announcement of the <a
href="https://community.cncf.io/events/details/cncf-kcd-budapest-presents-kcd-budapest-2025/"
target="_blank" rel="noopener">Kubernetes Community Days (KCD) in Budapest</a>.
We submitted a talk proposal promising to benchmark inference speeds on over
2000 cloud servers, which was accepted! This motivated us to accelerate our
related work at last to meet the deadline.

## Infrastructure

We already had the core infrastructure in place to run containerized benchmarks
on any or all of our ~2300 supported cloud servers:

- **<a href="https://www.pulumi.com/" target="_blank" rel="noopener">Pulumi</a> templates**
  (in our `sc-runner` repo) to provision and tear down servers and the related
  storage, network environment, etc.
- **Multi-architecture Docker images** built via GitHub Actions in our `sc-images` repository.
- **Task definitions** in our `sc-inspector` Python module to orchestrate `sc-runner`.
- **Raw-result storage** in the open, copyleft-licensed `sc-inspector-data` repo.
- **ETL & publishing** via the open-source `sc-crawler` Python package into our copyleft-licensed `sc-data` repository.

So at that point, it seemed all we needed to do was:

1. Build a Docker image in `sc-images`.
2. Add a few lines of task definition in `sc-inspector`.
3. Configure `sc-crawler` to structure the data to be automatically published in `sc-data`.

And that should have been it ... well, almost.

## Serving LLMs in a Heterogeneous Environment

The primary challenge was serving LLMs across a heterogeneous environment,
ranging from tiny machines with less than 1GB of RAM to large servers featuring
terabytes of RAM, hundreds of CPU cores, and sometimes multiple powerful GPUs
from various manufacturers with differing drivers.

Our initial search focused on an LLM serving framework capable of running
inference on both CPUs and GPUs with minimal fine-tuning, ensuring compatibility
across all our supported cloud servers. After evaluating several options, we
settled on <a href="https://github.com/ggml-org/llama.cpp" target="_blank"
rel="noopener">Georgi Gerganov's excellent `llama.cpp`</a>. This lightweight and
fast inference engine for large language models, written in C and C++, offers
several key advantages:

- It supports both CPU and GPU inference.
- It benefits from a very active development community, is constantly improving,
  and is widely adopted.
- It features a robust CI/CD pipeline that builds container images for multiple
  architectures, including `x86_64` and `ARM64`, and even provides a CUDA build.
- It utilizes GGML, providing optimized builds for a wide range of CPU
  microarchitectures (e.g., from Intel Sandy Bridge to Sapphire Rapids).
- It includes a configurable benchmarking script (`llama-bench`) for measuring
  inference speed across repeated text generation or prompt processing runs.

While `llama.cpp` provides separate Docker images for CPU and CUDA support, our
goal was a single image compatible with all supported architectures. To achieve
this, we created a new image bundling both binaries from the CPU and CUDA
builds, along with extracting their
<a href="https://github.com/SpareCores/sc-images/blob/main/images/benchmark-llm/extract-shared-cpu-libs.sh"
target="_blank" rel="noopener">shared libraries</a> from the parent images.
We also included a wrapper script to
<a href="https://github.com/SpareCores/sc-images/blob/main/images/benchmark-llm/benchmark.py#L113C26-L114C1"
target="_blank" rel="noopener">select the appropriate backend at runtime</a>.

## Large Language Models

To provide a comprehensive benchmark, we selected a wide range of popular LLMs with varying sizes and capabilities:

<table>
  <thead>
    <tr>
      <th>Model</th>
      <th>Parameters</th>
      <th style="text-align: center;">File Size</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>SmolLM-135M.Q4_K_M.gguf</td>
      <td class="param-size"><span class="num">135</span><span class="unit">M</span></td>
      <td class="file-size"><span class="num">100</span><span class="unit">MB</span></td>
    </tr>
    <tr>
      <td>qwen1_5-0_5b-chat-q4_k_m.gguf</td>
      <td class="param-size"><span class="num">500</span><span class="unit">M</span></td>
      <td class="file-size"><span class="num">400</span><span class="unit">MB</span></td>
    </tr>
    <tr>
      <td>gemma-2b.Q4_K_M.gguf</td>
      <td class="param-size"><span class="num">2</span><span class="unit">B</span></td>
      <td class="file-size"><span class="num">1.5</span><span class="unit">GB</span></td>
    </tr>
    <tr>
      <td>llama-7b.Q4_K_M.gguf</td>
      <td class="param-size"><span class="num">7</span><span class="unit">B</span></td>
      <td class="file-size"><span class="num">4</span><span class="unit">GB</span></td>
    </tr>
    <tr>
      <td>phi-4-q4.gguf</td>
      <td class="param-size"><span class="num">14</span><span class="unit">B</span></td>
      <td class="file-size"><span class="num">9</span><span class="unit">GB</span></td>
    </tr>
    <tr>
      <td>Llama-3.3-70B-Instruct-Q4_K_M.gguf</td>
      <td class="param-size"><span class="num">70</span><span class="unit">B</span></td>
      <td class="file-size"><span class="num">42</span><span class="unit">GB</span></td>
    </tr>
  </tbody>
</table>

We used quantized models, which are smaller and faster to load into memory,
covering model sizes ranging from a hundred million parameters to 70 billion
parameters.

Starting each machine from a clean state required downloading our combined
container image (~7 GB) and then the selected models (~60 GB). This meant
benchmarks needed to run on machines with at least 75 GB of disk space.

Keeping costs under control was also crucial. For example, downloading the
largest model (~42 GB) on a small machine with limited bandwidth could take
over an hour, potentially failing due to memory constraints.

To manage this, we started downloading models sequentially, ordered by their
expected size. Once a model was downloaded, we marked it as ready for
benchmarking. Models were then evaluated sequentially. If the measured inference
speed for a model fell below a predefined threshold, we stopped the benchmark
for that model. If it was feasible to run the next model in the sequence, we
moved on; otherwise, we stopped the process if either the ongoing download speed
or the expected inference speed was below a threshold.

## Cost Control

These thresholds were dynamic and based on the task (prompt processing or text
generation) and the token length of the input/output. For instance, a threshold
of 1 token per second might be acceptable for generating short text, but it's
not practical for batch processing 32k token length inputs, which would require
much faster speed (e.g. at least 1000 tokens/second). This dynamic approach
ensured we kept runtime and related costs under control.

After applying these compromises to keep the overall budget below $10k, we ended
up with the following cost breakdown per vendor:

<table>
<thead>
  <tr>
  <th>
    <b>Vendor</b>
  </th>
  <th style="text-align: right; padding-right: 10px;">
    <b>Cost</b>
  </th>
  </tr>
</thead>
<tr><td>AWS</td><td class="cost-value"><span class="num">2153.68</span> <span class="unit">USD</span></td></tr>
<tr><td>GCP</td><td class="cost-value"><span class="num">696.9</span> <span class="unit">USD</span></td></tr>
<tr><td>Azure</td><td class="cost-value"><span class="num">8036.71</span> <span class="unit">USD</span></td></tr>
<tr><td>Hetzner</td><td class="cost-value"><span class="num">8.65</span> <span class="unit">EUR</span></td></tr>
<tr><td>Upcloud</td><td class="cost-value"><span class="num">170.21</span> <span class="unit">EUR</span></td></tr>
</table>

Overall, we spent well over $10k on this project. We experienced unexpected
costs at Azure due to instances not being terminated as expected, but
fortunately, these were covered by generous cloud credits from vendors.
We gratefully acknowledge their support!

## Coverage and Limitations

We managed to successfully run the benchmarks on 2106 cloud servers out of the
currently tracked 2343 servers of 5 vendors (as of April 30, 2025) with different
CPU architectures and configurations:

```sh
[sc-inspector-data]$ find . -name meta.json -path "*llm*" | \
  xargs jq -cr 'select(.exit_code == 0)' | \
  wc -l
2106
```

Although we are still attempting to evaluate the remaining \~235 servers, the
likelihood of evaluating all of them is low due to:

- Quota limits imposed by vendors (see our <a href="/debug" target="_blank" rel="noopener">debug page</a> for more details per vendor).
- Insufficient memory (less than 1 GiB) to load even the smallest model.
- Insufficient storage (less than 75 GiB) that cannot be easily extended (e.g., cloud server plans with fixed disk size).
- The server type having been deprecated by the vendor.

It's also important to note that while we successfully ran `llama.cpp` on most
servers, performance was not always optimized. For example, if a server had a
non-NVIDIA GPU, we could not utilize it for inference benchmarks because it was
incompatible with the CUDA build of `llama.cpp`. Similarly, some NVIDIA cards
(e.g., T4G) were incompatible due to driver versions. In these specific cases,
we defaulted to using the CPU for the benchmarks.

Finally, although `llama.cpp` can utilize multiple GPUs, this primarily aids
with larger LLMs by helping load all layers into VRAM. Smaller models that
easily fit on a single GPU's memory do not significantly benefit from having
multiple GPUs. To potentially improve this, we could extend the current
implementation to start multiple instances of the benchmarking script on the
same machine. However, as this would involve significant heuristics, we decided
to keep the approach simple (and more reliable) for now.

## Results

Overall, we evaluated more than 2000 servers and ran prompt processing and text
generation tasks using 1-6 LLMs (depending on the amount of memory or VRAM) with
various token lengths and input/output sizes, resulting in almost 75k data
points.

Counting the number of servers successfully evaluated per model using our
<a href="https://sc-data-public-40e9d310.s3.amazonaws.com/sc-data-all.db.bz2" target="_blank" rel="noopener">live database dump</a> (36 MB SQLite file):

```sql
WITH models as (
  SELECT DISTINCT vendor_id, server_id, json_extract(config, '$.model') AS model
  FROM benchmark_score
  WHERE benchmark_id LIKE 'llm_%')
SELECT model, COUNT(*)
FROM models
GROUP BY 1
ORDER BY 2 DESC;
```

Results of the above query as per April 30, 2025:

| model                                | COUNT(*) |
|--------------------------------------|----------|
| SmolLM-135M.Q4_K_M.gguf              | 2086     |
| qwen1_5-0_5b-chat-q4_k_m.gguf        | 1962     |
| gemma-2b.Q4_K_M.gguf                 | 1883     |
| llama-7b.Q4_K_M.gguf                 | 1713     |
| phi-4-q4.gguf                        | 1448     |
| Llama-3.3-70B-Instruct-Q4_K_M.gguf   | 1229     |

Thus, depending on your LLM inference needs, some servers might be unsuitable
right away when using larger models.

To navigate this dataset

TODO sc-www component walkthgouth with embedded charts

## Next Steps

We hope that this benchmark helps you make an informed decision when choosing
the right server type(s) for your LLM serving use case! If you have any
questions, concerns, or suggestions, please leave a message in the comment
section below, or
<a href="https://calendly.com/spare-cores/30min" target="_blank" rel="noopener">
schedule a call with us</a> to discuss your needs.
