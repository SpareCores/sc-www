import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  BreadcrumbSegment,
  BreadcrumbsComponent,
} from "../../components/breadcrumbs/breadcrumbs.component";
import * as crypto from "crypto-js";
import { LoadingSpinnerComponent } from "../../components/loading-spinner/loading-spinner.component";
import { ToastService } from "../../services/toast.service";

@Component({
  selector: "app-contact",
  imports: [ReactiveFormsModule, BreadcrumbsComponent, LoadingSpinnerComponent],
  templateUrl: "./contact.component.html",
  styleUrls: ["./contact.component.scss"],
})
export class ContactComponent {
  contactForm: FormGroup;
  powSolution!: number;
  breadcrumbs: BreadcrumbSegment[] = [
    {
      name: "Home",
      url: "/",
    },
    {
      name: "Contact Us",
      url: "/contact",
    },
  ];
  isLoading = false;
  isSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
  ) {
    this.contactForm = this.fb.group({
      name: ["", Validators.required],
      affiliation: [""],
      email: ["", [Validators.required, Validators.email]],
      phone: [""],
      message: ["", Validators.required],
      privacyPolicy: [false, Validators.requiredTrue],
      // received from server
      powChallenge: [""],
      powTimestamp: [0],
      powSignature: [""],
      // calculated by client
      powSolution: [0],
      powDuration: [0],
    });
  }

  async fetchChallengeFromServer(): Promise<{
    challenge: string;
    timestamp: number;
    signature: string;
  }> {
    try {
      const response = await fetch("/api/generate-pow-challenge");
      const data = await response.json();
      return data;
    } catch (error) {
      this.toastService.show({
        title: "Failed to fetch PoW challenge. Please try again later!",
        type: "error",
      });
      throw error;
    }
  }

  solvePoW(challenge: string): void {
    let solution = 0;
    // difficulty set to 4
    const target = "0".repeat(4);
    const startTime = Date.now();
    let solved = false;
    while (!solved) {
      const hash = crypto.SHA256(challenge + solution).toString();
      // make it more difficult than just looking at the first 4 characters
      // by enforcing min 1e5 iterations and checking the 5th character for around 50% difficulty increase
      if (
        solution > 10000 &&
        hash.startsWith(target) &&
        parseInt(hash[4], 16) <= 7
      ) {
        solved = true;
        this.powSolution = solution;
        this.contactForm.patchValue({ powSolution: this.powSolution });
        this.contactForm.patchValue({ powDuration: Date.now() - startTime });
      }
      solution++;
    }
  }

  disableAllInputs(): void {
    Object.keys(this.contactForm.controls).forEach((controlName) => {
      this.contactForm.controls[controlName].disable();
    });
  }

  async submitFormToServer(): Promise<void> {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.contactForm.value),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to send the message: ${errorData.error || "Unknown error"}`,
        );
      }

      this.toastService.show({ title: "Message sent!", type: "success" });
    } catch (error) {
      this.toastService.show({
        title: "Failed to send message. Please try again later!",
        type: "error",
      });
      throw error;
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.contactForm.valid) {
      return;
    }
    this.isLoading = true;
    try {
      this.disableAllInputs();
      const { challenge, timestamp, signature } =
        await this.fetchChallengeFromServer();
      this.contactForm.patchValue({
        powChallenge: challenge,
        powTimestamp: timestamp,
        powSignature: signature,
      });
      this.solvePoW(challenge);
      await this.submitFormToServer();
      this.isSubmitted = true;
    } catch (error) {
      console.error("Error submitting contact form:", error);
      this.contactForm.enable();
    } finally {
      this.isLoading = false;
    }
  }
}
