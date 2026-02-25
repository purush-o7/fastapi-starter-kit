"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Server, Monitor, Wifi, WifiOff, RotateCcw, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────
type Phase = "idle" | "healthy" | "latent" | "dead" | "done";

interface PingEvent {
  id: number;
  type: "ping" | "pong" | "ping-timeout" | "disconnect";
  direction: "right" | "left" | "none";
}

// ── Main Component ─────────────────────────────────────────────
export function HeartbeatViz() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [events, setEvents] = useState<PingEvent[]>([]);
  const [heartbeatCount, setHeartbeatCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [clientAlive, setClientAlive] = useState(true);
  const [lastPingTime, setLastPingTime] = useState<number | null>(null);
  const generationRef = useRef(0);
  const eventIdRef = useRef(0);

  const reset = useCallback(() => {
    generationRef.current += 1;
    setPhase("idle");
    setEvents([]);
    setHeartbeatCount(0);
    setIsRunning(false);
    setClientAlive(true);
    setLastPingTime(null);
    eventIdRef.current = 0;
  }, []);

  const run = useCallback(() => {
    if (isRunning) return;
    reset();
    const gen = ++generationRef.current;

    setTimeout(() => {
      if (generationRef.current !== gen) return;
      setIsRunning(true);
      setPhase("healthy");

      // 3 successful ping/pong cycles
      const pingInterval = 1200;
      for (let i = 0; i < 3; i++) {
        const pingTime = i * pingInterval + 300;
        const pongTime = pingTime + 400;

        // Server sends PING →
        setTimeout(() => {
          if (generationRef.current !== gen) return;
          setLastPingTime(Date.now());
          setEvents((prev) => [...prev, { id: ++eventIdRef.current, type: "ping", direction: "right" }]);
        }, pingTime);

        // Client responds ← PONG
        setTimeout(() => {
          if (generationRef.current !== gen) return;
          setHeartbeatCount((c) => c + 1);
          setEvents((prev) => [...prev, { id: ++eventIdRef.current, type: "pong", direction: "left" }]);
        }, pongTime);
      }

      // 4th ping — client goes silent (simulating network failure)
      const failPingTime = 3 * pingInterval + 300;
      setTimeout(() => {
        if (generationRef.current !== gen) return;
        setPhase("latent");
        setLastPingTime(Date.now());
        setEvents((prev) => [...prev, { id: ++eventIdRef.current, type: "ping", direction: "right" }]);
      }, failPingTime);

      // No pong comes back — timeout!
      const timeoutTime = failPingTime + 1500;
      setTimeout(() => {
        if (generationRef.current !== gen) return;
        setEvents((prev) => [...prev, { id: ++eventIdRef.current, type: "ping-timeout", direction: "none" }]);
      }, timeoutTime);

      // Server disconnects the client
      const disconnectTime = timeoutTime + 800;
      setTimeout(() => {
        if (generationRef.current !== gen) return;
        setPhase("dead");
        setClientAlive(false);
        setEvents((prev) => [...prev, { id: ++eventIdRef.current, type: "disconnect", direction: "none" }]);
      }, disconnectTime);

      // Done
      setTimeout(() => {
        if (generationRef.current !== gen) return;
        setPhase("done");
        setIsRunning(false);
      }, disconnectTime + 1000);
    }, 50);
  }, [isRunning, reset]);

  return (
    <div className="w-full rounded-2xl overflow-hidden relative isolate">
      {/* Background */}
      <div className="absolute inset-0 bg-[#08090e]" />
      <div className="absolute inset-0 bg-gradient-to-br from-rose-950/15 via-transparent to-emerald-950/15" />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)`,
        }}
      />

      <div className="relative">
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className={cn(
                "size-8 rounded-lg flex items-center justify-center transition-all duration-500",
                phase === "healthy" ? "bg-emerald-500/10 border border-emerald-500/20" :
                phase === "latent" ? "bg-amber-500/10 border border-amber-500/20" :
                phase === "dead" || phase === "done" ? "bg-red-500/10 border border-red-500/20" :
                "bg-white/[0.03] border border-white/[0.05]",
              )}>
                <motion.div
                  animate={phase === "healthy" ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <Heart className={cn("size-4 transition-colors duration-500",
                    phase === "healthy" ? "text-emerald-400" :
                    phase === "latent" ? "text-amber-400" :
                    (phase === "dead" || phase === "done") ? "text-red-400" :
                    "text-white/20",
                  )} />
                </motion.div>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white/90 tracking-tight">Ping / Pong Heartbeat</h3>
                <p className="text-[10px] text-white/25 font-mono">how Uvicorn detects dead connections</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {phase !== "idle" && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={reset}
                  className="text-white/25 hover:text-white/50 transition-colors p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                </motion.button>
              )}
              <button
                onClick={run}
                disabled={isRunning}
                className={cn(
                  "inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all cursor-pointer",
                  isRunning
                    ? "bg-white/5 text-white/20 cursor-not-allowed"
                    : "bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.2)]"
                )}
              >
                <Play className="size-3" />
                Simulate
              </button>
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* ── Visualization ── */}
        <div className="px-6 sm:px-8 py-6">
          {/* Server ↔ Client with connection line */}
          <div className="flex items-center gap-4 sm:gap-6 mb-5">
            {/* Server */}
            <div className={cn(
              "flex-shrink-0 rounded-xl border p-3 sm:p-4 w-[100px] sm:w-[120px] text-center transition-all duration-500",
              (phase === "healthy" || phase === "latent") ? "border-indigo-500/20 bg-indigo-500/[0.03]" :
              (phase === "dead" || phase === "done") ? "border-red-500/15 bg-red-500/[0.02]" :
              "border-white/[0.05] bg-white/[0.01]",
            )}>
              <Server className={cn("size-5 mx-auto mb-1.5 transition-colors duration-500",
                (phase === "healthy" || phase === "latent") ? "text-indigo-400" :
                (phase === "dead" || phase === "done") ? "text-red-400/60" : "text-white/20",
              )} />
              <span className="text-[11px] font-bold text-white/60 block">Uvicorn</span>
              <span className="text-[8px] font-mono text-white/20">
                ping every 20s
              </span>
            </div>

            {/* Connection line with flying ping/pong */}
            <div className="flex-1 relative h-16">
              {/* The line */}
              <div className={cn(
                "absolute top-1/2 -translate-y-1/2 left-0 right-0 h-px transition-colors duration-500",
                clientAlive ? "bg-emerald-500/20" : "bg-red-500/15",
              )}
                style={!clientAlive ? { backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 4px, rgba(239,68,68,0.15) 4px, rgba(239,68,68,0.15) 8px)" } : {}}
              />

              {/* Labels above/below line */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[8px] font-mono text-emerald-400/30">
                PING →
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[8px] font-mono text-sky-400/30">
                ← PONG
              </div>

              {/* Animated events on the line */}
              <AnimatePresence>
                {events.slice(-2).map((evt) => {
                  if (evt.direction === "right") {
                    return (
                      <motion.div
                        key={evt.id}
                        className="absolute top-1/2 -translate-y-1/2"
                        initial={{ left: "0%", opacity: 0 }}
                        animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        <div className={cn(
                          "size-3 rounded-full -translate-x-1/2 -translate-y-0",
                          evt.type === "ping" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]",
                        )} />
                      </motion.div>
                    );
                  }
                  if (evt.direction === "left") {
                    return (
                      <motion.div
                        key={evt.id}
                        className="absolute top-1/2 -translate-y-1/2"
                        initial={{ left: "100%", opacity: 0 }}
                        animate={{ left: "0%", opacity: [0, 1, 1, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        <div className="size-3 rounded-full -translate-x-1/2 bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                      </motion.div>
                    );
                  }
                  if (evt.type === "ping-timeout") {
                    return (
                      <motion.div
                        key={evt.id}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      >
                        <div className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 text-[9px] font-mono text-amber-400 font-bold">
                          TIMEOUT
                        </div>
                      </motion.div>
                    );
                  }
                  if (evt.type === "disconnect") {
                    return (
                      <motion.div
                        key={evt.id}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      >
                        <div className="rounded-full bg-red-500/20 border border-red-500/30 px-2.5 py-1 flex items-center gap-1">
                          <X className="size-2.5 text-red-400" />
                          <span className="text-[9px] font-mono text-red-400 font-bold">CLOSED</span>
                        </div>
                      </motion.div>
                    );
                  }
                  return null;
                })}
              </AnimatePresence>
            </div>

            {/* Client */}
            <div className={cn(
              "flex-shrink-0 rounded-xl border p-3 sm:p-4 w-[100px] sm:w-[120px] text-center transition-all duration-500",
              clientAlive ? "border-emerald-500/15 bg-emerald-500/[0.02]" : "border-red-500/15 bg-red-500/[0.02] opacity-50",
            )}>
              <Monitor className={cn("size-5 mx-auto mb-1.5 transition-colors duration-500",
                clientAlive ? "text-emerald-400" : "text-red-400/40",
              )} />
              <span className="text-[11px] font-bold text-white/60 block">Client</span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                {clientAlive ? (
                  <Wifi className="size-2.5 text-emerald-400/50" />
                ) : (
                  <WifiOff className="size-2.5 text-red-400/30" />
                )}
                <span className={cn("text-[8px] font-mono",
                  clientAlive ? "text-emerald-400/30" : "text-red-400/25",
                )}>
                  {clientAlive ? "alive" : "dead"}
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-6 sm:gap-8">
            <div className="text-center">
              <span className="text-[8px] font-mono uppercase tracking-wider text-white/15 block">Heartbeats</span>
              <span className={cn("text-lg font-bold font-mono tabular-nums",
                heartbeatCount > 0 ? "text-emerald-400/70" : "text-white/10",
              )}>
                {heartbeatCount}
              </span>
            </div>
            <div className="w-px h-8 bg-white/[0.04]" />
            <div className="text-center">
              <span className="text-[8px] font-mono uppercase tracking-wider text-white/15 block">Status</span>
              <span className={cn("text-xs font-bold font-mono",
                phase === "healthy" ? "text-emerald-400/70" :
                phase === "latent" ? "text-amber-400/70" :
                (phase === "dead" || phase === "done") ? "text-red-400/70" :
                "text-white/15",
              )}>
                {phase === "idle" && "waiting"}
                {phase === "healthy" && "healthy"}
                {phase === "latent" && "no response..."}
                {phase === "dead" && "connection lost"}
                {phase === "done" && "disconnected"}
              </span>
            </div>
            <div className="w-px h-8 bg-white/[0.04]" />
            <div className="text-center">
              <span className="text-[8px] font-mono uppercase tracking-wider text-white/15 block">Interval</span>
              <span className="text-xs font-bold font-mono text-white/30">20s</span>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {phase === "done" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.4 }}
            >
              <div className="h-px bg-gradient-to-r from-transparent via-red-500/15 to-transparent" />
              <div className="px-6 sm:px-8 py-4 bg-red-500/[0.02]">
                <p className="text-xs text-white/30 text-center max-w-md mx-auto leading-relaxed">
                  Uvicorn sent 4 pings. The client responded to 3 but went silent on the 4th.
                  After the timeout, the server closed the connection and cleaned up resources.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-3 border-t border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded-full bg-emerald-400/80 flex items-center justify-center">
                <span className="text-[5px] text-white font-bold">P</span>
              </div>
              <span className="text-[9px] text-white/20 font-mono">Ping</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded-full bg-sky-400/80 flex items-center justify-center">
                <span className="text-[5px] text-white font-bold">P</span>
              </div>
              <span className="text-[9px] text-white/20 font-mono">Pong</span>
            </div>
          </div>
          <span className="text-[9px] text-white/15 font-mono">
            --ws-ping-interval 20 --ws-ping-timeout 20
          </span>
        </div>
      </div>
    </div>
  );
}
