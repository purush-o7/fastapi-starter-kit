"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Timer, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface RequestDot {
  id: number;
  startDelay: number;
  processingTime: number;
  color: string;
  label: string;
}

const SYNC_REQUESTS: RequestDot[] = [
  { id: 1, startDelay: 0, processingTime: 2, color: "bg-red-400", label: "Req 1" },
  { id: 2, startDelay: 2, processingTime: 2, color: "bg-amber-400", label: "Req 2" },
  { id: 3, startDelay: 4, processingTime: 2, color: "bg-orange-400", label: "Req 3" },
];

const ASYNC_REQUESTS: RequestDot[] = [
  { id: 1, startDelay: 0, processingTime: 2, color: "bg-emerald-400", label: "Req 1" },
  { id: 2, startDelay: 0, processingTime: 2, color: "bg-teal-400", label: "Req 2" },
  { id: 3, startDelay: 0, processingTime: 2, color: "bg-cyan-400", label: "Req 3" },
];

const TOTAL_CYCLE = 8;

function Lane({
  request,
  isPlaying,
  elapsed,
}: {
  request: RequestDot;
  isPlaying: boolean;
  elapsed: number;
}) {
  const started = elapsed >= request.startDelay;
  const progress = started
    ? Math.min((elapsed - request.startDelay) / request.processingTime, 1)
    : 0;
  const done = progress >= 1;
  const waiting = !started && isPlaying;

  return (
    <div className="flex items-center gap-2 h-8">
      {/* Label */}
      <span className="text-[10px] font-mono text-muted-foreground w-8 shrink-0">
        {request.label}
      </span>

      {/* Track */}
      <div className="relative flex-1 h-6 rounded-md bg-muted/40 border border-border/50 overflow-hidden">
        {/* Progress fill */}
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 rounded-md",
            done ? "bg-emerald-500/20" : `${request.color}/20`
          )}
          style={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.1 }}
        />

        {/* Request dot */}
        <motion.div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 h-4 rounded-sm flex items-center justify-center",
            done ? "bg-emerald-500/80" : request.color
          )}
          style={{
            width: started ? "100%" : "24px",
            left: started ? 0 : undefined,
          }}
          animate={{
            left: started ? 0 : undefined,
            opacity: waiting ? [0.4, 0.8, 0.4] : 1,
            width: started ? `${progress * 100}%` : "24px",
          }}
          transition={
            waiting
              ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.1 }
          }
        >
          {done && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-[9px] font-bold text-white"
            >
              Done
            </motion.span>
          )}
        </motion.div>

        {/* Waiting label */}
        {waiting && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] text-muted-foreground/70 font-mono">
              waiting...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function TimerDisplay({ elapsed, total, color }: { elapsed: number; total: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5 mt-3">
      <Timer className={cn("size-3.5", color)} />
      <span className={cn("text-sm font-mono font-bold tabular-nums", color)}>
        {Math.min(elapsed, total).toFixed(1)}s
      </span>
      <span className="text-xs text-muted-foreground">for 3 requests</span>
    </div>
  );
}

export function AsyncHeroViz() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  const reset = useCallback(() => {
    setElapsed(0);
    setIsPlaying(true);
  }, []);

  // Auto-start on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsPlaying(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Animation timer
  useEffect(() => {
    if (!isPlaying) return;

    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      setElapsed(t);

      if (t >= TOTAL_CYCLE) {
        setCycleCount((c) => c + 1);
        setElapsed(0);
        setIsPlaying(false);
        // Restart after a pause
        setTimeout(() => setIsPlaying(true), 1500);
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, cycleCount]);

  return (
    <div className="w-full rounded-xl border bg-card/50 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-indigo-500" />
          <h3 className="text-sm font-semibold">Sync vs Async — Visualized</h3>
        </div>
        <button
          onClick={reset}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted cursor-pointer"
        >
          Replay
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        {/* Sync side */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="size-3.5 text-red-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
              Synchronous
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-mono">
              def
            </span>
          </div>
          <div className="space-y-1.5">
            {SYNC_REQUESTS.map((req) => (
              <Lane key={req.id} request={req} isPlaying={isPlaying} elapsed={elapsed} />
            ))}
          </div>
          <TimerDisplay
            elapsed={elapsed}
            total={6}
            color="text-red-400"
          />
          <p className="text-[10px] text-muted-foreground/60 mt-1.5">
            Each request waits for the previous one to finish
          </p>
        </div>

        {/* Async side */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="size-3.5 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Asynchronous
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
              async def
            </span>
          </div>
          <div className="space-y-1.5">
            {ASYNC_REQUESTS.map((req) => (
              <Lane key={req.id} request={req} isPlaying={isPlaying} elapsed={elapsed} />
            ))}
          </div>
          <TimerDisplay
            elapsed={elapsed}
            total={2}
            color="text-emerald-400"
          />
          <p className="text-[10px] text-muted-foreground/60 mt-1.5">
            All requests process concurrently via the event loop
          </p>
        </div>
      </div>

      {/* Speed comparison badge */}
      <AnimatePresence>
        {elapsed >= 6 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center justify-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Zap className="size-3.5 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-500">
                3x faster with async
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
