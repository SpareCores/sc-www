import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { ServerEmbedDialog } from "./server-embed-dialog";
import { EmbedDialog } from "./embed-dialog";
import { SeoHandler } from "../../services/seo-handler";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("ServerEmbedDialog", () => {
  let component: ServerEmbedDialog;
  let fixture: ComponentFixture<ServerEmbedDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerEmbedDialog],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerEmbedDialog);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("vendor", "aws");
    fixture.componentRef.setInput("id", "m5.large");
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("builds the server embed url for a chart", () => {
    const baseURL = TestBed.inject(SeoHandler).getBaseURL();

    expect(component.srcFor()("metadata")).toBe(
      `${baseURL}/embed/server/aws/m5.large/metadata`,
    );
  });

  it("passes the server size limits to the shared dialog", () => {
    const dialog: EmbedDialog = fixture.debugElement.query(
      By.directive(EmbedDialog),
    ).componentInstance;

    expect(dialog.minHeight()).toBe(400);
    expect(dialog.defaultHeight()).toBe(510);
    expect(dialog.aspectRatio()).toBe(0.6);
  });
});
