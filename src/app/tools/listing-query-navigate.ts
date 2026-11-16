import {
  ActivatedRoute,
  NavigationBehaviorOptions,
  Params,
  Router,
} from "@angular/router";

export type ListingQueryNavigate = {
  params: "replace" | "merge";
  history: "push" | "replace";
  preserveFragment?: boolean;
  scroll?: NavigationBehaviorOptions["scroll"];
};

export function navigateListingQuery(
  router: Router,
  route: ActivatedRoute,
  queryParams: Params,
  mode: ListingQueryNavigate,
) {
  return router.navigate([], {
    relativeTo: route,
    queryParams,
    ...(mode.params === "merge"
      ? { queryParamsHandling: "merge" as const }
      : {}),
    replaceUrl: mode.history === "replace",
    ...(mode.preserveFragment ? { preserveFragment: true } : {}),
    ...(mode.scroll ? { scroll: mode.scroll } : {}),
  });
}
