import { inject } from "@angular/core";
import { RedirectFunction, Router } from "@angular/router";

export const redirectServerComparison: RedirectFunction = ({
  params,
  queryParams,
  fragment,
}) => {
  const router = inject(Router);

  return router.createUrlTree(
    ["/servers/compare", ...(params["id"] ? [params["id"]] : [])],
    {
      queryParams,
      fragment: fragment ?? undefined,
    },
  );
};
