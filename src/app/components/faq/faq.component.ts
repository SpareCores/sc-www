import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

export type FAQQuestion = {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {

  @Input() item!: string;
  @Input() FAQQuestions!: any[];
  @Input() activeFAQ: number = -1;

  @Output() activeFAQChanged: EventEmitter<number> = new EventEmitter<number>();


  toggleFAQ(i: number) {
    if(this.activeFAQ === i) {
      this.activeFAQ = -1;
    } else {
      this.activeFAQ = i;
    }
    this.activeFAQChanged.emit(this.activeFAQ);
  }

  FAQIcon(i: number) {
    return this.activeFAQ === i ? 'chevron-up' : 'chevron-down';
  }
}
