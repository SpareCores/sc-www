import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { CollectionsUi } from "../../collections/collections-ui";
import { FEATURE_REGISTER_HINT } from "../../collections/collections.utils";
import { UiTooltip } from "../../services/ui-tooltip";
import { BookmarkButton } from "./bookmark-button";

describe("BookmarkButton", () => {
  let fixture: ComponentFixture<BookmarkButton>;
  let addFavoriteOrPromptRegister: jasmine.Spy;
  let toggleFavorite: jasmine.Spy;
  let isAuthenticated: ReturnType<typeof signal<boolean>>;

  beforeEach(async () => {
    isAuthenticated = signal(false);
    addFavoriteOrPromptRegister = jasmine
      .createSpy("addFavoriteOrPromptRegister")
      .and.resolveTo();
    toggleFavorite = jasmine.createSpy("toggleFavorite");

    await TestBed.configureTestingModule({
      imports: [BookmarkButton],
      providers: [
        {
          provide: CollectionsUi,
          useValue: {
            isAuthenticated: () => isAuthenticated(),
            isFavorite: () => false,
            isFavoriteLoading: () => false,
            addFavoriteOrPromptRegister,
            toggleFavorite,
          },
        },
        {
          provide: UiTooltip,
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

  it("defers guest clicks until auth resolves", () => {
    const button = fixture.debugElement.query(By.css("button"));
    button.triggerEventHandler("click", {
      preventDefault: () => {
        throw new Error("`preventDefault` called during event replay.");
      },
      stopPropagation: () => undefined,
    });

    expect(addFavoriteOrPromptRegister).toHaveBeenCalledOnceWith(
      "server",
      "aws",
      "t3.nano",
    );
    expect(toggleFavorite).not.toHaveBeenCalled();
  });

  it("toggles the favorite when authenticated", () => {
    isAuthenticated.set(true);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css("button"));
    button.triggerEventHandler("click", {
      preventDefault: () => {
        throw new Error("`preventDefault` called during event replay.");
      },
      stopPropagation: () => undefined,
    });

    expect(toggleFavorite).toHaveBeenCalledOnceWith("server", "aws", "t3.nano");
    expect(addFavoriteOrPromptRegister).not.toHaveBeenCalled();
  });

  it("uses the guest register hint for tooltip and ARIA", () => {
    const button = fixture.debugElement.query(By.css("button"));
    expect(button.attributes["aria-label"]).toBe(FEATURE_REGISTER_HINT);
    expect(fixture.nativeElement.textContent).toContain(FEATURE_REGISTER_HINT);
  });
});
