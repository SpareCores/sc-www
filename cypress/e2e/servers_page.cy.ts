import { E2EEvent } from "../support/generics";


describe('Server listing', () => {

  it('Test /servers page', () => {
    E2EEvent.visitURL('/servers', 4000);

    E2EEvent.checkBreadcrumbs();

    // search bar visible and not visible fields
    E2EEvent.isVisible(`[id="serverSearchBar"]`);
    E2EEvent.isVisible(`[id="filter_title_benchmark_score_stressng_cpu_min"]`);
    E2EEvent.doesNotExist(`[id="filter_title_partial_name_or_id"]`);

    // columnsdropwdown button
    E2EEvent.isVisible(`[id="column_button"]`);

    // data table
    E2EEvent.isVisible(`[id="servers_table"]`);

    // count lines
    E2EEvent.countElements(`[id="servers_table"]`, `[id="server_table_data_line"]`,25);

    // pagination
    E2EEvent.isVisible(`[id="pagination_next_arrow"]`);
    E2EEvent.doesNotExist(`[id="pagination_prev_arrow"]`);


    E2EEvent.visitURL('/server_prices?vcpus_min=11&benchmark_score_stressng_cpu_min=200&page=2', 4000);

    // wea re on page 2 now
    E2EEvent.isVisible(`[id="pagination_prev_arrow"]`);

    E2EEvent.hasText(`filter_ragne_value_vcpus_min`, '11 vCPUs');

    E2EEvent.hasValue(`filter_number_benchmark_score_stressng_cpu_min`, '200');


  });
});
