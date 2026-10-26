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
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
