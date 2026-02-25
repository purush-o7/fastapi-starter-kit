"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, RotateCcw, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface Connection {
  id: number;
  state: "idle" | "active" | "releasing";
  requestId: number | null;
}

const POOL_SIZE = 5;

export function ConnectionPoolViz() {
  const [connections, setConnections] = useState<Connection[]>(
    Array.from({ length: POOL_SIZE }, (_, i) => ({
      id: i,
      state: "idle" as const,
      requestId: null,
    }))
  );
  const [queue, setQueue] = useState<number[]>([]);
  const nextReqId = useRef(1);

  const claimConnection = useCallback(() => {
    const reqId = nextReqId.current++;

    setConnections((prev) => {
      const idleIdx = prev.findIndex((c) => c.state === "idle");
      if (idleIdx === -1) {
        // Pool exhausted — queue
        setQueue((q) => [...q, reqId]);
        return prev;
      }
      const next = [...prev];
      next[idleIdx] = { ...next[idleIdx], state: "active", requestId: reqId };

      // Release after 2.5s
      setTimeout(() => {
        setConnections((p) => {
          const updated = [...p];
          const idx = updated.findIndex((c) => c.requestId === reqId);
          if (idx !== -1) {
            updated[idx] = { ...updated[idx], state: "releasing", requestId: null };
          }
          return updated;
        });

        setTimeout(() => {
          setConnections((p) => {
            const updated = [...p];
            const idx = updated.findIndex(
              (c) => c.state === "releasing" && c.requestId === null
            );
            if (idx !== -1) {
              updated[idx] = { ...updated[idx], state: "idle" };
            }
            return updated;
          });
          // Process queue
          setQueue((q) => {
            if (q.length > 0) {
              setTimeout(() => claimConnection(), 100);
              return q.slice(1);
            }
            return q;
          });
        }, 400);
      }, 2500);

      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setConnections(
      Array.from({ length: POOL_SIZE }, (_, i) => ({
        id: i,
        state: "idle" as const,
        requestId: null,
      }))
    );
    setQueue([]);
    nextReqId.current = 1;
  }, []);

  const activeCount = connections.filter((c) => c.state === "active").length;
  const isPoolFull = activeCount >= POOL_SIZE;

  return (
    <div className="w-full rounded-xl border bg-card/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="size-4 text-cyan-500" />
          <h3 className="text-sm font-semibold">Connection Pool Monitor</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
          </button>
          <button
            onClick={claimConnection}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer",
              "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20"
            )}
          >
            <Plus className="size-3" />
            New Request
          </button>
        </div>
      </div>

      {/* Pool visualization */}
      <div className="flex items-center justify-center gap-3 mb-4">
        {connections.map((conn) => (
          <motion.div
            key={conn.id}
            className={cn(
              "size-12 sm:size-14 rounded-xl border-2 flex flex-col items-center justify-center transition-colors duration-300",
              conn.state === "idle" && "border-border/50 bg-muted/20",
              conn.state === "active" && "border-cyan-500/50 bg-cyan-500/10",
              conn.state === "releasing" && "border-amber-500/50 bg-amber-500/10"
            )}
            animate={
              conn.state === "active"
                ? { scale: [1, 1.05, 1] }
                : { scale: 1 }
            }
            transition={
              conn.state === "active"
                ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.2 }
            }
          >
            <div
              className={cn(
                "size-3 rounded-full transition-colors duration-300",
                conn.state === "idle" && "bg-muted-foreground/20",
                conn.state === "active" && "bg-cyan-400 animate-pulse",
                conn.state === "releasing" && "bg-amber-400"
              )}
            />
            <span className="text-[8px] mt-1 text-muted-foreground font-mono">
              {conn.state === "idle"
                ? "idle"
                : conn.state === "active"
                ? `#${conn.requestId}`
                : "closing"}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between text-[10px] mb-3">
        <span className="text-muted-foreground">
          Pool: {activeCount}/{POOL_SIZE} connections in use
        </span>
        <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              activeCount < 3 ? "bg-cyan-500" : activeCount < POOL_SIZE ? "bg-amber-500" : "bg-red-500"
            )}
            animate={{ width: `${(activeCount / POOL_SIZE) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Queue warning */}
      <AnimatePresence>
        {(queue.length > 0 || isPoolFull) && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-center"
          >
            <p className="text-xs text-red-400 font-medium">
              Pool exhausted! {queue.length > 0 ? `${queue.length} request(s) waiting in queue` : "Next request will be queued"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              This is why <code className="text-cyan-400">finally: db.close()</code> matters
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {activeCount === 0 && queue.length === 0 && (
        <p className="text-[10px] text-muted-foreground/50 text-center">
          Click &quot;New Request&quot; to claim a connection from the pool
        </p>
      )}
    </div>
  );
}
