import { CommonModule } from "@angular/common";
import { Component, effect, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AUTH_MESSAGES, AuthStateService } from "../../core/auth";
import { Button } from "../button/button";

type LoginBusy = "submit" | "github" | "reset" | "resend" | "verify";
type LoginStep = "login" | "second-factor" | "reset-request" | "reset-verify";

@Component({
  selector: "sc-login-modal",
  imports: [CommonModule, FormsModule, Button],
  templateUrl: "./login-modal.html",
  styleUrl: "../auth-modal.scss",
})
export class LoginModal {
  protected readonly auth = inject(AuthStateService);

  protected step: LoginStep = "login";
  protected emailAddress = "";
  protected password = "";
  protected verificationCode = "";
  protected errorMessage = "";
  protected infoMessage = "";
  protected busy: LoginBusy | null = null;

  constructor() {
    effect(() => {
      if (!this.auth.signInModalOpen()) {
        this.reset();
      }
    });
  }

  protected close(): void {
    if (this.busy) {
      return;
    }

    this.auth.closeSignIn();
  }

  protected canSubmitLogin(): boolean {
    return !!this.emailAddress.trim() && !!this.password;
  }

  protected canSubmitSecondFactor(): boolean {
    return !!this.verificationCode.trim();
  }

  protected canSubmitResetRequest(): boolean {
    return !!this.emailAddress.trim();
  }

  protected canSubmitResetVerify(): boolean {
    return !!this.verificationCode.trim() && !!this.password;
  }

  protected openResetRequest(): void {
    if (this.busy) {
      return;
    }

    this.errorMessage = "";
    this.infoMessage = "";
    this.password = "";
    this.verificationCode = "";
    this.step = "reset-request";
  }

  protected async backToLogin(): Promise<void> {
    if (this.busy) {
      return;
    }

    this.errorMessage = "";
    this.infoMessage = "";
    this.password = "";
    this.verificationCode = "";
    this.step = "login";
    await this.auth.abandonLoginAttempt();
  }

  protected async submitLogin(): Promise<void> {
    if (!this.canSubmitLogin() || this.busy) {
      return;
    }

    this.errorMessage = "";
    this.infoMessage = "";
    this.busy = "submit";

    const result = await this.auth.submitLogin({
      emailAddress: this.emailAddress,
      password: this.password,
    });

    this.busy = null;

    if (result.status === "second_factor") {
      this.verificationCode = "";
      this.infoMessage = AUTH_MESSAGES.deviceTrustCodeSent;
      this.step = "second-factor";
      return;
    }

    if (result.status === "error") {
      this.errorMessage = result.message;
    }
  }

  protected async submitSecondFactor(): Promise<void> {
    if (!this.canSubmitSecondFactor() || this.busy) {
      return;
    }

    this.errorMessage = "";
    this.busy = "verify";

    const result = await this.auth.completeLoginSecondFactor(
      this.verificationCode,
    );

    this.busy = null;

    if (result.status === "error") {
      this.errorMessage = result.message;
    }
  }

  protected async resendSecondFactor(): Promise<void> {
    if (this.busy) {
      return;
    }

    this.errorMessage = "";
    this.busy = "resend";

    const result = await this.auth.resendLoginSecondFactor();

    this.busy = null;

    if (result.status === "second_factor") {
      this.infoMessage = AUTH_MESSAGES.deviceTrustCodeSent;
      return;
    }

    if (result.status === "error") {
      this.errorMessage = result.message;
    }
  }

  protected async submitResetRequest(): Promise<void> {
    if (!this.canSubmitResetRequest() || this.busy) {
      return;
    }

    this.errorMessage = "";
    this.busy = "reset";

    const result = await this.auth.startPasswordReset(this.emailAddress);

    this.busy = null;

    if (result.status === "code_sent") {
      this.password = "";
      this.verificationCode = "";
      this.step = "reset-verify";
      return;
    }

    if (result.status === "error") {
      this.errorMessage = result.message;
    }
  }

  protected async submitResetVerify(): Promise<void> {
    if (!this.canSubmitResetVerify() || this.busy) {
      return;
    }

    this.errorMessage = "";
    this.busy = "reset";

    const result = await this.auth.completePasswordReset({
      code: this.verificationCode,
      password: this.password,
    });

    this.busy = null;

    if (result.status === "error") {
      this.errorMessage = result.message;
    }
  }

  protected async resendResetCode(): Promise<void> {
    if (this.busy) {
      return;
    }

    this.errorMessage = "";
    this.busy = "resend";

    const result = await this.auth.resendPasswordResetCode();

    this.busy = null;

    if (result.status === "error") {
      this.errorMessage = result.message;
    }
  }

  protected async continueWithGithub(): Promise<void> {
    if (this.busy) {
      return;
    }

    this.errorMessage = "";
    this.infoMessage = "";
    this.busy = "github";

    try {
      await this.auth.signInWithGithub();
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : AUTH_MESSAGES.unableToContinueGithub;
    } finally {
      this.busy = null;
    }
  }

  protected openSignUp(): void {
    if (this.busy) {
      return;
    }

    this.auth.signUp();
  }

  private reset(): void {
    this.step = "login";
    this.emailAddress = "";
    this.password = "";
    this.verificationCode = "";
    this.errorMessage = "";
    this.infoMessage = "";
    this.busy = null;
  }
}
