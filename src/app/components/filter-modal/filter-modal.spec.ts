import { DialogRef } from "@angular/cdk/dialog";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import { SearchBar } from "../search-bar/search-bar";
import type { SearchBarParameter } from "../search-bar/types/search-bar.types";
import { FilterModal } from "./filter-modal";

describe("FilterModal", () => {
  let component: FilterModal;
  let fixture: ComponentFixture<FilterModal>;
  let close: jasmine.Spy;
  let searchParameters: SearchBarParameter[];

  beforeEach(async () => {
    close = jasmine.createSpy("close");
    searchParameters = [
      {
        name: "memory_min",
        modelValue: null,
        schema: { category_id: "memory", title: "Memory", type: "number" },
      },
    ];

    await TestBed.configureTestingModule({
      imports: [FilterModal],
      providers: [
        ...sharedTestingProviders,
        { provide: DialogRef, useValue: { id: "dialog-1", close } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("searchParameters", searchParameters);
    fixture.componentRef.setInput("filterCategories", [
      { category_id: "memory", name: "Memory", icon: "memory-stick" },
    ]);
    fixture.componentRef.setInput("query", { memory_min: "8" });
    fixture.detectChanges();
  });

  function button(event: string): HTMLButtonElement {
    return (fixture.nativeElement as HTMLElement).querySelector(
      `sc-button[data-ph-capture-attribute-sc-event="${event}"] button`,
    ) as HTMLButtonElement;
  }

  function searchBar(): SearchBar {
    return fixture.debugElement.query(By.directive(SearchBar))
      .componentInstance as SearchBar;
  }

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("opens the Search Prompt from the footer", () => {
    const host = fixture.nativeElement as HTMLElement;
    const promptButton = () =>
      host.querySelector<HTMLButtonElement>(
        '[modalFooter] sc-button[data-ph-capture-attribute-server-listing-search-prompt-action="open"] button',
      );
    const openSpy = spyOn(searchBar(), "openSearchPrompt");

    promptButton()?.click();

    expect(openSpy).toHaveBeenCalled();
    expect(host.querySelector(".search_bar_content .top")).toBeNull();

    fixture.componentRef.setInput("useTopSearchInput", true);
    fixture.detectChanges();

    expect(promptButton()).toBeNull();
  });

  it("reopens on the last selected category", () => {
    const categories = [
      { category_id: "memory", name: "Memory", icon: "memory-stick" },
      { category_id: "gpu", name: "GPU", icon: "gpu" },
    ];
    const open = () => {
      const modal = TestBed.createComponent(FilterModal);
      modal.componentRef.setInput("searchParameters", searchParameters);
      modal.componentRef.setInput("filterCategories", categories);
      modal.detectChanges();
      return modal;
    };
    const selectedTab = (modal: ComponentFixture<FilterModal>) =>
      (modal.nativeElement as HTMLElement)
        .querySelector('[role="tab"][aria-selected="true"]')
        ?.getAttribute("data-category-id");

    const first = open();
    (first.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[role="tab"][data-category-id="gpu"]')
      ?.click();

    expect(selectedTab(open())).toBe("gpu");
  });

  it("applies and closes when the Search Prompt is confirmed", () => {
    const emitSpy = spyOn(component.searchChanged, "emit");

    searchBar().modalResponse = { memory_min: 16 };
    searchBar().closeModal(true);

    expect(emitSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ memory_min: 16 }),
    );
    expect(close).toHaveBeenCalled();
  });

  it("uses the wide-lg modal size", () => {
    expect(
      (fixture.nativeElement as HTMLElement).querySelector(".modal--wide-lg"),
    ).not.toBeNull();
  });

  it("closes without emitting when Apply has no changes", () => {
    const searchChanged = spyOn(component.searchChanged, "emit");

    button("filter modal apply").click();

    expect(searchChanged).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledWith(true);
  });

  it("keeps Clear all as a draft until Apply", () => {
    const searchChanged = spyOn(component.searchChanged, "emit");
    const clearAll = spyOn(component.clearAll, "emit");

    expect(button("filter modal clear").disabled).toBeFalse();

    button("filter modal clear").click();
    fixture.detectChanges();

    expect(clearAll).toHaveBeenCalled();
    expect(searchChanged).not.toHaveBeenCalled();
    expect(button("filter modal clear").disabled).toBeTrue();

    button("filter modal apply").click();

    expect(searchChanged).toHaveBeenCalledWith({});
    expect(close).toHaveBeenCalled();
  });

  it("edits copies of the page's parameters", () => {
    searchBar().resetAll();

    expect(searchParameters[0].modelValue).toBeNull();
    expect(component.draftParameters()[0]).not.toBe(searchParameters[0]);
  });

  it("disables Apply with the reason when one is given", () => {
    fixture.componentRef.setInput(
      "applyDisabledReason",
      "Fill in the required fields first.",
    );
    fixture.detectChanges();

    expect(button("filter modal apply").disabled).toBeTrue();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      "Fill in the required fields first.",
    );
  });
});
