import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TalksComponent } from "./talks.component";

describe("TalksComponent", () => {
  let component: TalksComponent;
  let fixture: ComponentFixture<TalksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TalksComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TalksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
