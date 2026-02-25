"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface Scenario {
  label: string;
  method: string;
  url: string;
  statusCode: number;
  statusText: string;
  light: "green" | "yellow" | "red";
  handler: string;
  response: string;
}

const SCENARIOS: Scenario[] = [
  {
    label: "Item found",
    method: "GET",
    url: "/items/42",
    statusCode: 200,
    statusText: "OK",
    light: "green",
    handler: "get_item(id=42)",
    response: '{"id": 42, "name": "Widget"}',
  },
  {
    label: "Item not found",
    method: "GET",
    url: "/items/999",
    statusCode: 404,
    statusText: "Not Found",
    light: "yellow",
    handler: "HTTPException(404)",
    response: '{"detail": "Item not found"}',
  },
  {
    label: "Server error",
    method: "GET",
    url: "/items/crash",
    statusCode: 500,
    statusText: "Internal Server Error",
    light: "red",
    handler: "custom_error_handler()",
    response: '{"error": "Internal server error", "request_id": "abc123"}',
  },
];

const LIGHT_COLORS = {
  green: { active: "bg-emerald-400 shadow-emerald-400/50", ring: "ring-emerald-400/30" },
  yellow: { active: "bg-amber-400 shadow-amber-400/50", ring: "ring-amber-400/30" },
  red: { active: "bg-red-400 shadow-red-400/50", ring: "ring-red-400/30" },
};

const STATUS_COLORS = {
  green: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
  yellow: "text-amber-400 border-amber-500/30 bg-amber-500/5",
  red: "text-red-400 border-red-500/30 bg-red-500/5",
};

export function ErrorHeroViz() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"request" | "processing" | "response">("request");
  const scenario = SCENARIOS[index];

  useEffect(() => {
    setPhase("request");
    const t1 = setTimeout(() => setPhase("processing"), 600);
    const t2 = setTimeout(() => setPhase("response"), 1500);
    const t3 = setTimeout(() => {
      setIndex((prev) => (prev + 1) % SCENARIOS.length);
    }, 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [index]);

  return (
    <div className="w-full rounded-xl border bg-card/50 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="size-2 rounded-full bg-orange-500 animate-pulse" />
          Error Flow — Scenario: {scenario.label}
        </h3>
        <div className="flex gap-1">
          {SCENARIOS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "size-1.5 rounded-full transition-colors",
                i === index ? "bg-orange-500" : "bg-border"
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 min-h-[180px]">
        {/* Request */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`req-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="w-full sm:w-1/3"
          >
            <div className="text-[10px] text-muted-foreground mb-1.5">Request</div>
            <div className="rounded-lg border bg-muted/30 p-3 font-mono text-xs">
              <span className="text-emerald-400 font-bold">{scenario.method}</span>{" "}
              {scenario.url}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Traffic Signal */}
        <div className="flex sm:flex-col items-center gap-2 shrink-0">
          <motion.div
            animate={{ opacity: phase !== "request" ? 1 : 0.3 }}
            className="flex sm:flex-col gap-1.5 rounded-lg border bg-muted/50 p-2"
          >
            {(["green", "yellow", "red"] as const).map((color) => (
              <motion.div
                key={color}
                className={cn(
                  "size-5 rounded-full transition-all duration-300",
                  phase !== "request" && scenario.light === color
                    ? cn(LIGHT_COLORS[color].active, "shadow-lg ring-4", LIGHT_COLORS[color].ring)
                    : "bg-muted-foreground/15"
                )}
                animate={
                  phase !== "request" && scenario.light === color
                    ? { scale: [1, 1.15, 1] }
                    : { scale: 1 }
                }
                transition={
                  phase !== "request" && scenario.light === color
                    ? { duration: 1, repeat: Infinity, ease: "easeInOut" }
                    : {}
                }
              />
            ))}
          </motion.div>
          <span className="text-[9px] text-muted-foreground font-mono">
            {phase !== "request" ? `${scenario.statusCode}` : "..."}
          </span>
        </div>

        {/* Response */}
        <AnimatePresence mode="popLayout">
          {phase === "response" ? (
            <motion.div
              key={`res-${index}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="w-full sm:w-1/3"
            >
              <div className="text-[10px] text-muted-foreground mb-1.5">
                Handler: <span className="font-mono text-orange-400">{scenario.handler}</span>
              </div>
              <div
                className={cn(
                  "rounded-lg border p-3 font-mono text-[11px] break-all",
                  STATUS_COLORS[scenario.light]
                )}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="font-bold">{scenario.statusCode}</span>
                  <span className="text-muted-foreground">{scenario.statusText}</span>
                </div>
                {scenario.response}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder-res"
              animate={{ opacity: 0.3 }}
              className="w-full sm:w-1/3"
            >
              <div className="text-[10px] text-muted-foreground mb-1.5">Response</div>
              <div className="rounded-lg border border-dashed border-border/50 p-3 text-xs text-muted-foreground/30 font-mono">
                processing...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
