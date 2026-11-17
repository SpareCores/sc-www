const CLERK_API_URL = "https://api.clerk.com/v1";
const CLERK_TEST_EMAIL_PATTERN = /\+clerk_test(\+[^@]*)?@example\.com$/;
const TEST_ORGANIZATION_PREFIX = "e2e-";

export type ClerkTestOrganizationRequest = {
  name: string;
  adminEmail: string;
  memberEmail: string;
};

export type ClerkTestApiKeyRequest = {
  name: string;
  subject: string;
  createdByEmail: string;
};

type ClerkUserSummary = {
  id: string;
  email_addresses?: { email_address: string }[];
};

type ClerkOrganizationSummary = { id: string; name: string };

async function clerkRequest<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("CLERK_SECRET_KEY is required to manage Clerk test data");
  }

  const response = await fetch(`${CLERK_API_URL}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  if (!response.ok) {
    throw new Error(
      `Clerk ${init.method ?? "GET"} ${path} failed (${response.status}): ${await response.text()}`,
    );
  }

  return (await response.json()) as T;
}

async function findClerkTestUserId(email: string): Promise<string> {
  if (!CLERK_TEST_EMAIL_PATTERN.test(email)) {
    throw new Error(`Refusing to use non-test Clerk user: ${email}`);
  }

  const users = await clerkRequest<ClerkUserSummary[]>(
    `/users?email_address=${encodeURIComponent(email)}&limit=10`,
  );
  const user = users.find((item) =>
    item.email_addresses?.some(
      (address) => address.email_address.toLowerCase() === email.toLowerCase(),
    ),
  );
  if (!user) {
    throw new Error(`Clerk test user not found: ${email}`);
  }
  return user.id;
}

function assertTestOrganizationName(name: string): void {
  if (!name.startsWith(TEST_ORGANIZATION_PREFIX)) {
    throw new Error(`Refusing to manage non-test Clerk organization: ${name}`);
  }
}

export async function createClerkTestOrganization({
  name,
  adminEmail,
  memberEmail,
}: ClerkTestOrganizationRequest): Promise<string> {
  assertTestOrganizationName(name);
  const adminId = await findClerkTestUserId(adminEmail);
  const memberId = await findClerkTestUserId(memberEmail);

  const organization = await clerkRequest<ClerkOrganizationSummary>(
    "/organizations",
    { method: "POST", body: { name, created_by: adminId } },
  );
  try {
    await clerkRequest(`/organizations/${organization.id}/memberships`, {
      method: "POST",
      body: { user_id: memberId, role: "org:member" },
    });
  } catch (error) {
    await clerkRequest(`/organizations/${organization.id}`, {
      method: "DELETE",
    }).catch(() => undefined);
    throw error;
  }

  return organization.id;
}

export async function deleteClerkTestOrganization(
  organizationId: string,
): Promise<null> {
  const organization = await clerkRequest<ClerkOrganizationSummary>(
    `/organizations/${encodeURIComponent(organizationId)}`,
  );
  assertTestOrganizationName(organization.name);
  await clerkRequest(`/organizations/${organization.id}`, {
    method: "DELETE",
  });
  return null;
}

export async function createClerkTestApiKey({
  name,
  subject,
  createdByEmail,
}: ClerkTestApiKeyRequest): Promise<string> {
  const createdBy = await findClerkTestUserId(createdByEmail);
  const apiKey = await clerkRequest<{ id: string }>("/api_keys", {
    method: "POST",
    body: { name, subject, created_by: createdBy },
  });
  return apiKey.id;
}
