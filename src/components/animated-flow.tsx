"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FlowStep {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

interface AnimatedFlowProps {
  steps: FlowStep[];
  accentColor?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export function AnimatedFlow({
  steps,
  accentColor = "teal",
  autoPlay = true,
  autoPlayInterval = 2500,
  className,
}: AnimatedFlowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % steps.length);
  }, [steps.length]);

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    if (!autoPlay || isHovered) return;
    const interval = setInterval(next, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isHovered, next]);

  return (
    <div
      className={cn("w-full", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Steps row */}
      <div className="flex items-center gap-0 overflow-x-auto pb-4">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isCompleted = index < activeIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.id} className="flex items-center shrink-0">
              {/* Step node */}
              <button
                onClick={() => goTo(index)}
                className="relative flex flex-col items-center gap-2 group cursor-pointer"
              >
                <motion.div
                  className={cn(
                    "relative size-12 rounded-xl flex items-center justify-center border-2 transition-colors duration-300",
                    isActive
                      ? `border-${accentColor}-500 bg-${accentColor}-500/10`
                      : isCompleted
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-border bg-muted/30"
                  )}
                  animate={
                    isActive
                      ? {
                          boxShadow: [
                            `0 0 0 0px rgba(var(--flow-color), 0)`,
                            `0 0 20px 4px rgba(var(--flow-color), 0.15)`,
                            `0 0 0 0px rgba(var(--flow-color), 0)`,
                          ],
                        }
                      : { boxShadow: "0 0 0 0px rgba(0,0,0,0)" }
                  }
                  transition={
                    isActive
                      ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.3 }
                  }
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Check className="size-5 text-emerald-500" />
                    </motion.div>
                  ) : (
                    <StepIcon
                      className={cn(
                        "size-5 transition-colors duration-300",
                        isActive
                          ? `text-${accentColor}-500`
                          : "text-muted-foreground/50"
                      )}
                    />
                  )}
                </motion.div>

                <span
                  className={cn(
                    "text-xs font-medium text-center max-w-[80px] leading-tight transition-colors duration-300",
                    isActive
                      ? "text-foreground"
                      : isCompleted
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50"
                  )}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector arrow */}
              {index < steps.length - 1 && (
                <div className="relative w-12 sm:w-16 h-[2px] mx-1 sm:mx-2 self-start mt-6">
                  {/* Track */}
                  <div className="absolute inset-0 bg-border rounded-full" />

                  {/* Fill */}
                  <motion.div
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full",
                      isCompleted
                        ? "bg-emerald-500/60"
                        : isActive
                        ? `bg-${accentColor}-500/40`
                        : "bg-transparent"
                    )}
                    animate={{ width: isCompleted ? "100%" : isActive ? "50%" : "0%" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />

                  {/* Traveling dot */}
                  {isActive && (
                    <motion.div
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 size-2 rounded-full",
                        `bg-${accentColor}-500`
                      )}
                      animate={{ left: ["0%", "100%"] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                    />
                  )}

                  {/* Arrow head */}
                  <svg
                    className="absolute -right-1 top-1/2 -translate-y-1/2"
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                  >
                    <path
                      d="M0 0 L8 4 L0 8"
                      fill="none"
                      className={cn(
                        "transition-colors duration-300",
                        isCompleted
                          ? "stroke-emerald-500/60"
                          : isActive
                          ? `stroke-${accentColor}-500/40`
                          : "stroke-border"
                      )}
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Description panel */}
      <div className="relative min-h-[60px] mt-2">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className={cn(
              "rounded-lg border p-4",
              `bg-${accentColor}-500/5 border-${accentColor}-500/20`
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "size-8 rounded-lg flex items-center justify-center shrink-0",
                  `bg-${accentColor}-500/10`
                )}
              >
                {(() => {
                  const Icon = steps[activeIndex].icon;
                  return <Icon className={cn("size-4", `text-${accentColor}-500`)} />;
                })()}
              </div>
              <div>
                <p className="text-sm font-medium mb-0.5">
                  Step {activeIndex + 1}: {steps[activeIndex].label}
                </p>
                <p className="text-sm text-muted-foreground">
                  {steps[activeIndex].description}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={cn(
              "rounded-full transition-all duration-300 cursor-pointer",
              index === activeIndex
                ? `w-6 h-1.5 bg-${accentColor}-500`
                : index < activeIndex
                ? "w-1.5 h-1.5 bg-emerald-500/50"
                : "w-1.5 h-1.5 bg-border"
            )}
          />
        ))}
      </div>
    </div>
  );
}
