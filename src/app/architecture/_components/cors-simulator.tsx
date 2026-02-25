"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe, Server, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "idle" | "request-fly" | "hit-gate" | "gate-decide" | "pass-through" | "bounce-back" | "result";

interface Scenario {
  id: string;
  label: string;
  origin: string;
  server: string;
  method: string;
  corsConfig: string | null;
  allowed: boolean;
  hasPreflight: boolean;
  detail: string;
}

const SCENARIOS: Scenario[] = [
  { id: "same", label: "Same Origin", origin: "localhost:8000", server: "localhost:8000", method: "GET", corsConfig: null, allowed: true, hasPreflight: false, detail: "Same origin — no CORS check needed" },
  { id: "nocors", label: "No CORS", origin: "localhost:3000", server: "localhost:8000", method: "GET", corsConfig: "None", allowed: false, hasPreflight: false, detail: "Cross-origin without CORSMiddleware configured" },
  { id: "allowed", label: "Allowed", origin: "localhost:3000", server: "localhost:8000", method: "GET", corsConfig: '["localhost:3000"]', allowed: true, hasPreflight: false, detail: "Origin matches allow_origins — request passes" },
  { id: "blocked", label: "Blocked", origin: "evil.com", server: "localhost:8000", method: "GET", corsConfig: '["localhost:3000"]', allowed: false, hasPreflight: false, detail: "Origin not in allow_origins — response blocked" },
  { id: "preflight", label: "Preflight", origin: "localhost:3000", server: "localhost:8000", method: "POST", corsConfig: '["localhost:3000"]', allowed: true, hasPreflight: true, detail: "POST + JSON triggers OPTIONS preflight first" },
];

/* SVG gate with animated segments */
function SecurityGate({ state }: { state: "idle" | "scanning" | "open" | "sealed" }) {
  const gateColor = state === "scanning" ? "#f59e0b" : state === "open" ? "#10b981" : state === "sealed" ? "#ef4444" : "currentColor";
  const segments = 5;
  const segmentHeight = 18;
  const gap = state === "open" ? 8 : 2;
  const totalH = segments * segmentHeight + (segments - 1) * gap;

  return (
    <div className="relative flex flex-col items-center">
      {/* Glow behind gate */}
      <motion.div
        className="absolute inset-0 -inset-x-4 rounded-2xl"
        animate={{
          boxShadow: state === "scanning"
            ? `0 0 40px 12px rgba(245, 158, 11, 0.12)`
            : state === "open"
              ? `0 0 40px 12px rgba(16, 185, 129, 0.12)`
              : state === "sealed"
                ? `0 0 40px 12px rgba(239, 68, 68, 0.15)`
                : `0 0 0px 0px rgba(0,0,0,0)`,
        }}
        transition={{ duration: 0.5 }}
      />

      <svg width="28" height={totalH} viewBox={`0 0 28 ${totalH}`} className="relative z-10">
        {Array.from({ length: segments }).map((_, i) => {
          const y = i * (segmentHeight + gap);
          const isCenter = i === Math.floor(segments / 2);
          const spread = state === "open" ? (i - 2) * 6 : 0;

          return (
            <motion.rect
              key={i}
              x="2"
              width="24"
              height={segmentHeight}
              rx="4"
              fill={gateColor}
              fillOpacity={state === "idle" ? 0.15 : state === "scanning" ? 0.35 : state === "open" ? 0.2 : 0.5}
              stroke={gateColor}
              strokeOpacity={state === "idle" ? 0.2 : 0.6}
              strokeWidth="1.5"
              animate={{
                y: y + spread,
                opacity: state === "open" && !isCenter ? 0.15 : 1,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25, delay: i * 0.03 }}
            />
          );
        })}

        {/* Center scan line when scanning */}
        {state === "scanning" && (
          <motion.line
            x1="0" x2="28"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ y1: 0, y2: 0, opacity: 0 }}
            animate={{ y1: [0, totalH, 0], y2: [0, totalH, 0], opacity: [0.8, 0.8, 0.8] }}
            transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
          />
        )}
      </svg>

      {/* Gate label */}
      <motion.span
        className="text-[8px] font-mono font-bold uppercase tracking-[0.2em] mt-2"
        animate={{
          color: state === "scanning" ? "#f59e0b" : state === "open" ? "#10b981" : state === "sealed" ? "#ef4444" : "rgba(156,163,175,0.4)",
        }}
        transition={{ duration: 0.3 }}
      >
        {state === "scanning" ? "Checking" : state === "open" ? "Pass" : state === "sealed" ? "Deny" : "CORS"}
      </motion.span>
    </div>
  );
}

export function CorsSimulator() {
  const [selectedId, setSelectedId] = useState("same");
  const [phase, setPhase] = useState<Phase>("idle");
  const [preflightDone, setPreflightDone] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const sc = SCENARIOS.find((s) => s.id === selectedId)!;

  const clear = useCallback(() => { timersRef.current.forEach(clearTimeout); timersRef.current = []; }, []);
  const t = useCallback((fn: () => void, ms: number) => { timersRef.current.push(setTimeout(fn, ms)); }, []);

  const run = useCallback((s: Scenario) => {
    clear();
    setPhase("idle");
    setPreflightDone(false);

    if (s.hasPreflight) {
      t(() => setPhase("request-fly"), 300);
      t(() => setPhase("hit-gate"), 1000);
      t(() => setPhase("gate-decide"), 1400);
      t(() => { setPreflightDone(true); setPhase("pass-through"); }, 2000);
      t(() => setPhase("request-fly"), 2600);
      t(() => setPhase("hit-gate"), 3300);
      t(() => setPhase("gate-decide"), 3700);
      t(() => setPhase(s.allowed ? "pass-through" : "bounce-back"), 4300);
      t(() => setPhase("result"), 4900);
    } else {
      t(() => setPhase("request-fly"), 300);
      t(() => setPhase("hit-gate"), 1000);
      t(() => setPhase("gate-decide"), 1400);
      t(() => setPhase(s.allowed ? "pass-through" : "bounce-back"), 2000);
      t(() => setPhase("result"), 2600);
    }
  }, [clear, t]);

  useEffect(() => { run(sc); return clear; }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const gateState =
    phase === "gate-decide" ? "scanning" :
    phase === "pass-through" ? "open" :
    phase === "bounce-back" ? "sealed" :
    phase === "result" ? (sc.allowed ? "open" : "sealed") :
    "idle";

  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="size-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide">CORS Simulator</span>
        </div>
        <button onClick={() => run(sc)} className="text-muted-foreground/50 hover:text-foreground transition-colors p-1 cursor-pointer">
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      {/* Scenario tabs */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex gap-1">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer relative",
                selectedId === s.id
                  ? "text-foreground"
                  : "text-muted-foreground/60 hover:text-muted-foreground"
              )}
            >
              {selectedId === s.id && (
                <motion.div
                  layoutId="cors-tab"
                  className="absolute inset-0 rounded-lg bg-purple-500/10 border border-purple-500/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visualization area */}
      <div className="relative px-5 py-6">
        {/* Subtle dot grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Main flow */}
        <div className="relative flex items-center justify-between h-[140px]">
          {/* Browser node */}
          <div className="flex flex-col items-center gap-2 w-20 z-10">
            <motion.div
              className={cn(
                "size-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-500",
                phase === "result" && sc.allowed ? "border-emerald-500/40 bg-emerald-500/8" :
                phase === "result" && !sc.allowed ? "border-red-500/40 bg-red-500/8" :
                phase === "request-fly" ? "border-purple-500/40 bg-purple-500/8" :
                "border-border/40 bg-muted/20"
              )}
              animate={phase === "request-fly" ? { scale: [1, 0.9, 1] } : {}}
              transition={{ duration: 0.25 }}
            >
              <Globe className={cn(
                "size-6 transition-colors duration-500",
                phase === "result" && sc.allowed ? "text-emerald-400" :
                phase === "result" && !sc.allowed ? "text-red-400" :
                phase === "request-fly" ? "text-purple-400" :
                "text-muted-foreground/50"
              )} />
            </motion.div>
            <div className="text-center">
              <p className="text-[10px] font-semibold text-muted-foreground/70">Browser</p>
              <p className="text-[9px] font-mono text-purple-400/80 mt-0.5">{sc.origin}</p>
            </div>
          </div>

          {/* Connection line left */}
          <div className="absolute left-20 right-1/2 top-[28px] mr-6 h-px">
            <div className="h-full bg-gradient-to-r from-border/20 via-border/50 to-border/50" />
            {/* Animated pulse along line */}
            <AnimatePresence>
              {phase === "request-fly" && (
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-purple-400"
                  initial={{ left: "0%", opacity: 0 }}
                  animate={{ left: "100%", opacity: [0, 1, 1, 0.5] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, ease: "easeOut" }}
                  style={{ boxShadow: "0 0 8px 2px rgba(168, 85, 247, 0.4)" }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Connection line right */}
          <div className="absolute left-1/2 right-20 top-[28px] ml-6 h-px">
            <div className="h-full bg-gradient-to-r from-border/50 via-border/50 to-border/20" />
            <AnimatePresence>
              {phase === "pass-through" && (
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-emerald-400"
                  initial={{ left: "0%", opacity: 0 }}
                  animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{ boxShadow: "0 0 8px 2px rgba(16, 185, 129, 0.4)" }}
                />
              )}
              {phase === "bounce-back" && (
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-red-400"
                  initial={{ left: "10%", opacity: 1 }}
                  animate={{ left: "-80%", opacity: [1, 1, 0] }}
                  transition={{ duration: 0.5, ease: [0.6, 0, 0.3, 1] }}
                  style={{ boxShadow: "0 0 8px 2px rgba(239, 68, 68, 0.4)" }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* CORS Gate (center) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 z-10">
            <SecurityGate state={gateState} />
          </div>

          {/* Server node */}
          <div className="flex flex-col items-center gap-2 w-20 z-10">
            <motion.div
              className={cn(
                "size-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-500",
                phase === "pass-through" ? "border-emerald-500/40 bg-emerald-500/8" :
                "border-border/40 bg-muted/20"
              )}
            >
              <Server className={cn(
                "size-6 transition-colors duration-500",
                phase === "pass-through" ? "text-emerald-400" : "text-muted-foreground/50"
              )} />
            </motion.div>
            <div className="text-center">
              <p className="text-[10px] font-semibold text-muted-foreground/70">FastAPI</p>
              <p className="text-[9px] font-mono text-purple-400/80 mt-0.5">{sc.server}</p>
            </div>
          </div>

          {/* Flying request label */}
          <AnimatePresence>
            {phase === "request-fly" && (
              <motion.div
                key={"lbl-" + preflightDone}
                className="absolute left-1/2 -translate-x-[140%] top-1"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className={cn(
                  "text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border",
                  sc.hasPreflight && !preflightDone
                    ? "text-amber-400 bg-amber-500/10 border-amber-500/25"
                    : "text-purple-400 bg-purple-500/10 border-purple-500/25"
                )}>
                  {sc.hasPreflight && !preflightDone ? "OPTIONS" : sc.method}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shield-check origin comparison */}
          <AnimatePresence>
            {phase === "gate-decide" && (
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 bottom-0 flex flex-col items-center gap-1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-[8px] font-mono text-muted-foreground/60 flex items-center gap-1.5">
                  <span className="text-purple-400">{sc.origin}</span>
                  <span>{sc.allowed ? "=" : "≠"}</span>
                  <span className={sc.allowed ? "text-emerald-400" : "text-red-400"}>
                    {sc.corsConfig ?? "same"}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Result footer */}
      <AnimatePresence mode="wait">
        {phase === "result" && (
          <motion.div
            key={selectedId + "-r"}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className={cn(
              "px-5 py-3 border-t flex items-center gap-3",
              sc.allowed ? "bg-emerald-500/5 border-emerald-500/15" : "bg-red-500/5 border-red-500/15"
            )}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className={cn(
                  "size-7 rounded-full flex items-center justify-center text-[11px] font-bold font-mono shrink-0",
                  sc.allowed ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                )}
              >
                {sc.allowed ? "OK" : "NO"}
              </motion.div>
              <div className="min-w-0">
                <p className={cn("text-[11px] font-semibold", sc.allowed ? "text-emerald-400" : "text-red-400")}>
                  {sc.allowed ? "Response delivered" : "Response blocked by browser"}
                </p>
                <p className="text-[9px] font-mono text-muted-foreground/60 mt-0.5 truncate">
                  {sc.corsConfig === null ? "Same origin — no CORS headers needed"
                    : sc.allowed ? `Access-Control-Allow-Origin: ${sc.origin}` : "Header missing or origin not matched"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Description bar */}
      <div className="px-5 py-2.5 border-t bg-muted/10">
        <AnimatePresence mode="wait">
          <motion.p
            key={selectedId}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
            className="text-[10px] text-muted-foreground/60"
          >
            {sc.detail}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
