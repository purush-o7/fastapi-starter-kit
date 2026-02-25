"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_REQUESTS = 5;
const WINDOW_SECONDS = 12;

interface LogEntry {
  id: number;
  status: "ok" | "rejected";
  timestamp: string;
}

/* SVG arc gauge component */
function ArcGauge({ used, max, timeLeft, totalTime, isActive }: {
  used: number;
  max: number;
  timeLeft: number;
  totalTime: number;
  isActive: boolean;
}) {
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 72;
  const strokeW = 8;
  const startAngle = 135;
  const endAngle = 405;
  const totalArc = endAngle - startAngle;

  const polarToCartesian = (angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const describeArc = (start: number, end: number) => {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  const fillAngle = startAngle + (used / max) * totalArc;
  const timerRadius = radius + 14;
  const timerFraction = isActive ? timeLeft / totalTime : 1;
  const timerAngle = startAngle + timerFraction * totalArc;

  const fillColor = used >= max ? "#ef4444" : used >= max - 1 ? "#f59e0b" : "#10b981";
  const isExhausted = used >= max;

  // Segment tick marks
  const ticks = Array.from({ length: max }).map((_, i) => {
    const angle = startAngle + ((i + 0.5) / max) * totalArc;
    const inner = polarToCartesian(angle);
    const outerR = radius + 3;
    const rad = ((angle - 90) * Math.PI) / 180;
    const outer = { x: cx + outerR * Math.cos(rad), y: cy + outerR * Math.sin(rad) };
    return { inner, outer, filled: i < used };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      {/* Background arc */}
      <path
        d={describeArc(startAngle, endAngle)}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.08}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />

      {/* Timer ring (outer) */}
      {isActive && (
        <motion.path
          d={describeArc(startAngle, timerAngle)}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.06}
          strokeWidth={3}
          strokeLinecap="round"
          initial={false}
          animate={{ strokeOpacity: 0.06 }}
        />
      )}

      {/* Fill arc */}
      <motion.path
        d={describeArc(startAngle, Math.min(fillAngle, endAngle))}
        fill="none"
        stroke={fillColor}
        strokeWidth={strokeW}
        strokeLinecap="round"
        initial={false}
        animate={{
          strokeOpacity: isExhausted ? [0.9, 0.5, 0.9] : 0.8,
        }}
        transition={isExhausted ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
        style={{ filter: `drop-shadow(0 0 6px ${fillColor}40)` }}
      />

      {/* Segment ticks */}
      {ticks.map((tick, i) => (
        <motion.line
          key={i}
          x1={tick.inner.x} y1={tick.inner.y}
          x2={tick.outer.x} y2={tick.outer.y}
          stroke={tick.filled ? fillColor : "currentColor"}
          strokeOpacity={tick.filled ? 0.8 : 0.15}
          strokeWidth={2}
          strokeLinecap="round"
          initial={false}
          animate={{ strokeOpacity: tick.filled ? 0.8 : 0.15 }}
          transition={{ duration: 0.2 }}
        />
      ))}

      {/* Glow effect when exhausted */}
      {isExhausted && (
        <motion.circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="#ef4444"
          strokeWidth={1}
          initial={{ strokeOpacity: 0 }}
          animate={{ strokeOpacity: [0, 0.2, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Center text */}
      <text x={cx} y={cy - 10} textAnchor="middle" className="fill-foreground text-[28px] font-bold font-mono" style={{ fontFamily: "var(--font-geist-mono)" }}>
        {max - used}
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" className="fill-muted-foreground text-[9px] font-mono tracking-widest" style={{ fontFamily: "var(--font-geist-mono)" }}>
        REMAINING
      </text>

      {/* Timer text at bottom of arc */}
      {isActive && (
        <text x={cx} y={cy + 28} textAnchor="middle" className="text-[9px] font-mono" style={{ fontFamily: "var(--font-geist-mono)" }} fill={fillColor} fillOpacity={0.6}>
          {timeLeft}s
        </text>
      )}
    </svg>
  );
}

export function RateLimitSim() {
  const [requestCount, setRequestCount] = useState(0);
  const [nextId, setNextId] = useState(1);
  const [timeLeft, setTimeLeft] = useState(WINDOW_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [flash, setFlash] = useState<"ok" | "rejected" | null>(null);
  const windowRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback(() => {
    setRequestCount(0);
    setTimeLeft(WINDOW_SECONDS);
    setIsActive(false);
    windowRef.current = null;
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const fullReset = useCallback(() => {
    reset();
    setLog([]);
    setNextId(1);
  }, [reset]);

  const startWindow = useCallback(() => {
    if (windowRef.current !== null) return;
    windowRef.current = Date.now();
    setIsActive(true);
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - (windowRef.current ?? Date.now())) / 1000;
      const r = Math.max(0, WINDOW_SECONDS - elapsed);
      setTimeLeft(Math.ceil(r));
      if (r <= 0) reset();
    }, 100);
  }, [reset]);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const send = useCallback(() => {
    if (!isActive) startWindow();

    const accepted = requestCount < MAX_REQUESTS;
    const id = nextId;
    const now = new Date();
    const ts = now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

    if (accepted) setRequestCount((c) => c + 1);

    const status: "ok" | "rejected" = accepted ? "ok" : "rejected";
    setLog((prev) => [{ id, status, timestamp: ts }, ...prev].slice(0, 8));
    setNextId((n) => n + 1);

    setFlash(accepted ? "ok" : "rejected");
    setTimeout(() => setFlash(null), 400);
  }, [requestCount, nextId, isActive, startWindow]);

  const isExhausted = requestCount >= MAX_REQUESTS;

  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className={cn("size-2 rounded-full transition-colors duration-300",
            isExhausted ? "bg-red-400 animate-pulse" : isActive ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
          )} />
          <span className="text-xs font-semibold tracking-wide">Rate Limit Simulator</span>
        </div>
        <button onClick={fullReset} className="text-muted-foreground/50 hover:text-foreground transition-colors p-1 cursor-pointer">
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      {/* Config line */}
      <div className="px-5 py-2 border-b border-border/30 bg-muted/5">
        <code className="text-[10px] font-mono text-muted-foreground/60">
          <span className="text-amber-400/80">@limiter.limit</span>
          <span>(</span>
          <span className="text-foreground/70">&quot;{MAX_REQUESTS}/{WINDOW_SECONDS}s&quot;</span>
          <span>)</span>
          <span className="text-muted-foreground/30"> · </span>
          <span className="text-purple-400/60">POST /login</span>
        </code>
      </div>

      {/* Main content: gauge + log */}
      <div className="px-5 py-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Gauge */}
          <div className="relative shrink-0">
            {/* Flash overlay */}
            <AnimatePresence>
              {flash && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    boxShadow: flash === "ok"
                      ? "inset 0 0 40px 10px rgba(16,185,129,0.15)"
                      : "inset 0 0 40px 10px rgba(239,68,68,0.2)",
                  }}
                />
              )}
            </AnimatePresence>
            <ArcGauge
              used={requestCount}
              max={MAX_REQUESTS}
              timeLeft={timeLeft}
              totalTime={WINDOW_SECONDS}
              isActive={isActive}
            />
          </div>

          {/* Right panel: button + log */}
          <div className="flex-1 w-full min-w-0 space-y-4">
            {/* Send button */}
            <motion.button
              onClick={send}
              whileTap={{ scale: 0.94 }}
              className={cn(
                "w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer",
                isExhausted
                  ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15"
                  : "bg-gradient-to-b from-amber-500/15 to-amber-500/5 text-amber-400 border border-amber-500/20 hover:border-amber-500/40"
              )}
            >
              <Send className="size-3" />
              {isExhausted ? "Send (will reject)" : "Send Request"}
            </motion.button>

            {/* Request log */}
            <div className="space-y-1 max-h-[140px] overflow-hidden">
              <p className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-1.5">
                Request Log
              </p>
              <AnimatePresence initial={false}>
                {log.length === 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] text-muted-foreground/30 font-mono"
                  >
                    No requests yet — click Send
                  </motion.p>
                )}
                {log.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, height: 0, y: -8 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 py-0.5">
                      <span className={cn(
                        "text-[9px] font-mono font-bold w-6 shrink-0",
                        entry.status === "ok" ? "text-emerald-400" : "text-red-400"
                      )}>
                        {entry.status === "ok" ? "200" : "429"}
                      </span>
                      <div className={cn(
                        "flex-1 h-px",
                        entry.status === "ok" ? "bg-emerald-500/15" : "bg-red-500/15"
                      )} />
                      <span className="text-[9px] font-mono text-muted-foreground/40 shrink-0">
                        {entry.timestamp}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Status footer */}
      <div className={cn(
        "px-5 py-2.5 border-t text-[10px] font-mono transition-colors duration-300 flex items-center justify-between",
        isExhausted ? "bg-red-500/5 border-red-500/15 text-red-400/80" : "bg-muted/10 text-muted-foreground/40"
      )}>
        <span>
          {isExhausted
            ? "429 Too Many Requests — retry after window resets"
            : isActive
              ? `Window resets in ${timeLeft}s`
              : "Idle — send a request to start"}
        </span>
        <span className="tabular-nums">
          {requestCount}/{MAX_REQUESTS}
        </span>
      </div>
    </div>
  );
}
