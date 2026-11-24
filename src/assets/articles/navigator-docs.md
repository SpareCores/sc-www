---
# ~50 chars
title: The Spare Cores Navigator Has Docs
date: 2026-11-24
# ~100 character
teaser: A tour of the new Spare Cores Navigator docs, from a first API call to the benchmark methodology.
# 320x220
image: /assets/images/blog/thumbnails/navigator-docs.webp
image_alt: The Spare Cores Navigator docs site, with its Getting started page open.
author: [Adam Toth, Gergely Daroczi]
tags: [data, open-source]
---

We never really announced it, but the Spare Cores Navigator now has proper
docs at
<a href="https://docs.sparecores.com" target="_blank" rel="noopener">docs.sparecores.com</a>.
It has been exciting (and a bit tedious) to summarize what we worked on in
the past three years! 📚

But why does the Navigator exist at all? When we measured the 2-vCPU servers
of AWS alone, the fastest ([`m8azn.large`](/server/aws/m8azn.large)) was over
seven times as fast on a single core as the slowest
([`a1.large`](/server/aws/a1.large)), by PassMark's
<a href="https://docs.sparecores.com/benchmarks/passmark#passmark-cpu_single_threaded_test" target="_blank" rel="noopener">CPU Single Threaded Test</a>.
This is what I like to call the conceptual uncertainty of a vCPU 😊
The Navigator closes that visibility gap: our data holds the specs, prices,
and benchmark scores of 5,000+ server types across nine vendors, measured
the same way, and open to use.

The docs show how to put that data to work. Here is a quick tour.

## Start in Minutes

The
<a href="https://docs.sparecores.com/getting-started" target="_blank" rel="noopener">Getting started</a>
page gives you a first result in a few minutes, with or without writing code.
Pick your path: the Web UI, the HTTP API, the SQLite database, or an AI
assistant. For example, the three cheapest server types with at least
8 vCPUs and 32 GB of memory, by their on-demand price:

```shell
curl -G https://keeper.sparecores.net/servers \
  -d vcpus_min=8 \
  -d memory_min=32 \
  -d best_price_allocation=ONDEMAND_ONLY \
  -d limit=3
```

No API key is needed for this, nor for most other endpoints.

## Find and Compare Servers Without Code

The
<a href="https://docs.sparecores.com/web-ui" target="_blank" rel="noopener">Web UI user guide</a>
walks through the following on sparecores.com:

- <a href="https://docs.sparecores.com/web-ui/listings" target="_blank" rel="noopener">finding servers and databases</a>
- <a href="https://docs.sparecores.com/web-ui/compare" target="_blank" rel="noopener">comparing them</a>
- the <a href="https://docs.sparecores.com/web-ui/advisor" target="_blank" rel="noopener">Advisor</a>,
  which recommends servers for a workload compared to a server you use today
- <a href="https://docs.sparecores.com/web-ui/prices" target="_blank" rel="noopener">reading the prices</a>

## Build on the API

The
<a href="https://docs.sparecores.com/api" target="_blank" rel="noopener">API reference</a>
covers every endpoint and parameter, with a built-in client to try them right
from your browser. The
<a href="https://docs.sparecores.com/api/examples" target="_blank" rel="noopener">API examples</a>
go further, such as
<a href="https://docs.sparecores.com/api/examples#rank-servers-by-a-benchmark" target="_blank" rel="noopener">ranking servers by a benchmark</a>
(e.g. by single-core performance) or
<a href="https://docs.sparecores.com/api/examples#rank-servers-by-cost-efficiency" target="_blank" rel="noopener">by cost-efficiency</a>,
and the
<a href="https://docs.sparecores.com/api/news" target="_blank" rel="noopener">News</a>
page lists what changed in the API.

## The Whole Dataset in One File

If you'd rather analyze the data yourself, the whole database is available
as a single SQLite file. The
<a href="https://docs.sparecores.com/sqlite" target="_blank" rel="noopener">SQLite database</a>
page shows how to download it and query it with SQL, Python, or R, with
example queries for the following:

- the cheapest servers for given specs
- the fastest single core
- prices by continent
- the cost of LLM inference per token

Some of these examples are surprising even for us. For example, the clock
speed of a CPU tells little about how fast a core is: among the server types
listed at 2.2 GHz, the fastest single core was over 14 times as fast as the
slowest one, when we ran the query in November 2026.

The
<a href="https://docs.sparecores.com/schemas" target="_blank" rel="noopener">Schemas</a>
describe every table and column.

## How We Measure

The
<a href="https://docs.sparecores.com/benchmarks" target="_blank" rel="noopener">Benchmarks</a>
section describes each benchmark workload we run, from `stress-ng` and
PassMark to LLM inference speed and `pgbench`.

The
<a href="https://docs.sparecores.com/under-the-hood" target="_blank" rel="noopener">Under the hood</a>
section explains how the data is collected: how the
<a href="https://docs.sparecores.com/crawler" target="_blank" rel="noopener">Crawler</a>
pulls the vendors' products and prices, and how we start servers to inspect
their hardware and run the benchmarks in the
<a href="https://docs.sparecores.com/images" target="_blank" rel="noopener">container images</a>.
The image docs include the methodology details, and many also have a
Limitations section: what the benchmark does not measure, and where its
results need care. As described in our [Open Source Is Not Free](/article/open-source-is-not-free) article, all
of this is public, so you don't need to take our word for a number.

## For Your AI Assistant

AI assistants and coding agents can (and should) read it all too. Following
the <a href="https://llmstxt.org/" target="_blank" rel="noopener">`llms.txt`</a>
convention, the docs are available as plain Markdown:

- <a href="https://docs.sparecores.com/llms.txt" target="_blank" rel="noopener">`llms.txt`</a>:
  an index of all pages, plus machine-readable resources, such as the
  OpenAPI specification of the API and the database schema in SQL
- <a href="https://docs.sparecores.com/llms-full.txt" target="_blank" rel="noopener">`llms-full.txt`</a>:
  the full content in a single file
- any page as Markdown, by adding `.md` to its URL

For example, ask your assistant:

> Read https://docs.sparecores.com/llms.txt, then use the Spare Cores Navigator
> API to find the cheapest server types with at least 8 vCPUs and 32 GB of
> memory in Europe, and compare their benchmark scores.

And if a term is new to you, such as SCore or spot instance, the
<a href="https://docs.sparecores.com/glossary" target="_blank" rel="noopener">Glossary</a>
explains it.

## Feedback

Feedback is very welcome! 🙇 Please share your thoughts in the comment box
below, or open an issue in the GitHub repository of the part you have a
question about, as listed on the
<a href="https://docs.sparecores.com/getting-started#getting-help" target="_blank" rel="noopener">Getting started</a>
page.
