import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerCompareChartsComponent } from './server-compare-charts.component';

describe('ServerCompareChartsComponent', () => {
  let component: ServerCompareChartsComponent;
  let fixture: ComponentFixture<ServerCompareChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerCompareChartsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServerCompareChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
