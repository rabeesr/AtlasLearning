import { getServerSupabaseClient } from "@/lib/supabase/server-client";
import {
  getReviewAdminRpcClient,
  getReviewsRpcSecret,
} from "@/lib/reviews/review-admin-client";

export type RepetitionCadence = "daily" | "every-other-day" | "weekly";

export interface UserPreferences {
  review: {
    enabled: boolean;
    emailAddress: string;
    timezone: string;
    preferredSendTime: string;
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
  lastSentAt: string | null;
}

export interface ReviewPreferencesRow {
  user_id: string;
  reviews_enabled: boolean;
  email_address: string;
  timezone: string;
  preferred_send_time: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
  spaced_repetition_enabled: boolean;
  daily_target_minutes: number;
  cadence: RepetitionCadence;
  opt_in_topics: string[] | null;
  alerts_decay: boolean;
  alerts_streak: boolean;
  alerts_digest: boolean;
  last_sent_at: string | null;
}

export const defaultPreferences: UserPreferences = {
  review: {
    enabled: false,
    emailAddress: "",
    timezone: "America/Chicago",
    preferredSendTime: "09:00",
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
  },
  spacedRepetition: {
    enabled: false,
    dailyTargetMinutes: 15,
    cadence: "daily",
    optInTopics: "all",
  },
  alerts: { decayWarnings: true, streakReminders: false, weeklyDigest: true },
  lastSentAt: null,
};

export function rowToPreferences(row: Partial<ReviewPreferencesRow> | null): UserPreferences {
  return {
    review: {
      enabled: row?.reviews_enabled ?? defaultPreferences.review.enabled,
      emailAddress: row?.email_address ?? defaultPreferences.review.emailAddress,
      timezone: row?.timezone ?? defaultPreferences.review.timezone,
      preferredSendTime: row?.preferred_send_time ?? defaultPreferences.review.preferredSendTime,
      quietHoursStart: row?.quiet_hours_start ?? defaultPreferences.review.quietHoursStart,
      quietHoursEnd: row?.quiet_hours_end ?? defaultPreferences.review.quietHoursEnd,
    },
    spacedRepetition: {
      enabled:
        row?.spaced_repetition_enabled ?? defaultPreferences.spacedRepetition.enabled,
      dailyTargetMinutes:
        row?.daily_target_minutes ?? defaultPreferences.spacedRepetition.dailyTargetMinutes,
      cadence: row?.cadence ?? defaultPreferences.spacedRepetition.cadence,
      optInTopics: row?.opt_in_topics?.length ? row.opt_in_topics : "all",
    },
    alerts: {
      decayWarnings: row?.alerts_decay ?? defaultPreferences.alerts.decayWarnings,
      streakReminders: row?.alerts_streak ?? defaultPreferences.alerts.streakReminders,
      weeklyDigest: row?.alerts_digest ?? defaultPreferences.alerts.weeklyDigest,
    },
    lastSentAt: row?.last_sent_at ?? null,
  };
}

function preferencesToRow(userId: string, prefs: UserPreferences): ReviewPreferencesRow {
  return {
    user_id: userId,
    reviews_enabled: prefs.review.enabled,
    email_address: prefs.review.emailAddress,
    timezone: prefs.review.timezone,
    preferred_send_time: prefs.review.preferredSendTime,
    quiet_hours_start: prefs.review.quietHoursStart,
    quiet_hours_end: prefs.review.quietHoursEnd,
    spaced_repetition_enabled: prefs.spacedRepetition.enabled,
    daily_target_minutes: prefs.spacedRepetition.dailyTargetMinutes,
    cadence: prefs.spacedRepetition.cadence,
    opt_in_topics:
      prefs.spacedRepetition.optInTopics === "all" ? null : prefs.spacedRepetition.optInTopics,
    alerts_decay: prefs.alerts.decayWarnings,
    alerts_streak: prefs.alerts.streakReminders,
    alerts_digest: prefs.alerts.weeklyDigest,
    last_sent_at: prefs.lastSentAt,
  };
}

function mergeDefaults(
  prefs: UserPreferences,
  fallback?: { email?: string; timezone?: string },
): UserPreferences {
  return {
    ...prefs,
    review: {
      ...prefs.review,
      emailAddress: prefs.review.emailAddress || fallback?.email || "",
      timezone: prefs.review.timezone || fallback?.timezone || defaultPreferences.review.timezone,
    },
  };
}

export async function loadPreferences(
  userId: string,
  fallback?: { email?: string; timezone?: string },
): Promise<UserPreferences> {
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("review_preferences")
    .select(
      "user_id, reviews_enabled, email_address, timezone, preferred_send_time, quiet_hours_start, quiet_hours_end, spaced_repetition_enabled, daily_target_minutes, cadence, opt_in_topics, alerts_decay, alerts_streak, alerts_digest, last_sent_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[preferences] load failed:", error);
    return mergeDefaults(defaultPreferences, fallback);
  }

  return mergeDefaults(rowToPreferences((data ?? null) as Partial<ReviewPreferencesRow> | null), fallback);
}

export async function savePreferences(userId: string, prefs: UserPreferences): Promise<void> {
  if (!userId || userId === "demo-user") return;
  const supabase = await getServerSupabaseClient();
  const { error } = await supabase.from("review_preferences").upsert(
    {
      ...preferencesToRow(userId, prefs),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) {
    throw error;
  }
}

export async function listEnabledReviewPreferences(): Promise<ReviewPreferencesRow[]> {
  const supabase = getReviewAdminRpcClient();
  const { data, error } = await supabase.rpc("list_enabled_review_preferences", {
    p_secret: getReviewsRpcSecret(),
  });

  if (error) {
    console.error("[preferences] list enabled failed:", error);
    return [];
  }

  return (data ?? []) as ReviewPreferencesRow[];
}

export async function updateLastSentAt(userId: string, sentAtIso: string): Promise<void> {
  const supabase = getReviewAdminRpcClient();
  const { error } = await supabase.rpc("update_review_last_sent_at", {
    p_secret: getReviewsRpcSecret(),
    p_user_id: userId,
    p_sent_at: sentAtIso,
  });
  if (error) {
    console.error("[preferences] update last_sent_at failed:", error);
  }
}
