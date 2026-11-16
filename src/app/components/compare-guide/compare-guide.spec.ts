import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CompareGuide } from "./compare-guide";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("CompareGuide", () => {
  let fixture: ComponentFixture<CompareGuide>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareGuide],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(CompareGuide);
    fixture.componentRef.setInput("comparePath", "/databases/compare");
    fixture.componentRef.setInput("detailPath", "/database");
    fixture.componentRef.setInput("instanceKey", "database");
    fixture.componentRef.setInput("compares", [
      { id: "intro", title: "Intro", type: "section" },
      {
        id: "small",
        title: "Small databases",
        type: "card",
        instances: [{ vendor: "aws", database: "db.t4g.micro" }],
      },
    ]);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("links cards and instances with the configured paths", () => {
    const hrefs = Array.from(
      fixture.nativeElement.querySelectorAll("a") as NodeListOf<HTMLElement>,
      (link) => link.getAttribute("href"),
    );

    expect(hrefs).toContain("/databases/compare#intro");
    expect(hrefs).toContain("/databases/compare/small");
    expect(hrefs).toContain("/database/aws/db.t4g.micro");
  });
});
