import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EmbedWidgetButton } from "./embed-widget-button";
import { ModalDialog } from "../../services/modal-dialog";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("EmbedWidgetButton", () => {
  let component: EmbedWidgetButton;
  let fixture: ComponentFixture<EmbedWidgetButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmbedWidgetButton],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(EmbedWidgetButton);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("target", {
      kind: "details",
      resource: "database",
      vendor: "aws",
      id: "db.m5.large",
    });
    fixture.componentRef.setInput("widgets", [
      { id: "metadata", name: "Database Metadata" },
    ]);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("emits opening and opens the embed modal once", () => {
    const openSpy = spyOn(
      TestBed.inject(ModalDialog),
      "open",
    ).and.callThrough();
    const openingSpy = jasmine.createSpy("opening");
    component.opening.subscribe(openingSpy);

    component.open();
    component.open();

    expect(openingSpy).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenCalledTimes(1);
  });
});
