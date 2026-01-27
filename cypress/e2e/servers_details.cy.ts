import { E2EEvent } from "../support/generics";

describe("Server Details", () => {
  it("Server with price", () => {
    E2EEvent.visitURL("/server/aws/c6g.large", 4000);

    E2EEvent.checkBreadcrumbs();

    E2EEvent.isVisible(`[id="server_base_info_box"]`);

    E2EEvent.isVisible(`[id="details"]`);

    E2EEvent.isVisible(`[id="availability"]`);
    E2EEvent.isVisible(`[id="availability_line"]`);

    E2EEvent.isVisible(`[id="details_more_button"]`);

    E2EEvent.isVisible(`[id="availability_more_button"]`);

    E2EEvent.isNotVisible(`[id="details_less_button"]`);

    E2EEvent.isVisible(`[id="price_chart"]`);

    E2EEvent.isVisible(`[id="bw_mem_chart"]`);

    E2EEvent.isVisible(`[id="ssl_chart"]`);

    E2EEvent.isVisible(`[id="static_web_chart"]`);

    E2EEvent.isVisible(`[id="redis_chart"]`);

    E2EEvent.isVisible(`[id="similar_family_table"]`);

    E2EEvent.isVisible(`[id="similar_table"]`);

    E2EEvent.countElements(`[id="similar_table"]`, `[id="similar_line"]`, 7);
  });

  it("Server without price and charts", () => {
    E2EEvent.visitURL("/server/gcp/x4-megamem-1440-metal", 4000);

    E2EEvent.checkBreadcrumbs();

    E2EEvent.isVisible(`[id="server_base_info_box"]`);

    E2EEvent.isVisible(`[id="details"]`);

    E2EEvent.isVisible(`[id="availability"]`);
    E2EEvent.isNotFound("availability_line");

    E2EEvent.isVisible(`[id="details_more_button"]`);

    E2EEvent.isNotFound(`availability_more_button`);

    E2EEvent.isVisible(`[id="price_chart"]`);

    E2EEvent.isNotFound(`bw_mem_chart`);

    E2EEvent.isNotFound(`ssl_chart`);

    E2EEvent.isNotFound(`static_web_chart`);

    E2EEvent.isNotFound(`redis_chart`);

    E2EEvent.isVisible(`[id="similar_family_table"]`);

    E2EEvent.isVisible(`[id="similar_table"]`);

    E2EEvent.countElements(`[id="similar_table"]`, `[id="similar_line"]`, 7);
  });
});
