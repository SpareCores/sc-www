import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutNavigatorComponent } from './navigator.component';

describe('AboutNavigatorComponent', () => {
  let component: AboutNavigatorComponent;
  let fixture: ComponentFixture<AboutNavigatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutNavigatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutNavigatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
