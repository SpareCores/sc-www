import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type BreadcrumbSegment = {
  name: string;
  url?: string;
  queryParams?: { [key: string]: string | number | boolean };
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.scss'
})
export class BreadcrumbsComponent {

  @Input() segments: BreadcrumbSegment[] = [];

}
