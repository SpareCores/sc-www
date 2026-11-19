import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideLucideIcons } from "@lucide/angular";
import { TableColumn } from "../../tools/table-columns";
import { lucideIcons } from "../../lucide-icons";
import { ColumnPicker, ColumnVisibilityChange } from "./column-picker";

@Component({
  template: `
    <sc-column-picker
      [columns]="columns"
      (visibilityChange)="changes.push($event)"
    ></sc-column-picker>
  `,
  imports: [ColumnPicker],
})
class HostComponent {
  columns = [
    { name: "VENDOR", show: true },
    { name: "PRICE", show: false },
  ] as TableColumn[];
  changes: ColumnVisibilityChange[] = [];
}

describe("ColumnPicker", () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideLucideIcons(...lucideIcons)],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  function trigger(): HTMLElement {
    return fixture.nativeElement.querySelector("#column_button button");
  }

  it("should create", () => {
    expect(trigger()).toBeTruthy();
  });

  it("emits the toggled column without changing the input", () => {
    trigger().click();
    fixture.detectChanges();

    const checkboxes = document.querySelectorAll<HTMLInputElement>(
      "#column_options input[type=checkbox]",
    );
    expect(checkboxes.length).toBe(2);

    checkboxes[1].click();

    expect(fixture.componentInstance.changes).toEqual([
      { name: "PRICE", show: true },
    ]);
    expect(fixture.componentInstance.columns[1].show).toBe(false);
  });
});
