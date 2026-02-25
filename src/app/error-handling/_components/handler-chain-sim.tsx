"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, RotateCcw, Shield, FileWarning, Server, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─── */
type Phase = "idle" | "error-raised" | "check-0" | "check-1" | "check-2" | "handle" | "done";

interface Handler {
  name: string;
  catches: string;
  icon: typeof Shield;
  color: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
}

const HANDLERS: Handler[] = [
  { name: "Custom Handler", catches: "ItemNotFound", icon: Shield, color: "purple", borderClass: "border-purple-500/25", bgClass: "bg-purple-500/8", textClass: "text-purple-400" },
  { name: "Validation Handler", catches: "RequestValidationError", icon: FileWarning, color: "amber", borderClass: "border-amber-500/25", bgClass: "bg-amber-500/8", textClass: "text-amber-400" },
  { name: "Default Handler", catches: "HTTPException", icon: Server, color: "red", borderClass: "border-red-500/25", bgClass: "bg-red-500/8", textClass: "text-red-400" },
];

interface Scenario {
  id: string;
  label: string;
  errorType: string;
  errorDetail: string;
  matchesIndex: number; // which handler catches it (0, 1, or 2)
  statusCode: number;
  responseBody: string;
  detail: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "custom",
    label: "Custom Exception",
    errorType: "ItemNotFound",
    errorDetail: 'item_id=999',
    matchesIndex: 0,
    statusCode: 404,
    responseBody: '{"error": "item_not_found", "item_id": 999}',
    detail: "Custom ItemNotFound exception → matched by your registered handler → returns your formatted JSON response",
  },
  {
    id: "validation",
    label: "Validation Override",
    errorType: "RequestValidationError",
    errorDetail: "name: field required",
    matchesIndex: 1,
    statusCode: 422,
    responseBody: '{"errors": ["name: field required"]}',
    detail: "Pydantic validation fails → your overridden handler simplifies the error format instead of FastAPI's default",
  },
  {
    id: "default",
    label: "Default Handler",
    errorType: "HTTPException(500)",
    errorDetail: "Internal server error",
    matchesIndex: 2,
    statusCode: 500,
    responseBody: '{"detail": "Internal server error"}',
    detail: "No custom handler registered for this exception type → falls through to FastAPI's built-in default handler",
  },
];

/* ─── Component ─── */
export function HandlerChainSim() {
  const [selectedId, setSelectedId] = useState("custom");
  const [phase, setPhase] = useState<Phase>("idle");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const sc = SCENARIOS.find((s) => s.id === selectedId)!;

  const clear = useCallback(() => { timersRef.current.forEach(clearTimeout); timersRef.current = []; }, []);
  const t = useCallback((fn: () => void, ms: number) => { timersRef.current.push(setTimeout(fn, ms)); }, []);

  const run = useCallback((s: Scenario) => {
    clear();
    setPhase("idle");
    let delay = 300;
    t(() => setPhase("error-raised"), delay);
    delay += 600;
    // Check each handler in order up to the matching one
    for (let i = 0; i <= s.matchesIndex; i++) {
      t(() => setPhase(`check-${i}` as Phase), delay);
      delay += i === s.matchesIndex ? 600 : 500;
    }
    t(() => setPhase("handle"), delay);
    delay += 500;
    t(() => setPhase("done"), delay);
  }, [clear, t]);

  useEffect(() => { run(sc); return clear; }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentCheckIdx = phase.startsWith("check-") ? parseInt(phase.split("-")[1]) : -1;
  const isHandling = phase === "handle" || phase === "done";

  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/20">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="size-2 rounded-full"
            animate={{
              backgroundColor: phase === "done" ? "rgb(16,185,129)" : currentCheckIdx >= 0 ? "rgb(245,158,11)" : "rgba(245,158,11,0.4)",
              scale: currentCheckIdx >= 0 && !isHandling ? [1, 1.4, 1] : 1,
            }}
            transition={{ scale: { repeat: Infinity, duration: 0.6 } }}
          />
          <span className="text-xs font-semibold tracking-wide">Handler Chain</span>
        </div>
        <button onClick={() => run(sc)} className="text-muted-foreground/40 hover:text-foreground transition-colors p-1 cursor-pointer">
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      {/* Tabs */}
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
                  layoutId="handler-tab"
                  className="absolute inset-0 rounded-lg bg-amber-500/8 border border-amber-500/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visualization */}
      <div className="relative px-4 sm:px-5 py-5">
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        {/* Error badge */}
        <AnimatePresence>
          {phase !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/20 bg-red-500/8">
                <AlertTriangle className="size-3 text-red-400" />
                <span className="text-[10px] font-mono font-semibold text-red-400">{sc.errorType}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Handler chain — horizontal on sm+, vertical on mobile */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
          {HANDLERS.map((handler, i) => {
            const isChecking = currentCheckIdx === i;
            const wasSkipped = currentCheckIdx > i || (isHandling && i < sc.matchesIndex);
            const isMatch = (isChecking && i === sc.matchesIndex) || (isHandling && i === sc.matchesIndex);
            const HandlerIcon = handler.icon;

            return (
              <motion.div
                key={handler.name}
                className={cn(
                  "flex-1 rounded-xl border overflow-hidden bg-card transition-all duration-300",
                  isMatch ? "border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.08)]" :
                  isChecking ? cn(handler.borderClass) :
                  wasSkipped ? "border-border/20 opacity-50" :
                  "border-border/30"
                )}
              >
                {/* Handler header */}
                <div className={cn(
                  "px-3 py-2 border-b transition-colors duration-300 flex items-center gap-2",
                  isMatch ? "border-emerald-500/20 bg-emerald-500/5" :
                  isChecking ? cn(handler.bgClass, handler.borderClass) :
                  "border-border/20"
                )}>
                  <div className={cn(
                    "size-6 rounded-md flex items-center justify-center transition-colors duration-300",
                    isMatch ? "bg-emerald-500/15" : isChecking ? handler.bgClass : "bg-muted/30"
                  )}>
                    <HandlerIcon className={cn(
                      "size-3 transition-colors duration-300",
                      isMatch ? "text-emerald-400" : isChecking ? handler.textClass : "text-muted-foreground/30"
                    )} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-semibold transition-colors duration-300",
                    isMatch ? "text-emerald-400" : isChecking ? handler.textClass : "text-muted-foreground/40"
                  )}>
                    {handler.name}
                  </span>
                </div>

                {/* Handler body */}
                <div className="px-3 py-2 min-h-[44px] flex items-center">
                  <AnimatePresence mode="wait">
                    {isMatch && (
                      <motion.div
                        key="match"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5"
                      >
                        <Check className="size-3 text-emerald-400 shrink-0" />
                        <span className="text-[9px] font-mono text-emerald-400/80">Caught!</span>
                      </motion.div>
                    )}
                    {wasSkipped && !isMatch && (
                      <motion.div
                        key="skip"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-1.5"
                      >
                        <X className="size-3 text-muted-foreground/25 shrink-0" />
                        <span className="text-[9px] font-mono text-muted-foreground/25">Skip</span>
                      </motion.div>
                    )}
                    {isChecking && !isMatch && (
                      <motion.div
                        key="checking"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-1.5"
                      >
                        <motion.div
                          className={cn("size-1.5 rounded-full", handler.textClass.replace("text-", "bg-"))}
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ repeat: Infinity, duration: 0.5 }}
                        />
                        <span className={cn("text-[9px] font-mono", handler.textClass)}>
                          Checking...
                        </span>
                      </motion.div>
                    )}
                    {!isChecking && !wasSkipped && !isMatch && (
                      <motion.span key="idle" className="text-[9px] font-mono text-muted-foreground/20">
                        catches: {handler.catches}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Result Footer */}
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
              sc.statusCode >= 500 ? "bg-red-500/5 border-red-500/15" : "bg-amber-500/5 border-amber-500/15"
            )}>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={cn(
                  "size-8 rounded-xl flex items-center justify-center text-[10px] font-bold font-mono shrink-0",
                  sc.statusCode >= 500 ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"
                )}
              >
                {sc.statusCode}
              </motion.div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-foreground/70">
                  Handled by: {HANDLERS[sc.matchesIndex].name}
                </p>
                <p className="text-[9px] font-mono text-muted-foreground/50 mt-0.5 truncate">
                  {sc.responseBody}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Description */}
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
