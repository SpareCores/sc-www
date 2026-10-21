import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ServerEmbedDialog } from "./server-embed-dialog";
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
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
