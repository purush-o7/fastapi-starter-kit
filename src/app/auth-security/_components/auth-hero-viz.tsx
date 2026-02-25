"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Server, RotateCcw, X, Check, KeyRound, ArrowRight, Send } from "lucide-react";
import { cn } from "@/lib/utils";

/*
  The 5-step auth story:
  1. GET /users/me (no token)  → 401 Unauthorized
  2. POST /token (credentials) → (server checking...)
  3. (server responds)         ← 200 + JWT token
  4. GET /users/me (with token)→ (server verifying...)
  5. (server responds)         ← 200 + user data
*/

interface Step {
  id: string;
  label: string;
  subtitle: string;
  clientLabel: string;
  serverLabel: string;
  // Phase A: request flies Client → Server (right)
  reqPacket: { method: string; path: string; extra?: string } | null;
  // Phase B: response flies Server → Client (left)
  resPacket: { status: number; label: string; isToken?: boolean } | null;
  annotation: string;
  tone: "red" | "amber" | "emerald";
}

const STEPS: Step[] = [
  {
    id: "no-token",
    label: "1. No Token",
    subtitle: "Rejected",
    clientLabel: "Tries protected endpoint",
    serverLabel: '"Who are you?"',
    reqPacket: { method: "GET", path: "/users/me" },
    resPacket: { status: 401, label: "Unauthorized" },
    annotation: "Without a token, the server rejects you. You need to prove your identity first.",
    tone: "red",
  },
  {
    id: "login",
    label: "2. Login",
    subtitle: "Send credentials",
    clientLabel: "Sends username & password",
    serverLabel: "Verifying...",
    reqPacket: { method: "POST", path: "/token", extra: "user + pass" },
    resPacket: null,
    annotation: "The client sends credentials to POST /token. The server hashes the password and checks it.",
    tone: "amber",
  },
  {
    id: "token-back",
    label: "3. Token",
    subtitle: "JWT issued",
    clientLabel: "Saves the token",
    serverLabel: "Creates signed JWT",
    reqPacket: null,
    resPacket: { status: 200, label: "access_token", isToken: true },
    annotation: "Server creates a JWT with your user ID and an expiry. This is your proof of identity.",
    tone: "emerald",
  },
  {
    id: "authed-request",
    label: "4. Authorized",
    subtitle: "Token attached",
    clientLabel: "Attaches token to header",
    serverLabel: "Decoding JWT...",
    reqPacket: { method: "GET", path: "/users/me", extra: "+ Bearer token" },
    resPacket: null,
    annotation: "Now every request carries the JWT in the Authorization: Bearer header.",
    tone: "amber",
  },
  {
    id: "success",
    label: "5. Success",
    subtitle: "Access granted",
    clientLabel: "Receives protected data",
    serverLabel: '"Hello, user123!"',
    reqPacket: null,
    resPacket: { status: 200, label: '{"user": "user123"}' },
    annotation: "The server decoded your token, verified the signature, and knows who you are. Access granted.",
    tone: "emerald",
  },
];

// Phase within each step: idle → reqFly → reqArrive → resFly → resArrive → done
type SubPhase = "idle" | "req-fly" | "req-arrive" | "res-fly" | "res-arrive" | "done";

export function AuthHeroViz() {
  const [stepIdx, setStepIdx] = useState(0);
  const [subPhase, setSubPhase] = useState<SubPhase>("idle");
  const [hasToken, setHasToken] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const step = STEPS[stepIdx];

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const runStep = useCallback((idx: number) => {
    clear();
    const s = STEPS[idx];
    setSubPhase("idle");

    let t = 300;

    // Phase A: request flies right
    if (s.reqPacket) {
      schedule(() => setSubPhase("req-fly"), t);
      t += 900;
      schedule(() => setSubPhase("req-arrive"), t);
      t += 500;
    }

    // Phase B: response flies left
    if (s.resPacket) {
      schedule(() => setSubPhase("res-fly"), t);
      t += 900;
      schedule(() => {
        setSubPhase("res-arrive");
        // Grant token after step 3 response arrives
        if (idx === 2) setHasToken(true);
      }, t);
      t += 600;
    }

    // Advance to next step
    schedule(() => setSubPhase("done"), t);
    t += 600;
    schedule(() => {
      if (idx < STEPS.length - 1) {
        setStepIdx(idx + 1);
      } else {
        setHasToken(false);
        setStepIdx(0);
      }
    }, t);
  }, [clear, schedule]);

  useEffect(() => {
    runStep(stepIdx);
    return clear;
  }, [stepIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const jumpTo = (i: number) => {
    clear();
    setSubPhase("idle");
    setHasToken(i > 2);
    setStepIdx(i);
  };

  const replay = () => {
    clear();
    setHasToken(false);
    setSubPhase("idle");
    setStepIdx(0);
  };

  const toneColors = {
    red: { bg: "bg-red-500", text: "text-red-400", border: "border-red-500", light: "bg-red-500/8", glow: "#ef4444" },
    amber: { bg: "bg-amber-500", text: "text-amber-400", border: "border-amber-500", light: "bg-amber-500/8", glow: "#f59e0b" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500", light: "bg-emerald-500/8", glow: "#10b981" },
  };
  const tc = toneColors[step.tone];

  // Is the request or response currently in-flight?
  const reqFlying = subPhase === "req-fly";
  const reqArrived = subPhase === "req-arrive" || subPhase === "res-fly" || subPhase === "res-arrive" || subPhase === "done";
  const resFlying = subPhase === "res-fly";
  const resArrived = subPhase === "res-arrive" || subPhase === "done";

  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/20">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="size-2 rounded-full"
            animate={{ backgroundColor: tc.glow, boxShadow: `0 0 6px ${tc.glow}50` }}
            transition={{ duration: 0.4 }}
          />
          <span className="text-sm font-semibold tracking-wide">OAuth2 + JWT — The Full Story</span>
        </div>
        <button onClick={replay} className="text-muted-foreground/50 hover:text-foreground transition-colors p-1 cursor-pointer">
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      {/* Step tabs */}
      <div className="px-5 py-2 border-b border-border/20 bg-muted/5 flex items-center gap-0.5 overflow-x-auto">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => jumpTo(i)}
            className={cn(
              "shrink-0 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer relative",
              stepIdx === i ? "text-foreground" : "text-muted-foreground/35 hover:text-muted-foreground/60"
            )}
          >
            {stepIdx === i && (
              <motion.div
                layoutId="auth-tab"
                className={cn("absolute inset-0 rounded-md border", `${tc.light} ${tc.border}/20`)}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Main visualization */}
      <div className="px-4 sm:px-6 py-8 relative">
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

        <div className="relative flex items-start justify-between">
          {/* ===== CLIENT NODE ===== */}
          <div className="flex flex-col items-center gap-2 w-[72px] sm:w-24 shrink-0 z-10">
            <motion.div
              className={cn(
                "size-14 sm:size-16 rounded-2xl border-2 flex items-center justify-center relative overflow-hidden transition-colors duration-500",
                resArrived && step.tone === "red" ? "border-red-500/40" :
                resArrived && step.tone === "emerald" ? "border-emerald-500/40" :
                reqFlying ? `${tc.border}/30` :
                "border-border/25"
              )}
            >
              {/* Bg glow */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  backgroundColor:
                    resArrived && step.tone === "red" ? "rgba(239,68,68,0.06)" :
                    resArrived && step.tone === "emerald" ? "rgba(16,185,129,0.06)" :
                    reqFlying ? `${tc.glow}08` :
                    "rgba(0,0,0,0)"
                }}
                transition={{ duration: 0.4 }}
              />
              <User className={cn(
                "size-6 sm:size-7 relative z-10 transition-colors duration-500",
                resArrived && step.tone === "red" ? "text-red-400" :
                resArrived && step.tone === "emerald" ? "text-emerald-400" :
                "text-muted-foreground/50"
              )} />

              {/* Token badge on client */}
              <AnimatePresence>
                {hasToken && (
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 20 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="absolute -bottom-1 -right-1 z-20"
                  >
                    <div className="size-5 sm:size-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center"
                      style={{ boxShadow: "0 0 8px rgba(245,158,11,0.15)" }}
                    >
                      <KeyRound className="size-2.5 sm:size-3 text-amber-400" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <div className="text-center">
              <p className="text-[11px] font-semibold text-muted-foreground/60">Client</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[9px] font-mono text-muted-foreground/40 mt-0.5 leading-snug"
                >
                  {step.clientLabel}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* ===== CONNECTION LANE ===== */}
          <div className="flex-1 mx-3 sm:mx-4 self-start mt-7 sm:mt-8">
            {/* Lane background */}
            <div className="relative h-14 sm:h-16">
              {/* Base line */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-border/40 via-border/25 to-border/40" />

              {/* Direction label */}
              <AnimatePresence mode="wait">
                {(reqFlying || resFlying) && (
                  <motion.div
                    key={reqFlying ? "req" : "res"}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute left-1/2 -translate-x-1/2 -top-1 text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground/30"
                  >
                    {reqFlying ? "Request →" : "← Response"}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── REQUEST PACKET (flies left → right) ── */}
              <AnimatePresence>
                {reqFlying && step.reqPacket && (
                  <motion.div
                    key={`req-${stepIdx}`}
                    className="absolute top-1/2 -translate-y-1/2 z-20"
                    initial={{ left: "-5%", opacity: 0 }}
                    animate={{ left: "85%", opacity: 1 }}
                    exit={{ left: "105%", opacity: 0 }}
                    transition={{ duration: 0.85, ease: [0.32, 0.72, 0.35, 1.0] }}
                  >
                    {/* Glow trail */}
                    <motion.div
                      className="absolute right-full top-1/2 -translate-y-1/2 h-0.5 rounded-full"
                      style={{ backgroundColor: step.tone === "red" ? "#a78bfa" : tc.glow, width: 20 }}
                      animate={{ opacity: [0.5, 0.1], scaleX: [1, 0.3] }}
                      transition={{ duration: 0.3, repeat: Infinity }}
                    />
                    <div className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold whitespace-nowrap",
                      step.id === "no-token"
                        ? "bg-purple-500/15 border-purple-500/30 text-purple-300"
                        : step.reqPacket.extra?.includes("Bearer")
                          ? "bg-emerald-500/12 border-emerald-500/25 text-emerald-400"
                          : "bg-amber-500/12 border-amber-500/25 text-amber-400"
                    )} style={{
                      boxShadow: `0 2px 12px ${step.id === "no-token" ? "rgba(139,92,246,0.15)" : step.reqPacket.extra?.includes("Bearer") ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)"}`,
                    }}>
                      <Send className="size-2.5 opacity-60" />
                      <span className="font-bold">{step.reqPacket.method}</span>
                      <span className="opacity-60">{step.reqPacket.path}</span>
                      {step.reqPacket.extra && (
                        <span className="text-[9px] opacity-40 hidden sm:inline">{step.reqPacket.extra}</span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── RESPONSE PACKET (flies right → left) ── */}
              <AnimatePresence>
                {resFlying && step.resPacket && (
                  <motion.div
                    key={`res-${stepIdx}`}
                    className="absolute top-1/2 -translate-y-1/2 z-20"
                    initial={{ left: "95%", opacity: 0 }}
                    animate={{ left: "5%", opacity: 1 }}
                    exit={{ left: "-15%", opacity: 0 }}
                    transition={{ duration: 0.85, ease: [0.32, 0.72, 0.35, 1.0] }}
                  >
                    {/* Glow trail */}
                    <motion.div
                      className="absolute left-full top-1/2 -translate-y-1/2 h-0.5 rounded-full"
                      style={{ backgroundColor: tc.glow, width: 20 }}
                      animate={{ opacity: [0.5, 0.1], scaleX: [1, 0.3] }}
                      transition={{ duration: 0.3, repeat: Infinity }}
                    />
                    <div className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold whitespace-nowrap",
                      step.resPacket.status === 401
                        ? "bg-red-500/15 border-red-500/30 text-red-400"
                        : step.resPacket.isToken
                          ? "bg-amber-500/12 border-amber-500/25 text-amber-400"
                          : "bg-emerald-500/12 border-emerald-500/25 text-emerald-400"
                    )} style={{
                      boxShadow: `0 2px 12px ${step.resPacket.status === 401 ? "rgba(239,68,68,0.15)" : step.resPacket.isToken ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)"}`,
                    }}>
                      <span className="font-bold">{step.resPacket.status}</span>
                      {step.resPacket.isToken && <KeyRound className="size-2.5" />}
                      <span className="opacity-60 text-[10px] hidden sm:inline">{step.resPacket.label}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Arrival flash: request reached server */}
              <AnimatePresence>
                {reqArrived && step.reqPacket && !resFlying && !resArrived && (
                  <motion.div
                    key={`req-arrived-${stepIdx}`}
                    className="absolute right-0 top-1/2 -translate-y-1/2"
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ scale: [0, 1.5], opacity: [0.6, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="size-3 rounded-full" style={{ backgroundColor: tc.glow }} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Arrival flash: response reached client */}
              <AnimatePresence>
                {resArrived && step.resPacket && subPhase === "res-arrive" && (
                  <motion.div
                    key={`res-arrived-${stepIdx}`}
                    className="absolute left-0 top-1/2 -translate-y-1/2"
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ scale: [0, 1.5], opacity: [0.6, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="size-3 rounded-full" style={{ backgroundColor: tc.glow }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ===== SERVER NODE ===== */}
          <div className="flex flex-col items-center gap-2 w-[72px] sm:w-24 shrink-0 z-10">
            <motion.div
              className={cn(
                "size-14 sm:size-16 rounded-2xl border-2 flex items-center justify-center relative overflow-hidden transition-colors duration-500",
                reqArrived && !resFlying && !resArrived ? `${tc.border}/30` :
                "border-border/25"
              )}
            >
              <motion.div
                className="absolute inset-0"
                animate={{
                  backgroundColor:
                    reqArrived && !resFlying && !resArrived ? `${tc.glow}08` : "rgba(0,0,0,0)"
                }}
                transition={{ duration: 0.4 }}
              />
              <Server className={cn(
                "size-6 sm:size-7 relative z-10 transition-colors duration-500",
                reqArrived && !resFlying && !resArrived ? tc.text : "text-muted-foreground/50"
              )} />
            </motion.div>
            <div className="text-center">
              <p className="text-[11px] font-semibold text-muted-foreground/60">FastAPI</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[9px] font-mono text-muted-foreground/40 mt-0.5 leading-snug"
                >
                  {step.serverLabel}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Annotation footer */}
      <div className={cn(
        "px-5 py-3 border-t flex items-center gap-3 transition-colors duration-500",
        step.tone === "red" ? "bg-red-500/4 border-red-500/12" :
        step.tone === "emerald" ? "bg-emerald-500/4 border-emerald-500/12" :
        "bg-amber-500/4 border-amber-500/12"
      )}>
        <motion.div
          key={stepIdx}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 16 }}
          className={cn("size-6 rounded-full flex items-center justify-center shrink-0", `${tc.light}`)}
        >
          {step.tone === "red" ? <X className={cn("size-3", tc.text)} /> :
           step.tone === "emerald" ? <Check className={cn("size-3", tc.text)} /> :
           <ArrowRight className={cn("size-3", tc.text)} />}
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIdx}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            className="text-xs text-muted-foreground/60 leading-relaxed"
          >
            {step.annotation}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
