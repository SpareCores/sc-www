import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NgForm } from "@angular/forms";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import { AUTH_MESSAGES, AuthState } from "../../core/auth";
import { LoginModal } from "./login-modal";

type LoginModalInternals = {
  emailAddress: string;
  password: string;
  verificationCode: string;
  submitLogin(form: NgForm): Promise<void>;
  openResetRequest(): void;
  submitResetRequest(form: NgForm): Promise<void>;
  submitResetVerify(form: NgForm): Promise<void>;
  backToLogin(): Promise<void>;
};

describe("LoginModal", () => {
  let fixture: ComponentFixture<LoginModal>;
  let modal: LoginModalInternals;
  let auth: jasmine.SpyObj<AuthState>;
  const validForm = { invalid: false } as NgForm;

  beforeEach(async () => {
    auth = jasmine.createSpyObj<AuthState>("AuthState", [
      "submitLogin",
      "startPasswordReset",
      "completePasswordReset",
      "abandonLoginAttempt",
    ]);
    auth.abandonLoginAttempt.and.resolveTo();

    await TestBed.configureTestingModule({
      imports: [LoginModal],
      providers: [
        ...sharedTestingProviders,
        {
          provide: AuthState,
          useValue: { ...auth, signInModalOpen: signal(true) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginModal);
    modal = fixture.componentInstance as unknown as LoginModalInternals;
    fixture.detectChanges();
  });

  function title(): string {
    const element: HTMLElement = fixture.nativeElement;
    return (
      element.querySelector(".auth-modal__title")?.textContent?.trim() ?? ""
    ).replace(/\s+/g, " ");
  }

  function errorText(): string {
    const element: HTMLElement = fixture.nativeElement;
    return (
      element.querySelector(".auth-modal__error")?.textContent?.trim() ?? ""
    );
  }

  it("should create", () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect(title()).toBe("Sign in to Spare Cores");
  });

  it("moves to device verification when login needs a second factor", async () => {
    auth.submitLogin.and.resolveTo({ status: "second_factor" });
    modal.emailAddress = "ada@example.com";
    modal.password = "secret-password";

    await modal.submitLogin(validForm);
    fixture.detectChanges();

    expect(auth.submitLogin).toHaveBeenCalledWith({
      emailAddress: "ada@example.com",
      password: "secret-password",
    });
    expect(title()).toBe("Verify this device");
  });

  it("shows the login error and stays on the sign-in step", async () => {
    auth.submitLogin.and.resolveTo({
      status: "error",
      message: "Password is incorrect. Try again.",
    });

    await modal.submitLogin(validForm);
    fixture.detectChanges();

    expect(title()).toBe("Sign in to Spare Cores");
    expect(errorText()).toBe("Password is incorrect. Try again.");
  });

  it("runs the password reset flow", async () => {
    auth.startPasswordReset.and.resolveTo({ status: "code_sent" });
    auth.completePasswordReset.and.resolveTo({ status: "complete" });

    modal.openResetRequest();
    fixture.detectChanges();
    expect(title()).toBe("Reset your password");

    modal.emailAddress = "ada@example.com";
    await modal.submitResetRequest(validForm);
    fixture.detectChanges();
    expect(auth.startPasswordReset).toHaveBeenCalledWith("ada@example.com");
    expect(title()).toBe("Set a new password");

    modal.verificationCode = "424242";
    modal.password = "new-secret-password";
    await modal.submitResetVerify(validForm);

    expect(auth.completePasswordReset).toHaveBeenCalledWith({
      code: "424242",
      password: "new-secret-password",
    });
  });

  it("shows the reset error message", async () => {
    auth.startPasswordReset.and.resolveTo({
      status: "error",
      message: AUTH_MESSAGES.unableToSendResetCode,
    });

    modal.openResetRequest();
    modal.emailAddress = "ada@example.com";
    await modal.submitResetRequest(validForm);
    fixture.detectChanges();

    expect(title()).toBe("Reset your password");
    expect(errorText()).toBe(AUTH_MESSAGES.unableToSendResetCode);
  });

  it("abandons the sign-in attempt when going back to login", async () => {
    modal.openResetRequest();

    await modal.backToLogin();
    fixture.detectChanges();

    expect(auth.abandonLoginAttempt).toHaveBeenCalled();
    expect(title()).toBe("Sign in to Spare Cores");
  });
});
