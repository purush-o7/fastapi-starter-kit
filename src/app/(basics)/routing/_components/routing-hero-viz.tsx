"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface RouteExample {
  method: string;
  url: string;
  matchedPath: string;
  handler: string;
  params: string;
  response: string;
  methodColor: string;
}

const ROUTES: RouteExample[] = [
  {
    method: "GET",
    url: "/",
    matchedPath: '  "/"',
    handler: "root()",
    params: "",
    response: '{"message": "Hello World"}',
    methodColor: "text-emerald-400",
  },
  {
    method: "GET",
    url: "/items?skip=0&limit=10",
    matchedPath: '  "/items"',
    handler: "read_items(skip=0, limit=10)",
    params: "skip=0, limit=10",
    response: '[{"id": 1, "name": "Widget"}]',
    methodColor: "text-emerald-400",
  },
  {
    method: "GET",
    url: "/items/42",
    matchedPath: '  "/items/{item_id}"',
    handler: "get_item(item_id=42)",
    params: "item_id=42",
    response: '{"item_id": 42, "name": "Widget"}',
    methodColor: "text-emerald-400",
  },
  {
    method: "POST",
    url: "/items",
    matchedPath: '  "/items"',
    handler: "create_item(item=Item(...))",
    params: "body: Item",
    response: '{"id": 4, "name": "New Item"}',
    methodColor: "text-blue-400",
  },
  {
    method: "DELETE",
    url: "/items/42",
    matchedPath: '  "/items/{item_id}"',
    handler: "delete_item(item_id=42)",
    params: "item_id=42",
    response: '{"deleted": true}',
    methodColor: "text-red-400",
  },
];

const PATH_PATTERNS = ['"/"', '"/items"', '"/items/{item_id}"'];

export function RoutingHeroViz() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"request" | "matching" | "response">("request");

  const route = ROUTES[currentIndex];

  const runCycle = useCallback(() => {
    setPhase("request");
    setTimeout(() => setPhase("matching"), 800);
    setTimeout(() => setPhase("response"), 1800);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % ROUTES.length);
    }, 3500);
  }, []);

  useEffect(() => {
    runCycle();
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full rounded-xl border bg-card/50 p-5 sm:p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="size-2 rounded-full bg-teal-500 animate-pulse" />
          URL Routing — Live
        </h3>
        <div className="flex gap-1">
          {ROUTES.map((_, i) => (
            <div
              key={i}
              className={cn(
                "size-1.5 rounded-full transition-colors",
                i === currentIndex ? "bg-teal-500" : "bg-border"
              )}
            />
          ))}
        </div>
      </div>

      {/* Main visualization */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-center min-h-[160px]">
        {/* Request side */}
        <div className="flex flex-col items-end gap-3">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`req-${currentIndex}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <div className="text-[10px] text-muted-foreground mb-1.5 text-right">
                Client Request
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 font-mono text-xs">
                <span className={cn("font-bold", route.methodColor)}>
                  {route.method}
                </span>{" "}
                <span className="text-foreground">{route.url}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Router gateway */}
        <div className="flex flex-col items-center gap-2">
          {/* Arrow in */}
          <motion.div
            animate={{
              opacity: phase === "request" ? [0.3, 1, 0.3] : 0.2,
            }}
            transition={
              phase === "request"
                ? { duration: 0.8, repeat: Infinity }
                : { duration: 0.3 }
            }
            className="text-teal-500 text-lg"
          >
            {"\u2192"}
          </motion.div>

          {/* Path patterns */}
          <div className="rounded-lg border-2 border-teal-500/30 bg-teal-500/5 px-3 py-2.5 space-y-1">
            <div className="text-[9px] text-teal-500 font-semibold uppercase tracking-wider text-center mb-1.5">
              FastAPI Router
            </div>
            {PATH_PATTERNS.map((pattern) => {
              const isMatch =
                phase !== "request" && route.matchedPath.trim() === pattern;
              return (
                <motion.div
                  key={pattern}
                  animate={{
                    backgroundColor: isMatch
                      ? "rgba(20, 184, 166, 0.15)"
                      : "rgba(0, 0, 0, 0)",
                    borderColor: isMatch
                      ? "rgba(20, 184, 166, 0.4)"
                      : "rgba(128, 128, 128, 0.15)",
                  }}
                  transition={{ duration: 0.3 }}
                  className="rounded px-2 py-0.5 border font-mono text-[11px]"
                >
                  <span
                    className={cn(
                      "transition-colors duration-300",
                      isMatch ? "text-teal-400 font-semibold" : "text-muted-foreground/50"
                    )}
                  >
                    {pattern}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Arrow out */}
          <motion.div
            animate={{
              opacity: phase === "response" ? [0.3, 1, 0.3] : 0.2,
            }}
            transition={
              phase === "response"
                ? { duration: 0.8, repeat: Infinity }
                : { duration: 0.3 }
            }
            className="text-emerald-500 text-lg"
          >
            {"\u2192"}
          </motion.div>
        </div>

        {/* Response side */}
        <div className="flex flex-col items-start gap-3">
          <AnimatePresence mode="popLayout">
            {phase === "response" ? (
              <motion.div
                key={`res-${currentIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="text-[10px] text-muted-foreground mb-1.5">
                  Handler: <span className="text-teal-400 font-mono">{route.handler}</span>
                </div>
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 font-mono text-xs text-emerald-400">
                  {route.response}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                className="w-full"
              >
                <div className="text-[10px] text-muted-foreground mb-1.5">
                  Response
                </div>
                <div className="rounded-lg border border-dashed border-border/50 p-3 text-xs text-muted-foreground/30 font-mono">
                  waiting...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Extracted params */}
      <AnimatePresence>
        {phase !== "request" && route.params && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-muted-foreground">Extracted params:</span>
              <code className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 font-mono">
                {route.params}
              </code>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
