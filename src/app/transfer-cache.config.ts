import { HttpRequest } from "@angular/common/http";

export function httpTransferCacheFilter(req: HttpRequest<any>): boolean {
  return req.method === "GET";
}
