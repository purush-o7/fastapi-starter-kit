"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Monitor, Server } from "lucide-react";
import { cn } from "@/lib/utils";

interface Scenario {
  method: string;
  methodColor: string;
  url: string;
  requestBody?: string;
  statusCode: number;
  statusText: string;
  statusColor: string;
  responseBody: string;
}

const SCENARIOS: Scenario[] = [
  {
    method: "GET",
    methodColor: "text-emerald-400 bg-emerald-500/15",
    url: "/users",
    statusCode: 200,
    statusText: "OK",
    statusColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
    responseBody: '[{"id": 1, "name": "Alice"}]',
  },
  {
    method: "POST",
    methodColor: "text-blue-400 bg-blue-500/15",
    url: "/items",
    requestBody: '{"name": "Widget"}',
    statusCode: 201,
    statusText: "Created",
    statusColor: "text-blue-400 border-blue-500/30 bg-blue-500/5",
    responseBody: '{"id": 4, "name": "Widget"}',
  },
  {
    method: "GET",
    methodColor: "text-emerald-400 bg-emerald-500/15",
    url: "/missing",
    statusCode: 404,
    statusText: "Not Found",
    statusColor: "text-red-400 border-red-500/30 bg-red-500/5",
    responseBody: '{"detail": "Not found"}',
  },
];

export function FundamentalsHeroViz() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"request" | "processing" | "response">("request");
  const scenario = SCENARIOS[index];

  const runCycle = useCallback(() => {
    setPhase("request");
    const t1 = setTimeout(() => setPhase("processing"), 2000);
    const t2 = setTimeout(() => setPhase("response"), 4000);
    const t3 = setTimeout(() => {
      setIndex((prev) => (prev + 1) % SCENARIOS.length);
    }, 8000);

    return [t1, t2, t3];
  }, []);

  useEffect(() => {
    const timers = runCycle();
    return () => timers.forEach(clearTimeout);
  }, [index, runCycle]);

  return (
    <div className="w-full rounded-xl border bg-card/50 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
          The HTTP Conversation
        </h3>
        <div className="flex gap-1">
          {SCENARIOS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "size-1.5 rounded-full transition-colors",
                i === index ? "bg-rose-500" : "bg-border"
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-3 min-h-[200px]">
        {/* Client box */}
        <div className="w-full sm:w-[160px] shrink-0">
          <div className="rounded-lg border-2 border-rose-500/30 bg-rose-500/5 p-3 flex flex-col items-center gap-2">
            <Monitor className="size-6 text-rose-400" />
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              Client
            </span>
          </div>
        </div>

        {/* Middle: arrows and data */}
        <div className="flex-1 flex flex-col items-center gap-3 min-w-0 w-full">
          {/* Request arrow and data */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`req-${index}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <div className="text-[10px] text-muted-foreground mb-1.5 text-center">
                Request
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 font-mono text-xs flex flex-wrap items-center gap-1.5 justify-center">
                <span className={cn("px-1.5 py-0.5 rounded text-[11px] font-bold", scenario.methodColor)}>
                  {scenario.method}
                </span>
                <span className="text-foreground">{scenario.url}</span>
              </div>
              {scenario.requestBody && (
                <div className="mt-1.5 rounded-md border border-dashed border-border/50 px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground text-center">
                  {scenario.requestBody}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Animated traveling arrow */}
          <div className="relative w-full h-6 flex items-center">
            <div className="absolute inset-x-0 top-1/2 h-[2px] bg-border rounded-full -translate-y-1/2" />

            {phase === "request" && (
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 size-2.5 rounded-full bg-rose-500"
                animate={{ left: ["10%", "90%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
              />
            )}

            {phase === "processing" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="text-[10px] font-mono text-pink-400">
                  processing...
                </span>
              </motion.div>
            )}

            {phase === "response" && (
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 size-2.5 rounded-full bg-pink-500"
                animate={{ left: ["90%", "10%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
              />
            )}
          </div>

          {/* Response data */}
          <AnimatePresence mode="popLayout">
            {phase === "response" ? (
              <motion.div
                key={`res-${index}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                <div className="text-[10px] text-muted-foreground mb-1.5 text-center">
                  Response
                </div>
                <div className={cn("rounded-lg border p-3 font-mono text-[11px] break-all", scenario.statusColor)}>
                  <div className="flex items-center gap-1.5 justify-center mb-1.5">
                    <span className="font-bold">{scenario.statusCode}</span>
                    <span className="text-muted-foreground">{scenario.statusText}</span>
                  </div>
                  <div className="text-center">{scenario.responseBody}</div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder-res"
                animate={{ opacity: 0.3 }}
                className="w-full"
              >
                <div className="text-[10px] text-muted-foreground mb-1.5 text-center">
                  Response
                </div>
                <div className="rounded-lg border border-dashed border-border/50 p-3 text-xs text-muted-foreground/30 font-mono text-center">
                  awaiting response...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Server box */}
        <div className="w-full sm:w-[160px] shrink-0">
          <div className={cn(
            "rounded-lg border-2 p-3 flex flex-col items-center gap-2 transition-colors duration-500",
            phase === "processing"
              ? "border-pink-500/50 bg-pink-500/10"
              : "border-pink-500/30 bg-pink-500/5"
          )}>
            <Server className={cn(
              "size-6 transition-colors duration-500",
              phase === "processing" ? "text-pink-300" : "text-pink-400"
            )} />
            <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider">
              Server
            </span>
          </div>
        </div>
      </div>

      {/* Phase indicator dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {(["request", "processing", "response"] as const).map((p) => (
          <div
            key={p}
            className={cn(
              "rounded-full transition-all duration-300",
              phase === p
                ? "w-6 h-1.5 bg-rose-500"
                : "w-1.5 h-1.5 bg-border"
            )}
          />
        ))}
      </div>
    </div>
  );
}
