import { Resend, type WebhookEventPayload } from "resend";

import { getCurriculumData } from "@/lib/content/curriculum";
import { getQuizForTopic } from "@/lib/content/quiz-content";
import {
  buildLiveTopicProgressFromRows,
  type EngagementRow,
  type QuestionAttemptRow,
  type QuizAttemptRow,
} from "@/lib/progress/live-topic-progress";
import { TRACKED_TOPIC_SLUGS } from "@/lib/progress/tracked-topics";
import {
  getReviewAdminRpcClient,
  getReviewsRpcSecret,
} from "@/lib/reviews/review-admin-client";
import {
  listEnabledReviewPreferences,
  rowToPreferences,
  type ReviewPreferencesRow,
  updateLastSentAt,
} from "@/lib/user/preferences";
import type { QuizQuestion, QuestionResult } from "@/types/practice";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL;
const resendReplyDomain = process.env.RESEND_REPLY_DOMAIN;
const resendWebhookSecret = process.env.RESEND_WEBHOOK_SECRET;
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "";

interface TopicReviewStateRow {
  user_id: string;
  topic_slug: string;
  last_reviewed_at: string | null;
  last_result: QuestionResult | null;
  interval_days: number;
  next_review_at: string | null;
  last_prompted_at: string | null;
}

interface ReviewPromptRow {
  id: string;
  user_id: string;
  topic_slug: string;
  question_id: string;
  question_type: QuizQuestion["type"];
  sent_at: string;
  reply_address: string;
  prompt_status: "sent" | "answered";
}

interface ReviewProgressPayload {
  engagement: EngagementRow[];
  attempts: QuizAttemptRow[];
  questions: QuestionAttemptRow[];
}

function getResendClient() {
  if (!resendApiKey) throw new Error("Missing RESEND_API_KEY");
  return new Resend(resendApiKey);
}

function parseTimeParts(value: string): { hour: number; minute: number } {
  const [hourRaw = "0", minuteRaw = "0"] = value.split(":");
  return { hour: Number(hourRaw), minute: Number(minuteRaw) };
}

function cadenceDays(cadence: ReviewPreferencesRow["cadence"]): number {
  if (cadence === "weekly") return 7;
  if (cadence === "every-other-day") return 2;
  return 1;
}

function localDateParts(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const raw = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return {
    year: Number(raw.year),
    month: Number(raw.month),
    day: Number(raw.day),
    hour: Number(raw.hour),
    minute: Number(raw.minute),
  };
}

function daysBetweenLocalDates(now: Date, thenIso: string, timezone: string) {
  const nowParts = localDateParts(now, timezone);
  const thenParts = localDateParts(new Date(thenIso), timezone);
  const nowUtc = Date.UTC(nowParts.year, nowParts.month - 1, nowParts.day);
  const thenUtc = Date.UTC(thenParts.year, thenParts.month - 1, thenParts.day);
  return Math.floor((nowUtc - thenUtc) / 86_400_000);
}

function isInsideQuietHours(now: Date, timezone: string, start: string, end: string) {
  const current = localDateParts(now, timezone);
  const currentMinutes = current.hour * 60 + current.minute;
  const startTime = parseTimeParts(start);
  const endTime = parseTimeParts(end);
  const startMinutes = startTime.hour * 60 + startTime.minute;
  const endMinutes = endTime.hour * 60 + endTime.minute;

  if (startMinutes === endMinutes) return false;
  if (startMinutes < endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

export function isUserDueForReview(now: Date, row: ReviewPreferencesRow): boolean {
  const prefs = rowToPreferences(row);
  if (!prefs.review.enabled || !prefs.spacedRepetition.enabled || !prefs.review.emailAddress) {
    return false;
  }

  if (
    isInsideQuietHours(
      now,
      prefs.review.timezone,
      prefs.review.quietHoursStart,
      prefs.review.quietHoursEnd,
    )
  ) {
    return false;
  }

  const current = localDateParts(now, prefs.review.timezone);
  const preferred = parseTimeParts(prefs.review.preferredSendTime);
  const currentMinutes = current.hour * 60 + current.minute;
  const preferredMinutes = preferred.hour * 60 + preferred.minute;
  if (currentMinutes < preferredMinutes) return false;

  if (!row.last_sent_at) return true;
  return daysBetweenLocalDates(now, row.last_sent_at, prefs.review.timezone) >= cadenceDays(row.cadence);
}

function buildReplyAddress(promptId: string) {
  if (!resendReplyDomain) throw new Error("Missing RESEND_REPLY_DOMAIN");
  return `review+${promptId}@${resendReplyDomain}`;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractReplyToken(source: string, questionType: QuizQuestion["type"]): string | null {
  const meaningfulLine = source
    .split(/\r?\n/)
    .map((line) => line.replace(/^>+\s*/, "").trim())
    .find((line) => line && !/^on .+wrote:$/i.test(line));
  if (!meaningfulLine) return null;

  const upper = meaningfulLine.toUpperCase();
  const match =
    questionType === "multiple_choice"
      ? upper.match(/\b([ABCD])\b/)
      : upper.match(/\b([CPI])\b/);
  return match?.[1] ?? null;
}

function nextIntervalDays(previous: number, result: QuestionResult) {
  if (result === "correct") return Math.min(30, previous * 2);
  if (result === "partial") return Math.min(30, Math.ceil(previous * 1.5));
  return 1;
}

async function loadReviewState(userId: string) {
  const supabase = getReviewAdminRpcClient();
  const { data, error } = await supabase.rpc("get_user_review_state", {
    p_secret: getReviewsRpcSecret(),
    p_user_id: userId,
  });
  if (error) {
    console.error("[reviews] review state load failed:", error);
    return new Map<string, TopicReviewStateRow>();
  }
  return new Map<string, TopicReviewStateRow>(
    ((data ?? []) as TopicReviewStateRow[]).map((row) => [row.topic_slug, row]),
  );
}

async function chooseTopicForUser(userId: string, row: ReviewPreferencesRow) {
  const allowedTopics =
    row.opt_in_topics?.length && row.opt_in_topics.length > 0
      ? row.opt_in_topics.filter((topicSlug) => TRACKED_TOPIC_SLUGS.has(topicSlug))
      : Array.from(TRACKED_TOPIC_SLUGS);
  if (allowedTopics.length === 0) return null;

  const [progressRows, reviewState, curriculum] = await Promise.all([
    loadReviewProgress(userId),
    loadReviewState(userId),
    getCurriculumData(),
  ]);

  const topicNameBySlug = new Map(curriculum.topics.map((topic) => [topic.slug, topic.name]));
  const filteredProgress = progressRows.filter((row) => allowedTopics.includes(row.topicSlug));
  const dueTopics = filteredProgress
    .map((progress) => ({
      progress,
      state: reviewState.get(progress.topicSlug),
    }))
    .filter(({ state }) => state?.next_review_at && new Date(state.next_review_at) <= new Date())
    .sort((a, b) => {
      const aAt = a.state?.next_review_at ? new Date(a.state.next_review_at).getTime() : 0;
      const bAt = b.state?.next_review_at ? new Date(b.state.next_review_at).getTime() : 0;
      return aAt - bAt;
    });

  if (dueTopics.length > 0) {
    const topic = dueTopics[0].progress.topicSlug;
    return { topicSlug: topic, topicTitle: topicNameBySlug.get(topic) ?? topic };
  }

  const inProgress = filteredProgress
    .filter((progress) => progress.status === "in_progress")
    .sort((a, b) => a.proficiencyScore - b.proficiencyScore);
  if (inProgress.length === 0) return null;

  return {
    topicSlug: inProgress[0].topicSlug,
    topicTitle: topicNameBySlug.get(inProgress[0].topicSlug) ?? inProgress[0].topicSlug,
  };
}

async function chooseQuestion(userId: string, topicSlug: string) {
  const supabase = getReviewAdminRpcClient();
  const quiz = await getQuizForTopic(topicSlug);
  if (!quiz) return null;

  const { data, error } = await supabase.rpc("get_user_review_prompts", {
    p_secret: getReviewsRpcSecret(),
    p_user_id: userId,
    p_topic_slug: topicSlug,
  });
  if (error) {
    console.error("[reviews] prompt history load failed:", error);
  }

  const latestSentByQuestion = new Map<string, string>();
  for (const row of (data ?? []) as { question_id: string; sent_at: string }[]) {
    const existing = latestSentByQuestion.get(row.question_id);
    if (!existing || new Date(existing).getTime() < new Date(row.sent_at).getTime()) {
      latestSentByQuestion.set(row.question_id, row.sent_at);
    }
  }

  return [...quiz.items].sort((a, b) => {
    const aSent = latestSentByQuestion.get(a.id);
    const bSent = latestSentByQuestion.get(b.id);
    if (!aSent && !bSent) return 0;
    if (!aSent) return -1;
    if (!bSent) return 1;
    return new Date(aSent).getTime() - new Date(bSent).getTime();
  })[0];
}

function formatPromptEmail(topicTitle: string, question: QuizQuestion, topicSlug: string) {
  const intro = `<p style="margin:0 0 16px;">Today's review is from <strong>${topicTitle}</strong>.</p>`;
  const footerLink = appUrl
    ? `<p style="margin:20px 0 0;"><a href="${appUrl}/topics/${encodeURIComponent(
        topicSlug,
      )}/quizzes" style="color:#2563eb;">Open Atlas</a></p>`
    : "";

  if (question.type === "multiple_choice") {
    const choicesHtml = question.choices
      .map((choice, index) => `<li style="margin:0 0 8px;">${String.fromCharCode(65 + index)}) ${choice}</li>`)
      .join("");
    return {
      subject: `ATLAS Review: ${topicTitle}`,
      html: `${intro}<p style="margin:0 0 16px;">${question.prompt}</p><ol style="padding-left:20px; margin:0 0 16px;">${choicesHtml}</ol><p style="margin:0;">Reply with <strong>A</strong>, <strong>B</strong>, <strong>C</strong>, or <strong>D</strong>.</p>${footerLink}`,
      text: `ATLAS Review\n\n${topicTitle}\n\n${question.prompt}\n\n${question.choices
        .map((choice, index) => `${String.fromCharCode(65 + index)}) ${choice}`)
        .join("\n")}\n\nReply with A, B, C, or D.`,
    };
  }

  const rubric = question.rubric?.length
    ? `<ul style="padding-left:20px; margin:12px 0;">${question.rubric
        .map((item) => `<li style="margin:0 0 8px;">${item}</li>`)
        .join("")}</ul>`
    : "";
  return {
    subject: `ATLAS Review: ${topicTitle}`,
    html: `${intro}<p style="margin:0 0 16px;">${question.prompt}</p><p style="margin:16px 0 8px;"><strong>Model answer</strong></p><p style="margin:0 0 12px;">${question.answer}</p>${rubric}<p style="margin:16px 0 0;">Reply with <strong>C</strong> if you were correct, <strong>P</strong> if you were partially correct, or <strong>I</strong> if you were incorrect.</p>${footerLink}`,
    text: `ATLAS Review\n\n${topicTitle}\n\n${question.prompt}\n\nModel answer:\n${question.answer}\n\n${
      question.rubric?.length ? `${question.rubric.map((item) => `- ${item}`).join("\n")}\n\n` : ""
    }Reply with C if you were correct, P if you were partially correct, or I if you were incorrect.`,
  };
}

async function insertReviewPrompt(row: {
  id: string;
  userId: string;
  topicSlug: string;
  question: QuizQuestion;
  replyAddress: string;
  providerMessageId: string | null;
  sentAt: string;
}) {
  const supabase = getReviewAdminRpcClient();
  const { error } = await supabase.rpc("insert_review_prompt", {
    p_secret: getReviewsRpcSecret(),
    p_id: row.id,
    p_user_id: row.userId,
    p_topic_slug: row.topicSlug,
    p_question_id: row.question.id,
    p_question_type: row.question.type,
    p_reply_address: row.replyAddress,
    p_provider_message_id: row.providerMessageId,
    p_sent_at: row.sentAt,
  });
  if (error) {
    throw error;
  }
}

async function markPrompted(userId: string, topicSlug: string, sentAt: string) {
  const supabase = getReviewAdminRpcClient();
  const { error } = await supabase.rpc("mark_review_prompted", {
    p_secret: getReviewsRpcSecret(),
    p_user_id: userId,
    p_topic_slug: topicSlug,
    p_sent_at: sentAt,
  });
  if (error) {
    console.error("[reviews] mark prompted failed:", error);
  }
}

export async function sendDueReviewEmails(now = new Date()) {
  if (!resendFromEmail) throw new Error("Missing RESEND_FROM_EMAIL");

  const resend = getResendClient();
  const rows = await listEnabledReviewPreferences();
  const sent: { userId: string; topicSlug: string; questionId: string }[] = [];

  for (const row of rows) {
    if (!isUserDueForReview(now, row)) continue;

    const topic = await chooseTopicForUser(row.user_id, row);
    if (!topic) continue;
    const question = await chooseQuestion(row.user_id, topic.topicSlug);
    if (!question) continue;

    const promptId = crypto.randomUUID();
    const sentAt = now.toISOString();
    const replyAddress = buildReplyAddress(promptId);
    const email = formatPromptEmail(topic.topicTitle, question, topic.topicSlug);
    const response = await resend.emails.send({
      from: resendFromEmail,
      to: row.email_address,
      subject: email.subject,
      html: email.html,
      text: email.text,
      replyTo: replyAddress,
      tags: [
        { name: "prompt_id", value: promptId },
        { name: "topic_slug", value: topic.topicSlug },
      ],
    });

    if (response.error) {
      console.error("[reviews] resend send failed:", response.error);
      continue;
    }

    await insertReviewPrompt({
      id: promptId,
      userId: row.user_id,
      topicSlug: topic.topicSlug,
      question,
      replyAddress,
      providerMessageId: response.data?.id ?? null,
      sentAt,
    });
    await markPrompted(row.user_id, topic.topicSlug, sentAt);
    await updateLastSentAt(row.user_id, sentAt);

    sent.push({ userId: row.user_id, topicSlug: topic.topicSlug, questionId: question.id });
  }

  return { sentCount: sent.length, sent };
}

async function loadPrompt(promptId: string) {
  const supabase = getReviewAdminRpcClient();
  const { data, error } = await supabase.rpc("get_review_prompt", {
    p_secret: getReviewsRpcSecret(),
    p_id: promptId,
  });
  if (error) {
    console.error("[reviews] prompt load failed:", error);
    return null;
  }
  return ((data as ReviewPromptRow[] | null)?.[0] ?? null) as ReviewPromptRow | null;
}

function parsePromptIdFromRecipients(recipients: string[]) {
  for (const recipient of recipients) {
    const match = recipient.match(/review\+([a-f0-9-]+)@/i);
    if (match) return match[1];
  }
  return null;
}

async function updateReviewState(userId: string, topicSlug: string, result: QuestionResult, gradedAt: string, lastPromptedAt: string) {
  const reviewState = await loadReviewState(userId);
  const previousInterval = reviewState.get(topicSlug)?.interval_days ?? 1;
  const intervalDays = nextIntervalDays(previousInterval, result);
  const nextReviewAt = new Date(new Date(gradedAt).getTime() + intervalDays * 86_400_000).toISOString();

  const supabase = getReviewAdminRpcClient();
  const { error } = await supabase.rpc("upsert_review_state", {
    p_secret: getReviewsRpcSecret(),
    p_user_id: userId,
    p_topic_slug: topicSlug,
    p_last_reviewed_at: gradedAt,
    p_last_result: result,
    p_interval_days: intervalDays,
    p_next_review_at: nextReviewAt,
    p_last_prompted_at: lastPromptedAt,
    p_updated_at: gradedAt,
  });
  if (error) {
    console.error("[reviews] review state upsert failed:", error);
  }
}

async function recordQuizResult(
  prompt: ReviewPromptRow,
  result: QuestionResult,
  selectedChoice?: string,
) {
  const completedAt = new Date().toISOString();
  const supabase = getReviewAdminRpcClient();
  const { error } = await supabase.rpc("insert_review_quiz_result", {
    p_secret: getReviewsRpcSecret(),
    p_user_id: prompt.user_id,
    p_topic_slug: prompt.topic_slug,
    p_question_id: prompt.question_id,
    p_result: result,
    p_selected_choice: selectedChoice ?? null,
    p_completed_at: completedAt,
  });
  if (error) {
    console.error("[reviews] quiz result insert failed:", error);
  }
}

async function sendFeedbackEmail(to: string, topicSlug: string, question: QuizQuestion, result: QuestionResult) {
  if (!resendFromEmail) return;
  const resend = getResendClient();
  const topicTitle =
    (await getCurriculumData()).topics.find((topic) => topic.slug === topicSlug)?.name ?? topicSlug;

  const subject = `ATLAS Result: ${topicTitle}`;
  const explanation =
    question.type === "multiple_choice"
      ? question.explanation ?? `The correct answer was ${question.answer}.`
      : "Review logged.";
  const prefix =
    result === "correct"
      ? "Correct."
      : result === "partial"
        ? "Partially correct."
        : "Incorrect.";
  const response = await resend.emails.send({
    from: resendFromEmail,
    to,
    subject,
    text: `${prefix} ${explanation}`,
    html: `<p>${prefix}</p><p>${explanation}</p>`,
  });
  if (response.error) {
    console.error("[reviews] feedback send failed:", response.error);
  }
}

async function verifyWebhookPayload(payload: string, headers: Headers): Promise<WebhookEventPayload | null> {
  const resend = getResendClient();
  if (!resendWebhookSecret) {
    return JSON.parse(payload) as WebhookEventPayload;
  }

  return resend.webhooks.verify({
    payload,
    headers: {
      id: headers.get("svix-id") ?? "",
      timestamp: headers.get("svix-timestamp") ?? "",
      signature: headers.get("svix-signature") ?? "",
    },
    webhookSecret: resendWebhookSecret,
  });
}

export async function handleInboundReviewWebhook(request: Request) {
  const payload = await request.text();
  const event = await verifyWebhookPayload(payload, request.headers);
  if (!event || event.type !== "email.received") {
    return { status: 200, body: { ok: true, ignored: true } };
  }

  const recipients = event.data.to ?? [];
  const promptId = parsePromptIdFromRecipients(recipients);
  if (!promptId) return { status: 200, body: { ok: true, ignored: true } };

  const prompt = await loadPrompt(promptId);
  if (!prompt || prompt.prompt_status !== "sent") {
    return { status: 200, body: { ok: true, ignored: true } };
  }

  const resend = getResendClient();
  const received = await resend.emails.receiving.get(event.data.email_id);
  if (received.error || !received.data) {
    console.error("[reviews] receiving get failed:", received.error);
    return { status: 500, body: { ok: false } };
  }

  const quiz = await getQuizForTopic(prompt.topic_slug);
  const question = quiz?.items.find((item) => item.id === prompt.question_id);
  if (!question) return { status: 200, body: { ok: true, ignored: true } };

  const source = received.data.text ?? stripHtml(received.data.html ?? "");
  const token = extractReplyToken(source, question.type);
  if (!token) return { status: 200, body: { ok: true, ignored: true } };

  let result: QuestionResult;
  let selectedChoice: string | undefined;
  if (question.type === "multiple_choice") {
    const index = token.charCodeAt(0) - 65;
    selectedChoice = question.choices[index];
    if (!selectedChoice) return { status: 200, body: { ok: true, ignored: true } };
    result = selectedChoice === question.answer ? "correct" : "incorrect";
  } else {
    result = token === "C" ? "correct" : token === "P" ? "partial" : "incorrect";
  }

  const gradedAt = new Date().toISOString();
  const supabase = getReviewAdminRpcClient();
  const { error } = await supabase.rpc("mark_review_prompt_answered", {
    p_secret: getReviewsRpcSecret(),
    p_id: prompt.id,
    p_reply_body: source.slice(0, 1000),
    p_reply_result: result,
    p_graded_at: gradedAt,
  });
  if (error) {
    console.error("[reviews] prompt update failed:", error);
  }

  await recordQuizResult(prompt, result, selectedChoice);
  await updateReviewState(prompt.user_id, prompt.topic_slug, result, gradedAt, prompt.sent_at);

  const { data: feedbackAddress, error: feedbackError } = await supabase.rpc(
    "get_review_email_address",
    {
      p_secret: getReviewsRpcSecret(),
      p_user_id: prompt.user_id,
    },
  );
  if (feedbackError) {
    console.error("[reviews] feedback email load failed:", feedbackError);
  }
  if (feedbackAddress) {
    await sendFeedbackEmail(feedbackAddress, prompt.topic_slug, question, result);
  }

  return { status: 200, body: { ok: true, graded: true, result } };
}

async function loadReviewProgress(userId: string) {
  const supabase = getReviewAdminRpcClient();
  const { data, error } = await supabase.rpc("get_user_review_progress", {
    p_secret: getReviewsRpcSecret(),
    p_user_id: userId,
  });
  if (error) {
    console.error("[reviews] progress load failed:", error);
    return [];
  }

  const payload = (data ?? {
    engagement: [],
    attempts: [],
    questions: [],
  }) as ReviewProgressPayload;
  return buildLiveTopicProgressFromRows(
    userId,
    payload.engagement ?? [],
    payload.attempts ?? [],
    payload.questions ?? [],
  );
}
