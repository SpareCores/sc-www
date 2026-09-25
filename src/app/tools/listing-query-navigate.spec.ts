import { ActivatedRoute, Router } from "@angular/router";
import { navigateListingQuery } from "./listing-query-navigate";

describe("navigateListingQuery", () => {
  it("replaces query params and pushes history for filter updates", () => {
    const navigate = jasmine.createSpy("navigate").and.resolveTo(true);
    const router = { navigate } as unknown as Router;
    const route = {} as ActivatedRoute;

    navigateListingQuery(
      router,
      route,
      { vcpus_min: "105" },
      { params: "replace", history: "push" },
    );

    expect(navigate).toHaveBeenCalledOnceWith([], {
      relativeTo: route,
      queryParams: { vcpus_min: "105" },
      replaceUrl: false,
    });
  });

  it("merges query params and replaces history for column updates", () => {
    const navigate = jasmine.createSpy("navigate").and.resolveTo(true);
    const router = { navigate } as unknown as Router;
    const route = {} as ActivatedRoute;

    navigateListingQuery(
      router,
      route,
      { columns: 7 },
      { params: "merge", history: "replace" },
    );

    expect(navigate).toHaveBeenCalledOnceWith([], {
      relativeTo: route,
      queryParams: { columns: 7 },
      queryParamsHandling: "merge",
      replaceUrl: true,
    });
  });

  it("preserves the URL fragment when requested", () => {
    const navigate = jasmine.createSpy("navigate").and.resolveTo(true);
    const router = { navigate } as unknown as Router;
    const route = {} as ActivatedRoute;

    navigateListingQuery(
      router,
      route,
      { instances: "abc" },
      { params: "replace", history: "push", preserveFragment: true },
    );

    expect(navigate).toHaveBeenCalledOnceWith([], {
      relativeTo: route,
      queryParams: { instances: "abc" },
      replaceUrl: false,
      preserveFragment: true,
    });
  });
});
