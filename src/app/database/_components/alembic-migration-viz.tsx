"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GitBranch,
  Plus,
  Terminal,
  Database,
  CheckCircle2,
  RotateCcw,
  Play,
  FileCode,
  ArrowRight,
  Table2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────
type Phase = "idle" | "model-change" | "generate" | "upgrade" | "verify";

interface Step {
  id: Phase;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const STEPS: Step[] = [
  { id: "model-change", label: "Edit Model", icon: FileCode, description: "You add a new column to your SQLAlchemy model" },
  { id: "generate", label: "Generate", icon: Terminal, description: "Alembic scans models and creates a migration script" },
  { id: "upgrade", label: "Upgrade", icon: Database, description: "The migration applies the schema change to your database" },
  { id: "verify", label: "Verify", icon: CheckCircle2, description: "Database schema now matches your models" },
];

const COLUMNS_BEFORE = [
  { name: "id", type: "Integer", pk: true },
  { name: "name", type: "String(100)" },
  { name: "email", type: "String(200)" },
];

const NEW_COLUMN = { name: "is_active", type: "Boolean", default: "True" };

// ── Main Component ─────────────────────────────────────────────
export function AlembicMigrationViz() {
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
    reset();
    const gen = ++generationRef.current;

    setTimeout(() => {
      if (generationRef.current !== gen) return;
      setIsRunning(true);
      setPhase("model-change");
    }, 100);

    setTimeout(() => {
      if (generationRef.current !== gen) return;
      setPhase("generate");
    }, 2200);

    setTimeout(() => {
      if (generationRef.current !== gen) return;
      setPhase("upgrade");
    }, 4200);

    setTimeout(() => {
      if (generationRef.current !== gen) return;
      setPhase("verify");
    }, 6000);

    setTimeout(() => {
      if (generationRef.current !== gen) return;
      setIsRunning(false);
    }, 7500);
  }, [isRunning, reset]);

  const currentStepIndex = STEPS.findIndex((s) => s.id === phase);
  const isDone = phase === "verify" && !isRunning;

  return (
    <div className="w-full rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-card/40 overflow-hidden relative">
      {/* Dot grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg width="100%" height="100%" className="opacity-[0.03]">
          <defs>
            <pattern id="alembic-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.7" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#alembic-dots)" />
        </svg>
      </div>

      <div className="relative">
        {/* Header */}
        <div className="px-5 sm:px-6 pt-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <GitBranch className="size-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Migration Workflow</h3>
                <p className="text-[10px] text-muted-foreground/50 font-mono">model change → revision → upgrade → verify</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {phase !== "idle" && (
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
                disabled={isRunning}
                className={cn(
                  "inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer",
                  isRunning
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-cyan-500 text-white hover:bg-cyan-600 shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                )}
              >
                <Play className="size-3" />
                Run Migration
              </button>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-1">
            {STEPS.map((step, i) => {
              const isActive = step.id === phase;
              const isPast = currentStepIndex > i;
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <motion.div
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-all duration-500 flex-1",
                      isActive && "border-cyan-500/30 bg-cyan-500/10",
                      isPast && "border-emerald-500/20 bg-emerald-500/5",
                      !isActive && !isPast && "border-border/20 bg-transparent",
                    )}
                    animate={isActive ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                    transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                  >
                    {isPast ? (
                      <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                    ) : (
                      <StepIcon className={cn("size-3 shrink-0 transition-colors duration-500",
                        isActive ? "text-cyan-400" : "text-muted-foreground/25",
                      )} />
                    )}
                    <span className={cn("text-[9px] sm:text-[10px] font-mono font-medium truncate transition-colors duration-500",
                      isActive ? "text-cyan-400" : isPast ? "text-emerald-400/60" : "text-muted-foreground/20",
                    )}>
                      {step.label}
                    </span>
                  </motion.div>
                  {i < STEPS.length - 1 && (
                    <ArrowRight className={cn("size-3 mx-0.5 shrink-0 transition-colors duration-500",
                      isPast ? "text-emerald-400/30" : "text-muted-foreground/10",
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

        {/* ── Content Area ── */}
        <div className="px-5 sm:px-6 py-5 min-h-[220px]">
          <AnimatePresence mode="wait">
            {/* Phase: Model Change */}
            {phase === "model-change" && (
              <motion.div
                key="model-change"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <Table2 className="size-3.5 text-cyan-400/60" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400/40">models.py — User table</span>
                </div>
                <div className="rounded-xl border border-border/30 bg-muted/10 p-4 font-mono text-xs">
                  {COLUMNS_BEFORE.map((col) => (
                    <div key={col.name} className="flex items-center gap-2 py-1 text-muted-foreground/60">
                      <span className="w-24">{col.name}</span>
                      <span className="text-muted-foreground/30">{col.type}</span>
                      {col.pk && <span className="text-[8px] bg-amber-500/10 text-amber-400/50 rounded px-1.5 py-0.5">PK</span>}
                    </div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, x: -10, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    transition={{ delay: 0.5, duration: 0.4, type: "spring", stiffness: 300 }}
                    className="flex items-center gap-2 py-1 border-t border-emerald-500/20 mt-1 pt-2"
                  >
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 }}>
                      <Plus className="size-3 text-emerald-400" />
                    </motion.div>
                    <span className="text-emerald-400 font-semibold w-24">{NEW_COLUMN.name}</span>
                    <span className="text-emerald-400/50">{NEW_COLUMN.type}</span>
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400/50 rounded px-1.5 py-0.5">default={NEW_COLUMN.default}</span>
                  </motion.div>
                </div>
                <p className="text-xs text-muted-foreground/50 mt-3">New column <code className="text-emerald-400/60 bg-emerald-500/5 px-1 rounded">is_active</code> added to the User model.</p>
              </motion.div>
            )}

            {/* Phase: Generate */}
            {phase === "generate" && (
              <motion.div
                key="generate"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <Terminal className="size-3.5 text-cyan-400/60" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400/40">Terminal</span>
                </div>
                <div className="rounded-xl border border-border/30 bg-[#0d1117] p-4 font-mono text-xs">
                  <div className="text-emerald-400/70 mb-2">
                    <span className="text-muted-foreground/40">$ </span>
                    alembic revision --autogenerate -m &quot;add is_active column&quot;
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-muted-foreground/40 space-y-1"
                  >
                    <p>INFO  [alembic.autogenerate] Detected added column &apos;users.is_active&apos;</p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.0 }}
                      className="text-cyan-400/60"
                    >
                      Generating alembic/versions/a3f2b1c9_add_is_active_column.py ... done
                    </motion.p>
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="mt-3 flex items-center gap-2"
                >
                  <FileCode className="size-3.5 text-cyan-400/50" />
                  <span className="text-xs text-muted-foreground/50">Migration file created with <code className="text-cyan-400/60 bg-cyan-500/5 px-1 rounded">upgrade()</code> and <code className="text-cyan-400/60 bg-cyan-500/5 px-1 rounded">downgrade()</code> functions.</span>
                </motion.div>
              </motion.div>
            )}

            {/* Phase: Upgrade */}
            {phase === "upgrade" && (
              <motion.div
                key="upgrade"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <Terminal className="size-3.5 text-cyan-400/60" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400/40">Terminal</span>
                </div>
                <div className="rounded-xl border border-border/30 bg-[#0d1117] p-4 font-mono text-xs">
                  <div className="text-emerald-400/70 mb-2">
                    <span className="text-muted-foreground/40">$ </span>
                    alembic upgrade head
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-muted-foreground/40 space-y-1"
                  >
                    <p>INFO  [alembic.runtime.migration] Running upgrade -&gt; a3f2b1c9</p>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.0 }}
                    >
                      <p className="text-cyan-400/60">INFO  [alembic.runtime.migration] ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true</p>
                    </motion.div>
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="mt-3 flex items-center gap-2"
                >
                  <Database className="size-3.5 text-cyan-400/50" />
                  <span className="text-xs text-muted-foreground/50">Schema change applied to the database. Revision recorded in <code className="text-cyan-400/60 bg-cyan-500/5 px-1 rounded">alembic_version</code> table.</span>
                </motion.div>
              </motion.div>
            )}

            {/* Phase: Verify */}
            {phase === "verify" && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <CheckCircle2 className="size-3.5 text-emerald-400/60" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/40">Database Schema — Updated</span>
                </div>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4 font-mono text-xs">
                  <div className="text-[9px] font-mono text-muted-foreground/30 mb-2 uppercase tracking-wider">users table</div>
                  {COLUMNS_BEFORE.map((col) => (
                    <div key={col.name} className="flex items-center gap-2 py-1 text-muted-foreground/50">
                      <CheckCircle2 className="size-2.5 text-emerald-400/30" />
                      <span className="w-24">{col.name}</span>
                      <span className="text-muted-foreground/25">{col.type}</span>
                    </div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
                    className="flex items-center gap-2 py-1.5 border-t border-emerald-500/15 mt-1 pt-2 bg-emerald-500/5 -mx-1 px-1 rounded"
                  >
                    <CheckCircle2 className="size-2.5 text-emerald-400" />
                    <span className="w-24 text-emerald-400 font-semibold">{NEW_COLUMN.name}</span>
                    <span className="text-emerald-400/50">{NEW_COLUMN.type}</span>
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400/60 rounded px-1.5 py-0.5 ml-auto">NEW</span>
                  </motion.div>
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xs text-emerald-400/40 mt-3 text-center"
                >
                  Database schema matches your models. Migration complete.
                </motion.p>
              </motion.div>
            )}

            {/* Idle state */}
            {phase === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center min-h-[200px]"
              >
                <p className="text-sm text-muted-foreground/25 font-mono">Click &quot;Run Migration&quot; to watch the workflow</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-border/20 bg-muted/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <GitBranch className="size-3 text-muted-foreground/20" />
            <span className="text-[9px] text-muted-foreground/30 font-mono">alembic</span>
          </div>
          <span className="text-[9px] text-muted-foreground/30 font-mono">
            {phase === "idle" && "ready"}
            {phase === "model-change" && "editing model..."}
            {phase === "generate" && "generating revision..."}
            {phase === "upgrade" && "applying migration..."}
            {phase === "verify" && (isRunning ? "verifying..." : "migration complete")}
          </span>
        </div>
      </div>
    </div>
  );
}
