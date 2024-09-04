import { E2EEvent } from "../support/generics";


describe('Server prices', () => {

  it('Test /server_prices page', () => {
    E2EEvent.visitURL('/server_prices', 4000);

    E2EEvent.checkBreadcrumbs();

    E2EEvent.isVisible(`[id="serverSearchBar"]`);

    E2EEvent.isVisible(`[id="column_button"]`);

    E2EEvent.isVisible(`[id="server_prices_table"]`);

    E2EEvent.countElements(`[id="server_prices_table"]`, `[id="server_table_data_line"]`,25);

    E2EEvent.isVisible(`[id="pagination_next_arrow"]`);

    E2EEvent.doesNotExist(`[id="pagination_prev_arrow"]`);

    E2EEvent.visitURL('/servers?vcpus_min=11&benchmark_score_stressng_cpu_min=200&page=2', 4000);

    // wea re on page 2 now
    E2EEvent.isVisible(`[id="pagination_prev_arrow"]`);

    E2EEvent.hasText(`filter_range_value_vcpus_min`, '11 vCPUs');

    E2EEvent.hasValue(`filter_number_benchmark_score_stressng_cpu_min`, '200');

  });
});
