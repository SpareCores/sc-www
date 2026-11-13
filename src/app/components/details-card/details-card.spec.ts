import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DetailsCard } from "./details-card";
import { DetailsCardSection } from "./details-card.types";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

const AVAILABILITY_SECTIONS: DetailsCardSection[] = [
  {
    name: "Availability",
    columns: ["Region / ID", "Spot", "Ondemand"],
    rows: [
      {
        id: "us-east-1",
        name: "US East",
        detail: "us-east-1",
        values: ["-", "0.1 USD/h"],
        warning: "Last known price, not currently orderable.",
      },
    ],
  },
];

describe("DetailsCard", () => {
  let component: DetailsCard;
  let fixture: ComponentFixture<DetailsCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsCard],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("cardTitle", "Availability");
    fixture.componentRef.setInput("cardId", "availability");
    fixture.componentRef.setInput("sections", AVAILABILITY_SECTIONS);
    fixture.componentRef.setInput("rowClass", "availability_line");
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("renders the column headers and one cell per value", () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll("thead th").length).toBe(3);
    expect(element.querySelectorAll(".availability_line td").length).toBe(3);
    expect(element.querySelector(".availability_line")?.className).toContain(
      "opacity-60",
    );
  });

  it("emits a toggle request from the show more button", () => {
    const toggleSpy = jasmine.createSpy("toggle");
    component.toggleRequested.subscribe(toggleSpy);
    component.canExpand.set(true);
    fixture.detectChanges();

    fixture.nativeElement
      .querySelector("#availability_more_button button")
      .click();

    expect(toggleSpy).toHaveBeenCalled();
  });

  it("hides the toggle when not expandable", () => {
    component.canExpand.set(true);
    fixture.componentRef.setInput("expandable", false);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector("#availability_more"),
    ).toBeNull();
  });
});
