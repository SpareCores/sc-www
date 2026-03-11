import { E2EEvent } from "../support/generics";

describe("Server Details", () => {
  it("Server with price", () => {
    E2EEvent.visitURL("/server/aws/c6g.large", 4000);

    E2EEvent.checkBreadcrumbs();

    E2EEvent.isVisibleAndNotEmpty(`[id="server_base_info_box"]`);

    E2EEvent.isVisibleAndNotEmpty(`[id="details"]`);
    E2EEvent.isVisibleAndNotEmpty(`[id="processor"]`);
    E2EEvent.isVisibleAndNotEmpty(`[id="system_resources"]`);

    E2EEvent.isVisibleAndNotEmpty(`[id="availability"]`);
    E2EEvent.isVisibleAndNotEmpty(`.availability_line`);

    E2EEvent.isNotFound(`[id="details_more_button"]`);
    E2EEvent.isVisible(`[id="processor_more_button"]`);
    E2EEvent.isVisible(`[id="system_resources_more_button"]`);

    E2EEvent.isVisible(`[id="availability_more_button"]`);

    E2EEvent.isNotFound(`[id="details_less_button"]`);
    E2EEvent.isNotFound(`[id="availability_less"]`);

    E2EEvent.isVisibleAndNotEmpty(`[id="price_chart"]`);

    E2EEvent.isVisibleAndNotEmpty(`[id="bw_mem_chart"]`);

    E2EEvent.isVisibleAndNotEmpty(`[id="ssl_chart"]`);

    E2EEvent.isVisibleAndNotEmpty(`[id="static_web_chart"]`);

    E2EEvent.isVisibleAndNotEmpty(`[id="redis_chart"]`);

    E2EEvent.isVisibleAndNotEmpty(`.similar_family_table`);

    E2EEvent.isVisibleAndNotEmpty(`[id="similar_table"]`);

    E2EEvent.countElements(`[id="similar_table"]`, `.similar_line`, 7);
  });

  it("Server without price and charts", () => {
    E2EEvent.visitURL("/server/gcp/x4-megamem-1440-metal", 4000);

    E2EEvent.checkBreadcrumbs();

    E2EEvent.isVisibleAndNotEmpty(`[id="server_base_info_box"]`);

    E2EEvent.isVisibleAndNotEmpty(`[id="details"]`);
    E2EEvent.isVisibleAndNotEmpty(`[id="processor"]`);
    E2EEvent.isVisibleAndNotEmpty(`[id="system_resources"]`);

    E2EEvent.isVisibleAndNotEmpty(`[id="availability"]`);
    E2EEvent.isNotFound(`.availability_line`);

    E2EEvent.isNotFound(`[id="details_more_button"]`);
    E2EEvent.isVisible(`[id="processor_more_button"]`);
    E2EEvent.isVisible(`[id="system_resources_more_button"]`);

    E2EEvent.isNotFound(`[id="availability_more_button"]`);

    E2EEvent.isVisibleAndNotEmpty(`[id="price_chart"]`);

    E2EEvent.isNotFound(`[id="bw_mem_chart"]`);

    E2EEvent.isNotFound(`[id="ssl_chart"]`);

    E2EEvent.isNotFound(`[id="static_web_chart"]`);

    E2EEvent.isNotFound(`[id="redis_chart"]`);

    E2EEvent.isVisibleAndNotEmpty(`.similar_family_table`);

    E2EEvent.isVisibleAndNotEmpty(`[id="similar_table"]`);

    E2EEvent.countElements(`[id="similar_table"]`, `.similar_line`, 7);
  });
});
