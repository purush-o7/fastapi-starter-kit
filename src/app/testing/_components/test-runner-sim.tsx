"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─── */
type Phase = "idle" | "typing" | "running" | "summary";

interface TestCase {
  file: string;
  name: string;
  passed: boolean;
  status: number;
  failDetail?: string[];
}

interface Scenario {
  id: string;
  label: string;
  tests: TestCase[];
  passed: number;
  failed: number;
  time: string;
  detail: string;
}

/* ─── Scenarios ─── */
const SCENARIOS: Scenario[] = [
  {
    id: "all-pass",
    label: "All Pass",
    tests: [
      { file: "test_main.py", name: "test_root", passed: true, status: 200 },
      { file: "test_items.py", name: "test_list_items", passed: true, status: 200 },
      { file: "test_items.py", name: "test_create_item", passed: true, status: 201 },
      { file: "test_auth.py", name: "test_protected", passed: true, status: 200 },
    ],
    passed: 4,
    failed: 0,
    time: "0.23s",
    detail: "All tests pass — endpoints return the expected status codes and response bodies",
  },
  {
    id: "one-fails",
    label: "One Fails",
    tests: [
      { file: "test_main.py", name: "test_root", passed: true, status: 200 },
      { file: "test_items.py", name: "test_list_items", passed: true, status: 200 },
      {
        file: "test_items.py",
        name: "test_create_item",
        passed: false,
        status: 200,
        failDetail: [
          "assert response.status_code == 201",
          "AssertionError: assert 200 == 201",
        ],
      },
      { file: "test_auth.py", name: "test_protected", passed: true, status: 200 },
    ],
    passed: 3,
    failed: 1,
    time: "0.31s",
    detail: "One test fails — the POST endpoint returns 200 instead of the expected 201 Created",
  },
  {
    id: "validation",
    label: "Validation",
    tests: [
      { file: "test_validation.py", name: "test_valid_item", passed: true, status: 201 },
      { file: "test_validation.py", name: "test_missing_field", passed: true, status: 422 },
      { file: "test_validation.py", name: "test_wrong_type", passed: true, status: 422 },
      { file: "test_validation.py", name: "test_extra_field", passed: true, status: 200 },
    ],
    passed: 4,
    failed: 0,
    time: "0.19s",
    detail: "Validation tests verify Pydantic catches bad input — 422 confirms the model rejects invalid data",
  },
];

const COMMAND = "pytest tests/ -v";

/* ─── Component ─── */
export function TestRunnerSim() {
  const [selectedId, setSelectedId] = useState("all-pass");
  const [phase, setPhase] = useState<Phase>("idle");
  const [typedChars, setTypedChars] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const sc = SCENARIOS.find((s) => s.id === selectedId)!;

  const clear = useCallback(() => { timersRef.current.forEach(clearTimeout); timersRef.current = []; }, []);
  const t = useCallback((fn: () => void, ms: number) => { timersRef.current.push(setTimeout(fn, ms)); }, []);

  const run = useCallback((s: Scenario) => {
    clear();
    setPhase("idle");
    setTypedChars(0);
    setRevealedCount(0);

    let delay = 300;

    // Typing phase
    t(() => setPhase("typing"), delay);
    for (let i = 1; i <= COMMAND.length; i++) {
      t(() => setTypedChars(i), delay + i * 40);
    }
    delay += COMMAND.length * 40 + 350;

    // Running phase
    t(() => setPhase("running"), delay);
    delay += 400; // "collecting..." pause

    for (let i = 0; i < s.tests.length; i++) {
      const testDelay = s.tests[i].passed ? 420 : 650;
      delay += testDelay;
      const count = i + 1;
      t(() => setRevealedCount(count), delay);
    }

    // Summary
    delay += 550;
    t(() => setPhase("summary"), delay);
  }, [clear, t]);

  useEffect(() => { run(sc); return clear; }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const allDone = phase === "summary";

  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/20">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="size-2 rounded-full"
            animate={{
              backgroundColor:
                phase === "idle" ? "rgba(16,185,129,0.4)" :
                allDone
                  ? sc.failed > 0 ? "rgb(239,68,68)" : "rgb(16,185,129)"
                  : "rgb(16,185,129)",
              scale: phase === "typing" || phase === "running" ? [1, 1.4, 1] : 1,
            }}
            transition={{ scale: { repeat: Infinity, duration: 0.8 } }}
          />
          <span className="text-xs font-semibold tracking-wide">Test Runner</span>
        </div>
        <button
          onClick={() => run(sc)}
          className="text-muted-foreground/40 hover:text-foreground transition-colors p-1 cursor-pointer"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      {/* ── Scenario Tabs ── */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex gap-1">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer relative",
                selectedId === s.id ? "text-foreground" : "text-muted-foreground/50 hover:text-muted-foreground"
              )}
            >
              {selectedId === s.id && (
                <motion.div
                  layoutId="test-tab"
                  className="absolute inset-0 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Terminal ── */}
      <div className="mx-4 sm:mx-5 mb-4 rounded-xl overflow-hidden border border-white/[0.04]">
        {/* Title bar */}
        <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#15161e] border-b border-white/[0.04]">
          <div className="size-2.5 rounded-full bg-[#ff5f57]/80" />
          <div className="size-2.5 rounded-full bg-[#febc2e]/80" />
          <div className="size-2.5 rounded-full bg-[#28c840]/80" />
          <span className="ml-2 text-[9px] font-mono text-white/15 tracking-wider">pytest</span>
        </div>

        {/* Terminal body */}
        <div className="bg-[#15161e] px-4 py-4 font-mono text-[11px] sm:text-xs leading-[1.8] min-h-[240px]">
          {/* Blinking cursor when idle */}
          {phase === "idle" && (
            <div className="flex items-center gap-2">
              <span className="text-emerald-400/80">$</span>
              <motion.span
                className="inline-block w-[7px] h-[15px] bg-emerald-400/70 rounded-[1px]"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.53, repeat: Infinity, repeatType: "reverse" }}
              />
            </div>
          )}

          {/* Command line */}
          {phase !== "idle" && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-emerald-400/80">$</span>
              <span className="text-white/75">
                {phase === "typing" ? COMMAND.slice(0, typedChars) : COMMAND}
              </span>
              {phase === "typing" && (
                <motion.span
                  className="inline-block w-[7px] h-[15px] bg-emerald-400/70 rounded-[1px]"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.53, repeat: Infinity, repeatType: "reverse" }}
                />
              )}
            </div>
          )}

          {/* Collecting line */}
          {(phase === "running" || phase === "summary") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white/20 mb-3"
            >
              collecting ... collected {sc.tests.length} items
            </motion.div>
          )}

          {/* Test results */}
          {(phase === "running" || phase === "summary") &&
            sc.tests.map((test, i) => {
              const show = phase === "summary" || i < revealedCount;
              if (!show) return null;

              return (
                <motion.div
                  key={test.file + "::" + test.name}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="flex items-center gap-0 py-[1px]">
                    <span className="text-white/25 shrink-0">{test.file}::</span>
                    <span className="text-white/60 shrink-0">{test.name}</span>
                    <span className="flex-1 mx-2 border-b border-dotted border-white/[0.06] min-w-[20px]" />
                    {test.passed ? (
                      <span className="text-emerald-400 font-semibold shrink-0 tracking-wide">PASSED</span>
                    ) : (
                      <span className="text-red-400 font-semibold shrink-0 tracking-wide">FAILED</span>
                    )}
                  </div>

                  {/* Failure details */}
                  {!test.passed && test.failDetail && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ delay: 0.12, duration: 0.2 }}
                      className="ml-3 mt-1 mb-2 pl-3 border-l-2 border-red-500/25 overflow-hidden"
                    >
                      {test.failDetail.map((line, j) => (
                        <div key={j} className="text-red-400/70 text-[10px] sm:text-[11px]">
                          <span className="text-red-400/40 mr-1">{j === 0 ? ">" : "E"}</span>
                          {line}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}

          {/* Summary line */}
          {phase === "summary" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mt-4 pt-2 border-t border-white/[0.04]"
            >
              <span className={cn(
                "font-semibold tracking-wide",
                sc.failed > 0 ? "text-red-400" : "text-emerald-400"
              )}>
                {sc.failed > 0
                  ? `═══ ${sc.failed} failed, ${sc.passed} passed in ${sc.time} ═══`
                  : `═══ ${sc.passed} passed in ${sc.time} ═══`}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Result Footer ── */}
      <AnimatePresence mode="wait">
        {phase === "summary" && (
          <motion.div
            key={selectedId + "-result"}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className={cn(
              "px-5 py-3.5 border-t flex items-center gap-3",
              sc.failed > 0
                ? "bg-red-500/5 border-red-500/15"
                : "bg-emerald-500/5 border-emerald-500/15"
            )}>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={cn(
                  "size-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0",
                  sc.failed > 0
                    ? "bg-red-500/15 text-red-400"
                    : "bg-emerald-500/15 text-emerald-400"
                )}
              >
                {sc.failed > 0 ? "✗" : "✓"}
              </motion.div>
              <div className="min-w-0">
                <p className={cn(
                  "text-[11px] font-semibold",
                  sc.failed > 0 ? "text-red-400" : "text-emerald-400"
                )}>
                  {sc.failed > 0 ? `${sc.failed} test failed` : "All tests passed"}
                </p>
                <p className="text-[9px] font-mono text-muted-foreground/50 mt-0.5">
                  {sc.passed} passed · {sc.failed} failed · {sc.time}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Description ── */}
      <div className="px-5 py-2.5 border-t bg-muted/8">
        <AnimatePresence mode="wait">
          <motion.p
            key={selectedId}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
            className="text-[10px] text-muted-foreground/50"
          >
            {sc.detail}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
