import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LegalDocumentsComponent } from "./legal-documents.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("LegalDocumentsComponent", () => {
  let component: LegalDocumentsComponent;
  let fixture: ComponentFixture<LegalDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalDocumentsComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(LegalDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
