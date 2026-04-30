import { revalidatePath } from "next/cache";

import { Card, SectionHeader } from "@/components/shared/ui";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getCurriculumData } from "@/lib/content/curriculum";
import {
  defaultPreferences,
  loadPreferences,
  savePreferences,
  type RepetitionCadence,
} from "@/lib/user/preferences";

export default async function SettingsPage() {
  const [user, prefs, curriculum] = await Promise.all([
    getCurrentUser(),
    loadPreferences("demo-user").then((p) => p ?? defaultPreferences),
    getCurriculumData(),
  ]);

  async function updatePreferencesAction(formData: FormData) {
    "use server";
    const optInRaw = formData.get("opt_in_topics");
    const optInTopics =
      typeof optInRaw === "string" && optInRaw === "selected"
        ? formData.getAll("topic_slug").map(String)
        : "all";

    const next = {
      sms: {
        enabled: formData.get("sms_enabled") === "on",
        phoneNumber: String(formData.get("sms_phone") ?? ""),
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
    };
    await savePreferences("demo-user", next);
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
        title="Notifications & Spaced Repetition"
        description={`Configure SMS reminders, alert preferences, and the spaced-repetition cadence for ${user.displayName}.`}
      />

      <form action={updatePreferencesAction} className="space-y-6">
        <Card>
          <h2 className="text-lg font-semibold text-[var(--text)]">SMS notifications</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Get short SMS prompts for spaced-repetition quizzes and decay alerts.
            <span className="ml-1 italic">SMS sending is not wired in this build — preferences are saved locally.</span>
          </p>
          <div className="mt-4 space-y-4">
            <Label>
              <input
                type="checkbox"
                name="sms_enabled"
                defaultChecked={prefs.sms.enabled}
                className="size-4"
              />
              <span>Enable SMS notifications</span>
            </Label>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Phone number">
                <input
                  type="tel"
                  name="sms_phone"
                  placeholder="+1 555 555 5555"
                  defaultValue={prefs.sms.phoneNumber}
                  className={inputClass}
                />
              </Field>
              <Field label="Quiet hours start">
                <input
                  type="time"
                  name="sms_quiet_start"
                  defaultValue={prefs.sms.quietHoursStart}
                  className={inputClass}
                />
              </Field>
              <Field label="Quiet hours end">
                <input
                  type="time"
                  name="sms_quiet_end"
                  defaultValue={prefs.sms.quietHoursEnd}
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
