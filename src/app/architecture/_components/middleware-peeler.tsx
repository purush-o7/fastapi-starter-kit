"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, ChevronUp, Shield, FileText, Lock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface MiddlewareLayer {
  id: string;
  name: string;
  subtitle: string;
  icon: typeof Shield;
  color: string;
  bgColor: string;
  borderColor: string;
  accentColor: string;
  ringStroke: string;
  details: string[];
}

const LAYERS: MiddlewareLayer[] = [
  {
    id: "cors",
    name: "CORSMiddleware",
    subtitle: "Cross-Origin Resource Sharing",
    icon: Shield,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/25",
    accentColor: "bg-purple-500",
    ringStroke: "rgba(168,85,247,0.15)",
    details: [
      'allow_origins=["https://myapp.com"]',
      "allow_methods=[\"GET\", \"POST\"]",
      "allow_credentials=True",
    ],
  },
  {
    id: "logging",
    name: "LoggingMiddleware",
    subtitle: "Custom Request Logging",
    icon: FileText,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/25",
    accentColor: "bg-violet-500",
    ringStroke: "rgba(139,92,246,0.15)",
    details: [
      "start_time = time.perf_counter()",
      "logger.info(f\"{method} {path}\")",
      "duration = time.perf_counter() - start_time",
    ],
  },
  {
    id: "auth",
    name: "AuthMiddleware",
    subtitle: "Token Validation",
    icon: Lock,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/25",
    accentColor: "bg-amber-500",
    ringStroke: "rgba(245,158,11,0.15)",
    details: [
      'token = request.headers["Authorization"]',
      "if not token: return 401",
      "user = verify_jwt(token)",
    ],
  },
  {
    id: "endpoint",
    name: "Your Endpoint",
    subtitle: "The Core Handler",
    icon: Zap,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/25",
    accentColor: "bg-emerald-500",
    ringStroke: "rgba(16,185,129,0.18)",
    details: [
      "async def get_items(db: Session):",
      '    return {"items": items}',
    ],
  },
];

export function MiddlewarePeeler() {
  const [peeledIds, setPeeledIds] = useState<Set<string>>(new Set());

  const peelNext = useCallback(() => {
    const nextLayer = LAYERS.find((l) => !peeledIds.has(l.id));
    if (nextLayer) {
      setPeeledIds((prev) => new Set([...prev, nextLayer.id]));
    }
  }, [peeledIds]);

  const reset = useCallback(() => {
    setPeeledIds(new Set());
  }, []);

  const allPeeled = peeledIds.size >= LAYERS.length;
  const peelCount = peeledIds.size;
  const nextLayerName = LAYERS.find((l) => !peeledIds.has(l.id))?.name;

  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            {/* Concentric dots indicator */}
            <div className={cn(
              "size-2 rounded-full transition-colors duration-500",
              allPeeled ? "bg-emerald-400" : "bg-purple-400"
            )} />
            <motion.div
              className={cn(
                "absolute inset-0 rounded-full border",
                allPeeled ? "border-emerald-400/30" : "border-purple-400/30"
              )}
              animate={{ scale: [1, 2], opacity: [0.4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <span className="text-xs font-semibold tracking-wide">Middleware Layers</span>
          <span className="text-[9px] font-mono text-muted-foreground/40">
            {peelCount}/{LAYERS.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {peelCount > 0 && (
            <button
              onClick={reset}
              className="text-muted-foreground/40 hover:text-foreground transition-colors p-1 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
            </button>
          )}
          <button
            onClick={peelNext}
            disabled={allPeeled}
            className={cn(
              "inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer",
              allPeeled
                ? "bg-muted/50 text-muted-foreground/30 cursor-not-allowed"
                : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/15"
            )}
          >
            <ChevronUp className="size-3" />
            Peel
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="relative p-5 sm:p-6">
        {/* Decorative concentric rings — very subtle, behind everything */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07]"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 400 280"
        >
          {LAYERS.map((layer, i) => {
            const isPeeled = peeledIds.has(layer.id);
            const rx = 60 + i * 40;
            const ry = 40 + i * 28;
            return (
              <motion.ellipse
                key={layer.id}
                cx="200"
                cy="140"
                rx={rx}
                ry={ry}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="3 10"
                animate={{
                  opacity: isPeeled ? 0.1 : 0.4 - i * 0.08,
                  rx: isPeeled ? rx + 30 : rx,
                  ry: isPeeled ? ry + 20 : ry,
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            );
          })}
        </svg>

        {/* Description */}
        <p className="text-xs text-muted-foreground/60 mb-5 relative">
          Requests pass through each middleware layer before reaching your endpoint.
          Peel them away to see what each layer does.
        </p>

        {/* Stack of cards */}
        <div
          className="relative"
          style={{ minHeight: "240px", perspective: "1000px" }}
        >
          {LAYERS.map((layer, index) => {
            const isPeeled = peeledIds.has(layer.id);
            const visibleIndex = LAYERS.slice(0, index).filter(
              (l) => !peeledIds.has(l.id)
            ).length;
            const LayerIcon = layer.icon;

            return (
              <AnimatePresence key={layer.id}>
                {!isPeeled ? (
                  <motion.div
                    layout
                    className={cn(
                      "absolute left-0 right-0 rounded-xl border overflow-hidden bg-card",
                      layer.borderColor
                    )}
                    style={{
                      zIndex: LAYERS.length - index,
                      transformOrigin: "top center",
                    }}
                    initial={false}
                    animate={{
                      y: visibleIndex * 10,
                      scale: 1 - visibleIndex * 0.018,
                      opacity: 1,
                      rotateX: 0,
                      filter: `blur(${visibleIndex > 0 ? visibleIndex * 0.3 : 0}px)`,
                    }}
                    exit={{
                      y: -150,
                      opacity: 0,
                      rotateX: -20,
                      scale: 0.92,
                      filter: "blur(4px)",
                      transition: {
                        duration: 0.55,
                        ease: [0.4, 0, 0.2, 1],
                      },
                    }}
                    transition={{
                      layout: {
                        duration: 0.45,
                        ease: [0.4, 0, 0.2, 1],
                      },
                    }}
                  >
                    {/* Accent strip on left */}
                    <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-xl", layer.accentColor, "opacity-30")} />

                    <div className="flex items-start gap-3 p-4 pl-5">
                      <div
                        className={cn(
                          "size-9 rounded-lg flex items-center justify-center shrink-0 border",
                          layer.bgColor, layer.borderColor
                        )}
                      >
                        <LayerIcon className={cn("size-4", layer.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("text-sm font-semibold tracking-tight", layer.color)}>
                            {layer.name}
                          </span>
                          <span className="text-[9px] text-muted-foreground/40 font-mono">
                            {layer.subtitle}
                          </span>
                        </div>
                        <div className="space-y-1 mt-2">
                          {layer.details.map((detail, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
                              className="text-[10px] font-mono text-muted-foreground/70 bg-muted/30 rounded-md px-2.5 py-1.5 border border-border/30 truncate"
                            >
                              {detail}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            );
          })}

          {/* All peeled state */}
          <AnimatePresence>
            {allPeeled && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <div className="text-center">
                  {/* Animated endpoint icon with glow */}
                  <div className="relative inline-flex mb-4">
                    <motion.div
                      className="absolute inset-0 rounded-2xl border border-emerald-500/20"
                      animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-2xl border border-emerald-500/15"
                      animate={{ scale: [1, 1.7], opacity: [0.2, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut", delay: 0.2 }}
                    />
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 }}
                      className="relative size-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center"
                      style={{ boxShadow: "0 0 40px 10px rgba(16,185,129,0.1)" }}
                    >
                      <Zap className="size-6 text-emerald-400" />
                    </motion.div>
                  </div>

                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="text-sm font-semibold text-foreground mb-1.5"
                  >
                    All layers peeled!
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="text-xs text-muted-foreground/60 max-w-[280px] leading-relaxed"
                  >
                    Requests flow through CORS, logging, and auth before reaching your endpoint handler.
                  </motion.p>

                  {/* Mini flow diagram */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-mono text-muted-foreground/40"
                  >
                    {LAYERS.map((layer, i) => (
                      <span key={layer.id} className="flex items-center gap-1.5">
                        <span className={cn("px-1.5 py-0.5 rounded border", layer.borderColor, layer.bgColor, layer.color)}>
                          {layer.name.replace("Middleware", "").replace("Your ", "")}
                        </span>
                        {i < LAYERS.length - 1 && <span className="text-muted-foreground/20">→</span>}
                      </span>
                    ))}
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.65 }}
                    onClick={reset}
                    className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-medium px-3.5 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/15 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="size-3" />
                    Re-stack
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border/30 bg-muted/8">
        <div className="flex items-center gap-1.5">
          {LAYERS.map((layer, i) => (
            <motion.div
              key={layer.id}
              className={cn("size-1.5 rounded-full transition-all duration-500")}
              animate={{
                backgroundColor: peeledIds.has(layer.id) ? "rgba(168,85,247,0.15)" : "rgb(168,85,247)",
                scale: !peeledIds.has(layer.id) && i === peelCount ? [1, 1.3, 1] : 1,
              }}
              transition={{ scale: { repeat: Infinity, duration: 1.2 } }}
            />
          ))}
        </div>
        <span className="text-[9px] text-muted-foreground/40 font-mono tracking-wide">
          {allPeeled
            ? "All layers revealed"
            : `Next → ${nextLayerName}`}
        </span>
      </div>
    </div>
  );
}
