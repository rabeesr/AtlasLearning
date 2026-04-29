import type { AIProvider } from "@/types/integrations";

export const stubAIProvider: AIProvider = {
  isConfigured() {
    return false;
  },
};
