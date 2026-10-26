import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LegalDocuments } from "./legal-documents";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("LegalDocuments", () => {
  let component: LegalDocuments;
  let fixture: ComponentFixture<LegalDocuments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalDocuments],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(LegalDocuments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
