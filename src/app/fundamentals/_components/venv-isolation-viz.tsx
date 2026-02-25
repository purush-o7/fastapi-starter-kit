"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Package, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "global" | "isolated";

interface Pkg {
  name: string;
  version: string;
  color: string;
}

const GLOBAL_PACKAGES: Pkg[] = [
  { name: "Flask", version: "2.0", color: "blue" },
  { name: "Flask", version: "3.0", color: "blue" },
  { name: "requests", version: "2.28", color: "violet" },
  { name: "requests", version: "2.31", color: "violet" },
  { name: "FastAPI", version: "0.100", color: "emerald" },
  { name: "numpy", version: "1.24", color: "amber" },
];

const VENV_A: Pkg[] = [
  { name: "Flask", version: "3.0", color: "blue" },
  { name: "requests", version: "2.31", color: "violet" },
];

const VENV_B: Pkg[] = [
  { name: "FastAPI", version: "0.100", color: "emerald" },
  { name: "numpy", version: "1.24", color: "amber" },
  { name: "requests", version: "2.28", color: "violet" },
];

function PkgPill({ pkg, conflict, ok }: { pkg: Pkg; conflict?: boolean; ok?: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-mono font-medium",
        conflict && "border-red-500/40 bg-red-500/10 text-red-400",
        ok && `border-${pkg.color}-500/30 bg-${pkg.color}-500/10 text-${pkg.color}-400`,
        !conflict && !ok && `border-${pkg.color}-500/20 bg-${pkg.color}-500/5 text-${pkg.color}-400/70`,
      )}
    >
      {conflict && <X className="size-3 text-red-400" />}
      {ok && <CheckCircle2 className="size-3" />}
      {pkg.name}=={pkg.version}
    </motion.div>
  );
}

export function VenvIsolationViz() {
  const [mode, setMode] = useState<Mode>("global");

  const conflicts = new Set<string>();
  const seen = new Map<string, string>();
  GLOBAL_PACKAGES.forEach((pkg) => {
    if (seen.has(pkg.name) && seen.get(pkg.name) !== pkg.version) {
      conflicts.add(pkg.name);
    }
    seen.set(pkg.name, pkg.version);
  });

  return (
    <div className="w-full rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-card/40 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg width="100%" height="100%" className="opacity-[0.03]">
          <defs><pattern id="venv-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.7" fill="currentColor" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#venv-dots)" />
        </svg>
      </div>

      <div className="relative">
        <div className="px-5 sm:px-6 pt-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <Package className="size-4 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Package Isolation</h3>
                <p className="text-[10px] text-muted-foreground/50 font-mono">global vs virtual environments</p>
              </div>
            </div>
          </div>

          {/* Toggle */}
          <div className="flex gap-1 p-1 rounded-lg bg-muted/30 border border-border/30 w-fit">
            <button onClick={() => setMode("global")}
              className={cn("text-[11px] font-mono font-medium px-3 py-1.5 rounded-md transition-all cursor-pointer",
                mode === "global" ? "bg-red-500/10 text-red-400 shadow-sm border border-red-500/20" : "text-muted-foreground hover:text-foreground"
              )}>
              Without venv
            </button>
            <button onClick={() => setMode("isolated")}
              className={cn("text-[11px] font-mono font-medium px-3 py-1.5 rounded-md transition-all cursor-pointer",
                mode === "isolated" ? "bg-emerald-500/10 text-emerald-400 shadow-sm border border-emerald-500/20" : "text-muted-foreground hover:text-foreground"
              )}>
              With venv
            </button>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

        <div className="px-5 sm:px-6 py-6 min-h-[220px]">
          <AnimatePresence mode="wait">
            {mode === "global" ? (
              <motion.div key="global" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                <div className="rounded-xl border-2 border-red-500/20 bg-red-500/[0.03] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="size-4 text-red-400" />
                    <span className="text-sm font-bold text-red-400/80">Global Python</span>
                    <span className="text-[10px] font-mono text-red-400/40">/usr/lib/python3.x/</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {GLOBAL_PACKAGES.map((pkg, i) => (
                      <PkgPill key={`${pkg.name}-${pkg.version}`} pkg={pkg} conflict={conflicts.has(pkg.name)} />
                    ))}
                  </div>
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
                    <X className="size-3.5 text-red-400" />
                    <span className="text-xs text-red-400/70">
                      Flask 2.0 and 3.0 can&apos;t coexist — one project breaks the other
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="isolated" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border-2 border-emerald-500/20 bg-emerald-500/[0.03] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="size-3.5 text-emerald-400" />
                      <span className="text-sm font-bold text-emerald-400/80">Project A</span>
                      <span className="text-[9px] font-mono text-emerald-400/30">.venv/</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {VENV_A.map((pkg) => (
                        <PkgPill key={`a-${pkg.name}`} pkg={pkg} ok />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border-2 border-emerald-500/20 bg-emerald-500/[0.03] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="size-3.5 text-emerald-400" />
                      <span className="text-sm font-bold text-emerald-400/80">Project B</span>
                      <span className="text-[9px] font-mono text-emerald-400/30">.venv/</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {VENV_B.map((pkg) => (
                        <PkgPill key={`b-${pkg.name}`} pkg={pkg} ok />
                      ))}
                    </div>
                  </div>
                </div>
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  <span className="text-xs text-emerald-400/70">
                    Each project has its own packages — no conflicts possible
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-5 sm:px-6 py-3 border-t border-border/20 bg-muted/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Package className="size-3 text-muted-foreground/20" />
            <span className="text-[9px] text-muted-foreground/30 font-mono">pip + venv</span>
          </div>
          <span className="text-[9px] text-muted-foreground/30 font-mono">
            {mode === "global" ? "conflicts possible" : "isolated"}
          </span>
        </div>
      </div>
    </div>
  );
}
