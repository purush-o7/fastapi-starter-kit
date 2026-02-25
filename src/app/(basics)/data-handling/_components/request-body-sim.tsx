"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, RotateCcw, Check, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Data ─── */
interface FieldCheck {
  key: string;
  value: string;
  expected: string;
  passes: boolean;
  error?: string;
}

interface Scenario {
  id: string;
  label: string;
  modelName: string;
  fields: FieldCheck[];
  statusCode: number;
  statusText: string;
  responseBody: string;
  detail: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "valid",
    label: "Valid Request",
    modelName: "Item",
    fields: [
      { key: "name", value: '"Widget"', expected: "str", passes: true },
      { key: "price", value: "29.99", expected: "float", passes: true },
      { key: "description", value: '"A fine widget"', expected: "str | None", passes: true },
      { key: "tax", value: "2.50", expected: "float | None", passes: true },
    ],
    statusCode: 200,
    statusText: "200 OK — Item created",
    responseBody: '{"name": "Widget", "price": 29.99, "total": 32.49}',
    detail: "All fields present with correct types — Pydantic parses the body into a typed Item object",
  },
  {
    id: "missing",
    label: "Missing Field",
    modelName: "Item",
    fields: [
      { key: "price", value: "29.99", expected: "float", passes: true },
      { key: "description", value: "null", expected: "str | None", passes: true },
      { key: "name", value: "(missing)", expected: "str (required)", passes: false, error: "field required" },
    ],
    statusCode: 422,
    statusText: "422 Validation Error",
    responseBody: '{"detail": [{"loc": ["body","name"], "msg": "field required"}]}',
    detail: "The required 'name' field is missing from the request body — FastAPI returns a 422 with detailed error",
  },
  {
    id: "wrong-type",
    label: "Wrong Type",
    modelName: "Item",
    fields: [
      { key: "name", value: '"Widget"', expected: "str", passes: true },
      { key: "price", value: '"not_a_number"', expected: "float", passes: false, error: "value is not a valid float" },
      { key: "tax", value: "true", expected: "float | None", passes: false, error: "value is not a valid float" },
    ],
    statusCode: 422,
    statusText: "422 Validation Error",
    responseBody: '{"detail": [{"loc": ["body","price"], "msg": "value is not a valid float"}]}',
    detail: "price is a string instead of float, tax is a bool instead of float — Pydantic rejects both with type errors",
  },
];

type Phase = "idle" | "show-json" | "validating" | "done";

/* ─── Component ─── */
export function RequestBodySim() {
  const [selectedId, setSelectedId] = useState("valid");
  const [phase, setPhase] = useState<Phase>("idle");
  const [revealedFields, setRevealedFields] = useState(0);
  const [checkedCount, setCheckedCount] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const sc = SCENARIOS.find((s) => s.id === selectedId)!;

  const clear = useCallback(() => { timersRef.current.forEach(clearTimeout); timersRef.current = []; }, []);
  const t = useCallback((fn: () => void, ms: number) => { timersRef.current.push(setTimeout(fn, ms)); }, []);

  const run = useCallback((s: Scenario) => {
    clear();
    setPhase("idle");
    setRevealedFields(0);
    setCheckedCount(0);

    let delay = 300;

    // Show JSON fields
    t(() => setPhase("show-json"), delay);
    s.fields.forEach((_, i) => {
      delay += 180;
      t(() => setRevealedFields(i + 1), delay);
    });

    // Validate each field
    delay += 450;
    t(() => setPhase("validating"), delay);
    s.fields.forEach((f, i) => {
      delay += f.passes ? 380 : 550;
      t(() => setCheckedCount(i + 1), delay);
    });

    // Done
    delay += 500;
    t(() => setPhase("done"), delay);
  }, [clear, t]);

  useEffect(() => { run(sc); return clear; }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const isSuccess = sc.statusCode < 400;
  const failedFields = sc.fields.filter((f) => !f.passes);

  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/20">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="size-2 rounded-full"
            animate={{
              backgroundColor:
                phase === "done"
                  ? isSuccess ? "rgb(16,185,129)" : "rgb(239,68,68)"
                  : phase === "validating" ? "rgb(245,158,11)"
                  : phase === "idle" ? "rgba(99,102,241,0.4)"
                  : "rgb(99,102,241)",
              scale: phase === "validating" ? [1, 1.4, 1] : 1,
            }}
            transition={{ scale: { repeat: Infinity, duration: 0.6 } }}
          />
          <span className="text-xs font-semibold tracking-wide">Request Body Validator</span>
        </div>
        <button onClick={() => run(sc)} className="text-muted-foreground/40 hover:text-foreground transition-colors p-1 cursor-pointer">
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
                  layoutId="reqbody-tab"
                  className="absolute inset-0 rounded-lg bg-indigo-500/10 border border-indigo-500/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Visualization ── */}
      <div className="relative px-4 sm:px-5 py-5">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Two-column: JSON Body → Validation Result */}
        <div className="relative grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-start">
          {/* ── Left: JSON Body ── */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="size-5 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Send className="size-3 text-indigo-400" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground/60">
                JSON Body
              </span>
            </div>
            <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
              <div className="px-3 py-1.5 border-b border-border/30 flex items-center justify-between">
                <span className="text-[9px] font-mono text-indigo-400/70">POST /items</span>
                <span className="text-[8px] font-mono text-muted-foreground/25">application/json</span>
              </div>
              <div className="px-3 py-2">
                {/* Opening brace */}
                <AnimatePresence>
                  {phase !== "idle" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[10px] sm:text-[11px] font-mono text-muted-foreground/30"
                    >
                      {"{"}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Fields */}
                <div className="pl-3 space-y-[2px]">
                  {sc.fields.map((field, i) => {
                    const visible = i < revealedFields;
                    const isChecked = (phase === "validating" || phase === "done") && i < checkedCount;

                    return (
                      <AnimatePresence key={field.key}>
                        {visible && (
                          <motion.div
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.15 }}
                            className={cn(
                              "flex items-center gap-1 py-[3px] px-2 rounded-md transition-all duration-300 text-[10px] sm:text-[11px] font-mono",
                              isChecked && !field.passes
                                ? "bg-red-500/8"
                                : isChecked && field.passes
                                  ? "bg-emerald-500/6"
                                  : ""
                            )}
                          >
                            <span className="text-indigo-400/60">&quot;{field.key}&quot;</span>
                            <span className="text-muted-foreground/30">:</span>
                            <span className={cn(
                              "ml-1 truncate",
                              isChecked && !field.passes ? "text-red-400/80" : "text-foreground/60"
                            )}>
                              {field.value}
                            </span>
                            {/* Check/X after validation */}
                            {isChecked && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                className="ml-auto shrink-0"
                              >
                                {field.passes ? (
                                  <Check className="size-3 text-emerald-400" />
                                ) : (
                                  <X className="size-3 text-red-400" />
                                )}
                              </motion.span>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    );
                  })}
                </div>

                {/* Closing brace */}
                <AnimatePresence>
                  {phase !== "idle" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[10px] sm:text-[11px] font-mono text-muted-foreground/30"
                    >
                      {"}"}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── Center: Arrow / Model ── */}
          <div className="flex flex-col items-center justify-center pt-10 gap-2">
            <AnimatePresence>
              {phase !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <motion.div
                    className={cn(
                      "size-9 rounded-xl border flex items-center justify-center transition-colors duration-300",
                      phase === "validating"
                        ? "border-amber-500/30 bg-amber-500/10"
                        : phase === "done"
                          ? isSuccess ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10"
                          : "border-indigo-500/20 bg-indigo-500/8"
                    )}
                    animate={phase === "validating" ? { scale: [1, 1.08, 1] } : {}}
                    transition={{ duration: 0.5, repeat: phase === "validating" ? Infinity : 0 }}
                  >
                    <ArrowRight className={cn(
                      "size-4 transition-colors duration-300",
                      phase === "validating" ? "text-amber-400" :
                      phase === "done" ? (isSuccess ? "text-emerald-400" : "text-red-400") :
                      "text-indigo-400/60"
                    )} />
                  </motion.div>
                  <span className="text-[8px] sm:text-[9px] font-mono text-muted-foreground/35 text-center max-w-[80px] leading-tight">
                    {sc.modelName}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right: Validation Result ── */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className={cn(
                "size-5 rounded-md border flex items-center justify-center transition-colors duration-500",
                phase === "done"
                  ? isSuccess ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"
                  : "bg-muted/30 border-border/30"
              )}>
                {phase === "done" && isSuccess ? (
                  <Check className="size-3 text-emerald-400" />
                ) : phase === "done" && !isSuccess ? (
                  <X className="size-3 text-red-400" />
                ) : (
                  <ArrowRight className="size-3 text-muted-foreground/30" />
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground/60">
                Result
              </span>
            </div>
            <div className={cn(
              "rounded-xl border overflow-hidden bg-card transition-colors duration-500",
              phase === "done"
                ? isSuccess ? "border-emerald-500/25" : "border-red-500/25"
                : "border-border/40"
            )}>
              <div className="px-3 py-1.5 border-b border-border/30">
                <AnimatePresence mode="wait">
                  {phase === "done" ? (
                    <motion.span
                      key="status"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        "text-[9px] font-mono font-semibold",
                        isSuccess ? "text-emerald-400" : "text-red-400"
                      )}
                    >
                      {sc.statusCode} {isSuccess ? "OK" : "Validation Error"}
                    </motion.span>
                  ) : (
                    <motion.span key="waiting" className="text-[9px] font-mono text-muted-foreground/30">
                      awaiting response...
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="px-3 py-2 min-h-[80px]">
                {/* Success: show parsed fields */}
                <AnimatePresence>
                  {phase === "done" && isSuccess && sc.fields.map((field) => (
                    field.passes && (
                      <motion.div
                        key={field.key + "-result"}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="flex items-center gap-1 py-[3px] px-2 rounded-md text-[10px] sm:text-[11px] font-mono bg-emerald-500/5"
                      >
                        <span className="text-emerald-400/60">{field.key}:</span>
                        <span className="ml-1 text-foreground/70 truncate">
                          {field.value}
                          <span className="text-emerald-400/40 ml-1">({field.expected})</span>
                        </span>
                      </motion.div>
                    )
                  ))}
                </AnimatePresence>

                {/* Error: show validation errors */}
                <AnimatePresence>
                  {phase === "done" && !isSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-1.5"
                    >
                      <div className="text-[9px] font-mono text-red-400/50 mb-2">
                        {"{"}&quot;detail&quot;: [
                      </div>
                      {failedFields.map((field) => (
                        <motion.div
                          key={field.key + "-err"}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="pl-3 py-1.5 px-2 rounded-md bg-red-500/6 border-l-2 border-red-500/25"
                        >
                          <div className="text-[9px] sm:text-[10px] font-mono">
                            <span className="text-red-400/50">loc:</span>
                            <span className="text-red-400/80 ml-1">[&quot;body&quot;, &quot;{field.key}&quot;]</span>
                          </div>
                          <div className="text-[9px] sm:text-[10px] font-mono">
                            <span className="text-red-400/50">msg:</span>
                            <span className="text-red-400/80 ml-1">&quot;{field.error}&quot;</span>
                          </div>
                        </motion.div>
                      ))}
                      <div className="text-[9px] font-mono text-red-400/50">
                        ]{"}"}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Waiting state */}
                {phase !== "done" && (
                  <div className="flex items-center justify-center py-6">
                    <span className="text-[9px] text-muted-foreground/20 font-mono">
                      {phase === "validating" ? "validating..." : "waiting..."}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Result Footer ── */}
      <AnimatePresence mode="wait">
        {phase === "done" && (
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
              isSuccess
                ? "bg-emerald-500/5 border-emerald-500/15"
                : "bg-red-500/5 border-red-500/15"
            )}>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={cn(
                  "size-8 rounded-xl flex items-center justify-center text-[10px] font-bold font-mono shrink-0",
                  isSuccess ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                )}
              >
                {sc.statusCode}
              </motion.div>
              <div className="min-w-0">
                <p className={cn(
                  "text-[11px] font-semibold",
                  isSuccess ? "text-emerald-400" : "text-red-400"
                )}>
                  {sc.statusText}
                </p>
                <p className="text-[9px] font-mono text-muted-foreground/50 mt-0.5 truncate">
                  {isSuccess
                    ? `${sc.fields.filter((f) => f.passes).length} fields validated and parsed`
                    : `${failedFields.length} validation error${failedFields.length > 1 ? "s" : ""}: ${failedFields.map((f) => f.key).join(", ")}`}
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
