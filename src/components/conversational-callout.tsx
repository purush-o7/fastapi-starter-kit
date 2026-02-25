"use client";

import { motion } from "motion/react";
import {
  MessageCircleQuestion,
  Lightbulb,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CALLOUT_VARIANTS = {
  question: {
    icon: MessageCircleQuestion,
    color: "blue",
    label: "Question",
  },
  insight: {
    icon: Lightbulb,
    color: "amber",
    label: "Insight",
  },
  warning: {
    icon: AlertTriangle,
    color: "orange",
    label: "Watch out",
  },
  story: {
    icon: BookOpen,
    color: "purple",
    label: "Real-world",
  },
} as const;

interface ConversationalCalloutProps {
  type: "question" | "insight" | "warning" | "story";
  children: React.ReactNode;
  className?: string;
}

export function ConversationalCallout({
  type,
  children,
  className,
}: ConversationalCalloutProps) {
  const variant = CALLOUT_VARIANTS[type];
  const Icon = variant.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn(
        "rounded-lg border p-4 border-l-4",
        `bg-${variant.color}-500/[0.04] border-${variant.color}-500/20 border-l-${variant.color}-500/50`,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "size-7 rounded-md flex items-center justify-center shrink-0",
            `bg-${variant.color}-500/10`
          )}
        >
          <Icon className={cn("size-4", `text-${variant.color}-500`)} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-[11px] font-medium uppercase tracking-wider mb-1",
              `text-${variant.color}-500/70`
            )}
          >
            {variant.label}
          </p>
          <div className="text-sm text-muted-foreground leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
