import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideLucideIcons } from "@lucide/angular";
import { provideRouter } from "@angular/router";
import { lucideIcons } from "../../lucide-icons";
import { TableFooter } from "./table-footer";

@Component({
  template: `
    <sc-table-footer
      baseURL="/servers"
      [limit]="limit()"
      [pageLimits]="[10, 25, 50]"
      [page]="2"
      [totalPages]="5"
      [baseQueryParams]="{}"
      (limitChange)="limit.set($event)"
    ></sc-table-footer>
  `,
  imports: [TableFooter],
})
class HostComponent {
  limit = signal(25);
}

describe("TableFooter", () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideRouter([]), provideLucideIcons(...lucideIcons)],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(
      fixture.nativeElement.querySelector("#pagesize_button"),
    ).toBeTruthy();
    expect(fixture.nativeElement.querySelector("sc-pagination")).toBeTruthy();
  });

  it("emits the selected page size", () => {
    fixture.nativeElement.querySelector("#pagesize_button button").click();
    fixture.detectChanges();

    document
      .querySelectorAll<HTMLElement>(
        "#pagesize_options .sc-dropdown__option",
      )[2]
      .click();
    fixture.detectChanges();

    expect(fixture.componentInstance.limit()).toBe(50);
  });
});
