import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";

import { DatabaseCompareComponent } from "./database-compare.component";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { ToastService } from "../../services/toast.service";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("DatabaseCompareComponent", () => {
  let component: DatabaseCompareComponent;
  let fixture: ComponentFixture<DatabaseCompareComponent>;
  let toastService: ToastService;

  const getDatabase = jasmine.createSpy("getDatabase");
  const getDatabasePrices = jasmine.createSpy("getDatabasePrices");
  const getDatabaseBenchmarks = jasmine.createSpy("getDatabaseBenchmarks");
  const getServerBenchmarkMeta = jasmine.createSpy("getServerBenchmarkMeta");
  const getServerV2 = jasmine.createSpy("getServerV2");
  const getVendors = jasmine.createSpy("getVendors");
  const getRegions = jasmine.createSpy("getRegions");

  beforeEach(async () => {
    getDatabase.calls.reset();
    getDatabasePrices.calls.reset();
    getDatabaseBenchmarks.calls.reset();
    getServerBenchmarkMeta.calls.reset();
    getServerV2.calls.reset();
    getVendors.calls.reset();
    getRegions.calls.reset();

    getServerBenchmarkMeta.and.resolveTo({ body: [] });
    getServerV2.and.resolveTo({ body: null });
    getVendors.and.resolveTo({ body: [] });
    getRegions.and.resolveTo({ body: [] });

    await TestBed.configureTestingModule({
      imports: [DatabaseCompareComponent],
      providers: [
        ...sharedTestingProviders,
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({}),
            params: of({}),
            snapshot: { queryParams: {}, paramMap: { get: () => null } },
          },
        },
        {
          provide: KeeperAPIService,
          useValue: {
            getDatabase,
            getDatabasePrices,
            getDatabaseBenchmarks,
            getServerBenchmarkMeta,
            getServerV2,
            getVendors,
            getRegions,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DatabaseCompareComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("shows an invalid URL toast for bad instances", async () => {
    const show = spyOn(toastService, "show");
    const route = TestBed.inject(ActivatedRoute) as any;
    route.snapshot.queryParams = { instances: "not-valid-base64" };
    route.queryParams = of({ instances: "not-valid-base64" });

    fixture = TestBed.createComponent(DatabaseCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(show).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: "Invalid URL",
        id: "bad-database-compare-url-param",
      }),
    );
    expect(component.databases.length).toBe(0);
  });

  it("loads databases and builds property rows", async () => {
    const instances = btoa(
      JSON.stringify([
        { display_name: "db-a", vendor: "aws", database: "db-a" },
        { display_name: "db-b", vendor: "gcp", database: "db-b" },
      ]),
    );

    getDatabase.and.callFake((_vendor: string, database: string) =>
      Promise.resolve({
        body: {
          vendor_id: database === "db-a" ? "aws" : "gcp",
          database_id: database,
          api_reference: database,
          display_name: database,
          name: database,
          engine: "postgres",
          vcpus: 2,
          memory_amount: 4096,
        },
      }),
    );
    getDatabasePrices.and.resolveTo({
      body: [{ price: 0.1, currency: "USD", unit: "hour" }],
    });
    getDatabaseBenchmarks.and.resolveTo({
      body: [
        {
          benchmark_id: "pgbench:heavy_read_only",
          score: 100,
          config: { concurrency: 2 },
        },
      ],
    });
    getVendors.and.resolveTo({
      body: [
        { vendor_id: "aws", name: "AWS" },
        { vendor_id: "gcp", name: "GCP" },
      ],
    });

    const route = TestBed.inject(ActivatedRoute) as any;
    route.snapshot.queryParams = { instances };
    route.queryParams = of({ instances });

    fixture = TestBed.createComponent(DatabaseCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.databases.length).toBe(2);
    expect(component.propertySections.length).toBeGreaterThan(0);
    expect(component.priceRows.length).toBeGreaterThan(0);
  });

  it("omits the chart servers when there are no pgbench scores", async () => {
    const instances = btoa(
      JSON.stringify([
        { display_name: "db-a", vendor: "aws", database: "db-a" },
        { display_name: "db-b", vendor: "gcp", database: "db-b" },
      ]),
    );

    getDatabase.and.callFake((_vendor: string, database: string) =>
      Promise.resolve({
        body: {
          vendor_id: database === "db-a" ? "aws" : "gcp",
          database_id: database,
          api_reference: database,
          display_name: database,
          name: database,
          engine: "postgres",
        },
      }),
    );
    getDatabasePrices.and.resolveTo({ body: [] });
    getDatabaseBenchmarks.and.resolveTo({ body: [] });

    const route = TestBed.inject(ActivatedRoute) as any;
    route.snapshot.queryParams = { instances };
    route.queryParams = of({ instances });

    fixture = TestBed.createComponent(DatabaseCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(
      component.lineCompareServers.every(
        (server) => !server.benchmark_scores.length,
      ),
    ).toBeTrue();
  });
});
