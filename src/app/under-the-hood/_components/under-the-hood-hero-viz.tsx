"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";

const layers = [
  { id: "client", label: "Client", sublabel: "Browser / curl / httpx", color: "bg-zinc-500/15 border-zinc-500/30 text-zinc-600 dark:text-zinc-300" },
  { id: "uvicorn", label: "Uvicorn", sublabel: "ASGI Server", color: "bg-green-500/15 border-green-500/30 text-green-600 dark:text-green-300" },
  { id: "eventloop", label: "Event Loop", sublabel: "asyncio", color: "bg-lime-500/15 border-lime-500/30 text-lime-600 dark:text-lime-300" },
  { id: "fastapi", label: "FastAPI", sublabel: "Routing + Validation", color: "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-300" },
  { id: "handler", label: "Your Handler", sublabel: "async def get_users()", color: "bg-teal-500/15 border-teal-500/30 text-teal-600 dark:text-teal-300" },
  { id: "response", label: "Response", sublabel: "JSON → Client", color: "bg-zinc-500/15 border-zinc-500/30 text-zinc-600 dark:text-zinc-300" },
];

const annotations: Record<string, string> = {
  client: "Sends HTTP request",
  uvicorn: "Receives connection, parses HTTP",
  eventloop: "Schedules coroutine",
  fastapi: "Matches route, validates data",
  handler: "Runs your async function",
  response: "Serializes & sends back",
};

export function UnderTheHoodHeroViz() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % layers.length);
    }, 1600);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div
      className="rounded-xl border bg-card p-4 sm:p-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Inside the Server — Request Flow
      </p>
      <div className="space-y-2">
        {layers.map((layer, i) => {
          const isActive = i === activeIndex;
          const isPast = i < activeIndex;

          return (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="relative"
              onClick={() => { setActiveIndex(i); setIsPaused(true); }}
            >
              <motion.div
                className={`relative rounded-lg border px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-colors ${layer.color}`}
                animate={{
                  scale: isActive ? 1.02 : 1,
                  borderColor: isActive ? "rgba(132, 204, 22, 0.5)" : undefined,
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Traveling dot */}
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 size-3 rounded-full bg-lime-500 shadow-lg shadow-lime-500/50"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.4 }}
                  />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{layer.label}</p>
                    <p className="text-[10px] text-muted-foreground hidden sm:block">
                      {layer.sublabel}
                    </p>
                  </div>
                </div>

                {/* Annotation on active */}
                {isActive && (
                  <motion.p
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs font-medium text-lime-600 dark:text-lime-400 whitespace-nowrap"
                  >
                    {annotations[layer.id]}
                  </motion.p>
                )}

                {/* Checkmark for past layers */}
                {isPast && (
                  <span className="text-xs text-emerald-500">✓</span>
                )}
              </motion.div>

              {/* Connector arrow */}
              {i < layers.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <motion.div
                    className="w-px h-2"
                    animate={{
                      backgroundColor:
                        i < activeIndex
                          ? "rgba(132, 204, 22, 0.5)"
                          : "rgba(128, 128, 128, 0.2)",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Click any layer to inspect it. Hover to pause the animation.
      </p>
    </div>
  );
}
