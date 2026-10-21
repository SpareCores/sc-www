import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FundingInformation } from "./funding-information";
import { SeoHandler } from "../../services/seo-handler";

describe("FundingInformation", () => {
  let component: FundingInformation;
  let fixture: ComponentFixture<FundingInformation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FundingInformation],
      providers: [
        {
          provide: SeoHandler,
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
