import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, BreadcrumbsComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  contactForm!: FormGroup;

  breadcrumbs: BreadcrumbSegment[] = [
    {
      name: 'Home',
      url: '/'
    },
    {
      name: 'Contact Us',
      url: '/contact'
    }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      affiliation: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      message: ['', [Validators.required]],
      privacyPolicy: [false, Validators.requiredTrue]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      console.log('Form submitted:', this.contactForm.value);
      // TODO: Implement actual form submission logic
    }
  }
}
