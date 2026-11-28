import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideLucideIcons } from "@lucide/angular";
import { lucideIcons } from "../../lucide-icons";
import { SelectDropdown } from "./select-dropdown";

@Component({
  template: `
    <sc-select-dropdown
      buttonId="size_button"
      panelId="size_options"
      icon="chevron-down"
      [label]="'' + selected()"
      [options]="options"
      [selected]="selected()"
      (selectedChange)="selected.set($event)"
    ></sc-select-dropdown>
  `,
  imports: [SelectDropdown],
})
class HostComponent {
  options = [10, 25, 50];
  selected = signal(10);
}

describe("SelectDropdown", () => {
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
    return fixture.nativeElement.querySelector("#size_button button");
  }

  it("should create", () => {
    expect(trigger()).toBeTruthy();
  });

  it("emits the clicked option and closes the panel", () => {
    trigger().click();
    fixture.detectChanges();

    const options = document.querySelectorAll<HTMLElement>(
      "#size_options .sc-dropdown__option",
    );
    expect(options.length).toBe(3);

    options[2].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selected()).toBe(50);
    expect(document.querySelector("#size_options")).toBeNull();
  });
});
