import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ServerEmbedDialogComponent } from "./server-embed-dialog.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("ServerEmbedDialogComponent", () => {
  let component: ServerEmbedDialogComponent;
  let fixture: ComponentFixture<ServerEmbedDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerEmbedDialogComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerEmbedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
