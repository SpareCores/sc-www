import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CheckListItem } from "./check-list-item";

@Component({
  imports: [CheckListItem],
  template: `<sc-check-list-item><b>8</b> vendors</sc-check-list-item>`,
})
class CheckListItemHost {}

describe("CheckListItem", () => {
  let fixture: ComponentFixture<CheckListItemHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckListItemHost],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckListItemHost);
    fixture.detectChanges();
  });

  it("should render the projected content and a hidden check icon", () => {
    const item = fixture.nativeElement.querySelector("sc-check-list-item");
    expect(item.getAttribute("role")).toBe("listitem");
    expect(item.querySelector("b").textContent).toBe("8");
    expect(item.textContent).toContain("vendors");
    const icon = item.querySelector("svg");
    expect(icon.getAttribute("aria-hidden")).toBe("true");
  });
});
