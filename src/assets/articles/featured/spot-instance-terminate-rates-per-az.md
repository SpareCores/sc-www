---
# ~50 chars
title: Spot server termination rate per availability zones
date: 2024-04-16
# ~100 character
teaser: "AWS publicizes the expected termination rate of the spot instances per region, but what about AZs?"
# 320x220
image: /assets/images/blog/termination-rates-r7i.2xlarge-cropped.webp
author: Gergely Daroczi
tags: [aws, spot, data, featured]
---

We have been very satisfied users of the Spot Blocks for
Defined-Duration Workloads at Amazon Web Services (AWS), which allowed
us to pay a premium on spot prices not to be terminated for a defined
time period -- an awesome feature for ML model training batch jobs.

Unfortunately, this feature has been deprecated in 2021, officially
phased out at the end of 2022 for existing customers as well, but
somehow it seemed to be working fine until Q1 2024 ... when suddenly
the run instance API started to throw errors on the related
field, and we also started to face many new spot interruptions.

So we looked around how to find instance type/region/availability
zone/bid price combinations to minimize the risk to be interrupted,
and hereby we summarize what we have found.

## Bidding

An obvious and naive solution in the past was bidding higher on the
spot instances, but as <a
href="https://aws.amazon.com/blogs/compute/new-amazon-ec2-spot-pricing/"
target="_blank" rel="noopener">AWS phased out bidding in 2018</a>,
this is not an option anymore.

The promise of this change was fewer spot interruptions, but
unfortunately at the cost of less (actually: no) control. So we needed
to look further.

## Spot Instance advisor

Although AWS provides the <a
href="https://aws.amazon.com/ec2/spot/instance-advisor/"
target="_blank" rel="noopener">Spot Instance advisor</a> to check on
the frequency of interruption of the instance types in all AWS
regions, it is fairly limited in a number of ways:

- The data presented is not real-time, but based on the previous
  month's observations. Although this is a valuable and useful
  information as a baseline, spot instances are reclaimed based on
  demand, so patterns might change from time to time, and more current
  data would be much more beneficial for risk assessment.
- Similarly, the data is aggregated over a month, and we suspect that
  there are differences in termination rates e.g. on weekdays VS
  weekends, or day/night etc.
- The frequency of interruption is categorized into the ranges of <5%,
  5-10%, 10-15%, 15-20% and >20%. Although this is already a helpful
  signal, but there is a huge difference between 0% and 5%, similarly
  between 20% and 100% — see on that latter below.
- There is no breakdown within a region, e.g. looking at the
  differences between the availability zones might help better
  allocation of spot instances.

We could still run a few scenarios and check on the differences
between regions, also how the instance size might affect the
termination rate:

<div class="text-center m-2.5 mt-8 mb-6">
  <a href="https://aws.amazon.com/ec2/spot/instance-advisor/"
     target="_blank" rel="noopener"
     class="!no-underline">
    <img
      title="AWS Spot Instance advisor for the m5a instance family in us-east-1 (accessed on April 28, 2024)"
      src="/assets/images/blog/aws-spot-instance-advisor-m5a-20240428.png"
      class="w-full"/>
    <p>AWS Spot Instance advisor for the m5a instance family in us-east-1<br />(accessed on April 28, 2024)</p>
  </a>
</div>

Despite our expectations, the average rate of termination for larger
machines is not higher compared to mid-size instances. We expect this
might be due to the spot reclaim algo at AWS is less likely to
terminate a node taking up a(n almost) whole host server in favor of
new smaller requests. More data would be useful to check on this
hypothesis, but looking at a few instance families suggest that
mid-size machines are affected the most by spot instance termination.

Again, this is already useful, but as per above, we wanted to dig
deeper!

## Discovery

We suspected that there should be large differences in spot
termination rates between availability zones within the same region
due to sometimes experiencing huge variation in spot instance prices
between AZs, and also getting more and more spot instance termination
notices from specific regions and availability zones.

To confirm the above suspicions, we tried to run a few instance types
in parallel in all availability zones of the `us-west-2` region using
an infinite loop as per below:

- Start a node and log if the run request was successful or not (due
  to insufficient capacity).
- Wait for the job to run for 1 hour without interruption, or log the
  termination notice.
- Terminate either on the notice or after 1 hour.

We started with the `r7i.2xlarge` instance as previously experienced a
very high (much higher than >20% as reported by the Spot Instance
advisor) termination rate in the `us-west-2b` availability zone (or <a
href="/article/ids-vs-names">whatever it is called in your
AWS account</a>):

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    title="r7i.2xlarge spot instances started in us-west-2 (data collected an visualized by Spare Cores)"
    src="/assets/images/blog/termination-rates-r7i.2xlarge.png"/>
  <p>The status of r7i.2xlarge spot instances started in us-west-2<br />(data collected an visualized by Spare Cores)</p>
</div>

The data collection started midday on April 10, and although we had a
few hours logging issue in the afore-named region, it's clear that
except for 2 healthy runs, the instance was either not available to
start a job, or got killed within a few hours at `us-west-2b`.

We understand that this might be due to the large demand in that
availability zone -- due to the price differences based on our SCD
data collection:

```sql
SELECT
    price.observed_at,
    zone.name AS zone,
    price
FROM
    server_price_scd AS price
LEFT JOIN zone ON price.zone_id = zone.zone_id
WHERE
    price.server_id = 'r7i.2xlarge'
    AND allocation = 'SPOT'
    AND price.datacenter_id = 'us-west-2'
    AND price.observed_at >= '2024-04-01'
    AND price.observed_at < '2024-04-15'
ORDER BY 1, 2;
```

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    title="The spot prices of r7i.2xlarge per AZ in us-west-2 (data collected an visualized by Spare Cores)"
    src="/assets/images/blog/termination-rates-prices.png"/>
  <p>The spot prices of r7i.2xlarge per AZ in us-west-2<br />(data collected an visualized by Spare Cores)</p>
</div>

So although spot `r7i.2xlarge` instances are the cheapest by far in
the `us-west-2b` availability zones, it doesn't make any sense to try
to run it there, as either capacity will not be available, or your
instance will likely be killed withing a few minutes or hours.

Honestly, we don't understand why it makes sense for either AWS or the
customers.

We also checked on other instance types to see if it's specific to a
single instance family and/or size. For example, the `m5` instance
family was reported to have 15-20% or >20% frequency of interruption
as per the Spot Instance advisor, so very similar to the above
described `r7i` instance, but in practice, we saw very different
results:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    title="m5.large spot instances started in us-west-2 (data collected an visualized by Spare Cores)"
    src="/assets/images/blog/termination-rates-m5.large.png"/>
  <p>The status of m5.large spot instances started in us-west-2<br />(data collected an visualized by Spare Cores)</p>
</div>

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    title="m5.2xlarge spot instances started in us-west-2 (data collected an visualized by Spare Cores)"
    src="/assets/images/blog/termination-rates-m5.2xlarge.png"/>
  <p>The status of m5.2xlarge spot instances started in us-west-2<br />(data collected an visualized by Spare Cores)</p>
</div>

The 15-20% rate seems to be indeed correct for these instance types,
but it's possible to decrease that with the right AZ selection.

## Takeaway

Unfortunately, spot instance termination is happening at higher or
lower frequency depending on the instance type, region, and definitely
the selected availability zone as well -- but other than trying to
pick a combination to reduce the risk of unwanted termination, you
cannot eliminate it.

The Spare Cores team is dedicated to continue collecting data on
detailed termination rates and publish these results from
time-to-time, we are also looking into similar options at other
vendors, but since it seems that users of spot instances totally lost
control (either by bidding or paying premium) to reduce termination
risk, applications are better run on on-demand instances or be
prepared to checkpoint and gracefully restart within 2 minutes (30
seconds at GCP).
