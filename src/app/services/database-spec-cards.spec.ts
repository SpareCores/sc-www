import { TestBed } from "@angular/core/testing";

import { Database } from "../../../sdk/data-contracts";
import { DatabaseSpecCards } from "./database-spec-cards";

describe("DatabaseSpecCards", () => {
  let service: DatabaseSpecCards;

  beforeEach(() => {
    service = TestBed.inject(DatabaseSpecCards);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("links the underlying server in the metadata card", () => {
    const sections = service.buildSections({
      ...({
        vendor_id: "aws",
        name: "db.m5.large",
        server_id: "m5.large",
      } as Database),
      underlyingServer: {
        display_name: "m5.large",
        api_reference: "m5.large",
      },
    });

    expect(
      sections.metadataSections[0].rows.find((row) => row.id === "server_id")
        ?.routerLink,
    ).toEqual(["/server", "aws", "m5.large"]);
  });
});
