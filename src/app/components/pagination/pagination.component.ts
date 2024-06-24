import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {

  @Input() baseQueryParams: any;
  @Input() currentPage!: number;
  @Input() totalPages!: number;
  @Input() baseURL!: string;

  getQueryObjectForPage(pageTarget: number) {
    const page = Math.max(pageTarget, 1);
    const paramObject = JSON.parse(JSON.stringify(this.baseQueryParams));

    paramObject.page = page;

    return paramObject;
  }

  possiblePages() {
    // get numbers in array from min(page-2, 1) to page+2
    const min = Math.max(this.currentPage - 1, 1);
    const max = Math.min(this.currentPage + 1, this.totalPages);
    return Array.from({length: max - min + 1}, (_, i) => i + min);
  }

}
