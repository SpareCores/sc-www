import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FundingInformationComponent } from "./funding-information.component";

describe("FundingInformationComponent", () => {
  let component: FundingInformationComponent;
  let fixture: ComponentFixture<FundingInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FundingInformationComponent],
      providers: [
        {
          provide: SeoHandlerService,
          useValue: { updateTitleAndMetaTags: jasmine.createSpy() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FundingInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
