import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DatabaseCompareSpecRows } from "./database-compare-spec-rows";
import {
  ComparePropertyRow,
  ComparePropertySection,
  LoadedCompareDatabase,
} from "../../services/database-compare-specs.types";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

@Component({
  imports: [DatabaseCompareSpecRows],
  template: `<table>
    <sc-database-compare-spec-rows
      [sections]="sections"
      [priceRows]="priceRows"
      [databases]="databases"
      [baselineIndex]="0"
    ></sc-database-compare-spec-rows>
  </table>`,
})
class HostComponent {
  databases = [
    { vendor_id: "aws", benchmark_scores: [] },
    { vendor_id: "gcp", benchmark_scores: [] },
  ] as unknown as LoadedCompareDatabase[];
  sections: ComparePropertySection[] = [
    {
      name: "Capacity",
      rows: [
        {
          id: "vcpus",
          name: "vCPUs",
          values: ["2", "4"],
          rawValues: [2, 4],
        },
      ],
    },
  ];
  priceRows: ComparePropertyRow[] = [];
}

describe("DatabaseCompareSpecRows", () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it("renders the section rows into a tbody", () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector("tbody tr.section_header")).not.toBeNull();
    expect(element.textContent).toContain("vCPUs");
  });

  it("shows the delta against the baseline database", () => {
    expect(
      fixture.nativeElement.querySelector(".compare-table-delta"),
    ).not.toBeNull();
  });
});
