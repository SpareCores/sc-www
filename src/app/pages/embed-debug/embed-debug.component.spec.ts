import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EmbedDebugComponent } from "./embed-debug.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("EmbedDebugComponent", () => {
  let component: EmbedDebugComponent;
  let fixture: ComponentFixture<EmbedDebugComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmbedDebugComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(EmbedDebugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
