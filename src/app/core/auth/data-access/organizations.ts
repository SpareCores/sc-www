import { isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, computed, inject } from "@angular/core";
import type { OrganizationMembershipResource } from "@clerk/shared/types";
import { AUTH_MESSAGES } from "../auth.constants";
import type { ProfileOrganization, ProfileResult } from "../auth.types";
import { authErrorMessage } from "../auth.utils";
import { AuthState } from "./auth-state";
import { ClerkClient } from "./clerk-client";

const ADMIN_ROLES = new Set(["org:admin", "admin"]);
const ORGANIZATION_FIELDS = [
  "id",
  "name",
  "imageUrl",
  "roleName",
  "isAdmin",
] as const satisfies readonly (keyof ProfileOrganization)[];

function sameOrganizations(
  previous: ProfileOrganization[],
  next: ProfileOrganization[],
): boolean {
  return (
    previous.length === next.length &&
    previous.every((organization, index) => {
      const other = next[index];
      return (
        !!other &&
        ORGANIZATION_FIELDS.every(
          (field) => organization[field] === other[field],
        )
      );
    })
  );
}

@Injectable({ providedIn: "root" })
export class Organizations {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly clerk = inject(ClerkClient);
  private readonly auth = inject(AuthState);

  readonly memberships = computed(
    () =>
      (this.auth.user()?.organizationMemberships ?? [])
        .map((membership) => this.toProfileOrganization(membership))
        .sort((a, b) => a.name.localeCompare(b.name)),
    { equal: sameOrganizations },
  );

  readonly hasOrganizations = computed(() => this.memberships().length > 0);

  readonly active = computed(() => {
    const activeId = this.auth.activeOrganizationId();
    return (
      this.memberships().find((organization) => organization.id === activeId) ??
      null
    );
  });

  readonly isActiveAdmin = computed(() => !!this.active()?.isAdmin);

  async switchTo(organizationId: string | null): Promise<ProfileResult> {
    if (!isPlatformBrowser(this.platformId) || !this.clerk.user) {
      return { status: "error", message: AUTH_MESSAGES.authNotReady };
    }

    try {
      await this.clerk.setActiveOrganization(organizationId);
      this.auth.refreshUser();
      return { status: "complete" };
    } catch (error) {
      return {
        status: "error",
        message: authErrorMessage(
          error,
          AUTH_MESSAGES.unableToSwitchOrganization,
        ),
      };
    }
  }

  private toProfileOrganization(
    membership: OrganizationMembershipResource,
  ): ProfileOrganization {
    return {
      id: membership.organization.id,
      name: membership.organization.name,
      imageUrl: membership.organization.imageUrl ?? "",
      roleName: membership.roleName || membership.role,
      isAdmin: ADMIN_ROLES.has(membership.role),
    };
  }
}
