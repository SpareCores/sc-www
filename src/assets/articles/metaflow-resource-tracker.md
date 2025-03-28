---
# ~50 chars
title: Optimize Resource Usage of Batch Jobs
date: 2025-03-28
# ~100 character
teaser: Seamlessly track the resource usage of e.g. Metaflow steps and find the best value servers for any workload!
# 320x220
image: /assets/images/blog/thumbnails/metaflow-tracker.webp
image_alt: Screenshot of a Metaflow card on resource usage of a GPU workflow step.
author: Gergely Daroczi
tags: [resource-tracker, metaflow, featured]
---

We have spent the past year or so at Spare Cores on collecting (sometimes
generating) and standardizing pricing and performance data of 2000+ cloud
servers across clouds, but we did so not only for the sake of it. Although this
data is already valuable and useful on its own, but the long-term goal of the
Spare Cores project has been to provide a simple way to find the best value
servers for any workload, in a seamless way, which includes monitoring the
resource usage of those workloads that we can use as a baseline when looking for
the optimal server configuration for future runs.

## Previous Work

As described in our [67% costs savings at adtech
company](/article/67pct-cost-saving-at-adtech-company) article, we have built a
custom resource tracker at a previous role to monitor the resource usage of data
science and machine learning batch jobs run in containers, usually on spot
instances. This was rather specific to the company's infrastructure and the data
science team's workflow orchestrator, including simplifications - such as being
limited to a single region of a single vendor, and being able to rely on
collecting resource usage at the `cgroups` level - so we couldn't reuse it at Spare
Cores.

Now that we had the chance to work on Spare Cores as an open-source project,
partially funded by an EU grant and not driven by specific business needs, we
decided to build a resource tracker that is agnostic to the infrastructure and
workflow, and can be used by a wider audience.

As noted above, this has been on the roadmap for a while, but we were always
busy with new vendor integrations and benchmarks. Thanks to an inspiring
conversation with Ville Tuulos from <a href="https://outerbounds.com" target="_blank">Outerbounds</a>,
we decided to prioritize this feature at last in March 2025!
