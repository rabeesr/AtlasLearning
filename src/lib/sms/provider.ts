import type { NotificationProvider } from "@/types/integrations";

export const stubNotificationProvider: NotificationProvider = {
  isConfigured() {
    return false;
  },
};
