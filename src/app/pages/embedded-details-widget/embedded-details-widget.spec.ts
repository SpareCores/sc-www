import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";

import { EmbeddedDetailsWidget } from "./embedded-details-widget";
import { Analytics } from "../../services/analytics";
import { DetailsEmbedData } from "../../services/details-embed-data";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("EmbeddedDetailsWidget", () => {
  const load = jasmine.createSpy("load");

  let component: EmbeddedDetailsWidget;
  let fixture: ComponentFixture<EmbeddedDetailsWidget>;

  beforeEach(async () => {
    load.calls.reset();
    load.and.resolveTo({
      path: "/database/aws/db.m5.large",
      linkLabel: "db.m5.large",
      card: {
        cardId: "details",
        cardTitle: "Database Metadata",
        fixedRows: true,
        sections: [
          {
            name: "Database Metadata",
            rows: [{ id: "name", name: "Name", values: ["db.m5.large"] }],
          },
        ],
      },
    });

    await TestBed.configureTestingModule({
      imports: [EmbeddedDetailsWidget],
      providers: [
        ...sharedTestingProviders,
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ resource: "database" }),
            params: of({
              vendor: "aws",
              id: "db.m5.large",
              widget: "metadata",
            }),
          },
        },
        { provide: DetailsEmbedData, useValue: { load } },
        {
          provide: Analytics,
          useValue: { SentryException: jasmine.createSpy() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmbeddedDetailsWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("loads the widget for the routed resource", () => {
    expect(load).toHaveBeenCalledWith(
      "database",
      "aws",
      "db.m5.large",
      "metadata",
    );
  });

  it("renders a card widget without the expand button", async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector("#details")).not.toBeNull();
    expect(element.querySelector("#details_more_button")).toBeNull();
    expect(element.querySelector("sc-server-charts")).toBeNull();
  });
});
