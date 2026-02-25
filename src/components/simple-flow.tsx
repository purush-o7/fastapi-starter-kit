"use client";

import { motion } from "motion/react";
import { ArrowRight, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimpleFlowStep {
  label: string;
  detail?: string;
  icon?: React.ReactNode;
  status?: "success" | "error" | "neutral";
}

interface SimpleFlowProps {
  steps: SimpleFlowStep[];
  direction?: "horizontal" | "vertical";
  accentColor?: string;
  className?: string;
}

const STATUS_STYLES = {
  success: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/[0.06]",
    text: "text-emerald-500",
    dot: "bg-emerald-500",
    arrow: "text-emerald-500/50",
  },
  error: {
    border: "border-red-500/30",
    bg: "bg-red-500/[0.06]",
    text: "text-red-500",
    dot: "bg-red-500",
    arrow: "text-red-500/50",
  },
  neutral: {
    border: "border-border",
    bg: "bg-muted/30",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
    arrow: "text-muted-foreground/30",
  },
};

export function SimpleFlow({
  steps,
  direction = "horizontal",
  accentColor,
  className,
}: SimpleFlowProps) {
  const isVertical = direction === "vertical";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn(
        "flex gap-0 items-stretch overflow-x-auto py-2",
        isVertical ? "flex-col" : "flex-col sm:flex-row sm:items-center",
        className
      )}
    >
      {steps.map((step, index) => {
        const status = step.status || "neutral";
        const styles = STATUS_STYLES[status];

        return (
          <div
            key={index}
            className={cn(
              "flex items-center",
              isVertical ? "flex-col" : "flex-col sm:flex-row"
            )}
          >
            {/* Step node */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className={cn(
                "rounded-lg border-2 p-3 min-w-[100px] text-center flex-shrink-0",
                accentColor && status === "neutral"
                  ? `border-${accentColor}-500/30 bg-${accentColor}-500/[0.06]`
                  : `${styles.border} ${styles.bg}`
              )}
            >
              {step.icon && (
                <div className="flex justify-center mb-1.5">{step.icon}</div>
              )}
              <p
                className={cn(
                  "text-xs font-semibold",
                  accentColor && status === "neutral"
                    ? `text-${accentColor}-500`
                    : styles.text === "text-muted-foreground"
                    ? "text-foreground"
                    : styles.text
                )}
              >
                {step.label}
              </p>
              {step.detail && (
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {step.detail}
                </p>
              )}
            </motion.div>

            {/* Arrow connector */}
            {index < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.15 }}
                className={cn(
                  "flex items-center justify-center shrink-0",
                  isVertical ? "py-1" : "py-1 sm:px-1 sm:py-0"
                )}
              >
                {isVertical ? (
                  <ArrowDown
                    className={cn("size-4", styles.arrow)}
                  />
                ) : (
                  <>
                    <ArrowDown
                      className={cn("size-4 sm:hidden", styles.arrow)}
                    />
                    <ArrowRight
                      className={cn("size-4 hidden sm:block", styles.arrow)}
                    />
                  </>
                )}
              </motion.div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}
