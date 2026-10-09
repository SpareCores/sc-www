import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AuthStateService } from "../../../../core/auth";
import { CollectionsUiService } from "../../../../collections/collections-ui.service";
import {
  GUEST_COUNTRY_LIMIT_TOAST_ID,
  GUEST_REGION_LIMIT_TOAST_ID,
} from "../../../../services/toast-ids";
import { ToastService } from "../../../../services/toast.service";
import type {
  CountryMetadata,
  SearchBarParameter,
} from "../../types/search-bar.types";
import { SearchBarGeoFilters } from "./search-bar-geo-filters";

describe("SearchBarGeoFilters", () => {
  let fixture: ComponentFixture<SearchBarGeoFilters>;
  let component: SearchBarGeoFilters;
  let promptRegisterForFeature: jasmine.Spy;
  let show: jasmine.Spy;
  let isAuthenticated: ReturnType<typeof signal<boolean>>;

  beforeEach(async () => {
    isAuthenticated = signal(false);
    promptRegisterForFeature = jasmine.createSpy("promptRegisterForFeature");
    show = jasmine.createSpy("show");

    await TestBed.configureTestingModule({
      imports: [SearchBarGeoFilters],
      providers: [
        {
          provide: AuthStateService,
          useValue: {
            isAuthenticated: () => isAuthenticated(),
          },
        },
        {
          provide: CollectionsUiService,
          useValue: { promptRegisterForFeature },
        },
        {
          provide: ToastService,
          useValue: { show },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarGeoFilters);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("filterCategoryId", "geo");
    fixture.componentRef.setInput("parameter", {
      name: "countries",
      modelValue: [],
      schema: { category_id: "geo" },
    } satisfies SearchBarParameter);
  });

  it("exposes a registration action on the country-limit toast", () => {
    const countries: CountryMetadata[] = [
      { continent: "EU", country_id: "DE", selected: false },
      { continent: "EU", country_id: "FR", selected: false },
    ];
    fixture.componentRef.setInput("countryMetadata", countries);
    fixture.componentRef.setInput("continentMetadata", [
      { continent: "EU", selected: false, collapsed: false },
    ]);

    component.toggleCountry(countries[0]);

    expect(show).toHaveBeenCalledWith(
      jasmine.objectContaining({
        id: GUEST_COUNTRY_LIMIT_TOAST_ID,
        type: "warning",
        action: jasmine.objectContaining({
          onClick: jasmine.any(Function),
        }),
      }),
    );
    const toastArg = show.calls.mostRecent().args[0] as {
      action?: { onClick: () => void };
    };
    toastArg.action?.onClick();
    expect(promptRegisterForFeature).toHaveBeenCalled();
  });

  it("exposes a registration action on the region-limit toast", () => {
    const parameter: SearchBarParameter = {
      name: "vendor_regions",
      modelValue: ["aws~us-east-1", "aws~us-west-2"],
      schema: {
        category_id: "geo",
        enum: [
          "aws~us-east-1",
          "aws~us-west-2",
          "aws~eu-west-1",
          "gcp~us-central1",
        ],
      },
    };
    fixture.componentRef.setInput("parameter", parameter);
    fixture.componentRef.setInput("maxVendorRegions", 3);

    component.toggleVendorRegion(parameter, "aws~eu-west-1");

    expect(show).toHaveBeenCalledWith(
      jasmine.objectContaining({
        id: GUEST_REGION_LIMIT_TOAST_ID,
        type: "warning",
        action: jasmine.objectContaining({
          onClick: jasmine.any(Function),
        }),
      }),
    );
    const toastArg = show.calls.mostRecent().args[0] as {
      action?: { onClick: () => void };
    };
    toastArg.action?.onClick();
    expect(promptRegisterForFeature).toHaveBeenCalled();
  });
});
