"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, RotateCcw, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: number;
  name: string;
  state: "running" | "awaiting" | "complete";
  color: string;
  progress: number;
}

const TASK_NAMES = [
  "fetch_user",
  "query_db",
  "send_email",
  "read_file",
  "call_api",
  "write_log",
];

const TASK_COLORS = [
  "bg-indigo-400",
  "bg-blue-400",
  "bg-cyan-400",
  "bg-teal-400",
  "bg-violet-400",
  "bg-sky-400",
];

export function EventLoopSim() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nextId, setNextId] = useState(1);

  const addTask = useCallback(() => {
    if (tasks.length >= 6) return;

    const newTask: Task = {
      id: nextId,
      name: TASK_NAMES[(nextId - 1) % TASK_NAMES.length],
      state: "running",
      color: TASK_COLORS[(nextId - 1) % TASK_COLORS.length],
      progress: 0,
    };

    setTasks((prev) => [...prev, newTask]);
    setNextId((n) => n + 1);

    // Simulate lifecycle: running -> awaiting -> complete
    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) => (t.id === newTask.id ? { ...t, state: "awaiting" as const, progress: 40 } : t))
      );
    }, 800);

    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) => (t.id === newTask.id ? { ...t, state: "running" as const, progress: 70 } : t))
      );
    }, 2000);

    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === newTask.id ? { ...t, state: "complete" as const, progress: 100 } : t
        )
      );
    }, 3000);
  }, [tasks.length, nextId]);

  const reset = useCallback(() => {
    setTasks([]);
    setNextId(1);
  }, []);

  const runningCount = tasks.filter((t) => t.state === "running").length;
  const awaitingCount = tasks.filter((t) => t.state === "awaiting").length;
  const completeCount = tasks.filter((t) => t.state === "complete").length;

  return (
    <div className="w-full rounded-xl border bg-card/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CircleDot className="size-4 text-indigo-500" />
          <h3 className="text-sm font-semibold">Event Loop Simulator</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
          </button>
          <button
            onClick={addTask}
            disabled={tasks.length >= 6}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer",
              tasks.length >= 6
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20"
            )}
          >
            <Plus className="size-3" />
            Add Task
          </button>
        </div>
      </div>

      {/* Event Loop Ring */}
      <div className="relative flex items-center justify-center h-[200px] mb-4">
        {/* Central loop indicator */}
        <motion.div
          className="absolute size-20 rounded-full border-2 border-dashed border-indigo-500/30"
          animate={
            runningCount > 0 || awaitingCount > 0
              ? { rotate: 360 }
              : {}
          }
          transition={
            runningCount > 0 || awaitingCount > 0
              ? { duration: 3, repeat: Infinity, ease: "linear" }
              : {}
          }
        />
        <div className="absolute flex flex-col items-center gap-0.5 z-10">
          <span className="text-[10px] font-mono text-indigo-500 font-bold">
            Event Loop
          </span>
          <span className="text-[9px] text-muted-foreground">
            {runningCount > 0 ? "processing..." : awaitingCount > 0 ? "waiting I/O" : "idle"}
          </span>
        </div>

        {/* Task pills orbiting */}
        <AnimatePresence>
          {tasks.map((task, index) => {
            const angle = (index / Math.max(tasks.length, 1)) * 360;
            const radius = 80;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;

            return (
              <motion.div
                key={task.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: task.state === "awaiting" ? 0.5 : 1,
                  x,
                  y,
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
                className="absolute"
              >
                <div
                  className={cn(
                    "px-2.5 py-1 rounded-lg border text-[10px] font-mono font-medium whitespace-nowrap flex items-center gap-1.5",
                    task.state === "running" &&
                      "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
                    task.state === "awaiting" &&
                      "bg-amber-500/10 border-amber-500/30 text-amber-400",
                    task.state === "complete" &&
                      "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  )}
                >
                  <div
                    className={cn(
                      "size-1.5 rounded-full",
                      task.state === "running" && "bg-indigo-400 animate-pulse",
                      task.state === "awaiting" && "bg-amber-400",
                      task.state === "complete" && "bg-emerald-400"
                    )}
                  />
                  {task.name}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-muted-foreground">
            Running ({runningCount})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-amber-400" />
          <span className="text-muted-foreground">
            Awaiting I/O ({awaitingCount})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-emerald-400" />
          <span className="text-muted-foreground">
            Complete ({completeCount})
          </span>
        </div>
      </div>

      {tasks.length === 0 && (
        <p className="text-center text-xs text-muted-foreground/50 mt-2">
          Click &quot;Add Task&quot; to see how the event loop juggles concurrent tasks
        </p>
      )}
    </div>
  );
}
