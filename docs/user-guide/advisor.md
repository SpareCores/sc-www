# Get recommendations in Advisor

Advisor compares candidate servers with a baseline for a workload and
utilization level. Open [Advisor](https://sparecores.com/advisor) to begin.

## Set up an assessment

1. Choose a baseline server. The workload control is unavailable until you
   choose a baseline.
2. Choose a **Workload Profile**. The list includes **LLM Inference**.
3. Set average utilization. Advisor uses the utilization and workload to
   calculate requirements for the recommendation search.
4. Choose an optimization goal: **Performance**, **Cost**, or
   **Cost-efficiency**. **Cost** is the default.
5. Review the required memory value and other constraints shown for the
   assessment. Add or adjust search limits, such as vendor, region, or price
   allocation, when those controls fit your requirements.
6. Review the recommendations and compare candidates with the baseline.

For example, selecting `aws / m5.large`, **LLM Inference**, and 50% average
utilization produced recommendations and populated required memory as 4 GiB.
Your results depend on the baseline, workload, utilization, and search
constraints you choose.

## Compare a recommendation with the baseline

Use the **Compare Baseline** quick filter, then select a recommendation. The
comparison includes the baseline and the selected server. For more detail on
the comparison view, see [Compare servers](./compare.md).

Price allocation and currency affect the price information shown. See
[Understand prices](./prices.md). The [Benchmarks reference](../benchmarks/)
describes benchmark workloads used in the results.
