"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Lock, LockOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "locked" | "validating" | "unlocked" | "jwt";

const PHASE_DURATIONS: Record<Phase, number> = {
  locked: 1800,
  validating: 1200,
  unlocked: 800,
  jwt: 3200,
};

const JWT_SEGMENTS = [
  {
    label: "Header",
    content: '{"alg": "HS256"}',
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    text: "text-amber-400",
    dot: "bg-amber-500",
  },
  {
    label: "Payload",
    content: '{"sub": "user123", "exp": ...}',
    bg: "bg-yellow-500/15",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    dot: "bg-yellow-500",
  },
  {
    label: "Signature",
    content: "HMACSHA256(...)",
    bg: "bg-orange-500/15",
    border: "border-orange-500/30",
    text: "text-orange-400",
    dot: "bg-orange-500",
  },
];

function PadlockIcon({ phase }: { phase: Phase }) {
  const isOpen = phase === "unlocked" || phase === "jwt";
  const isValidating = phase === "validating";

  return (
    <motion.div
      className="relative size-16 flex items-center justify-center"
      animate={isValidating ? { rotate: [0, -15, 15, -10, 10, 0] } : { rotate: 0 }}
      transition={
        isValidating
          ? { duration: 0.8, ease: "easeInOut" }
          : { duration: 0.3 }
      }
    >
      {isOpen ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <LockOpen className="size-10 text-emerald-400" />
        </motion.div>
      ) : (
        <Lock
          className={cn(
            "size-10 transition-colors duration-300",
            isValidating ? "text-amber-400" : "text-amber-500"
          )}
        />
      )}
    </motion.div>
  );
}

export function AuthHeroViz() {
  const [phase, setPhase] = useState<Phase>("locked");
  const [cycleCount, setCycleCount] = useState(0);

  const runCycle = useCallback(() => {
    setPhase("locked");

    const t1 = PHASE_DURATIONS.locked;
    const t2 = t1 + PHASE_DURATIONS.validating;
    const t3 = t2 + PHASE_DURATIONS.unlocked;
    const t4 = t3 + PHASE_DURATIONS.jwt;

    const timers = [
      setTimeout(() => setPhase("validating"), t1),
      setTimeout(() => setPhase("unlocked"), t2),
      setTimeout(() => setPhase("jwt"), t3),
      setTimeout(() => {
        setCycleCount((c) => c + 1);
      }, t4),
    ];

    return timers;
  }, []);

  useEffect(() => {
    const timers = runCycle();
    return () => timers.forEach(clearTimeout);
  }, [cycleCount, runCycle]);

  return (
    <div className="w-full rounded-xl border bg-card/50 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-amber-500" />
          <h3 className="text-sm font-semibold">JWT Authentication Flow</h3>
        </div>
        <button
          onClick={() => setCycleCount((c) => c + 1)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted cursor-pointer"
        >
          Replay
        </button>
      </div>

      <div className="relative flex flex-col items-center gap-6 min-h-[280px]">
        {/* Lock with glow */}
        <div className="relative">
          {/* Glow ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={
              phase === "locked"
                ? {
                    boxShadow: [
                      "0 0 0 4px rgba(245, 158, 11, 0)",
                      "0 0 20px 8px rgba(245, 158, 11, 0.2)",
                      "0 0 0 4px rgba(245, 158, 11, 0)",
                    ],
                  }
                : phase === "unlocked" || phase === "jwt"
                ? {
                    boxShadow: [
                      "0 0 0 4px rgba(16, 185, 129, 0)",
                      "0 0 20px 8px rgba(16, 185, 129, 0.2)",
                      "0 0 0 4px rgba(16, 185, 129, 0)",
                    ],
                  }
                : { boxShadow: "0 0 0 0px rgba(0,0,0,0)" }
            }
            transition={
              phase === "locked" || phase === "unlocked" || phase === "jwt"
                ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.3 }
            }
          />
          <PadlockIcon phase={phase} />
        </div>

        {/* Credentials pill approaching */}
        <AnimatePresence>
          {phase === "locked" && (
            <motion.div
              initial={{ x: -120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 0, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-400"
            >
              {"{ username, password }"}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validating indicator */}
        <AnimatePresence>
          {phase === "validating" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <motion.div
                className="size-2 rounded-full bg-amber-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <span className="text-xs font-mono text-amber-400">
                Verifying credentials...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unlocked badge */}
        <AnimatePresence>
          {phase === "unlocked" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400"
            >
              Authenticated
            </motion.div>
          )}
        </AnimatePresence>

        {/* JWT Token segments */}
        <AnimatePresence>
          {phase === "jwt" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-sm space-y-2"
            >
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xs font-semibold text-center text-foreground mb-3"
              >
                JWT Token Issued
              </motion.p>

              {JWT_SEGMENTS.map((seg, index) => (
                <motion.div
                  key={seg.label}
                  initial={{ opacity: 0, y: -10, x: 0 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{
                    delay: 0.2 + index * 0.15,
                    duration: 0.4,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  }}
                  className={cn(
                    "rounded-lg border px-4 py-2.5 flex items-center gap-3",
                    seg.bg,
                    seg.border
                  )}
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={cn("size-2 rounded-full", seg.dot)} />
                    <span className={cn("text-[11px] font-semibold uppercase tracking-wider", seg.text)}>
                      {seg.label}
                    </span>
                  </div>
                  <code className={cn("text-[11px] font-mono truncate", seg.text)}>
                    {seg.content}
                  </code>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Phase indicator dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {(["locked", "validating", "unlocked", "jwt"] as Phase[]).map((p) => (
          <div
            key={p}
            className={cn(
              "rounded-full transition-all duration-300",
              phase === p
                ? "w-6 h-1.5 bg-amber-500"
                : "w-1.5 h-1.5 bg-border"
            )}
          />
        ))}
      </div>
    </div>
  );
}
