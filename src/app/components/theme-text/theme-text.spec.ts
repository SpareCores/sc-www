import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ThemeText } from "./theme-text";

describe("ThemeText", () => {
  let component: ThemeText;
  let fixture: ComponentFixture<ThemeText>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeText],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeText);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("text", "spare_cores");
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain("spare_cores");
  });

  it("should apply the size classes", () => {
    fixture.componentRef.setInput("size", "lg");
    fixture.detectChanges();
    const text: HTMLElement = fixture.nativeElement.querySelector(".logo_text");
    expect(text.classList).toContain("logo_text");
    expect(text.classList).toContain("sm:text-6xl");
    expect(text.classList).not.toContain("text-xl");
  });
});
