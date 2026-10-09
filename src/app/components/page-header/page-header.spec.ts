import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import { FEATURE_REGISTER_HINT } from "../../collections/collections.utils";
import { UiTooltipService } from "../../services/ui-tooltip.service";
import { PageHeader } from "./page-header";

describe("PageHeader", () => {
  let fixture: ComponentFixture<PageHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeader],
      providers: [
        ...sharedTestingProviders,
        {
          provide: UiTooltipService,
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
});
