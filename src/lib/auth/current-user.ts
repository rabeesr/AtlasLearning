import { auth, currentUser } from "@clerk/nextjs/server";

import type { CurrentUser } from "@/types/user";

const DEMO_USER: CurrentUser = {
  id: "demo-user",
  displayName: "Demo Explorer",
  timezone: "America/Chicago",
};

/**
 * Returns the currently signed-in user, or a demo placeholder if no session.
 * The demo user lets logged-out visitors continue to browse seed data with
 * the dashboard / topics views fully functional.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const { userId } = await auth();
  if (!userId) return DEMO_USER;

  const user = await currentUser();
  const displayName =
    user?.firstName ||
    user?.username ||
    user?.emailAddresses[0]?.emailAddress?.split("@")[0] ||
    "Explorer";

  return {
    id: userId,
    displayName,
    email: user?.emailAddresses[0]?.emailAddress,
    timezone: DEMO_USER.timezone,
  };
}

/** True when the request has a signed-in Clerk session. */
export async function isSignedInRequest(): Promise<boolean> {
  const { userId } = await auth();
  return Boolean(userId);
}
