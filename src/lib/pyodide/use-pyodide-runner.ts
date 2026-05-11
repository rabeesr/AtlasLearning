"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type {
  ChallengeTest,
  ChallengeTestResult,
  ChallengeRunOutcome,
} from "@/types/practice";

export type PyodideStatus = "loading" | "ready" | "running" | "error";

export interface UsePyodideRunner {
  status: PyodideStatus;
  progress: string | null;
  error: string | null;
  lastResults: ChallengeTestResult[] | null;
  stdout: string;
  traceback: string | null;
  run: (userCode: string, tests: ChallengeTest[], pythonPackages?: string[]) => Promise<ChallengeRunOutcome | null>;
}

type WorkerOutbound =
  | { type: "init-progress"; message: string }
  | { type: "ready" }
  | { type: "init-error"; message: string }
  | {
      type: "run-result";
      id: number;
      results: ChallengeTestResult[];
      stdout: string;
      traceback?: string;
    };

export function usePyodideRunner(): UsePyodideRunner {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<
    Map<number, (outcome: ChallengeRunOutcome) => void>
  >(new Map());
  const nextIdRef = useRef(1);

  const [status, setStatus] = useState<PyodideStatus>("loading");
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastResults, setLastResults] = useState<ChallengeTestResult[] | null>(null);
  const [stdout, setStdout] = useState<string>("");
  const [traceback, setTraceback] = useState<string | null>(null);

  useEffect(() => {
    let worker: Worker;
    try {
      worker = new Worker(
        new URL("./pyodide-worker.ts", import.meta.url),
        { type: "module" },
      );
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : String(err));
      return;
    }
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerOutbound>) => {
      const data = event.data;
      if (data.type === "init-progress") {
        setProgress(data.message);
      } else if (data.type === "ready") {
        setStatus("ready");
        setProgress(null);
      } else if (data.type === "init-error") {
        setStatus("error");
        setError(data.message);
      } else if (data.type === "run-result") {
        const cb = pendingRef.current.get(data.id);
        pendingRef.current.delete(data.id);
        const outcome: ChallengeRunOutcome = {
          results: data.results,
          stdout: data.stdout,
          traceback: data.traceback,
        };
        setLastResults(data.results);
        setStdout(data.stdout);
        setTraceback(data.traceback ?? null);
        setStatus("ready");
        if (cb) cb(outcome);
      }
    };

    worker.onerror = (event) => {
      setStatus("error");
      setError(event.message || "Worker crashed");
    };

    worker.postMessage({ type: "init" });

    const pending = pendingRef.current;
    return () => {
      worker.terminate();
      workerRef.current = null;
      pending.clear();
    };
  }, []);

  const run = useCallback<UsePyodideRunner["run"]>(
    async (userCode, tests, pythonPackages) => {
      const worker = workerRef.current;
      if (!worker) return null;
      const id = nextIdRef.current++;
      setStatus("running");
      setTraceback(null);
      return new Promise<ChallengeRunOutcome>((resolve) => {
        pendingRef.current.set(id, resolve);
        worker.postMessage({
          type: "run",
          id,
          userCode,
          tests,
          pythonPackages,
        });
      });
    },
    [],
  );

  return {
    status,
    progress,
    error,
    lastResults,
    stdout,
    traceback,
    run,
  };
}
