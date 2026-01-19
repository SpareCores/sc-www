import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FundingInformationComponent } from "./funding-information.component";

describe("FundingInformationComponent", () => {
  let component: FundingInformationComponent;
  let fixture: ComponentFixture<FundingInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FundingInformationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FundingInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).to.ok;
  });
});
