"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Monitor, Server, Play, RotateCcw, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "idle" | "sending" | "processing" | "received";

interface Scenario {
  method: "GET" | "POST" | "DELETE";
  url: string;
  body?: string;
  status: number;
  statusText: string;
  response: string;
  description: string;
}

const METHOD_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  GET: { text: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
  POST: { text: "text-blue-400", bg: "bg-blue-500/15", border: "border-blue-500/30" },
  DELETE: { text: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30" },
};

const SCENARIOS: Scenario[] = [
  {
    method: "GET", url: "/users", description: "List all users",
    status: 200, statusText: "OK",
    response: `[{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]`,
  },
  {
    method: "POST", url: "/users", description: "Create a user",
    body: `{"name": "Charlie", "email": "charlie@example.com"}`,
    status: 201, statusText: "Created",
    response: `{"id": 3, "name": "Charlie", "email": "charlie@example.com"}`,
  },
  {
    method: "GET", url: "/users/99", description: "User not found",
    status: 404, statusText: "Not Found",
    response: `{"detail": "User not found"}`,
  },
  {
    method: "DELETE", url: "/users/1", description: "Delete a user",
    status: 204, statusText: "No Content",
    response: `(empty body)`,
  },
];

export function ApiRequestBuilder() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const generationRef = useRef(0);

  const scenario = SCENARIOS[selectedIndex];
  const colors = METHOD_COLORS[scenario.method];

  const reset = useCallback(() => {
    generationRef.current += 1;
    setPhase("idle");
  }, []);

  const send = useCallback(() => {
    if (phase !== "idle") return;
    const gen = ++generationRef.current;

    setPhase("sending");
    setTimeout(() => { if (generationRef.current === gen) setPhase("processing"); }, 600);
    setTimeout(() => { if (generationRef.current === gen) setPhase("received"); }, 1400);
  }, [phase]);

  const switchScenario = useCallback((i: number) => {
    generationRef.current += 1;
    setSelectedIndex(i);
    setPhase("idle");
  }, []);

  const statusColor = scenario.status < 300 ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
    : scenario.status < 400 ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
    : "text-red-400 border-red-500/30 bg-red-500/10";

  return (
    <div className="w-full rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-card/40 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg width="100%" height="100%" className="opacity-[0.03]">
          <defs><pattern id="api-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.7" fill="currentColor" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#api-dots)" />
        </svg>
      </div>

      <div className="relative">
        <div className="px-5 sm:px-6 pt-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <ArrowRight className="size-4 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">API Request Builder</h3>
                <p className="text-[10px] text-muted-foreground/50 font-mono">pick a scenario, send the request</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {phase !== "idle" && (
                <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} onClick={reset}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted cursor-pointer">
                  <RotateCcw className="size-3.5" />
                </motion.button>
              )}
              <button onClick={send} disabled={phase !== "idle"}
                className={cn("inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer",
                  phase !== "idle" ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-rose-500 text-white hover:bg-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.25)]"
                )}>
                <Play className="size-3" />Send
              </button>
            </div>
          </div>

          {/* Scenario tabs */}
          <div className="flex gap-1 p-1 rounded-lg bg-muted/30 border border-border/30 w-fit">
            {SCENARIOS.map((s, i) => (
              <button key={i} onClick={() => switchScenario(i)}
                className={cn("text-[10px] font-mono font-medium px-2.5 py-1.5 rounded-md transition-all cursor-pointer",
                  selectedIndex === i ? "bg-background text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"
                )}>
                <span className={cn("mr-1", METHOD_COLORS[s.method].text)}>{s.method}</span>{s.url}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

        <div className="px-5 sm:px-6 py-6">
          {/* Client → Server animation track */}
          <div className="flex items-center gap-4 sm:gap-6 mb-5">
            <div className={cn("rounded-xl border p-3 w-[80px] sm:w-[100px] text-center transition-all duration-500 shrink-0",
              phase === "idle" ? "border-border/30 bg-muted/10" : "border-blue-500/20 bg-blue-500/[0.03]"
            )}>
              <Monitor className={cn("size-5 mx-auto mb-1 transition-colors duration-500", phase !== "idle" ? "text-blue-400" : "text-muted-foreground/30")} />
              <span className="text-[10px] font-semibold">Client</span>
            </div>

            <div className="flex-1 relative h-8">
              <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-px bg-border/30" />
              <AnimatePresence>
                {phase === "sending" && (
                  <motion.div className="absolute top-1/2 -translate-y-1/2 size-3 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                    initial={{ left: "0%", opacity: 0 }} animate={{ left: "100%", opacity: [0, 1, 1, 0] }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }} />
                )}
                {phase === "received" && (
                  <motion.div className={cn("absolute top-1/2 -translate-y-1/2 size-3 rounded-full shadow-lg",
                    scenario.status < 300 ? "bg-emerald-400 shadow-emerald-400/50" : scenario.status < 400 ? "bg-amber-400 shadow-amber-400/50" : "bg-red-400 shadow-red-400/50"
                  )} initial={{ left: "100%", opacity: 0 }} animate={{ left: "0%", opacity: [0, 1, 1, 0] }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }} />
                )}
              </AnimatePresence>
            </div>

            <motion.div className={cn("rounded-xl border p-3 w-[80px] sm:w-[100px] text-center transition-all duration-500 shrink-0",
              phase === "processing" ? "border-rose-500/30 bg-rose-500/[0.05] shadow-[0_0_15px_rgba(244,63,94,0.1)]" : "border-border/30 bg-muted/10"
            )} animate={phase === "processing" ? { scale: [1, 1.03, 1] } : {}} transition={{ duration: 0.6, repeat: phase === "processing" ? Infinity : 0 }}>
              <Server className={cn("size-5 mx-auto mb-1 transition-colors duration-500", phase === "processing" ? "text-rose-400" : "text-muted-foreground/30")} />
              <span className="text-[10px] font-semibold">FastAPI</span>
            </motion.div>
          </div>

          {/* Request / Response panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Request */}
            <div className="rounded-xl border border-border/30 bg-muted/10 p-4">
              <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/30 block mb-2">Request</span>
              <div className="flex items-center gap-2 mb-2">
                <span className={cn("text-xs font-mono font-bold rounded px-2 py-0.5 border", colors.text, colors.bg, colors.border)}>{scenario.method}</span>
                <span className="text-sm font-mono text-foreground/70">{scenario.url}</span>
              </div>
              {scenario.body && (
                <div className="rounded-lg bg-muted/30 border border-border/30 p-2.5 mt-2">
                  <span className="text-[8px] font-mono text-muted-foreground/30 uppercase block mb-1">Body</span>
                  <pre className="text-[11px] font-mono text-foreground/50 whitespace-pre-wrap">{scenario.body}</pre>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground/40 mt-2">{scenario.description}</p>
            </div>

            {/* Response */}
            <AnimatePresence mode="wait">
              {phase === "received" ? (
                <motion.div key="response" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={cn("rounded-xl border p-4", statusColor)}>
                  <span className="text-[9px] font-mono uppercase tracking-wider opacity-50 block mb-2">Response</span>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-mono font-bold">{scenario.status}</span>
                    <span className="text-sm font-mono opacity-60">{scenario.statusText}</span>
                  </div>
                  <div className="rounded-lg bg-background/30 border border-border/20 p-2.5 mt-2">
                    <pre className="text-[11px] font-mono opacity-70 whitespace-pre-wrap break-all">{scenario.response}</pre>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="rounded-xl border border-dashed border-border/20 p-4 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground/20 font-mono">
                    {phase === "idle" ? "response will appear here" : phase === "sending" ? "sending..." : "processing..."}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="px-5 sm:px-6 py-3 border-t border-border/20 bg-muted/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {["GET", "POST", "DELETE"].map((m) => (
              <div key={m} className="flex items-center gap-1.5">
                <div className={cn("size-1.5 rounded-full", METHOD_COLORS[m].bg.replace("/15", ""))} />
                <span className="text-[9px] text-muted-foreground/40 font-mono">{m}</span>
              </div>
            ))}
          </div>
          <span className="text-[9px] text-muted-foreground/30 font-mono">HTTP/1.1</span>
        </div>
      </div>
    </div>
  );
}
