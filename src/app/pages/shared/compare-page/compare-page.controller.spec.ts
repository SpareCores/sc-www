import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { of } from "rxjs";

import { ComparePageController } from "./compare-page.controller";
import { CompareCollections } from "../../../collections/compare-collections";
import type { SavedComparisonItem } from "../../../collections/collections.types";
import { ComparePageHost } from "./compare-page.types";
import { availableCurrencies } from "../../../tools/shared_data";
import { sharedTestingProviders } from "../../../../testing/testbed.providers";

describe("ComparePageController", () => {
  let controller: ComparePageController;
  let host: ComparePageHost;
  let routeSnapshot: {
    paramMap: ReturnType<typeof convertToParamMap>;
    queryParams: Record<string, string>;
  };

  beforeEach(() => {
    routeSnapshot = { paramMap: convertToParamMap({}), queryParams: {} };
    TestBed.configureTestingModule({
      providers: [
        ...sharedTestingProviders,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: routeSnapshot,
            paramMap: of(convertToParamMap({})),
            queryParamMap: of(convertToParamMap({})),
          },
        },
      ],
    });

    host = {
      instances: () => [
        { display_name: "db-a", vendor: "aws", database: "db-a" },
      ],
      instancesRaw: () => "abc",
      baseline: () => ({ vendor_id: "aws", api_reference: "db-a" }),
      currency: () => availableCurrencies[0],
      isLoading: () => true,
      compareDataReady: () => false,
      saveModal: () => undefined,
      onLoadFinished: jasmine.createSpy("onLoadFinished"),
    };

    controller = TestBed.runInInjectionContext(
      () =>
        new ComparePageController(
          {
            collectionTarget: "compare-databases",
            comparePath: "/databases/compare",
            parentBreadcrumb: { name: "Databases", url: "/databases" },
            guideTitle: "Guide",
            guideDescription: "Guide description",
            comparisonTitle: "Comparison",
            baselineIdParam: "baseline_database",
            keywords: "databases",
            premadeComparisons: [
              {
                id: "premade-1",
                title: "Premade",
                description: "Premade description",
              },
            ],
          },
          host,
        ),
    );
  });

  it("starts with the guide chrome", () => {
    expect(controller.title).toBe("Guide");
    expect(controller.breadcrumbs.map((segment) => segment.url)).toEqual([
      "/",
      "/databases",
      "/databases/compare",
    ]);
  });

  it("builds the canonical URL with the resource baseline param", () => {
    expect(controller.urlQueryParams()).toEqual({
      instances: "abc",
      baseline_vendor: "aws",
      baseline_database: "db-a",
    });
    expect(controller.canonicalUrl()).toContain("/databases/compare?");
  });

  it("adds the custom comparison breadcrumb", () => {
    controller.setCustomBreadcrumb(2);

    expect(controller.breadcrumbs.at(-1)).toEqual(
      jasmine.objectContaining({
        name: "Custom Comparison (2)",
        queryParams: { instances: "abc" },
      }),
    );
  });

  it("restores the premade chrome after its bookmark is deleted", () => {
    routeSnapshot.paramMap = convertToParamMap({ id: "premade-1" });
    const savedComparisonByUrls = spyOn(
      TestBed.inject(CompareCollections),
      "savedComparisonByUrls",
    ).and.returnValue({
      id: "saved-1",
      name: "My comparison",
      compare_url: "/databases/compare/premade-1",
    } as SavedComparisonItem);

    controller.syncSavedComparisonChrome();
    expect(controller.title).toBe("My comparison");

    savedComparisonByUrls.and.returnValue(null);
    controller.syncSavedComparisonChrome();

    expect(controller.title).toBe("Premade");
    expect(controller.description).toBe("Premade description");
    expect(controller.breadcrumbs.at(-1)).toEqual({
      name: "Premade",
      url: "/databases/compare/premade-1",
    });
  });
});
