import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DesignPageCardComponent } from "./design-page-card.component";

describe("DesignPageCardComponent", () => {
  let component: DesignPageCardComponent;
  let fixture: ComponentFixture<DesignPageCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignPageCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DesignPageCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
