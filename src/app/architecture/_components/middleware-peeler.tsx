"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, ChevronUp, Shield, FileText, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface MiddlewareLayer {
  id: string;
  name: string;
  subtitle: string;
  icon: typeof Shield;
  color: string;
  bgColor: string;
  borderColor: string;
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
    borderColor: "border-purple-500/30",
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
    borderColor: "border-violet-500/30",
    details: [
      "start_time = time.time()",
      "logger.info(f\"{method} {path}\")",
      "duration = time.time() - start_time",
    ],
  },
  {
    id: "endpoint",
    name: "Your Endpoint",
    subtitle: "The Core Handler",
    icon: Zap,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
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
    <div className="w-full rounded-xl border bg-card/50 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-purple-500" />
          <h3 className="text-sm font-semibold">Middleware Layer Peeler</h3>
        </div>
        <div className="flex items-center gap-2">
          {peelCount > 0 && (
            <button
              onClick={reset}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
            </button>
          )}
          <button
            onClick={peelNext}
            disabled={allPeeled}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer",
              allPeeled
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
            )}
          >
            <ChevronUp className="size-3" />
            Peel Layer
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Requests pass through each middleware layer before reaching your endpoint.
        Peel them away to see what each layer does.
      </p>

      {/* Stack of cards */}
      <div
        className="relative"
        style={{ minHeight: "220px", perspective: "800px" }}
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
                    "absolute left-0 right-0 rounded-lg border p-4",
                    layer.borderColor,
                    layer.bgColor
                  )}
                  style={{
                    zIndex: LAYERS.length - index,
                    transformOrigin: "top center",
                  }}
                  initial={false}
                  animate={{
                    y: visibleIndex * 8,
                    scale: 1 - visibleIndex * 0.02,
                    opacity: 1,
                    rotateX: 0,
                  }}
                  exit={{
                    y: -120,
                    opacity: 0,
                    rotateX: -15,
                    scale: 0.95,
                    transition: {
                      duration: 0.5,
                      ease: [0.4, 0, 0.2, 1],
                    },
                  }}
                  transition={{
                    layout: {
                      duration: 0.4,
                      ease: [0.4, 0, 0.2, 1],
                    },
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "size-8 rounded-lg flex items-center justify-center shrink-0",
                        layer.bgColor
                      )}
                    >
                      <LayerIcon className={cn("size-4", layer.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            layer.color
                          )}
                        >
                          {layer.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {layer.subtitle}
                        </span>
                      </div>
                      <div className="space-y-1 mt-2">
                        {layer.details.map((detail, i) => (
                          <div
                            key={i}
                            className="text-[10px] font-mono text-muted-foreground bg-muted/40 rounded px-2 py-1 border border-border/50 truncate"
                          >
                            {detail}
                          </div>
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
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.2,
                  }}
                  className="inline-flex items-center justify-center size-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-3"
                >
                  <Zap className="size-5 text-emerald-400" />
                </motion.div>
                <p className="text-sm font-medium text-foreground mb-1">
                  All layers peeled!
                </p>
                <p className="text-xs text-muted-foreground max-w-[250px]">
                  Requests flow through CORS, then logging, before finally
                  reaching your endpoint handler.
                </p>
                <button
                  onClick={reset}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors cursor-pointer"
                >
                  <RotateCcw className="size-3" />
                  Re-stack
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
        <div className="flex items-center gap-2">
          {LAYERS.map((layer) => (
            <div
              key={layer.id}
              className={cn(
                "size-2 rounded-full transition-colors duration-300",
                peeledIds.has(layer.id)
                  ? "bg-purple-500/30"
                  : "bg-purple-500"
              )}
            />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          {allPeeled
            ? "All layers revealed"
            : `Next: ${nextLayerName}`}
        </span>
      </div>
    </div>
  );
}
