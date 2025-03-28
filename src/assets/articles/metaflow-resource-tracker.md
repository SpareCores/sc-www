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

## Introducing the Resource Tracker Python Package

First, we wanted to build a resource tracker that is agnostic to the
infrastructure, and can be extended to be used in different frameworks and
environments, such as in Metaflow, Flyte, Airflow or Argo Workflows.

This suggested us to implement a Python package with minimal dependencies that
can be used anywhere without assumptions on the operating system, the Python
version, or installed packages. Although this might sound like a simple task
(there are many resource tracker tools and agents out there), it was challenging
to support collecting resource usage on different operating systems -- both at
the system level, and at the process level. This latter means that we
closely monitor a single process and its descendants, separated from the
system-level resource usage.

First, I came up with a quick and dirty `procfs` implementation with the
advantage of a fully self-contained solution that does not require any
additional software other than a modern Linux kernel. This was a good start,
but soon became too limiting as many developers and data scientists work on
non-Linux systems, and multiple workflow management tools used by them are well
supported on MacOS, so it was clear that we needed to find a more universal
solution.

This led to introducing an alternative `psutil` implementation that works on all
operating systems, but requires installing additional software. Now the package
can automatically detect the best way to collect the resource usage data based
on the operating system and installed packages -- with the preference of using
`psutil` when available.

The performance of the `procfs` and the `psutil` implementations is similar (if
interested in more details, see the relevant section of the
<a href="https://sparecores.github.io/resource-tracker/#performance" target="_blank">package docs</a>), 
so you might wonder why kept both implementations.

The `psutil` implementation works on all operating systems at the cost of the
extra dependency, while the `procfs` implementation works without any additional
dependencies, but only on Linux. This latter can be useful when deploying cloud
applications in limited environments without easy control over the dependencies
(e.g. Metaflow step decorator without explicit `@pypi` config).

## Installation

The
<a href="https://pypi.org/project/resource-tracker/" target="_blank">
  `resource-tracker` package
  <img src="https://img.shields.io/pypi/v/resource-tracker?color=%2332C955" alt="resource-tracker package on PyPI" style="display: inline-block; vertical-align: middle;"/>
</a>
is available on PyPI, so you can install it with:

```sh
pip install resource-tracker
```

Development version can be installed directly from the git repository:

```sh
pip install \
  git+https://github.com/sparecores/resource-tracker.git
```

Note that depending on your operating system, you might need to also install
`psutil` (e.g. on MacOS and Windows).
