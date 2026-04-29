import type { CurrentUser } from "@/types/user";

const demoUser: CurrentUser = {
  id: "demo-user",
  displayName: "Rabees",
  timezone: "America/Chicago",
};

export async function getCurrentUser(): Promise<CurrentUser> {
  return demoUser;
}
