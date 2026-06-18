export const COLUMN_SCORE_TOOLTIP =
  "Performance benchmark score using stress-ng's div16 method (doing 16 bit unsigned integer divisions for 20 seconds): simulating CPU heavy workload that scales well on any number of (v)CPUs. The SCore/price value in the second line shows the div16 performance measured for 1 USD/hour, using the best (usually spot) price of all zones. To order by the latter, enable the $Core column.";

export const COLUMN_SCORE_PER_PRICE_TOOLTIP =
  "SCore/price showing stress-ng's div16 performance measured for one price unit (usually hourly or monthly server price) standardized to USD, using the best price across all selected zones. By default, this equals to the SCore you can get for 1 USD/hour by using the cheapest spot (or ondemand) hourly price in all supported regions and availability zones, but can be filtered down to countries, regions, and price allocation strategies (e.g. using only ondemand pricing).";

export const COLUMN_BENCHMARK_TOOLTIP =
  "Performance benchmark score as per the selected Benchmark at the top of the table.";

export const COLUMN_BENCHMARK_EFFICIENCY_TOOLTIP =
  "Benchmark/price ratio showing the selected benchmark performance measured for one price unit (usually hourly or monthly server price) standardized to USD, using the best price across all selected zones. By default, this equals to the selected benchmark workload's measured score divided by the cheapest spot (or ondemand) hourly price in all supported regions and availability zones, but can be filtered down to countries, regions, and price allocation strategies (e.g. using only ondemand pricing). In other words: how much performance you get for your money.";
