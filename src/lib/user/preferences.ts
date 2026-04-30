import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type RepetitionCadence = "daily" | "every-other-day" | "weekly";

export interface UserPreferences {
  sms: {
    enabled: boolean;
    phoneNumber: string;
    quietHoursStart: string;
    quietHoursEnd: string;
  };
  spacedRepetition: {
    enabled: boolean;
    dailyTargetMinutes: number;
    cadence: RepetitionCadence;
    optInTopics: string[] | "all";
  };
  alerts: {
    decayWarnings: boolean;
    streakReminders: boolean;
    weeklyDigest: boolean;
  };
}

export const defaultPreferences: UserPreferences = {
  sms: { enabled: false, phoneNumber: "", quietHoursStart: "22:00", quietHoursEnd: "08:00" },
  spacedRepetition: {
    enabled: false,
    dailyTargetMinutes: 15,
    cadence: "daily",
    optInTopics: "all",
  },
  alerts: { decayWarnings: true, streakReminders: false, weeklyDigest: true },
};

const root = path.join(process.cwd(), "src", "data", "user");

function fileFor(userId: string) {
  const safe = userId.replace(/[^a-z0-9_-]/gi, "_");
  return path.join(root, `${safe}.json`);
}

export async function loadPreferences(userId: string): Promise<UserPreferences> {
  try {
    const raw = await readFile(fileFor(userId), "utf8");
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      sms: { ...defaultPreferences.sms, ...(parsed.sms ?? {}) },
      spacedRepetition: {
        ...defaultPreferences.spacedRepetition,
        ...(parsed.spacedRepetition ?? {}),
      },
      alerts: { ...defaultPreferences.alerts, ...(parsed.alerts ?? {}) },
    };
  } catch {
    return defaultPreferences;
  }
}

export async function savePreferences(userId: string, prefs: UserPreferences): Promise<void> {
  await mkdir(root, { recursive: true });
  await writeFile(fileFor(userId), JSON.stringify(prefs, null, 2), "utf8");
}
