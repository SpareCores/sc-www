import { CommonModule } from "@angular/common";
import { Component, effect, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Auth } from "../../services/auth/auth";
import { Button } from "../button/button";

type RegisterBusy = "submit" | "verify" | "resend" | "github";

@Component({
  selector: "sc-register-modal",
  imports: [CommonModule, FormsModule, Button],
  templateUrl: "./register-modal.html",
  styleUrl: "./register-modal.scss",
})
export class RegisterModal {
  protected readonly auth = inject(Auth);

  protected step: "details" | "verify" = "details";
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

  protected stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }

  protected canSubmit(): boolean {
    return (
      !!this.firstName.trim() &&
      !!this.lastName.trim() &&
      !!this.emailAddress.trim() &&
      !!this.password &&
      this.legalAccepted
    );
  }

  protected canVerify(): boolean {
    return !!this.verificationCode.trim();
  }

  protected async submitDetails(): Promise<void> {
    if (!this.canSubmit() || this.busy) {
      return;
    }

    this.errorMessage = "";
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

  protected async continueWithGithub(): Promise<void> {
    if (this.busy) {
      return;
    }

    if (!this.legalAccepted) {
      this.errorMessage =
        "You must accept the Terms of Service and Privacy Policy.";
      return;
    }

    this.errorMessage = "";
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

  protected openSignIn(): void {
    if (this.busy) {
      return;
    }

    this.auth.closeSignUp();
    this.auth.signIn();
  }

  private reset(): void {
    this.step = "details";
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
