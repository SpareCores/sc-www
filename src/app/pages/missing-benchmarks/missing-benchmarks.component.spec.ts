import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissingBenchmarksComponent } from './missing-benchmarks.component';

describe('MissingBenchmarksComponent', () => {
  let component: MissingBenchmarksComponent;
  let fixture: ComponentFixture<MissingBenchmarksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissingBenchmarksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MissingBenchmarksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
