import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { Card, SectionHeader } from "@/components/shared/ui";
import { getCurrentUser, isSignedInRequest } from "@/lib/auth/current-user";
import { getCurriculumData } from "@/lib/content/curriculum";
import {
  defaultPreferences,
  loadPreferences,
  savePreferences,
  type RepetitionCadence,
} from "@/lib/user/preferences";

export default async function SettingsPage() {
  const [user, signedIn, curriculum] = await Promise.all([
    getCurrentUser(),
    isSignedInRequest(),
    getCurriculumData(),
  ]);
  const prefs =
    (await loadPreferences(user.id, { email: user.email, timezone: user.timezone })) ??
    defaultPreferences;
  const timezoneOptions =
    typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [user.timezone];

  async function updatePreferencesAction(formData: FormData) {
    "use server";
    const optInRaw = formData.get("opt_in_topics");
    const optInTopics =
      typeof optInRaw === "string" && optInRaw === "selected"
        ? formData.getAll("topic_slug").map(String)
        : "all";

    const next = {
      review: {
        enabled: formData.get("review_enabled") === "on",
        emailAddress: String(formData.get("review_email") ?? "").trim(),
        timezone: String(formData.get("review_timezone") ?? user.timezone),
        preferredSendTime: String(formData.get("review_send_time") ?? "09:00"),
        quietHoursStart: String(formData.get("sms_quiet_start") ?? "22:00"),
        quietHoursEnd: String(formData.get("sms_quiet_end") ?? "08:00"),
      },
      spacedRepetition: {
        enabled: formData.get("sr_enabled") === "on",
        dailyTargetMinutes: Number(formData.get("sr_daily_minutes") ?? 15),
        cadence: (formData.get("sr_cadence") ?? "daily") as RepetitionCadence,
        optInTopics: optInTopics as string[] | "all",
      },
      alerts: {
        decayWarnings: formData.get("alerts_decay") === "on",
        streakReminders: formData.get("alerts_streak") === "on",
        weeklyDigest: formData.get("alerts_digest") === "on",
      },
      lastSentAt: prefs.lastSentAt,
    };
    await savePreferences(user.id, next);
    revalidatePath("/settings");
  }

  const topLevelTopics = curriculum.topics.filter((t) => t.parentSlug === null);
  const selectedSet = new Set(
    Array.isArray(prefs.spacedRepetition.optInTopics) ? prefs.spacedRepetition.optInTopics : [],
  );
  const optInMode: "all" | "selected" =
    prefs.spacedRepetition.optInTopics === "all" ? "all" : "selected";

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Settings"
        title="Account & preferences"
        description={
          signedIn
            ? `Manage your profile, notifications, and spaced-repetition cadence.`
            : `Sign in to persist your progress, quiz attempts, and learning checklists across devices.`
        }
      />

      <Card>
        <h2 className="text-lg font-semibold text-[var(--text)]">Profile</h2>
        {signedIn ? (
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-[var(--text-muted)]">Signed in as</p>
              <p className="text-base font-medium text-[var(--text)]">{user.displayName}</p>
              {user.email ? (
                <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
              ) : null}
            </div>
            <SignOutButton>
              <button
                type="button"
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--tile)]"
              >
                Sign out
              </button>
            </SignOutButton>
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--text-muted)]">
              You&apos;re browsing as a guest. Sign in to save objective check-offs, quiz history,
              and challenge / project completion to your account.
            </p>
            <SignInButton mode="modal">
              <button
                type="button"
                className="inline-flex h-9 items-center rounded-full bg-[var(--ink)] px-4 text-sm font-medium text-white transition-colors hover:bg-black"
              >
                Sign in
              </button>
            </SignInButton>
          </div>
        )}
      </Card>

      {signedIn ? (
      <form action={updatePreferencesAction} className="space-y-6">
        <Card>
          <h2 className="text-lg font-semibold text-[var(--text)]">Daily review emails</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Get one spaced-repetition review by email and reply inline to log the result.
          </p>
          <div className="mt-4 space-y-4">
            <Label>
              <input
                type="checkbox"
                name="review_enabled"
                defaultChecked={prefs.review.enabled}
                className="size-4"
              />
              <span>Enable daily review emails</span>
            </Label>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Destination email">
                <input
                  type="email"
                  name="review_email"
                  placeholder="you@example.com"
                  defaultValue={prefs.review.emailAddress}
                  className={inputClass}
                />
              </Field>
              <Field label="Preferred send time">
                <input
                  type="time"
                  name="review_send_time"
                  defaultValue={prefs.review.preferredSendTime}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Timezone">
                <select
                  name="review_timezone"
                  defaultValue={prefs.review.timezone}
                  className={inputClass}
                >
                  {timezoneOptions.map((timezone) => (
                    <option key={timezone} value={timezone}>
                      {timezone}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Quiet hours start">
                <input
                  type="time"
                  name="sms_quiet_start"
                  defaultValue={prefs.review.quietHoursStart}
                  className={inputClass}
                />
              </Field>
              <Field label="Quiet hours end">
                <input
                  type="time"
                  name="sms_quiet_end"
                  defaultValue={prefs.review.quietHoursEnd}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[var(--text)]">Spaced repetition</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Schedule quiz reviews to lock in retention before topics decay.
          </p>
          <div className="mt-4 space-y-4">
            <Label>
              <input
                type="checkbox"
                name="sr_enabled"
                defaultChecked={prefs.spacedRepetition.enabled}
                className="size-4"
              />
              <span>Enable spaced repetition</span>
            </Label>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Daily target (minutes)">
                <input
                  type="number"
                  name="sr_daily_minutes"
                  min={5}
                  max={120}
                  step={5}
                  defaultValue={prefs.spacedRepetition.dailyTargetMinutes}
                  className={inputClass}
                />
              </Field>
              <Field label="Cadence">
                <select
                  name="sr_cadence"
                  defaultValue={prefs.spacedRepetition.cadence}
                  className={inputClass}
                >
                  <option value="daily">Daily</option>
                  <option value="every-other-day">Every other day</option>
                  <option value="weekly">Weekly</option>
                </select>
              </Field>
            </div>
            <Field label="Topics to include">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="opt_in_topics"
                    value="all"
                    defaultChecked={optInMode === "all"}
                  />
                  All topics
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="opt_in_topics"
                    value="selected"
                    defaultChecked={optInMode === "selected"}
                  />
                  Selected topics only
                </label>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {topLevelTopics.map((topic) => (
                    <label
                      key={topic.slug}
                      className="flex items-center gap-2 rounded-md border border-[var(--border)] px-2 py-1.5 text-xs text-[var(--text-muted)]"
                    >
                      <input
                        type="checkbox"
                        name="topic_slug"
                        value={topic.slug}
                        defaultChecked={selectedSet.has(topic.slug)}
                        className="size-3.5"
                      />
                      <span className="truncate text-[var(--text)]">{topic.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[var(--text)]">Alerts</h2>
          <div className="mt-4 space-y-3">
            <Label>
              <input
                type="checkbox"
                name="alerts_decay"
                defaultChecked={prefs.alerts.decayWarnings}
                className="size-4"
              />
              <span>Decay warnings — notify me when proficiency on a topic starts to slip.</span>
            </Label>
            <Label>
              <input
                type="checkbox"
                name="alerts_streak"
                defaultChecked={prefs.alerts.streakReminders}
                className="size-4"
              />
              <span>Streak reminders — keep me on a daily streak.</span>
            </Label>
            <Label>
              <input
                type="checkbox"
                name="alerts_digest"
                defaultChecked={prefs.alerts.weeklyDigest}
                className="size-4"
              />
              <span>Weekly digest — summarize the past week of progress.</span>
            </Label>
          </div>
        </Card>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--accent)] transition hover:bg-[color-mix(in_srgb,var(--accent)_22%,transparent)]"
          >
            Save preferences
          </button>
        </div>
      </form>
      ) : (
        <Card>
          <h2 className="text-lg font-semibold text-[var(--text)]">Notification preferences</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Available after sign-in.
          </p>
        </Card>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--border)] bg-[var(--panel-muted)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">{label}</span>
      {children}
    </label>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="flex items-center gap-3 text-sm text-[var(--text)]">{children}</label>;
}
