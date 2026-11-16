import { PLATFORM_ID } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HttpTestingController } from "@angular/common/http/testing";

import { ServerLstopo } from "./server-lstopo";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

const SVG_URL =
  "https://cdn.jsdelivr.net/gh/SpareCores/sc-inspector-data@main/data/aws/m7i.large/0/lstopo/lstopo.svg";
const SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><rect class="PU" data-description="Core 0" width="10" height="10"/></svg>';

describe("ServerLstopo", () => {
  let component: ServerLstopo;
  let fixture: ComponentFixture<ServerLstopo>;
  let httpMock: HttpTestingController;
  let svgExists: jasmine.Spy;

  function setup(platform: "browser" | "server"): void {
    TestBed.configureTestingModule({
      imports: [ServerLstopo],
      providers: [
        ...sharedTestingProviders,
        { provide: PLATFORM_ID, useValue: platform },
      ],
    });

    fixture = TestBed.createComponent(ServerLstopo);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    svgExists = jasmine.createSpy("svgExists");
    component.svgExists.subscribe(svgExists);
    fixture.componentRef.setInput("vendorId", "aws");
    fixture.componentRef.setInput("apiReference", "m7i.large");
    fixture.detectChanges();
  }

  const host = (): HTMLElement => fixture.nativeElement;

  afterEach(() => {
    httpMock.verify();
  });

  it("should create", () => {
    setup("browser");
    httpMock.expectOne(SVG_URL);

    expect(component).toBeTruthy();
  });

  it("skips the SVG request during server rendering and keeps the spinner", () => {
    setup("server");

    httpMock.expectNone(SVG_URL);
    expect(component.isLoading).toBeTrue();
    expect(host().querySelector(".animate-spin")).not.toBeNull();
    expect(host().querySelector(".lstopo-inline-svg")).toBeNull();
    expect(svgExists).not.toHaveBeenCalled();
  });

  it("renders the SVG fetched in the browser", () => {
    setup("browser");

    httpMock.expectOne(SVG_URL).flush(SVG);
    fixture.detectChanges();

    expect(svgExists).toHaveBeenCalledWith(true);
    expect(component.isLoading).toBeFalse();
    expect(host().querySelector(".animate-spin")).toBeNull();
    expect(host().querySelector(".lstopo-inline-svg svg")).not.toBeNull();
  });

  it("reports a missing SVG in the browser", () => {
    setup("browser");

    httpMock
      .expectOne(SVG_URL)
      .flush("", { status: 404, statusText: "Not Found" });
    fixture.detectChanges();

    expect(svgExists).toHaveBeenCalledWith(false);
    expect(component.isLoading).toBeFalse();
    expect(host().querySelector(".lstopo-inline-svg")).toBeNull();
  });
});
