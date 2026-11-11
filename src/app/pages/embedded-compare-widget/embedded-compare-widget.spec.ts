import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject, of } from "rxjs";

import { EmbeddedCompareWidget } from "./embedded-compare-widget";
import { Analytics } from "../../services/analytics";
import { CompareEmbedData } from "../../services/compare-embed-data";
import { ServerCompareEmbedData } from "../../services/server-compare-embed-data";
import { Toast } from "../../services/toast";
import {
  BAD_DATABASE_COMPARE_URL_TOAST_ID,
  BAD_SERVER_COMPARE_URL_TOAST_ID,
} from "../../services/toast-ids";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve));
}

describe("EmbeddedCompareWidget", () => {
  const showToast = jasmine.createSpy("show");
  const removeToast = jasmine.createSpy("removeToast");
  const serverLoad = jasmine.createSpy("serverLoad");
  let queryParams: BehaviorSubject<Record<string, string>>;
  let routeData: BehaviorSubject<Record<string, string>>;

  let component: EmbeddedCompareWidget;
  let fixture: ComponentFixture<EmbeddedCompareWidget>;

  beforeEach(async () => {
    showToast.calls.reset();
    removeToast.calls.reset();
    serverLoad.calls.reset();
    queryParams = new BehaviorSubject<Record<string, string>>({});
    routeData = new BehaviorSubject<Record<string, string>>({
      resource: "server",
    });

    await TestBed.configureTestingModule({
      imports: [EmbeddedCompareWidget],
      providers: [
        ...sharedTestingProviders,
        {
          provide: ActivatedRoute,
          useValue: {
            data: routeData,
            params: of({ widget: "generic" }),
            queryParams,
          },
        },
        { provide: ServerCompareEmbedData, useValue: { load: serverLoad } },
        {
          provide: Analytics,
          useValue: { SentryException: jasmine.createSpy() },
        },
        { provide: Toast, useValue: { show: showToast, removeToast } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmbeddedCompareWidget);
    component = fixture.componentInstance;
    spyOn(console, "warn");
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
    expect(removeToast).toHaveBeenCalledWith(BAD_SERVER_COMPARE_URL_TOAST_ID);
  });

  it("shows a toast and skips loading for malformed instances data", async () => {
    queryParams.next({ instances: "%not-base64%" });
    await flushPromises();

    expect(component.model()).toBeNull();
    expect(showToast).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        title: "Invalid URL",
        body: "Select servers to compare.",
        type: "error",
        id: BAD_SERVER_COMPARE_URL_TOAST_ID,
        action: jasmine.objectContaining({ label: "Server Navigator page" }),
      }),
    );
    expect(serverLoad).not.toHaveBeenCalled();
  });

  it("uses the database toast for database compare embeds", async () => {
    routeData.next({ resource: "database" });
    queryParams.next({
      instances: btoa(JSON.stringify({ vendor: "aws", database: "db" })),
    });
    await flushPromises();

    expect(showToast).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: BAD_DATABASE_COMPARE_URL_TOAST_ID }),
    );
  });

  it("loads valid server instances", async () => {
    serverLoad.and.resolveTo({
      servers: [],
      instanceProperties: [],
      benchmarkMeta: [],
      benchmarkCategories: [],
      instancePropertyCategories: [],
    });
    const instances = [
      {
        display_name: "c7a.large",
        vendor: "aws",
        server: "c7a.large",
        zonesRegions: [],
      },
    ];
    queryParams.next({ instances: btoa(JSON.stringify(instances)) });
    await flushPromises();

    expect(serverLoad).toHaveBeenCalledWith(instances, "generic");
    expect(component.model()?.server).toBeDefined();
    expect(TestBed.inject(CompareEmbedData)).toBeTruthy();
  });

  it("removes the invalid URL toast on destroy", () => {
    removeToast.calls.reset();
    fixture.destroy();

    expect(removeToast).toHaveBeenCalledWith(BAD_SERVER_COMPARE_URL_TOAST_ID);
  });
});
