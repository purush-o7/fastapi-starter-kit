"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  RotateCcw,
  Zap,
  Cable,
  Timer,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────
type Phase = "idle" | "running" | "done";

interface TimelineBar {
  id: number;
  label: string;
  segments: { type: "process" | "io" | "done"; width: number }[];
  startOffset: number; // scaled percentage (0-MAX_BAR_PCT)
  totalWidth: number;  // scaled percentage
  rawEnd: number;      // raw end position for time label
}

// ── Noise Texture ──────────────────────────────────────────────
function NoiseOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "128px 128px",
      }}
    />
  );
}

// ── Request Row ────────────────────────────────────────────────
function WaterfallRow({
  bar,
  index,
  animate,
  variant,
  totalRawDuration,
}: {
  bar: TimelineBar;
  index: number;
  animate: boolean;
  variant: "wsgi" | "asgi";
  totalRawDuration: number;
}) {
  const processColor = variant === "wsgi" ? "bg-rose-500" : "bg-cyan-500";
  const ioColor = variant === "wsgi" ? "bg-rose-500/20" : "bg-cyan-500/20";
  const ioBorder = variant === "wsgi" ? "border-rose-500/30" : "border-cyan-500/30";
  const textColor = variant === "wsgi" ? "text-rose-300" : "text-cyan-300";

  // Convert raw end to display seconds (scale: 10 raw units = 1 second)
  const endTimeSeconds = (bar.rawEnd / 10).toFixed(1);

  return (
    <motion.div
      className="flex items-center gap-3 sm:gap-4"
      initial={{ opacity: 0, x: -12 }}
      animate={animate ? { opacity: 1, x: 0 } : { opacity: 0.3, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
    >
      {/* Label */}
      <span className={cn(
        "text-xs sm:text-sm font-mono w-16 sm:w-20 text-right shrink-0 font-medium transition-colors duration-500",
        animate ? textColor : "text-white/20",
      )}>
        {bar.label}
      </span>

      {/* Timeline track */}
      <div className="flex-1 h-8 sm:h-10 relative rounded-md bg-white/[0.02] border border-white/[0.04] overflow-hidden">
        {/* The animated bar */}
        <motion.div
          className="absolute top-1 bottom-1 sm:top-1.5 sm:bottom-1.5 rounded-[4px] overflow-hidden flex"
          style={{ left: `${bar.startOffset}%` }}
          initial={{ width: 0 }}
          animate={animate ? { width: `${bar.totalWidth}%` } : { width: 0 }}
          transition={{
            duration: 1.2,
            delay: index * 0.2 + 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {bar.segments.map((seg, si) => (
            <div
              key={si}
              className={cn(
                "h-full relative",
                seg.type === "process" && processColor,
                seg.type === "io" && cn(ioColor, "border-y", ioBorder),
                seg.type === "done" && "bg-emerald-500/70",
              )}
              style={{ width: `${(seg.width / bar.totalWidth) * 100}%` }}
            >
              {seg.type === "process" && animate && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: si * 0.3 }}
                />
              )}
              {seg.type === "io" && (
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                      135deg, transparent, transparent 3px,
                      rgba(255,255,255,0.06) 3px, rgba(255,255,255,0.06) 5px
                    )`,
                  }}
                />
              )}
              {seg.type === "io" && seg.width > 8 && (
                <span className={cn(
                  "absolute inset-0 flex items-center justify-center text-[9px] sm:text-[10px] font-mono font-medium",
                  variant === "wsgi" ? "text-rose-300/50" : "text-cyan-300/50",
                )}>
                  await
                </span>
              )}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Time label OUTSIDE the track so it can't overflow */}
      <motion.span
        className={cn(
          "text-[10px] sm:text-xs font-mono font-medium w-10 shrink-0 tabular-nums transition-colors duration-500",
          animate ? cn(textColor, "opacity-50") : "text-white/10",
        )}
        initial={{ opacity: 0 }}
        animate={animate ? { opacity: 0.5 } : { opacity: 0 }}
        transition={{ delay: index * 0.2 + 1.5 }}
      >
        {endTimeSeconds}s
      </motion.span>
    </motion.div>
  );
}

// ── Timeline data ──────────────────────────────────────────────
const REQUESTS = [
  { label: "/users", processTime: 3, ioTime: 8 },
  { label: "/items", processTime: 2, ioTime: 12 },
  { label: "/orders", processTime: 3, ioTime: 10 },
  { label: "/stats", processTime: 2, ioTime: 6 },
  { label: "/health", processTime: 1, ioTime: 4 },
];

// Scale factor: bars should fill at most ~85% of the track width
const MAX_BAR_PCT = 85;

function buildWsgiBars(): { bars: TimelineBar[]; rawTotal: number } {
  let offset = 0;
  const bars = REQUESTS.map((req, i) => {
    const total = req.processTime + req.ioTime + 1;
    const bar = {
      id: i,
      label: req.label,
      startOffset: offset,
      totalWidth: total,
      rawEnd: offset + total,
      segments: [
        { type: "process" as const, width: req.processTime },
        { type: "io" as const, width: req.ioTime },
        { type: "done" as const, width: 1 },
      ],
    };
    offset += total + 0.5;
    return bar;
  });
  const rawTotal = Math.max(...bars.map((b) => b.rawEnd));

  // Scale to fit within MAX_BAR_PCT
  const scale = MAX_BAR_PCT / rawTotal;
  return {
    bars: bars.map((b) => ({
      ...b,
      startOffset: b.startOffset * scale,
      totalWidth: b.totalWidth * scale,
    })),
    rawTotal,
  };
}

function buildAsgiBars(): { bars: TimelineBar[]; rawTotal: number } {
  const bars = REQUESTS.map((req, i) => {
    const stagger = i * 1.2;
    const total = req.processTime + req.ioTime + 1;
    return {
      id: i,
      label: req.label,
      startOffset: stagger,
      totalWidth: total,
      rawEnd: stagger + total,
      segments: [
        { type: "process" as const, width: req.processTime },
        { type: "io" as const, width: req.ioTime },
        { type: "done" as const, width: 1 },
      ],
    };
  });
  const rawTotal = Math.max(...bars.map((b) => b.rawEnd));

  const scale = MAX_BAR_PCT / rawTotal;
  return {
    bars: bars.map((b) => ({
      ...b,
      startOffset: b.startOffset * scale,
      totalWidth: b.totalWidth * scale,
    })),
    rawTotal,
  };
}

const { bars: WSGI_BARS, rawTotal: WSGI_RAW } = buildWsgiBars();
const { bars: ASGI_BARS, rawTotal: ASGI_RAW } = buildAsgiBars();

// Display times (10 raw = 1 second)
const WSGI_TIME = (WSGI_RAW / 10).toFixed(1);
const ASGI_TIME = (ASGI_RAW / 10).toFixed(1);
const SPEEDUP = (WSGI_RAW / ASGI_RAW).toFixed(1);

// Animation timing: last bar finishes at delay + duration
// WSGI has 5 bars: last bar delay = 4*0.2 + 0.3 = 1.1, + duration 1.2 = 2.3s
// Add buffer for result reveal
const DONE_DELAY = 2800;

// ── Main Component ─────────────────────────────────────────────
export function AsgiWsgiViz() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [isRunning, setIsRunning] = useState(false);
  const generationRef = useRef(0);

  const reset = useCallback(() => {
    generationRef.current += 1;
    setPhase("idle");
    setIsRunning(false);
  }, []);

  const run = useCallback(() => {
    if (isRunning) return;
    const gen = ++generationRef.current;
    setPhase("idle");
    setIsRunning(true);

    setTimeout(() => {
      if (generationRef.current !== gen) return;
      setPhase("running");
    }, 100);

    // Wait for all bar animations to complete before showing result
    setTimeout(() => {
      if (generationRef.current !== gen) return;
      setPhase("done");
      setIsRunning(false);
    }, DONE_DELAY);
  }, [isRunning]);

  const showBars = phase === "running" || phase === "done";

  return (
    <div className="w-full rounded-2xl overflow-hidden relative isolate">
      {/* ── Background ── */}
      <div className="absolute inset-0 bg-[#09090d]" />
      <div className="absolute inset-0 bg-gradient-to-br from-rose-950/25 via-transparent to-cyan-950/25" />
      <NoiseOverlay />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(0deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative">
        {/* ── Header ── */}
        <div className="px-6 sm:px-8 pt-7 pb-6">
          <div className="flex items-start sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="size-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                <div className="w-6 h-px bg-white/10" />
                <div className="size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Request Waterfall
              </h3>
              <p className="text-xs sm:text-sm text-white/30 font-mono mt-1">
                5 requests &middot; same database latency &middot; different architectures
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {phase !== "idle" && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={reset}
                  className="text-white/30 hover:text-white/60 transition-colors p-2.5 rounded-xl hover:bg-white/5 cursor-pointer"
                >
                  <RotateCcw className="size-4" />
                </motion.button>
              )}
              <button
                onClick={run}
                disabled={isRunning}
                className={cn(
                  "inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl transition-all cursor-pointer",
                  isRunning
                    ? "bg-white/5 text-white/20 cursor-not-allowed"
                    : "bg-white text-[#09090d] hover:bg-white/90 shadow-[0_0_40px_rgba(255,255,255,0.12)] hover:shadow-[0_0_50px_rgba(255,255,255,0.18)]"
                )}
              >
                <Play className="size-3.5" />
                Run Test
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {[
              { color: "bg-rose-500", label: "Processing (CPU)" },
              { color: "bg-rose-500/20 border border-rose-500/30", label: "I/O Wait (blocked)" },
              { color: "bg-emerald-500/70", label: "Complete" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={cn("w-5 h-3 rounded-[3px]", item.color)} />
                <span className="text-[11px] sm:text-xs text-white/30 font-mono">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* ── WSGI Section ── */}
        <div className="px-6 sm:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "size-9 rounded-xl flex items-center justify-center transition-all duration-500",
                showBars
                  ? "bg-rose-500/15 border border-rose-500/25 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                  : "bg-white/[0.03] border border-white/[0.06]",
              )}>
                <Cable className={cn("size-4 transition-colors duration-500", showBars ? "text-rose-400" : "text-white/20")} />
              </div>
              <div>
                <span className={cn("text-sm sm:text-base font-bold uppercase tracking-wider transition-colors duration-500 block", showBars ? "text-rose-300" : "text-white/20")}>
                  WSGI
                </span>
                <span className="text-[11px] text-white/20 font-mono">synchronous &middot; sequential</span>
              </div>
            </div>
            <AnimatePresence>
              {phase === "done" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-1.5"
                >
                  <Timer className="size-3.5 text-rose-400/60" />
                  <span className="text-sm font-mono font-bold text-rose-300 tabular-nums">{WSGI_TIME}s</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-1.5">
            {WSGI_BARS.map((bar, i) => (
              <WaterfallRow key={bar.id} bar={bar} index={i} animate={showBars} variant="wsgi" totalRawDuration={WSGI_RAW} />
            ))}
          </div>
        </div>

        {/* ── Center Divider ── */}
        <div className="relative py-3">
          <div className="h-px bg-gradient-to-r from-rose-500/15 via-white/[0.04] to-cyan-500/15" />
          <div className="absolute inset-x-0 -top-3.5 flex justify-center">
            <AnimatePresence>
              {phase === "done" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.6, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.3 }}
                  className="bg-[#09090d] border border-emerald-500/30 rounded-full px-5 py-1.5 flex items-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.1)]"
                >
                  <TrendingUp className="size-4 text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-400">{SPEEDUP}x faster</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── ASGI Section ── */}
        <div className="px-6 sm:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "size-9 rounded-xl flex items-center justify-center transition-all duration-500",
                showBars
                  ? "bg-cyan-500/15 border border-cyan-500/25 shadow-[0_0_12px_rgba(34,211,238,0.15)]"
                  : "bg-white/[0.03] border border-white/[0.06]",
              )}>
                <Zap className={cn("size-4 transition-colors duration-500", showBars ? "text-cyan-400" : "text-white/20")} />
              </div>
              <div>
                <span className={cn("text-sm sm:text-base font-bold uppercase tracking-wider transition-colors duration-500 block", showBars ? "text-cyan-300" : "text-white/20")}>
                  ASGI
                </span>
                <span className="text-[11px] text-white/20 font-mono">asynchronous &middot; concurrent</span>
              </div>
            </div>
            <AnimatePresence>
              {phase === "done" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-3 py-1.5"
                >
                  <Timer className="size-3.5 text-cyan-400/60" />
                  <span className="text-sm font-mono font-bold text-cyan-300 tabular-nums">{ASGI_TIME}s</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-1.5">
            {ASGI_BARS.map((bar, i) => (
              <WaterfallRow key={bar.id} bar={bar} index={i} animate={showBars} variant="asgi" totalRawDuration={ASGI_RAW} />
            ))}
          </div>
        </div>

        {/* ── Result Banner ── */}
        <AnimatePresence>
          {phase === "done" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
              <div className="px-6 sm:px-8 py-7 bg-gradient-to-r from-emerald-950/20 via-transparent to-emerald-950/20">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="text-center max-w-md mx-auto"
                >
                  <p className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-400/40 mb-2">Result</p>
                  <p className="text-xl sm:text-2xl font-bold text-white/90">
                    ASGI finished in{" "}
                    <span className="text-cyan-400">{ASGI_TIME}s</span>
                    {" "}vs WSGI&apos;s{" "}
                    <span className="text-rose-400">{WSGI_TIME}s</span>
                  </p>
                  <p className="text-sm text-white/30 mt-2 leading-relaxed">
                    WSGI blocks the thread on every I/O call. ASGI yields and processes other requests while waiting.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Footer ── */}
        <div className="px-6 sm:px-8 py-4 border-t border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-rose-400 shadow-[0_0_4px_rgba(244,63,94,0.4)]" />
              <span className="text-[11px] text-white/25 font-mono">WSGI</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-cyan-400 shadow-[0_0_4px_rgba(34,211,238,0.4)]" />
              <span className="text-[11px] text-white/25 font-mono">ASGI</span>
            </div>
          </div>
          <span className="text-[11px] text-white/20 font-mono">
            {phase === "idle" && "ready"}
            {phase === "running" && "testing..."}
            {phase === "done" && "complete"}
          </span>
        </div>
      </div>
    </div>
  );
}
