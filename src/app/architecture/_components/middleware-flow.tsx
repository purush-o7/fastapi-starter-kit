"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe, Shield, FileText, Lock, Zap, RotateCcw, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Phase System ─── */
type Phase =
  | "idle"
  | "req-to-cors" | "cors-before"
  | "req-to-logging" | "logging-before"
  | "req-to-auth" | "auth-before"
  | "req-to-endpoint" | "endpoint-run"
  | "res-from-auth" | "auth-after"
  | "res-from-logging" | "logging-after"
  | "res-from-cors" | "cors-after"
  | "res-to-client" | "done";

const HAPPY_PHASES: Phase[] = [
  "idle", "req-to-cors", "cors-before", "req-to-logging", "logging-before",
  "req-to-auth", "auth-before", "req-to-endpoint", "endpoint-run",
  "res-from-auth", "auth-after", "res-from-logging", "logging-after",
  "res-from-cors", "cors-after", "res-to-client", "done",
];

const BLOCKED_PHASES: Phase[] = [
  "idle", "req-to-cors", "cors-before", "req-to-logging", "logging-before",
  "req-to-auth", "auth-before",
  "res-from-logging", "logging-after", "res-from-cors", "cors-after",
  "res-to-client", "done",
];

const PHASE_LABELS: Record<Phase, string> = {
  "idle": "Waiting...",
  "req-to-cors": "Request → CORS",
  "cors-before": "CORS: checking origin",
  "req-to-logging": "Request → Logging",
  "logging-before": "Logging: before handler",
  "req-to-auth": "Request → Auth",
  "auth-before": "Auth: checking credentials",
  "req-to-endpoint": "Request → Endpoint",
  "endpoint-run": "Endpoint: processing",
  "res-from-auth": "Response ← Auth",
  "auth-after": "Auth: after handler",
  "res-from-logging": "Response ← Logging",
  "logging-after": "Logging: after handler",
  "res-from-cors": "Response ← CORS",
  "cors-after": "CORS: adding headers",
  "res-to-client": "Response → Client",
  "done": "Complete",
};

/* ─── Scenarios ─── */
interface Scenario {
  id: string;
  label: string;
  method: string;
  path: string;
  blocked: boolean;
  statusCode: number;
  statusText: string;
  detail: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "happy",
    label: "Happy Path",
    method: "GET",
    path: "/api/items",
    blocked: false,
    statusCode: 200,
    statusText: "200 OK — Response delivered",
    detail: "Request flows through all middleware layers, hits the endpoint, and response returns through each layer in reverse",
  },
  {
    id: "auth-blocked",
    label: "Auth Rejected",
    method: "GET",
    path: "/api/items",
    blocked: true,
    statusCode: 401,
    statusText: "401 Unauthorized — Blocked before endpoint",
    detail: "Auth middleware rejects the request — response skips the endpoint and flows back through earlier layers",
  },
  {
    id: "timing",
    label: "Slow Request",
    method: "GET",
    path: "/api/items",
    blocked: false,
    statusCode: 200,
    statusText: "200 OK — X-Process-Time: 0.847s",
    detail: "Logging middleware captures start time on request, computes duration on response, adds X-Process-Time header",
  },
];

/* ─── Node Data ─── */
interface MiddlewareNodeData {
  id: string;
  label: string;
  icon: typeof Globe;
  borderActive: string;
  bgActive: string;
  textActive: string;
  ringColor: string;
  glowReq: string;
  glowRes: string;
  beforeCode?: Record<string, string>;
  afterCode?: Record<string, string>;
}

const NODES: MiddlewareNodeData[] = [
  {
    id: "client",
    label: "Client",
    icon: Globe,
    borderActive: "border-purple-500/50",
    bgActive: "bg-purple-500/10",
    textActive: "text-purple-400",
    ringColor: "border-purple-500/25",
    glowReq: "0 0 28px 8px rgba(168,85,247,0.15), inset 0 0 12px rgba(168,85,247,0.06)",
    glowRes: "0 0 28px 8px rgba(16,185,129,0.15), inset 0 0 12px rgba(16,185,129,0.06)",
  },
  {
    id: "cors",
    label: "CORS",
    icon: Shield,
    borderActive: "border-purple-500/50",
    bgActive: "bg-purple-500/10",
    textActive: "text-purple-400",
    ringColor: "border-purple-500/25",
    glowReq: "0 0 28px 8px rgba(168,85,247,0.15), inset 0 0 12px rgba(168,85,247,0.06)",
    glowRes: "0 0 28px 8px rgba(16,185,129,0.15), inset 0 0 12px rgba(16,185,129,0.06)",
    beforeCode: { happy: "check origin header", "auth-blocked": "check origin header", timing: "check origin header" },
    afterCode: { happy: "add CORS headers", "auth-blocked": "add CORS headers", timing: "add CORS headers" },
  },
  {
    id: "logging",
    label: "Logging",
    icon: FileText,
    borderActive: "border-violet-500/50",
    bgActive: "bg-violet-500/10",
    textActive: "text-violet-400",
    ringColor: "border-violet-500/25",
    glowReq: "0 0 28px 8px rgba(139,92,246,0.15), inset 0 0 12px rgba(139,92,246,0.06)",
    glowRes: "0 0 28px 8px rgba(16,185,129,0.15), inset 0 0 12px rgba(16,185,129,0.06)",
    beforeCode: { happy: "log request method + path", "auth-blocked": "log request method + path", timing: "start = perf_counter()" },
    afterCode: { happy: "log response status", "auth-blocked": "log 401 response", timing: "X-Process-Time: 0.847s" },
  },
  {
    id: "auth",
    label: "Auth",
    icon: Lock,
    borderActive: "border-amber-500/50",
    bgActive: "bg-amber-500/10",
    textActive: "text-amber-400",
    ringColor: "border-amber-500/25",
    glowReq: "0 0 28px 8px rgba(245,158,11,0.15), inset 0 0 12px rgba(245,158,11,0.06)",
    glowRes: "0 0 28px 8px rgba(16,185,129,0.15), inset 0 0 12px rgba(16,185,129,0.06)",
    beforeCode: { happy: "Authorization: ✓ valid", "auth-blocked": "Authorization: ✗ missing", timing: "Authorization: ✓ valid" },
    afterCode: { happy: "(pass-through)", timing: "(pass-through)" },
  },
  {
    id: "endpoint",
    label: "Endpoint",
    icon: Zap,
    borderActive: "border-emerald-500/50",
    bgActive: "bg-emerald-500/10",
    textActive: "text-emerald-400",
    ringColor: "border-emerald-500/25",
    glowReq: "0 0 28px 8px rgba(16,185,129,0.18), inset 0 0 12px rgba(16,185,129,0.08)",
    glowRes: "0 0 28px 8px rgba(16,185,129,0.18), inset 0 0 12px rgba(16,185,129,0.08)",
    beforeCode: { happy: 'return {"items": [...]}', timing: 'return {"items": [...]}' },
  },
];

/* ─── Helpers ─── */
function isNodeActive(nodeId: string, phase: Phase): false | "before" | "after" | "run" {
  switch (nodeId) {
    case "client":
      if (phase === "req-to-cors") return "before";
      if (phase === "res-to-client" || phase === "done") return "after";
      return false;
    case "cors":
      if (phase === "cors-before") return "before";
      if (phase === "cors-after") return "after";
      return false;
    case "logging":
      if (phase === "logging-before") return "before";
      if (phase === "logging-after") return "after";
      return false;
    case "auth":
      if (phase === "auth-before") return "before";
      if (phase === "auth-after") return "after";
      return false;
    case "endpoint":
      if (phase === "endpoint-run") return "run";
      return false;
    default:
      return false;
  }
}

type ConnectionId = "client-cors" | "cors-logging" | "logging-auth" | "auth-endpoint";

function activeConnection(phase: Phase): { id: ConnectionId; direction: "right" | "left" } | null {
  switch (phase) {
    case "req-to-cors": return { id: "client-cors", direction: "right" };
    case "req-to-logging": return { id: "cors-logging", direction: "right" };
    case "req-to-auth": return { id: "logging-auth", direction: "right" };
    case "req-to-endpoint": return { id: "auth-endpoint", direction: "right" };
    case "res-from-auth": return { id: "auth-endpoint", direction: "left" };
    case "res-from-logging": return { id: "logging-auth", direction: "left" };
    case "res-from-cors": return { id: "cors-logging", direction: "left" };
    case "res-to-client": return { id: "client-cors", direction: "left" };
    default: return null;
  }
}

const CONNECTION_IDS: ConnectionId[] = ["client-cors", "cors-logging", "logging-auth", "auth-endpoint"];

function isResponsePhase(phase: Phase) {
  return phase.startsWith("res-") || phase.endsWith("-after") || phase === "done";
}

function getProgress(phase: Phase, scenarioId: string): number {
  const phases = scenarioId === "auth-blocked" ? BLOCKED_PHASES : HAPPY_PHASES;
  const idx = phases.indexOf(phase);
  if (idx <= 0) return 0;
  return Math.round((idx / (phases.length - 1)) * 100);
}

/* Check if node was already visited during request phase (to show dim highlight on passed nodes) */
function wasVisited(nodeId: string, phase: Phase, scenarioId: string): boolean {
  const phases = scenarioId === "auth-blocked" ? BLOCKED_PHASES : HAPPY_PHASES;
  const currentIdx = phases.indexOf(phase);

  const nodePhaseMap: Record<string, Phase[]> = {
    client: ["req-to-cors"],
    cors: ["cors-before"],
    logging: ["logging-before"],
    auth: ["auth-before"],
    endpoint: ["endpoint-run"],
  };

  const nodePhases = nodePhaseMap[nodeId] || [];
  return nodePhases.some((p) => phases.indexOf(p) < currentIdx && currentIdx > 0);
}

/* ─── Main Component ─── */
export function MiddlewareFlow() {
  const [selectedId, setSelectedId] = useState("happy");
  const [phase, setPhase] = useState<Phase>("idle");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const sc = SCENARIOS.find((s) => s.id === selectedId)!;

  const clear = useCallback(() => { timersRef.current.forEach(clearTimeout); timersRef.current = []; }, []);
  const t = useCallback((fn: () => void, ms: number) => { timersRef.current.push(setTimeout(fn, ms)); }, []);

  const run = useCallback((s: Scenario) => {
    clear();
    setPhase("idle");

    const d = 420;

    if (s.id === "auth-blocked") {
      t(() => setPhase("req-to-cors"), 350);
      t(() => setPhase("cors-before"), 350 + d);
      t(() => setPhase("req-to-logging"), 350 + d * 2);
      t(() => setPhase("logging-before"), 350 + d * 3);
      t(() => setPhase("req-to-auth"), 350 + d * 4);
      t(() => setPhase("auth-before"), 350 + d * 5);
      t(() => setPhase("res-from-logging"), 350 + d * 7);
      t(() => setPhase("logging-after"), 350 + d * 8);
      t(() => setPhase("res-from-cors"), 350 + d * 9);
      t(() => setPhase("cors-after"), 350 + d * 10);
      t(() => setPhase("res-to-client"), 350 + d * 11);
      t(() => setPhase("done"), 350 + d * 12);
    } else {
      t(() => setPhase("req-to-cors"), 350);
      t(() => setPhase("cors-before"), 350 + d);
      t(() => setPhase("req-to-logging"), 350 + d * 2);
      t(() => setPhase("logging-before"), 350 + d * 3);
      t(() => setPhase("req-to-auth"), 350 + d * 4);
      t(() => setPhase("auth-before"), 350 + d * 5);
      t(() => setPhase("req-to-endpoint"), 350 + d * 6);
      t(() => setPhase("endpoint-run"), 350 + d * 7);
      t(() => setPhase("res-from-auth"), 350 + d * 8.5);
      t(() => setPhase("auth-after"), 350 + d * 9.5);
      t(() => setPhase("res-from-logging"), 350 + d * 10.5);
      t(() => setPhase("logging-after"), 350 + d * 11.5);
      t(() => setPhase("res-from-cors"), 350 + d * 12.5);
      t(() => setPhase("cors-after"), 350 + d * 13.5);
      t(() => setPhase("res-to-client"), 350 + d * 14.5);
      t(() => setPhase("done"), 350 + d * 15.5);
    }
  }, [clear, t]);

  useEffect(() => { run(sc); return clear; }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const conn = activeConnection(phase);
  const isRes = isResponsePhase(phase);
  const progress = getProgress(phase, selectedId);

  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/20">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="size-2 rounded-full"
            animate={{
              backgroundColor:
                phase === "idle" ? "rgba(168,85,247,0.4)" :
                phase === "done" ? (sc.blocked ? "rgb(239,68,68)" : "rgb(16,185,129)") :
                isRes ? (sc.blocked ? "rgb(239,68,68)" : "rgb(16,185,129)") :
                "rgb(168,85,247)",
              scale: phase === "idle" || phase === "done" ? 1 : [1, 1.4, 1],
            }}
            transition={{ scale: { repeat: Infinity, duration: 0.8 } }}
          />
          <span className="text-xs font-semibold tracking-wide">Middleware Pipeline</span>
          <AnimatePresence>
            {phase !== "idle" && phase !== "done" && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-[9px] font-mono text-muted-foreground/40 hidden sm:inline"
              >
                {progress}%
              </motion.span>
            )}
          </AnimatePresence>
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
                  layoutId="mw-tab"
                  className="absolute inset-0 rounded-lg bg-purple-500/10 border border-purple-500/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Phase Direction Badge ── */}
      <div className="flex justify-center pb-1 pt-2 min-h-[28px]">
        <AnimatePresence mode="wait">
          {phase !== "idle" && phase !== "done" && (
            <motion.div
              key={isRes ? "res" : "req"}
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold px-3 py-1 rounded-full border",
                isRes
                  ? sc.blocked
                    ? "text-red-400 bg-red-500/8 border-red-500/20"
                    : "text-emerald-400 bg-emerald-500/8 border-emerald-500/20"
                  : "text-purple-400 bg-purple-500/8 border-purple-500/20"
              )}
            >
              {isRes ? <ArrowLeft className="size-3" /> : <ArrowRight className="size-3" />}
              {isRes ? "Response Phase" : "Request Phase"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Visualization ── */}
      <div className="relative px-3 sm:px-6 py-6 sm:py-8">
        {/* Background: dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Background: concentric arcs (decorative nesting metaphor) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" preserveAspectRatio="none">
          {[0.22, 0.35, 0.48].map((r, i) => (
            <ellipse
              key={i}
              cx="82%"
              cy="35%"
              rx={`${r * 55}%`}
              ry={`${r * 65}%`}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.025 + i * 0.008}
              strokeWidth="1"
              strokeDasharray="3 8"
            />
          ))}
        </svg>

        {/* Nodes + connections */}
        <div className="relative flex items-start justify-between min-h-[130px] sm:min-h-[150px]">
          {NODES.map((node) => {
            const active = isNodeActive(node.id, phase);
            const NodeIcon = node.icon;
            const codeSnippet = active === "before" || active === "run"
              ? node.beforeCode?.[selectedId]
              : active === "after"
                ? node.afterCode?.[selectedId]
                : null;

            const isActiveReq = active === "before" || active === "run";
            const isActiveRes = active === "after";
            const isBlockedNode = sc.blocked && node.id === "auth" && active === "before";
            const visited = wasVisited(node.id, phase, selectedId);

            return (
              <div key={node.id} className="flex flex-col items-center z-10 flex-1 min-w-0 relative">
                {/* Ring pulse on active */}
                <AnimatePresence>
                  {(isActiveReq || isActiveRes) && (
                    <>
                      <motion.div
                        key={node.id + "-ring1"}
                        className={cn(
                          "absolute size-11 sm:size-14 rounded-2xl border",
                          isBlockedNode ? "border-red-500/30" :
                          isActiveRes ? "border-emerald-500/20" :
                          node.ringColor
                        )}
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
                      />
                      <motion.div
                        key={node.id + "-ring2"}
                        className={cn(
                          "absolute size-11 sm:size-14 rounded-2xl border",
                          isBlockedNode ? "border-red-500/20" :
                          isActiveRes ? "border-emerald-500/15" :
                          node.ringColor
                        )}
                        initial={{ scale: 1, opacity: 0.3 }}
                        animate={{ scale: [1, 1.9], opacity: [0.25, 0] }}
                        transition={{ duration: 1.3, repeat: Infinity, ease: "easeOut", delay: 0.15 }}
                      />
                    </>
                  )}
                </AnimatePresence>

                {/* Node box */}
                <motion.div
                  className={cn(
                    "size-11 sm:size-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-400",
                    isBlockedNode
                      ? "border-red-500/50 bg-red-500/10"
                      : isActiveReq
                        ? cn(node.borderActive, node.bgActive)
                        : isActiveRes
                          ? "border-emerald-500/50 bg-emerald-500/10"
                          : phase === "done"
                            ? sc.blocked ? "border-red-500/20 bg-red-500/5" : "border-emerald-500/20 bg-emerald-500/5"
                            : visited
                              ? "border-border/60 bg-muted/30"
                              : "border-border/30 bg-muted/15"
                  )}
                  animate={
                    isActiveReq || isActiveRes || isBlockedNode
                      ? { scale: [1, 0.9, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.25 }}
                  style={
                    isBlockedNode
                      ? { boxShadow: "0 0 32px 8px rgba(239,68,68,0.15), inset 0 0 16px rgba(239,68,68,0.06)" }
                      : isActiveReq
                        ? { boxShadow: node.glowReq }
                        : isActiveRes
                          ? { boxShadow: node.glowRes }
                          : {}
                  }
                >
                  <NodeIcon className={cn(
                    "size-4 sm:size-5 transition-colors duration-400",
                    isBlockedNode ? "text-red-400" :
                    isActiveReq ? node.textActive :
                    isActiveRes ? "text-emerald-400" :
                    phase === "done"
                      ? sc.blocked ? "text-red-400/60" : "text-emerald-400/60"
                      : visited ? "text-muted-foreground/40" : "text-muted-foreground/30"
                  )} />
                </motion.div>

                {/* Label */}
                <p className={cn(
                  "text-[9px] sm:text-[10px] font-semibold mt-1.5 transition-colors duration-400 tracking-wide",
                  isBlockedNode ? "text-red-400" :
                  isActiveReq ? node.textActive :
                  isActiveRes ? "text-emerald-400" :
                  visited ? "text-muted-foreground/50" : "text-muted-foreground/35"
                )}>
                  {node.label}
                </p>

                {/* Code snippet */}
                <AnimatePresence>
                  {codeSnippet && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 500, damping: 28 }}
                      className={cn(
                        "mt-2.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border backdrop-blur-sm",
                        "text-[7px] sm:text-[9px] font-mono leading-snug",
                        "max-w-[90px] sm:max-w-[140px] text-center whitespace-nowrap overflow-hidden text-ellipsis",
                        isBlockedNode
                          ? "text-red-400 bg-red-500/8 border-red-500/20 shadow-[0_2px_12px_rgba(239,68,68,0.08)]"
                          : isActiveRes
                            ? "text-emerald-400 bg-emerald-500/8 border-emerald-500/20 shadow-[0_2px_12px_rgba(16,185,129,0.08)]"
                            : "text-purple-400/90 bg-purple-500/8 border-purple-500/15 shadow-[0_2px_12px_rgba(168,85,247,0.06)]"
                      )}
                    >
                      {codeSnippet}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* ── Connection Lines + Comet Particles ── */}
          {CONNECTION_IDS.map((connId, i) => {
            const isActive = conn?.id === connId;
            const dir = conn?.direction;

            const particleColorClass = isActive && dir === "left"
              ? sc.blocked ? "bg-red-400" : "bg-emerald-400"
              : "bg-purple-400";
            const headGlow = isActive && dir === "left"
              ? sc.blocked
                ? "0 0 14px 4px rgba(239,68,68,0.5)"
                : "0 0 14px 4px rgba(16,185,129,0.5)"
              : "0 0 14px 4px rgba(168,85,247,0.5)";
            const trailColor = isActive && dir === "left"
              ? sc.blocked ? "bg-red-400" : "bg-emerald-400"
              : "bg-purple-400";

            const leftPct = `${(i + 1) * 20 - 6}%`;
            const rightPct = `${100 - (i + 1) * 20 - 14}%`;

            return (
              <div
                key={connId}
                className="absolute"
                style={{ top: "22px", left: leftPct, right: rightPct, height: "2px" }}
              >
                {/* Base line */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    backgroundColor: isActive
                      ? dir === "left"
                        ? sc.blocked ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)"
                        : "rgba(168,85,247,0.25)"
                      : "rgba(128,128,128,0.08)",
                    height: isActive ? "2px" : "1px",
                  }}
                  transition={{ duration: 0.2 }}
                  style={{ top: "50%", transform: "translateY(-50%)" }}
                />

                {/* Glow line when active */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      className={cn(
                        "absolute inset-x-0 h-4 -top-1.5 rounded-full blur-md",
                        dir === "left"
                          ? sc.blocked ? "bg-red-500/10" : "bg-emerald-500/10"
                          : "bg-purple-500/10"
                      )}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    />
                  )}
                </AnimatePresence>

                {/* Comet particle with trail */}
                <AnimatePresence>
                  {isActive && dir === "right" && (
                    <motion.div
                      key={connId + "-req-comet"}
                      className="absolute top-1/2 -translate-y-1/2"
                      initial={{ left: "-4%", opacity: 0 }}
                      animate={{ left: "100%", opacity: [0, 1, 1, 0.6] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.38, ease: "easeOut" }}
                    >
                      <div className={cn("absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[2px] rounded-full opacity-20", trailColor)} />
                      <div className={cn("absolute -left-2 top-1/2 -translate-y-1/2 size-1 rounded-full opacity-40", trailColor)} />
                      <div className={cn("size-2.5 rounded-full", particleColorClass)} style={{ boxShadow: headGlow }} />
                    </motion.div>
                  )}
                  {isActive && dir === "left" && (
                    <motion.div
                      key={connId + "-res-comet"}
                      className="absolute top-1/2 -translate-y-1/2"
                      initial={{ left: "104%", opacity: 0 }}
                      animate={{ left: "0%", opacity: [0, 1, 1, 0.6] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.38, ease: "easeOut" }}
                    >
                      <div className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-3 h-[2px] rounded-full opacity-20", trailColor)} />
                      <div className={cn("absolute left-1.5 top-1/2 -translate-y-1/2 size-1 rounded-full opacity-40", trailColor)} />
                      <div className={cn("size-2.5 rounded-full", particleColorClass)} style={{ boxShadow: headGlow }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <div className="px-5 pb-1">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[3px] rounded-full bg-muted/15 overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full",
                phase === "done"
                  ? sc.blocked ? "bg-red-500" : "bg-emerald-500"
                  : isRes
                    ? sc.blocked ? "bg-red-500" : "bg-emerald-500"
                    : "bg-purple-500"
              )}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>
        <div className="h-5 flex items-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="text-[9px] font-mono text-muted-foreground/35 tracking-wide"
            >
              {PHASE_LABELS[phase]}
            </motion.p>
          </AnimatePresence>
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
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={cn(
              "px-5 py-3.5 border-t flex items-center gap-3",
              sc.blocked ? "bg-red-500/5 border-red-500/15" : "bg-emerald-500/5 border-emerald-500/15"
            )}>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={cn(
                  "size-8 rounded-xl flex items-center justify-center text-[10px] font-bold font-mono shrink-0",
                  sc.blocked ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"
                )}
              >
                {sc.statusCode}
              </motion.div>
              <div className="min-w-0">
                <p className={cn("text-[11px] font-semibold", sc.blocked ? "text-red-400" : "text-emerald-400")}>
                  {sc.statusText}
                </p>
                <p className="text-[9px] font-mono text-muted-foreground/50 mt-0.5 truncate">
                  {sc.blocked
                    ? "Auth middleware returned 401 before reaching endpoint"
                    : sc.id === "timing"
                      ? "Logging middleware measured and injected X-Process-Time"
                      : "Response passed back through all middleware layers"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Description Bar ── */}
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
