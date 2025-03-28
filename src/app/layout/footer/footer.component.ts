import { Component } from '@angular/core';
import { ThemeTextComponent } from '../../components/theme-text/theme-text.component';
import { LucideAngularModule } from 'lucide-angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [ThemeTextComponent, LucideAngularModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
