"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, Zap, Clock, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/*
  Visualizes the core difference:
  - Sync (def): Request 1 finishes, THEN Request 2 starts, THEN Request 3
  - Async (async def): All 3 start together, await overlaps, all finish around same time

  Each request simulates: receive → await DB (I/O) → process → respond
*/

interface ReqState {
  phase: "waiting" | "running" | "io-wait" | "processing" | "done";
  progress: number;
}

const LABELS = ["GET /users", "GET /items", "GET /orders"];
const IO_LABEL = "await db.fetch()";

const COLORS = {
  sync: ["#f87171", "#fb923c", "#fbbf24"],
  async: ["#34d399", "#2dd4bf", "#22d3ee"],
};

// Timings in seconds
const IO_DURATION = 1.5;
const PROCESS_DURATION = 0.4;
const REQ_TOTAL = IO_DURATION + PROCESS_DURATION;

export function SyncAsyncRace() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [syncStates, setSyncStates] = useState<ReqState[]>([
    { phase: "waiting", progress: 0 },
    { phase: "waiting", progress: 0 },
    { phase: "waiting", progress: 0 },
  ]);
  const [asyncStates, setAsyncStates] = useState<ReqState[]>([
    { phase: "waiting", progress: 0 },
    { phase: "waiting", progress: 0 },
    { phase: "waiting", progress: 0 },
  ]);
  const [syncDone, setSyncDone] = useState(false);
  const [asyncDone, setAsyncDone] = useState(false);
  const rafRef = useRef<number>(0);
  const startRef = useRef(0);

  const totalSyncTime = REQ_TOTAL * 3; // sequential
  const totalAsyncTime = REQ_TOTAL; // concurrent
  const CYCLE_END = totalSyncTime + 1.5;

  const computeStates = useCallback((t: number) => {
    // Sync: sequential — each starts after previous ends
    const newSync: ReqState[] = [0, 1, 2].map((i) => {
      const start = i * REQ_TOTAL;
      const rel = t - start;
      if (rel < 0) return { phase: "waiting" as const, progress: 0 };
      if (rel < IO_DURATION) return { phase: "io-wait" as const, progress: rel / IO_DURATION };
      if (rel < REQ_TOTAL) return { phase: "processing" as const, progress: (rel - IO_DURATION) / PROCESS_DURATION };
      return { phase: "done" as const, progress: 1 };
    });

    // Async: all start at t=0, I/O overlaps
    const newAsync: ReqState[] = [0, 1, 2].map(() => {
      if (t < 0) return { phase: "waiting" as const, progress: 0 };
      if (t < IO_DURATION) return { phase: "io-wait" as const, progress: t / IO_DURATION };
      if (t < REQ_TOTAL) return { phase: "processing" as const, progress: (t - IO_DURATION) / PROCESS_DURATION };
      return { phase: "done" as const, progress: 1 };
    });

    setSyncStates(newSync);
    setAsyncStates(newAsync);
    setSyncDone(newSync.every((s) => s.phase === "done"));
    setAsyncDone(newAsync.every((s) => s.phase === "done"));
  }, []);

  const start = useCallback(() => {
    setSyncDone(false);
    setAsyncDone(false);
    setElapsed(0);
    startRef.current = performance.now();
    setRunning(true);
  }, []);

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
    setElapsed(0);
    setSyncDone(false);
    setAsyncDone(false);
    setSyncStates([0, 1, 2].map(() => ({ phase: "waiting", progress: 0 })));
    setAsyncStates([0, 1, 2].map(() => ({ phase: "waiting", progress: 0 })));
  }, []);

  useEffect(() => {
    if (!running) return;
    const tick = (now: number) => {
      const t = (now - startRef.current) / 1000;
      setElapsed(t);
      computeStates(t);
      if (t < CYCLE_END) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setRunning(false);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, computeStates, CYCLE_END]);

  // Auto-start
  useEffect(() => {
    const id = setTimeout(start, 600);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className={cn("size-2 rounded-full", running ? "bg-indigo-400 animate-pulse" : "bg-muted-foreground/30")} />
          <span className="text-sm font-semibold tracking-wide">Sync vs Async — The Race</span>
        </div>
        <button onClick={running ? reset : start} className="text-muted-foreground/50 hover:text-foreground transition-colors p-1 cursor-pointer">
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      <div className="px-5 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* ===== SYNC SIDE ===== */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="size-4 text-red-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-red-400">Synchronous</span>
              <code className="text-[11px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-mono ml-auto">def</code>
            </div>

            <div className="space-y-2.5">
              {LABELS.map((label, i) => {
                const s = syncStates[i];
                const color = COLORS.sync[i];
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-muted-foreground/60">{label}</span>
                      <span className="text-[10px] font-mono" style={{ color: s.phase === "done" ? "#10b981" : color }}>
                        {s.phase === "waiting" && "queued"}
                        {s.phase === "io-wait" && IO_LABEL}
                        {s.phase === "processing" && "processing"}
                        {s.phase === "done" && "200 OK"}
                      </span>
                    </div>
                    <div className="relative h-7 rounded-lg bg-muted/30 border border-border/20 overflow-hidden">
                      {/* IO wait segment */}
                      {(s.phase === "io-wait" || s.phase === "processing" || s.phase === "done") && (
                        <motion.div
                          className="absolute inset-y-0 left-0 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${color}20`, width: `${(IO_DURATION / REQ_TOTAL) * 100}%` }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className="text-[8px] font-mono opacity-50" style={{ color }}>I/O</span>
                        </motion.div>
                      )}
                      {/* Processing segment */}
                      {(s.phase === "processing" || s.phase === "done") && (
                        <motion.div
                          className="absolute inset-y-0 rounded-r-lg flex items-center justify-center"
                          style={{
                            backgroundColor: `${color}35`,
                            left: `${(IO_DURATION / REQ_TOTAL) * 100}%`,
                            width: `${(PROCESS_DURATION / REQ_TOTAL) * 100}%`,
                          }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: s.phase === "done" ? 1 : s.progress }}
                          transition={{ duration: 0.1 }}
                        />
                      )}
                      {/* Status icons */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {s.phase === "io-wait" && (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                            <Loader2 className="size-3.5" style={{ color }} />
                          </motion.div>
                        )}
                        {s.phase === "done" && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                            <Check className="size-3.5 text-emerald-400" />
                          </motion.div>
                        )}
                      </div>
                      {/* Waiting overlay */}
                      {s.phase === "waiting" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.span
                            className="text-[9px] font-mono text-muted-foreground/30"
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            waiting for previous...
                          </motion.span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2 mt-4">
              <span className={cn("text-lg font-mono font-bold tabular-nums", syncDone ? "text-red-400" : "text-muted-foreground/40")}>
                {syncDone ? `${totalSyncTime.toFixed(1)}s` : running ? `${Math.min(elapsed, totalSyncTime).toFixed(1)}s` : "0.0s"}
              </span>
              <span className="text-[11px] text-muted-foreground/40">total for 3 requests</span>
            </div>
          </div>

          {/* ===== ASYNC SIDE ===== */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="size-4 text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Asynchronous</span>
              <code className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono ml-auto">async def</code>
            </div>

            <div className="space-y-2.5">
              {LABELS.map((label, i) => {
                const s = asyncStates[i];
                const color = COLORS.async[i];
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-muted-foreground/60">{label}</span>
                      <span className="text-[10px] font-mono" style={{ color: s.phase === "done" ? "#10b981" : color }}>
                        {s.phase === "waiting" && "ready"}
                        {s.phase === "io-wait" && IO_LABEL}
                        {s.phase === "processing" && "processing"}
                        {s.phase === "done" && "200 OK"}
                      </span>
                    </div>
                    <div className="relative h-7 rounded-lg bg-muted/30 border border-border/20 overflow-hidden">
                      {(s.phase === "io-wait" || s.phase === "processing" || s.phase === "done") && (
                        <motion.div
                          className="absolute inset-y-0 left-0 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${color}20`, width: `${(IO_DURATION / REQ_TOTAL) * 100}%` }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className="text-[8px] font-mono opacity-50" style={{ color }}>I/O</span>
                        </motion.div>
                      )}
                      {(s.phase === "processing" || s.phase === "done") && (
                        <motion.div
                          className="absolute inset-y-0 rounded-r-lg flex items-center justify-center"
                          style={{
                            backgroundColor: `${color}35`,
                            left: `${(IO_DURATION / REQ_TOTAL) * 100}%`,
                            width: `${(PROCESS_DURATION / REQ_TOTAL) * 100}%`,
                          }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: s.phase === "done" ? 1 : s.progress }}
                          transition={{ duration: 0.1 }}
                        />
                      )}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {s.phase === "io-wait" && (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                            <Loader2 className="size-3.5" style={{ color }} />
                          </motion.div>
                        )}
                        {s.phase === "done" && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                            <Check className="size-3.5 text-emerald-400" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 mt-4">
              <span className={cn("text-lg font-mono font-bold tabular-nums", asyncDone ? "text-emerald-400" : "text-muted-foreground/40")}>
                {asyncDone ? `${totalAsyncTime.toFixed(1)}s` : running ? `${Math.min(elapsed, totalAsyncTime).toFixed(1)}s` : "0.0s"}
              </span>
              <span className="text-[11px] text-muted-foreground/40">total for 3 requests</span>
            </div>
          </div>
        </div>

        {/* Result banner */}
        <AnimatePresence>
          {syncDone && asyncDone && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Zap className="size-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">
                  Async is {Math.round(totalSyncTime / totalAsyncTime)}x faster
                </span>
              </div>
              <span className="text-xs font-mono text-muted-foreground/50">
                {totalAsyncTime.toFixed(1)}s vs {totalSyncTime.toFixed(1)}s
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Key insight */}
        <div className="mt-4 rounded-lg bg-indigo-500/5 border border-indigo-500/15 px-4 py-3">
          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            <span className="text-indigo-400 font-semibold">The key insight:</span> During <code className="text-[11px] bg-muted px-1 py-0.5 rounded font-mono">await</code>, the event loop doesn&apos;t sit idle — it picks up the next request. All 3 I/O waits overlap, so total time = the slowest single request, not the sum.
          </p>
        </div>
      </div>
    </div>
  );
}
