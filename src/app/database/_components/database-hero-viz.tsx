"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Database, Key, FileText, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "get-session" | "query" | "result" | "close" | "idle";

export function DatabaseHeroViz() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    let cancelled = false;
    async function run() {
      await delay(500);
      if (cancelled) return;
      setPhase("get-session");
      await delay(1200);
      if (cancelled) return;
      setPhase("query");
      await delay(1200);
      if (cancelled) return;
      setPhase("result");
      await delay(1200);
      if (cancelled) return;
      setPhase("close");
      await delay(1500);
      if (cancelled) return;
      setPhase("idle");
      await delay(800);
      if (cancelled) return;
      setCycle((c) => c + 1);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [cycle]);

  const isActive = phase !== "idle";

  return (
    <div className="w-full rounded-xl border bg-card/50 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Database className="size-4 text-cyan-500" />
          Database Session Lifecycle
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground">
          {phase === "idle" ? "waiting..." : phase.replace("-", " ")}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-3 min-h-[160px]">
        {/* Step 1: Depends(get_db) */}
        <motion.div
          animate={{
            borderColor: phase === "get-session" ? "rgba(6, 182, 212, 0.5)" : "rgba(128,128,128,0.15)",
            backgroundColor: phase === "get-session" ? "rgba(6, 182, 212, 0.05)" : "transparent",
          }}
          className="flex-1 rounded-lg border p-3 w-full sm:w-auto text-center"
        >
          <div className="text-[10px] text-muted-foreground mb-2">Step 1</div>
          <code className="text-xs font-mono text-cyan-400">Depends(get_db)</code>
          <div className="text-[10px] text-muted-foreground mt-1">Create session</div>
          <AnimatePresence>
            {(phase === "get-session" || phase === "query" || phase === "result") && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="mt-2 flex justify-center"
              >
                <Key className="size-4 text-cyan-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Arrow */}
        <motion.span
          animate={{ opacity: isActive ? 1 : 0.2 }}
          className="text-muted-foreground hidden sm:block"
        >
          {"\u2192"}
        </motion.span>

        {/* Step 2: Query */}
        <motion.div
          animate={{
            borderColor: phase === "query" ? "rgba(6, 182, 212, 0.5)" : "rgba(128,128,128,0.15)",
            backgroundColor: phase === "query" ? "rgba(6, 182, 212, 0.05)" : "transparent",
          }}
          className="flex-1 rounded-lg border p-3 w-full sm:w-auto text-center"
        >
          <div className="text-[10px] text-muted-foreground mb-2">Step 2</div>
          <code className="text-xs font-mono text-teal-400">db.query(Item)</code>
          <div className="text-[10px] text-muted-foreground mt-1">Execute query</div>
          <AnimatePresence>
            {phase === "query" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="mt-2 flex justify-center gap-1"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="size-1.5 rounded-full bg-cyan-400"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ delay: i * 0.15, duration: 0.6, repeat: Infinity }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Arrow */}
        <motion.span
          animate={{ opacity: isActive && phase !== "get-session" ? 1 : 0.2 }}
          className="text-muted-foreground hidden sm:block"
        >
          {"\u2192"}
        </motion.span>

        {/* Step 3: Result */}
        <motion.div
          animate={{
            borderColor: phase === "result" ? "rgba(16, 185, 129, 0.5)" : "rgba(128,128,128,0.15)",
            backgroundColor: phase === "result" ? "rgba(16, 185, 129, 0.05)" : "transparent",
          }}
          className="flex-1 rounded-lg border p-3 w-full sm:w-auto text-center"
        >
          <div className="text-[10px] text-muted-foreground mb-2">Step 3</div>
          <code className="text-xs font-mono text-emerald-400">commit()</code>
          <div className="text-[10px] text-muted-foreground mt-1">Save changes</div>
          <AnimatePresence>
            {phase === "result" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="mt-2 flex justify-center"
              >
                <Check className="size-4 text-emerald-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Arrow */}
        <motion.span
          animate={{ opacity: phase === "close" ? 1 : 0.2 }}
          className="text-muted-foreground hidden sm:block"
        >
          {"\u2192"}
        </motion.span>

        {/* Step 4: Close */}
        <motion.div
          animate={{
            borderColor: phase === "close" ? "rgba(239, 68, 68, 0.4)" : "rgba(128,128,128,0.15)",
            backgroundColor: phase === "close" ? "rgba(239, 68, 68, 0.05)" : "transparent",
          }}
          className="flex-1 rounded-lg border p-3 w-full sm:w-auto text-center"
        >
          <div className="text-[10px] text-muted-foreground mb-2">Finally</div>
          <code className="text-xs font-mono text-red-400">db.close()</code>
          <div className="text-[10px] text-muted-foreground mt-1">Release connection</div>
          <AnimatePresence>
            {phase === "close" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="mt-2 flex justify-center"
              >
                <X className="size-4 text-red-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <motion.div
        animate={{
          opacity: phase === "close" ? 1 : 0,
        }}
        className="mt-4 text-center"
      >
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-mono">
          Connection returned to pool — ready for next request
        </span>
      </motion.div>
    </div>
  );
}
