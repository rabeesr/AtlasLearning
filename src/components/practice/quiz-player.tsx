"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge, Button, Card } from "@/components/shared/ui";
import { useReflection } from "@/components/learn/reflection-context";
import { useQuizTracker } from "@/lib/practice/quiz-tracker";
import type {
  Confidence,
  MultipleChoiceQuestion,
  Quiz,
  QuestionAttempt,
  QuestionResult,
  QuizQuestion,
} from "@/types/practice";

type Phase = "answering" | "revealed";

// ALPHA 1.3 — confidence picker presented before reveal/submit.
const CONFIDENCE_OPTIONS: { value: Confidence; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

function ConfidencePicker({
  value,
  onChange,
}: {
  value: Confidence | null;
  onChange: (next: Confidence) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-[var(--tile)] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
        How confident are you?
      </p>
      <div className="flex flex-wrap gap-2">
        {CONFIDENCE_OPTIONS.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#0066CC] text-white"
                  : "bg-white text-[var(--ink-muted)] hover:bg-[var(--tile-deep)]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const SELF_GRADE_OPTIONS: { value: QuestionResult; label: string; tone: string }[] = [
  { value: "correct", label: "I got it right", tone: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
  { value: "partial", label: "Partial / close", tone: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
  { value: "incorrect", label: "I got it wrong", tone: "bg-rose-50 text-rose-700 hover:bg-rose-100" },
];

export function QuizPlayer({
  quiz,
  topicTitle,
  // ALPHA 1.2 — when embedded inside a mixed session, the runner manages
  // navigation. We hide the summary screen and call `onSessionItemComplete`
  // once per question with its result.
  mode = "standalone",
  onSessionItemComplete,
}: {
  quiz: Quiz;
  topicTitle: string;
  mode?: "standalone" | "session";
  onSessionItemComplete?: (result: QuestionResult) => void;
}) {
  const tracker = useQuizTracker();
  const { trigger: triggerReflection } = useReflection();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("answering");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [perQuestion, setPerQuestion] = useState<Record<string, QuestionAttempt>>({});
  const [done, setDone] = useState(false);
  // ALPHA 1.3 — confidence is required before reveal/submit.
  const [confidence, setConfidence] = useState<Confidence | null>(null);

  useEffect(() => {
    setAttemptId(tracker.startAttempt(quiz.topicSlug));
    // Intentionally start a fresh attempt on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.topicSlug]);

  const question: QuizQuestion | undefined = quiz.items[index];
  const total = quiz.items.length;

  const recordResult = (result: QuestionResult, choice?: string) => {
    if (!attemptId || !question) return;
    const attempt: QuestionAttempt = {
      questionId: question.id,
      result,
      selectedChoice: choice,
      // ALPHA 1.3 — persisted alongside the result.
      confidence: confidence ?? undefined,
    };
    setPerQuestion((prev) => ({ ...prev, [question.id]: attempt }));
    tracker.recordQuestion(attemptId, attempt);
  };

  const submitMultipleChoice = () => {
    if (!question || question.type !== "multiple_choice" || selectedChoice === null) return;
    if (!confidence) return; // ALPHA 1.3 — required before submit.
    const correct = selectedChoice === question.answer;
    const result: QuestionResult = correct ? "correct" : "incorrect";
    recordResult(result, selectedChoice);
    setPhase("revealed");
    if (mode === "session" && onSessionItemComplete) {
      onSessionItemComplete(result);
    }
  };

  const submitSelfGrade = (grade: QuestionResult) => {
    if (!attemptId || !question) return;
    const attempt: QuestionAttempt = {
      questionId: question.id,
      result: grade,
      confidence: confidence ?? undefined,
    };
    const nextPerQuestion = { ...perQuestion, [question.id]: attempt };
    setPerQuestion(nextPerQuestion);
    tracker.recordQuestion(attemptId, attempt);
    if (mode === "session" && onSessionItemComplete) {
      onSessionItemComplete(grade);
      return;
    }

    if (index + 1 >= total) {
      tracker.completeAttempt(attemptId);
      setDone(true);
      triggerReflection({ kind: "quiz", topicSlug: quiz.topicSlug });
      return;
    }
    setIndex((i) => i + 1);
    setPhase("answering");
    setSelectedChoice(null);
    setConfidence(null);
  };

  const reveal = () => {
    if (!question) return;
    if (!confidence) return; // ALPHA 1.3 — required before reveal.
    if (!perQuestion[question.id]) recordResult("skipped");
    setPhase("revealed");
  };

  const next = () => {
    if (!attemptId) return;
    if (mode === "session" && onSessionItemComplete) {
      // For multiple-choice: result was already reported on submit. For
      // self-graded MC there's no path here (handled in submitSelfGrade).
      // For free-form, "Next" without grading signals incorrect.
      const recorded = perQuestion[question?.id ?? ""];
      onSessionItemComplete(recorded?.result ?? "skipped");
      return;
    }
    if (index + 1 >= total) {
      tracker.completeAttempt(attemptId);
      setDone(true);
      triggerReflection({ kind: "quiz", topicSlug: quiz.topicSlug });
      return;
    }
    setIndex((i) => i + 1);
    setPhase("answering");
    setSelectedChoice(null);
    setConfidence(null);
  };

  const restart = () => {
    if (!attemptId) return;
    tracker.resetTopic(quiz.topicSlug);
    const fresh = tracker.startAttempt(quiz.topicSlug);
    setAttemptId(fresh);
    setIndex(0);
    setPhase("answering");
    setSelectedChoice(null);
    setPerQuestion({});
    setDone(false);
  };

  if (done) {
    return (
      <QuizSummary
        quiz={quiz}
        topicTitle={topicTitle}
        perQuestion={perQuestion}
        onRestart={restart}
      />
    );
  }

  if (!question) return null;

  const recorded = perQuestion[question.id];

  return (
    <div className="flex flex-col gap-6">
      <ProgressHeader index={index} total={total} topicTitle={topicTitle} />

      <Card interactive={false} className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <Badge>Q{index + 1}</Badge>
          <Badge>{question.difficulty}</Badge>
          <Badge>
            {question.type === "multiple_choice" ? "auto-graded" : "self-graded"}
          </Badge>
        </div>

        <p className="text-[17px] leading-[1.65] text-[var(--ink)]">{question.prompt}</p>

        {question.type === "multiple_choice" ? (
          <MultipleChoiceBody
            question={question}
            phase={phase}
            selected={selectedChoice}
            recordedChoice={recorded?.selectedChoice}
            onSelect={setSelectedChoice}
          />
        ) : (
          <FreeFormBody question={question} phase={phase} />
        )}

        {/* ALPHA 1.3 — confidence picker, required before reveal/submit. */}
        {phase === "answering" ? (
          <ConfidencePicker value={confidence} onChange={setConfidence} />
        ) : null}

        <Controls
          phase={phase}
          questionType={question.type}
          canSubmit={selectedChoice !== null && confidence !== null}
          canReveal={confidence !== null}
          onSubmitMC={submitMultipleChoice}
          onReveal={reveal}
          onSelfGrade={submitSelfGrade}
          onNext={next}
          isLast={mode === "session" ? true : index + 1 === total}
        />
      </Card>
    </div>
  );
}

function ProgressHeader({
  index,
  total,
  topicTitle,
}: {
  index: number;
  total: number;
  topicTitle: string;
}) {
  const pct = Math.round((index / total) * 100);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[13px] text-[var(--ink-muted)]">
        <span>{topicTitle}</span>
        <span>
          {index + 1} of {total}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--tile)]">
        <div
          className="h-full rounded-full bg-[var(--ink)] transition-all duration-300"
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>
    </div>
  );
}

function MultipleChoiceBody({
  question,
  phase,
  selected,
  recordedChoice,
  onSelect,
}: {
  question: MultipleChoiceQuestion;
  phase: Phase;
  selected: string | null;
  recordedChoice: string | undefined;
  onSelect: (choice: string) => void;
}) {
  const revealed = phase === "revealed";
  const chosen = revealed ? recordedChoice ?? selected : selected;

  return (
    <div className="flex flex-col gap-2">
      {question.choices.map((choice, i) => {
        const isChosen = choice === chosen;
        const isCorrect = choice === question.answer;
        let tone =
          "border-[var(--border)] bg-white hover:border-[var(--border-strong)] hover:bg-[var(--tile)]";
        if (revealed) {
          if (isCorrect) {
            tone = "border-emerald-300 bg-emerald-50 text-emerald-900";
          } else if (isChosen) {
            tone = "border-rose-300 bg-rose-50 text-rose-900";
          } else {
            tone = "border-[var(--border)] bg-white opacity-70";
          }
        } else if (isChosen) {
          tone = "border-[var(--ink)] bg-[var(--tile)]";
        }
        return (
          <button
            key={i}
            type="button"
            disabled={revealed}
            onClick={() => onSelect(choice)}
            className={`flex items-start gap-3 rounded-xl border p-4 text-left text-[15px] leading-6 transition-all duration-150 ${tone} ${
              revealed ? "cursor-default" : "cursor-pointer"
            }`}
          >
            <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-current text-[12px] font-semibold">
              {String.fromCharCode(65 + i)}
            </span>
            <span className="flex-1">{choice}</span>
          </button>
        );
      })}

      {revealed && question.explanation ? (
        <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--tile)] p-4 text-[14px] leading-6 text-[var(--ink-muted)]">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">
            Why
          </p>
          {question.explanation}
        </div>
      ) : null}
    </div>
  );
}

function FreeFormBody({ question, phase }: { question: QuizQuestion; phase: Phase }) {
  if (phase === "answering") {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--tile)] p-4 text-[13px] leading-6 text-[var(--ink-muted)]">
        Think it through, write your answer on paper or in your head, then click <span className="font-semibold text-[var(--ink)]">Show answer</span> to compare.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-[14px] leading-6 text-emerald-900">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-700">
          Model answer
        </p>
        <p className="whitespace-pre-wrap">{question.answer}</p>
      </div>
      {question.rubric && question.rubric.length > 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-white p-4 text-[14px] leading-6 text-[var(--ink-muted)]">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">
            Rubric
          </p>
          <ul className="list-inside list-disc space-y-1">
            {question.rubric.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Controls({
  phase,
  questionType,
  canSubmit,
  canReveal,
  onSubmitMC,
  onReveal,
  onSelfGrade,
  onNext,
  isLast,
}: {
  phase: Phase;
  questionType: QuizQuestion["type"];
  canSubmit: boolean;
  canReveal: boolean;
  onSubmitMC: () => void;
  onReveal: () => void;
  onSelfGrade: (g: QuestionResult) => void;
  onNext: () => void;
  isLast: boolean;
}) {
  if (phase === "answering") {
    if (questionType === "multiple_choice") {
      return (
        <div className="flex justify-end">
          <Button onClick={onSubmitMC} variant={canSubmit ? "primary" : "secondary"}>
            Submit
          </Button>
        </div>
      );
    }
    return (
      <div className="flex justify-end">
        <Button
          onClick={onReveal}
          variant={canReveal ? "primary" : "secondary"}
        >
          Show answer
        </Button>
      </div>
    );
  }

  // revealed
  if (questionType === "multiple_choice") {
    return (
      <div className="flex justify-end">
        <Button onClick={onNext}>{isLast ? "Finish" : "Next question"}</Button>
      </div>
    );
  }
  // self-grade controls for short_answer / code
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {SELF_GRADE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelfGrade(opt.value)}
            className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${opt.tone}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <Button onClick={onNext} variant="ghost">
        {isLast ? "Finish without grading" : "Next without grading"}
      </Button>
    </div>
  );
}

function QuizSummary({
  quiz,
  topicTitle,
  perQuestion,
  onRestart,
}: {
  quiz: Quiz;
  topicTitle: string;
  perQuestion: Record<string, QuestionAttempt>;
  onRestart: () => void;
}) {
  const counts = useMemo(() => {
    const c = { correct: 0, partial: 0, incorrect: 0, skipped: 0 };
    for (const q of quiz.items) {
      const a = perQuestion[q.id];
      if (!a) c.skipped += 1;
      else c[a.result] += 1;
    }
    return c;
  }, [quiz, perQuestion]);

  const total = quiz.items.length;
  const score = counts.correct + counts.partial * 0.5;
  const pct = Math.round((score / total) * 100);

  return (
    <div className="flex flex-col gap-6">
      <Card interactive={false} className="flex flex-col gap-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">
            Quiz complete
          </p>
          <h2 className="mt-2 text-[28px] font-semibold leading-tight text-[var(--ink)]">
            {topicTitle}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryStat label="Score" value={`${pct}%`} accent />
          <SummaryStat label="Correct" value={counts.correct} />
          <SummaryStat label="Partial" value={counts.partial} />
          <SummaryStat
            label={counts.skipped > 0 ? "Wrong / skipped" : "Wrong"}
            value={counts.incorrect + counts.skipped}
          />
        </div>

        <p className="text-[14px] leading-6 text-[var(--ink-muted)]">
          In-session results only — progress will persist once Supabase is wired up.
        </p>
      </Card>

      <Card interactive={false} className="flex flex-col gap-3">
        <h3 className="text-[15px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
          Question breakdown
        </h3>
        <ol className="flex flex-col gap-2">
          {quiz.items.map((q, i) => {
            const a = perQuestion[q.id];
            const result = a?.result ?? "skipped";
            return (
              <li
                key={q.id}
                className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-white p-3"
              >
                <ResultPill result={result} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-[var(--ink-muted)]">Q{i + 1}</p>
                  <p className="text-[14px] leading-6 text-[var(--ink)]">{q.prompt}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      <div className="flex gap-3">
        <Button onClick={onRestart}>Retake quiz</Button>
        <Button href={`/topics/${quiz.topicSlug}/learn`} variant="secondary">
          Back to topic
        </Button>
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--border)] bg-white"
      }`}
    >
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.32em] ${
          accent ? "text-white/70" : "text-[var(--ink-muted)]"
        }`}
      >
        {label}
      </p>
      <p className={`mt-1 text-[24px] font-semibold ${accent ? "text-white" : "text-[var(--ink)]"}`}>
        {value}
      </p>
    </div>
  );
}

function ResultPill({ result }: { result: QuestionResult }) {
  const map: Record<QuestionResult, { label: string; classes: string }> = {
    correct: { label: "Right", classes: "bg-emerald-100 text-emerald-700" },
    partial: { label: "Partial", classes: "bg-amber-100 text-amber-700" },
    incorrect: { label: "Wrong", classes: "bg-rose-100 text-rose-700" },
    skipped: { label: "Skipped", classes: "bg-[var(--tile)] text-[var(--ink-muted)]" },
  };
  const m = map[result];
  return (
    <span
      className={`inline-flex h-6 min-w-[64px] flex-none items-center justify-center rounded-full px-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${m.classes}`}
    >
      {m.label}
    </span>
  );
}
