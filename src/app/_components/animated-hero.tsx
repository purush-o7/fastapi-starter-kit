"use client";

import { motion } from "motion/react";
import { TextEffect } from "@/components/ui/text-effect";
import {
  Route,
  Braces,
  GitFork,
  AlertTriangle,
  Shield,
  Timer,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LEARNING_PATH = [
  { label: "Routing", icon: Route, color: "text-teal-500", bg: "bg-teal-500", border: "border-teal-500/40" },
  { label: "Data", icon: Braces, color: "text-blue-500", bg: "bg-blue-500", border: "border-blue-500/40" },
  { label: "Architecture", icon: GitFork, color: "text-purple-500", bg: "bg-purple-500", border: "border-purple-500/40" },
  { label: "Errors", icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500", border: "border-orange-500/40" },
  { label: "Auth", icon: Shield, color: "text-amber-500", bg: "bg-amber-500", border: "border-amber-500/40" },
  { label: "Async", icon: Timer, color: "text-indigo-500", bg: "bg-indigo-500", border: "border-indigo-500/40" },
  { label: "Database", icon: Database, color: "text-cyan-500", bg: "bg-cyan-500", border: "border-cyan-500/40" },
];

export function AnimatedHero() {
  return (
    <div className="mb-14 relative grain">
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-16 w-64 h-64 bg-gradient-to-tl from-cyan-500/8 via-teal-500/6 to-transparent rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative"
      >
        <motion.p
          className="text-sm font-medium text-muted-foreground/60 uppercase tracking-widest mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          Welcome to
        </motion.p>
        <motion.h1
          className="text-4xl sm:text-5xl lg:text-6xl font-serif italic tracking-tight mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.1,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
        >
          What is{" "}
          <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent not-italic font-sans font-bold">
            FastAPI
          </span>
        </motion.h1>
        <TextEffect
          preset="fade-in-blur"
          per="word"
          delay={0.3}
          className="text-lg text-muted-foreground max-w-2xl"
        >
          A modern, fast Python web framework for building APIs. Learn path
          operations, dependency injection, Pydantic models, and more through
          interactive examples and real-world patterns.
        </TextEffect>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-emerald-500" />
          <span>7 Categories</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-teal-500" />
          <span>15 Core Concepts</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-cyan-500" />
          <span>Python 3.10+</span>
        </div>
      </motion.div>

      {/* Learning Path Visualization */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-8 relative"
      >
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-3">
          Learning Path
        </p>
        <div className="flex items-center gap-0 overflow-x-auto pb-2 dot-grid rounded-lg py-4 px-2 -mx-2">
          {LEARNING_PATH.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <div key={step.label} className="flex items-center shrink-0">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 250,
                    damping: 20,
                    delay: 1.0 + index * 0.12,
                  }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className={cn(
                      "size-9 rounded-lg border-2 flex items-center justify-center transition-all hover:scale-110",
                      step.border,
                      `${step.bg}/10`
                    )}
                  >
                    <StepIcon className={cn("size-4", step.color)} />
                  </div>
                  <span className="text-[9px] text-muted-foreground/60 font-medium">
                    {step.label}
                  </span>
                </motion.div>

                {index < LEARNING_PATH.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: 1.1 + index * 0.12,
                      ease: "easeOut",
                    }}
                    className="w-4 sm:w-6 h-px bg-border mx-1 origin-left"
                  />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
