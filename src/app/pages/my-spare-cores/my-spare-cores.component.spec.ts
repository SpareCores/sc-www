import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySpareCoresComponent } from './my-spare-cores.component';

describe('MySpareCoresComponent', () => {
  let component: MySpareCoresComponent;
  let fixture: ComponentFixture<MySpareCoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MySpareCoresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MySpareCoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
