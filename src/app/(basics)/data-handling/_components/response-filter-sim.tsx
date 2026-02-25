"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Filter, RotateCcw, Check, X, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Data ─── */
interface Field {
  key: string;
  value: string;
  passes: boolean;
  sensitive?: boolean;
}

interface Scenario {
  id: string;
  label: string;
  inputModel: string;
  outputModel: string;
  filterDesc: string;
  fields: Field[];
  resultText: string;
  detail: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "password",
    label: "Password Filter",
    inputModel: "UserIn",
    outputModel: "UserOut",
    filterDesc: "response_model=UserOut",
    fields: [
      { key: "username", value: '"alice"', passes: true },
      { key: "email", value: '"alice@example.com"', passes: true },
      { key: "password", value: '"s3cret!!"', passes: false, sensitive: true },
    ],
    resultText: "password stripped from response",
    detail: "UserOut only declares username and email — the password field is automatically excluded from the API response",
  },
  {
    id: "exclude",
    label: "Exclude Fields",
    inputModel: "Item",
    outputModel: "Item (exclude=...)",
    filterDesc: 'response_model_exclude={"cost_price", "notes"}',
    fields: [
      { key: "name", value: '"Widget"', passes: true },
      { key: "price", value: "29.99", passes: true },
      { key: "in_stock", value: "true", passes: true },
      { key: "cost_price", value: "12.50", passes: false, sensitive: true },
      { key: "notes", value: '"bulk order pending"', passes: false, sensitive: true },
    ],
    resultText: "internal fields excluded",
    detail: "response_model_exclude lets you hide specific fields without creating a separate model — useful for quick filtering",
  },
  {
    id: "unset",
    label: "Exclude Unset",
    inputModel: "Item (partial)",
    outputModel: "Item (unset excluded)",
    filterDesc: "response_model_exclude_unset=True",
    fields: [
      { key: "name", value: '"Gadget"', passes: true },
      { key: "price", value: "49.99", passes: true },
      { key: "description", value: "None (unset)", passes: false },
      { key: "tax", value: "None (unset)", passes: false },
    ],
    resultText: "unset fields omitted from response",
    detail: "exclude_unset=True only returns fields that were explicitly set — unset optional fields are omitted entirely",
  },
];

type Phase = "idle" | "show-input" | "show-model" | "filtering" | "done";

/* ─── Component ─── */
export function ResponseFilterSim() {
  const [selectedId, setSelectedId] = useState("password");
  const [phase, setPhase] = useState<Phase>("idle");
  const [revealedInput, setRevealedInput] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const sc = SCENARIOS.find((s) => s.id === selectedId)!;

  const clear = useCallback(() => { timersRef.current.forEach(clearTimeout); timersRef.current = []; }, []);
  const t = useCallback((fn: () => void, ms: number) => { timersRef.current.push(setTimeout(fn, ms)); }, []);

  const run = useCallback((s: Scenario) => {
    clear();
    setPhase("idle");
    setRevealedInput(0);
    setProcessedCount(0);

    let delay = 300;

    // Show input fields one by one
    t(() => setPhase("show-input"), delay);
    s.fields.forEach((_, i) => {
      delay += 200;
      t(() => setRevealedInput(i + 1), delay);
    });

    // Show model
    delay += 400;
    t(() => setPhase("show-model"), delay);

    // Filter fields one by one
    delay += 500;
    t(() => setPhase("filtering"), delay);
    s.fields.forEach((_, i) => {
      delay += 380;
      t(() => setProcessedCount(i + 1), delay);
    });

    // Done
    delay += 500;
    t(() => setPhase("done"), delay);
  }, [clear, t]);

  useEffect(() => { run(sc); return clear; }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const passedFields = sc.fields.filter((f) => f.passes);
  const filteredFields = sc.fields.filter((f) => !f.passes);

  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/20">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="size-2 rounded-full"
            animate={{
              backgroundColor:
                phase === "done" ? "rgb(16,185,129)" :
                phase === "filtering" ? "rgb(245,158,11)" :
                phase === "idle" ? "rgba(99,102,241,0.4)" :
                "rgb(99,102,241)",
              scale: phase === "filtering" ? [1, 1.4, 1] : 1,
            }}
            transition={{ scale: { repeat: Infinity, duration: 0.6 } }}
          />
          <span className="text-xs font-semibold tracking-wide">Response Filter</span>
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
                  layoutId="filter-tab"
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

        {/* Two-column layout: Input → Output */}
        <div className="relative grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-start">
          {/* ── Left: Input Data ── */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="size-5 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Eye className="size-3 text-indigo-400" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground/60">
                Raw Data
              </span>
            </div>
            <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
              <div className="px-3 py-1.5 border-b border-border/30">
                <span className="text-[9px] font-mono text-indigo-400/70">{sc.inputModel}</span>
              </div>
              <div className="px-3 py-2 space-y-[2px]">
                {sc.fields.map((field, i) => {
                  const visible = i < revealedInput;
                  const isProcessed = phase === "filtering" || phase === "done" ? i < processedCount : false;

                  return (
                    <AnimatePresence key={field.key}>
                      {visible && (
                        <motion.div
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.15 }}
                          className={cn(
                            "flex items-center gap-1 py-[3px] px-2 rounded-md transition-all duration-300 text-[10px] sm:text-[11px] font-mono",
                            isProcessed && !field.passes
                              ? "bg-red-500/8 line-through opacity-50"
                              : isProcessed && field.passes
                                ? "bg-emerald-500/8"
                                : ""
                          )}
                        >
                          <span className="text-muted-foreground/50">{field.key}:</span>
                          <span className={cn(
                            "ml-1 truncate",
                            field.sensitive ? "text-red-400/70" : "text-foreground/70"
                          )}>
                            {field.sensitive && !isProcessed ? field.value : field.value}
                          </span>
                          {/* Status icon after processing */}
                          {isProcessed && (
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
            </div>
          </div>

          {/* ── Center: Filter arrow ── */}
          <div className="flex flex-col items-center justify-center pt-10 gap-2">
            <AnimatePresence>
              {(phase === "show-model" || phase === "filtering" || phase === "done") && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <motion.div
                    className={cn(
                      "size-9 rounded-xl border flex items-center justify-center transition-colors duration-300",
                      phase === "filtering"
                        ? "border-amber-500/30 bg-amber-500/10"
                        : phase === "done"
                          ? "border-emerald-500/30 bg-emerald-500/10"
                          : "border-indigo-500/20 bg-indigo-500/8"
                    )}
                    animate={phase === "filtering" ? { rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 0.6, repeat: phase === "filtering" ? Infinity : 0 }}
                  >
                    <Filter className={cn(
                      "size-4 transition-colors duration-300",
                      phase === "filtering" ? "text-amber-400" :
                      phase === "done" ? "text-emerald-400" :
                      "text-indigo-400/60"
                    )} />
                  </motion.div>
                  <span className="text-[8px] sm:text-[9px] font-mono text-muted-foreground/35 text-center max-w-[90px] sm:max-w-[110px] leading-tight">
                    {sc.filterDesc}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right: Filtered Output ── */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="size-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <EyeOff className="size-3 text-emerald-400" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground/60">
                API Response
              </span>
            </div>
            <div className={cn(
              "rounded-xl border overflow-hidden bg-card transition-colors duration-500",
              phase === "done" ? "border-emerald-500/25" : "border-border/40"
            )}>
              <div className="px-3 py-1.5 border-b border-border/30">
                <span className="text-[9px] font-mono text-emerald-400/70">{sc.outputModel}</span>
              </div>
              <div className="px-3 py-2 space-y-[2px] min-h-[60px]">
                <AnimatePresence>
                  {sc.fields.map((field, i) => {
                    const isProcessed = (phase === "filtering" || phase === "done") && i < processedCount;
                    if (!isProcessed || !field.passes) return null;

                    return (
                      <motion.div
                        key={field.key + "-out"}
                        initial={{ opacity: 0, x: -8, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="flex items-center gap-1 py-[3px] px-2 rounded-md text-[10px] sm:text-[11px] font-mono bg-emerald-500/5"
                      >
                        <span className="text-emerald-400/60">{field.key}:</span>
                        <span className="ml-1 text-foreground/70 truncate">{field.value}</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Empty state */}
                {phase !== "idle" && phase !== "show-input" && processedCount === 0 && (
                  <div className="flex items-center justify-center py-4">
                    <span className="text-[9px] text-muted-foreground/25 font-mono">waiting...</span>
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
            <div className="px-5 py-3.5 border-t bg-emerald-500/5 border-emerald-500/15 flex items-center gap-3">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="size-8 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/15"
              >
                <Filter className="size-4 text-emerald-400" />
              </motion.div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-emerald-400">
                  {passedFields.length} of {sc.fields.length} fields returned — {sc.resultText}
                </p>
                <p className="text-[9px] font-mono text-muted-foreground/50 mt-0.5">
                  {filteredFields.length > 0
                    ? `Filtered: ${filteredFields.map((f) => f.key).join(", ")}`
                    : "All fields passed through"}
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
