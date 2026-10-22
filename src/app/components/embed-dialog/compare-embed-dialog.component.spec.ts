import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CompareEmbedDialogComponent } from "./compare-embed-dialog.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("CompareEmbedDialogComponent", () => {
  let component: CompareEmbedDialogComponent;
  let fixture: ComponentFixture<CompareEmbedDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareEmbedDialogComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(CompareEmbedDialogComponent);
    component = fixture.componentInstance;
    component.instances = "server-a,server-b";
    component.chartname = "score";
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
