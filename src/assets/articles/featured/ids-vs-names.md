---
# ~50 chars
title: When to use resource ids, or prefer the names?
date: 2024-02-14
# ~100 character
teaser: The use of resource ids and names differs by vendor ... and might be even the same. Integer? String? None?
# 320x220
image: /assets/images/blog/hide-the-pain-harold.webp
image_alt: The "Hide the pain Harold" meme.
author: Gergely Daroczi
tags: [aws, gcp, hcloud, crawler, featured]
---

Each vendor has its nomenclature on the compute resources (e.g. "spot
instances" versus "preemptible servers"), but we were
hoping that we can standardize all these across the vendors in the
Spare Cores ecosystem.

This required us to make some arbitrary decisions (e.g. we went with
the "server with spot allocation" naming schema and decided not to
inventory reserved instance pricing at this time), and seeing the
inconsistencies between vendors early on, it became very clear that
how things are called might change at any point even within a single
vendor, so thus we should stick with unique and stable identifiers in
all cases.

But do vendors support that? Let's review this using an important
concept that exists in almost all supported vendors: availability
zones!

## Hetzner Cloud

Hetzner has five datacenters across Europe and USA, but they have not
implemented separated zones within a datacenter. This put us in a
difficult situation, as the <a
href="https://sparecores.github.io/sc-crawler/" target="_blank"
rel="noopener">SC Crawler</a> schemas require the presence of
`zone_id` e.g. for server prices, so we decided to create "pseudo
zones": one zone for each datacenter, using the same id and name.

Anyway, what we have learned about their ids and names? The resource
ids are integers, e.g. the CX family using up single-digit odd numbers,
and the CCX family the range from 96 to 101:

```sql
SELECT server_id, name, vcpus, memory
FROM server
WHERE vendor_id = 'hcloud' AND name LIKE '%CX%'
ORDER BY CAST(server_id as INTEGER);
```

| server_id | name  | vcpus | memory |
|----------:|:------|------:|-------:|
| 1         | cx11  | 1     | 2048   |
| 3         | cx21  | 2     | 4096   |
| 5         | cx31  | 2     | 8192   |
| 7         | cx41  | 4     | 16384  |
| 9         | cx51  | 8     | 32768  |
| 96        | ccx13 | 2     | 8192   |
| 97        | ccx23 | 4     | 16384  |
| 98        | ccx33 | 8     | 32768  |
| 99        | ccx43 | 16    | 65536  |
| 100       | ccx53 | 32    | 131072 |
| 101       | ccx63 | 48    | 196608 |


Honestly, you better rely on the server names to identify what
hardware is covered. Fortunately, this is very well supported by their
API SDKs, e.g. the Python client provides an `id_or_name` helper so
that the user or program can use whatever they wish.

## Amazon Web Services

AWS uses human-friendly strings as the resource identifiers that are
easy to remember and identify, and those are actually matching the
name in some cases, e.g. for the servers.

Unfortunately, it's not that straightforward when it comes to other
resource types.

The `datacenter_id` is an all lowercase text starting with a 2-letter
continent reference, then location reference and a number; while the
name is a title-case string with the a city or state name in
parenthesis after the continent. Unfortunately, the datacenter names
are not always used consistently throughout all the AWS API endpoints,
e.g. "Europe" often get abbreviated as "EU", so we recorded these as
aliases for the datacenter names that we can look up:

```sql
SELECT datacenter_id, name, aliases
FROM datacenter
WHERE vendor_id = 'aws'
ORDER BY RANDOM()
LIMIT 10;
```

| datacenter_id  |           name           |      aliases       |
|:---------------|:-------------------------|:-------------------|
| cn-northwest-1 | China (Ningxia)          | []                 |
| eu-west-2      | Europe (London)          | ["EU (London)"]    |
| ap-south-1     | Asia Pacific (Mumbai)    | []                 |
| ap-southeast-3 | Asia Pacific (Jakarta)   | []                 |
| eu-north-1     | Europe (Stockholm)       | ["EU (Stockholm)"] |
| us-east-2      | US East (Ohio)           | []                 |
| ap-southeast-2 | Asia Pacific (Sydney)    | []                 |
| ap-east-1      | Asia Pacific (Hong Kong) | []                 |
| eu-west-1      | Europe (Ireland)         | ["EU (Ireland)"]   |
| eu-central-1   | Europe (Frankfurt)       | ["EU (Frankfurt)"] |


This is a bit painful, but manageable problem: we have been
maintaining the list of aliases manually in the SC Crawler package,
and we keep our fingers crossed for no breaking changes.

But availability zones have another interesting fact:

<blockquote>
  <p>
    "AWS maps the physical Availability Zones randomly to the
    Availability Zone names for each AWS account."
  </p>
  <footer>Source: <cite>
    <a href="https://docs.aws.amazon.com/ram/latest/userguide/working-with-az-ids.html"
       target="_blank" rel="noopener">
       AWS Resource Access Manager: Availability Zone IDs for your AWS resources.
    </a>
  </cite></footer>
</blockquote>

In other words, when the <a
href="https://github.com/SpareCores/sc-data/" target="_blank"
rel="noopener">SC Data</a> database refers to the "us-east-1b" zone,
that might be actually called "us-east-1b" or "us-east-1f" etc in your
account! Fortunately, the `zone_id` field is a reliable mapping even
between different organizations, so when we say that an instance is
the cheapest in the `use1-az3` zone, you should be able to reference
that in your AWS account, for example with the following command:

```shell
aws ec2 \
  --region us-east-1 describe-availability-zones \
  --output text \
  --query 'AvailabilityZones[?ZoneId==`use1-az1`].ZoneName'
```

## Google Cloud Platform

To keep it short, GCP is a mix of the above-described words:

- Using integers for the ids (e.g. `datacenter_id`s are between 1000 and 2000,
  `zone_id`s are between 2000 and 3000 etc),
- Human-friendly zone names are not interchangeable between GCP accounts.

What might be surprising is that there is no way to map an actual
availability zone with another GCP accounts' zone (except for a few
special cases):

<blockquote>
  <p>
    "Compute Engine implements a layer of abstraction between zones and
    the physical clusters where the zones are hosted. A cluster represents
    a distinct physical infrastructure that is housed in a data
    center. Each zone is hosted in one or more clusters and Compute Engine
    independently maps zones to clusters for each organization."
  </p>
  <footer>Source: <cite>
    <a href="https://cloud.google.com/compute/docs/regions-zones#zones_and_clusters"
       target="_blank" rel="noopener">
       GCP Compute Engine guides: Zones and clusters.
    </a>
  </cite></footer>
</blockquote>

This was highly confusing first, as we were trained using AWS with
very different prices even between the availability zones of a single
region, but as GCP has uniform prices within a datacenter, it did not
raise any issues after all (except for storing redundant data in our
databases).

## Takeaway

As you can see, there are very different patterns when it comes to
using resource ids and names, but the Spare Cores project has always
found a way to standardize into a useful data structure so far.

If interested in more details, check out the SC Crawler docs, or head
over directly to the database schema documentation:

<div class="text-center m-2.5 mt-8 mb-6">
  <a href="https://dbdocs.io/spare-cores/sc-crawler"
     target="_blank" rel="noopener"
     class="!no-underline">
    <img
      title="SC Crawler database schemas documented and visualized at dbdocs.io"
      src="/assets/images/blog/dbdocs-screenshot.png"
      class="w-full" />
    <p>SC Crawler database schemas documented and visualized at dbdocs.io (last updated on April 28, 2024)</p>
  </a>
</div>
