import { Component, Input } from "@angular/core";
import { RouterLink } from "@angular/router";

export type BreadcrumbSegment = {
  name: string;
  url?: string;
  queryParams?: { [key: string]: string | number | boolean };
};

@Component({
  selector: "sc-breadcrumbs",
  imports: [RouterLink],
  templateUrl: "./breadcrumbs.html",
  styleUrl: "./breadcrumbs.scss",
})
export class Breadcrumbs {
  @Input() segments: BreadcrumbSegment[] = [];
}
