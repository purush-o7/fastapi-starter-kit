"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "uvicorn" | "gunicorn";

interface Req {
  id: number;
  phase: "incoming" | "routing" | "processing" | "done";
  worker: number;
  color: string;
}

const PALETTE = [
  "#34d399", "#22d3ee", "#a78bfa", "#fbbf24", "#f472b6",
  "#2dd4bf", "#818cf8", "#fb923c", "#a3e635", "#e879f9",
];

/* Concentric ring event loop — feels like a radar */
function ProcessorRing({ size = 48, active = false, load = 0 }: {
  size?: number;
  active?: boolean;
  load?: number;
}) {
  const r1 = size / 2 - 4;
  const r2 = size / 2 - 10;
  const c1 = 2 * Math.PI * r1;
  const c2 = 2 * Math.PI * r2;
  const cx = size / 2;
  const cy = size / 2;
  const color = active ? "#84cc16" : "#6b7280";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        {/* Outer track */}
        <circle cx={cx} cy={cy} r={r1} fill="none" stroke="currentColor" strokeOpacity={0.06} strokeWidth={1.5} />
        {/* Inner track */}
        <circle cx={cx} cy={cy} r={r2} fill="none" stroke="currentColor" strokeOpacity={0.04} strokeWidth={1} />
      </svg>

      {/* Outer spinning arc */}
      <motion.svg width={size} height={size} className="absolute inset-0"
        animate={active ? { rotate: 360 } : {}} transition={active ? { duration: 2.5, repeat: Infinity, ease: "linear" } : {}}
      >
        <circle cx={cx} cy={cy} r={r1} fill="none" stroke={color} strokeOpacity={active ? 0.5 : 0.1}
          strokeWidth={1.5} strokeLinecap="round" strokeDasharray={`${c1 * 0.2} ${c1 * 0.8}`} />
      </motion.svg>

      {/* Inner counter-spinning arc */}
      <motion.svg width={size} height={size} className="absolute inset-0"
        animate={active ? { rotate: -360 } : {}} transition={active ? { duration: 4, repeat: Infinity, ease: "linear" } : {}}
      >
        <circle cx={cx} cy={cy} r={r2} fill="none" stroke={color} strokeOpacity={active ? 0.3 : 0.06}
          strokeWidth={1} strokeLinecap="round" strokeDasharray={`${c2 * 0.15} ${c2 * 0.85}`} />
      </motion.svg>

      {/* Active ping ring */}
      <AnimatePresence>
        {active && load > 0 && (
          <motion.svg width={size} height={size} className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.circle
              cx={cx} cy={cy} r={r1 - 2}
              fill="none" stroke="#84cc16" strokeWidth={1}
              initial={{ strokeOpacity: 0.3, r: r2 }}
              animate={{ strokeOpacity: [0.3, 0], r: r1 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            />
          </motion.svg>
        )}
      </AnimatePresence>

      {/* Center core */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="rounded-full"
          style={{ width: 5, height: 5, backgroundColor: color }}
          animate={active ? { opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] } : { opacity: 0.1, scale: 1 }}
          transition={active ? { duration: 2, repeat: Infinity } : {}}
        />
      </div>
    </div>
  );
}

/* Worker node with processor ring */
function WorkerNode({ index, requests, total, isActive, compact }: {
  index: number;
  requests: Req[];
  total: number;
  isActive: boolean;
  compact: boolean;
}) {
  const mine = requests.filter((r) => r.worker === index && r.phase === "processing");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className={cn(
        "rounded-2xl border transition-all duration-500 flex flex-col items-center relative overflow-hidden",
        compact ? "p-3 gap-1.5" : "p-4 gap-2",
        isActive
          ? "border-lime-500/30 bg-gradient-to-b from-lime-500/8 to-lime-500/3"
          : "border-border/20 bg-muted/5"
      )}
    >
      {/* Subtle inner glow when active */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-b from-lime-400/5 to-transparent pointer-events-none" />
      )}

      <div className="flex items-center gap-1.5 relative">
        <motion.div
          className="size-1.5 rounded-full"
          animate={{
            backgroundColor: isActive ? "#84cc16" : "#6b7280",
            boxShadow: isActive ? "0 0 6px #84cc1660" : "none",
          }}
          transition={{ duration: 0.3 }}
        />
        <span className="text-[9px] font-mono text-muted-foreground/60">
          {total > 1 ? `W${index + 1}` : "Process"}
        </span>
      </div>

      <ProcessorRing
        size={compact ? 36 : 48}
        active={isActive}
        load={mine.length}
      />

      {/* Request orbs */}
      <div className="flex gap-1 min-h-[12px] relative">
        <AnimatePresence>
          {mine.map((r) => (
            <motion.div
              key={r.id}
              initial={{ scale: 0, y: -8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
              className="size-2.5 rounded-full relative"
              style={{ backgroundColor: r.color }}
            >
              <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: r.color, opacity: 0.2 }} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <span className={cn(
        "text-[8px] font-mono transition-colors duration-300 tabular-nums relative",
        mine.length > 0 ? "text-lime-400/60" : "text-muted-foreground/25"
      )}>
        {mine.length} conn
      </span>
    </motion.div>
  );
}

export function WorkerArchitectureViz() {
  const [mode, setMode] = useState<Mode>("uvicorn");
  const [workers, setWorkers] = useState(4);
  const [requests, setRequests] = useState<Req[]>([]);
  const [nextId, setNextId] = useState(1);
  const [processed, setProcessed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rrRef = useRef(0);

  const wCount = mode === "uvicorn" ? 1 : workers;

  const stop = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop(); setRequests([]); setNextId(1); setProcessed(0); rrRef.current = 0;
  }, [stop]);

  const start = useCallback(() => {
    if (running) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setNextId((prev) => {
        const id = prev;
        const w = rrRef.current % (mode === "uvicorn" ? 1 : workers);
        rrRef.current += 1;
        const color = PALETTE[(id - 1) % PALETTE.length];
        const req: Req = { id, phase: "incoming", worker: w, color };
        setRequests((r) => [...r.slice(-14), req]);
        setTimeout(() => setRequests((r) => r.map((x) => x.id === id ? { ...x, phase: "routing" } : x)), 250);
        setTimeout(() => setRequests((r) => r.map((x) => x.id === id ? { ...x, phase: "processing" } : x)), 600);
        const pt = 1400 + Math.random() * 1600;
        setTimeout(() => { setRequests((r) => r.map((x) => x.id === id ? { ...x, phase: "done" } : x)); setProcessed((t) => t + 1); }, pt);
        setTimeout(() => setRequests((r) => r.filter((x) => x.id !== id)), pt + 500);
        return prev + 1;
      });
    }, 550);
  }, [running, mode, workers]);

  useEffect(() => { reset(); }, [mode, workers, reset]);
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const active = requests.filter((r) => r.phase === "processing");

  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/20">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="size-2 rounded-full"
            animate={{
              backgroundColor: running ? "#84cc16" : "#6b7280",
              boxShadow: running ? "0 0 8px #84cc1650" : "none",
            }}
          />
          <span className="text-xs font-semibold tracking-wide">Process Architecture</span>
        </div>
        <button onClick={reset} className="text-muted-foreground/50 hover:text-foreground transition-colors p-1 cursor-pointer">
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      {/* Mode selector bar */}
      <div className="px-5 py-2.5 border-b border-border/30 bg-muted/5 flex items-center gap-3">
        <div className="flex gap-0.5 bg-muted/30 rounded-lg p-0.5 flex-1 sm:flex-initial">
          {(["uvicorn", "gunicorn"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer relative",
                mode === m ? "text-foreground" : "text-muted-foreground/40 hover:text-muted-foreground/70"
              )}
            >
              {mode === m && (
                <motion.div
                  layoutId="arch-tab"
                  className={cn(
                    "absolute inset-0 rounded-md shadow-sm",
                    m === "uvicorn" ? "bg-lime-500/10 border border-lime-500/25" : "bg-blue-500/10 border border-blue-500/25"
                  )}
                  transition={{ type: "spring", stiffness: 500, damping: 32 }}
                />
              )}
              <span className="relative z-10">
                {m === "uvicorn" ? "Uvicorn Solo" : "Gunicorn + Workers"}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {mode === "gunicorn" && (
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }}
              className="flex items-center gap-2 overflow-hidden ml-auto"
            >
              <span className="text-[10px] text-muted-foreground/50 font-mono shrink-0">-w</span>
              <input type="range" min={2} max={4} value={workers} onChange={(e) => setWorkers(Number(e.target.value))}
                className="w-16 accent-blue-500 cursor-pointer" />
              <span className="text-xs font-mono font-bold text-blue-400 w-3 tabular-nums">{workers}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main visualization */}
      <div className="px-5 py-8 relative">
        {/* Cross-hatch background */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `
            linear-gradient(0deg, currentColor 1px, transparent 1px),
            linear-gradient(90deg, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }} />

        <div className="relative">
          {/* Gunicorn master banner */}
          <AnimatePresence>
            {mode === "gunicorn" && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/8 via-blue-500/5 to-transparent px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <svg width="16" height="16" viewBox="0 0 16 16" className="text-blue-400">
                      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" />
                      <circle cx="8" cy="8" r="2" fill="currentColor" fillOpacity="0.6" />
                    </svg>
                    <span className="text-[11px] font-semibold text-blue-400/90">Gunicorn Master</span>
                  </div>
                  <div className="flex items-center gap-3 text-[9px] font-mono text-muted-foreground/40">
                    <span>PID 1</span>
                    <span>·</span>
                    <span>{workers} workers</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Horizontal flow layout */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Incoming stream */}
            <div className="flex flex-col items-center gap-1.5 shrink-0 w-8">
              <span className="text-[7px] font-mono text-muted-foreground/30 uppercase tracking-[0.25em]">In</span>
              <div className="relative h-[140px] sm:h-[160px] w-0.5 rounded-full bg-gradient-to-b from-border/40 via-border/20 to-border/5">
                <AnimatePresence>
                  {requests.filter((r) => r.phase === "incoming" || r.phase === "routing").map((r, i) => (
                    <motion.div
                      key={r.id}
                      className="absolute left-1/2 -translate-x-1/2"
                      initial={{ top: -4, opacity: 0, scale: 0 }}
                      animate={{
                        top: r.phase === "routing" ? "105%" : Math.min(i * 22, 130),
                        opacity: r.phase === "routing" ? 0 : 1,
                        scale: 1,
                      }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ type: "spring", stiffness: 180, damping: 18 }}
                    >
                      <div className="size-3 rounded-full" style={{ backgroundColor: r.color, boxShadow: `0 0 10px ${r.color}40` }} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Flow arrow */}
            <svg width="20" height="20" viewBox="0 0 20 20" className="text-muted-foreground/15 shrink-0 self-center">
              <path d="M2 10h14M12 6l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            {/* Workers */}
            <div className="flex-1 min-w-0">
              <div className={cn(
                "grid gap-2",
                wCount === 1 ? "grid-cols-1 max-w-[140px] mx-auto" :
                wCount === 2 ? "grid-cols-2 max-w-[280px] mx-auto" :
                wCount === 3 ? "grid-cols-3" : "grid-cols-4"
              )}>
                <AnimatePresence mode="popLayout">
                  {Array.from({ length: wCount }).map((_, i) => (
                    <WorkerNode
                      key={`${mode}-${i}`}
                      index={i}
                      requests={requests}
                      total={wCount}
                      isActive={running && active.some((r) => r.worker === i)}
                      compact={wCount > 2}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Flow arrow */}
            <svg width="20" height="20" viewBox="0 0 20 20" className="text-muted-foreground/15 shrink-0 self-center">
              <path d="M2 10h14M12 6l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            {/* Outgoing stream */}
            <div className="flex flex-col items-center gap-1.5 shrink-0 w-8">
              <span className="text-[7px] font-mono text-muted-foreground/30 uppercase tracking-[0.25em]">Out</span>
              <div className="relative h-[140px] sm:h-[160px] w-0.5 rounded-full bg-gradient-to-b from-border/5 via-border/20 to-border/40">
                <AnimatePresence>
                  {requests.filter((r) => r.phase === "done").map((r) => (
                    <motion.div
                      key={r.id}
                      className="absolute left-1/2 -translate-x-1/2"
                      initial={{ bottom: -4, opacity: 1, scale: 1 }}
                      animate={{ bottom: "105%", opacity: 0, scale: 0.3 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeIn" }}
                    >
                      <div className="size-3 rounded-full" style={{ backgroundColor: r.color, boxShadow: `0 0 6px ${r.color}20` }} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Command */}
          <div className="mt-5 rounded-xl bg-muted/20 border border-border/15 px-4 py-2.5">
            <code className="text-[10px] font-mono flex items-center gap-1">
              <span className="text-muted-foreground/30 select-none">$</span>
              {mode === "uvicorn" ? (
                <>
                  <span className="text-lime-400/80 font-semibold">uvicorn</span>
                  <span className="text-muted-foreground/50">main:app --host 0.0.0.0 --port 8000</span>
                </>
              ) : (
                <>
                  <span className="text-blue-400/80 font-semibold">gunicorn</span>
                  <span className="text-muted-foreground/50">main:app -k uvicorn.workers.UvicornWorker</span>
                  <span className="text-foreground/70 font-semibold">-w {workers}</span>
                </>
              )}
            </code>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t bg-muted/10 flex items-center justify-between gap-4">
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={running ? stop : start}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-semibold transition-all cursor-pointer border",
            running
              ? "bg-red-500/8 text-red-400 border-red-500/20 hover:bg-red-500/12"
              : mode === "uvicorn"
                ? "bg-gradient-to-b from-lime-500/12 to-lime-500/5 text-lime-400 border-lime-500/20 hover:border-lime-500/35"
                : "bg-gradient-to-b from-blue-500/12 to-blue-500/5 text-blue-400 border-blue-500/20 hover:border-blue-500/35"
          )}
        >
          {running ? (
            <><div className="size-2 rounded-sm bg-current" /> Stop</>
          ) : (
            <><svg width="8" height="10" viewBox="0 0 8 10"><path d="M0 0l8 5-8 5z" fill="currentColor" /></svg> Simulate</>
          )}
        </motion.button>

        <div className="flex items-center gap-3 sm:gap-5 text-[10px] font-mono text-muted-foreground/40">
          <div className="flex items-center gap-1">
            <span>Active</span>
            <motion.span
              key={active.length}
              initial={{ y: -4, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-foreground/70 font-bold tabular-nums"
            >{active.length}</motion.span>
          </div>
          <div className="flex items-center gap-1">
            <span>Done</span>
            <motion.span
              key={processed}
              initial={{ y: -4, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-foreground/70 font-bold tabular-nums"
            >{processed}</motion.span>
          </div>
          <div className="flex items-center gap-1">
            <span>Cores</span>
            <span className={cn("font-bold", mode === "uvicorn" ? "text-lime-400/60" : "text-blue-400/60")}>{wCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
