---
# ~50 chars
title: Search and Order Servers for Any Workload
date: 2025-03-25
# ~100 character
teaser: Effortlessly filter and rank servers by benchmark score or per dollar value for ultimate performance and savings!
# 320x220
image: /assets/images/blog/thumbnails/select-benchmark.webp
image_alt: Screenshot of the Server search page on the Spare Cores website with a selected benchmark in the background and a modal window to select another one.
author: Gergely Daroczi
tags: [benchmark, performance, score]
---

Since the project's inception, one of the most common feature requests has been to allow users to search and sort servers by any benchmark score, not only the default `stress-ng` multi-core CPU score that we use as our standard `SCore` (you can read more details about this latter in the ["One SCore to Rule Them All" section of our "Unlocking Cloud Compute Performance" article](/article/cloud-compute-performance-benchmarks)).

As a frequent user of our own site (dogfooding rocks!), I completely understood and related to this request, but was also worried about the database and backend performance implications of such a feature, so it was delayed for a while. Now I'm super excited to announce that it was finally implemented without any noticeable performance impact!

## Frontend Updates

The most noticeable change on the server search page is the addition of a "Select Benchmark" dropdown above the search results table:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    alt="Screenshot of the Server search page on the Spare Cores website with the 'Select Benchmark' button."
    src="/assets/images/blog/select-benchmark-server-search-default.webp"/>
</div>
<p style="margin: 0px 50px 20px 50px; text-align: center; color: #999;">Updated <a href="/servers" target="_new">Server search</a> with the "Select Benchmark" button</p>

Clicking the "Select Benchmark" button opens a modal window with the list of benchmark categories and then subcategories after selecting one — letting you access over 500 benchmark scores:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    alt="Screenshot of the Server search page on the Spare Cores website showing the modal window to select a benchmark."
    src="/assets/images/blog/select-benchmark-modal.webp"/>
</div>
<p style="margin: 0px 50px 20px 50px; text-align: center; color: #999;">List of available benchmark categories</p>

After selecting a benchmark, the "BENCHMARK" column is automatically added to the table with the following two lines:

- The selected benchmark's raw score for the server.
- The benchmark score you get for 1 USD, so the raw score divided by the best available (usually spot) hourly server price.

Clicking on the "BENCHMARK" column header will toggle sorting the table by the selected benchmark score between ascending and descending order. If you want to sort by performance/price ratio, you can enable the related column and then click on the "BENCHMARK/USD" column header. See for example the list of max 4 vCPU servers sorted by the highest static web serving (extrapolated) speed you can get for a dollar — potentially reaching over 30M requests with a 512kB response size per second with lots of `B2ts_v2` servers:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    alt="Screenshot of the Server search page on the Spare Cores website showing the 'BENCHMARK' column with the selected benchmark score for each server."
    src="/assets/images/blog/select-benchmark-sort.webp"/>
</div>
<p style="margin: 0px 50px 20px 50px; text-align: center; color: #999;"><a href="/servers?vcpus_max=4&order_by=selected_benchmark_score_per_price&order_dir=desc&columns=1203208&benchmark=eyJpZCI6InN0YXRpY193ZWI6cnBzLWV4dHJhcG9sYXRlZCIsImNvbmZpZyI6IntcImNvbm5lY3Rpb25zX3Blcl92Y3B1c1wiOiAxNi4wLCBcImZyYW1ld29ya192ZXJzaW9uXCI6IFwiYmluc2VydmUgMC4yLjEsIHdyayA0LjIuMFwiLCBcInNpemVcIjogXCI1MTJrXCJ9In0%3D" target="_new">Search for max 4vCPUs servers, sorted by the highest static web serving (extrapolated) speed you can get for a dollar</a></p>

And of course, you can compare any number of selected servers with much more details by marking the related checkboxes in the table and then clicking on the "Compare" button. An example chart embedded from that page for static web serving on three hyperscaler servers:

<iframe
 src="/embed/compare/static_web?instances=W3siZGlzcGxheV9uYW1lIjoiQjJ0c192MiIsInZlbmRvciI6ImF6dXJlIiwic2VydmVyIjoiU3RhbmRhcmRfQjJ0c192MiIsInpvbmVzUmVnaW9ucyI6W119LHsiZGlzcGxheV9uYW1lIjoicjhnLmxhcmdlIiwidmVuZG9yIjoiYXdzIiwic2VydmVyIjoicjhnLmxhcmdlIiwiem9uZXNSZWdpb25zIjpbXX0seyJkaXNwbGF5X25hbWUiOiJ0MmQtc3RhbmRhcmQtMiIsInZlbmRvciI6ImdjcCIsInNlcnZlciI6InQyZC1zdGFuZGFyZC0yIiwiem9uZXNSZWdpb25zIjpbXX1d" 
 style="height: 600px; width: 100%; border: 1px solid #34d399; border-radius: 8px; min-height: 600px">
</iframe>

You can learn more about this feature on our [Compare Servers](/compare) page.

## Backend Improvements

Though less visible, the backend enhancements are potentially even more powerful, providing the main support for all the aforementioned frontend features: you can also make <a href="https://keeper.sparecores.net/redoc" target="_new">Keeper</a> queries to sort and filter the servers by any benchmark score.

The technical challenge of this feature involved extending the `order_by` parameter to accommodate the new columns, so the backend needed to know all 500+ benchmark scores for the 2000+ servers along with the best hourly prices for each server type, potentially recorded in different currencies.

This is a relatively large lookup table after all the joins, for which a full table scan was not an option: early tests timed out after minutes on a 4 GiB RAM dev container, writing GBs of temporary tables to the disk.

So we needed to find a way to optimize the query, keeping in mind that the Keeper's database is a static SQLite file by default:

1. First, we decided to pre-compute the best price for each server in USD and cache for 10 minutes as part of our extended `server_extra` ~materialized view. This simplified the query significantly so that we don't need to always join and sort at all the 300k+ rows of the `server_prices` table along with the most recent currency rates.
2. Then, we introduced indexes on the related tables, added at the time of the server start and database updates (every 10 minutes).
3. And finally, we reviewed how we run the extra query to count the total number of matching records despite paging, which data is added as an optional header to the Keeper response, so that the frontend can render a nice pager without extra queries.

We also experimented with DuckDB, which performed extremely well with the most complex queries (especially counting rows) at the cost of relatively high memory usage, but was rather slow compared to SQLite for the simpler lookups, so we went back to SQLite with pre-computed and periodically updated indexes.

## Feedback

We're super excited to see many of you using this feature. Please share your feedback or suggestions in the comment box below!
