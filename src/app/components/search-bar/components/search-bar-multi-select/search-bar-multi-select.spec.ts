import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SearchBarMultiSelect } from "./search-bar-multi-select";

describe("SearchBarMultiSelect", () => {
  let component: SearchBarMultiSelect;
  let fixture: ComponentFixture<SearchBarMultiSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarMultiSelect],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarMultiSelect);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("options", [
      "avx",
      "avx2",
      "sse4_2",
      "ssse3",
    ]);
    fixture.componentRef.setInput("selected", []);
    fixture.detectChanges();
  });

  it("filters options with substring includes match", () => {
    component.onSearchInput("se");
    expect(component.filteredOptions()).toEqual(["sse4_2", "ssse3"]);
  });

  it("matches options when query is not a prefix", () => {
    component.onSearchInput("x2");
    expect(component.filteredOptions()).toEqual(["avx2"]);
  });

  it("excludes already selected options from results", () => {
    fixture.componentRef.setInput("selected", ["sse4_2"]);
    fixture.detectChanges();
    component.onSearchInput("se");
    expect(component.filteredOptions()).toEqual(["ssse3"]);
  });
});
