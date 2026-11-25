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
    const showSpy = spyOn(uiTooltip, "show");
    const fits = { scrollWidth: 100, clientWidth: 100 } as Element;
    const truncated = { scrollWidth: 200, clientWidth: 100 } as Element;

    fixture.componentInstance.showIfTruncated(fits);
    expect(showSpy).not.toHaveBeenCalled();

    fixture.componentInstance.showIfTruncated(truncated);
    expect(showSpy).toHaveBeenCalledTimes(1);
  });
});
