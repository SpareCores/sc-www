---
# ~50 chars
title: 67% costs savings at adtech company
date: 2024-03-19
# ~100 character
teaser: "Case Study: reducing monthly cloud expenses by $3k via migrating from AWS Batch to self-managed instances."
# 320x220
image: /assets/images/blog/xkcd-1205-is_it_worth_the_time-cropped.webp
image_alt: Is it worth the time? XKCD comic.
author: Gergely Daroczi
tags: [case-study, aws, spot, featured]
---

Some of our team members previously worked together at an adtech
company, with the need to run data science batch jobs requiring
varying resources, e.g.

- Training hierarchical models on a large dataset using R required
  several hundreds GBs of RAM,
- NLP models in Python required GPUs,
- Parallelized time-series forecasting models required many CPUs,
- Many small jobs mostly waiting for SQL results running on a shared
  host.

## Managed service to the rescue

AWS Batch seemed like a good fit and relatively convenient solution to
manage these tasks for us, but after a few months trial, we
experienced unexpected costs due to developers misconfiguring resource
requirements (overprovisioning to avoid errors, forgot to update etc)
and AWS bin packing smaller jobs to already running larger nodes
(started for heavy jobs), which resulted in keeping the expensive
nodes running for a longer time.

## FinOps

We did some planning and estimates (similar to the below reference
used as an industry standard in automation projects), and decided that
it is worth our time to come up with a home-brew solution to reduce
the monthly ~$5k EC2 costs in the long run:

<div class="text-center m-2.5 mt-8 mb-6">
  <a href="https://xkcd.com/1205/"
     target="_blank" rel="noopener"
     class="!no-underline">
    <img
      title="Is It Worth the Time? (xkcd.com)"
      src="/assets/images/blog/xkcd-1205-is_it_worth_the_time.png"
      class="w-full" />
    <p>Source: Is It Worth the Time? (xkcd)</p>
  </a>
</div>

The core concept was to:

- Monitor the utilized resources for each job closely.
- Find the optimal instance type for each job based on its historical
  resource usage.
- Start a new spot instance for each job, and terminate ASAP after
  success (or failure).

This sounded relatively easy to implement, and after a couple hundred
lines of Python code to spin up new instances and monitor them, it
also felt relatively stable. After a couple weeks of experimentation
and another 1-2k lines of code, it indeed became stable ... and
actually brought down the monthly AWS bill for the data science team
to below $2k!

## Reasoning

Proper resource usage monitoring was obviously an important factor in
succeeding the project, but we considered avoiding bin packing as the
key ingredient: AWS offers almost 800 instance types with the price
being based on the included and attached resources, so it doesn't make
much sense to run a larger node with multiple jobs, instead each job
should run on its own (optimal) instance and stop as soon as possible.

## Demo

To achieve this, we started with a wrapper script to monitor Docker
stats every few seconds to identify:

- If the script can scale to multiple CPU cores (~max CPU percentage).
- How consistently the script requires high amount of compute power
  (~average CPU percentage).
- The required memory (~max memory usage).

This data was recorded in S3 files with databases connected for easy
querying:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin"
    title="CPU and memory usage of a batch job monitored every few seconds"
    src="/assets/images/blog/adtech-usecase-job-metrics.png"/>
  <p>CPU and memory usage of job monitored every few seconds</p>
</div>

Once the required/optimal vCPUs and memory was defined, we listed the
matching instance types, ordered by cost per performance using the <a
href="https://github.com/bra-fsn/cloudperf" target="_blank"
rel="noopener"> `cloudperf` Python package</a> that we developed for
this purpose.

Then the above-mentioned script iterated over the list of optimal
instance types, trying to start one with enough capacity:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin"
    title="Trying to start the cheapest instance with 36 vCPUs"
    src="/assets/images/blog/adtech-usecase-run.png"/>
  <p>Trying to start the cheapest instance with 36 vCPUs</p>
</div>

Once the job finished, the detailed statistics were written to S3 and
the summary printed by the wrapper script:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin"
    title="Finished job's resource usage summary stats"
    src="/assets/images/blog/adtech-usecase-stopped.png"/>
  <p>Finished job's resource usage summary stats</p>
</div>

Then we could use the newly collected data to fine-tune the
server-selection algorithm by finding new patterns (e.g. a model
training job running every hour requires high amount of memory only
from time-to-time).

Overall, this solution managed around 4000 batch jobs every single
day: some low-resource jobs running on a single shared host, others on
their dedicated spot instance. The job-level data was stored in S3
just like the docker stats time-series:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin"
    title="Example remote job among the daily ~4k batch jobs"
    src="/assets/images/blog/adtech-usecase-jobs.png"/>
  <p>Example remote job among the daily ~4k batch jobs</p>
</div>

## Further resources

If interested in more details, we presented on the original solution
at various conferences and meetups:

- <a href="https://losangeles2019.satrdays.org/" target="_blank" rel="noopener">satRday Los Angeles (2019)</a>
- <a href="https://budapestbiforum.hu/2019/en/" target="_blank" rel="noopener">Budapest BI Forum 2019</a> & <a href="https://github.com/szilard/GBM-adv-workshop-Bp19" target="_blank" rel="noopener">Advanced GBM Workshop</a>
- <a href="https://budapestdata.hu/2020/en/" target="_blank" rel="noopener">Budapest Data Forum 2020</a>
- <a href="https://www.meetup.com/real-data-science-usa-r-meetup/" target="_blank" rel="noopener">Real Data Science USA meetup (2021)</a>
