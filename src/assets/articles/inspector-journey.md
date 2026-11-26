---
# ~50 chars
title: "From Cron Jobs to a Nine-Cloud Kubernetes Cluster"
date: 2026-11-26
# ~100 character
teaser: "How we replaced our Pulumi and GitHub Actions benchmark runner with our own multi-cloud Kubernetes node autoscaler."
# 320x220
image: /assets/images/blog/thumbnails/inspector-journey.webp
image_alt: "Pulumi + GitHub Actions, then Kubernetes + SCarpenter: 9 clouds, 195 regions, 3,657 instance types."
author: Attila Nagy
tags: [benchmark, open-source, kubernetes, spot, aws, gcp, azure]
---

Spare Cores helps you find the right cloud server. Our
[Server Navigator](/servers) lists thousands of instance types from multiple cloud
vendors in a single, searchable and comparable catalog, with up-to-date prices
for every region and availability zone. Prices and vendor-provided specs alone
don't tell you much, so we also start every server we can and look at it from the
inside. We record what hardware it actually has, from CPU
[topology](/server/azure/Standard_D96a_v4#lstopo) and
[caches](/server/gcp/c4-highmem-288-lssd-metal#processor) to
[disks](/server/gcp/c4-standard-288-lssd#system_resources) and
[GPUs](/server/gcp/a3-ultragpu-8g#system_resources). Some of the more
interesting ones: Azure's `Standard_D96a_v4` shows 12 NUMA nodes on just two
sockets, GCP's `c4-highmem-288-lssd-metal` has 1 GB of L3 cache and reads its
memory at 934 GB/s, `c4-standard-288-lssd`
comes with 48 local NVMe SSDs, and `a3-ultragpu-8g` packs eight H200 GPUs with
141 GB of memory each. Then we run a long list of benchmarks on it, from `stress-ng` and
GeekBench through memory bandwidth, compression, OpenSSL, static web serving,
Redis and PostgreSQL to LLM inference speed.

The big picture is described in the
<a href="https://docs.sparecores.com/under-the-hood/" target="_blank" rel="noopener">Under the Hood</a>
section of our documentation. In short: a crawler collects server and price data
from vendor APIs into a
<a href="https://docs.sparecores.com/data/" target="_blank" rel="noopener">SQLite database</a>.
The **inspector** decides which servers need to be (re)benchmarked and starts
them. The raw results land in the public
<a href="https://github.com/SpareCores/sc-inspector-data" target="_blank" rel="noopener">sc-inspector-data</a>
repository, from where the crawler parses them back into the database. That
database feeds our API and this website.

This article is about the inspector. It tells how we started, what hurt, and why
we ended up building our own multi-cloud Kubernetes node autoscaler. Some
highlights:

- **2.5 years of the original pipeline**: ~29,000 server starts, 76,000+ benchmark
  and inspection results, 153,000+ git commits, and an estimated ~35,000
  instance-hours of machine time.
- **Quotas were the real enemy, not the code**: we lost countless runs to "you can
  have 10 vCPUs in this region" limits. A single month of logs had 3,524 distinct
  Azure quota rejections across 212 instance types.
- **SCarpenter**: our own Karpenter-based node autoscaler that can launch **3,657
  instance types in 195 regions of 9 cloud vendors** into one Kubernetes cluster.
- **Fast nodes**: the median node is Ready **105 seconds** after the launch API
  call, compared with \~4 minutes before inspection could start in the old
  pipeline. A node is gone about 1.5 minutes after its last benchmark ends.
- **Spot first**: in the first week, spot capacity cut the bill for the spot
  node-hours by **77.6%**, and spot interruptions are retried, then fall back to
  on-demand automatically.

## The Original Pipeline: GitHub Actions + Pulumi

When we started in spring 2024, we wanted the simplest thing that could possibly
work and that needed no infrastructure of our own to run. We ended up with three
repositories:

- <a href="https://github.com/SpareCores/sc-runner" target="_blank" rel="noopener">sc-runner</a>,
  a thin wrapper around the
  <a href="https://www.pulumi.com/docs/iac/automation-api/" target="_blank" rel="noopener">Pulumi Automation API</a>
  that knows how to create a VM and its network at each vendor.
- <a href="https://github.com/SpareCores/sc-inspector" target="_blank" rel="noopener">sc-inspector</a>,
  a Python tool that both starts servers and runs the inspection tasks on them.
- <a href="https://github.com/SpareCores/sc-inspector-data" target="_blank" rel="noopener">sc-inspector-data</a>,
  a git repository that holds the results, the state, and the GitHub Actions
  workflows that drive it all.

There was no database and no long-running service: **git was the state**. Every
task of every server has a `meta.json` file with the start and end time, the exit
code, the error message and a hash of the task definition. The scheduling logic
was a cron-triggered GitHub Actions workflow, running every 15 minutes with one
job per vendor:

```yaml
name: Start instances for collecting data
on:
  schedule:
    - cron: "*/15 * * * *"
jobs:
  start-instances:
    strategy:
      matrix:
        vendor: ${{ fromJson(needs.setup.outputs.vendors) }}
      fail-fast: false
    container:
      image: ghcr.io/sparecores/sc-inspector:main
    steps:
      - name: inspector
        run: python /inspector/inspector.py start --vendor "${{ matrix.vendor }}" --limit 8
```

Each run went through these steps:

1. Load the latest Spare Cores SQLite database to list every active instance
   type and the regions and zones that offer it.
2. For each instance type, read the `meta.json` files from git. Start the
   server if a task has never run, if its definition (hash) changed, or if a
   retriable failure is old enough.
3. Write and push a "start lease" to git, so the next run doesn't start the same
   server again.
4. Run several `pulumi up` jobs in parallel threads, each creating one VM with a
   cloud-init script. Walk through the candidate regions and zones until one
   succeeds.
5. On the VM, cloud-init installs Docker and starts the inspector container
   again, this time in `inspect` mode. It runs the hardware discovery tasks
   (`dmidecode`, `lshw`, `lscpu`, `lstopo`, ...) in parallel, then the
   benchmarks one by one. After each group of tasks it commits the results and
   pushes them to git.
6. The VM powers itself off. Another workflow, also running every 15 minutes,
   notices that all tasks have ended and runs `pulumi destroy`.

It worked! Over the years it got us benchmarks for almost 4,000 server types:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    alt="Bar chart of servers started per month by the legacy inspector from April 2024 to October 2026, with peaks of 2,700-6,800 starts in June 2024, September 2024, November 2024, January 2025 and April 2025."
    src="/assets/images/blog/inspector-journey-legacy-starts.webp"/>
</div>
<p style="margin: 0px 50px 20px 50px; text-align: center; color: #999;">
  Servers started per month by the legacy pipeline ("Starting server" commits in sc-inspector-data).
</p>

But the peaks in the chart tell another story too: every new benchmark meant
another wave of thousands of servers, and every wave meant weeks of babysitting.

## The Struggles

### Pulumi Only, by Design

Our original intent was to rely **only on Pulumi** in the inspector, so that we
didn't have to write and maintain vendor-specific API code. Of course, Pulumi
providers are vendor-specific, but sc-runner hid most of that behind one
"create a server here" interface. The inspector never talked to a cloud API
directly.

The downside was that the inspector was blind. It didn't know how many vCPUs we
were allowed to run in a region, how many machines were already running, or
whether a region had capacity at all. All it got back was a failed `pulumi up`
with a vendor error buried in its output. So we did what you would expect:
we parsed Pulumi's output with ever-growing lists of patterns, like this excerpt
from the inspector:

```python
RETRYABLE_START_ERROR_MARKERS = (
    "InsufficientInstanceCapacity",
    "PublicIPCountLimitReached",
    "OperationNotAllowed",
    "exceeding approved",
    "QuotaExceeded",
    # GCP: Quota 'CPUS' / 'N2_CPUS' / 'NETWORKS' / … exceeded
    "Quota '",
    # UpCloud: CPU core quota of N exceeded … (type=SERVER_CORE_LIMIT_REACHED)
    "SERVER_CORE_LIMIT_REACHED",
    "CPU core quota",
)
```

A separate list held the errors that make a whole region useless, such as VPC,
subnet or address limits, or Azure's regional core quota. Those made the
inspector skip to the next region instead of trying another instance type.

### The Quota Hunger Games

We had a big struggle with nearly all of the hyperscalers to get actual quota.
New accounts start small, which is reasonable. But the limits are per instance
family, per region, and often per capacity type (spot or on-demand), and every
increase is a separate support ticket with an uncertain outcome. We'd get 96
vCPUs for one family in region A, 64 vCPUs for another family in region B, and a
default of 10 vCPUs (or zero) everywhere else. Even where we had quota, the
region could still be out of capacity for that particular instance type. Getting
enough quota to start the *largest* instances, like 192+ vCPU servers or 8-GPU
boxes, is still unusually hard.

Some examples from our logs and git history:

- **AWS**: in April 2025, while rolling out the LLM benchmarks, we hit
  `VcpuLimitExceeded: You have requested more vCPU capacity than your current vCPU limit of 16 allows`
  for `c5.12xlarge` (48 vCPUs), `c7g.16xlarge` and several `.metal` instances
  with up to 192 vCPUs. One cleanup commit had to reset 103 failed LLM results to
  retry them with the concurrency lowered to one server at a time.
- **Azure**: the last 126 runs of the start workflow (October 25 -
  November 20, 2026) contain **3,524 distinct quota rejections** of the "exceeding approved
  Total Regional Cores quota" kind, across **212 instance types**. In 2,575 cases
  the current limit was **10 vCPUs**, and in 932 it was **zero**. A typical one:
  `Standard_E16as_v5` in `centralindia` failed with
  `Current Limit: 10, Current Usage: 0, Additional Required: 16`. Our spot quota
  on Azure is 3 cores in every region, enough for nothing larger than 2 vCPUs.
  An earlier attempt with a Standard_HX176-24rs failed in australiaeast against
  a limit of 65 vCPUs for a 176 vCPU machine.
- **UpCloud**: `GPU-48xCPU-960GB-4xH100` failed with
  `Memory quota of 2800 GB exceeded by 112 GB`.
- **OVHcloud**: GPU flavors such as `h100-380` came back as `Flavor out of stock`.
- **OCI**: our core-count limit increase requests haven't been approved so far.

On top of the quota limits, our cloud credits ran out from time to time. The
comments in the (now disabled) start workflow still list which vendor was paused,
and why:

```yaml
# Vendor matrix (keep in sync with workflow_dispatch options except "all"):
#   aws,      # ran out of credits
#   gcp,      # ran out of credits at Aug 3, 2026
#   azure,    # we have no quota for new instances  → skiplist
#   alicloud,
#   hcloud,
#   upcloud,
#   vultr,
#   ovh       # ran out of credits                 → skiplist
```

### Tetris Without Seeing the Board

Quotas are measured in vCPUs per family, so they don't fit the "one instance type
at a time" thinking. With 96 vCPUs allowed for a family, you can start a 64 vCPU
and a 32 vCPU server together, but not a 64 vCPU and a 96 vCPU one. The inspector
had no central state about what was running where, so it couldn't plan for that.
It just tried, failed, and tried the next region. One commit message from
November 2026 sums it up: an Azure VM start walked the regions cheapest-first,
and "a typical SKU tried \~18 regions (1-2 minutes each) before landing".

To limit the damage, we kept lowering the number of servers started per vendor
and round: from 8 to 2 in September 2024, then to 1 in April 2025, with a code
comment that says it's "best to leave this at 1 to avoid quota issues". With a
15-minute schedule, that's at most 4 servers per vendor per hour. At the very end
we gave up on the "no direct API calls" rule for Azure, and started reading its
quota API to order the regions.

### Slow and Fragile State

Pulumi is a great tool for long-lived infrastructure. For short-lived benchmark
servers it was slow: a median of 47 seconds just for `pulumi up` (and 114 seconds
at p90), and about **4 minutes** from the API call until the inspector started on
the machine (7 minutes at p90). Every server was a separate Pulumi stack with its
own state file and lock in object storage. When a GitHub Actions job was
cancelled or timed out during `pulumi up` or `pulumi destroy`, the stack was left
locked, sometimes with pending operations that didn't match reality. Then
someone had to cancel the lock, compare the stack with what was actually
running at the vendor, and clean up both. Over the years we added:

- separate working directories per thread, because parallel runs corrupted a
  shared `Pulumi.yaml`,
- retries for `ConcurrentUpdateError`, and automatic lock removal after a day,
- a safety-net workflow that lists every stack directly from the state backend
  and destroys leftovers twice a day,
- hard timeouts on every git subprocess, because many parallel inspectors pushing
  to the same repository made git operations hang.

In August 2026 a single cleanup commit removed 1,146 "started but never ended"
`meta.json` files across 166 instance types, left behind by broken runs.

## If Everybody Uses Kubernetes, Why Don't We?

At some point we sat down and asked the obvious question. Everything we built by
hand is already in Kubernetes: a scheduler, a central state, retries, leases, and
clean deletion of resources. What we really needed was a
<a href="https://kubernetes.io/docs/concepts/cluster-administration/node-autoscaling/" target="_blank" rel="noopener">node autoscaler</a>:
something that sees a pending Pod that asks for "a `c7g.16xlarge` at AWS", starts
exactly that machine, and joins it to the cluster as a node.

Kubernetes has two widely used node autoscalers.
<a href="https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler" target="_blank" rel="noopener">Cluster Autoscaler</a>
resizes predefined node groups, which doesn't fit "start any of 3,000+ instance
types once". <a href="https://karpenter.sh/" target="_blank" rel="noopener">Karpenter</a>
launches right-sized nodes directly from Pod requirements, which is exactly the
model we wanted. But its cloud providers each cover one vendor and expect the
nodes to live next to that vendor's managed cluster. We even built a small
helper,
<a href="https://github.com/SpareCores/sc-karpenter-nodepool" target="_blank" rel="noopener">sc-karpenter-nodepool</a>,
that turns Spare Cores data into Karpenter NodePools for managed Karpenter
offerings such as EKS Auto Mode and AKS node auto-provisioning. That was useful,
but it was still one cloud per cluster. We couldn't find anything that joins
nodes from nine vendors into one cluster, so we built it.

## SCarpenter

**SCarpenter** is a multi-vendor
<a href="https://karpenter.sh/" target="_blank" rel="noopener">Karpenter</a> cloud
provider. It runs as a single Deployment in any conformant Kubernetes cluster,
and launches any instance type of any supported vendor as a node, choosing the
cheapest matching offering from the Spare Cores catalog. Karpenter core does
what it is good at: NodePools, NodeClaims, disruption, expiry and consolidation.
SCarpenter adds the vendor drivers and an `SCNodeClass` resource, and one class
can span many vendors.

Some of the design choices that make it work:

- **All data comes from the Spare Cores API.** Instance types, regions, zones,
  prices, CPU and GPU details are never hard-coded. The full catalog is about
  half a million offerings (instance type × zone × capacity type), kept in
  memory and refreshed regularly. Instance types are named like
  `aws.c7g.16xlarge` or `oci.VM.Standard.E6.Flex.2-16`.
- **Every node runs <a href="https://www.flatcar.org/" target="_blank" rel="noopener">Flatcar Container Linux</a>.**
  The user data is a small Ignition config. On first boot it downloads pinned
  <a href="https://flatcar.github.io/sysext-bakery/" target="_blank" rel="noopener">systemd-sysext</a>
  images (Kubernetes, Tailscale), checks their sha256 sums and activates them. No
  package installation, no configuration management, and the same image
  everywhere: from a 2 vCPU VM to bare metal, on all nine vendors. Where a vendor
  has no official Flatcar image, we import or build one.
- **Plain TLS bootstrap.** The controller mints a short-lived bootstrap token
  for each NodeClaim, and the kubelet uses it to get its certificate. No
  cloud-controller-manager is needed, so it works with k3s, kubeadm or RKE2.
- **A mesh VPN instead of cloud networks.** Every node joins a
  <a href="https://tailscale.com/" target="_blank" rel="noopener">Tailscale</a>-compatible
  tailnet with an ephemeral, pre-authorized key minted for it, and the kubelet
  uses its tailnet address. A node in Jakarta and another in Iowa are on the same
  flat network a minute or two after their launch.
- **Quota is not capacity.** Drivers report quota buckets where the vendor has
  an API for that, and a quota tracker checks headroom before a launch. A quota
  error marks the bucket as unavailable for 5 minutes. A capacity error marks the
  offering as unavailable for 3 minutes, so Karpenter can move on to the next
  cheapest one. Mixing the two up makes Karpenter retry forever, so a driver must
  never report a quota limit as missing capacity.
- **Spot interruptions are handled on the node.** A small agent watches the
  vendor's interruption notice (AWS: 2 minutes, Alibaba: 5 minutes, Azure and
  GCP: about 30 seconds) and marks the node. Karpenter then drains it, and that
  instance type and zone are kept out of spot scheduling for 10 minutes.
- **Nothing leaks.** A garbage collector deletes tagged instances that have no
  NodeClaim, and also cleans up nodes that never became Ready and orphaned
  bootstrap tokens.

## The Cluster: Nine Clouds, One Pulumi Repo

The cluster itself is defined in a single Pulumi repository. Pulumi is still a
great fit for long-lived infrastructure:

- The **control plane** is
  <a href="https://k3s.io/" target="_blank" rel="noopener">k3s</a> with embedded
  etcd on three small Flatcar VMs, in three European metros of one provider. The
  control plane is kept almost idle on purpose: everything else runs on worker
  nodes that SCarpenter launches.
- The **mesh** is a self-hosted
  <a href="https://headscale.net/" target="_blank" rel="noopener">Headscale</a>
  server. Only one copy is active at a time, chosen by a lease in object storage,
  with its database continuously replicated, so another control plane node can
  take over within a minute. Pod traffic goes over flannel on top of the tailnet.
- **No static cloud credentials.** The cluster has its own OIDC issuer, so
  workloads (the inspector, SCarpenter, the secrets operator) get short-lived
  cloud credentials through workload identity federation, each with its own
  least-privilege role per vendor. GitHub Actions uses the same OIDC approach
  to deploy.
- **The bootstrap is thin.** One idempotent script per vendor creates only the
  identities Pulumi needs, and all vendor CLIs run in pinned containers, so the
  only requirements are bash and Docker. Everything else (identities, networks,
  images, DNS, the cluster, apps) is Pulumi, deployed from CI with a read-only
  preview on every pull request.

The cluster runs three node pools: always-on apps (like our API), observability,
and **bench**: an empty pool with no limits, where nodes appear and disappear
as the benchmarks need them.

## What This Cluster Can Do

The numbers below come from the live `bench` node class, which shows what
SCarpenter can launch right now. Instance types that can't be launched at the
moment (no price, no offering, or no quota) are left out.

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    alt="Horizontal bar chart of launchable instance types per vendor: AWS 1,350 in 32 regions, Azure 694 in 49, GCP 556 in 42, Alibaba Cloud 485 in 10, OCI 276 in 3, Vultr 111 in 33, OVHcloud 88 in 15, UpCloud 79 in 5, Hetzner Cloud 18 in 6."
    src="/assets/images/blog/inspector-journey-universe.webp"/>
</div>

That's **3,657 instance types in 195 regions of 9 vendors**, about 226,000
launchable offerings when you count every zone and capacity type. Any of them can
be a Kubernetes node within a couple of minutes, from a single `kubectl apply`:

<div class="text-center m-2.5 mt-8 mb-6">
  <img class="zoomin w-full"
    alt="Horizontal bar chart of median and p90 seconds from launch API call to node Ready per vendor: Hetzner 72/83, AWS 83/120, GCP 85/101, OCI 93/169, Alibaba 104/106, Azure 108/132, Vultr 131/225, OVHcloud 153/206, UpCloud 232/308."
    src="/assets/images/blog/inspector-journey-boot-times.webp"/>
</div>
<p style="margin: 0px 50px 20px 50px; text-align: center; color: #999;">
  Median and p90 time from the launch API call to a Ready node, from 318 launches in the first week.
</p>

Across all launches, the median is **105 seconds** and p90 is 193 seconds. That's
from nothing to a Flatcar machine that has booted, joined the mesh, registered
with the control plane and is ready to run Pods. Hetzner, AWS and GCP usually do
it in less than a minute and a half. Bare metal is a different story: a Vultr
bare-metal server took more than 15 minutes to register. That's longer than
Karpenter's fixed 15-minute registration timeout, so we had to patch Karpenter
core to make the timeout configurable.

Teardown is just as quick. Once the last Pod is gone, the node is deleted and
the instance is terminated in about 1.5 minutes. In the old pipeline, a finished
server waited for the next 15-minute cleanup run, and then for a `pulumi destroy`.

## k8s-inspector: Benchmarks as Pods

With SCarpenter in place, the inspector became a fairly small Kubernetes
controller called **k8s-inspector**. It keeps the parts that worked: git is
still the source of truth for results, and the task hashes, the `meta.json`
format and the directory layout are byte-for-byte compatible with the old
inspector. Everything else changed.

**Planning.** At regular intervals, for each vendor, it asks the Spare Cores
API which active servers are eligible for which tasks. The API knows which
tasks need a GPU, how much memory, and so on. The planner then compares that
with the `meta.json` files and picks the next server with due tasks. Servers
that SCarpenter can't launch right now (no quota, no price, no offering) are
skipped. Per-vendor limits cap the number of runs in flight and the spend per
hour.

**Running.** A benchmark run is a custom resource that also acts as a lease, and
gets one fresh node. The controller creates a pending "anchor" Pod pinned to the
exact vendor and instance type, which makes SCarpenter launch exactly that
machine. Then it runs the tasks as separate Pods placed directly on that node. The
hardware discovery tasks run concurrently as containers of a single Pod, and the
benchmarks then run one by one, each in its own Pod, so a benchmark never shares
the machine with another task. When the run is over, the anchor Pod is deleted
and the node goes away with it.

Here is a snapshot of the cluster from earlier today, as listed by
`kubectl get pods -o wide` (trimmed):

```sh
$ kubectl -n inspector get pods -o wide
NAME                                                       READY  STATUS             AGE    NODE
aws-c4-8xlarge-071ba1a2-a1                                 1/1    Running            69m    bench-nfgfb
aws-c4-8xlarge-071ba1a2-a1-10-vllm                         1/1    Running            19m    bench-nfgfb
aws-c6g-metal-06eeb3ef-a1                                  1/1    Running            69m    bench-ssb82
aws-c6g-metal-06eeb3ef-a1-09-vllm                          1/1    Running            16m    bench-ssb82
aws-db-r8g-2xlarge-45c9ce6e-a1                             1/1    Running            23m    bench-952fn
aws-db-r8g-2xlarge-45c9ce6e-a1-01-pgbench-postgres-dbaas…  1/1    Running            16m    bench-952fn
aws-hpc7a-96xlarge-07b54b9e-a1                             1/1    Running            58m    bench-7vq96
aws-hpc7a-96xlarge-07b54b9e-a1-09-vllm                     1/1    Running            7m33s  bench-7vq96
aws-m6g-8xlarge-07c8dfd9-a1                                1/1    Running            29m    bench-77ghc
aws-m6g-8xlarge-07c8dfd9-a1-03-compression-text            1/1    Running            12m    bench-77ghc
aws-m8ine-xlarge-06798589-a1                               1/1    Running            87m    bench-ptc9v
aws-m8ine-xlarge-06798589-a1-16-llm                        0/1    ContainerCreating  30s    bench-ptc9v
aws-p5e-48xlarge-06769db9-a1                               0/1    Pending            5m43s  <none>
aws-r5a-2xlarge-069b7213-a1                                1/1    Running            87m    bench-2nj7g
aws-r5a-2xlarge-069b7213-a1-10-vllm                        1/1    Running            35m    bench-2nj7g
aws-r8in-8xlarge-080c804b-a1                               1/1    Running            5m42s  bench-8r4zs
aws-r8in-8xlarge-080c804b-a1-05-pgbench-postgres-ro-du…    1/1    Running            3m18s  bench-8r4zs
azure-standard-e20s-v6-0c51fa7a-a1                         1/1    Running            103s   bench-dfqjk
dbaas-up-azure-standard-e20s-v6-0c51fa7a-8jgbn             1/1    Running            7s     apps-czs4z
oci-vm-standard-e6-flex-2-16-322f575d-a1                   1/1    Running            118m   bench-w55h9
oci-vm-standard-e6-flex-2-16-322f575d-a1-18-vllm           1/1    Running            16m    bench-w55h9
vultr-vultr-dbaas-startup-cc-hp-amd-2-80-2-eec221a0-a1     1/1    Running            6m50s  bench-wsj67
```

The names are easy to read once you know the scheme. In
`aws-c4-8xlarge-071ba1a2-a1-10-vllm`, the first part is the vendor and the
instance type. `071ba1a2` is a CRC32 hash of `aws/c4.8xlarge`, which keeps the
name unique and also orders the queue, so small and large servers are mixed.
`a1` is the first attempt, `10` is the step number and `vllm` is the task. The
Pods without a step suffix are the anchors that hold the nodes. The `db` and
`dbaas` runs benchmark managed PostgreSQL services: the database is created by a
short-lived `dbaas-up` Job, and the benchmark client runs on a node launched by
SCarpenter in the same region.

Most of these nodes ran in a region that none of us would have picked by hand,
because SCarpenter just chose the cheapest one with capacity:

| Run | vCPUs | Vendor / region | Capacity | Price paid ($/h) | On-demand ($/h) |
|---|---:|---|---|---:|---:|
| `c4.8xlarge` | 36 | AWS `us-east-2` | spot | 0.293 | 1.591 |
| `c6g.metal` | 64 | AWS `ap-southeast-5` (Malaysia) | spot | 0.233 | 2.133 |
| `hpc7a.96xlarge` | 192 | AWS `us-east-2` | on-demand | 7.219 | 7.200 |
| `m6g.8xlarge`, attempt 1 | 32 | AWS `eu-north-1` | spot, interrupted | 0.187 | 1.312 |
| `m6g.8xlarge`, attempt 2 | 32 | AWS `eu-north-1` | spot, interrupted | 0.204 | 1.312 |
| `m6g.8xlarge`, attempt 3 | 32 | AWS `ap-south-1` | on-demand | 0.831 | 0.810 |
| `m8ine.xlarge` | 4 | AWS `us-west-2` | spot | 0.130 | 0.418 |
| `r5a.2xlarge` | 8 | AWS `eu-west-3` | spot | 0.143 | 0.532 |
| `r8in.8xlarge` | 32 | AWS `ap-northeast-1` | spot | 0.804 | 4.066 |
| `db.r8g.2xlarge` client (`c6a.large`) | 2 | AWS `us-east-1` | on-demand | 0.077 | 0.077 |
| `Standard_E20s_v6` | 20 | Azure `eastus2` | on-demand | | 1.323 |
| `VM.Standard.E6.Flex.2-16` | 4 | OCI `eu-frankfurt-1` | preemptible | 0.053 | 0.092 |
| Vultr DBaaS client (`vc2-2c-4gb`) | 2 | Vultr `ams` | on-demand | | |
| `p5e.48xlarge` (8x H200) | 192 | AWS | still looking for capacity | | |

The `m6g.8xlarge` run shows the whole retry ladder: it was interrupted twice on
spot in Stockholm, so the third attempt went on-demand, which happened to be
cheapest in Mumbai. Only the interrupted task had to run again on each new node.
The 8-GPU `p5e.48xlarge` shows the other side: quota and capacity for the largest
GPU servers are still the hardest part.

**Spot first, carefully.** Spot (or preemptible) capacity is available at AWS,
GCP, Azure, Alibaba Cloud and OCI, and k8s-inspector prefers it. The anchor Pod
allows both spot and on-demand, so if there's no spot capacity, SCarpenter falls
back on its own. Every task's outputs are uploaded before the next task starts,
so an interruption costs at most the task in flight. After two interrupted spot
attempts (or an hour of lost work), the run continues on-demand only. An instance
type interrupted twice in two weeks goes on-demand for a while, and tasks longer
than 4 hours never run on spot. In the first week, nodes ran 122 hours on spot.
For the spot hours we could match with a list price, we paid **\$76.61 instead of
\$341.98**, which is a **77.6%** saving. Only 8 attempts were interrupted.

**Retries with reasons.** SCarpenter records why a launch failed on the
NodeClaim, and the controller turns that into a decision. Insufficient capacity
and quota errors are temporary and retried, while a rejected launch request is
permanent. A machine that fails to boot gets one retry a day later. Failed tasks
back off for 2, 6 and then 24 hours. A run also has a launch budget in CPU-minutes
(or GPU-hours) before it gives up.

**Results.** The task Pods have no cloud credentials. A tiny static Go binary in
every container writes the output to the local disk and uploads it to object
storage through presigned URLs signed by the controller. One publisher in the
controller is the only git writer: it renders the finished tasks into
sc-inspector-data and pushes every few minutes. No more dozens of machines racing
to push to the same repository.

## Keeping Kubernetes Out of the Way

Benchmark numbers are only useful if they reflect the server, not our setup.
So the new results had to stay comparable with the old ones, which ran directly
on a VM. This is what we do:

- **One run, one node.** The bench pool is tainted, every run gets a fresh node
  that is never reused, and only our own Pods run there.
- **No CPU limits.** Task Pods are privileged and have no CPU limit, so there is
  no CFS throttling. Their CPU request is everything the node can allocate, minus
  the small system Pods, which gives them nearly all the CPU weight. Every task
  runs at `nice -20`. In a test, a Guaranteed QoS Pod with a CPU limit lost about
  5% on Redis with pipelining, which is why we don't use limits.
- **Pick the right network namespace.** Most tasks run with the host network.
  The loopback-only benchmarks (Redis, static web serving) are the exception: the
  host's loopback goes through netfilter hooks from kube-proxy, flannel and
  Tailscale, so those run in the Pod's own network namespace, which turned out to
  be closer to the old bare-VM results.
- **A lean node.** The kubelet reserves only about 370 MiB, `maxPods` is 10, and
  Docker, `systemd-oomd`, automatic updates and vendor agents are disabled. Memory
  pressure triggers the kernel's OOM killer instead of kubelet evictions, and our
  task runner protects itself with `oom_score_adj` set to -1000.
- **Pull between tasks, not during them.** Each step's container image is pulled
  before the task starts. Local instance storage is left raw for the storage
  benchmark, and kernel mitigations stay at their defaults, as on the old VMs.

We also tested CPU pinning, transparent huge pages, `sched_autogroup` and a few
cgroup tweaks. None of them changed the results by more than the noise (1-4%), so
we kept it simple.

## War Stories

Getting here took a lot of debugging (we did much of this work together with AI
coding agents). A few stories we'll remember:

- **The firewall that switched itself off.** Our control plane nodes suddenly
  couldn't reach each other. A bug in the Pulumi provider sent `enabled: false`
  for the private network firewall rule set on every in-place update. The
  provider's default is to drop everything that doesn't match a rule, so private
  traffic stopped. The fix was setting `enabled=True` explicitly.
- **Tags that weren't allowed.** None of the control plane nodes could join the
  mesh. Headscale rejects any tags a node requests when it uses a pre-auth key,
  because the tags come from the key itself. Our integration test joined without
  tags, so it passed. Replacing every control plane node to fix one flag is a slow
  exercise when you only replace one per day.
- **The Great Firewall vs. Ignition.** A node in mainland China hung for 9+
  minutes in its first boot. It kept retrying to download the Tailscale sysext
  from GitHub. Mainland China regions are out for now, which also took Alibaba
  Cloud from 32 to 10 regions.
- **Bare metal that boots over iSCSI.** OCI bare-metal servers attach their boot
  disk over iSCSI. Flatcar's early boot needs the `/usr` partition before the
  iSCSI login happens, so the machine waited for about 6 minutes, then
  rebooted. SCarpenter now marks those shapes as not launchable, based on the
  vendor's shape data rather than names, until Flatcar supports it.
- **A missing permission on terminate.** At OCI, terminating an instance that
  has volumes attached needs separate permissions to detach them. Our test
  account had broader permissions than production, so it only failed in
  production.
- **A race inside Karpenter.** A test that allows only one node at a time failed
  in 40-50% of runs. Karpenter core stops counting a node once its instance is
  terminating, but the Node object lives about 10 seconds longer. The fix was to
  count such nodes as "still disrupting" until they are really gone.
- **Arm64 Flatcar on GCP.** There were no official arm64 Flatcar images for GCP,
  so we built our own until upstream ships them.

## Summary

We started in 2024 with sc-runner, Pulumi and sc-inspector, driven by GitHub
Actions cron jobs, with git as the only state. It started servers about
**29,000 times**, collected **76,000+** inspection and benchmark results for
almost 4,000 server types across 8 vendors, and made more than **150,000 git
commits**. We measured 4,290 hours of instance time for the 3,392 runs that have
full timing data. Extrapolating that to all starts, it burned roughly **35,000
instance-hours**, about four years of machine time.

The pain was never the benchmarks themselves. It was getting machines: quotas
per family, region and capacity type that we could only discover by failing,
out-of-capacity errors, slow and fragile Pulumi state, and no central view of
what was running. We worked around it with error-string parsing, region walking,
cleanup workflows and fewer and fewer parallel starts.

Then we asked why we weren't using Kubernetes. No existing node autoscaler could
join machines from many clouds into one cluster, so we built **SCarpenter** on
top of Karpenter, and rewrote the inspector as **k8s-inspector**: a small
controller that turns benchmark runs into Pods.

Today, a single cluster defined in Pulumi can launch **3,657 instance types in
195 regions of 9 cloud vendors**, with a median of 105 seconds from API call to
Ready node, spot first, with automatic on-demand fallback. In its first week the
new pipeline ran **352 runs** (181 server and 171 managed-database benchmark
runs) on **130 instance types** in **37 regions** of all 9 vendors. It published
**3,653 task results** using 280 node-hours, and saved 77.6% on its spot hours.
The old pipeline started at most 4 servers per vendor per hour. On this day the
new one ran more than a dozen in parallel, from Malaysia to Stockholm.
