import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ServerDescriptionSummary } from "./server-description-summary";
import { ServerDescription } from "../../../../sdk/data-contracts";

const DESCRIPTION = {
  page: ["First paragraph.", "Second paragraph."],
  description: "Short description.",
  og_description: "",
  meta_description: "",
  tagline: "Fast and cheap",
  bullet_points: ["Highlight"],
  categories: [],
  vendor_id: "aws",
  server_id: "m5.large",
} as ServerDescription;

describe("ServerDescriptionSummary", () => {
  let component: ServerDescriptionSummary;
  let fixture: ComponentFixture<ServerDescriptionSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerDescriptionSummary],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerDescriptionSummary);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("description", DESCRIPTION);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
    expect(
      fixture.nativeElement.querySelectorAll(".summary-paragraph").length,
    ).toBe(2);
    expect(fixture.nativeElement.querySelector(".summary-tagline")).toBeNull();
  });

  it("renders the tagline when the header is shown", () => {
    fixture.componentRef.setInput("showHeader", true);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector(".summary-tagline").textContent,
    ).toContain("Fast and cheap");
  });
});
