import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EmbedDialog } from "./embed-dialog";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("EmbedDialog", () => {
  let component: EmbedDialog;
  let fixture: ComponentFixture<EmbedDialog>;

  const field = (id: string): HTMLInputElement =>
    fixture.nativeElement.querySelector(`#${id}`);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmbedDialog],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(EmbedDialog);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("idPrefix", "test_embed");
    fixture.componentRef.setInput("captureEventPrefix", "test embed");
    fixture.componentRef.setInput("charts", [
      { id: "metadata", name: "Server Metadata" },
      { id: "lstopo", name: "CPU and System Topology" },
    ]);
    fixture.componentRef.setInput(
      "srcFor",
      (chartId: string) => `about:blank#${chartId}`,
    );
    fixture.componentRef.setInput("minHeight", 400);
    fixture.componentRef.setInput("defaultHeight", 510);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("shows no snippet or preview until a chart is picked", () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(component.selectedChartName()).toBe("Select a chart");
    expect(element.querySelector("iframe")).toBeNull();
    expect(element.querySelector("pre")).toBeNull();
  });

  it("builds the preview and snippet from the picked chart", () => {
    component.chartId.set("lstopo");
    fixture.detectChanges();

    const iframe: HTMLIFrameElement =
      fixture.nativeElement.querySelector("iframe");
    expect(component.selectedChartName()).toBe("CPU and System Topology");
    expect(iframe.getAttribute("src")).toBe("about:blank#lstopo");
    expect(iframe.title).toBe("CPU and System Topology");
    expect(component.snippet()).toContain('src="about:blank#lstopo"');
    expect(component.snippet()).toContain('title="CPU and System Topology"');
  });

  it("clamps height and width on commit", () => {
    component.chartId.set("metadata");
    fixture.detectChanges();

    const height = field("test_embed_height");
    height.value = "50";
    height.dispatchEvent(new Event("blur"));
    const width = field("test_embed_width");
    width.value = "250";
    width.dispatchEvent(new Event("blur"));

    expect(component.height()).toBe(400);
    expect(component.width()).toBe(100);
  });

  it("steps the width with the plus and minus buttons within limits", () => {
    const button = (label: string): HTMLButtonElement =>
      fixture.nativeElement.querySelector(`button[aria-label="${label}"]`);

    expect(button("Increase iframe width").disabled).toBe(true);

    button("Decrease iframe width").click();
    fixture.detectChanges();
    expect(component.width()).toBe(95);
    expect(button("Increase iframe width").disabled).toBe(false);

    button("Increase iframe width").click();
    fixture.detectChanges();
    expect(component.width()).toBe(100);
    expect(button("Increase iframe width").disabled).toBe(true);
  });

  it("only writes pixel heights and percent widths into the snippet", () => {
    component.chartId.set("metadata");
    component.height.set(650);
    component.width.set(80);
    fixture.detectChanges();

    const iframe: HTMLIFrameElement =
      fixture.nativeElement.querySelector("iframe");
    expect(component.snippet()).toContain(
      "height: 650px; width: 80%; border: 1px solid #34d399; border-radius: 8px; min-height: 400px",
    );
    expect(iframe.style.height).toBe("650px");
    expect(iframe.style.width).toBe("80%");
  });

  it("resets height and width when the preview size changes without an aspect ratio", () => {
    component.chartId.set("metadata");
    component.height.set(650);
    component.width.set(80);

    component.selectPreviewSize(component.previewSizes[0]);

    expect(component.previewSize()).toBe(component.previewSizes[0]);
    expect(component.height()).toBe(510);
    expect(component.width()).toBe(100);
  });

  it("fits the height to the preview width when an aspect ratio is set", () => {
    fixture.componentRef.setInput("aspectRatio", 0.5);
    component.chartId.set("metadata");
    fixture.detectChanges();
    TestBed.tick();

    const iframe: HTMLIFrameElement =
      fixture.nativeElement.querySelector("iframe");
    expect(component.height()).toBe(
      Math.max(400, Math.round(iframe.offsetWidth * 0.5)),
    );
  });

  it("refits the height when the current preview size is picked again", () => {
    fixture.componentRef.setInput("aspectRatio", 0.5);
    component.chartId.set("metadata");
    fixture.detectChanges();
    TestBed.tick();

    component.height.set(9999);
    component.selectPreviewSize(component.previewSize());
    TestBed.tick();

    const iframe: HTMLIFrameElement =
      fixture.nativeElement.querySelector("iframe");
    expect(component.height()).toBe(
      Math.max(400, Math.round(iframe.offsetWidth * 0.5)),
    );
  });
});
