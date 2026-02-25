"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, Mail, FileText, Database, Check, User, Server, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/*
  Reimagined background task visualization:

  Shows TWO timelines side-by-side after the response:
  - CLIENT timeline: Gets response → moves on (idle, done)
  - SERVER timeline: Runs background tasks silently

  Key insight: There is NO connection between client and server
  during background tasks. The client has no idea tasks are running.

  Tasks are real server-side work: sending emails, writing to DB,
  cleanup — NOT client notifications.
*/

type Phase =
  | "idle"
  | "request"
  | "processing"
  | "response"
  | "split"        // timelines diverge
  | "task-1"
  | "task-2"
  | "task-3"
  | "all-done";

interface BgTask {
  id: string;
  label: string;
  description: string;
  icon: typeof Mail;
  color: string;
}

const TASKS: BgTask[] = [
  { id: "email", label: "send_email()", description: "Welcome email to user", icon: Mail, color: "#818cf8" },
  { id: "log", label: "write_to_db()", description: "Audit log entry", icon: Database, color: "#a78bfa" },
  { id: "cleanup", label: "cleanup_temp()", description: "Remove temp files", icon: FileText, color: "#c084fc" },
];

export function BackgroundTaskTimeline() {
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const t = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const run = useCallback(() => {
    clear();
    setPhase("idle");
    t(() => setPhase("request"), 400);
    t(() => setPhase("processing"), 1200);
    t(() => setPhase("response"), 1900);
    t(() => setPhase("split"), 2800);
    t(() => setPhase("task-1"), 3400);
    t(() => setPhase("task-2"), 5000);
    t(() => setPhase("task-3"), 5900);
    t(() => setPhase("all-done"), 7200);
    t(() => run(), 10000);
  }, [clear, t]);

  useEffect(() => { run(); return clear; }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pi = { idle: -1, request: 0, processing: 1, response: 2, split: 3, "task-1": 4, "task-2": 5, "task-3": 6, "all-done": 7 }[phase];
  const responseReturned = pi >= 2;
  const splitHappened = pi >= 3;
  const taskIdx = pi >= 4 ? pi - 4 : -1;
  const allDone = phase === "all-done";

  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className={cn("size-2 rounded-full", phase !== "idle" ? "bg-indigo-400 animate-pulse" : "bg-muted-foreground/30")} />
          <span className="text-sm font-semibold tracking-wide">Background Tasks — What Really Happens</span>
        </div>
        <button onClick={run} className="text-muted-foreground/50 hover:text-foreground transition-colors p-1 cursor-pointer">
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      <div className="px-5 py-6 relative">
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

        <div className="relative">
          {/* === PHASE 1: Request / Response === */}
          <div className="flex items-start justify-between mb-2">
            {/* Client node */}
            <div className="flex flex-col items-center gap-1.5 w-20 sm:w-24 z-10">
              <motion.div
                className={cn(
                  "size-14 rounded-2xl border-2 flex items-center justify-center transition-colors duration-500",
                  responseReturned && !splitHappened ? "border-emerald-500/40 bg-emerald-500/6" :
                  splitHappened ? "border-emerald-500/20 bg-emerald-500/3" :
                  "border-border/25 bg-muted/10"
                )}
              >
                <User className={cn("size-6 transition-colors duration-500",
                  responseReturned ? "text-emerald-400" : "text-muted-foreground/50"
                )} />
              </motion.div>
              <span className="text-[11px] font-semibold text-muted-foreground/60">Client</span>
            </div>

            {/* Server node */}
            <div className="flex flex-col items-center gap-1.5 w-20 sm:w-24 z-10">
              <motion.div
                className={cn(
                  "size-14 rounded-2xl border-2 flex items-center justify-center transition-colors duration-500 relative",
                  phase === "processing" ? "border-indigo-500/40 bg-indigo-500/6" :
                  taskIdx >= 0 && !allDone ? "border-purple-500/30 bg-purple-500/5" :
                  "border-border/25 bg-muted/10"
                )}
              >
                <Server className={cn("size-6 transition-colors duration-500",
                  phase === "processing" ? "text-indigo-400" :
                  taskIdx >= 0 && !allDone ? "text-purple-400" :
                  "text-muted-foreground/50"
                )} />
                <AnimatePresence>
                  {taskIdx >= 0 && !allDone && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -bottom-1 -right-1 size-5 rounded-md bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="size-2.5 border border-purple-400 border-t-transparent rounded-full" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              <span className="text-[11px] font-semibold text-muted-foreground/60">FastAPI</span>
            </div>
          </div>

          {/* Connection lane */}
          <div className="relative h-10 mx-10 sm:mx-12 mb-4">
            {/* Line — fades after split */}
            <motion.div
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px"
              animate={{
                background: splitHappened
                  ? "linear-gradient(to right, rgba(128,128,128,0.05), rgba(128,128,128,0.05))"
                  : "linear-gradient(to right, rgba(128,128,128,0.15), rgba(128,128,128,0.1), rgba(128,128,128,0.15))",
              }}
              transition={{ duration: 0.5 }}
            />

            {/* "Disconnected" label after split */}
            <AnimatePresence>
              {splitHappened && !allDone && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="text-[9px] font-mono text-muted-foreground/20 border border-dashed border-muted-foreground/10 px-3 py-0.5 rounded-full">
                    no connection
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Request → */}
            <AnimatePresence>
              {phase === "request" && (
                <motion.div className="absolute top-1/2 -translate-y-1/2 z-10"
                  initial={{ left: "0%", opacity: 0 }} animate={{ left: "80%", opacity: 1 }}
                  exit={{ left: "100%", opacity: 0 }} transition={{ duration: 0.75, ease: [0.32, 0.72, 0.35, 1] }}>
                  <div className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-xs font-mono font-semibold text-indigo-400 whitespace-nowrap shadow-lg shadow-indigo-500/10">
                    POST /signup
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ← Response */}
            <AnimatePresence>
              {phase === "response" && (
                <motion.div className="absolute top-1/2 -translate-y-1/2 z-10"
                  initial={{ left: "80%", opacity: 0 }} animate={{ left: "0%", opacity: 1 }}
                  exit={{ left: "-10%", opacity: 0 }} transition={{ duration: 0.8, ease: [0.32, 0.72, 0.35, 1] }}>
                  <div className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono font-semibold text-emerald-400 whitespace-nowrap shadow-lg shadow-emerald-500/10">
                    201 Created
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Processing */}
            <AnimatePresence>
              {phase === "processing" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-mono text-indigo-400/60">creating user...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* === SPLIT: Two parallel timelines === */}
          <AnimatePresence>
            {splitHappened && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  {/* CLIENT SIDE — done, moved on */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/25 to-transparent" />
                      <span className="text-[9px] font-mono text-emerald-400/40 uppercase tracking-widest">Client</span>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-emerald-500/15 bg-emerald-500/3 p-4 space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="size-3.5 text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-400">Got response</span>
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground/40 leading-relaxed">
                        {`{"message": "User created"}`}
                      </p>
                      <div className="border-t border-emerald-500/10 pt-3">
                        <p className="text-[10px] text-muted-foreground/30 italic">
                          Client has moved on. They have no idea background tasks are running.
                        </p>
                      </div>

                      {/* Client idle animation */}
                      <div className="flex items-center gap-2 pt-1">
                        <motion.div
                          className="size-1.5 rounded-full bg-emerald-400/30"
                          animate={{ opacity: [0.2, 0.5, 0.2] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                        <span className="text-[9px] font-mono text-muted-foreground/20">idle — browsing other pages</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* SERVER SIDE — working silently */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[9px] font-mono text-purple-400/40 uppercase tracking-widest">Server</span>
                      <div className="flex-1 h-px bg-gradient-to-l from-purple-500/25 to-transparent" />
                    </div>

                    <div className="space-y-2">
                      {TASKS.map((task, i) => {
                        const isRunning = taskIdx === i;
                        const isDone = taskIdx > i || allDone;

                        return (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.25 }}
                            className={cn(
                              "rounded-xl border px-3 py-2.5 flex items-center gap-2.5 transition-all duration-400 relative overflow-hidden",
                              isRunning ? "border-purple-500/30 bg-purple-500/5" :
                              isDone ? "border-emerald-500/15 bg-emerald-500/3" :
                              "border-border/10 bg-muted/5"
                            )}
                          >
                            <div className={cn(
                              "size-7 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300",
                              isRunning ? "bg-purple-500/15" :
                              isDone ? "bg-emerald-500/10" :
                              "bg-muted/15"
                            )}>
                              {isDone ? (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                                  <Check className="size-3.5 text-emerald-400" />
                                </motion.div>
                              ) : isRunning ? (
                                <Loader2 className="size-3.5 text-purple-400 animate-spin" />
                              ) : (
                                <task.icon className="size-3.5 text-muted-foreground/25" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-[11px] font-mono font-semibold transition-colors",
                                isRunning ? "text-purple-400" :
                                isDone ? "text-emerald-400/60" :
                                "text-muted-foreground/30"
                              )}>
                                {task.label}
                              </p>
                              <p className="text-[9px] text-muted-foreground/30 mt-0.5">
                                {task.description}
                              </p>
                            </div>

                            {/* Running progress bar */}
                            {isRunning && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5">
                                <motion.div className="h-full rounded-full"
                                  style={{ backgroundColor: task.color }}
                                  initial={{ width: "0%" }}
                                  animate={{ width: "100%" }}
                                  transition={{ duration: 1.3, ease: "easeInOut" }}
                                />
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Server-only note */}
                    <AnimatePresence>
                      {!allDone && taskIdx >= 0 && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-[9px] text-purple-400/30 font-mono mt-2 text-center italic"
                        >
                          running silently — no client connection
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* All done banner */}
                <AnimatePresence>
                  {allDone && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="mt-5 rounded-xl border border-purple-500/15 bg-purple-500/5 px-4 py-3 flex items-center gap-3"
                    >
                      <div className="size-7 rounded-full bg-purple-500/15 flex items-center justify-center shrink-0">
                        <Check className="size-3.5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-purple-400">All tasks done — client never knew</p>
                        <p className="text-[10px] text-muted-foreground/40 mt-0.5">
                          The server finished its work silently. No notification was sent to the client.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t bg-muted/10">
        <p className="text-xs text-muted-foreground/50 leading-relaxed">
          <span className="text-indigo-400 font-semibold">Key insight:</span> Background tasks are <span className="text-purple-400 font-medium">fire-and-forget</span>.
          The client gets <code className="text-[11px] bg-muted px-1 py-0.5 rounded font-mono">201</code> immediately and moves on.
          The server runs tasks silently — if you need the client to know when tasks finish, use polling or WebSockets instead.
        </p>
      </div>
    </div>
  );
}
