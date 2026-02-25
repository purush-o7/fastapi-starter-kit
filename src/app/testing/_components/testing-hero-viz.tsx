"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TestTube, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "writing" | "running" | "passing" | "results";

const PHASE_DURATIONS: Record<Phase, number> = {
  writing: 2000,
  running: 1500,
  passing: 1000,
  results: 3000,
};

const TEST_CASES = [
  { name: "test_read_items", method: "GET", path: "/items", status: 200 },
  { name: "test_create_item", method: "POST", path: "/items", status: 201 },
  { name: "test_unauthorized", method: "GET", path: "/admin", status: 401 },
  { name: "test_not_found", method: "GET", path: "/items/999", status: 404 },
];

export function TestingHeroViz() {
  const [phase, setPhase] = useState<Phase>("writing");
  const [cycleCount, setCycleCount] = useState(0);
  const [passedCount, setPassedCount] = useState(0);

  const runCycle = useCallback(() => {
    setPhase("writing");
    setPassedCount(0);

    const t1 = PHASE_DURATIONS.writing;
    const t2 = t1 + PHASE_DURATIONS.running;
    const t3 = t2 + PHASE_DURATIONS.passing;
    const t4 = t3 + PHASE_DURATIONS.results;

    const timers = [
      setTimeout(() => setPhase("running"), t1),
      setTimeout(() => setPhase("passing"), t2),
      setTimeout(() => {
        setPassedCount(TEST_CASES.length);
        setPhase("results");
      }, t3),
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
          <TestTube className="size-4 text-emerald-500" />
          <h3 className="text-sm font-semibold">Test Execution Flow</h3>
        </div>
        <button
          onClick={() => setCycleCount((c) => c + 1)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted cursor-pointer"
        >
          Replay
        </button>
      </div>

      <div className="relative flex flex-col items-center gap-4 min-h-[280px]">
        {/* Writing phase — test names appear */}
        <AnimatePresence>
          {phase === "writing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-sm space-y-2"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-semibold text-center text-foreground mb-3"
              >
                Writing Tests...
              </motion.p>
              {TEST_CASES.map((test, index) => (
                <motion.div
                  key={test.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.3, duration: 0.4 }}
                  className="rounded-lg border bg-muted/30 px-4 py-2.5 flex items-center gap-3"
                >
                  <span className="text-[11px] font-mono text-muted-foreground">
                    def {test.name}
                  </span>
                  <span className="ml-auto text-[10px] font-mono text-muted-foreground/60">
                    {test.method} {test.path}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Running phase — progress animation */}
        <AnimatePresence>
          {phase === "running" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="size-10 text-emerald-400" />
              </motion.div>
              <span className="text-xs font-mono text-emerald-400">
                Running {TEST_CASES.length} tests...
              </span>
              <div className="w-48 h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-emerald-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Passing phase — checkmarks appear */}
        <AnimatePresence>
          {phase === "passing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm space-y-2"
            >
              {TEST_CASES.map((test, index) => (
                <motion.div
                  key={test.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
                  className="rounded-lg border bg-emerald-500/10 border-emerald-500/30 px-4 py-2.5 flex items-center gap-3"
                >
                  <Check className="size-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-mono text-emerald-400">
                    {test.name}
                  </span>
                  <span className="ml-auto text-[10px] font-mono text-emerald-300/60">
                    {test.status}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results phase — summary */}
        <AnimatePresence>
          {phase === "results" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                className="size-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center"
              >
                <Check className="size-8 text-emerald-400" />
              </motion.div>
              <div className="text-center">
                <p className="text-sm font-semibold text-emerald-400">All Tests Passed</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {passedCount} passed, 0 failed, 0 skipped
                </p>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400"
              >
                pytest tests/ -v ✓
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Phase indicator dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {(["writing", "running", "passing", "results"] as Phase[]).map((p) => (
          <div
            key={p}
            className={cn(
              "rounded-full transition-all duration-300",
              phase === p
                ? "w-6 h-1.5 bg-emerald-500"
                : "w-1.5 h-1.5 bg-border"
            )}
          />
        ))}
      </div>
    </div>
  );
}
