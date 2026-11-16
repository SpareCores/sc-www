import { isPlatformBrowser } from "@angular/common";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import type { APIKeyResource, APIKeysNamespace } from "@clerk/shared/types";
import { firstValueFrom } from "rxjs";
import { AUTH_MESSAGES, WWW_API_BASE_URI } from "../auth.constants";
import type {
  ApiTokenCreatePayload,
  ApiTokenCreateResult,
  ApiTokenOwner,
  ApiTokensListResult,
  ProfileApiToken,
  ProfileResult,
} from "../auth.types";
import { authErrorMessage } from "../auth.utils";
import { AuthState } from "./auth-state";
import { ClerkClient } from "./clerk-client";
import { Organizations } from "./organizations";

const API_TOKENS_PAGE_SIZE = 100;

type TokenCreateResponse = {
  name: string;
  secret: string;
  owner: ApiTokenOwner;
};

type TokenErrorDetail = string | { message?: string } | null | undefined;

@Injectable({ providedIn: "root" })
export class ApiTokens {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly clerk = inject(ClerkClient);
  private readonly auth = inject(AuthState);
  private readonly organizations = inject(Organizations);

  canManage(owner: ApiTokenOwner): boolean {
    return owner === "user" || this.organizations.isActiveAdmin();
  }

  async list(organizationId: string | null): Promise<ApiTokensListResult> {
    const apiKeys = this.clerk.apiKeys;
    const userId = this.auth.userId();
    if (!isPlatformBrowser(this.platformId) || !apiKeys || !userId) {
      return { status: "error", message: AUTH_MESSAGES.authNotReady };
    }

    const [user, organization] = await Promise.allSettled([
      this.listAll(apiKeys, userId),
      organizationId
        ? this.listAll(apiKeys, organizationId)
        : Promise.resolve(null),
    ]);

    if (user.status === "rejected") {
      return {
        status: "error",
        message: authErrorMessage(
          user.reason,
          AUTH_MESSAGES.unableToLoadApiTokens,
        ),
      };
    }

    return {
      status: "complete",
      user: this.toProfileTokens(user.value, "user"),
      organizationId,
      organization:
        organization.status === "fulfilled" && organization.value
          ? this.toProfileTokens(organization.value, "organization")
          : null,
      organizationError:
        organization.status === "rejected"
          ? AUTH_MESSAGES.organizationTokensUnavailable
          : "",
    };
  }

  async create(payload: ApiTokenCreatePayload): Promise<ApiTokenCreateResult> {
    if (!isPlatformBrowser(this.platformId)) {
      return { status: "error", message: AUTH_MESSAGES.profileBrowserOnly };
    }

    try {
      const response = await firstValueFrom(
        this.http.post<TokenCreateResponse>(`${WWW_API_BASE_URI}/tokens`, {
          name: payload.name.trim(),
          owner: this.canManage(payload.owner) ? payload.owner : "user",
          ...(payload.secondsUntilExpiration
            ? { seconds_until_expiration: payload.secondsUntilExpiration }
            : {}),
        }),
      );
      if (typeof response?.secret !== "string" || !response.secret) {
        return {
          status: "error",
          message: AUTH_MESSAGES.unableToCreateApiToken,
        };
      }
      return {
        status: "complete",
        token: {
          name: response.name,
          secret: response.secret,
          owner: response.owner,
        },
      };
    } catch (error) {
      return { status: "error", message: this.createErrorMessage(error) };
    }
  }

  async revoke(apiKeyId: string): Promise<ProfileResult> {
    const apiKeys = this.clerk.apiKeys;
    if (!apiKeys) {
      return { status: "error", message: AUTH_MESSAGES.authNotReady };
    }

    try {
      await apiKeys.revoke({ apiKeyID: apiKeyId });
      return { status: "complete" };
    } catch (error) {
      return {
        status: "error",
        message: authErrorMessage(error, AUTH_MESSAGES.unableToRevokeApiToken),
      };
    }
  }

  private async listAll(
    apiKeys: APIKeysNamespace,
    subject: string,
  ): Promise<APIKeyResource[]> {
    const keys: APIKeyResource[] = [];
    for (let page = 1; ; page++) {
      const response = await apiKeys.getAll({
        subject,
        pageSize: API_TOKENS_PAGE_SIZE,
        initialPage: page,
      });
      keys.push(...response.data);
      if (
        response.data.length < API_TOKENS_PAGE_SIZE ||
        keys.length >= response.total_count
      ) {
        return keys;
      }
    }
  }

  private toProfileTokens(
    keys: APIKeyResource[],
    owner: ApiTokenOwner,
  ): ProfileApiToken[] {
    return keys
      .filter((key) => !key.revoked)
      .map((key) => ({
        id: key.id,
        name: key.name,
        owner,
        createdAt: key.createdAt,
        lastUsedAt: key.lastUsedAt,
        expiration: key.expiration,
        expired: key.expired,
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  private createErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return AUTH_MESSAGES.unableToCreateApiToken;
    }
    const detail = (error.error as { detail?: TokenErrorDetail } | null)
      ?.detail;
    if (typeof detail === "string" && detail) {
      return detail;
    }
    if (detail && typeof detail === "object" && detail.message) {
      return detail.message;
    }
    return AUTH_MESSAGES.unableToCreateApiToken;
  }
}
