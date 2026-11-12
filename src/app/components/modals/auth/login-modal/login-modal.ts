import { DialogRef } from "@angular/cdk/dialog";
import {
  Component,
  DestroyRef,
  TemplateRef,
  effect,
  inject,
  untracked,
  viewChild,
} from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import { LucideDynamicIcon } from "@lucide/angular";
import { AUTH_MESSAGES, AuthState } from "../../../../core/auth";
import { ModalDialog } from "../../../../services/modal-dialog";
import { Button } from "../../../button/button";
import { LoadingSpinner } from "../../../loading-spinner/loading-spinner";
import { Modal } from "../../modal/modal";

type LoginBusy = "submit" | "github" | "reset" | "resend" | "verify";
type LoginStep = "login" | "second-factor" | "reset-request" | "reset-verify";

const STEP_TITLES: Record<LoginStep, string> = {
  login: "Sign in to Spare Cores",
  "second-factor": "Verify this device",
  "reset-request": "Reset your password",
  "reset-verify": "Set a new password",
};

@Component({
  selector: "sc-login-modal",
  imports: [FormsModule, Button, LucideDynamicIcon, LoadingSpinner, Modal],
  templateUrl: "./login-modal.html",
  styleUrl: "../auth-modal.css",
})
export class LoginModal {
  protected readonly auth = inject(AuthState);
  private readonly modalDialog = inject(ModalDialog);
  private readonly modalTemplate =
    viewChild<TemplateRef<unknown>>("modalTemplate");
  private dialogRef: DialogRef | null = null;

  protected step: LoginStep = "login";
  protected emailAddress = "";
  protected password = "";
  protected showPassword = false;
  protected verificationCode = "";
  protected errorMessage = "";
  protected infoMessage = "";
  protected busy: LoginBusy | null = null;

  protected get isAuthPending(): boolean {
    return (
      this.step === "login" &&
      (this.busy === "submit" || this.busy === "github")
    );
  }

  protected get title(): string {
    return this.isAuthPending
      ? "Signing in to your account"
      : STEP_TITLES[this.step];
  }

  constructor() {
    effect(() => {
      const open = this.auth.signInModalOpen();
      const template = this.modalTemplate();
      untracked(() => {
        if (!open) {
          this.dialogRef?.close();
          this.reset();
        } else if (template) {
          this.openDialog(template);
        }
      });
    });

    inject(DestroyRef).onDestroy(() => this.dialogRef?.close());
  }

  private openDialog(template: TemplateRef<unknown>): void {
    if (this.dialogRef) {
      return;
    }
    const dialogRef = this.modalDialog.open(template, { disableClose: true });
    dialogRef.backdropClick.subscribe(() => this.close());
    dialogRef.keydownEvents.subscribe((event) => {
      if (event.key === "Escape") {
        this.close();
      }
    });
    dialogRef.closed.subscribe(() => {
      this.dialogRef = null;
      if (this.auth.signInModalOpen()) {
        this.auth.closeSignIn();
      }
    });
    this.dialogRef = dialogRef;
  }

  protected close(): void {
    if (this.busy) {
      return;
    }

    this.auth.closeSignIn();
  }

  protected canSubmitSecondFactor(): boolean {
    return !!this.verificationCode.trim();
  }

  protected openResetRequest(): void {
    if (this.busy) {
      return;
    }

    this.errorMessage = "";
    this.infoMessage = "";
    this.password = "";
    this.showPassword = false;
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
    this.showPassword = false;
    this.verificationCode = "";
    this.step = "login";
    await this.auth.abandonLoginAttempt();
  }

  protected async submitLogin(form: NgForm): Promise<void> {
    if (form.invalid || this.busy) {
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

  protected async submitResetRequest(form: NgForm): Promise<void> {
    if (form.invalid || this.busy) {
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

  protected async submitResetVerify(form: NgForm): Promise<void> {
    if (form.invalid || !this.verificationCode.trim() || this.busy) {
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

  protected async continueWithGitHub(): Promise<void> {
    if (this.busy) {
      return;
    }

    this.errorMessage = "";
    this.infoMessage = "";
    this.busy = "github";

    try {
      await this.auth.signInWithGitHub();
    } catch (error) {
      this.busy = null;
      this.errorMessage =
        error instanceof Error
          ? error.message
          : AUTH_MESSAGES.unableToContinueGitHub;
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
    this.showPassword = false;
    this.verificationCode = "";
    this.errorMessage = "";
    this.infoMessage = "";
    this.busy = null;
  }
}
