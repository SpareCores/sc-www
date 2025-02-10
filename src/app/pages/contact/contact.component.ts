import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BreadcrumbSegment, BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import * as crypto from 'crypto-js';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, BreadcrumbsComponent],
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

  constructor(private fb: FormBuilder) {
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
    const response = await fetch('/api/generate-pow-challenge');
    const data = await response.json();
    // don't care about the random challenge and timestamp, just the signature
    return data.signature;
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
      this.fetchChallengeFromServer().then(challenge => {
        this.powChallenge = challenge;
        this.contactForm.patchValue({ powChallenge: this.powChallenge });
        // medium difficulty (level 4 => ~1 second to solve)
        this.solvePoW(this.powChallenge, 4);

        // Handle form submission after solving PoW
        console.log('Form submitted', this.contactForm.value);
      });
    } else {
      console.log('Form is invalid');
    }
  }
}
