describe("Landing page slot machine links", () => {
  const serverPricesResponse = [
    {
      vendor_id: "aws",
      region_id: "us-east-1",
      zone_id: "use1-az1",
      server_id: "m7g.large",
      operating_system: "Linux",
      allocation: "ondemand",
      unit: "hour",
      price: 0.12,
      price_upfront: 0,
      price_tiered: [],
      currency: "USD",
      status: "active",
      observed_at: "2026-04-08T08:32:05",
      vendor: {
        vendor_id: "aws",
        name: "Amazon Web Services",
        logo: "/assets/images/vendors/aws.svg",
        homepage: "https://aws.amazon.com",
        country_id: "US",
        city: "Seattle",
        state: "Washington",
        address_line: "410 Terry Ave N",
        zip_code: "98109",
        founding_year: 2002,
        status: "active",
        observed_at: "2026-04-08T09:08:45.469297",
      },
      region: {
        vendor_id: "aws",
        region_id: "us-east-1",
        name: "US East (N. Virginia)",
        api_reference: "us-east-1",
        display_name: "US East (N. Virginia)",
        country_id: "US",
        status: "active",
        observed_at: "2026-04-08T07:41:06.557719",
      },
      zone: {
        vendor_id: "aws",
        region_id: "us-east-1",
        zone_id: "use1-az1",
        name: "us-east-1a",
        api_reference: "us-east-1a",
        display_name: "us-east-1a",
        status: "active",
        observed_at: "2026-04-08T07:46:15.578745",
      },
      server: {
        vendor_id: "aws",
        server_id: "m7g.large",
        name: "m7g.large",
        api_reference: "m7g.large",
        display_name: "m7g.large",
        description: "AWS Graviton instance",
        cpu_architecture: "arm64",
      },
    },
    {
      vendor_id: "gcp",
      region_id: "us-central1",
      zone_id: "us-central1-a",
      server_id: "n2-standard-2",
      operating_system: "Linux",
      allocation: "ondemand",
      unit: "hour",
      price: 0.16,
      price_upfront: 0,
      price_tiered: [],
      currency: "USD",
      status: "active",
      observed_at: "2026-04-08T08:32:05",
      vendor: {
        vendor_id: "gcp",
        name: "Google Cloud",
        logo: "/assets/images/vendors/gcp.svg",
        homepage: "https://cloud.google.com",
        country_id: "US",
        city: "Mountain View",
        state: "California",
        address_line: "1600 Amphitheatre Parkway",
        zip_code: "94043",
        founding_year: 2008,
        status: "active",
        observed_at: "2026-04-08T09:08:45.469297",
      },
      region: {
        vendor_id: "gcp",
        region_id: "us-central1",
        name: "Iowa",
        api_reference: "us-central1",
        display_name: "Iowa",
        country_id: "US",
        status: "active",
        observed_at: "2026-04-08T07:41:06.557719",
      },
      zone: {
        vendor_id: "gcp",
        region_id: "us-central1",
        zone_id: "us-central1-a",
        name: "us-central1-a",
        api_reference: "us-central1-a",
        display_name: "us-central1-a",
        status: "active",
        observed_at: "2026-04-08T07:46:15.578745",
      },
      server: {
        vendor_id: "gcp",
        server_id: "n2-standard-2",
        name: "n2-standard-2",
        api_reference: "n2-standard-2",
        display_name: "n2-standard-2",
        description: "General purpose machine",
        cpu_architecture: "x86_64",
      },
    },
    {
      vendor_id: "hcloud",
      region_id: "eu-central",
      zone_id: "nbg1-dc3",
      server_id: "cx22",
      operating_system: "Linux",
      allocation: "ondemand",
      unit: "hour",
      price: 0.2,
      price_upfront: 0,
      price_tiered: [],
      currency: "USD",
      status: "active",
      observed_at: "2026-04-08T08:32:05",
      vendor: {
        vendor_id: "hcloud",
        name: "Hetzner Cloud",
        logo: "/assets/images/vendors/hcloud.svg",
        homepage: "https://www.hetzner.com/cloud",
        country_id: "DE",
        city: "Gunzenhausen",
        state: "Bavaria",
        address_line: "Industriestr. 25",
        zip_code: "91710",
        founding_year: 1997,
        status: "active",
        observed_at: "2026-04-08T09:08:45.469297",
      },
      region: {
        vendor_id: "hcloud",
        region_id: "eu-central",
        name: "Nuremberg",
        api_reference: "eu-central",
        display_name: "Nuremberg",
        country_id: "DE",
        status: "active",
        observed_at: "2026-04-08T07:41:06.557719",
      },
      zone: {
        vendor_id: "hcloud",
        region_id: "eu-central",
        zone_id: "nbg1-dc3",
        name: "nbg1-dc3",
        api_reference: "nbg1-dc3",
        display_name: "nbg1-dc3",
        status: "active",
        observed_at: "2026-04-08T07:46:15.578745",
      },
      server: {
        vendor_id: "hcloud",
        server_id: "cx22",
        name: "cx22",
        api_reference: "cx22",
        display_name: "cx22",
        description: "Shared vCPU instance",
        cpu_architecture: "x86_64",
      },
    },
  ];

  it("makes the settled vendor, server, and region entries clickable", () => {
    cy.intercept("GET", "**/server_prices*", {
      statusCode: 200,
      body: serverPricesResponse,
    }).as("searchServerPrices");

    cy.visit("http://localhost:4200/");
    cy.wait("@searchServerPrices");

    cy.get("#cpuCount").clear().type("8");
    cy.get("#ramCount").clear().type("32");

    cy.get("#slot_vendor_link", { timeout: 10000 })
      .should("have.attr", "href")
      .and("include", "/servers?vendor=aws")
      .and("include", "vcpus_min=8")
      .and("include", "memory_min=32");
    cy.get("#slot_server_link")
      .should("have.attr", "href")
      .and("include", "/server/aws/m7g.large");
    cy.get("#slot_region_link")
      .should("have.attr", "href")
      .and("include", "/servers?vendor_regions=aws~us-east-1")
      .and("include", "vcpus_min=8")
      .and("include", "memory_min=32");
  });
});
