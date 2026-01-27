import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ThemeTextComponent } from "./theme-text.component";

describe("ThemeTextComponent", () => {
  let component: ThemeTextComponent;
  let fixture: ComponentFixture<ThemeTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeTextComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
