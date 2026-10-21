import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FundingInformation } from "./funding-information";
import { SeoHandlerService } from "../../services/seo-handler.service";

describe("FundingInformation", () => {
  let component: FundingInformation;
  let fixture: ComponentFixture<FundingInformation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FundingInformation],
      providers: [
        {
          provide: SeoHandlerService,
          useValue: { updateTitleAndMetaTags: jasmine.createSpy() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FundingInformation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
