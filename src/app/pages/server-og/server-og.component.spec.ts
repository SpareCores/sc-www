import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { of } from "rxjs";

import { ServerOGComponent } from "./server-og.component";
import { AnalyticsService } from "../../services/analytics.service";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { SeoHandlerService } from "../../services/seo-handler.service";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("ServerOGComponent", () => {
  const routeSnapshot = {
    paramMap: convertToParamMap({ vendor: "aws", id: "t3.micro" }),
    data: {} as Record<string, unknown>,
  };
  const setNoFollow = jasmine.createSpy("setNoFollow");
  const updateDescriptions = jasmine.createSpy("updateDescriptions");
  const sentryException = jasmine.createSpy("SentryException");
  const getServerMeta = jasmine.createSpy("getServerMeta");
  const getServerBenchmarkMeta = jasmine.createSpy("getServerBenchmarkMeta");
  const getServerV2 = jasmine.createSpy("getServerV2");
  const getServerPrices = jasmine.createSpy("getServerPrices");
  const getServerBenchmark = jasmine.createSpy("getServerBenchmark");
  const getVendors = jasmine.createSpy("getVendors");

  let component: ServerOGComponent;
  let fixture: ComponentFixture<ServerOGComponent>;

  const serverBody = {
    display_name: "t3.micro",
    vendor_id: "aws",
    vcpus: 2,
    cpu_cores: 1,
    memory_amount: 1024,
    storage_size: 0,
    gpu_count: 0,
    prices: [{ price: 0.01, currency: "USD" }],
  };

  beforeEach(async () => {
    routeSnapshot.data = {};
    setNoFollow.calls.reset();
    updateDescriptions.calls.reset();
    sentryException.calls.reset();
    getServerMeta.calls.reset();
    getServerBenchmarkMeta.calls.reset();
    getServerV2.calls.reset();
    getServerPrices.calls.reset();
    getServerBenchmark.calls.reset();
    getVendors.calls.reset();

    getServerMeta.and.resolveTo({ body: { fields: [] } });
    getServerBenchmarkMeta.and.resolveTo({ body: {} });
    getServerV2.and.resolveTo({ body: serverBody });
    getServerPrices.and.resolveTo({ body: [] });
    getServerBenchmark.and.resolveTo({ body: [] });
    getVendors.and.resolveTo({
      body: [{ vendor_id: "aws", name: "AWS", logo: "/logo.png" }],
    });

    await TestBed.configureTestingModule({
      imports: [ServerOGComponent],
      providers: [
        ...sharedTestingProviders,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: routeSnapshot,
            params: of({ vendor: "aws", id: "t3.micro" }),
          },
        },
        {
          provide: KeeperAPIService,
          useValue: {
            getServerMeta,
            getServerBenchmarkMeta,
            getServerV2,
            getServerPrices,
            getServerBenchmark,
            getVendors,
          },
        },
        {
          provide: SeoHandlerService,
          useValue: { setNoFollow, updateDescriptions },
        },
        {
          provide: AnalyticsService,
          useValue: { SentryException: sentryException },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerOGComponent);
    component = fixture.componentInstance;
  });

  it("should create", async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });

  it("uses resolved og_description from route data", async () => {
    routeSnapshot.data = {
      serverDescription: {
        meta_description: "Meta text",
        og_description: "AI text",
      },
    };

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.description).toBe("AI text");
    expect(updateDescriptions).toHaveBeenCalledWith("Meta text", "AI text");
  });

  it("falls back to placeholder when resolver returns no description", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.description).toContain(
      "The t3.micro server is equipped with",
    );
  });
});
