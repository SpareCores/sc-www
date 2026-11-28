import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TruncatedTitle } from "./truncated-title";
import { UiTooltip } from "../../services/ui-tooltip";

describe("TruncatedTitle", () => {
  let fixture: ComponentFixture<TruncatedTitle>;
  let uiTooltip: UiTooltip;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TruncatedTitle],
    }).compileComponents();

    uiTooltip = TestBed.inject(UiTooltip);
    fixture = TestBed.createComponent(TruncatedTitle);
    fixture.componentRef.setInput("text", "Static Web Server");
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("shows the full title only when the text is truncated", () => {
    const showSpy = spyOn(uiTooltip, "showText");
    const fits = { scrollWidth: 100, clientWidth: 100 } as Element;
    const truncated = { scrollWidth: 200, clientWidth: 100 } as Element;

    fixture.componentInstance.showIfTruncated(fits);
    expect(showSpy).not.toHaveBeenCalled();

    fixture.componentInstance.showIfTruncated(truncated);
    expect(showSpy).toHaveBeenCalledOnceWith(truncated, "Static Web Server");
  });

  it("is focusable only while the text is truncated", async () => {
    const host: HTMLElement = fixture.nativeElement;
    const label: HTMLElement = host.querySelector("span")!;
    host.style.display = "block";
    label.style.overflow = "hidden";
    label.style.whiteSpace = "nowrap";

    host.style.width = "1000px";
    await settle();
    expect(label.hasAttribute("tabindex")).toBeFalse();
    expect(label.hasAttribute("role")).toBeFalse();

    host.style.width = "20px";
    await settle();
    expect(label.getAttribute("tabindex")).toBe("0");
    expect(label.getAttribute("role")).toBe("button");
  });

  async function settle(): Promise<void> {
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
    fixture.detectChanges();
  }
});
