import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { Pagination } from "../pagination/pagination";
import { SelectDropdown } from "../select-dropdown/select-dropdown";

@Component({
  selector: "sc-table-footer",
  imports: [Pagination, SelectDropdown],
  templateUrl: "./table-footer.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "mt-4 flex flex-wrap items-center justify-between gap-2 sm:gap-4",
  },
})
export class TableFooter {
  limit = input.required<number>();
  pageLimits = input.required<readonly number[]>();
  page = input.required<number>();
  totalPages = input.required<number>();
  baseURL = input.required<string>();
  baseQueryParams = input.required<Record<string, unknown>>();
  pageSizeEvent = input<string | null>(null);

  limitChange = output<number>();
}
