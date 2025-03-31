---
# ~50 chars
title: Optimizing Resource Usage of Batch Jobs
date: 2025-03-31
# ~100 character
teaser: Seamlessly track the resource usage of e.g. Metaflow steps and find the best value servers for any workload!
# 320x220
image: /assets/images/blog/thumbnails/metaflow-tracker.webp
image_alt: Screenshot of a Metaflow card on resource usage of a GPU workflow step.
author: Gergely Daroczi
tags: [resource-tracker, metaflow, featured]
---

Over the past year, we focused on collecting, generating, and standardizing
pricing and performance data for over 2000 cloud servers across clouds. This
effort was not merely for data collection's sake.

Although this dataset is already valuable and useful on its own, the long-term
goal of the Spare Cores project has been to provide a seamless way to find the
best value servers for any workload, which includes monitoring the resource
usage of those workloads that we can use as a baseline when looking for the
optimal server configuration for future runs.

## Previous Work

As described in our [67% cost savings at adtech
company](/article/67pct-cost-saving-at-adtech-company) article, we have built a
custom resource tracker at a previous role to monitor the resource usage of data
science and machine learning batch jobs run in containers, usually on spot
instances. This solution was tailored to the company's specific infrastructure
and the data science team's workflow orchestrator, with simplifications such as
being limited to a single region of a single vendor and relying on `cgroups`
level resource usage collection. Consequently, it was not reusable at Spare Cores.

With Spare Cores developed as an open-source project from the beginning,
partially funded by an EU grant and not driven by specific business needs, we
decided to build a resource tracker that is agnostic to the infrastructure and
workflow, and can be used by a wider audience.

As noted above, this has been on the roadmap for a while, but we were always
busy with new vendor integrations, benchmarks and related visualizations. Thanks
to an inspiring conversation with Ville Tuulos from
<a href="https://outerbounds.com" target="_blank">Outerbounds</a>,
we decided to prioritize this feature at last in March 2025!

## Introducing the Resource Tracker Python Package

First, we wanted to build a resource tracker that is agnostic to the
infrastructure, and can be extended to be used in different frameworks and
environments, such as in Metaflow, Flyte, Airflow or Argo Workflows.

This led us to implement a Python package with minimal dependencies, designed to
be universally applicable without assumptions about the operating system, Python
version, or installed packages. Although this might sound like a simple task
(there are many resource tracker tools and agents out there), it was challenging
to support collecting resource usage on different operating systems — both at
the system level, and at the process level. The latter means that we closely
monitor a single process and its descendants, separated from the system-level
resource usage.

First, I came up with a quick and dirty `procfs` implementation with the
advantage of a fully self-contained solution that does not require any
additional software other than a modern Linux kernel. This was a good start,
but soon became too limiting as many developers and data scientists work on
non-Linux systems, and multiple workflow management tools used by them are well
supported on MacOS, so it was clear that we needed to find a more universal
solution.

So we implemented an alternative `psutil` approach that works on all operating
systems, but requires installing additional software. Now the package can
automatically detect the best way to collect the resource usage data based on
the operating system and installed packages — with the preference of using
`psutil` when available.

The performance of the `procfs` and the `psutil` implementations is similar (if
interested in more details, see the relevant section of the
<a href="https://sparecores.github.io/resource-tracker/#performance" target="_blank">package docs</a>), 
so you might wonder why we kept both implementations.

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

<pre class="command-line" data-prompt="$"><code class="language-sh">
pip install resource-tracker
</code></pre>

Development version can be installed directly from the git repository:

<pre class="command-line" data-prompt="$" data-continuation-str="\"><code class="language-sh">
pip install \
  git+https://github.com/sparecores/resource-tracker.git
</code></pre>

Note that depending on your operating system, you might need to also install
`psutil` (e.g. on MacOS and Windows).

## Standalone Usage

The package includes several helper functions and classes for collecting
resource usage data on CPU, memory, GPU, disk, and network at both the process
and system level.

The highest level of abstraction is the `ResourceTracker` class, which spawns or
forks descendant process(es) for the data collection, so it doesn't block your
Python script or application. Quickstart example:

<pre class="line-numbers"><code class="language-python">
from resource_tracker import ResourceTracker

tracker = ResourceTracker()
# your compute-heavy code
tracker.stop()

# your analytics code utilizing the collected data
tracker.pid_tracker
tracker.system_tracker
</code></pre>

This `ResourceTracker` instance gives you access to the collected data in
real-time, or after stopping the trackers via the `pid_tracker` and
`system_tracker` properties.
Both are <a href="https://sparecores.github.io/resource-tracker/reference/resource_tracker/tiny_data_frame/" target="_blank">`TinyDataFrame` objects</a>, 
which are essentially dictionaries of lists, with some convenience methods for
selecting rows and columns, pretty-printing and saving to CSV file.

It's possible to track only the system-wide or process-level resource usage by
the related init parameters, just like controlling the sampling interval, or how
to start (e.g. spawn or fork) the subprocesses of the trackers.

For even more control, you can use the underlying `PidTracker` and
`SystemTracker` classes directly. These do not start or manage descendant
processes, but simply log resource usage to the standard output or a file. For
more details, consult the package documentation, including detailed API
references at <https://sparecores.github.io/resource-tracker/>.

## Beyond Tracking

But again, why would you bother with running a resource monitoring tool on your
own? The initial goal was to provide a super simple way to track the resource
usage of Python applications, and then automatically find the best value servers
for the workload based on the collected data. So data collection is an essential
first step, but then we need analytics to dive deeper into the data, and a
recommender system integrated into the Spare Cores data to find the best value
servers for your workload.

This more complex scenario works best with a framework that can handle both the
data collection and the analytics etc. in an automated way, but we did not want
to come up with a new `n+1th` standard for that ... instead we decided to look
at the existing solutions and how we can integrate with them without much
compromises.

## Metaflow Integration

<a href="https://metaflow.org/" target="_blank">Metaflow</a> is a popular
workflow orchestration framework for data science and machine learning,
providing powerful features such as automatically versioned artifacts, HTML-based
step reports potentially including complex visualization, scalability etc., but
it lacks detailed step-level resource monitoring.

Integrating `resource-tracker` through a Metaflow extension provides an ideal
solution to this gap, offering seamless, comprehensive step profiling and
automated cloud resource recommendations, allowing you to focus on your core
business.

The `resource-tracker` package already provides this Metaflow extension, so
making use of it is as simple as adding the `@resource_tracker` decorator to
your steps:

<pre class="line-numbers" data-line="3,12"><code class="language-python">
from time import sleep

from metaflow import FlowSpec, step, track_resources


class MinimalFlow(FlowSpec):
    @step
    def start(self):
        print("Starting")
        self.next(self.do_heavy_computation)

    @track_resources
    @step
    def do_heavy_computation(self):
        # reserve 500 MB memory
        big_array = bytearray(500 * 1024 * 1024)
        # do some calcs
        total = 0
        for i in range(int(1e7)):
            total += i**3
        # do nothing for bit after releasing memory
        del big_array
        sleep(1)
        self.next(self.end)

    @step
    def end(self):
        pass


if __name__ == "__main__":
    MinimalFlow()
</code></pre>

Note that there's no need to import the `resource-tracker` package explicitly,
as the `@track_resources` decorator comes from the Metaflow extension, made
available through the `metaflow` Python package (second line of the example).

Once you add the `@track_resources` decorator to any of your steps (see e.g. the
`do_heavy_computation` step in the example above), the resource tracker will be
activated for that step, and you will see the resource usage data and cloud
resource recommendations in the auto-generated step report as a Metaflow card.

👉 For a live example, check out
<a href="/assets/slides/example-resource-tracker-report-in-metaflow.html" target="_blank">this example report 📜</a>

## Metaflow Card Details

The Metaflow card shows the resource usage of the step both at the process and
system level (including CPU, memory, GPU, disk, and traffic), plus the cloud
resource recommendations based on the collected data enriched with Spare Cores
data on cloud servers.

In more detail, the card displays the following information (with example
screenshots):

- High-level hardware configuration of the server that executed the step.

<img src="/assets/images/resource_tracker/resource-usage-server.webp" style="padding: 30px 0px 30px 30px;">

- Automated cloud and instance type discovery with the related costs
  (using public cloud pricing data from Spare Cores).

<img src="/assets/images/resource_tracker/resource-usage-cloud.webp" style="padding: 30px 0px 30px 30px;">

- Line charts showing the CPU, memory, GPU, disk, and traffic usage over time.

<img src="/assets/images/resource_tracker/resource-usage-cpu.webp" style="padding: 30px 0px 30px 30px;">

- Aggregated resource usage analysis of the most recent run, enhanced with
  historical data from the last five successful runs.

<img src="/assets/images/resource_tracker/resource-usage-stats.webp" style="padding: 30px 0px 30px 30px;">

- `@resources` recommendation for future runs based on the average CPU usage,
  peak memory reservation, and GPU utilization of the step — accompanied by a
  quick lookup for the cheapest server type across clouds that meets your step's
  resource requirements, and the related forecasted cloud expenses.

<img src="/assets/images/resource_tracker/resource-usage-rec.webp" style="padding: 30px 0px 30px 30px;">

But again, you better check out the
<a href="/assets/slides/example-resource-tracker-report-in-metaflow.html" target="_blank">example report 📜</a>
yourself, or even better, try it out in your own Metaflow workflows by
installing `resource-tracker` and then  importing and decorating your 
steps with the `@track_resources` decorator!

And yes, it works in local and remote executions as well, so you can use it in
Kubernetes (`@kubernetes`), AWS Batch (`@batch`), or your other preferred remote
compute service.

## Roadmap

The resource tracker is still in its early stages, with a lot of potential, and
we plan to extend it with additional open-source and some centrally managed
enterprise features, including:

- A 360° dashboard to track historical resource usage for all your steps,
  complete with anomaly annotations, future trend predictions, and tailored
  recommendations.
- Proactive resource monitoring and email alerting about overprovisioning and
  potential job failures due to insufficient allocated resources.
- Automated `@resources` tuning so that you can focus on your core business
  while the resource tracker optimizes the infrastructure parameters.
- More granular, line-by-line resource tracking of steps, complementing the
  time-based approach.
- Recommendations for splitting steps when resource usage patterns change, such
  as separating data loading from model training.

Here's a preview of the latter, planned code optimization feature:

<img src="/assets/images/resource_tracker/resource-usage-code-optimizer.webp" style="padding: 0px 0px 0px 30px;">

Please find more details and optionally subscribe to our related announcements at
<a href="/feedback/metaflow-resource-tracker">sparecores.com/feedback/metaflow-resource-tracker</a>.

## Feedback

We are always looking for and value feedback, so please share your thoughts and
suggestions either below in the comment box, or open a ticket in our <a
href="https://github.com/sparecores/resource-tracker/issues/new"
target="_blank">GitHub repository</a> 🙇
