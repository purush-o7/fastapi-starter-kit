"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, Database, Bot, Cpu, Layers, Check, X, Power, PowerOff, Zap, ArrowRight, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

type MainPhase = "idle" | "startup" | "running" | "shutdown" | "stopped";

interface Service {
  id: string;
  name: string;
  icon: typeof Database;
  color: string;
  initLabel: string;
  closeLabel: string;
  layer: "client" | "cache";
}

interface Req {
  id: number;
  method: string;
  path: string;
  target: string;
  hitCache: boolean;
  annotation: string;
}

const SERVICES: Service[] = [
  { id: "redis", name: "Redis", icon: Database, color: "#ef4444", initLabel: "aioredis.from_url()", closeLabel: "redis.close()", layer: "client" },
  { id: "openai", name: "OpenAI", icon: Bot, color: "#10b981", initLabel: "AsyncOpenAI()", closeLabel: "openai.close()", layer: "client" },
  { id: "gemini", name: "Gemini", icon: Cpu, color: "#6366f1", initLabel: 'GenerativeModel("gemini-pro")', closeLabel: "del gemini", layer: "client" },
];

const CACHE_SERVICE: Service = {
  id: "cache", name: "Cache Layer", icon: Layers, color: "#f59e0b", initLabel: "warm_popular_endpoints()", closeLabel: "cache.flush()", layer: "cache",
};

const REQUESTS: Req[] = [
  { id: 1, method: "POST", path: "/chat", target: "openai", hitCache: false, annotation: "Cache miss → reuses the same OpenAI client" },
  { id: 2, method: "GET", path: "/items", target: "cache", hitCache: true, annotation: "Cache hit! Returns instantly — no external call" },
  { id: 3, method: "POST", path: "/chat", target: "openai", hitCache: false, annotation: "Same OpenAI client — 1000 requests, 1 connection" },
  { id: 4, method: "POST", path: "/generate", target: "gemini", hitCache: false, annotation: "Same Gemini model — loaded once at startup" },
  { id: 5, method: "GET", path: "/session", target: "redis", hitCache: false, annotation: "Same Redis pool — no per-request connections" },
  { id: 6, method: "GET", path: "/items", target: "cache", hitCache: true, annotation: "Cache hit again — warmed at startup, served instantly" },
];

export function LifespanViz() {
  const [mainPhase, setMainPhase] = useState<MainPhase>("idle");
  const [startupStep, setStartupStep] = useState(-1);
  const [shutdownStep, setShutdownStep] = useState(-1);
  const [activeReq, setActiveReq] = useState(-1);
  const [inited, setInited] = useState<Set<string>>(new Set());
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = []; }, []);
  const t = useCallback((fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); }, []);

  // All services in init order: redis, openai, gemini, then cache
  const ALL = [...SERVICES, CACHE_SERVICE];

  const run = useCallback(() => {
    clear();
    setMainPhase("idle"); setStartupStep(-1); setShutdownStep(-1);
    setActiveReq(-1); setInited(new Set()); setClosed(new Set());

    let ms = 400;
    t(() => setMainPhase("startup"), ms);

    // Startup: clients first, then cache
    ALL.forEach((svc, i) => {
      ms += 200;
      t(() => setStartupStep(i), ms);
      ms += 850;
      const id = svc.id;
      t(() => setInited((p) => new Set(p).add(id)), ms);
    });
    ms += 500;

    // Running
    t(() => { setMainPhase("running"); setStartupStep(-1); }, ms);
    ms += 500;
    REQUESTS.forEach((req) => {
      t(() => setActiveReq(req.id), ms);
      ms += 1300;
      t(() => setActiveReq(-1), ms);
      ms += 200;
    });
    ms += 500;

    // Shutdown: reverse
    t(() => setMainPhase("shutdown"), ms);
    ms += 300;
    for (let i = ALL.length - 1; i >= 0; i--) {
      t(() => setShutdownStep(i), ms);
      ms += 500;
      const id = ALL[i].id;
      t(() => setClosed((p) => new Set(p).add(id)), ms);
      ms += 200;
    }
    ms += 400;
    t(() => setMainPhase("stopped"), ms);
    t(() => run(), ms + 2500);
  }, [clear, t]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { run(); return clear; }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const curReq = REQUESTS.find((r) => r.id === activeReq);
  const phaseIdx = mainPhase === "startup" ? 0 : mainPhase === "running" ? 1 : mainPhase === "shutdown" ? 2 : -1;

  function svcState(svc: Service): "off" | "initializing" | "ready" | "targeted" | "closing" | "closed" {
    const svcIdx = ALL.findIndex((s) => s.id === svc.id);
    if (closed.has(svc.id)) return "closed";
    if (mainPhase === "shutdown" && shutdownStep === svcIdx) return "closing";
    if (curReq?.target === svc.id) return "targeted";
    if (inited.has(svc.id)) return "ready";
    if (mainPhase === "startup" && startupStep === svcIdx) return "initializing";
    return "off";
  }

  // Cache is special — it's targeted when hitCache=true, and also glows on miss as "checked"
  const cacheState = svcState(CACHE_SERVICE);
  const cacheChecked = curReq && !curReq.hitCache && curReq.target !== "cache";

  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/20">
        <div className="flex items-center gap-2.5">
          <motion.div className="size-2 rounded-full" animate={{
            backgroundColor: mainPhase === "startup" ? "#10b981" : mainPhase === "running" ? "#3b82f6" : mainPhase === "shutdown" ? "#ef4444" : "#6b7280",
          }} />
          <span className="text-sm font-semibold tracking-wide">Lifespan — Clients & Cache</span>
        </div>
        <button onClick={run} className="text-muted-foreground/50 hover:text-foreground transition-colors p-1 cursor-pointer">
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      {/* Phase stepper */}
      <div className="px-5 py-2.5 border-b border-border/20 bg-muted/5">
        <div className="flex items-center gap-1.5">
          {[
            { label: "Startup", sub: "before yield", color: "#10b981", icon: Power },
            { label: "Running", sub: "yield", color: "#3b82f6", icon: Zap },
            { label: "Shutdown", sub: "after yield", color: "#ef4444", icon: PowerOff },
          ].map((step, i) => {
            const active = phaseIdx === i;
            const done = phaseIdx > i || mainPhase === "stopped";
            const I = step.icon;
            return (
              <div key={step.label} className="flex items-center gap-1.5 flex-1">
                <div className={cn("flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-300 flex-1",
                  active ? "bg-muted/30" : "")}>
                  <div className="size-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: active ? `${step.color}20` : done ? `${step.color}10` : "transparent",
                      border: `1.5px solid ${active ? step.color : done ? `${step.color}40` : "rgba(128,128,128,0.12)"}` }}>
                    {done ? <Check className="size-2.5" style={{ color: step.color }} /> : <I className="size-2.5" style={{ color: active ? step.color : "rgba(128,128,128,0.25)" }} />}
                  </div>
                  <div>
                    <p className={cn("text-[11px] font-semibold", active ? "text-foreground" : done ? "text-muted-foreground/50" : "text-muted-foreground/25")}>{step.label}</p>
                    <p className="text-[8px] font-mono text-muted-foreground/20">{step.sub}</p>
                  </div>
                </div>
                {i < 2 && <ArrowRight className="size-3 text-muted-foreground/10 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-5 py-6 relative">
        <div className="absolute inset-0 opacity-[0.012]" style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "24px 24px",
        }} />

        <div className="relative space-y-4">
          {/* ===== CLIENTS ROW (horizontal) ===== */}
          <div>
            <p className="text-[9px] font-mono text-muted-foreground/25 uppercase tracking-widest mb-2.5">Clients · app.state</p>
            <div className="grid grid-cols-3 gap-2.5">
              {SERVICES.map((svc) => {
                const st = svcState(svc);
                const I = svc.icon;
                return (
                  <motion.div
                    key={svc.id}
                    layout
                    className={cn(
                      "rounded-xl border-2 p-3 flex flex-col items-center gap-2 text-center relative overflow-hidden transition-all duration-400",
                      st === "targeted" ? "border-blue-500/40" :
                      st === "initializing" ? "border-emerald-500/30" :
                      st === "closing" ? "border-red-500/30" :
                      st === "closed" ? "border-border/8 opacity-35" :
                      st === "ready" ? "border-border/20" : "border-border/8 opacity-25"
                    )}
                  >
                    {/* Glow */}
                    <motion.div className="absolute inset-0 pointer-events-none" animate={{
                      backgroundColor: st === "targeted" ? "rgba(59,130,246,0.06)" : st === "initializing" ? "rgba(16,185,129,0.05)" : st === "closing" ? "rgba(239,68,68,0.05)" : "transparent",
                    }} transition={{ duration: 0.3 }} />

                    {/* Icon + badge */}
                    <div className="relative">
                      <div className={cn("size-10 rounded-xl flex items-center justify-center transition-all duration-400",
                        st === "targeted" ? "bg-blue-500/10" : st === "initializing" ? "bg-emerald-500/10" : st === "closing" ? "bg-red-500/10" : st === "ready" ? "bg-muted/10" : "bg-muted/5"
                      )}>
                        <I className="size-5 transition-colors duration-400"
                          style={{ color: st === "closed" ? "rgba(128,128,128,0.12)" : st === "targeted" ? "#3b82f6" : st === "initializing" ? "#10b981" : st === "closing" ? "#ef4444" : st === "ready" ? svc.color : "rgba(128,128,128,0.15)" }} />
                      </div>
                      <AnimatePresence>
                        {st === "initializing" && (
                          <motion.div key="i" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 size-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                              className="size-2 border border-emerald-400 border-t-transparent rounded-full" />
                          </motion.div>
                        )}
                        {st === "ready" && (
                          <motion.div key="r" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}
                            className="absolute -top-1 -right-1 size-4 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${svc.color}25`, border: `1px solid ${svc.color}40` }}>
                            <Check className="size-2" style={{ color: svc.color }} />
                          </motion.div>
                        )}
                        {st === "targeted" && (
                          <motion.div key="t" initial={{ scale: 0 }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
                            className="absolute -top-1 -right-1 size-4 rounded-full bg-blue-500/30 border border-blue-500/50 flex items-center justify-center">
                            <Zap className="size-2 text-blue-400" />
                          </motion.div>
                        )}
                        {st === "closing" && (
                          <motion.div key="c" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 size-4 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                              className="size-2 border border-red-400 border-t-transparent rounded-full" />
                          </motion.div>
                        )}
                        {st === "closed" && (
                          <motion.div key="x" initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 size-4 rounded-full bg-muted/30 border border-border/20 flex items-center justify-center">
                            <X className="size-2 text-muted-foreground/25" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <p className={cn("text-xs font-semibold transition-colors duration-400",
                      st === "closed" ? "text-muted-foreground/15" : st === "off" ? "text-muted-foreground/25" : "text-foreground"
                    )}>{svc.name}</p>

                    <AnimatePresence mode="wait">
                      {st === "initializing" && <motion.p key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9px] font-mono text-emerald-400/60 leading-tight">Creating...</motion.p>}
                      {st === "ready" && <motion.p key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9px] font-mono leading-tight" style={{ color: `${svc.color}80` }}>app.state</motion.p>}
                      {st === "targeted" && <motion.p key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9px] font-semibold text-blue-400/80 leading-tight">Reusing ↑</motion.p>}
                      {st === "closing" && <motion.p key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[9px] font-mono text-red-400/60 leading-tight">Closing...</motion.p>}
                    </AnimatePresence>

                    {(st === "initializing" || st === "closing") && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
                        <motion.div className="h-full rounded-full"
                          style={{ backgroundColor: st === "initializing" ? "#10b981" : "#ef4444" }}
                          initial={{ width: "0%" }} animate={{ width: "100%" }}
                          transition={{ duration: 0.8, ease: "easeInOut" }} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Arrow down to cache */}
          <div className="flex justify-center">
            <ArrowDown className="size-4 text-muted-foreground/15" />
          </div>

          {/* ===== CACHE LAYER ===== */}
          <div>
            <p className="text-[9px] font-mono text-muted-foreground/25 uppercase tracking-widest mb-2.5">Cache Layer · app.state.cache</p>
            <motion.div
              layout
              className={cn(
                "rounded-xl border-2 px-4 py-3 flex items-center gap-4 relative overflow-hidden transition-all duration-400",
                cacheState === "targeted" ? "border-amber-500/40" :
                cacheState === "initializing" ? "border-emerald-500/30" :
                cacheState === "closing" ? "border-red-500/30" :
                cacheState === "closed" ? "border-border/8 opacity-35" :
                cacheChecked ? "border-amber-500/15" :
                cacheState === "ready" ? "border-border/20" : "border-border/8 opacity-25"
              )}
            >
              <motion.div className="absolute inset-0 pointer-events-none" animate={{
                backgroundColor:
                  cacheState === "targeted" ? "rgba(245,158,11,0.06)" :
                  cacheState === "initializing" ? "rgba(16,185,129,0.05)" :
                  cacheState === "closing" ? "rgba(239,68,68,0.05)" :
                  cacheChecked ? "rgba(245,158,11,0.02)" : "transparent",
              }} transition={{ duration: 0.3 }} />

              <div className="relative">
                <div className={cn("size-10 rounded-xl flex items-center justify-center transition-all duration-400",
                  cacheState === "targeted" ? "bg-amber-500/10" : cacheState === "initializing" ? "bg-emerald-500/10" : cacheState === "closing" ? "bg-red-500/10" : "bg-muted/10"
                )}>
                  <Layers className="size-5 transition-colors duration-400"
                    style={{ color: cacheState === "closed" ? "rgba(128,128,128,0.12)" : cacheState === "targeted" ? "#f59e0b" : cacheState === "initializing" ? "#10b981" : cacheState === "closing" ? "#ef4444" : cacheState === "ready" ? "#f59e0b" : "rgba(128,128,128,0.15)" }} />
                </div>
                <AnimatePresence>
                  {cacheState === "initializing" && (
                    <motion.div key="i" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 size-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                        className="size-2 border border-emerald-400 border-t-transparent rounded-full" />
                    </motion.div>
                  )}
                  {cacheState === "ready" && !cacheChecked && (
                    <motion.div key="r" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}
                      className="absolute -top-1 -right-1 size-4 rounded-full bg-amber-500/25 border border-amber-500/40 flex items-center justify-center">
                      <Check className="size-2 text-amber-400" />
                    </motion.div>
                  )}
                  {cacheState === "targeted" && (
                    <motion.div key="t" initial={{ scale: 0 }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
                      className="absolute -top-1 -right-1 size-4 rounded-full bg-amber-500/30 border border-amber-500/50 flex items-center justify-center">
                      <Zap className="size-2 text-amber-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold transition-colors", cacheState === "closed" ? "text-muted-foreground/15" : "text-foreground")}>
                  Cache Layer
                </p>
                <AnimatePresence mode="wait">
                  {cacheState === "initializing" && <motion.p key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs font-mono text-emerald-400/60 mt-0.5">Warming popular endpoints...</motion.p>}
                  {cacheState === "targeted" && <motion.p key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-amber-400/80 font-semibold mt-0.5">Cache HIT — returning instantly</motion.p>}
                  {cacheChecked && <motion.p key="miss" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-muted-foreground/30 mt-0.5">Cache miss → routing to client above</motion.p>}
                  {cacheState === "ready" && !cacheChecked && mainPhase === "running" && !curReq && <motion.p key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[11px] font-mono text-muted-foreground/30 mt-0.5">Warmed at startup — serving cached responses</motion.p>}
                  {cacheState === "closing" && <motion.p key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs font-mono text-red-400/60 mt-0.5">Flushing to disk...</motion.p>}
                </AnimatePresence>
              </div>

              {(cacheState === "initializing" || cacheState === "closing") && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
                  <motion.div className="h-full rounded-full"
                    style={{ backgroundColor: cacheState === "initializing" ? "#10b981" : "#ef4444" }}
                    initial={{ width: "0%" }} animate={{ width: "100%" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }} />
                </div>
              )}
            </motion.div>
          </div>

          {/* Arrow down to request */}
          <AnimatePresence>
            {mainPhase === "running" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center">
                <ArrowDown className="size-4 text-muted-foreground/15" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===== REQUEST CARD ===== */}
          <AnimatePresence mode="wait">
            {curReq && (
              <motion.div
                key={curReq.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "rounded-xl border px-4 py-3 flex items-center gap-3",
                  curReq.hitCache
                    ? "border-amber-500/20 bg-amber-500/5"
                    : "border-blue-500/20 bg-blue-500/5"
                )}
              >
                <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0",
                  curReq.hitCache ? "bg-amber-500/10" : "bg-blue-500/10"
                )}>
                  <ArrowRight className={cn("size-4", curReq.hitCache ? "text-amber-400" : "text-blue-400")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-xs font-mono font-bold", curReq.hitCache ? "text-amber-400" : "text-blue-400")}>
                    {curReq.method} {curReq.path}
                  </p>
                  <p className="text-[11px] text-muted-foreground/50 mt-0.5">{curReq.annotation}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Yield marker */}
          <AnimatePresence>
            {mainPhase === "running" && !curReq && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500/15 to-transparent" />
                <span className="text-[11px] font-mono text-blue-400/25 shrink-0">yield — accepting requests</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500/15 to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className={cn("px-5 py-3 border-t transition-colors duration-500",
        mainPhase === "startup" ? "bg-emerald-500/3" : mainPhase === "running" ? "bg-blue-500/3" : mainPhase === "shutdown" ? "bg-red-500/3" : "bg-muted/10"
      )}>
        <p className="text-xs text-muted-foreground/50 leading-relaxed">
          {mainPhase === "startup" && <><span className="text-emerald-400 font-semibold">Before yield:</span> Each client and the cache are created once and stored on app.state.</>}
          {mainPhase === "running" && <><span className="text-blue-400 font-semibold">At yield:</span> Requests check the cache first. On miss, they reuse the same client — no new connections per request.</>}
          {mainPhase === "shutdown" && <><span className="text-red-400 font-semibold">After yield:</span> Cache flushes first, then clients close in reverse order.</>}
          {mainPhase === "stopped" && "All resources released. The app has shut down gracefully."}
          {mainPhase === "idle" && "Watch: clients init → cache warms → requests reuse them → everything cleans up."}
        </p>
      </div>
    </div>
  );
}
