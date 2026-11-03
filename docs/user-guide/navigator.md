# Find Servers in the Navigator

Open the [Navigator](https://sparecores.com/servers) to browse servers. You
can narrow the results with filters, search by name or ID,
or describe what you need in Search Prompt. For a
[video introduction](https://www.youtube.com/watch?v=hO0KQoxk1SM) to the
listing, select **Introduction** in the page header.

## Search for Servers

Use any of the following ways to narrow the listing:

- To find a known server, open **Basics** and enter part of its name or ID
  under **Partial name or id**. Press Enter or click away to apply the
  filter.
- To describe a requirement in your own words, select **Search Prompt** at
  the top of the sidebar, describe what you need, and select **Submit**.
  Review the **Suggested filter parameters**, then select **Confirm** to
  apply them. Confirm replaces your current filters with the suggestions, so
  use Search Prompt before you set filters by hand. It may not apply every
  part of a request, so check the resulting filters.
- Open the filter groups in the sidebar to narrow results further. The
  groups are **Basics**, **Performance**, **Processor**, **CPU Cache**,
  **Memory**, **Accelerator**, **GPU**, **ASIC**, **Storage**, **Network**,
  **Vendor**, and **Region**; only **Processor** is open by default.

The **Basics** group also includes **Active only** and **Orderable only**;
Orderable only is selected by default. The **Performance** group includes the
following filters:

- **Required SCore**
- **Required $Core**
- **Required benchmark score**
- **Maximum benchmark score**
- **Required benchmark score/price**
- **Required benchmark score/vCPU**

Select **Show filter description** beside a field if you are unsure what it
filters. Two scores appear throughout the site:

- **SCore** (Spare Cores score) is a server's multi-core CPU speed, measured
  with the CPU stressor of `stress-ng`. See the
  [glossary](https://docs.sparecores.com/glossary/#score).
- **$Core** is the SCore per USD per hour, using the server's best on-demand
  or spot price across all zones.

Guests can select one country in the Region filter. For other guest limits,
see [Accounts and bookmarks](./accounts-and-bookmarks.md).

## Choose a Benchmark and View Results

Select **Select Benchmark** above the results to choose a benchmark and,
where available, a configuration. Your choice sets what the **BENCHMARK** and
**$ EFFICIENCY** columns show and what the benchmark filters in the
**Performance** group compare against. Benchmark categories include LLM
inference speed.
Its configurations distinguish prompt processing from text generation and
include model and token settings. For workload definitions, see the
[Benchmarks reference](https://docs.sparecores.com/benchmarks/).

Use **Columns** to change which server properties appear in the listing. For
example, you can add CPU Cache. Select a column heading to sort by it. Two
of the default columns need a definition:

- **$ EFFICIENCY** shows how much performance you get for your money: the
  selected benchmark's score divided by the server's best price, in USD per
  hour.
- **BEST PRICE** is the server's lowest price across everything your search
  allows, such as regions and price types.

Select a server name to open its detail page. The detail page shows server
specifications and benchmark information, and includes a **Compare** control.

To share a search, select **Share** in the page header of the
[Navigator](https://sparecores.com/servers). It copies a link that keeps
your filters, benchmark, and columns. You do not need an account to share.

## Find Managed Databases

The Navigator also lists managed database services, or DBaaS (Database as a
Service), in the [database listing](https://sparecores.com/databases). Open
it from **Databases** in the site's header menu. It works like the server
listing: filter in the sidebar, use Search Prompt, and select the checkboxes
of two or more databases to compare them. Guests can compare up to four
databases at a time. Its price selector offers **Any price**,
**Hourly prices**, and **Monthly prices**.

For price categories and currencies, see [Understand Prices](./prices.md).
For database schemas and programmatic access, see
[Schemas](https://docs.sparecores.com/schemas/) and
[API](https://docs.sparecores.com/api/).
