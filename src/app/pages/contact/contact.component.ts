import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import * as crypto from 'crypto-js';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, BreadcrumbsComponent, LoadingSpinnerComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  contactForm: FormGroup;
  powChallenge!: string;
  powSolution!: number;
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
  isLoading = false;
  isSubmitted = false;

  constructor(private fb: FormBuilder, private toastService: ToastService) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      affiliation: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      message: ['', Validators.required],
      privacyPolicy: [false, Validators.requiredTrue],
      powChallenge: [''],
      powSolution: ['']
    });
  }

   async fetchChallengeFromServer(): Promise<string> {
    try {
      const response = await fetch('/api/generate-pow-challenge');
      const data = await response.json();
      // don't care about the random challenge and timestamp, just the signature
      return data.signature;
    } catch (error) {
      this.toastService.show({ title: 'Failed to fetch PoW challenge. Please try again later!', type: 'error' })
      throw error;
    }
  }

  solvePoW(challenge: string, difficulty: number): void {
    let solution = 0;
    const target = '0'.repeat(difficulty);
    while (true) {
      const hash = crypto.SHA256(challenge + solution).toString();
      if (hash.startsWith(target)) {
        this.powSolution = solution;
        this.contactForm.patchValue({ powSolution: this.powSolution });
        break;
      }
      solution++;
    }
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isLoading = true;
      this.fetchChallengeFromServer().then(challenge => {
        this.powChallenge = challenge;
        this.contactForm.patchValue({ powChallenge: this.powChallenge });
        this.solvePoW(this.powChallenge, 4);

        // Handle form submission after solving PoW
        console.log('Form submitted', this.contactForm.value);
        this.isSubmitted = true;
        this.toastService.show({ title: 'Form submitted successfully!', type: 'success' });
      }).catch(() => {
        this.isLoading = false;
      });
    }
  }
}
