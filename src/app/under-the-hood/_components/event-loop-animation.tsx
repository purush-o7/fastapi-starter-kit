"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, SkipForward, RotateCcw, Pause } from "lucide-react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { RoughNotation } from "react-rough-notation";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────
type ZoneType = "incoming" | "event-loop" | "call-stack" | "io-waiting" | "completed";
type IoOp = { reqId: string; label: string; progress: number };
type Highlight = { term: string; type: "underline" | "circle" | "box" | "highlight"; color: string };

type StepData = {
  incoming: string[];
  executing: string | null;
  ioOps: IoOp[];
  completed: string[];
  activeEdges: string[];
  log: string;
  description: string;
  highlights: Highlight[];
};

// ── Constants ──────────────────────────────────────────────────────
const REQ_LABELS: Record<string, string> = {
  R1: "/users", R2: "/items", R3: "/orders", R4: "/health", R5: "/stats",
};

const REQ_COLORS: Record<string, string> = {
  R1: "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300",
  R2: "bg-orange-500/15 border-orange-500/30 text-orange-700 dark:text-orange-300",
  R3: "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300",
  R4: "bg-purple-500/15 border-purple-500/30 text-purple-700 dark:text-purple-300",
  R5: "bg-cyan-500/15 border-cyan-500/30 text-cyan-700 dark:text-cyan-300",
};

const ZONE_STYLES: Record<ZoneType, {
  activeBorder: string; activeGlow: string;
  activeBar: string; dimBar: string;
  activeLabel: string;
}> = {
  incoming: {
    activeBorder: "border-amber-500/40",
    activeGlow: "shadow-[0_0_20px_rgba(245,158,11,0.08)]",
    activeBar: "bg-amber-500", dimBar: "bg-amber-500/15",
    activeLabel: "text-amber-600 dark:text-amber-400",
  },
  "event-loop": {
    activeBorder: "border-lime-500/40",
    activeGlow: "shadow-[0_0_20px_rgba(132,204,22,0.08)]",
    activeBar: "bg-lime-500", dimBar: "bg-lime-500/15",
    activeLabel: "text-lime-600 dark:text-lime-400",
  },
  "call-stack": {
    activeBorder: "border-lime-500/40",
    activeGlow: "shadow-[0_0_20px_rgba(132,204,22,0.08)]",
    activeBar: "bg-lime-500", dimBar: "bg-lime-500/15",
    activeLabel: "text-lime-600 dark:text-lime-400",
  },
  "io-waiting": {
    activeBorder: "border-blue-500/40",
    activeGlow: "shadow-[0_0_20px_rgba(59,130,246,0.08)]",
    activeBar: "bg-blue-500", dimBar: "bg-blue-500/15",
    activeLabel: "text-blue-600 dark:text-blue-400",
  },
  completed: {
    activeBorder: "border-emerald-500/40",
    activeGlow: "shadow-[0_0_20px_rgba(52,211,153,0.08)]",
    activeBar: "bg-emerald-500", dimBar: "bg-emerald-500/15",
    activeLabel: "text-emerald-600 dark:text-emerald-400",
  },
};

const ZONE_LABELS: Record<ZoneType, string> = {
  incoming: "Incoming",
  "event-loop": "Event Loop",
  "call-stack": "Call Stack",
  "io-waiting": "I/O Waiting",
  completed: "Completed",
};

// ── 20-Step Scenario ───────────────────────────────────────────────
const STEPS: StepData[] = [
  {
    incoming: ["R1", "R2", "R3", "R4", "R5"], executing: null, ioOps: [], completed: [],
    activeEdges: [],
    log: "5 requests arrive at the server",
    description: "5 requests hit the server at once. Threads? No. Watch one thread handle all of them.",
    highlights: [{ term: "one thread", type: "underline", color: "rgb(132 204 22)" }],
  },
  {
    incoming: ["R2", "R3", "R4", "R5"], executing: "get_users()", ioOps: [], completed: [],
    activeEdges: ["incoming-to-loop", "loop-to-stack"],
    log: "Event loop picks R1 → get_users()",
    description: "Event loop grabs the first request from the queue.",
    highlights: [],
  },
  {
    incoming: ["R2", "R3", "R4", "R5"], executing: "await db.fetch()", ioOps: [], completed: [],
    activeEdges: [],
    log: "get_users() calls await db.fetch()",
    description: "R1 needs the database. It calls await...",
    highlights: [{ term: "await", type: "circle", color: "rgb(132 204 22)" }],
  },
  {
    incoming: ["R2", "R3", "R4", "R5"], executing: null,
    ioOps: [{ reqId: "R1", label: "db.fetch_users()", progress: 20 }], completed: [],
    activeEdges: ["stack-to-io"],
    log: "await suspends R1 → moved to I/O",
    description: "await suspends R1. The loop is now FREE to do other work.",
    highlights: [
      { term: "suspends", type: "underline", color: "rgb(59 130 246)" },
      { term: "FREE", type: "highlight", color: "rgba(132, 204, 22, 0.2)" },
    ],
  },
  {
    incoming: ["R3", "R4", "R5"], executing: "get_items()",
    ioOps: [{ reqId: "R1", label: "db.fetch_users()", progress: 35 }], completed: [],
    activeEdges: ["incoming-to-loop", "loop-to-stack"],
    log: "Event loop picks R2 → get_items()",
    description: "While R1 waits, the loop starts R2 immediately.",
    highlights: [],
  },
  {
    incoming: ["R3", "R4", "R5"], executing: "await httpx.get()",
    ioOps: [{ reqId: "R1", label: "db.fetch_users()", progress: 50 }], completed: [],
    activeEdges: [],
    log: "get_items() calls await httpx.get()",
    description: "R2 needs an external API. Another await.",
    highlights: [{ term: "await", type: "circle", color: "rgb(132 204 22)" }],
  },
  {
    incoming: ["R3", "R4", "R5"], executing: null,
    ioOps: [
      { reqId: "R1", label: "db.fetch_users()", progress: 60 },
      { reqId: "R2", label: "httpx.get(api_url)", progress: 10 },
    ], completed: [],
    activeEdges: ["stack-to-io"],
    log: "R2 suspended → 2 requests in I/O",
    description: "Two requests waiting for I/O. Zero threads blocked.",
    highlights: [{ term: "Zero threads", type: "underline", color: "rgb(132 204 22)" }],
  },
  {
    incoming: ["R4", "R5"], executing: "create_order()",
    ioOps: [
      { reqId: "R1", label: "db.fetch_users()", progress: 70 },
      { reqId: "R2", label: "httpx.get(api_url)", progress: 25 },
    ], completed: [],
    activeEdges: ["incoming-to-loop", "loop-to-stack"],
    log: "Event loop picks R3 → create_order()",
    description: "The loop never stops. R3 starts immediately.",
    highlights: [],
  },
  {
    incoming: ["R4", "R5"], executing: "await db.insert()",
    ioOps: [
      { reqId: "R1", label: "db.fetch_users()", progress: 80 },
      { reqId: "R2", label: "httpx.get(api_url)", progress: 35 },
    ], completed: [],
    activeEdges: [],
    log: "create_order() calls await db.insert()",
    description: "Another database call, another await.",
    highlights: [],
  },
  {
    incoming: ["R4", "R5"], executing: null,
    ioOps: [
      { reqId: "R1", label: "db.fetch_users()", progress: 90 },
      { reqId: "R2", label: "httpx.get(api_url)", progress: 45 },
      { reqId: "R3", label: "db.insert(order)", progress: 15 },
    ], completed: [],
    activeEdges: ["stack-to-io"],
    log: "R3 suspended → 3 in I/O!",
    description: "THREE requests in I/O — still just ONE thread!",
    highlights: [
      { term: "THREE", type: "circle", color: "rgb(59 130 246)" },
      { term: "ONE thread", type: "highlight", color: "rgba(132, 204, 22, 0.2)" },
    ],
  },
  {
    incoming: ["R5"], executing: "health_check()",
    ioOps: [
      { reqId: "R1", label: "db.fetch_users()", progress: 95 },
      { reqId: "R2", label: "httpx.get(api_url)", progress: 55 },
      { reqId: "R3", label: "db.insert(order)", progress: 30 },
    ], completed: [],
    activeEdges: ["incoming-to-loop", "loop-to-stack"],
    log: "Event loop picks R4 → health_check()",
    description: "R4 is a health check. No I/O needed.",
    highlights: [{ term: "No I/O", type: "underline", color: "rgb(234 179 8)" }],
  },
  {
    incoming: ["R5"], executing: null,
    ioOps: [
      { reqId: "R1", label: "db.fetch_users()", progress: 100 },
      { reqId: "R2", label: "httpx.get(api_url)", progress: 60 },
      { reqId: "R3", label: "db.insert(order)", progress: 40 },
    ], completed: ["R4"],
    activeEdges: ["stack-to-completed"],
    log: "✓ R4 returns instantly!",
    description: "No await = instant response! The loop didn't even pause.",
    highlights: [{ term: "instant", type: "highlight", color: "rgba(52, 211, 153, 0.2)" }],
  },
  {
    incoming: ["R5"], executing: "get_users() → return",
    ioOps: [
      { reqId: "R2", label: "httpx.get(api_url)", progress: 70 },
      { reqId: "R3", label: "db.insert(order)", progress: 55 },
    ], completed: ["R4"],
    activeEdges: ["io-to-loop", "loop-to-stack"],
    log: "R1 I/O done → resumes get_users()",
    description: "Database responded! R1 picks up right where it left off.",
    highlights: [],
  },
  {
    incoming: ["R5"], executing: null,
    ioOps: [
      { reqId: "R2", label: "httpx.get(api_url)", progress: 78 },
      { reqId: "R3", label: "db.insert(order)", progress: 65 },
    ], completed: ["R4", "R1"],
    activeEdges: ["stack-to-completed"],
    log: "✓ R1 completes — response sent",
    description: "Response sent. Two down, three to go.",
    highlights: [],
  },
  {
    incoming: [], executing: "get_stats()",
    ioOps: [
      { reqId: "R2", label: "httpx.get(api_url)", progress: 85 },
      { reqId: "R3", label: "db.insert(order)", progress: 75 },
    ], completed: ["R4", "R1"],
    activeEdges: ["incoming-to-loop", "loop-to-stack"],
    log: "Event loop picks R5 → get_stats()",
    description: "Last one in the queue. Redis cache lookup.",
    highlights: [],
  },
  {
    incoming: [], executing: "await redis.get()",
    ioOps: [
      { reqId: "R2", label: "httpx.get(api_url)", progress: 90 },
      { reqId: "R3", label: "db.insert(order)", progress: 85 },
    ], completed: ["R4", "R1"],
    activeEdges: [],
    log: "get_stats() calls await redis.get()",
    description: "Even fast operations like Redis use await.",
    highlights: [{ term: "await", type: "circle", color: "rgb(132 204 22)" }],
  },
  {
    incoming: [], executing: "create_order() → return",
    ioOps: [
      { reqId: "R2", label: "httpx.get(api_url)", progress: 95 },
      { reqId: "R5", label: "redis.get(stats)", progress: 60 },
    ], completed: ["R4", "R1"],
    activeEdges: ["stack-to-io", "io-to-loop", "loop-to-stack"],
    log: "R5 to I/O. R3 done → resumes create_order()",
    description: "R3's insert finished. It resumes immediately.",
    highlights: [],
  },
  {
    incoming: [], executing: "get_stats() → return",
    ioOps: [{ reqId: "R2", label: "httpx.get(api_url)", progress: 98 }],
    completed: ["R4", "R1", "R3"],
    activeEdges: ["stack-to-completed", "io-to-loop", "loop-to-stack"],
    log: "✓ R3 completes. R5 I/O done → resumes",
    description: "R5's Redis was fast — back already.",
    highlights: [],
  },
  {
    incoming: [], executing: "get_items() → return",
    ioOps: [], completed: ["R4", "R1", "R3", "R5"],
    activeEdges: ["stack-to-completed", "io-to-loop", "loop-to-stack"],
    log: "✓ R5 completes. R2 finally done → resumes",
    description: "The slowest request (external API) finishes last.",
    highlights: [],
  },
  {
    incoming: [], executing: null, ioOps: [], completed: ["R4", "R1", "R3", "R5", "R2"],
    activeEdges: [],
    log: "✓ All 5 requests completed!",
    description: "5 requests, 1 thread, 0 idle time. That's the event loop.",
    highlights: [
      { term: "5 requests", type: "circle", color: "rgb(52 211 153)" },
      { term: "1 thread", type: "underline", color: "rgb(132 204 22)" },
      { term: "0 idle time", type: "highlight", color: "rgba(52, 211, 153, 0.2)" },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────
function getActiveZones(activeEdges: string[]): Set<ZoneType> {
  const zones = new Set<ZoneType>();
  for (const edge of activeEdges) {
    switch (edge) {
      case "incoming-to-loop": zones.add("incoming"); zones.add("event-loop"); break;
      case "loop-to-stack": zones.add("event-loop"); zones.add("call-stack"); break;
      case "stack-to-io": zones.add("call-stack"); zones.add("io-waiting"); break;
      case "io-to-loop": zones.add("io-waiting"); zones.add("event-loop"); break;
      case "stack-to-completed": zones.add("call-stack"); zones.add("completed"); break;
    }
  }
  return zones;
}

// ── Subcomponents ──────────────────────────────────────────────────
function ZoneCard({ zone, active, children }: {
  zone: ZoneType; active: boolean; children: React.ReactNode;
}) {
  const s = ZONE_STYLES[zone];
  return (
    <div className={cn(
      "rounded-xl overflow-hidden border transition-all duration-500",
      active ? cn(s.activeBorder, s.activeGlow) : "border-border/40",
    )}>
      <div className={cn("h-[2px] transition-all duration-500", active ? s.activeBar : s.dimBar)} />
      <div className="p-2.5">
        <p className={cn(
          "text-[10px] font-bold uppercase tracking-[0.1em] mb-1.5 transition-colors duration-500",
          active ? s.activeLabel : "text-muted-foreground/35",
        )}>
          {ZONE_LABELS[zone]}
        </p>
        {children}
      </div>
    </div>
  );
}

function FlowArrow({ active, color }: { active: boolean; color: string }) {
  return (
    <div className="hidden md:flex items-center justify-center w-7 shrink-0 self-center">
      <motion.div
        animate={active ? { x: [0, 2, 0] } : { x: 0 }}
        transition={active ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
      >
        <svg viewBox="0 0 20 16" className="w-5 h-4" fill="none">
          <path
            d="M2 8h14M11 3l5 5-5 5"
            stroke={active ? color : "var(--color-border)"}
            strokeWidth={active ? 2 : 1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: active ? 1 : 0.25, transition: "all 0.5s" }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

function EventLoopRing({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center min-h-[56px]">
      <div className="relative size-14">
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full border-[2.5px] border-dashed transition-colors duration-500",
            active ? "border-lime-500/50" : "border-muted-foreground/10",
          )}
          animate={active ? { rotate: 360 } : {}}
          transition={active ? { duration: 2, repeat: Infinity, ease: "linear" } : { duration: 0 }}
        />
        <div className={cn(
          "absolute inset-2.5 rounded-full flex items-center justify-center transition-colors duration-500",
          active ? "bg-lime-500/10" : "bg-muted/30",
        )}>
          <motion.div
            className={cn(
              "size-2.5 rounded-full transition-colors duration-500",
              active ? "bg-lime-500" : "bg-muted-foreground/20",
            )}
            animate={active ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] } : { scale: 1 }}
            transition={active ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}

function RequestBadge({ reqId, done }: { reqId: string; done?: boolean }) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1 rounded-md px-1.5 py-[3px] text-[10px] font-mono border leading-none",
      done
        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
        : REQ_COLORS[reqId],
    )}>
      {done && <span className="text-[9px]">✓</span>}
      <span className="font-semibold">{reqId}</span>
    </div>
  );
}

function AnnotatedDescription({ description, highlights, stepKey }: {
  description: string; highlights: Highlight[]; stepKey: number;
}) {
  if (highlights.length === 0) return <span>{description}</span>;

  const parts: { text: string; highlight?: Highlight }[] = [];
  let remaining = description;
  const sorted = [...highlights].sort((a, b) => remaining.indexOf(a.term) - remaining.indexOf(b.term));

  for (const hl of sorted) {
    const idx = remaining.indexOf(hl.term);
    if (idx === -1) continue;
    if (idx > 0) parts.push({ text: remaining.slice(0, idx) });
    parts.push({ text: hl.term, highlight: hl });
    remaining = remaining.slice(idx + hl.term.length);
  }
  if (remaining) parts.push({ text: remaining });

  return (
    <span key={stepKey}>
      {parts.map((part, i) =>
        part.highlight ? (
          <RoughNotation
            key={`${stepKey}-${i}`}
            type={part.highlight.type}
            show={true}
            color={part.highlight.color}
            strokeWidth={2}
            padding={2}
            animationDuration={600}
          >
            {part.text}
          </RoughNotation>
        ) : (
          <span key={`${stepKey}-${i}`}>{part.text}</span>
        ),
      )}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────
function EventLoopAnimationInner() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [incomingRef] = useAutoAnimate({ duration: 250 });
  const [ioRef] = useAutoAnimate({ duration: 250 });
  const [completedRef] = useAutoAnimate({ duration: 250 });
  const [logRef] = useAutoAnimate({ duration: 250 });

  const cleanup = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const goToStep = useCallback((s: number) => {
    cleanup();
    setCurrentStep(s);
    if (s >= STEPS.length - 1) setIsPlaying(false);
  }, [cleanup]);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = prev + 1;
      if (next >= STEPS.length) { setIsPlaying(false); return prev; }
      return next;
    });
  }, []);

  useEffect(() => {
    if (isPlaying && currentStep < STEPS.length - 1) {
      timerRef.current = setTimeout(nextStep, 2200);
    }
    return cleanup;
  }, [isPlaying, currentStep, nextStep, cleanup]);

  const handlePlay = () => {
    if (currentStep >= STEPS.length - 1 || currentStep === -1) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => { cleanup(); setCurrentStep(-1); setIsPlaying(false); };

  const step = currentStep >= 0 ? STEPS[currentStep] : null;
  const activeZones = useMemo(() => step ? getActiveZones(step.activeEdges) : new Set<ZoneType>(), [step]);
  const isLoopActive = step ? (step.activeEdges.length > 0 || step.executing !== null) : false;

  const eventLog = useMemo(() => {
    if (currentStep < 0) return [];
    return STEPS.slice(0, currentStep + 1).map((s, i) => ({ step: i, log: s.log }));
  }, [currentStep]);

  const edgeActive = (id: string) => step?.activeEdges.includes(id) ?? false;

  // ── Zone content renderers ──────────────────────────────────────
  const incomingContent = (
    <div ref={incomingRef} className="flex flex-wrap gap-1 min-h-[28px]">
      {step && step.incoming.length > 0
        ? step.incoming.map((r) => <RequestBadge key={r} reqId={r} />)
        : <p className="text-[10px] text-muted-foreground/40 italic">empty</p>}
    </div>
  );

  const callStackContent = (
    <div className="min-h-[28px]">
      <AnimatePresence mode="wait">
        {step?.executing ? (
          <motion.div
            key={step.executing}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="rounded-md bg-lime-500/10 border border-lime-500/25 px-2 py-1.5"
          >
            <span className="text-[10px] font-mono text-lime-600 dark:text-lime-400">{step.executing}</span>
          </motion.div>
        ) : (
          <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            className="text-[10px] text-muted-foreground italic">(idle)</motion.p>
        )}
      </AnimatePresence>
    </div>
  );

  const ioContent = (
    <div ref={ioRef} className="space-y-2 min-h-[28px]">
      {step && step.ioOps.length > 0
        ? step.ioOps.map((op) => (
          <div key={op.reqId}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px] font-mono text-blue-600 dark:text-blue-400">
                {op.reqId} {op.label}
              </span>
              <span className="text-[8px] text-blue-500/50 tabular-nums">{op.progress}%</span>
            </div>
            <div className="h-1 rounded-full bg-blue-500/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${op.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        ))
        : <p className="text-[10px] text-muted-foreground/40 italic">no active I/O</p>}
    </div>
  );

  const completedContent = (
    <div ref={completedRef} className="flex flex-wrap gap-1 min-h-[28px]">
      {step && step.completed.length > 0
        ? step.completed.map((r) => <RequestBadge key={r} reqId={r} done />)
        : <p className="text-[10px] text-muted-foreground/40 italic">none yet</p>}
    </div>
  );

  return (
    <div className="rounded-xl border bg-card p-4 sm:p-6">
      {/* Controls */}
      <div className="flex items-center gap-2 mb-3">
        <button onClick={handlePlay}
          className="inline-flex items-center gap-1.5 rounded-md bg-lime-500 text-lime-950 px-3 py-1.5 text-xs font-medium hover:bg-lime-400 transition-colors cursor-pointer">
          {isPlaying ? (<><Pause className="size-3" /> Pause</>)
            : currentStep === -1 || currentStep >= STEPS.length - 1
              ? (<><Play className="size-3" /> Run Example</>)
              : (<><Play className="size-3" /> Resume</>)}
        </button>
        <button onClick={nextStep} disabled={currentStep >= STEPS.length - 1}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors disabled:opacity-40 cursor-pointer">
          <SkipForward className="size-3" /> Step
        </button>
        <button onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors cursor-pointer">
          <RotateCcw className="size-3" /> Reset
        </button>
        {currentStep >= 0 && (
          <span className="ml-auto text-xs text-muted-foreground font-mono">
            Step {currentStep + 1}/{STEPS.length}
          </span>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex gap-0.5 mb-4">
        {STEPS.map((_, i) => (
          <button key={i} onClick={() => goToStep(i)}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300 cursor-pointer",
              i < currentStep ? "bg-lime-500" : i === currentStep ? "bg-lime-400" : "bg-muted",
            )} />
        ))}
      </div>

      {currentStep === -1 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p className="text-sm mb-1">Click &quot;Run Example&quot; to see how the event loop handles five concurrent requests with a single thread.</p>
          <p className="text-xs">You can also step through manually or click any progress dot.</p>
        </div>
      ) : (
        <>
          {/* Request legend */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono text-muted-foreground/50 mb-3">
            {Object.entries(REQ_LABELS).map(([id, label]) => (
              <span key={id}>
                <span className="font-semibold text-foreground/60">{id}</span> {label}
              </span>
            ))}
          </div>

          {/* ═══ DESKTOP LAYOUT ═══ */}
          <div className="hidden md:block mb-4">
            {/* Top row: 4 zones + 3 arrows */}
            <div className="flex items-stretch gap-0">
              <div className="flex-1">
                <ZoneCard zone="incoming" active={activeZones.has("incoming")}>
                  {incomingContent}
                </ZoneCard>
              </div>
              <FlowArrow active={edgeActive("incoming-to-loop")} color="rgb(245 158 11)" />
              <div className="flex-1">
                <ZoneCard zone="event-loop" active={activeZones.has("event-loop")}>
                  <EventLoopRing active={isLoopActive} />
                </ZoneCard>
              </div>
              <FlowArrow active={edgeActive("loop-to-stack")} color="rgb(132 204 22)" />
              <div className="flex-1">
                <ZoneCard zone="call-stack" active={activeZones.has("call-stack")}>
                  {callStackContent}
                </ZoneCard>
              </div>
              <FlowArrow active={edgeActive("stack-to-completed")} color="rgb(52 211 153)" />
              <div className="flex-1">
                <ZoneCard zone="completed" active={activeZones.has("completed")}>
                  {completedContent}
                </ZoneCard>
              </div>
            </div>

            {/* Feedback flow indicators */}
            <div className="flex justify-center items-center gap-10 py-2">
              <div className={cn(
                "flex items-center gap-1.5 text-[10px] font-mono transition-all duration-500",
                edgeActive("io-to-loop") ? "text-lime-500" : "text-muted-foreground/20",
              )}>
                <svg viewBox="0 0 16 16" className="size-3" fill="none">
                  <path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                resumes
              </div>
              <div className={cn(
                "flex items-center gap-1.5 text-[10px] font-mono transition-all duration-500",
                edgeActive("stack-to-io") ? "text-blue-500" : "text-muted-foreground/20",
              )}>
                <svg viewBox="0 0 16 16" className="size-3" fill="none">
                  <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                awaits
              </div>
            </div>

            {/* I/O zone centered */}
            <div className="max-w-md mx-auto">
              <ZoneCard zone="io-waiting" active={activeZones.has("io-waiting")}>
                {ioContent}
              </ZoneCard>
            </div>
          </div>

          {/* ═══ MOBILE LAYOUT ═══ */}
          <div className="md:hidden space-y-2 mb-4">
            <ZoneCard zone="incoming" active={activeZones.has("incoming")}>
              {incomingContent}
            </ZoneCard>
            <ZoneCard zone="event-loop" active={activeZones.has("event-loop")}>
              <EventLoopRing active={isLoopActive} />
            </ZoneCard>
            <ZoneCard zone="call-stack" active={activeZones.has("call-stack")}>
              {callStackContent}
            </ZoneCard>
            <ZoneCard zone="io-waiting" active={activeZones.has("io-waiting")}>
              {ioContent}
            </ZoneCard>
            <ZoneCard zone="completed" active={activeZones.has("completed")}>
              {completedContent}
            </ZoneCard>
          </div>

          {/* Description panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-lg border bg-muted/50 p-3 mb-3"
            >
              <p className="text-xs font-mono text-lime-600 dark:text-lime-400 mb-1">
                {step!.log}
              </p>
              <p className="text-xs text-muted-foreground">
                <AnnotatedDescription description={step!.description} highlights={step!.highlights} stepKey={currentStep} />
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Accumulated event log */}
          <div className="rounded-lg border bg-muted/30 p-3 max-h-[120px] overflow-y-auto">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Event Log
            </p>
            <div ref={logRef} className="space-y-0.5">
              {eventLog.map((entry) => (
                <p key={entry.step}
                  className={cn(
                    "text-[10px] font-mono",
                    entry.step === currentStep ? "text-lime-600 dark:text-lime-400" : "text-muted-foreground/60",
                  )}>
                  [{String(entry.step).padStart(2, "0")}] {entry.log}
                </p>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Export ──────────────────────────────────────────────────────────
export function EventLoopAnimation() {
  return <EventLoopAnimationInner />;
}
