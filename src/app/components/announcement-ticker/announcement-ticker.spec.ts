import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AnnouncementTicker } from "./announcement-ticker";
import {
  DEFAULT_ANNOUNCEMENT_TICKER_DISMISS_LABEL,
  DEFAULT_ANNOUNCEMENT_TICKER_TONE,
  HOME_HEADER_ANNOUNCEMENT,
  type AnnouncementTickerMessage,
} from "./announcement-ticker.constants";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("AnnouncementTicker", () => {
  let component: AnnouncementTicker;
  let fixture: ComponentFixture<AnnouncementTicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnouncementTicker],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnouncementTicker);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("message", HOME_HEADER_ANNOUNCEMENT);
    fixture.detectChanges();
  });

  it("renders the supplied announcement content twice for a seamless ticker", () => {
    const host = fixture.nativeElement as HTMLElement;
    const copies = host.querySelectorAll(".announcement-ticker__content");

    expect(component).toBeTruthy();
    expect(copies.length).toBe(2);
    expect(host.textContent).toContain(
      "Looking for better cloud server alternatives?",
    );
    expect(host.textContent).toContain("Advisor");
    expect(host.textContent).toContain("Try it now");
  });

  it("applies the configured accent palette for the message tone", () => {
    const newsMessage: AnnouncementTickerMessage = {
      ...HOME_HEADER_ANNOUNCEMENT,
      tone: "news",
    };

    fixture.componentRef.setInput("message", newsMessage);
    fixture.detectChanges();

    const ticker = fixture.nativeElement.querySelector(
      ".announcement-ticker",
    ) as HTMLAnchorElement;

    expect(ticker.style.getPropertyValue("--announcement-accent").trim()).toBe(
      "#14B8A6",
    );
    expect(
      ticker.style.getPropertyValue("--announcement-background-start").trim(),
    ).toBe("#082F49");
  });

  it("uses the sky feature palette by default when no tone is provided", () => {
    const defaultMessage: AnnouncementTickerMessage = {
      ...HOME_HEADER_ANNOUNCEMENT,
      tone: undefined,
    };

    fixture.componentRef.setInput("message", defaultMessage);
    fixture.detectChanges();

    const ticker = fixture.nativeElement.querySelector(
      ".announcement-ticker",
    ) as HTMLAnchorElement;

    expect(DEFAULT_ANNOUNCEMENT_TICKER_TONE).toBe("feature");
    expect(ticker.style.getPropertyValue("--announcement-accent").trim()).toBe(
      "#34D399",
    );
    expect(
      ticker.style.getPropertyValue("--announcement-background-start").trim(),
    ).toBe("#082F49");
    expect(
      ticker.style.getPropertyValue("--announcement-background-end").trim(),
    ).toBe("#0C4A6E");
  });

  it("renders a close button and emits dismissal when configured as dismissible", () => {
    const dismissedSpy = jasmine.createSpy("dismissed");
    component.dismissed.subscribe(dismissedSpy);

    fixture.componentRef.setInput("dismissible", true);
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector(
      ".announcement-ticker__close",
    ) as HTMLButtonElement;

    expect(closeButton).not.toBeNull();
    expect(closeButton.getAttribute("aria-label")).toBe(
      DEFAULT_ANNOUNCEMENT_TICKER_DISMISS_LABEL,
    );

    closeButton.click();

    expect(dismissedSpy).toHaveBeenCalledTimes(1);
  });
});
