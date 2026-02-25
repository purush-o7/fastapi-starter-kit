"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, RotateCcw, Send, Zap, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─── */
type Phase = "idle" | "request" | "endpoint" | "raise" | "catch" | "response" | "done";

interface Scenario {
  id: string;
  label: string;
  method: string;
  path: string;
  endpointCode: string;
  raiseLine: string;
  statusCode: number;
  headers?: { key: string; value: string }[];
  responseBody: string;
  isError: boolean;
  detail: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "not-found",
    label: "404 Not Found",
    method: "GET",
    path: "/items/999",
    endpointCode: "item = items.get(999)",
    raiseLine: 'raise HTTPException(404, detail="Item not found")',
    statusCode: 404,
    responseBody: '{"detail": "Item not found"}',
    isError: true,
    detail: "Item doesn't exist in database — endpoint raises HTTPException which FastAPI converts to a JSON error response",
  },
  {
    id: "unauthorized",
    label: "401 Unauthorized",
    method: "GET",
    path: "/admin/stats",
    endpointCode: "token = request.headers.get('Authorization')",
    raiseLine: 'raise HTTPException(401, headers={"WWW-Authenticate": "Bearer"})',
    statusCode: 401,
    headers: [{ key: "WWW-Authenticate", value: "Bearer" }],
    responseBody: '{"detail": "Not authenticated"}',
    isError: true,
    detail: "Missing or invalid auth token — HTTPException includes a WWW-Authenticate header telling the client how to authenticate",
  },
  {
    id: "rich-detail",
    label: "Rich Detail",
    method: "POST",
    path: "/items",
    endpointCode: "if item.price < 0:",
    raiseLine: 'raise HTTPException(400, detail={"field": "price", ...})',
    statusCode: 400,
    responseBody: '{"detail": {"field": "price", "msg": "must be positive"}}',
    isError: true,
    detail: "The detail parameter accepts any JSON-serializable value — dicts, lists, or strings for structured error responses",
  },
];

/* ─── Component ─── */
export function ExceptionFlowSim() {
  const [selectedId, setSelectedId] = useState("not-found");
  const [phase, setPhase] = useState<Phase>("idle");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const sc = SCENARIOS.find((s) => s.id === selectedId)!;

  const clear = useCallback(() => { timersRef.current.forEach(clearTimeout); timersRef.current = []; }, []);
  const t = useCallback((fn: () => void, ms: number) => { timersRef.current.push(setTimeout(fn, ms)); }, []);

  const run = useCallback((s: Scenario) => {
    clear();
    setPhase("idle");
    t(() => setPhase("request"), 300);
    t(() => setPhase("endpoint"), 900);
    t(() => setPhase("raise"), 1600);
    t(() => setPhase("catch"), 2300);
    t(() => setPhase("response"), 2900);
    t(() => setPhase("done"), 3500);
  }, [clear, t]);

  useEffect(() => { run(sc); return clear; }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const phaseIdx = ["idle", "request", "endpoint", "raise", "catch", "response", "done"].indexOf(phase);

  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/20">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="size-2 rounded-full"
            animate={{
              backgroundColor: phase === "done" ? "rgb(239,68,68)" : phase === "raise" || phase === "catch" ? "rgb(245,158,11)" : phase === "idle" ? "rgba(239,68,68,0.4)" : "rgb(239,68,68)",
              scale: phase === "raise" ? [1, 1.4, 1] : 1,
            }}
            transition={{ scale: { repeat: Infinity, duration: 0.6 } }}
          />
          <span className="text-xs font-semibold tracking-wide">Exception Flow</span>
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
                  layoutId="exc-tab"
                  className="absolute inset-0 rounded-lg bg-red-500/8 border border-red-500/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visualization: vertical flow */}
      <div className="relative px-4 sm:px-5 py-5">
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="relative flex flex-col items-center gap-2 max-w-sm mx-auto">
          {/* Step 1: Request */}
          <AnimatePresence>
            {phaseIdx >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  "w-full px-4 py-2.5 rounded-xl border flex items-center gap-3 transition-colors duration-500",
                  phaseIdx >= 2 ? "border-border/30 bg-card" : "border-indigo-500/30 bg-indigo-500/8"
                )}
              >
                <div className={cn(
                  "size-7 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-500",
                  phaseIdx >= 2 ? "bg-muted/30" : "bg-indigo-500/15"
                )}>
                  <Send className={cn("size-3.5 transition-colors duration-500", phaseIdx >= 2 ? "text-muted-foreground/30" : "text-indigo-400")} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-muted-foreground/40">Request</span>
                  <p className="text-[11px] font-mono font-semibold text-foreground/70">{sc.method} {sc.path}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Arrow */}
          {phaseIdx >= 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }}><ArrowDown className="size-4 text-muted-foreground" /></motion.div>
          )}

          {/* Step 2: Endpoint */}
          <AnimatePresence>
            {phaseIdx >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  "w-full rounded-xl border overflow-hidden transition-colors duration-500",
                  phaseIdx === 2 ? "border-amber-500/30" : phaseIdx >= 3 ? "border-red-500/25" : "border-border/30"
                )}
              >
                <div className="px-4 py-2 bg-card border-b border-border/30">
                  <span className="text-[9px] font-mono text-muted-foreground/40">endpoint</span>
                </div>
                <div className="px-4 py-2.5 bg-card space-y-1">
                  <p className={cn(
                    "text-[10px] sm:text-[11px] font-mono transition-colors duration-300",
                    phaseIdx >= 2 && phaseIdx < 3 ? "text-foreground/60" : "text-muted-foreground/40"
                  )}>
                    {sc.endpointCode}
                  </p>
                  <motion.p
                    className={cn(
                      "text-[10px] sm:text-[11px] font-mono font-semibold transition-all duration-300",
                      phaseIdx >= 3 ? "text-red-400" : "text-muted-foreground/40"
                    )}
                    animate={phaseIdx === 3 ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 0.4, repeat: phaseIdx === 3 ? 2 : 0 }}
                  >
                    {sc.raiseLine}
                  </motion.p>
                </div>
                {/* Raise flash */}
                {phaseIdx === 3 && (
                  <motion.div
                    className="h-[2px] bg-red-500/40"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Arrow */}
          {phaseIdx >= 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }}><ArrowDown className="size-4 text-muted-foreground" /></motion.div>
          )}

          {/* Step 3: FastAPI catches */}
          <AnimatePresence>
            {phaseIdx >= 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="w-full px-4 py-2.5 rounded-xl border border-amber-500/25 bg-amber-500/5 flex items-center gap-3"
              >
                <div className="size-7 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                  <AlertTriangle className="size-3.5 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-mono text-amber-400/60">FastAPI catches exception</span>
                  <p className="text-[10px] font-mono text-amber-400/80 truncate">
                    status={sc.statusCode}{sc.headers ? ` + ${sc.headers.length} header` : ""}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Arrow */}
          {phaseIdx >= 5 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }}><ArrowDown className="size-4 text-muted-foreground" /></motion.div>
          )}

          {/* Step 4: JSON Response */}
          <AnimatePresence>
            {phaseIdx >= 5 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="w-full rounded-xl border border-red-500/25 overflow-hidden"
              >
                <div className="px-4 py-2 bg-card border-b border-border/30 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-muted-foreground/40">response</span>
                  <span className="text-[9px] font-mono font-bold text-red-400">{sc.statusCode}</span>
                </div>
                <div className="px-4 py-2.5 bg-card">
                  <p className="text-[10px] sm:text-[11px] font-mono text-red-400/80 break-all">
                    {sc.responseBody}
                  </p>
                  {sc.headers && (
                    <div className="mt-1.5 pt-1.5 border-t border-border/20">
                      {sc.headers.map((h) => (
                        <p key={h.key} className="text-[9px] font-mono text-amber-400/60">
                          {h.key}: {h.value}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
            <div className="px-5 py-3.5 border-t bg-red-500/5 border-red-500/15 flex items-center gap-3">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="size-8 rounded-xl flex items-center justify-center text-[10px] font-bold font-mono shrink-0 bg-red-500/15 text-red-400"
              >
                {sc.statusCode}
              </motion.div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-red-400">
                  HTTPException → JSON error response
                </p>
                <p className="text-[9px] font-mono text-muted-foreground/50 mt-0.5 truncate">
                  raise HTTPException(status_code={sc.statusCode})
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
