"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Terminal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface WhatCouldGoWrongProps {
  scenario: string;
  error: string;
  errorType?: string;
  accentColor?: string;
  className?: string;
}

export function WhatCouldGoWrong({
  scenario,
  error,
  errorType = "Error",
  accentColor = "red",
  className,
}: WhatCouldGoWrongProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn(
        "rounded-xl border-2 overflow-hidden",
        `border-${accentColor}-500/30 bg-${accentColor}-500/[0.03]`,
        className
      )}
    >
      {/* Header bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-3 cursor-pointer",
          `bg-${accentColor}-500/[0.06] border-b border-${accentColor}-500/15`
        )}
      >
        <div className="flex items-center gap-2.5">
          <AlertTriangle className={cn("size-4", `text-${accentColor}-500`)} />
          <span className="text-sm font-semibold">What could go wrong?</span>
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px] font-mono px-1.5 py-0",
              `text-${accentColor}-400 bg-${accentColor}-500/10 border-${accentColor}-500/20`
            )}
          >
            {errorType}
          </Badge>
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            {/* Scenario narrative */}
            <div className="px-5 pt-4 pb-3">
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                {scenario}
              </p>
            </div>

            {/* Terminal-style error */}
            <div className="mx-4 mb-4 rounded-lg overflow-hidden border border-border/40 bg-[#1c1e26]">
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/[0.06] bg-white/[0.03]">
                <Terminal className="size-3 text-zinc-500" />
                <span className="text-[11px] text-zinc-500 font-mono">
                  terminal
                </span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-[13px] leading-relaxed font-mono text-red-400/90 whitespace-pre-wrap">
                  {error}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
