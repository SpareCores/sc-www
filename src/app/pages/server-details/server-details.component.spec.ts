import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject } from "rxjs";

import { ServerDetailsComponent } from "./server-details.component";
import { KeeperAPIService } from "../../services/keeper-api.service";
import { ToastService } from "../../services/toast.service";
import { SERVER_DETAILS_ERROR_TOAST_ID } from "../../services/toast-ids";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("ServerDetailsComponent", () => {
  let component: ServerDetailsComponent;
  let fixture: ComponentFixture<ServerDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerDetailsComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("formats hw virt with icons and dashes like the tables", () => {
    component.serverDetails = {
      hw_virt: true,
      vendor: { name: "Vendor", homepage: "", status_page: "", logo: "" },
    } as never;

    expect(component.getProperty({ id: "hw_virt" })).toBe("check");

    component.serverDetails = {
      hw_virt: false,
      vendor: { name: "Vendor", homepage: "", status_page: "", logo: "" },
    } as never;

    expect(component.getProperty({ id: "hw_virt" })).toBe("x");

    component.serverDetails = {
      hw_virt: "none",
      vendor: { name: "Vendor", homepage: "", status_page: "", logo: "" },
    } as never;

    expect(component.getProperty({ id: "hw_virt" })).toBe("-");
  });

  it("keeps non hw virt booleans hidden", () => {
    component.serverDetails = {
      virtualization: true,
      vendor: { name: "Vendor", homepage: "", status_page: "", logo: "" },
    } as never;

    expect(component.getProperty({ id: "virtualization" })).toBeUndefined();

    component.serverDetails = {
      virtualization: false,
      vendor: { name: "Vendor", homepage: "", status_page: "", logo: "" },
    } as never;

    expect(component.getProperty({ id: "virtualization" })).toBeUndefined();
  });
});

describe("ServerDetailsComponent route reloads", () => {
  let component: ServerDetailsComponent;
  let fixture: ComponentFixture<ServerDetailsComponent>;
  let keeperAPI: jasmine.SpyObj<KeeperAPIService>;
  const params$ = new BehaviorSubject({ vendor: "aws", id: "old" });

  beforeEach(async () => {
    const pending = () => new Promise(() => {});

    keeperAPI = jasmine.createSpyObj<KeeperAPIService>("KeeperAPIService", [
      "getServerMeta",
      "getServerBenchmarkMeta",
      "getServerSimilarServers",
      "getServerPrices",
      "getServerBenchmark",
      "getServerV2",
      "getVendors",
      "getRegions",
      "getZones",
      "getServerDescriptions",
    ]);

    keeperAPI.getServerMeta.and.returnValues(
      Promise.resolve({ body: { fields: [] } }),
      pending(),
    );
    keeperAPI.getServerBenchmarkMeta.and.returnValues(
      Promise.resolve({ body: [] }),
      pending(),
    );
    keeperAPI.getServerSimilarServers.and.returnValues(
      Promise.resolve({ body: [] }),
      Promise.resolve({ body: [] }),
      pending(),
      pending(),
    );
    keeperAPI.getServerPrices.and.returnValues(
      Promise.resolve({ body: [] }),
      pending(),
    );
    keeperAPI.getServerBenchmark.and.returnValues(
      Promise.resolve({ body: [] }),
      pending(),
    );
    let serverV2Calls = 0;
    keeperAPI.getServerV2.and.callFake(() => {
      serverV2Calls += 1;
      if (serverV2Calls === 1) {
        return Promise.resolve({
          body: {
            vendor_id: "aws",
            api_reference: "old",
            display_name: "Old Server",
            description: "general purpose",
            vcpus: 4,
            memory_amount: 8192,
            storage_size: 100,
            server_id: "aws.old",
          },
        });
      }
      return Promise.reject({ status: 404 });
    });
    keeperAPI.getVendors.and.returnValues(
      Promise.resolve({
        body: [
          {
            vendor_id: "aws",
            name: "AWS",
            homepage: "",
            status_page: "",
            logo: "",
            country_id: "us",
          },
        ],
      }),
      pending(),
    );
    keeperAPI.getRegions.and.returnValues(
      Promise.resolve({ body: [] }),
      pending(),
    );
    keeperAPI.getZones.and.returnValues(
      Promise.resolve({ body: [] }),
      pending(),
    );
    keeperAPI.getServerDescriptions.and.returnValue(
      Promise.resolve({ body: null }),
    );

    await TestBed.configureTestingModule({
      imports: [ServerDetailsComponent],
      providers: [
        ...sharedTestingProviders,
        {
          provide: ActivatedRoute,
          useValue: {
            params: params$.asObservable(),
            snapshot: { queryParams: {} },
          },
        },
        {
          provide: KeeperAPIService,
          useValue: keeperAPI,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerDetailsComponent);
    component = fixture.componentInstance;
  });

  it("clears stale server details before showing a failed route load", fakeAsync(() => {
    const toastService = TestBed.inject(ToastService);
    const showHttpError = spyOn(toastService, "showHttpError");

    fixture.detectChanges();
    tick();

    expect(component.serverDetails.display_name).toBe("Old Server");

    params$.next({ vendor: "aws", id: "missing" });

    expect((component as any).serverDetails).toBeUndefined();
    expect(component.isLoading).toBeTrue();

    tick();

    expect((component as any).serverDetails).toBeUndefined();
    expect(component.keeperResponseErrorMsg).toBe(
      "The requested server was not found.",
    );
    expect(showHttpError).toHaveBeenCalledWith(
      jasmine.objectContaining({ status: 404 }),
      jasmine.objectContaining({
        id: SERVER_DETAILS_ERROR_TOAST_ID,
        title: "Failed to load server details.",
      }),
    );
  }));
});
