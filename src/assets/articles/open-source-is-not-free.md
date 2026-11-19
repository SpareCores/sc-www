---
# ~50 chars
title: Open Source Is Not Free
date: 2026-11-19
# ~100 character
teaser: Why the Spare Cores Navigator is open source, what we charge for, and why running it is not free.
# 320x220
image: /assets/images/blog/thumbnails/open-source-is-not-free.webp
image_alt: <TODO: alt text for the thumbnail, as a full sentence>
author: Gergely Daroczi
tags: [open-source, data, funding]
---

There is a question I often get: how do we make a living from open source?
If all the code and data are public, what do we even sell?

Everyone says it's tough. Honestly, it is. So it's time to write down why the
Spare Cores Navigator is open source, and what it means for companies building
on our data.

- **Open source is for transparency**: anyone can check how we collect the
  data and compute the scores, today and years ago.
- **It's not open-core**: the code of every feature is public, and you pay for
  running it, not for features.
- **Generating the data is expensive**: so we ask companies that create value
  from it to use our managed services.
- **It's not a silver bullet**: it works for this project, and other projects
  may need a different model.

## Open Source Is Not the Same as Free

English uses the same word for two different things: free as in freedom, and
free as in free of cost. Open source is about the first one. You can read,
run, change, and share our code, and use our raw data for your own work.

It says nothing about the second one. Someone still pays for the servers, the
benchmark runs, and the people writing and maintaining the code.

## What's Open

First of all, everything you need to check our work is public:

- **The code** that collects the vendors' data, starts the servers, runs the
  benchmarks, and serves the API and the website, in our
  <a href="https://github.com/SpareCores" target="_blank" rel="noopener">GitHub organization</a>.
- **The raw data**, including the raw outputs of the hardware inspection and
  benchmark runs on each server, in the
  <a href="https://github.com/SpareCores/sc-inspector-data" target="_blank" rel="noopener">`sc-inspector-data`</a>
  repository.
- **The full history** of both. Through git, you can see not only how a score
  was produced today, but also how we produced it two years ago, and why we
  changed it.

Why does this matter so much for us? Because a benchmark is only as good as
the trust in it. Benchmarks are always simplifications, and some of our
choices will be wrong for your workload. Being open means you don't need to
take our word for any number: you can see exactly what we ran, on which
server, with which settings, and rerun it yourself. As described in our
[Unlocking Cloud Compute Performance](/article/cloud-compute-performance-benchmarks)
article, all benchmarks are wrong, but some are useful, and openness is how
you can decide which ones are useful for you.

So the transparency is not a side effect. For benchmark data, it is the
product's credibility.

## What Isn't Free

Running all this is. Every benchmark run means starting real servers at
real cloud vendors, and paying for them. Over the years, this added up to <TODO: cloud spend figure, or
drop the number>.

Then comes the work that is less visible: keeping up with the vendors'
changing APIs, prices, and new server types, fixing benchmarks that break
on new hardware, curating the data, and the years of engineering behind the
whole pipeline. The
[NGI Search grant](/article/ngi-search-grant) and our
[pre-seed round](/article/pre-seed) helped a lot, but neither pays for
running the Navigator forever.

## Why Not Open-Core

A common way to make money from open source is open-core: the base product is
open, and the features companies need most are in a closed, paid edition.

We don't do that. The code of every feature of the Navigator is public,
including the API endpoints that need a token, and the rate limits
themselves. Personal API keys are free, too. What companies pay for is not
access to features, but us running and supporting it:

- the hosted API with higher limits,
- commercial access to the database,
- support and consulting.

You could run the whole stack yourself, but then you would also take on the
data collection, the cloud bill, and the maintenance work.

## The Licenses in Plain Words

We use three licenses, each for a reason:

- **Code: MPL 2.0.** You can use it for anything, also commercially. If you
  change one of our files and distribute it, you share those changes under the
  same license.
- **Raw data: CC BY-SA 4.0.** You can use it for anything, also commercially,
  with attribution, and you share adapted data under the same license.
- **Compiled database: BSL 1.1.** This is the SQLite file we build from the
  raw data. BSL is source-available, not an open-source license. Its
  additional use grant allows production use for non-commercial academic
  research at accredited universities, and for entities with less than
  $1,000,000 USD in annual revenue, unless the use creates a competing cloud
  data, benchmarking, or price-comparison service. Each release converts to
  CC BY-SA 4.0 three years after its publication.

Note that we don't claim that everything is open source: the code is, the raw
data is open, and the compiled database is source-available. Why BSL for the
database? <TODO: Gergely's reasoning, e.g. the curation that goes into the
compiled database, and protection against a hosted copy of the Navigator
competing with the service that funds it.>

The full details are in the
<a href="https://docs.sparecores.com/#licensing" target="_blank" rel="noopener">Licensing section of our docs</a>.

## What We Ask of Companies

None of the licenses above requires you to pay us. The API is free under a
<a href="https://docs.sparecores.com/api#fair-use--commercial-use" target="_blank" rel="noopener">fair use policy</a>,
and the code and raw data allow commercial use.

What we ask is a request, not a license term: if our data creates value for
your company, please use our managed services. That is what keeps the
benchmarks running, the data fresh, and the code open for everyone else.

## Not a Silver Bullet

This model works for the Navigator because of a few specific traits: the data
is expensive to generate, its value depends on trust and reproducibility, and
there is a managed service that people want to use instead of running their
own copy. A project without these traits, such as a small library with no
running costs, may need a different model, and we don't claim to have the
answer for it.

But again, for benchmark data, we believe that being open is the only way to
be trusted, and being trusted is the only way to be useful.

## Feedback

If you have any questions, concerns, or suggestions, please leave a message in
the comment section below, or
<a href="https://meet.sparecores.com/intro" target="_blank" rel="noopener">schedule a call with us</a>.
If your company builds on our data, [contact us](/contact) about the managed
services.
