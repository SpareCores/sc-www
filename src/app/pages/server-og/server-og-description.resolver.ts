import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { ServerDescription } from "../../../../sdk/data-contracts";
import { KeeperAPIService } from "../../services/keeper-api.service";

export const serverOgDescriptionResolver: ResolveFn<
  ServerDescription | null
> = (route) => {
  const keeperAPI = inject(KeeperAPIService);
  const vendor = route.paramMap.get("vendor");
  const id = route.paramMap.get("id");
  if (!vendor || !id) {
    return null;
  }
  return keeperAPI
    .getServerDescriptions(vendor, id)
    .then((response) => (response?.body as ServerDescription) ?? null)
    .catch(() => null);
};
