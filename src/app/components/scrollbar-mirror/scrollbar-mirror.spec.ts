import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ScrollbarMirror } from "./scrollbar-mirror";
import { INITIAL_SCROLLBAR_MIRROR_STATE } from "../../pages/shared/compare-table/scrollbar-mirror.controller";

describe("ScrollbarMirror", () => {
  let fixture: ComponentFixture<ScrollbarMirror>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollbarMirror],
    }).compileComponents();

    fixture = TestBed.createComponent(ScrollbarMirror);
    fixture.componentRef.setInput("state", {
      ...INITIAL_SCROLLBAR_MIRROR_STATE,
    });
    fixture.detectChanges();
  });

  it("renders nothing without a position", () => {
    expect(fixture.componentInstance.element()).toBeUndefined();
  });
});
