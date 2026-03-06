import { HttpRequest } from "@angular/common/http";

const heavyPaths = [
  "/server",
  "/server_prices",
  "/servers",
  "/storages",
  "/table/",
  "/traffic-prices",
  "/navigator/benchmark-coverage",
];

export function httpTransferCacheFilter(req: HttpRequest<any>): boolean {
  const isHeavy = heavyPaths.some((path) => req.url.includes(path));

  return req.method === "GET" && !isHeavy;
}
