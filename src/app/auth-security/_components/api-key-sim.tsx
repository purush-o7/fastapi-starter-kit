"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Key, RotateCcw, Lock, Unlock, Send } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─── */
type Phase = "idle" | "show-request" | "extract-key" | "compare" | "done";

interface RequestHeader {
  key: string;
  value: string;
  isApiKey?: boolean;
}

interface Scenario {
  id: string;
  label: string;
  method: string;
  path: string;
  headers: RequestHeader[];
  queryParams?: string;
  keySource: string;
  extractedKey: string | null;
  storedKey: string;
  matches: boolean;
  statusCode: number;
  statusText: string;
  responseBody: string;
  detail: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "valid-header",
    label: "Valid Header",
    method: "GET",
    path: "/items",
    headers: [
      { key: "Content-Type", value: "application/json" },
      { key: "X-API-Key", value: "sk-abc123secret", isApiKey: true },
    ],
    keySource: "Header: X-API-Key",
    extractedKey: "sk-abc123secret",
    storedKey: "sk-abc123secret",
    matches: true,
    statusCode: 200,
    statusText: "200 OK — Access granted",
    responseBody: '{"items": [{"id": 1, "name": "Widget"}]}',
    detail: "API key sent in X-API-Key header matches the stored key — request is authenticated and data is returned",
  },
  {
    id: "missing-key",
    label: "Missing Key",
    method: "GET",
    path: "/items",
    headers: [
      { key: "Content-Type", value: "application/json" },
    ],
    keySource: "Header: X-API-Key",
    extractedKey: null,
    storedKey: "sk-abc123secret",
    matches: false,
    statusCode: 403,
    statusText: "403 Forbidden — Not authenticated",
    responseBody: '{"detail": "Not authenticated"}',
    detail: "No API key header present — APIKeyHeader with auto_error=True automatically raises 403 Forbidden",
  },
  {
    id: "query-key",
    label: "Query Parameter",
    method: "GET",
    path: "/items?api_key=sk-abc123secret",
    headers: [
      { key: "Content-Type", value: "application/json" },
    ],
    queryParams: "api_key=sk-abc123secret",
    keySource: "Query: api_key",
    extractedKey: "sk-abc123secret",
    storedKey: "sk-abc123secret",
    matches: true,
    statusCode: 200,
    statusText: "200 OK — Access granted",
    responseBody: '{"items": [{"id": 1, "name": "Widget"}]}',
    detail: "API key sent as query parameter — works but less secure since it appears in URLs and server logs",
  },
];

/* ─── Component ─── */
export function ApiKeySim() {
  const [selectedId, setSelectedId] = useState("valid-header");
  const [phase, setPhase] = useState<Phase>("idle");
  const [revealedHeaders, setRevealedHeaders] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const sc = SCENARIOS.find((s) => s.id === selectedId)!;

  const clear = useCallback(() => { timersRef.current.forEach(clearTimeout); timersRef.current = []; }, []);
  const t = useCallback((fn: () => void, ms: number) => { timersRef.current.push(setTimeout(fn, ms)); }, []);

  const run = useCallback((s: Scenario) => {
    clear();
    setPhase("idle");
    setRevealedHeaders(0);

    let delay = 300;
    t(() => setPhase("show-request"), delay);

    // Reveal headers one by one
    s.headers.forEach((_, i) => {
      delay += 200;
      t(() => setRevealedHeaders(i + 1), delay);
    });

    delay += 500;
    t(() => setPhase("extract-key"), delay);
    delay += 700;
    t(() => setPhase("compare"), delay);
    delay += 800;
    t(() => setPhase("done"), delay);
  }, [clear, t]);

  useEffect(() => { run(sc); return clear; }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const isSuccess = sc.matches;

  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/20">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="size-2 rounded-full"
            animate={{
              backgroundColor:
                phase === "done" ? (isSuccess ? "rgb(16,185,129)" : "rgb(239,68,68)") :
                phase === "compare" ? "rgb(245,158,11)" :
                "rgba(245,158,11,0.4)",
              scale: phase === "extract-key" || phase === "compare" ? [1, 1.4, 1] : 1,
            }}
            transition={{ scale: { repeat: Infinity, duration: 0.6 } }}
          />
          <span className="text-xs font-semibold tracking-wide">API Key Auth</span>
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
                  layoutId="apikey-tab"
                  className="absolute inset-0 rounded-lg bg-amber-500/8 border border-amber-500/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visualization: two-column */}
      <div className="relative px-4 sm:px-5 py-5">
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="relative grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-start">
          {/* Left: Request */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="size-5 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Send className="size-3 text-indigo-400" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground/60">Request</span>
            </div>
            <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
              <div className="px-3 py-1.5 border-b border-border/30">
                <span className="text-[9px] font-mono text-indigo-400/70">{sc.method} {sc.path.split("?")[0]}</span>
              </div>
              <div className="px-3 py-2 space-y-[2px]">
                {sc.headers.map((h, i) => {
                  const visible = i < revealedHeaders;
                  const isExtracted = (phase === "extract-key" || phase === "compare" || phase === "done") && h.isApiKey;
                  return (
                    <AnimatePresence key={h.key}>
                      {visible && (
                        <motion.div
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            "flex items-center gap-1 py-[3px] px-2 rounded-md text-[10px] sm:text-[11px] font-mono transition-all duration-300",
                            isExtracted ? "bg-amber-500/8 border border-amber-500/20" : ""
                          )}
                        >
                          <span className="text-muted-foreground/40">{h.key}:</span>
                          <span className={cn("ml-1 truncate", h.isApiKey ? "text-amber-400/80" : "text-foreground/50")}>
                            {h.value}
                          </span>
                          {isExtracted && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto shrink-0">
                              <Key className="size-3 text-amber-400" />
                            </motion.span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  );
                })}
                {/* Query param key */}
                {sc.queryParams && (phase === "show-request" || phase === "extract-key" || phase === "compare" || phase === "done") && (
                  <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "flex items-center gap-1 py-[3px] px-2 rounded-md text-[10px] sm:text-[11px] font-mono transition-all duration-300",
                      phase !== "show-request" ? "bg-amber-500/8 border border-amber-500/20" : ""
                    )}
                  >
                    <span className="text-muted-foreground/40">?</span>
                    <span className="text-amber-400/80 truncate">{sc.queryParams}</span>
                    {phase !== "show-request" && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto shrink-0">
                        <Key className="size-3 text-amber-400" />
                      </motion.span>
                    )}
                  </motion.div>
                )}
                {/* Missing key indicator */}
                {!sc.extractedKey && (phase === "extract-key" || phase === "compare" || phase === "done") && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-[3px] px-2 rounded-md text-[10px] font-mono text-red-400/60 bg-red-500/5"
                  >
                    X-API-Key: (missing)
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Center: Lock */}
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
                      "size-10 rounded-xl border flex items-center justify-center transition-all duration-500",
                      phase === "compare" ? "border-amber-500/30 bg-amber-500/10" :
                      phase === "done" ? (isSuccess ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10") :
                      "border-border/30 bg-muted/20"
                    )}
                    animate={phase === "compare" ? { rotate: [0, -10, 10, 0] } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    {phase === "done" && isSuccess ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                        <Unlock className="size-5 text-emerald-400" />
                      </motion.div>
                    ) : phase === "done" && !isSuccess ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                        <Lock className="size-5 text-red-400" />
                      </motion.div>
                    ) : (
                      <Lock className={cn("size-5 transition-colors duration-300", phase === "compare" ? "text-amber-400" : "text-muted-foreground/30")} />
                    )}
                  </motion.div>
                  <span className="text-[8px] font-mono text-muted-foreground/30 text-center max-w-[80px] leading-tight">
                    {sc.keySource}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Response */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className={cn(
                "size-5 rounded-md border flex items-center justify-center transition-colors duration-500",
                phase === "done" ? (isSuccess ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20") : "bg-muted/30 border-border/30"
              )}>
                <Key className={cn("size-3 transition-colors duration-300",
                  phase === "done" ? (isSuccess ? "text-emerald-400" : "text-red-400") : "text-muted-foreground/30"
                )} />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground/60">Response</span>
            </div>
            <div className={cn(
              "rounded-xl border overflow-hidden bg-card transition-colors duration-500",
              phase === "done" ? (isSuccess ? "border-emerald-500/25" : "border-red-500/25") : "border-border/40"
            )}>
              <div className="px-3 py-1.5 border-b border-border/30">
                <AnimatePresence mode="wait">
                  {phase === "done" ? (
                    <motion.span key="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn("text-[9px] font-mono font-semibold", isSuccess ? "text-emerald-400" : "text-red-400")}>
                      {sc.statusCode} {isSuccess ? "OK" : "Forbidden"}
                    </motion.span>
                  ) : (
                    <motion.span key="wait" className="text-[9px] font-mono text-muted-foreground/30">awaiting...</motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="px-3 py-2.5 min-h-[60px] flex items-center">
                <AnimatePresence>
                  {phase === "done" && (
                    <motion.p
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn("text-[10px] sm:text-[11px] font-mono break-all", isSuccess ? "text-emerald-400/80" : "text-red-400/80")}
                    >
                      {sc.responseBody}
                    </motion.p>
                  )}
                  {phase !== "done" && (
                    <span className="text-[9px] text-muted-foreground/20 font-mono">
                      {phase === "compare" ? "verifying key..." : "waiting..."}
                    </span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
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
              isSuccess ? "bg-emerald-500/5 border-emerald-500/15" : "bg-red-500/5 border-red-500/15"
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
                <p className={cn("text-[11px] font-semibold", isSuccess ? "text-emerald-400" : "text-red-400")}>
                  {sc.statusText}
                </p>
                <p className="text-[9px] font-mono text-muted-foreground/50 mt-0.5">
                  {sc.extractedKey ? `Key: ${sc.extractedKey.slice(0, 6)}...` : "No key provided"} via {sc.keySource}
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
