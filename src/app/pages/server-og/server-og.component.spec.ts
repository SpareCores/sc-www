import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerOGComponent } from './server-og.component';

describe('ServerOGComponent', () => {
  let component: ServerOGComponent;
  let fixture: ComponentFixture<ServerOGComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerOGComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServerOGComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
