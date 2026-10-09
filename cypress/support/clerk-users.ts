type ClerkUserSummary = {
  id: string;
};

export async function deleteClerkUserByEmail(email: string): Promise<null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("CLERK_SECRET_KEY is required to delete Clerk test users");
  }

  const listUrl = new URL("https://api.clerk.com/v1/users");
  listUrl.searchParams.append("email_address", email);
  listUrl.searchParams.set("limit", "10");

  const listResponse = await fetch(listUrl, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });

  if (!listResponse.ok) {
    throw new Error(
      `Clerk list users failed (${listResponse.status}) for ${email}`,
    );
  }

  const users = (await listResponse.json()) as ClerkUserSummary[];
  for (const user of users) {
    const deleteResponse = await fetch(
      `https://api.clerk.com/v1/users/${user.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      },
    );

    if (!deleteResponse.ok) {
      throw new Error(
        `Clerk delete user failed (${deleteResponse.status}) for ${user.id}`,
      );
    }
  }

  return null;
}
