import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import { FEATURE_REGISTER_HINT } from "../../collections/collections.utils";
import { UiTooltip } from "../../services/ui-tooltip";
import { PageBookmark } from "./page-bookmark";

describe("PageBookmark", () => {
  let fixture: ComponentFixture<PageBookmark>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageBookmark],
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

    fixture = TestBed.createComponent(PageBookmark);
    fixture.componentRef.setInput("guestLocked", true);
    fixture.detectChanges();
  });

  it("labels the locked bookmark with the register hint", () => {
    const button = fixture.debugElement.query(
      By.css(".page-bookmark__button--locked"),
    );
    expect(button.attributes["aria-label"]).toBe(FEATURE_REGISTER_HINT);
  });

  it("emits bookmarkClick when clicked", () => {
    const emitted: MouseEvent[] = [];
    fixture.componentInstance.bookmarkClick.subscribe((event) => {
      emitted.push(event);
    });

    fixture.debugElement
      .query(By.css("button.page-bookmark__button"))
      .triggerEventHandler("click", new MouseEvent("click"));

    expect(emitted.length).toBe(1);
  });
});
