import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalDocumentsComponent } from './legal-documents.component';

describe('LegalDocumentsComponent', () => {
  let component: LegalDocumentsComponent;
  let fixture: ComponentFixture<LegalDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalDocumentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LegalDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
