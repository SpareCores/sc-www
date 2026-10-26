import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DesignPageCard } from "./design-page-card";

describe("DesignPageCard", () => {
  let component: DesignPageCard;
  let fixture: ComponentFixture<DesignPageCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignPageCard],
    }).compileComponents();

    fixture = TestBed.createComponent(DesignPageCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
