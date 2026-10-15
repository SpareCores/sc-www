---
# ~50 chars
title: "Burning CPU Cycles: Comparing stress-ng CPU Methods"
date: 2026-10-15
# ~100 character
teaser: "How almost 80 stress-ng CPU methods scale with SMT, many cores, and Arm, and why we picked div16 for the SCore."
# 320x220
image: /assets/images/blog/thumbnails/stress-ng-cpu-methods.webp
image_alt: Bar chart of the multi-core scaling factor of stress-ng CPU methods on a single hyper-threaded core.
author: Adam Toth
tags: [benchmark, performance, score, compute power, scalability, vcpu]
---

<!--
EDITOR NOTES (remove before publishing):
- Charts and thumbnail are placeholders; see the HTML comment specs next to each image.
- Source data: Linear DEV-297 (copied from Slack, June 2024).
-->

When we introduced the SCore, our default CPU performance metric, we wrote in
the [Unlocking Cloud Compute Performance](/article/cloud-compute-performance-benchmarks)
article that we evaluated "approximately 50 CPU stress methods" of `stress-ng`
before picking `div16`. We never published the actual numbers, though, nor
explained in detail why we went with integer divisions instead of something
fancier, like matrix products or FFTs.

So we dug up the raw results from our June 2024 experiments, cleaned them up,
and looked at them again with fresh eyes. It turns out the choice of the CPU
burning method matters a lot more than one would expect from a "simple" stress
test.

If you're here for the numbers, some highlights:

- **SMT can double the score, or do nothing**: on a single hyper-threaded
  core, running two workers instead of one gave anywhere between 0.97x and
  2.02x the throughput, depending on the method.
- **Divisions track physical cores**: the `div8`, `div16`, `div32`, and
  `div64` methods scaled almost exactly with the number of physical cores on
  every server we tested.
- **Arm hates `long double`**: on a Graviton2 core, most methods doing
  `long double` math ran 5x to 69x slower than on an AMD core, while the
  median method was only ~2x slower.
- **The method changes the ranking**: an Intel Ice Lake core was 2.1x faster
  than an AMD Genoa core on `longdouble`, but 3.4x slower on `callfunc`.

If you're primarily interested in the results rather than the technical
details, feel free to skip ahead to the [Results](/article/stress-ng-cpu-methods#results).

## Background

`stress-ng` is a fantastic tool to put load on various parts of a Linux
system, and its `cpu` stressor alone ships with dozens of different ways to
keep the CPU busy. Each of these is a "CPU method", selected with the
`--cpu-method` flag: some compute mathematical constants (`pi`, `euler`,
`apery`), some do integer or floating point arithmetic on a given data type
(`int64`, `float32`, `decimal128`), and some run small classic algorithms
(`hanoi`, `queens`, `sieve`, `matrixprod`). The
<a href="https://manpages.ubuntu.com/manpages/focal/man1/stress-ng.1.html" target="_blank" rel="noopener">manual page</a>
lists all of them with a short description, and the implementation lives in
`stress-cpu.c` in the
<a href="https://github.com/ColinIanKing/stress-ng" target="_blank" rel="noopener">stress-ng GitHub repository</a>.

When the `--metrics` flag is set, `stress-ng` reports the number of "bogo
operations" per second: how many times the method's loop completed. Note that
`stress-ng` normalizes the bogo-ops of each method using a per-method
reference rate hardcoded in `stress-cpu.c`, so the absolute numbers are
roughly in the same ballpark across methods (mostly between 1000 and 5000 on a modern x86
core). This makes the methods somewhat comparable, but it does not mean a
`div16` bogo-op is the same amount of work as a `trig` bogo-op.

The default method is `all`, which cycles through every other method one
iteration at a time. This sounds like a fair average, but as we will see
below, it inherits all the quirks of the individual methods.

But why do we care about the method at all? Because we wanted a single number
describing the raw multi-core performance of a server: one that grows with the
number of physical CPU cores, and doesn't reward or punish SMT (Simultaneous
Multithreading, also known as Hyper-Threading) in surprising ways. As we
described in the [vCPUs in the Real World](/article/multi-core-scalability)
article, a vCPU is often just a hyper-thread, and a hyper-thread is not a
core.

## Methodology

We ran each CPU method twice on each server for 10 seconds: once with a
single worker, and once with one worker per vCPU. We used the official Docker
image of `stress-ng`, and the following loop, where `/tmp/tests` listed all
the method names:

<pre class="command-line" data-prompt="$" data-continuation-str="\"><code class="language-sh">
for i in $(cat /tmp/tests); do \
  cpu1=$(docker run --rm -ti ghcr.io/colinianking/stress-ng --metrics --cpu 1 --cpu-method $i -t 10 | egrep 'metrc.*cpu' | awk '{print $9}'); \
  cpu2=$(docker run --rm -ti ghcr.io/colinianking/stress-ng --metrics --cpu 2 --cpu-method $i -t 10 | egrep 'metrc.*cpu' | awk '{print $9}'); \
  echo "$i;$cpu1;$cpu2"; \
done
</code></pre>

> Editor's note (remove before publishing): the loop above was copied from
> the original notes and starts two workers in the second run. The results
> on every server other than `c6a.large` scale with the vCPU count (e.g.
> ~126x on the 128 vCPU `c7a.32xlarge`), so the second run must have used
> one worker per vCPU (`--cpu 0` or `--cpu $(nproc)`) there. Please confirm
> and fix the snippet. Also confirm the `stress-ng` version: the notes
> mention v0.17.08 (commit `b7c7a587`), but `docker run` pulls the latest
> image at the time of the run.

The metric reported below is the bogo-ops per second based on wall clock time,
and the "scaling factor" is the multi-worker result divided by the
single-worker result. In an ideal world, it equals the number of physical
cores.

We picked six AWS servers to cover the most interesting combinations of CPU
vendor, architecture, SMT, and core count:

| Server | CPU | vCPUs | Physical cores | SMT |
| --- | --- | ---: | ---: | --- |
| `c6a.large` | AMD EPYC 7R13 (Milan) | 2 | 1 | yes |
| `c6a.2xlarge` | AMD EPYC 7R13 (Milan) | 8 | 4 | yes |
| `m7a.xlarge` | AMD EPYC 9R14 (Genoa) | 4 | 4 | no |
| `c7a.32xlarge` | AMD EPYC 9R14 (Genoa) | 128 | 128 | no |
| `c6i.metal` | 2x Intel Xeon 8375C (Ice Lake) | 128 | 64 | yes |
| `c6g.xlarge` | AWS Graviton2 (Neoverse N1) | 4 | 4 | no |

Out of the 84 method names (including `all`), a few did not return any
results:

- `cdouble`, `cfloat`, `clongdouble`, `fft`, and `zeta` rely on C99 complex
  number support, which was apparently not compiled into the Docker image we
  used.
- `float16` is only available on Arm (it uses the `__fp16` type), while
  `float80` is x86-only (it uses the `__float80` type).
- `float128` showed up twice in the method list. This is not a typo on our
  end: two different compiler feature checks in `stress-cpu.c` both register
  the method, and both runs returned the same numbers.

This leaves us with 78 methods per server, including `all`.

## Results

### SMT Scaling

Let's start with the smallest server: `c6a.large` comes with two vCPUs, which
are the two hyper-threads of a single physical AMD core. Running two workers
instead of one should not double the performance, as there's only one core
doing the work. Still, the scaling factors were all over the place:

<div class="text-center m-2.5 mt-8 mb-6">
  <!--
  CHART SPEC (placeholder): horizontal bar chart, one bar per method (78 bars),
  sorted by the c6a.large scaling factor (second appendix table, c6a.large
  column), from 0.97 (ln2, int128float) to 2.02 (crc16). Reference lines at
  1.0x ("one core") and 2.0x ("two cores"). Highlight div16 and jmp.
  -->
  <img class="zoomin w-full"
    title="Scaling factor of stress-ng CPU methods on c6a.large"
    alt="Bar chart of the two-worker vs one-worker scaling factor of 78 stress-ng CPU methods on a single hyper-threaded AMD core, ranging from 0.97x to 2.02x."
    src="/assets/images/blog/stress-ng-cpu-methods/c6a-large-smt-scaling.webp"/>
  <p>Throughput of two workers relative to one worker on a single hyper-threaded core (<code>c6a.large</code>)<br />(data collected and visualized by Spare Cores)</p>
</div>

- The integer divisions (`div8`, `div16`, `div32`, `div64`), `jmp`, `gray`,
  `hanoi`, `fibonacci`, `floatconversion`, `sqrt`, `ln2`, and `int128float`
  did not gain anything from the second hyper-thread (0.97x to 1.01x).
- On the other end, `crc16` (2.02x), `logmap` (2.01x), `correlate` (1.97x),
  `explog` (1.97x), and `intconversion` (1.93x) reported practically double
  the performance, as if there were two physical cores.
- The median method landed at 1.29x, and the default `all` method at 1.50x.

Our understanding is that methods saturating a single execution unit of the
core, such as the integer divider, leave nothing for the sibling hyper-thread
to use. Methods with long dependency chains or memory stalls, on the other
hand, leave a lot of the core idle, which the second hyper-thread happily
fills.

The `c6a.2xlarge` (four cores, eight hyper-threads) told the same story: the
`div8` to `div64` methods scaled exactly 4.0x, while `logmap` and `correlate`
scaled ~7.9x, and `all` landed at 6.2x. Meanwhile, the two servers without SMT
(`m7a.xlarge` and `c6g.xlarge`) scaled ~4.0x with practically every method,
as one would expect from four physical cores.

### Many-Core Scaling

Things get more interesting with lots of cores. We compared two 128 vCPU
servers: `c7a.32xlarge` with 128 physical AMD Genoa cores and no SMT, and
`c6i.metal` with 64 physical Intel cores in two sockets, each running two
hyper-threads.

<div class="text-center m-2.5 mt-8 mb-6">
  <!--
  CHART SPEC (placeholder): dot plot, one row per method, sorted by the
  c6i.metal scaling factor. Two dots per row: c7a.32xlarge and c6i.metal
  (second appendix table). Vertical reference lines at 64x (c6i.metal
  physical cores) and 128x (vCPUs). Highlight div16, jmp, and all.
  -->
  <img class="zoomin w-full"
    title="Scaling factor of stress-ng CPU methods on c7a.32xlarge and c6i.metal"
    alt="Dot plot comparing the scaling factor of 78 stress-ng CPU methods on c7a.32xlarge (110x to 136x) and c6i.metal (52x to 126x)."
    src="/assets/images/blog/stress-ng-cpu-methods/many-core-scaling.webp"/>
  <p>Throughput of 128 workers relative to one worker on <code>c7a.32xlarge</code> and <code>c6i.metal</code><br />(data collected and visualized by Spare Cores)</p>
</div>

On `c7a.32xlarge`, most methods scaled close to the core count: the median
was 125x, with a range of 110x (`stats`) to 136x (`gray`). Yes, a few methods
scaled slightly better than linearly, which we attribute to the noise of a
single 10 second run.

On `c6i.metal`, the range was much wider:

- `div8`, `div16`, `div32`, and `div64` scaled ~64x, matching the number of
  physical cores.
- `logmap` (126x), `correlate` (126x), `explog` (124x), and `rgb` (121x)
  scaled as if all 128 hyper-threads were real cores.
- `hanoi` (52x), `bitops` (52x), `jmp` (56x), and `matrixprod` (56x) scaled
  even worse than the physical core count.
- The median method scaled 82x, and `all` 93x.

So, depending on which method you pick, the very same server is either a 52
or a 126 "core" machine. 🤯

Note that `jmp`, the other finalist in our original evaluation, scaled below
the physical core count on both large servers (116x on `c7a.32xlarge` and 56x
on `c6i.metal`).

### Arm and Long Double

The `c6g.xlarge` scaled perfectly (~4.0x) with every method, but its
single-core results revealed something else. Compared to a single AMD Genoa
core of `m7a.xlarge`, the Graviton2 core achieved a median of 46% of the
throughput, but a handful of methods were dramatically slower:

| Method | `m7a.xlarge` | `c6g.xlarge` | Slowdown |
| --- | ---: | ---: | ---: |
| `hanoi` | 4802 | 32 | 151x |
| `euler` | 1259 | 18 | 69x |
| `apery` | 1294 | 19 | 67x |
| `ln2` | 1282 | 24 | 53x |
| `psi` | 1045 | 22 | 48x |
| `floatconversion` | 4318 | 103 | 42x |
| `sqrt` | 2755 | 69 | 40x |
| `trig` | 5319 | 178 | 30x |
| `matrixprod` | 1161 | 46 | 25x |
| `longdouble` | 1644 | 117 | 14x |

<div class="text-center m-2.5 mt-8 mb-6">
  <!--
  CHART SPEC (placeholder): grouped horizontal bars on a log-scale x axis,
  one group per method, two bars each: m7a.xlarge and c6g.xlarge single-worker
  bogo-ops/s (first appendix table). Sort by the c6g/m7a ratio. Color the
  methods using long double differently from the rest.
  -->
  <img class="zoomin w-full"
    title="Single-core stress-ng results on AMD Genoa vs Graviton2"
    alt="Log-scale bar chart of single-worker bogo-ops per second on m7a.xlarge and c6g.xlarge, showing slowdowns of up to 151x on Graviton2, mostly for methods using long double."
    src="/assets/images/blog/stress-ng-cpu-methods/arm-long-double.webp"/>
  <p>Single-worker throughput of <code>m7a.xlarge</code> (AMD Genoa) and <code>c6g.xlarge</code> (Graviton2), log scale<br />(data collected and visualized by Spare Cores)</p>
</div>

Looking at the source code, all of these methods except `hanoi` do their math
on the `long double` type. On x86, `long double` is an 80-bit extended
precision float handled by the x87 floating point unit in hardware. On 64-bit
Arm, `long double` is a 128-bit quad precision float, which has no hardware
support, so every operation is emulated in software. This also explains why
`float128` and the `int*longdouble` conversion methods ran at ~13% to 16% of
the AMD speed on Graviton2.

Honestly, we don't know why `hanoi` is so slow on Graviton2. It's a plain
recursive integer function, and other recursion-heavy methods like `ackermann`
ran at 44% of the AMD speed. If you have an idea, please let us know in the
comments!

And to make things even more confusing: `factorial`, which also uses
`long double` math, was 3.1x *faster* on Graviton2 than on AMD Genoa.

Either way, a CPU score based on any of these methods would tell you more
about the compiler and the C library than about the CPU, and would heavily
penalize Arm servers.

### Single-Core Rankings Depend on the Method

The methods also disagree on how different CPUs compare to each other. Taking
the single-worker results of the AMD Genoa core (`m7a.xlarge`) as the
baseline, the Intel Ice Lake core of `c6i.metal` achieved a median of 84% of
the throughput, but this ranged from 29% (`callfunc`) to 224% (`factorial`):

- Intel was ~2x faster with `float80` (2.1x), `longdouble` (2.1x),
  `matrixprod` (2.0x), and `factorial` (2.2x).
- AMD was much faster with `callfunc` (3.4x), `loop` (2.7x), `rand` (2.0x),
  and `gcd` (2.0x).
- With `div16`, AMD was 1.6x faster.

So if someone tells you "CPU X is 30% faster than CPU Y according to
`stress-ng`", the first question should be: which method?

## Why div16

Putting it all together, here's what we were looking for in a single CPU
method, and how `div16` delivered:

- It should scale with the number of physical cores, not with the number of
  hyper-threads: `div16` scaled 1.00x on one SMT core, 4.0x on four SMT
  cores, 65x on 64 SMT cores, and 128x on 128 non-SMT cores.
- It should not be dominated by an exotic data type that some architectures
  emulate in software: `div16` uses 16-bit unsigned integers, and a Graviton2
  core achieved 49% of the AMD Genoa throughput, close to the 46% median
  across all methods.
- It should be simple enough to explain: each iteration of `div16` performs
  50,000 16-bit integer divisions.

The `div8`, `div32`, and `div64` methods would have done the job just as well
on scaling, so picking `div16` among them was mostly a matter of taste. But
`jmp`, our other finalist, scaled below the physical core count on both large
servers.

That's why the SCore is the `div16` bogo-ops per second. We run `div16` with
every worker count from one up to the number of vCPUs: the single-core SCore
is the result with one worker, and the multi-core SCore is the highest result
across all worker counts.

Of course, the SCore is just one metric. If your workload benefits from SMT,
you should look at application-specific benchmarks instead, which we also
provide for each server.

## Caveats

- Each result comes from a single 10 second run, so differences of a few
  percent are within noise.
- The results are from June 2024 and an older `stress-ng` release. The
  methods, their implementation, and their reference rates change between
  releases, so the exact numbers will differ with a recent version.
- We used the official Docker image, so the compiler and C library choices of
  that image (for example, the missing complex number support) affect the
  results.
- Six servers are a tiny sample of the server types we track, and we did not
  test Graviton3 or newer Arm cores, or any Intel CPUs other than Ice Lake.
- The `callfunc` method reports millions of bogo-ops per second, far outside
  the range of the other methods, so its absolute numbers should not be
  compared with the others.

## Summary

The CPU method of `stress-ng` matters a lot: the same server can look like a
52 or a 126 core machine, and an Arm core can look 2x or 150x slower than an
x86 core, depending on the method. We picked `div16` for the SCore because it
scales with physical cores across vendors, architectures, and SMT settings,
and because it measures something simple enough to explain.

## Feedback

If you have any questions, concerns, or suggestions, please leave a message in
the comment section below, or
<a href="https://meet.sparecores.com/intro" target="_blank" rel="noopener">schedule a call with us</a>.

## Appendix: Raw Data

<details>
<summary>Single-worker bogo-ops per second (wall clock time)</summary>

| Method | `c6a.large` | `c6a.2xlarge` | `c6g.xlarge` | `m7a.xlarge` | `c7a.32xlarge` | `c6i.metal` |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `all` | 1,666 | 1,665 | 293 | 1,730 | 1,747 | 1,698 |
| `ackermann` | 2,748 | 2,752 | 1,369 | 3,080 | 3,076 | 1,581 |
| `apery` | 1,251 | 1,253 | 19 | 1,294 | 1,293 | 1,586 |
| `bitops` | 1,658 | 1,662 | 1,407 | 1,821 | 1,821 | 1,473 |
| `callfunc` | 3,219,775 | 3,239,033 | 1,587,711 | 3,900,487 | 3,886,906 | 1,143,386 |
| `cdouble` | -- | -- | -- | -- | -- | -- |
| `cfloat` | -- | -- | -- | -- | -- | -- |
| `clongdouble` | -- | -- | -- | -- | -- | -- |
| `collatz` | 1,869 | 1,868 | 732 | 1,921 | 1,932 | 1,873 |
| `correlate` | 1,971 | 1,972 | 2,039 | 2,032 | 2,030 | 1,458 |
| `crc16` | 932 | 1,012 | 706 | 1,040 | 1,039 | 982 |
| `decimal32` | 1,940 | 1,950 | 1,351 | 2,033 | 2,030 | 1,702 |
| `decimal64` | 1,643 | 1,856 | 1,194 | 1,955 | 1,955 | 1,652 |
| `decimal128` | 1,716 | 1,711 | 474 | 1,831 | 1,833 | 1,779 |
| `dither` | 1,898 | 1,894 | 1,313 | 1,987 | 1,990 | 1,895 |
| `div8` | 2,000 | 2,002 | 1,535 | 2,058 | 2,055 | 1,962 |
| `div16` | 2,990 | 2,989 | 1,520 | 3,077 | 3,074 | 1,910 |
| `div32` | 1,774 | 1,775 | 1,356 | 1,825 | 1,824 | 1,740 |
| `div64` | 5,321 | 5,325 | 4,753 | 5,477 | 5,472 | 3,662 |
| `div128` | 5,250 | 5,268 | 2,592 | 7,535 | 7,638 | 5,089 |
| `double` | 1,884 | 1,888 | 1,310 | 1,938 | 1,931 | 1,616 |
| `euler` | 1,199 | 1,202 | 18 | 1,259 | 1,257 | 1,435 |
| `explog` | 1,729 | 1,727 | 1,448 | 1,781 | 1,767 | 1,253 |
| `factorial` | 925 | 1,113 | 2,695 | 867 | 982 | 1,939 |
| `fibonacci` | 1,408 | 1,391 | 1,004 | 1,469 | 1,467 | 1,404 |
| `fft` | -- | -- | -- | -- | -- | -- |
| `fletcher16` | 1,416 | 1,416 | 1,118 | 1,458 | 1,456 | 1,401 |
| `float` | 2,532 | 2,534 | 1,812 | 2,594 | 2,585 | 2,075 |
| `float16` | -- | -- | 3,019 | -- | -- | -- |
| `float32` | 2,206 | 2,209 | 1,520 | 2,278 | 2,226 | 1,758 |
| `float64` | 1,991 | 1,994 | 1,383 | 1,990 | 2,000 | 1,706 |
| `float80` | 1,714 | 1,574 | -- | 1,741 | 1,766 | 3,724 |
| `float128` | 1,812 | 1,815 | 291 | 1,823 | 1,843 | 2,491 |
| `floatconversion` | 3,575 | 3,580 | 103 | 4,318 | 4,312 | 3,539 |
| `gamma` | 1,958 | 1,946 | 301 | 2,238 | 2,226 | 2,168 |
| `gcd` | 4,341 | 4,338 | 2,791 | 6,145 | 6,138 | 3,049 |
| `gray` | 866 | 868 | 247 | 871 | 813 | 657 |
| `hamming` | 1,615 | 1,624 | 1,003 | 1,684 | 1,683 | 1,520 |
| `hanoi` | 4,522 | 4,535 | 32 | 4,802 | 4,798 | 5,022 |
| `hyperbolic` | 3,256 | 3,250 | 902 | 3,933 | 3,863 | 2,729 |
| `idct` | 2,120 | 2,115 | 1,017 | 2,577 | 2,473 | 1,965 |
| `int128` | 2,185 | 2,211 | 980 | 2,232 | 2,230 | 1,884 |
| `int64` | 2,743 | 2,755 | 1,194 | 2,953 | 2,953 | 1,817 |
| `int32` | 2,613 | 2,596 | 1,120 | 2,568 | 2,564 | 1,760 |
| `int16` | 2,690 | 2,693 | 1,117 | 2,760 | 2,758 | 1,748 |
| `int8` | 2,869 | 2,870 | 1,134 | 3,011 | 3,007 | 1,756 |
| `int128float` | 2,919 | 2,926 | 1,348 | 3,284 | 3,280 | 2,622 |
| `int128double` | 1,421 | 1,411 | 855 | 1,659 | 1,557 | 1,305 |
| `int128longdouble` | 1,184 | 1,189 | 143 | 1,095 | 1,223 | 1,647 |
| `int128decimal32` | 2,380 | 2,367 | 1,552 | 2,813 | 2,819 | 2,096 |
| `int128decimal64` | 1,924 | 1,932 | 1,280 | 2,311 | 2,307 | 1,732 |
| `int128decimal128` | 1,565 | 1,576 | 463 | 1,619 | 1,664 | 1,623 |
| `int64float` | 2,523 | 2,532 | 1,491 | 2,860 | 2,835 | 2,672 |
| `int64double` | 1,241 | 1,231 | 802 | 1,457 | 1,417 | 1,182 |
| `int64longdouble` | 1,167 | 1,189 | 143 | 1,075 | 1,259 | 1,654 |
| `int32float` | 2,513 | 2,521 | 1,531 | 2,768 | 2,767 | 2,604 |
| `int32double` | 1,211 | 1,214 | 786 | 1,425 | 1,382 | 1,165 |
| `int32longdouble` | 1,177 | 1,183 | 142 | 1,104 | 1,245 | 1,644 |
| `intconversion` | 1,488 | 1,489 | 828 | 1,531 | 1,529 | 1,441 |
| `ipv4checksum` | 2,524 | 2,526 | 1,299 | 3,048 | 3,042 | 2,494 |
| `jmp` | 1,792 | 1,798 | 887 | 1,849 | 1,848 | 1,759 |
| `lfsr32` | 1,548 | 1,550 | 1,444 | 1,593 | 1,592 | 1,377 |
| `ln2` | 1,227 | 1,239 | 24 | 1,282 | 1,282 | 1,535 |
| `logmap` | 2,278 | 2,296 | 1,546 | 2,246 | 2,219 | 1,475 |
| `longdouble` | 1,617 | 1,461 | 117 | 1,644 | 1,636 | 3,515 |
| `loop` | 3,229 | 3,241 | 1,053 | 3,659 | 3,656 | 1,334 |
| `matrixprod` | 1,110 | 1,116 | 46 | 1,161 | 1,135 | 2,291 |
| `nsqrt` | 966 | 972 | 96 | 1,016 | 1,015 | 1,714 |
| `omega` | 2,137 | 2,142 | 426 | 2,122 | 2,121 | 2,059 |
| `parity` | 2,199 | 2,202 | 1,675 | 2,963 | 2,962 | 2,069 |
| `phi` | 1,775 | 1,802 | 994 | 2,170 | 2,183 | 1,389 |
| `pi` | 4,917 | 3,737 | 1,877 | 4,461 | 4,451 | 5,185 |
| `prime` | 1,987 | 1,982 | 1,061 | 2,067 | 2,064 | 1,894 |
| `psi` | 891 | 891 | 22 | 1,045 | 1,045 | 1,577 |
| `queens` | 1,963 | 1,967 | 1,375 | 2,018 | 2,020 | 1,551 |
| `rand` | 3,367 | 3,372 | 1,044 | 3,754 | 3,751 | 1,833 |
| `rand48` | 2,129 | 2,132 | 1,788 | 2,273 | 2,271 | 2,457 |
| `rgb` | 1,794 | 1,795 | 1,502 | 1,905 | 1,893 | 1,451 |
| `sieve` | 2,136 | 2,142 | 1,147 | 2,359 | 2,324 | 1,895 |
| `stats` | 2,286 | 2,291 | 1,194 | 2,343 | 2,319 | 1,980 |
| `sqrt` | 2,713 | 2,717 | 69 | 2,755 | 2,754 | 3,885 |
| `trig` | 4,655 | 4,617 | 178 | 5,319 | 5,299 | 4,471 |
| `union` | 1,219 | 1,220 | 1,245 | 1,354 | 1,352 | 1,265 |
| `zeta` | -- | -- | -- | -- | -- | -- |

</details>

<details>
<summary>Scaling factor (all workers vs one worker)</summary>

| Method | `c6a.large` | `c6a.2xlarge` | `c6g.xlarge` | `m7a.xlarge` | `c7a.32xlarge` | `c6i.metal` |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `all` | 1.50 | 6.23 | 4.00 | 4.01 | 126.43 | 92.82 |
| `ackermann` | 1.02 | 4.07 | 4.00 | 4.00 | 121.84 | 81.34 |
| `apery` | 1.06 | 4.25 | 3.98 | 4.00 | 125.54 | 68.72 |
| `bitops` | 1.04 | 4.16 | 4.00 | 4.00 | 125.24 | 52.24 |
| `callfunc` | 1.16 | 4.63 | 4.00 | 3.99 | 119.68 | 98.15 |
| `cdouble` | -- | -- | -- | -- | -- | -- |
| `cfloat` | -- | -- | -- | -- | -- | -- |
| `clongdouble` | -- | -- | -- | -- | -- | -- |
| `collatz` | 1.16 | 4.67 | 4.01 | 4.00 | 126.11 | 75.67 |
| `correlate` | 1.97 | 7.88 | 4.00 | 3.99 | 127.23 | 126.15 |
| `crc16` | 2.02 | 7.45 | 4.00 | 4.00 | 127.75 | 111.54 |
| `decimal32` | 1.36 | 5.61 | 4.00 | 4.01 | 119.40 | 75.98 |
| `decimal64` | 1.64 | 5.82 | 4.00 | 4.00 | 119.13 | 79.41 |
| `decimal128` | 1.50 | 6.03 | 3.99 | 4.01 | 122.21 | 79.85 |
| `dither` | 1.50 | 5.99 | 3.99 | 4.05 | 123.26 | 85.37 |
| `div8` | 1.00 | 3.99 | 4.00 | 4.00 | 127.80 | 63.89 |
| `div16` | 1.00 | 4.00 | 4.00 | 4.00 | 127.68 | 65.43 |
| `div32` | 1.00 | 3.99 | 4.00 | 4.00 | 127.79 | 63.89 |
| `div64` | 1.00 | 3.99 | 4.00 | 4.00 | 127.70 | 63.90 |
| `div128` | 1.12 | 4.46 | 4.00 | 3.97 | 116.19 | 60.75 |
| `double` | 1.66 | 6.65 | 4.00 | 4.01 | 120.49 | 101.19 |
| `euler` | 1.11 | 4.42 | 3.99 | 4.00 | 124.02 | 74.41 |
| `explog` | 1.97 | 7.90 | 3.99 | 4.00 | 128.47 | 123.53 |
| `factorial` | 1.57 | 6.41 | 4.00 | 3.99 | 127.54 | 100.22 |
| `fibonacci` | 1.01 | 4.11 | 4.00 | 4.00 | 127.29 | 64.18 |
| `fft` | -- | -- | -- | -- | -- | -- |
| `fletcher16` | 1.59 | 6.38 | 4.00 | 4.00 | 127.72 | 101.88 |
| `float` | 1.85 | 7.40 | 4.00 | 4.01 | 119.43 | 108.59 |
| `float16` | -- | -- | 4.00 | -- | -- | -- |
| `float32` | 1.68 | 6.71 | 4.00 | 4.00 | 123.16 | 101.87 |
| `float64` | 1.66 | 6.65 | 4.00 | 4.13 | 121.87 | 101.20 |
| `float80` | 1.66 | 6.60 | -- | 4.00 | 127.54 | 99.90 |
| `float128` | 1.68 | 6.70 | 4.00 | 4.00 | 127.14 | 85.68 |
| `floatconversion` | 1.00 | 4.01 | 3.99 | 4.04 | 117.04 | 64.98 |
| `gamma` | 1.33 | 5.37 | 4.00 | 3.98 | 127.61 | 109.03 |
| `gcd` | 1.09 | 4.38 | 4.00 | 4.00 | 127.80 | 84.83 |
| `gray` | 1.00 | 3.98 | 4.00 | 4.16 | 136.10 | 61.79 |
| `hamming` | 1.02 | 4.07 | 4.00 | 4.00 | 126.68 | 56.33 |
| `hanoi` | 1.00 | 4.01 | 4.00 | 4.00 | 114.15 | 52.14 |
| `hyperbolic` | 1.29 | 5.16 | 4.00 | 4.00 | 129.08 | 88.08 |
| `idct` | 1.15 | 4.64 | 4.00 | 4.02 | 113.94 | 66.95 |
| `int128` | 1.17 | 4.63 | 4.00 | 4.00 | 125.76 | 82.85 |
| `int64` | 1.22 | 4.86 | 4.00 | 4.00 | 117.72 | 88.74 |
| `int32` | 1.27 | 5.11 | 4.00 | 3.96 | 121.90 | 94.06 |
| `int16` | 1.17 | 4.68 | 4.00 | 4.00 | 120.20 | 92.30 |
| `int8` | 1.12 | 4.47 | 4.00 | 4.00 | 116.91 | 91.31 |
| `int128float` | 0.97 | 3.89 | 4.00 | 4.00 | 110.82 | 58.35 |
| `int128double` | 1.33 | 5.34 | 3.99 | 4.02 | 126.69 | 77.13 |
| `int128longdouble` | 1.62 | 6.47 | 3.99 | 4.07 | 130.33 | 80.96 |
| `int128decimal32` | 1.02 | 4.11 | 4.00 | 4.00 | 113.65 | 56.73 |
| `int128decimal64` | 1.17 | 4.67 | 4.00 | 4.04 | 117.32 | 63.84 |
| `int128decimal128` | 1.46 | 5.84 | 4.01 | 4.00 | 121.79 | 77.44 |
| `int64float` | 1.13 | 4.52 | 3.99 | 4.03 | 112.96 | 59.21 |
| `int64double` | 1.46 | 5.89 | 4.00 | 4.02 | 120.20 | 81.51 |
| `int64longdouble` | 1.66 | 6.54 | 3.99 | 4.14 | 125.08 | 82.18 |
| `int32float` | 1.15 | 4.60 | 4.00 | 4.08 | 114.40 | 61.60 |
| `int32double` | 1.48 | 5.91 | 4.00 | 4.03 | 123.18 | 81.92 |
| `int32longdouble` | 1.64 | 6.52 | 4.01 | 4.03 | 127.04 | 82.39 |
| `intconversion` | 1.93 | 7.73 | 4.00 | 4.00 | 127.77 | 111.22 |
| `ipv4checksum` | 1.07 | 4.28 | 3.92 | 4.00 | 113.68 | 57.69 |
| `jmp` | 1.00 | 3.99 | 4.00 | 4.00 | 115.99 | 55.93 |
| `lfsr32` | 1.75 | 7.68 | 4.00 | 4.00 | 127.75 | 111.65 |
| `ln2` | 0.97 | 4.01 | 3.99 | 4.00 | 127.54 | 64.07 |
| `logmap` | 2.01 | 7.98 | 4.00 | 4.21 | 135.64 | 126.31 |
| `longdouble` | 1.65 | 6.71 | 3.99 | 4.00 | 129.82 | 99.77 |
| `loop` | 1.21 | 4.83 | 3.99 | 4.00 | 114.33 | 97.69 |
| `matrixprod` | 1.02 | 4.05 | 4.00 | 3.97 | 117.95 | 56.21 |
| `nsqrt` | 1.84 | 7.32 | 3.99 | 4.00 | 127.50 | 104.87 |
| `omega` | 1.50 | 6.01 | 4.00 | 4.00 | 127.43 | 108.89 |
| `parity` | 1.21 | 4.85 | 4.00 | 4.01 | 127.08 | 59.98 |
| `phi` | 1.21 | 4.82 | 3.98 | 3.96 | 125.26 | 66.19 |
| `pi` | 1.39 | 7.35 | 3.99 | 3.93 | 126.73 | 88.33 |
| `prime` | 1.09 | 4.38 | 4.00 | 3.99 | 127.57 | 70.19 |
| `psi` | 1.50 | 6.00 | 4.00 | 4.00 | 127.39 | 71.41 |
| `queens` | 1.46 | 5.82 | 4.01 | 4.00 | 121.18 | 91.25 |
| `rand` | 1.40 | 5.60 | 4.00 | 4.00 | 115.80 | 100.82 |
| `rand48` | 1.40 | 5.59 | 4.00 | 4.00 | 117.19 | 66.84 |
| `rgb` | 1.92 | 7.68 | 4.00 | 4.01 | 128.50 | 121.30 |
| `sieve` | 1.07 | 4.27 | 4.00 | 4.00 | 122.23 | 57.48 |
| `stats` | 1.22 | 4.88 | 3.99 | 4.00 | 110.23 | 66.90 |
| `sqrt` | 0.99 | 3.95 | 4.00 | 4.00 | 126.88 | 65.57 |
| `trig` | 1.45 | 5.99 | 4.01 | 4.00 | 125.07 | 95.20 |
| `union` | 1.68 | 6.73 | 4.00 | 4.00 | 127.58 | 112.41 |
| `zeta` | -- | -- | -- | -- | -- | -- |

</details>
