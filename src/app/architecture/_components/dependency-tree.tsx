"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Syringe,
  RotateCcw,
  Play,
  Monitor,
  Server,
  Database,
  UserCheck,
  Shield,
  ArrowDown,
  CheckCircle2,
  Loader2,
  Sparkles,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────
type Phase =
  | "idle"
  | "request-sent"
  | "resolving-deps"
  | "injecting"
  | "processing"
  | "response";

interface Dependency {
  id: string;
  name: string;
  shortName: string;
  produces: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Preset {
  id: string;
  label: string;
  method: string;
  path: string;
  endpointName: string;
  endpointDesc: string;
  responseBody: string;
  description: string;
  dependencies: Dependency[];
}

const PRESETS: Preset[] = [
  {
    id: "simple",
    label: "GET /me",
    method: "GET",
    path: "/me",
    endpointName: "read_users_me()",
    endpointDesc: "Returns the authenticated user",
    responseBody: '{"name": "Alice", "email": "alice@ex.com"}',
    description:
      "FastAPI calls get_db() and get_current_user() — both live on the server — then injects their return values into the endpoint.",
    dependencies: [
      { id: "db", name: "get_db()", shortName: "Session", produces: "DB Session", icon: Database },
      { id: "user", name: "get_current_user()", shortName: "User", produces: "User object", icon: UserCheck },
    ],
  },
  {
    id: "items",
    label: "GET /items",
    method: "GET",
    path: "/items?skip=0&limit=10",
    endpointName: "list_items()",
    endpointDesc: "Returns paginated item list",
    responseBody: '[{"id": 1, "name": "Widget"}, ...]',
    description:
      "Two server-side dependencies — a DB session and a paginator — resolve independently before the endpoint runs.",
    dependencies: [
      { id: "db", name: "get_db()", shortName: "Session", produces: "DB Session", icon: Database },
      { id: "paginate", name: "Paginator()", shortName: "Pagination", produces: "{skip, limit}", icon: Sparkles },
    ],
  },
  {
    id: "admin",
    label: "GET /admin/stats",
    method: "GET",
    path: "/admin/stats",
    endpointName: "admin_stats()",
    endpointDesc: "Returns admin dashboard data",
    responseBody: '{"users": 142, "active": 89}',
    description:
      "Three dependencies chain together: get_db → get_current_user → require_admin, each feeding into the next before the handler runs.",
    dependencies: [
      { id: "db", name: "get_db()", shortName: "Session", produces: "DB Session", icon: Database },
      { id: "user", name: "get_current_user()", shortName: "User", produces: "User object", icon: UserCheck },
      { id: "admin", name: "require_admin()", shortName: "Admin", produces: "Admin user", icon: Shield },
    ],
  },
];

// ── Dot Grid Background ────────────────────────────────────────
function DotGrid({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <svg width="100%" height="100%" className="opacity-[0.035]">
        <defs>
          <pattern id="dot-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>
    </div>
  );
}

// ── Animated Connection Line ───────────────────────────────────
function ConnectionLine({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div className="flex flex-col items-center h-8 relative">
      {/* The line */}
      <motion.div
        className={cn(
          "w-px h-full transition-colors duration-700",
          done ? "bg-emerald-400/40" : active ? "bg-purple-400/40" : "bg-border/20",
        )}
      />
      {/* Traveling dot */}
      <AnimatePresence>
        {active && !done && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
            initial={{ top: 0, opacity: 0 }}
            animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, ease: "easeIn" }}
          />
        )}
      </AnimatePresence>
      {/* Arrow at bottom */}
      <ArrowDown className={cn(
        "size-3 absolute -bottom-1.5 transition-colors duration-700",
        done ? "text-emerald-400/50" : active ? "text-purple-400/50" : "text-border/20",
      )} />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export function DependencyTree() {
  const [activePresetId, setActivePresetId] = useState("simple");
  const [phase, setPhase] = useState<Phase>("idle");
  const [resolvedDeps, setResolvedDeps] = useState<Set<string>>(new Set());
  const [resolvingDep, setResolvingDep] = useState<string | null>(null);
  const [injectedDeps, setInjectedDeps] = useState<Set<string>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [showCleanup, setShowCleanup] = useState(false);
  const generationRef = useRef(0);

  const preset = PRESETS.find((p) => p.id === activePresetId)!;

  const switchPreset = useCallback((id: string) => {
    generationRef.current += 1;
    setActivePresetId(id);
    setPhase("idle");
    setResolvedDeps(new Set());
    setResolvingDep(null);
    setInjectedDeps(new Set());
    setIsRunning(false);
    setShowCleanup(false);
  }, []);

  const reset = useCallback(() => {
    generationRef.current += 1;
    setPhase("idle");
    setResolvedDeps(new Set());
    setResolvingDep(null);
    setInjectedDeps(new Set());
    setIsRunning(false);
    setShowCleanup(false);
  }, []);

  const run = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    setPhase("idle");
    setResolvedDeps(new Set());
    setResolvingDep(null);
    setInjectedDeps(new Set());
    setShowCleanup(false);
    const gen = ++generationRef.current;
    const deps = preset.dependencies;

    setTimeout(() => {
      if (generationRef.current !== gen) return;
      setPhase("request-sent");
    }, 300);

    let delay = 900;
    for (let i = 0; i < deps.length; i++) {
      const dep = deps[i];
      const startResolve = delay;
      const doneResolve = delay + 800;
      const doneInject = doneResolve + 400;

      setTimeout(() => {
        if (generationRef.current !== gen) return;
        setPhase("resolving-deps");
        setResolvingDep(dep.id);
      }, startResolve);

      setTimeout(() => {
        if (generationRef.current !== gen) return;
        setResolvedDeps((prev) => new Set([...prev, dep.id]));
        setResolvingDep(null);
      }, doneResolve);

      setTimeout(() => {
        if (generationRef.current !== gen) return;
        setPhase("injecting");
        setInjectedDeps((prev) => new Set([...prev, dep.id]));
      }, doneInject);

      delay = doneInject + 300;
    }

    setTimeout(() => {
      if (generationRef.current !== gen) return;
      setPhase("processing");
    }, delay + 200);

    setTimeout(() => {
      if (generationRef.current !== gen) return;
      setPhase("response");
    }, delay + 1100);

    setTimeout(() => {
      if (generationRef.current !== gen) return;
      setShowCleanup(true);
    }, delay + 1700);

    setTimeout(() => {
      if (generationRef.current !== gen) return;
      setIsRunning(false);
    }, delay + 2100);
  }, [isRunning, preset]);

  const isDone = phase === "response";
  const isActive = phase !== "idle";

  return (
    <div className="w-full rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-card/40 overflow-hidden relative">
      <DotGrid />

      {/* ── Header ── */}
      <div className="relative px-5 sm:px-6 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Syringe className="size-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Dependency Injection Flow</h3>
              <p className="text-[10px] text-muted-foreground/50 font-mono">interactive visualization</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(isRunning || isDone) && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={reset}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
              </motion.button>
            )}
            <button
              onClick={run}
              disabled={isRunning || isDone}
              className={cn(
                "inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer",
                isRunning || isDone
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-purple-500 text-white hover:bg-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
              )}
            >
              <Play className="size-3" />
              Send Request
            </button>
          </div>
        </div>

        {/* Preset selector */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted/30 border border-border/30 w-fit">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => switchPreset(p.id)}
              disabled={isRunning}
              className={cn(
                "text-[11px] font-mono font-medium px-3 py-1.5 rounded-md transition-all cursor-pointer",
                activePresetId === p.id
                  ? "bg-background text-foreground shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={activePresetId}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-muted-foreground/70 mt-3 max-w-lg leading-relaxed"
          >
            {preset.description}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

      {/* ┌──── SERVER ZONE ────┐ */}
      <div className="relative px-5 sm:px-6 py-5">
        {/* Server label */}
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            className={cn(
              "size-2 rounded-full transition-colors duration-700",
              !isActive && "bg-muted-foreground/20",
              (isActive && !isDone) && "bg-purple-400",
              isDone && "bg-emerald-400",
            )}
            animate={(isActive && !isDone) ? { opacity: [1, 0.3, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <div className="flex items-center gap-1.5">
            <Server className={cn(
              "size-3.5 transition-colors duration-700",
              !isActive && "text-muted-foreground/30",
              (isActive && !isDone) && "text-purple-400/70",
              isDone && "text-emerald-400/70",
            )} />
            <span className={cn(
              "text-[11px] font-bold uppercase tracking-widest transition-colors duration-700",
              !isActive && "text-muted-foreground/30",
              (isActive && !isDone) && "text-purple-400/60",
              isDone && "text-emerald-400/60",
            )}>
              Server
            </span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-border/30 to-transparent ml-2" />
        </div>

        {/* ── Dependencies ── */}
        <div className="mb-2">
          <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/30 mb-2 block pl-1">
            Depends()
          </span>

          <AnimatePresence mode="wait">
            <motion.div
              key={activePresetId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${Math.min(preset.dependencies.length, 3)}, 1fr)` }}
            >
              {preset.dependencies.map((dep, i) => {
                const isResolving = resolvingDep === dep.id;
                const isResolved = resolvedDeps.has(dep.id);
                const Icon = dep.icon;

                return (
                  <motion.div
                    key={dep.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    className={cn(
                      "group rounded-xl border p-3 transition-all duration-700 relative overflow-hidden",
                      !isResolving && !isResolved && "border-border/30 bg-muted/10",
                      isResolving && "border-purple-500/40 bg-purple-500/[0.06]",
                      isResolved && "border-emerald-500/25 bg-emerald-500/[0.04]",
                    )}
                  >
                    {/* Glow overlay when resolving */}
                    <AnimatePresence>
                      {isResolving && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative flex items-start gap-2">
                      <motion.div
                        className={cn(
                          "size-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-700",
                          !isResolving && !isResolved && "bg-muted/50 text-muted-foreground/30 border border-border/30",
                          isResolving && "bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]",
                          isResolved && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25",
                        )}
                        animate={isResolving ? { scale: [1, 1.08, 1] } : {}}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      >
                        {isResolving ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : isResolved ? (
                          <CheckCircle2 className="size-3" />
                        ) : (
                          <Icon className="size-3" />
                        )}
                      </motion.div>

                      <div className="min-w-0 flex-1">
                        <span className={cn(
                          "text-[11px] font-mono font-bold block leading-tight transition-colors duration-700",
                          !isResolving && !isResolved && "text-muted-foreground/50",
                          isResolving && "text-purple-300",
                          isResolved && "text-emerald-400",
                        )}>
                          {dep.name}
                        </span>

                        <AnimatePresence>
                          {isResolved ? (
                            <motion.span
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="text-[9px] font-mono text-emerald-400/50 block mt-0.5"
                            >
                              → {dep.produces}
                            </motion.span>
                          ) : (
                            <motion.span
                              className={cn(
                                "text-[9px] font-mono block mt-0.5 transition-colors duration-700",
                                isResolving ? "text-purple-400/40" : "text-muted-foreground/20",
                              )}
                            >
                              {isResolving ? "resolving..." : "idle"}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Connection Lines ── */}
        <div className="flex justify-center gap-8 my-1">
          {preset.dependencies.map((dep) => (
            <ConnectionLine
              key={dep.id}
              active={resolvingDep === dep.id || injectedDeps.has(dep.id)}
              done={injectedDeps.has(dep.id)}
            />
          ))}
        </div>

        {/* ── Endpoint Function ── */}
        <div>
          <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/30 mb-2 block pl-1">
            Endpoint
          </span>

          <motion.div
            className={cn(
              "rounded-xl border-2 p-4 transition-all duration-700 relative overflow-hidden",
              phase === "idle" && "border-border/20 bg-muted/5",
              phase === "request-sent" && "border-border/30 bg-muted/10",
              (phase === "resolving-deps" || phase === "injecting") && "border-purple-500/15 bg-purple-500/[0.02]",
              phase === "processing" && "border-purple-500/40 bg-purple-500/[0.04] shadow-[0_0_30px_rgba(168,85,247,0.08)]",
              phase === "response" && "border-emerald-500/25 bg-emerald-500/[0.03]",
            )}
          >
            {/* Function signature */}
            <div className="flex items-center gap-2 mb-2">
              {phase === "processing" ? (
                <motion.div
                  className="size-5 rounded-md bg-purple-500/15 flex items-center justify-center border border-purple-500/30"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Loader2 className="size-3 text-purple-400 animate-spin" />
                </motion.div>
              ) : phase === "response" ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="size-5 rounded-md bg-emerald-500/10 flex items-center justify-center border border-emerald-500/25"
                >
                  <CheckCircle2 className="size-3 text-emerald-400" />
                </motion.div>
              ) : (
                <div className="size-5 rounded-md bg-muted/30 flex items-center justify-center border border-border/20">
                  <Circle className="size-2 text-muted-foreground/20" />
                </div>
              )}
              <span className={cn(
                "text-sm font-mono font-bold transition-colors duration-700",
                phase === "processing" && "text-purple-300",
                phase === "response" && "text-emerald-400",
                phase !== "processing" && phase !== "response" && "text-muted-foreground/40",
              )}>
                {preset.endpointName}
              </span>
            </div>

            <p className="text-[10px] text-muted-foreground/35 mb-3 pl-7">{preset.endpointDesc}</p>

            {/* Injection slots */}
            <div className="flex flex-wrap gap-2 pl-7">
              {preset.dependencies.map((dep) => {
                const isInjected = injectedDeps.has(dep.id);
                return (
                  <AnimatePresence key={dep.id} mode="wait">
                    {isInjected ? (
                      <motion.div
                        key={`filled-${dep.id}`}
                        initial={{ opacity: 0, scale: 0.6, y: -12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 18 }}
                        className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="size-2.5 text-emerald-400" />
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">{dep.shortName}</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={`empty-${dep.id}`}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={cn(
                          "rounded-md border-2 border-dashed px-2.5 py-1 flex items-center gap-1.5 transition-colors duration-700",
                          resolvingDep === dep.id ? "border-purple-500/30" : "border-border/20",
                        )}
                      >
                        <div className={cn(
                          "size-2.5 rounded-full border-2 border-dashed transition-colors duration-700",
                          resolvingDep === dep.id ? "border-purple-400/40" : "border-muted-foreground/10",
                        )} />
                        <span className={cn(
                          "text-[10px] font-mono transition-colors duration-700",
                          resolvingDep === dep.id ? "text-purple-400/30" : "text-muted-foreground/15",
                        )}>{dep.shortName}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                );
              })}
            </div>

            {/* Return value */}
            <AnimatePresence>
              {phase === "response" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="mt-3 pt-3 border-t border-emerald-500/15 pl-7"
                >
                  <span className="text-[8px] font-mono text-emerald-400/30 uppercase tracking-widest">return</span>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="text-[11px] font-mono text-emerald-400/70 mt-1 break-all leading-relaxed"
                  >
                    {preset.responseBody}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Shimmer */}
            <AnimatePresence>
              {phase === "processing" && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/[0.06] to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ── Cleanup ── */}
        <AnimatePresence>
          {showCleanup && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 pl-1"
            >
              <div className="size-1.5 rounded-full bg-amber-400/50" />
              <span className="text-[9px] font-mono text-amber-400/40">
                finally: db.close()
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-500/10 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Divider ── */}
      <div className="relative">
        <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
        {/* Request/Response indicator */}
        <div className="absolute inset-x-0 -top-2.5 flex justify-center">
          <AnimatePresence mode="wait">
            {phase === "request-sent" && (
              <motion.div
                key="req"
                initial={{ opacity: 0, y: 6, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.8 }}
                className="text-[8px] font-mono text-blue-400 bg-background border border-blue-500/30 rounded-full px-2.5 py-0.5 shadow-[0_0_10px_rgba(59,130,246,0.15)]"
              >
                ↑ {preset.method} {preset.path}
              </motion.div>
            )}
            {(phase === "resolving-deps" || phase === "injecting" || phase === "processing") && (
              <motion.div
                key="proc"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[8px] font-mono text-purple-400/60 bg-background border border-purple-500/20 rounded-full px-2.5 py-0.5"
              >
                <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                  processing
                </motion.span>
              </motion.div>
            )}
            {phase === "response" && (
              <motion.div
                key="res"
                initial={{ opacity: 0, y: -6, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-[8px] font-mono text-emerald-400 bg-background border border-emerald-500/30 rounded-full px-2.5 py-0.5 shadow-[0_0_10px_rgba(52,211,153,0.15)]"
              >
                ↓ 200 OK
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ┌──── CLIENT ZONE (bottom) ────┐ */}
      <div className={cn(
        "relative px-5 sm:px-6 py-4 flex items-center gap-3 transition-colors duration-700",
        !isActive && "bg-muted/5",
        (isActive && !isDone) && "bg-blue-500/[0.02]",
        isDone && "bg-emerald-500/[0.02]",
      )}>
        <motion.div
          className={cn(
            "size-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-700",
            !isActive && "bg-muted/30 border border-border/30 text-muted-foreground/30",
            (isActive && !isDone) && "bg-blue-500/10 border border-blue-500/25 text-blue-400",
            isDone && "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400",
          )}
        >
          <Monitor className="size-4" />
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">Client</span>
            <AnimatePresence mode="wait">
              {!isActive && (
                <motion.span key="ready" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
                  className="text-[9px] font-mono text-muted-foreground/30">ready</motion.span>
              )}
              {(isActive && !isDone) && (
                <motion.span key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-[9px] font-mono text-blue-400/50">
                  <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                    awaiting response
                  </motion.span>
                </motion.span>
              )}
              {isDone && (
                <motion.span key="ok" initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="text-[9px] font-mono text-emerald-400 font-bold">received response</motion.span>
              )}
            </AnimatePresence>
          </div>
          <span className="text-[9px] font-mono text-muted-foreground/20 block">
            {preset.method} {preset.path}
          </span>
        </div>

        {/* Status dot */}
        <motion.div
          className={cn(
            "size-2 rounded-full shrink-0 transition-colors duration-700",
            !isActive && "bg-muted-foreground/15",
            (isActive && !isDone) && "bg-blue-400",
            isDone && "bg-emerald-400",
          )}
          animate={(isActive && !isDone) ? { scale: [1, 1.3, 1], opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>

      {/* ── Footer Legend ── */}
      <div className="px-5 sm:px-6 py-3 border-t border-border/20 bg-muted/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {[
            { color: "bg-blue-400", label: "Request" },
            { color: "bg-purple-400", label: "Resolving" },
            { color: "bg-emerald-400", label: "Injected" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={cn("size-1.5 rounded-full", item.color)} />
              <span className="text-[9px] text-muted-foreground/40 font-mono">{item.label}</span>
            </div>
          ))}
        </div>
        <span className="text-[9px] text-muted-foreground/30 font-mono hidden sm:inline">
          {phase === "idle" && "ready"}
          {phase === "request-sent" && "request received"}
          {phase === "resolving-deps" && `calling ${preset.dependencies.find((d) => d.id === resolvingDep)?.name ?? "..."}`}
          {phase === "injecting" && "injecting"}
          {phase === "processing" && preset.endpointName}
          {phase === "response" && (showCleanup ? "complete" : "200 OK")}
        </span>
      </div>
    </div>
  );
}
