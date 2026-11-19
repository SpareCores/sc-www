---
# ~50 chars
title: Open Source Is Not Free
date: 2026-11-19
# ~100 character
teaser: Why the Spare Cores Navigator is open source, what we charge for, and why running it is not free.
# 320x220
image: /assets/images/blog/thumbnails/open-source-is-not-free.webp
image_alt: A glowing green and blue Spare Cores logo on a dark navy background, above the words Spare Cores Open Source.
author: Gergely Daroczi
tags: [open-source, data, funding]
---

A question we often get is how we make a living from open source, when all
our code and data are public.

Making money from open source is tough. This post is our long answer, and
what it means for companies building on our data.

## Open Source Is Not the Same as Free

English uses one word, "free", for two meanings: free as in freedom, and free
of cost. Open source is about the first one. You can use, change and share
our code, and use our raw data for your own work.

Cost is a separate issue. The servers, benchmark runs, and code maintenance
cost money.

## What's Open

First of all, everything you need to check our work is public:

- **The code** that collects the vendors' data, starts the servers, runs the
  benchmarks, and serves the API and the website, in our
  <a href="https://github.com/SpareCores" target="_blank" rel="noopener">GitHub organization</a>.
- **The raw data**: the servers, regions, prices and other data we collect
  from the vendors, in the
  <a href="https://github.com/SpareCores/sc-data-dumps" target="_blank" rel="noopener">`sc-data-dumps`</a>
  repository, and the raw outputs of the hardware inspection and benchmark
  runs on each server, in the
  <a href="https://github.com/SpareCores/sc-inspector-data" target="_blank" rel="noopener">`sc-inspector-data`</a>
  repository.
- **The full history** of both. Git shows how we produced a score two years
  ago and what we changed since. It often even explains why.

Why does this matter so much for us?

It matters because a score nobody can reproduce is hard to trust. Benchmarks
are simplifications, and some of our choices will be wrong for your workload.
Being open means you do not need to take our word for a number: you can see
exactly what we ran, on which server, with which settings, and rerun it
yourself. As described in our
[Unlocking Cloud Compute Performance](/article/cloud-compute-performance-benchmarks)
article, all benchmarks are wrong, but some are useful, and openness is how
you can decide which ones are useful for you.

## What Isn't Free

Running it all costs money. A benchmark run means starting real servers at
real cloud vendors and paying for them. Over the years, this added up to
<TODO: cloud spend figure, or drop the number>.

Then comes the work that is less visible: keeping up with the vendors'
new server types and changing prices, and fixing benchmarks that break on
new hardware. <TODO: Gergely: one concrete example of a benchmark that broke
on new hardware, and what fixing it took.> The
[NGI Search grant](/article/ngi-search-grant) and our
[pre-seed round](/article/pre-seed) helped a lot, but neither pays for
running the Navigator forever.

## Why Not Open-Core

A common way to make money from open source is open-core: the base product is
open, and the features companies need most are in a closed, paid edition.

We don't do that. The code behind the Navigator's features is public,
including the API endpoints that need a token, such as `/snapshot`, and the
rate limits themselves. Personal API keys are free, too. Companies pay us to
run and support it:

- the hosted API with higher limits,
- commercial access to the database,
- support and consulting.

You could run the whole stack yourself. In that case, you would also take on
data collection, the cloud bill, and maintenance.

## The Licenses in Plain Words

We use these three licenses:

- **Code: [MPL 2.0](/legal/license-mpl).** You can use it for anything,
  including commercially. If you change one of our files and distribute it,
  you share those changes under the same license.
- **Raw data: [CC BY-SA 4.0](/legal/license-cc-by-sa).** You can use it for
  anything, including commercially, with attribution, and you share adapted
  data under the same license.
- **Compiled database: [BSL 1.1](/legal/license-bsl).** This is the SQLite
  file we build from the raw data. BSL is source-available, not an
  open-source license. Its
  additional use grant allows production use for non-commercial academic
  research at accredited universities, and for entities with less than
  $1,000,000 USD in annual revenue, unless the use creates a competing cloud
  data, benchmarking, or price-comparison service. Each release converts to
  CC BY-SA 4.0 three years after its publication.

Note that only the code is open source. The raw data is open data, and the
compiled database is source-available. We chose BSL for the database because:
<TODO: Gergely's reasoning, e.g. the curation that goes into the compiled
database, and protection against a hosted copy of the Navigator competing
with the service that funds it.>

The full details are in the
<a href="https://docs.sparecores.com/#licensing" target="_blank" rel="noopener">Licensing section of our docs</a>.

## What We Ask of Companies

None of the code or data licenses requires you to pay us: the code and raw
data allow commercial use, and the API is free under a
<a href="https://docs.sparecores.com/api#fair-use--commercial-use" target="_blank" rel="noopener">fair use policy</a>.
The compiled database is the exception. Companies above $1M annual revenue
need a commercial agreement to use it in production.

If our data creates value for your company, please consider using our managed
services. That pays for the benchmark runs.

## When This Model Applies

This model fits the Navigator because of a few specific traits: generating
the data costs money, its value depends on trust and reproducibility, and
there is a managed service that people want to use instead of running their
own copy. A project without these traits, such as a small library with no
running costs, may need a different model, and we don't claim to have the
answer for it.

## Feedback

If you have any questions, concerns, or suggestions, please leave a message in
the comment section below, or
<a href="https://meet.sparecores.com/intro" target="_blank" rel="noopener">schedule a call with us</a>.
If your company builds on our data, [contact us](/contact) about the managed
services.
