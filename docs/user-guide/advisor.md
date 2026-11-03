# Get recommendations in the Advisor

The Advisor compares candidate servers with a baseline for a workload and
utilization level. Open the [Advisor](https://sparecores.com/advisor) to
begin.

To see recommendations before you enter your own server, select **Example**
in the page header. It fills in a sample baseline server, workload, and
utilization. **Introduction**, next to it, opens a
[video about the Advisor](https://www.youtube.com/watch?v=4QwvxaLTW2k).

## Set up an assessment

1. Choose a baseline server. The workload control is unavailable until you
   choose a baseline.
2. Choose a **Baseline workload**. The list shows only workloads measured on
   your baseline server, such as a web or LLM inference profile.
3. Set **Average utilization**: how busy your baseline server is on average,
   such as its average CPU or GPU usage. The Advisor uses it to see how far
   it can scale down the candidates' performance to save costs. Set it with
   the slider, from 0 to 100% in steps of 10%. It starts as "Not set", and
   the Advisor shows no results until you set it. To use 0%, move the slider
   and then back to 0.
4. Choose an optimization goal: **Performance**, **Cost**, or
   **Cost-efficiency**. **Cost** is the default.
5. Check **Required memory (RAM)**. The Advisor fills it in from the
   baseline's memory and your utilization; raise it to cover your peak memory
   use. **Required GPU memory (VRAM)** starts at 0, which means no GPU
   requirement.
6. Optionally, enter **Required storage size** and **Required storage type**,
   and **Monthly inbound traffic** and **Monthly outbound traffic** in GB. The
   Advisor adds the cost of extra storage and of this traffic to each
   server's price, so egress costs count in the comparison.
7. Optionally, under **Limit search for matching:**, keep results to the
   baseline's **CPU allocation** or **CPU architecture**, to one
   **Price allocation** type, or to one **Region** where the baseline is
   sold. The **Vendor** and **Region** filter groups limit results further.
8. Review the recommendations. The Advisor reports how many servers matched,
   or shows "No matches yet" if none did; then loosen your inputs or filters.
   The table shows how each server differs from the baseline as a
   percentage, for example "+12%" on price.

For example, with `aws / m5.large` as the baseline, an LLM inference
workload, and 50% average utilization, the Advisor sets required memory to
4 GiB.

## Compare a recommendation with the baseline

1. Select **Compare baseline** above the recommendations to add the baseline
   to your comparison. The button changes to **Remove baseline**.
2. Select the checkboxes of one or more recommendations.
3. Select **Compare (N)** in the bar at the bottom of the page.

The comparison shows the baseline and the selected servers side by side. For
more detail on the comparison view, see [Compare servers](./compare.md).

Price allocation and currency affect the price information shown. See
[Understand prices](./prices.md). The
[Benchmarks reference](https://docs.sparecores.com/benchmarks/) describes
benchmark workloads used in the results.
