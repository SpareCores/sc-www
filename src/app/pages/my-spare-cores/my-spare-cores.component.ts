import { Component } from '@angular/core';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-spare-cores',
  standalone: true,
  imports: [BreadcrumbsComponent, CommonModule, FormsModule],
  templateUrl: './my-spare-cores.component.html',
  styleUrl: './my-spare-cores.component.scss'
})
export class MySpareCoresComponent {

  breadcrumbs: BreadcrumbSegment[] = [
    { name: 'Home', url: '/' },
    { name: 'My Spare Cores', url: '/dashboard' }
  ];

}
