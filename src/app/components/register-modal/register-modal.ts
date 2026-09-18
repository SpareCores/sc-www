import { CommonModule } from "@angular/common";
import { Component, effect, inject } from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import { LucideDynamicIcon } from "@lucide/angular";
import { AUTH_MESSAGES, AuthStateService } from "../../core/auth";
import { Button } from "../button/button";

type RegisterBusy = "submit" | "verify" | "resend" | "github";
type RegisterStep = "details" | "consent" | "verify";
type RegisterMethod = "email" | "github";

const DETAILS_PARAMS = new Set([
  "email_address",
  "emailAddress",
  "first_name",
  "firstName",
  "last_name",
  "lastName",
  "password",
]);

@Component({
  selector: "sc-register-modal",
  imports: [CommonModule, FormsModule, Button, LucideDynamicIcon],
  templateUrl: "./register-modal.html",
  styleUrl: "../auth-modal.scss",
})
export class RegisterModal {
  protected readonly auth = inject(AuthStateService);

  protected step: RegisterStep = "details";
  protected method: RegisterMethod = "email";
  protected firstName = "";
  protected lastName = "";
  protected emailAddress = "";
  protected password = "";
  protected showPassword = false;
  protected legalAccepted = false;
  protected newsletterOptIn = false;
  protected verificationCode = "";
  protected errorMessage = "";
  protected infoMessage = "";
  protected busy: RegisterBusy | null = null;

  constructor() {
    effect(() => {
      if (!this.auth.signUpModalOpen()) {
        this.reset();
        return;
      }

      if (this.auth.githubConsentActive()) {
        this.method = "github";
        this.step = "consent";
        this.errorMessage = "";
        this.infoMessage = "";
      }
    });
  }

  protected close(): void {
    this.busy = null;
    this.auth.closeSignUp();
  }

  protected canSubmitDetails(form: NgForm): boolean {
    return !!form.valid && !!this.firstName.trim() && !!this.lastName.trim();
  }

  protected canSubmitConsent(): boolean {
    return this.legalAccepted;
  }

  protected canVerify(): boolean {
    return !!this.verificationCode.trim();
  }

  protected continueWithGithub(): void {
    if (this.busy) {
      return;
    }

    this.errorMessage = "";
    this.method = "github";
    void this.submitGithub();
  }

  protected backToDetails(): void {
    if (this.busy) {
      return;
    }

    if (this.auth.githubConsentActive()) {
      this.auth.signIn();
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

    await this.finishRegister();
  }

  protected async verifyEmail(): Promise<void> {
    if (!this.canVerify() || this.busy) {
      return;
    }

    this.errorMessage = "";
    this.infoMessage = "";
    this.busy = "verify";

    const result = await this.auth.verifyRegister(this.verificationCode);

    this.busy = null;

    if (result.status === "error") {
      this.applyRegisterError(result.message, result.param);
    }
  }

  protected async resendCode(): Promise<void> {
    if (this.busy) {
      return;
    }

    this.errorMessage = "";
    this.infoMessage = "";
    this.busy = "resend";

    const result = await this.auth.resendRegisterCode();

    this.busy = null;

    if (result.status === "error") {
      this.applyRegisterError(result.message, result.param);
      return;
    }

    this.infoMessage = AUTH_MESSAGES.verificationCodeSent;
  }

  protected openSignIn(): void {
    if (this.busy) {
      return;
    }

    this.auth.signIn();
  }

  protected async submitDetails(form: NgForm): Promise<void> {
    if (!this.canSubmitDetails(form) || this.busy) {
      return;
    }

    this.errorMessage = "";
    this.method = "email";
    this.busy = "submit";

    const result = await this.auth.startRegister({
      firstName: this.firstName,
      lastName: this.lastName,
      emailAddress: this.emailAddress,
      password: this.password,
    });

    this.busy = null;

    if (result.status === "consent") {
      this.step = "consent";
      return;
    }

    if (result.status === "verify") {
      this.step = "verify";
      return;
    }

    if (result.status === "error") {
      this.applyRegisterError(result.message, result.param);
    }
  }

  private async finishRegister(): Promise<void> {
    this.busy = "submit";

    const result = await this.auth.completeRegister({
      legalAccepted: this.legalAccepted,
      newsletterOptIn: this.newsletterOptIn,
    });

    this.busy = null;

    if (result.status === "verify") {
      this.step = "verify";
      return;
    }

    if (result.status === "error") {
      this.applyRegisterError(result.message, result.param);
    }
  }

  private applyRegisterError(message: string, param?: string): void {
    this.errorMessage = message;
    this.infoMessage = "";

    if (param === "password") {
      this.password = "";
      this.showPassword = false;
    }

    if (param && DETAILS_PARAMS.has(param)) {
      this.step = "details";
    }
  }

  private async submitGithub(): Promise<void> {
    this.busy = "github";

    const result = await this.auth.submitGithubConsent(
      this.newsletterOptIn,
      this.auth.githubConsentActive() ? this.legalAccepted : false,
    );

    this.busy = null;

    if (result.status === "error") {
      this.errorMessage = result.message;
    }
  }

  private reset(): void {
    this.step = "details";
    this.method = "email";
    this.firstName = "";
    this.lastName = "";
    this.emailAddress = "";
    this.password = "";
    this.showPassword = false;
    this.legalAccepted = false;
    this.newsletterOptIn = false;
    this.verificationCode = "";
    this.errorMessage = "";
    this.infoMessage = "";
    this.busy = null;
  }
}
