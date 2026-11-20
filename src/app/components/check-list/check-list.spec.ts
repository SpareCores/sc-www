import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CheckList } from "./check-list";
import { CheckListItem } from "./check-list-item";

@Component({
  imports: [CheckList, CheckListItem],
  template: `
    <sc-check-list>
      <sc-check-list-item>First</sc-check-list-item>
      <sc-check-list-item>Second</sc-check-list-item>
    </sc-check-list>
  `,
})
class CheckListHost {}

describe("CheckList", () => {
  let fixture: ComponentFixture<CheckListHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckListHost],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckListHost);
    fixture.detectChanges();
  });

  it("should create a list with its items", () => {
    const list = fixture.nativeElement.querySelector("sc-check-list");
    expect(list.getAttribute("role")).toBe("list");
    const items = list.querySelectorAll(":scope > [role='listitem']");
    expect(items.length).toBe(2);
  });
});
