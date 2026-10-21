import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { CollectionsUiService } from "../../../collections/collections-ui.service";
import { FEATURE_REGISTER_HINT } from "../../../collections/collections.utils";
import { UiTooltipService } from "../../../services/ui-tooltip.service";
import { BookmarkButton } from "./bookmark-button";

describe("BookmarkButton", () => {
  let fixture: ComponentFixture<BookmarkButton>;
  let promptRegisterForFeature: jasmine.Spy;
  let toggleFavorite: jasmine.Spy;
  let isAuthenticated: ReturnType<typeof signal<boolean>>;

  beforeEach(async () => {
    isAuthenticated = signal(false);
    promptRegisterForFeature = jasmine.createSpy("promptRegisterForFeature");
    toggleFavorite = jasmine.createSpy("toggleFavorite");

    await TestBed.configureTestingModule({
      imports: [BookmarkButton],
      providers: [
        {
          provide: CollectionsUiService,
          useValue: {
            isAuthenticated: () => isAuthenticated(),
            isFavorite: () => false,
            isFavoriteLoading: () => false,
            promptRegisterForFeature,
            toggleFavorite,
          },
        },
        {
          provide: UiTooltipService,
          useValue: {
            show: jasmine.createSpy("show"),
            hide: jasmine.createSpy("hide"),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookmarkButton);
    fixture.componentRef.setInput("kind", "server");
    fixture.componentRef.setInput("vendorId", "aws");
    fixture.componentRef.setInput("entityId", "t3.nano");
    fixture.detectChanges();
  });

  it("prompts registration with the favorite payload for guests", () => {
    const button = fixture.debugElement.query(By.css("button"));
    button.triggerEventHandler("click", {
      preventDefault: () => undefined,
      stopPropagation: () => undefined,
    });

    expect(promptRegisterForFeature).toHaveBeenCalledOnceWith({
      type: "favorite",
      kind: "server",
      vendorId: "aws",
      entityId: "t3.nano",
    });
    expect(toggleFavorite).not.toHaveBeenCalled();
  });

  it("toggles the favorite when authenticated", () => {
    isAuthenticated.set(true);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css("button"));
    button.triggerEventHandler("click", {
      preventDefault: () => undefined,
      stopPropagation: () => undefined,
    });

    expect(toggleFavorite).toHaveBeenCalledOnceWith("server", "aws", "t3.nano");
    expect(promptRegisterForFeature).not.toHaveBeenCalled();
  });

  it("uses the guest register hint for tooltip and ARIA", () => {
    const button = fixture.debugElement.query(By.css("button"));
    expect(button.attributes["aria-label"]).toBe(FEATURE_REGISTER_HINT);
    expect(fixture.nativeElement.textContent).toContain(FEATURE_REGISTER_HINT);
  });
});
