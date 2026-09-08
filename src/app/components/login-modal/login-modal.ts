import { CommonModule } from "@angular/common";
import { Component, effect, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Auth } from "../../services/auth/auth";
import { Button } from "../button/button";

type LoginBusy = "submit" | "github" | "reset" | "resend";
type LoginStep = "login" | "reset-request" | "reset-verify";

@Component({
  selector: "sc-login-modal",
  imports: [CommonModule, FormsModule, Button],
  templateUrl: "./login-modal.html",
  styleUrl: "../auth-modal.scss",
})
export class LoginModal {
  protected readonly auth = inject(Auth);

  protected step: LoginStep = "login";
  protected emailAddress = "";
  protected password = "";
  protected verificationCode = "";
  protected errorMessage = "";
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
    this.password = "";
    this.verificationCode = "";
    this.step = "reset-request";
  }

  protected backToLogin(): void {
    if (this.busy) {
      return;
    }

    this.errorMessage = "";
    this.password = "";
    this.verificationCode = "";
    this.step = "login";
  }

  protected async submitLogin(): Promise<void> {
    if (!this.canSubmitLogin() || this.busy) {
      return;
    }

    this.errorMessage = "";
    this.busy = "submit";

    const result = await this.auth.submitLogin({
      emailAddress: this.emailAddress,
      password: this.password,
    });

    this.busy = null;

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
    this.busy = "github";

    try {
      await this.auth.signInWithGithub();
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to continue with GitHub.";
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
    this.busy = null;
  }
}
