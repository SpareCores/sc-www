# Find servers in Navigator

Open [Servers in Navigator](https://sparecores.com/servers) to browse the
server listing. You can narrow the results with filters, search by name or ID,
or describe what you need in Search Prompt.

## Search for servers

1. To find a known server, open **Basics** and enter part of its name or ID
   under **Partial name or id**. Press Enter or click away to apply the
   filter.
2. To describe a requirement in your own words, open **Search Prompt** and
   submit a request. Search Prompt turns the request into filters and may not
   apply every part of it, so check the resulting filters.
3. Open filter groups such as **Processor**, **Memory**, **GPU**, **Storage**,
   **Network**, **Vendor**, and **Region** to narrow results further.

The **Basics** group also includes **Active only** and **Orderable only**;
Orderable only is selected by default. The **Performance** group includes
**Required SCore**, **Required $Core**, **Required benchmark score**,
**Maximum benchmark score**, **Required benchmark score/price**, and
**Required benchmark score/vCPU**.
Select **Show filter description** beside a field if you are unsure what it
filters. For the meaning of SCore, see the
[Docusaurus Glossary](https://docs.sparecores.com/glossary/#score).

Guests can select one country in the Region filter. For other guest limits,
see [Accounts and bookmarks](./accounts-and-bookmarks.md).

## Choose a benchmark and view results

Use the benchmark selector above the results to choose a benchmark and, where
available, a configuration. Benchmark categories include LLM inference speed.
Its configurations distinguish prompt processing from text generation and
include model and token settings. For workload definitions, see the
[Benchmarks reference](https://docs.sparecores.com/benchmarks/).

Use **Columns** to change which server properties appear in the listing. For
example, you can add CPU Cache. Select a column heading to sort by it; the
table can show dollar efficiency, memory, storage, and best price, among
other properties.

Select a server name to open its detail page. The detail page shows server
specifications and benchmark information, and includes a **Compare** control.

For price categories and currencies, see [Understand prices](./prices.md).
For database schemas and programmatic access, see
[Schemas](https://docs.sparecores.com/schemas/) and
[API](https://docs.sparecores.com/api/).
