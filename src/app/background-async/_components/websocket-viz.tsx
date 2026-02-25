"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Radio,
  Monitor,
  Server,
  Webhook,
  Clock,
  Bell,
  RotateCcw,
  Play,
  Wifi,
  WifiOff,
  ArrowDown,
  UserMinus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────
interface Client {
  id: number;
  name: string;
  connected: boolean;
  messageCount: number;
  lastEvent: string | null;
}

interface EventMessage {
  id: number;
  source: "webhook" | "scheduler" | "system";
  text: string;
  short: string;
}

type SimPhase = "idle" | "running" | "done";

const SOURCE_META = {
  webhook: { icon: Webhook, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", glow: "shadow-[0_0_12px_rgba(244,63,94,0.2)]", label: "Webhook" },
  scheduler: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-[0_0_12px_rgba(245,158,11,0.2)]", label: "Scheduler" },
  system: { icon: Bell, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", glow: "shadow-[0_0_12px_rgba(14,165,233,0.2)]", label: "System" },
};

const EVENT_SCRIPT: { delay: number; source: EventMessage["source"]; text: string; short: string }[] = [
  { delay: 800, source: "system", text: "Server started on ws://0.0.0.0:8000/ws", short: "server.start" },
  { delay: 2000, source: "webhook", text: 'payment.success → $49.99', short: "payment.ok" },
  { delay: 3400, source: "scheduler", text: "daily_report triggered", short: "cron.report" },
  { delay: 4800, source: "webhook", text: 'user.signup → bob@...', short: "user.new" },
  { delay: 6200, source: "system", text: "Memory: 142MB / 512MB", short: "sys.health" },
  { delay: 7400, source: "scheduler", text: "Standup in 5 minutes", short: "reminder" },
  { delay: 8600, source: "webhook", text: 'order.shipped → #1042', short: "order.ship" },
];

// ── Scan line overlay ──────────────────────────────────────────
function ScanLines() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(255,255,255,0.03) 2px,
          rgba(255,255,255,0.03) 4px
        )`,
      }}
    />
  );
}

// ── Pulse line (server → client connection) ────────────────────
function ConnectionLine({
  connected,
  pulsing,
  sourceColor,
}: {
  connected: boolean;
  pulsing: boolean;
  sourceColor: string | null;
}) {
  const pulseColor = sourceColor || "rgb(74, 222, 128)";

  return (
    <div className="flex flex-col items-center h-8 relative">
      {/* The line */}
      <motion.div
        className={cn(
          "w-px h-full transition-all duration-500",
          connected ? "bg-emerald-500/30" : "bg-white/[0.04]",
        )}
        style={connected ? {} : { backgroundImage: "repeating-linear-gradient(180deg, transparent 0px, transparent 3px, rgba(255,255,255,0.06) 3px, rgba(255,255,255,0.06) 6px)" }}
      />

      {/* Pulse dot traveling down */}
      <AnimatePresence>
        {pulsing && connected && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 size-2 rounded-full"
            style={{
              background: pulseColor,
              boxShadow: `0 0 8px ${pulseColor}`,
            }}
            initial={{ top: 0, opacity: 0 }}
            animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeIn" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export function WebSocketViz() {
  const [phase, setPhase] = useState<SimPhase>("idle");
  const [clients, setClients] = useState<Client[]>([
    { id: 1, name: "Dashboard", connected: false, messageCount: 0, lastEvent: null },
    { id: 2, name: "Mobile App", connected: false, messageCount: 0, lastEvent: null },
    { id: 3, name: "Admin Panel", connected: false, messageCount: 0, lastEvent: null },
  ]);
  const [serverEvents, setServerEvents] = useState<EventMessage[]>([]);
  const [activeSource, setActiveSource] = useState<EventMessage["source"] | null>(null);
  const [pulsingClients, setPulsingClients] = useState(false);
  const generationRef = useRef(0);
  const msgIdRef = useRef(0);

  const reset = useCallback(() => {
    generationRef.current += 1;
    setPhase("idle");
    setClients([
      { id: 1, name: "Dashboard", connected: false, messageCount: 0, lastEvent: null },
      { id: 2, name: "Mobile App", connected: false, messageCount: 0, lastEvent: null },
      { id: 3, name: "Admin Panel", connected: false, messageCount: 0, lastEvent: null },
    ]);
    setServerEvents([]);
    setActiveSource(null);
    setPulsingClients(false);
    msgIdRef.current = 0;
  }, []);

  const run = useCallback(() => {
    if (phase === "running") return;
    reset();
    const gen = ++generationRef.current;

    setTimeout(() => {
      if (generationRef.current !== gen) return;
      setPhase("running");

      // Connect clients staggered
      [200, 450, 700].forEach((delay, i) => {
        setTimeout(() => {
          if (generationRef.current !== gen) return;
          setClients((prev) => prev.map((c, ci) => ci === i ? { ...c, connected: true } : c));
        }, delay);
      });

      // Fire events
      EVENT_SCRIPT.forEach((evt) => {
        const totalDelay = evt.delay + 1000;

        setTimeout(() => {
          if (generationRef.current !== gen) return;
          const msg: EventMessage = { id: ++msgIdRef.current, source: evt.source, text: evt.text, short: evt.short };

          // Flash source
          setActiveSource(evt.source);
          setServerEvents((prev) => [...prev, msg]);

          // Pulse lines after brief delay
          setTimeout(() => {
            if (generationRef.current !== gen) return;
            setPulsingClients(true);
          }, 250);

          // Deliver to connected clients
          setTimeout(() => {
            if (generationRef.current !== gen) return;
            setPulsingClients(false);
            setActiveSource(null);
            setClients((prev) => prev.map((c) =>
              c.connected ? { ...c, messageCount: c.messageCount + 1, lastEvent: evt.short } : c
            ));
          }, 600);
        }, totalDelay);
      });

      // Disconnect Mobile App mid-stream
      setTimeout(() => {
        if (generationRef.current !== gen) return;
        setClients((prev) => prev.map((c) => c.id === 2 ? { ...c, connected: false } : c));
      }, 5800 + 1000);

      // Done
      setTimeout(() => {
        if (generationRef.current !== gen) return;
        setPhase("done");
      }, EVENT_SCRIPT[EVENT_SCRIPT.length - 1].delay + 2000);
    }, 50);
  }, [phase, reset]);

  const connectedCount = clients.filter((c) => c.connected).length;
  const totalEvents = serverEvents.length;

  // Get the pulse color from active source
  const pulseColorMap: Record<string, string> = {
    webhook: "rgb(244, 63, 94)",
    scheduler: "rgb(245, 158, 11)",
    system: "rgb(14, 165, 233)",
  };
  const currentPulseColor = activeSource ? pulseColorMap[activeSource] : null;

  return (
    <div className="w-full rounded-2xl overflow-hidden relative isolate">
      {/* ── Background ── */}
      <div className="absolute inset-0 bg-[#08090e]" />
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-transparent to-emerald-950/20" />
      <ScanLines />

      <div className="relative">
        {/* ── Header ── */}
        <div className="px-6 sm:px-8 pt-7 pb-5">
          <div className="flex items-start sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  className="size-2 rounded-full bg-emerald-400"
                  animate={phase === "running" ? { opacity: [1, 0.3, 1], scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/40">
                  {phase === "running" ? "live" : phase === "done" ? "complete" : "ready"}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                WebSocket Event Stream
              </h3>
              <p className="text-xs sm:text-sm text-white/25 font-mono mt-1">
                server pushes events to connected clients in real-time
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {phase !== "idle" && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={reset}
                  className="text-white/25 hover:text-white/50 transition-colors p-2.5 rounded-xl hover:bg-white/5 cursor-pointer"
                >
                  <RotateCcw className="size-4" />
                </motion.button>
              )}
              <button
                onClick={run}
                disabled={phase === "running"}
                className={cn(
                  "inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl transition-all cursor-pointer",
                  phase === "running"
                    ? "bg-white/5 text-white/20 cursor-not-allowed"
                    : "bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.2)] hover:shadow-[0_0_40px_rgba(52,211,153,0.3)]"
                )}
              >
                <Play className="size-3.5" />
                Go Live
              </button>
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* ── EVENT SOURCES (top tier) ── */}
        <div className="px-6 sm:px-8 py-5">
          <span className="text-[9px] font-mono uppercase tracking-widest text-white/15 block mb-3">
            Event Sources
          </span>
          <div className="flex flex-wrap gap-3">
            {(Object.entries(SOURCE_META) as [EventMessage["source"], typeof SOURCE_META.webhook][]).map(([key, meta]) => {
              const Icon = meta.icon;
              const isActive = activeSource === key;
              return (
                <motion.div
                  key={key}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border px-4 py-3 transition-all duration-300 min-w-[120px]",
                    isActive
                      ? cn(meta.border, meta.bg, meta.glow)
                      : "border-white/[0.04] bg-white/[0.01]",
                  )}
                  animate={isActive ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className={cn(
                    "size-8 rounded-lg flex items-center justify-center transition-all duration-300",
                    isActive ? cn(meta.bg, meta.border, "border") : "bg-white/[0.03] border border-white/[0.04]",
                  )}>
                    <Icon className={cn("size-4 transition-colors duration-300", isActive ? meta.color : "text-white/15")} />
                  </div>
                  <div>
                    <span className={cn("text-xs font-bold block transition-colors duration-300", isActive ? meta.color : "text-white/20")}>
                      {meta.label}
                    </span>
                    <span className="text-[9px] font-mono text-white/10">
                      {key === "webhook" ? "POST /webhook" : key === "scheduler" ? "cron job" : "internal"}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── EVENT → SERVER arrow ── */}
        <div className="flex justify-center py-1 relative h-8">
          <AnimatePresence>
            {activeSource && (
              <motion.div
                key={activeSource}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 0.4, repeat: Infinity }}
                >
                  <ArrowDown className={cn("size-4", SOURCE_META[activeSource].color, "opacity-60")} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── SERVER HUB ── */}
        <div className="px-6 sm:px-8">
          <motion.div
            className={cn(
              "rounded-xl border-2 p-4 sm:p-5 transition-all duration-500 relative overflow-hidden",
              phase === "idle" && "border-white/[0.06] bg-white/[0.01]",
              phase === "running" && "border-indigo-500/25 bg-indigo-500/[0.03]",
              phase === "done" && "border-emerald-500/20 bg-emerald-500/[0.02]",
            )}
          >
            {/* Server header */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className={cn(
                "size-9 rounded-xl flex items-center justify-center transition-all duration-500",
                phase === "running" ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-white/[0.03] border border-white/[0.05]",
              )}>
                <Server className={cn("size-4 transition-colors duration-500", phase === "running" ? "text-indigo-400" : "text-white/20")} />
              </div>
              <div>
                <span className={cn("text-sm font-bold block transition-colors duration-500", phase === "running" ? "text-white/80" : "text-white/25")}>
                  FastAPI Server
                </span>
                <span className="text-[10px] font-mono text-white/15">
                  ws://localhost:8000/ws &middot; {connectedCount} connected
                </span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {totalEvents > 0 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] font-mono text-white/20 bg-white/[0.03] rounded-md px-2 py-1 border border-white/[0.04]"
                  >
                    {totalEvents} event{totalEvents !== 1 ? "s" : ""}
                  </motion.span>
                )}
              </div>
            </div>

            {/* Latest event display */}
            <AnimatePresence mode="wait">
              {serverEvents.length > 0 && (
                <motion.div
                  key={serverEvents[serverEvents.length - 1].id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 mb-2"
                >
                  {(() => {
                    const last = serverEvents[serverEvents.length - 1];
                    const meta = SOURCE_META[last.source];
                    const Icon = meta.icon;
                    return (
                      <div className="flex items-center gap-2">
                        <Icon className={cn("size-3.5 shrink-0", meta.color, "opacity-70")} />
                        <span className="text-[11px] font-mono text-white/40 truncate">{last.text}</span>
                        <span className={cn("text-[9px] font-mono ml-auto shrink-0 rounded px-1.5 py-0.5", meta.bg, meta.color, "opacity-60")}>
                          {meta.label.toLowerCase()}
                        </span>
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Broadcast indicator */}
            <AnimatePresence>
              {pulsingClients && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-1"
                >
                  <span className="text-[9px] font-mono text-indigo-400/50">
                    broadcasting to {connectedCount} client{connectedCount !== 1 ? "s" : ""}...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Processing shimmer */}
            <AnimatePresence>
              {activeSource && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/[0.04] to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ── CONNECTION LINES (server → clients) ── */}
        <div className="px-6 sm:px-8">
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {clients.map((client) => (
              <div key={client.id} className="flex justify-center">
                <ConnectionLine
                  connected={client.connected}
                  pulsing={pulsingClients && client.connected}
                  sourceColor={currentPulseColor}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── CLIENTS (bottom tier) ── */}
        <div className="px-6 sm:px-8 pb-5">
          <span className="text-[9px] font-mono uppercase tracking-widest text-white/15 block mb-3">
            Connected Clients
          </span>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {clients.map((client) => (
              <motion.div
                key={client.id}
                layout
                className={cn(
                  "rounded-xl border p-3 sm:p-4 transition-all duration-500 relative overflow-hidden",
                  client.connected
                    ? "border-emerald-500/15 bg-emerald-500/[0.02]"
                    : "border-white/[0.04] bg-white/[0.01] opacity-40",
                )}
              >
                {/* Client header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    "size-7 rounded-lg flex items-center justify-center transition-all duration-500",
                    client.connected
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : "bg-white/[0.03] border border-white/[0.04]",
                  )}>
                    <Monitor className={cn("size-3.5 transition-colors duration-500",
                      client.connected ? "text-emerald-400" : "text-white/15",
                    )} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className={cn("text-[11px] font-bold block truncate transition-colors duration-500",
                      client.connected ? "text-white/70" : "text-white/15",
                    )}>
                      {client.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {client.connected ? (
                        <Wifi className="size-2 text-emerald-400/50" />
                      ) : (
                        <WifiOff className="size-2 text-white/10" />
                      )}
                      <span className={cn("text-[8px] font-mono uppercase",
                        client.connected ? "text-emerald-400/30" : "text-white/10",
                      )}>
                        {client.connected ? "ws" : "off"}
                      </span>
                    </div>
                  </div>
                  <motion.div
                    className={cn("size-1.5 rounded-full shrink-0 transition-colors duration-500",
                      client.connected ? "bg-emerald-400" : "bg-white/10",
                    )}
                    animate={client.connected ? { opacity: [1, 0.3, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
                  <div>
                    <span className="text-[8px] font-mono text-white/10 uppercase block">messages</span>
                    <span className={cn("text-sm font-bold font-mono tabular-nums transition-colors duration-500",
                      client.messageCount > 0 ? "text-white/50" : "text-white/10",
                    )}>
                      {client.messageCount}
                    </span>
                  </div>
                  <AnimatePresence mode="wait">
                    {client.lastEvent && (
                      <motion.div
                        key={client.lastEvent}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-[8px] font-mono text-white/20 bg-white/[0.03] rounded px-1.5 py-0.5 border border-white/[0.04]"
                      >
                        {client.lastEvent}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Disconnection notice ── */}
        <AnimatePresence>
          {phase !== "idle" && !clients.find((c) => c.id === 2)?.connected && serverEvents.length > 3 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0 }}
            >
              <div className="mx-6 sm:mx-8 mb-4 rounded-lg border border-amber-500/15 bg-amber-500/[0.03] px-4 py-2.5 flex items-center gap-2.5">
                <UserMinus className="size-3.5 text-amber-400/50 shrink-0" />
                <span className="text-[11px] font-mono text-amber-400/40">
                  Mobile App disconnected — events no longer delivered to this client
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Footer ── */}
        <div className="px-6 sm:px-8 py-4 border-t border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.4)]" />
              <span className="text-[10px] text-white/20 font-mono">Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-white/10" />
              <span className="text-[10px] text-white/20 font-mono">Disconnected</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Radio className="size-3 text-white/10" />
            <span className="text-[10px] text-white/15 font-mono">
              {phase === "idle" && "ready"}
              {phase === "running" && `${totalEvents} events streamed`}
              {phase === "done" && `${totalEvents} events · complete`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
