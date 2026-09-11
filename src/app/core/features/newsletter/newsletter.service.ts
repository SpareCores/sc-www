import { isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, effect, inject } from "@angular/core";
import type { UserResource } from "@clerk/shared/types";
import { ToastService } from "../../../services/toast.service";
import {
  AUTH_MESSAGES,
  NEWSLETTER_OPT_IN_KEY,
  NEWSLETTER_SUBSCRIBED_KEY,
  WWW_API_BASE_URI,
} from "../../auth/auth.constants";
import { AuthStateService } from "../../auth/data-access/auth-state.service";

@Injectable({ providedIn: "root" })
export class NewsletterService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly toastService = inject(ToastService);
  private readonly auth = inject(AuthStateService);
  private readonly syncedUsers = new Set<string>();

  constructor() {
    effect(() => {
      const user = this.auth.authSessionReady();
      if (!user || !isPlatformBrowser(this.platformId)) {
        return;
      }
      void this.subscribeIfNeeded(user);
    });
  }

  private async subscribeIfNeeded(user: UserResource): Promise<void> {
    if (!WWW_API_BASE_URI) {
      return;
    }

    if (this.syncedUsers.has(user.id)) {
      return;
    }

    const metadata = (user.unsafeMetadata ?? {}) as Record<string, unknown>;
    if (
      metadata[NEWSLETTER_OPT_IN_KEY] !== true ||
      metadata[NEWSLETTER_SUBSCRIBED_KEY] === true
    ) {
      return;
    }

    this.syncedUsers.add(user.id);

    try {
      const token = await this.auth.getToken();
      if (!token) {
        this.syncedUsers.delete(user.id);
        return;
      }

      const response = await fetch(`${WWW_API_BASE_URI}/newsletter/subscribe`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Application-ID": "sc-www",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Newsletter subscription failed with ${response.status}`,
        );
      }

      await user.updateMetadata({
        unsafeMetadata: {
          [NEWSLETTER_OPT_IN_KEY]: null,
          [NEWSLETTER_SUBSCRIBED_KEY]: true,
        },
      });

      this.toastService.show({
        title: AUTH_MESSAGES.newsletterSuccess,
        type: "success",
        duration: 4000,
      });
    } catch (error) {
      console.error("Newsletter subscription failed! :(", error);
      this.toastService.show({
        title: AUTH_MESSAGES.newsletterError,
        type: "error",
        duration: 5000,
      });
      this.syncedUsers.delete(user.id);
    }
  }
}
