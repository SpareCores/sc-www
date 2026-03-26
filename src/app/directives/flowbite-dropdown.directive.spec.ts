import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DropdownManagerService } from "../services/dropdown-manager.service";
import { FlowbiteDropdownDirective } from "./flowbite-dropdown.directive";

@Component({
  standalone: true,
  template: `
    <button
      id="trigger"
      [appFlowbiteDropdown]="targetId"
      [dropdownEnabled]="enabled"
    >
      Open dropdown
    </button>
    <div id="target"></div>
  `,
  imports: [FlowbiteDropdownDirective],
})
class HostComponent {
  targetId = "target";
  enabled = true;
}

describe("FlowbiteDropdownDirective", () => {
  let fixture: ComponentFixture<HostComponent>;
  let initDropdownSpy: jasmine.Spy;
  let dropdownSpy: { hide: jasmine.Spy };

  beforeEach(async () => {
    dropdownSpy = {
      hide: jasmine.createSpy("hide"),
    };
    initDropdownSpy = jasmine
      .createSpy()
      .and.returnValue(Promise.resolve(dropdownSpy));

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        {
          provide: DropdownManagerService,
          useValue: { initDropdown: initDropdownSpy },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
  });

  it("initializes the dropdown for enabled triggers", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(initDropdownSpy.calls.count()).toBe(1);
    expect(initDropdownSpy.calls.mostRecent().args).toEqual([
      "trigger",
      "target",
    ]);
  });

  it("hides the dropdown when the directive becomes disabled", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.enabled = false;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dropdownSpy.hide.calls.count()).toBe(1);
  });
});
