import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import { FEATURE_REGISTER_HINT } from "../../collections/collections.utils";
import { ShareLink } from "../../services/share-link";
import { UiTooltip } from "../../services/ui-tooltip";
import { PageHeader } from "./page-header";

describe("PageHeader", () => {
  let fixture: ComponentFixture<PageHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeader],
      providers: [
        ...sharedTestingProviders,
        {
          provide: UiTooltip,
          useValue: {
            show: jasmine.createSpy("show"),
            hide: jasmine.createSpy("hide"),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeader);
    fixture.componentRef.setInput("icon", "server");
    fixture.componentRef.setInput("title", "Servers");
    fixture.componentRef.setInput("showBookmark", true);
    fixture.componentRef.setInput("bookmarkGuestLocked", true);
    fixture.detectChanges();
  });

  it("renders locked bookmark state for guests", () => {
    const button = fixture.debugElement.query(
      By.css(".page-header__bookmark--locked"),
    );
    expect(button).toBeTruthy();
    expect(button.attributes["aria-label"]).toBe(FEATURE_REGISTER_HINT);
    expect(fixture.nativeElement.textContent).toContain(FEATURE_REGISTER_HINT);
  });

  it("keeps the locked bookmark clickable and emits bookmarkClick", () => {
    const emitted: MouseEvent[] = [];
    fixture.componentInstance.bookmarkClick.subscribe((event) => {
      emitted.push(event);
    });
    const button = fixture.debugElement.query(
      By.css("button.page-header__bookmark"),
    );

    expect(button.nativeElement.disabled).toBeFalse();
    button.triggerEventHandler("click", new MouseEvent("click"));

    expect(emitted.length).toBe(1);
  });

  it("copies the link and swaps the share icon when copyLink is set", async () => {
    const copy = spyOn(
      TestBed.inject(ShareLink),
      "copyCurrentUrl",
    ).and.resolveTo(true);
    fixture.componentRef.setInput("showShare", true);
    fixture.componentRef.setInput("copyLink", true);
    fixture.detectChanges();

    const share = fixture.debugElement
      .queryAll(By.css("sc-button"))
      .find((button) => button.componentInstance.label() === "Share");
    share?.triggerEventHandler("buttonClick", new MouseEvent("click"));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(copy).toHaveBeenCalled();
    expect(share?.componentInstance.icon()).toBe("check");
  });
});
