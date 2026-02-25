"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface DataField {
  key: string;
  value: string;
  valid: boolean;
}

interface DataCycle {
  id: number;
  fields: DataField[];
}

const CYCLES: DataCycle[] = [
  {
    id: 0,
    fields: [
      { key: "name", value: '"Widget"', valid: true },
      { key: "price", value: "9.99", valid: true },
      { key: "price", value: "-5", valid: false },
      { key: "tags", value: '["new"]', valid: true },
    ],
  },
  {
    id: 1,
    fields: [
      { key: "name", value: "null", valid: false },
      { key: "price", value: "24.50", valid: true },
      { key: "tags", value: '"oops"', valid: false },
      { key: "quantity", value: "10", valid: true },
    ],
  },
  {
    id: 2,
    fields: [
      { key: "name", value: '"Gadget"', valid: true },
      { key: "price", value: "0", valid: false },
      { key: "tags", value: '["sale"]', valid: true },
      { key: "active", value: "true", valid: true },
    ],
  },
];

const TOTAL_CYCLE_MS = 6000;

type Phase = "input" | "scanning" | "result";

export function DataHeroViz() {
  const [cycleIndex, setCycleIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("input");
  const [scanIndex, setScanIndex] = useState(-1);

  const cycle = CYCLES[cycleIndex];

  const runCycle = useCallback(() => {
    setPhase("input");
    setScanIndex(-1);

    // Start scanning after fields appear
    setTimeout(() => {
      setPhase("scanning");
      setScanIndex(0);
    }, 1000);

    // Scan each field sequentially
    const fields = CYCLES[cycleIndex % CYCLES.length].fields;
    fields.forEach((_, i) => {
      setTimeout(() => {
        setScanIndex(i);
      }, 1000 + i * 700);
    });

    // Show results
    setTimeout(() => {
      setPhase("result");
    }, 1000 + fields.length * 700 + 300);

    // Next cycle
    setTimeout(() => {
      setCycleIndex((prev) => (prev + 1) % CYCLES.length);
    }, TOTAL_CYCLE_MS);
  }, [cycleIndex]);

  useEffect(() => {
    const timer = setTimeout(runCycle, 400);
    return () => clearTimeout(timer);
  }, [runCycle]);

  const validFields = cycle.fields.filter((f) => f.valid);
  const invalidFields = cycle.fields.filter((f) => !f.valid);

  return (
    <div className="w-full rounded-xl border bg-card/50 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
          <h3 className="text-sm font-semibold">
            Data Assembly Line
          </h3>
        </div>
        <div className="flex gap-1">
          {CYCLES.map((_, i) => (
            <div
              key={i}
              className={cn(
                "size-1.5 rounded-full transition-colors",
                i === cycleIndex ? "bg-blue-500" : "bg-border"
              )}
            />
          ))}
        </div>
      </div>

      {/* Three-stage pipeline */}
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 sm:gap-3 items-start min-h-[200px]">
        {/* Stage 1: Raw JSON Input */}
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-wider text-blue-500 mb-2 text-center">
            Raw JSON
          </div>
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-2.5 space-y-1.5">
            <AnimatePresence mode="popLayout">
              {cycle.fields.map((field, i) => (
                <motion.div
                  key={`${cycle.id}-${i}`}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{
                    opacity:
                      phase === "result" ? 0.3 : 1,
                    x: 0,
                  }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25, delay: i * 0.08 }}
                  className="flex items-center gap-1 font-mono text-[10px] sm:text-[11px]"
                >
                  <span className="text-blue-400">{field.key}</span>
                  <span className="text-muted-foreground/50">:</span>
                  <span className="text-foreground/70 truncate">
                    {field.value}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Arrow 1 */}
        <div className="flex items-center self-center pt-5">
          <motion.div
            animate={{
              opacity:
                phase === "scanning" ? [0.3, 1, 0.3] : 0.2,
            }}
            transition={
              phase === "scanning"
                ? { duration: 0.8, repeat: Infinity }
                : { duration: 0.3 }
            }
            className="text-indigo-500 text-sm sm:text-lg"
          >
            {"\u2192"}
          </motion.div>
        </div>

        {/* Stage 2: Pydantic Validator */}
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-wider text-indigo-500 mb-2 text-center">
            Pydantic Validator
          </div>
          <div className="rounded-lg border-2 border-indigo-500/30 bg-indigo-500/5 p-2.5 space-y-1.5 relative overflow-hidden">
            {/* Scanning beam */}
            {phase === "scanning" && (
              <motion.div
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
                animate={{ top: ["0%", "100%"] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            )}

            {cycle.fields.map((field, i) => {
              const isScanned =
                phase === "scanning" && scanIndex >= i;
              const showResult = phase === "result" || isScanned;

              return (
                <motion.div
                  key={`val-${cycle.id}-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity:
                      phase === "input"
                        ? 0.3
                        : isScanned || phase === "result"
                        ? 1
                        : 0.3,
                  }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex items-center justify-between gap-1 font-mono text-[10px] sm:text-[11px] rounded px-1.5 py-0.5 transition-colors duration-300",
                    showResult && field.valid && "bg-emerald-500/10",
                    showResult && !field.valid && "bg-red-500/10"
                  )}
                >
                  <span className="text-muted-foreground truncate">
                    {field.key}: {field.value}
                  </span>
                  {showResult && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 15,
                      }}
                      className={cn(
                        "text-[9px] font-bold shrink-0",
                        field.valid
                          ? "text-emerald-500"
                          : "text-red-500"
                      )}
                    >
                      {field.valid ? "\u2713" : "\u2717"}
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Arrow 2 */}
        <div className="flex items-center self-center pt-5">
          <motion.div
            animate={{
              opacity:
                phase === "result" ? [0.3, 1, 0.3] : 0.2,
            }}
            transition={
              phase === "result"
                ? { duration: 0.8, repeat: Infinity }
                : { duration: 0.3 }
            }
            className="text-indigo-500 text-sm sm:text-lg"
          >
            {"\u2192"}
          </motion.div>
        </div>

        {/* Stage 3: Clean Output */}
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-wider text-emerald-500 mb-2 text-center">
            Clean Output
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-2.5 min-h-[100px]">
            <AnimatePresence mode="popLayout">
              {phase === "result" ? (
                <motion.div
                  key={`result-${cycle.id}`}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  {/* Valid fields */}
                  <div className="space-y-1">
                    {validFields.map((field, i) => (
                      <motion.div
                        key={`valid-${i}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-1 font-mono text-[10px] sm:text-[11px] text-emerald-400"
                      >
                        <span className="text-emerald-500">{"\u2713"}</span>
                        <span>
                          {field.key}: {field.value}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Rejected fields */}
                  {invalidFields.length > 0 && (
                    <div className="border-t border-border/30 pt-1.5 space-y-1">
                      <span className="text-[9px] text-red-400/70 font-medium">
                        Rejected:
                      </span>
                      {invalidFields.map((field, i) => (
                        <motion.div
                          key={`invalid-${i}`}
                          initial={{ opacity: 0, y: 4, x: 8 }}
                          animate={{
                            opacity: 0.5,
                            y: 0,
                            x: 0,
                          }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="flex items-center gap-1 font-mono text-[10px] text-red-400/60 line-through"
                        >
                          {field.key}: {field.value}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  className="flex items-center justify-center h-[80px]"
                >
                  <span className="text-[10px] text-muted-foreground/40 font-mono">
                    waiting...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Summary badge */}
      <AnimatePresence>
        {phase === "result" && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center justify-center gap-3"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-xs font-semibold text-emerald-500">
                {validFields.length} passed
              </span>
            </div>
            {invalidFields.length > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                <span className="text-xs font-semibold text-red-500">
                  {invalidFields.length} rejected
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
