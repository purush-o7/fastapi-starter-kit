"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

type Mode = "development" | "production";

function LoopRing({ size = 40, speed = 3, color = "#84cc16" }: { size?: number; speed?: number; color?: string }) {
  const r = size / 2 - 3;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.06} strokeWidth={2} />
      </svg>
      <motion.svg width={size} height={size} className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: speed, repeat: Infinity, ease: "linear" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeOpacity={0.5} strokeWidth={2} strokeLinecap="round" strokeDasharray={`${c * 0.25} ${c * 0.75}`} />
      </motion.svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div className="rounded-full" style={{ width: 3, height: 3, backgroundColor: color }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} />
      </div>
    </div>
  );
}

export function ServerComparison() {
  const [mode, setMode] = useState<Mode>("development");
  const [workers, setWorkers] = useState(4);

  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="size-2 rounded-full bg-lime-400 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide">Server Architecture</span>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="px-5 py-3 border-b border-border/30 bg-muted/5 flex items-center gap-2">
        {(["development", "production"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer relative",
              mode === m ? "text-foreground" : "text-muted-foreground/50 hover:text-muted-foreground"
            )}
          >
            {mode === m && (
              <motion.div
                layoutId="server-tab"
                className={cn(
                  "absolute inset-0 rounded-lg border",
                  m === "development" ? "bg-lime-500/10 border-lime-500/20" : "bg-blue-500/10 border-blue-500/20"
                )}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 capitalize">{m}</span>
          </button>
        ))}

        {/* Worker slider */}
        <AnimatePresence>
          {mode === "production" && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center gap-2 ml-auto overflow-hidden"
            >
              <span className="text-[10px] text-muted-foreground/50 font-mono shrink-0">Workers:</span>
              <input type="range" min={1} max={4} value={workers} onChange={(e) => setWorkers(Number(e.target.value))} className="w-16 accent-blue-500" />
              <span className="text-xs font-mono font-bold text-blue-400 w-3">{workers}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Visualization */}
      <div className="px-5 py-6 relative">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

        <AnimatePresence mode="wait">
          {mode === "development" ? (
            <motion.div key="dev" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
              {/* Single process */}
              <div className="max-w-[240px] mx-auto">
                <div className="rounded-xl border-2 border-lime-500/25 bg-lime-500/5 p-5 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-lime-400" />
                    <span className="text-[10px] font-mono text-lime-400/80 font-semibold">Uvicorn Process</span>
                  </div>
                  <LoopRing size={52} color="#84cc16" />
                  <div className="flex gap-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <motion.div key={i} className="size-2 rounded-full bg-lime-500/50" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }} />
                    ))}
                  </div>
                  <span className="text-[9px] text-muted-foreground/50 font-mono">~1000 concurrent conns</span>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-muted/30 border border-border/20 px-3 py-2 max-w-[320px] mx-auto">
                <code className="text-[10px] font-mono">
                  <span className="text-muted-foreground/40">$ </span>
                  <span className="text-lime-400/80">uvicorn</span>
                  <span className="text-muted-foreground/60"> main:app --reload</span>
                </code>
              </div>
            </motion.div>
          ) : (
            <motion.div key="prod" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
              {/* Gunicorn master */}
              <div className="rounded-lg border border-blue-500/25 bg-blue-500/5 px-3 py-2 mb-3 flex items-center justify-between max-w-sm mx-auto">
                <div className="flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-blue-400" />
                  <span className="text-[10px] font-mono text-blue-400/80 font-semibold">Gunicorn Master</span>
                </div>
                <span className="text-[8px] font-mono text-muted-foreground/40">PID 1</span>
              </div>

              {/* Workers grid */}
              <div className={cn("grid gap-2 max-w-sm mx-auto", workers <= 2 ? "grid-cols-2" : "grid-cols-4")}>
                <AnimatePresence mode="popLayout">
                  {Array.from({ length: workers }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.25, delay: i * 0.05 }}
                      className="rounded-xl border-2 border-lime-500/20 bg-lime-500/5 p-3 flex flex-col items-center gap-2"
                    >
                      <span className="text-[8px] font-mono text-muted-foreground/60">W{i + 1}</span>
                      <LoopRing size={28} speed={2.5 + i * 0.3} color="#84cc16" />
                      <div className="flex gap-0.5">
                        {Array.from({ length: 3 }).map((_, j) => (
                          <motion.div key={j} className="size-1.5 rounded-full bg-lime-500/50" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, delay: (i * 3 + j) * 0.15, repeat: Infinity }} />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-4 rounded-lg bg-muted/30 border border-border/20 px-3 py-2 max-w-sm mx-auto">
                <code className="text-[10px] font-mono">
                  <span className="text-muted-foreground/40">$ </span>
                  <span className="text-blue-400/80">gunicorn</span>
                  <span className="text-muted-foreground/60"> main:app -k uvicorn.workers.UvicornWorker</span>
                  <span className="text-foreground/80"> -w {workers}</span>
                </code>
              </div>

              <p className="text-[9px] text-center text-muted-foreground/40 font-mono mt-2">
                {workers} worker{workers > 1 ? "s" : ""} = {workers} CPU core{workers > 1 ? "s" : ""} utilized
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
