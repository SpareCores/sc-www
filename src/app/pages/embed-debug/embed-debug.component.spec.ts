import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbedDebugComponent } from './embed-debug.component';

describe('EmbedDebugComponent', () => {
  let component: EmbedDebugComponent;
  let fixture: ComponentFixture<EmbedDebugComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmbedDebugComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmbedDebugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
