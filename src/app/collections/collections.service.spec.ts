import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideHttpClient, withFetch } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { CollectionsService } from "./collections.service";
import { favoriteServerId } from "./collections.types";

describe("CollectionsService", () => {
  let service: CollectionsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withFetch()), provideHttpClientTesting()],
    });

    service = TestBed.inject(CollectionsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("lists favorite servers", async () => {
    const listPromise = firstValueFrom(service.listFavoriteServers());

    const request = http.expectOne((req) =>
      req.url.includes("/collections/favorite_servers"),
    );
    expect(request.request.method).toBe("GET");
    request.flush([
      {
        id: "aws~t3.nano",
        vendor_id: "aws",
        server_id: "t3.nano",
        note: "cheap",
      },
    ]);

    await expectAsync(listPromise).toBeResolvedTo([
      {
        id: "aws~t3.nano",
        vendor_id: "aws",
        server_id: "t3.nano",
        note: "cheap",
      },
    ]);
  });

  it("gets a favorite server by vendor and server id", async () => {
    const id = favoriteServerId("aws", "t3.nano");
    const getPromise = firstValueFrom(
      service.getFavoriteServer("aws", "t3.nano"),
    );

    const request = http.expectOne((req) =>
      req.url.includes(`/collections/favorite_servers/${encodeURIComponent(id)}`),
    );
    expect(request.request.method).toBe("GET");
    request.flush({
      id,
      vendor_id: "aws",
      server_id: "t3.nano",
      note: "cheap",
    });

    await expectAsync(getPromise).toBeResolvedTo({
      id,
      vendor_id: "aws",
      server_id: "t3.nano",
      note: "cheap",
    });
  });

  it("saves a search", async () => {
    const savePromise = firstValueFrom(
      service.saveSearch("search-1", {
        page: "servers",
        name: "GPU boxes",
        note: "gpu boxes",
        query: { vcpus_min: 2 },
      }),
    );

    const request = http.expectOne((req) =>
      req.url.includes("/collections/saved_searches/search-1"),
    );
    expect(request.request.method).toBe("PUT");
    expect(request.request.body).toEqual({
      page: "servers",
      name: "GPU boxes",
      note: "gpu boxes",
      query: { vcpus_min: 2 },
    });
    request.flush({
      id: "search-1",
      page: "servers",
      name: "GPU boxes",
      note: "gpu boxes",
      query: { vcpus_min: 2 },
    });

    await expectAsync(savePromise).toBeResolvedTo({
      id: "search-1",
      page: "servers",
      name: "GPU boxes",
      note: "gpu boxes",
      query: { vcpus_min: 2 },
    });
  });

  it("reorders collection items", async () => {
    const reorderPromise = firstValueFrom(
      service.reorderCollectionItems([
        {
          collectionType: "saved_searches",
          id: "search-2",
          body: {
            name: "Second",
            page: "servers",
            query: {},
            order: 0,
          },
        },
        {
          collectionType: "saved_searches",
          id: "search-1",
          body: {
            name: "First",
            page: "servers",
            query: {},
            order: 1,
          },
        },
      ]),
    );

    const first = http.expectOne((req) =>
      req.url.includes("/collections/saved_searches/search-2"),
    );
    expect(first.request.method).toBe("PUT");
    expect(first.request.body).toEqual({
      name: "Second",
      page: "servers",
      query: {},
      order: 0,
    });
    first.flush({
      id: "search-2",
      name: "Second",
      page: "servers",
      query: {},
      order: 0,
    });

    const second = http.expectOne((req) =>
      req.url.includes("/collections/saved_searches/search-1"),
    );
    expect(second.request.method).toBe("PUT");
    expect(second.request.body).toEqual({
      name: "First",
      page: "servers",
      query: {},
      order: 1,
    });
    second.flush({
      id: "search-1",
      name: "First",
      page: "servers",
      query: {},
      order: 1,
    });

    await expectAsync(reorderPromise).toBeResolved();
  });

  it("deletes a favorite server", async () => {
    const id = favoriteServerId("aws", "t3.nano");
    const deletePromise = firstValueFrom(
      service.deleteFavoriteServer("aws", "t3.nano"),
    );

    const request = http.expectOne((req) =>
      req.url.includes(`/collections/favorite_servers/${encodeURIComponent(id)}`),
    );
    expect(request.request.method).toBe("DELETE");
    request.flush(null, { status: 204, statusText: "No Content" });

    await expectAsync(deletePromise).toBeResolved();
  });
});
