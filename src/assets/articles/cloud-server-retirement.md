---
# ~50 chars
title: Find Cloud Servers Before They Are Retired
date: 2026-11-26
# ~100 character
teaser: Spare Cores now tracks which server types and managed databases vendors plan to retire, and when.
# 320x220
image: /assets/images/blog/thumbnails/cloud-server-retirement.webp
image_alt: The details of an Azure server type on Spare Cores, with a retirement date of 2028-05-01 and the planned-for-retirement status.
author: [Adam Toth, Gergely Daroczi]
tags: [data, crawler, vendor, aws, gcp, azure, hcloud]
---

Cloud vendors retire server types and managed database offerings all the
time: an older generation goes away, a family gets replaced by a cheaper and
faster one, or a server type simply stops being sold. Sometimes the announcement comes
months ahead, sometimes on much shorter notice. Either way, teams often find
out late, when a migration is already urgent.

FinOps practitioners call the work of moving off them in time
*modernization*. It needs two things: knowing which of your servers are going
away and when, and picking a replacement that is not slower or more expensive.
Spare Cores can now help with both. Here's what's new:

- **New status**: server types and managed databases that a vendor plans to
  retire are marked `planned-for-retirement`, while they can still be ordered.
- **Retirement date**: the date the vendor announced, when there is one.
- **Six vendors with advance notice**: Alibaba Cloud, Azure, GCP, Hetzner
  Cloud, OCI and OVHcloud. At AWS, we can only mark what is already
  `retired`.
- **Replacement**: the [Advisor](/advisor) suggests alternatives to a retiring
  server type, based on benchmark scores and prices.

## Background

Our <a href="https://github.com/SpareCores/sc-crawler" target="_blank" rel="noopener">Crawler</a>
has always kept server types that disappear from a vendor's listing: they
stay in the database as `inactive`, so that you can still look up their
specs, prices and benchmark scores. This is how we could compare Hetzner
Cloud's old and new CX servers side by side in our
[Hetzner CX post](/article/hetzner-new-cx-servers), while the old ones were
still around.

But `inactive` only tells you that something is already gone, and not why.
Many vendors announce a retirement ahead of time, and that early warning is
exactly what a team needs to plan a migration.

## What We Track Now

Each server type and managed database has a `status`. Next to `active`, the
following statuses tell you about a retirement:

| Status | Meaning | Can be ordered |
| ------ | ------- | -------------- |
| `planned-for-retirement` | The vendor announced the retirement. | yes |
| `retired` | The vendor retired it. Prices may still exist, e.g. for multi-year contracts. | no |
| `inactive` | The vendor no longer lists it, and we don't know of a retirement. It may come back. | no |

We set `planned-for-retirement` and `retired` only from an explicit signal of
the vendor, in its API or its documentation, never from a guess.

The new `retirement_date` field holds the date the vendor announced: the end
of support (shutdown) if it is published, otherwise the end of sale. It is
empty when the vendor hasn't announced a date. Both show up on the server
pages of our website, for example on the
[`Standard_D1_v2` page](/server/azure/Standard_D1_v2) of Azure:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    title="Retirement date and status of an Azure server type"
    alt="The server page of Azure's Standard_D1_v2 on Spare Cores, with the retirement date 2028-05-01 and the planned-for-retirement status in the Server Metadata table"
    src="/assets/images/blog/cloud-server-retirement-status.webp"/>
  <p>Retirement date and status of Azure's <code>Standard_D1_v2</code><br />(data collected and visualized by Spare Cores)</p>
</div>

At the time of writing, the following server types are planned for
retirement in our database:

| Vendor | Planned for retirement | With a retirement date |
| ------ | ---------------------- | ---------------------- |
| Alibaba Cloud | 11 | 0 |
| Azure | 172 | 172 |
| OCI | 36 | 36 |

No managed database is planned for retirement at the moment.

## How to Find What's Being Retired

<TODO: the page from DEV-1163 that lists the server types planned for
retirement with their dates, with a link and a screenshot, once it ships.>

In the <a href="https://docs.sparecores.com/api" target="_blank" rel="noopener">API</a>,
the `/servers` and `/databases` endpoints return the `status` and
`retirement_date` of each record. By default, `/servers` returns everything
that can still be ordered (`only_orderable`), including the server types
planned for retirement; set `only_active=true` to leave those out. There is
no filter for `planned-for-retirement` alone, but ordering by
`retirement_date` lists the server types with a date first, the latest first:

```shell
curl -G https://keeper.sparecores.net/servers \
  -d vendor=azure \
  -d order_by=retirement_date \
  -d order_dir=desc \
  -d limit=3
```

In the SQLite database, which you can get with the
<a href="https://pypi.org/project/sparecores-data/" target="_blank" rel="noopener">`sparecores-data`</a>
Python package, the following query lists the server types planned for
retirement, the soonest first:

```sql
SELECT vendor_id, server_id, retirement_date
FROM server
WHERE status = 'PLANNED_FOR_RETIREMENT'
ORDER BY retirement_date IS NULL, retirement_date;
```

Note that the database stores the status names in upper case. For managed
databases, query the `database` table, with `database_id` in place of
`server_id`.

The OCI shapes come first in the results: their retirement date is the end
of orderability, which has already passed, but OCI still lets you order them.

## How to Pick a Replacement

Once you know which server type is going away, the [Advisor](/advisor) can
suggest what to move to. Select the retiring server type as the baseline
server, pick the workload that is closest to what it runs, choose an
optimization goal, such as cost, and set its average utilization. The Advisor
then lists the alternatives whose benchmark score for that workload covers
what your server actually uses, ranked by the goal you chose.

For example, take Azure's `Standard_D1_v2` from above as the baseline server,
with the Web Server workload profile, 60% average utilization, at least
3 GiB of memory, and cost as the optimization goal. The
<a href="/advisor?baseline_vendor=azure&baseline_server=Standard_D1_v2&limit_architecture=true&workload_id=workload_profile:web&workload_config=%7B%7D&avg_cpu_utilization=60&minimum_memory=3" target="_blank">Advisor</a>
lists the cheapest candidates first. The top one, Alibaba Cloud's
`ecs.e-c1m2.large`, costs 0.0028 USD per hour, 67% less than the baseline's
best price, with a 21% higher workload score:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    title="Advisor recommendations for a retiring Azure server type"
    alt="The Spare Cores Advisor with Azure's Standard_D1_v2 as the baseline server, listing cheaper alternatives with their workload scores, cost efficiency, memory and prices"
    src="/assets/images/blog/cloud-server-retirement-advisor.webp"/>
  <p>Replacement candidates for Azure's <code>Standard_D1_v2</code><br />(data collected and visualized by Spare Cores)</p>
</div>

The following chart overlays the workload profile scores of the two servers:

<iframe
  src="https://sparecores.com/embed/compare/workload_profile?instances=W3siZGlzcGxheV9uYW1lIjoiU3RhbmRhcmRfRDFfdjIiLCJ2ZW5kb3IiOiJhenVyZSIsInNlcnZlciI6IlN0YW5kYXJkX0QxX3YyIiwiem9uZXNSZWdpb25zIjpbXX0seyJkaXNwbGF5X25hbWUiOiJlY3MuZS1jMW0yLmxhcmdlIiwidmVuZG9yIjoiYWxpY2xvdWQiLCJzZXJ2ZXIiOiJlY3MuZS1jMW0yLmxhcmdlIiwiem9uZXNSZWdpb25zIjpbXX1d"
  style="height: 510px; width: 100%; border: 1px solid #34d399; border-radius: 8px; min-height: 400px;">
</iframe>

Note that none of the top candidates comes with local storage, unlike the
54 GB of the baseline, so add a disk if your workload needs one.

## Caveats

- **Only what vendors announce**: a vendor that doesn't publish its
  retirements in a form we can read won't have `planned-for-retirement`
  records, so an empty list doesn't mean nothing is going away.
- **Not always the shutdown date**: when a vendor publishes only the end of
  sale, `retirement_date` holds that date, and the server may keep running
  after it. At OCI, the date can even be in the past for a shape that you can
  still order.
- **Managed databases**: the Advisor works with server types, so for a
  managed database, compare the alternatives on the
  [database listing](/databases) instead. <TODO: confirm with a
  maintainer that the Advisor has no database mode planned.>

## Summary

Vendors retire server types and managed databases regularly, and Spare Cores
now tells you which ones are next and when, at six vendors, in the API, the
SQLite database and on our website. Together with the Advisor, this turns a
rushed migration into one you can plan.

## Feedback

Please share your feedback or suggestions in the comment box below, or open a
ticket in our
<a href="https://github.com/SpareCores/sc-crawler/issues" target="_blank" rel="noopener">Crawler repository</a>
if a retirement is missing or wrong.
