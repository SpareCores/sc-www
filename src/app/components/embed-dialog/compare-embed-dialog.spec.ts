import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CompareEmbedDialog } from "./compare-embed-dialog";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("CompareEmbedDialog", () => {
  let component: CompareEmbedDialog;
  let fixture: ComponentFixture<CompareEmbedDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareEmbedDialog],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(CompareEmbedDialog);
    component = fixture.componentInstance;
    component.instances = "server-a,server-b";
    component.chartname = "score";
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
