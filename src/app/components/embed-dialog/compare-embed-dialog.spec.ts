import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { CompareEmbedDialog } from "./compare-embed-dialog";
import { EmbedDialog } from "./embed-dialog";
import { SeoHandler } from "../../services/seo-handler";
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
    fixture.componentRef.setInput("instances", "server-a,server-b");
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("builds the compare embed url for a chart", () => {
    const baseURL = TestBed.inject(SeoHandler).getBaseURL();

    expect(component.srcFor()("score")).toBe(
      `${baseURL}/embed/compare/score?instances=server-a,server-b`,
    );
  });

  it("passes the compare size limits to the shared dialog", () => {
    const dialog: EmbedDialog = fixture.debugElement.query(
      By.directive(EmbedDialog),
    ).componentInstance;

    expect(dialog.minHeight()).toBe(600);
    expect(dialog.defaultHeight()).toBe(710);
    expect(dialog.aspectRatio()).toBeNull();
  });
});
