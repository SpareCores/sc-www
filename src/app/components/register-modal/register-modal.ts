import { CommonModule } from "@angular/common";
import { Component, effect, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Auth } from "../../services/auth/auth";
import { Button } from "../button/button";

type RegisterBusy = "submit" | "verify" | "resend" | "github";
type RegisterStep = "details" | "consent" | "verify";
type RegisterMethod = "email" | "github";

@Component({
  selector: "sc-register-modal",
  imports: [CommonModule, FormsModule, Button],
  templateUrl: "./register-modal.html",
  styleUrl: "../auth-modal.scss",
})
export class RegisterModal {
  protected readonly auth = inject(Auth);

  protected step: RegisterStep = "details";
  protected method: RegisterMethod = "email";
  protected firstName = "";
  protected lastName = "";
  protected emailAddress = "";
  protected password = "";
  protected legalAccepted = false;
  protected newsletterOptIn = false;
  protected verificationCode = "";
  protected errorMessage = "";
  protected busy: RegisterBusy | null = null;

  constructor() {
    effect(() => {
      if (!this.auth.signUpModalOpen()) {
        this.reset();
      }
    });
  }

  protected close(): void {
    if (this.busy) {
      return;
    }

    this.auth.closeSignUp();
  }

  protected canSubmitDetails(): boolean {
    return (
      !!this.firstName.trim() &&
      !!this.lastName.trim() &&
      !!this.emailAddress.trim() &&
      !!this.password
    );
  }

  protected canSubmitConsent(): boolean {
    return this.legalAccepted;
  }

  protected canVerify(): boolean {
    return !!this.verificationCode.trim();
  }

  protected continueToConsent(): void {
    if (!this.canSubmitDetails() || this.busy) {
      return;
    }

    this.errorMessage = "";
    this.method = "email";
    this.step = "consent";
  }

  protected continueWithGithub(): void {
    if (this.busy) {
      return;
    }

    this.errorMessage = "";
    this.method = "github";
    this.step = "consent";
  }

  protected backToDetails(): void {
    if (this.busy) {
      return;
    }

    this.errorMessage = "";
    this.step = "details";
  }

  protected async submitConsent(): Promise<void> {
    if (!this.canSubmitConsent() || this.busy) {
      return;
    }

    this.errorMessage = "";

    if (this.method === "github") {
      await this.submitGithub();
      return;
    }

    await this.submitEmail();
  }

  protected async verifyEmail(): Promise<void> {
    if (!this.canVerify() || this.busy) {
      return;
    }

    this.errorMessage = "";
    this.busy = "verify";

    const result = await this.auth.verifyRegister(this.verificationCode);

    this.busy = null;

    if (result.status === "error") {
      this.errorMessage = result.message;
    }
  }

  protected async resendCode(): Promise<void> {
    if (this.busy) {
      return;
    }

    this.errorMessage = "";
    this.busy = "resend";

    const result = await this.auth.resendRegisterCode();

    this.busy = null;

    if (result.status === "error") {
      this.errorMessage = result.message;
    }
  }

  protected openSignIn(): void {
    if (this.busy) {
      return;
    }

    this.auth.signIn();
  }

  private async submitEmail(): Promise<void> {
    this.busy = "submit";

    const result = await this.auth.submitRegister({
      firstName: this.firstName,
      lastName: this.lastName,
      emailAddress: this.emailAddress,
      password: this.password,
      legalAccepted: this.legalAccepted,
      newsletterOptIn: this.newsletterOptIn,
    });

    this.busy = null;

    if (result.status === "verify") {
      this.step = "verify";
      return;
    }

    if (result.status === "error") {
      this.errorMessage = result.message;
    }
  }

  private async submitGithub(): Promise<void> {
    this.busy = "github";

    try {
      await this.auth.signUpWithGithub(
        this.newsletterOptIn,
        this.legalAccepted,
      );
      this.auth.closeSignUp();
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to continue with GitHub.";
    } finally {
      this.busy = null;
    }
  }

  private reset(): void {
    this.step = "details";
    this.method = "email";
    this.firstName = "";
    this.lastName = "";
    this.emailAddress = "";
    this.password = "";
    this.legalAccepted = false;
    this.newsletterOptIn = false;
    this.verificationCode = "";
    this.errorMessage = "";
    this.busy = null;
  }
}
