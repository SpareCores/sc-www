import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import { UiTooltip } from "../../services/ui-tooltip";
import { PageActions } from "./page-actions";

describe("PageActions", () => {
  let fixture: ComponentFixture<PageActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageActions],
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

    fixture = TestBed.createComponent(PageActions);
    fixture.detectChanges();
  });

  it("creates", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("emits bookmarkClick when the bookmark is clicked", () => {
    const emitted: MouseEvent[] = [];
    fixture.componentInstance.bookmarkClick.subscribe((event) => {
      emitted.push(event);
    });
    const button = fixture.debugElement.query(
      By.css("button.page-bookmark__button"),
    );

    button.triggerEventHandler("click", new MouseEvent("click"));

    expect(emitted.length).toBe(1);
  });
});
