import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AboutSpareCoresComponent } from "./spare-cores.component";

describe("AboutSpareCoresComponent", () => {
  let component: AboutSpareCoresComponent;
  let fixture: ComponentFixture<AboutSpareCoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutSpareCoresComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutSpareCoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
