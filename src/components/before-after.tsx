"use client";

import { motion } from "motion/react";
import { Frown, Sparkles, Check, X, Minus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparisonItem {
  label: string;
  status: "good" | "bad" | "neutral";
  detail?: string;
}

interface ComparisonSide {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  items: ComparisonItem[];
  visual?: React.ReactNode;
  accentColor?: string;
}

interface BeforeAfterProps {
  before: ComparisonSide;
  after: ComparisonSide;
  className?: string;
}

function StatusIcon({ status }: { status: "good" | "bad" | "neutral" }) {
  if (status === "good")
    return <Check className="size-3.5 text-emerald-500" />;
  if (status === "bad") return <X className="size-3.5 text-red-500" />;
  return <Minus className="size-3.5 text-muted-foreground" />;
}

function ComparisonCard({
  side,
  type,
  delay,
}: {
  side: ComparisonSide;
  type: "before" | "after";
  delay: number;
}) {
  const isBefore = type === "before";
  const Icon = side.icon || (isBefore ? Frown : Sparkles);

  return (
    <motion.div
      initial={{ opacity: 0, x: isBefore ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={cn(
        "rounded-xl border-2 p-5 flex-1 min-w-0",
        isBefore
          ? "border-red-500/20 bg-red-500/5"
          : "border-emerald-500/20 bg-emerald-500/5"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className={cn(
            "size-9 rounded-lg flex items-center justify-center",
            isBefore ? "bg-red-500/10" : "bg-emerald-500/10"
          )}
        >
          <Icon
            className={cn(
              "size-5",
              isBefore ? "text-red-500" : "text-emerald-500"
            )}
          />
        </div>
        <div>
          <p className="text-sm font-semibold">{side.title}</p>
          <p className="text-xs text-muted-foreground">{side.subtitle}</p>
        </div>
      </div>

      {/* Optional visual slot */}
      {side.visual && <div className="mb-4">{side.visual}</div>}

      {/* Items list */}
      <div className="space-y-2.5">
        {side.items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.3,
              delay: delay + 0.1 + index * 0.08,
              ease: "easeOut",
            }}
            className="flex items-start gap-2.5"
          >
            <div
              className={cn(
                "size-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                item.status === "good"
                  ? "bg-emerald-500/10"
                  : item.status === "bad"
                  ? "bg-red-500/10"
                  : "bg-muted"
              )}
            >
              <StatusIcon status={item.status} />
            </div>
            <div>
              <p className="text-sm font-medium leading-snug">{item.label}</p>
              {item.detail && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.detail}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function BeforeAfter({ before, after, className }: BeforeAfterProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-4 items-stretch", className)}>
      <ComparisonCard side={before} type="before" delay={0} />

      {/* VS Divider */}
      <div className="flex items-center justify-center sm:flex-col">
        <div className="h-px sm:h-auto sm:w-px flex-1 bg-border" />
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
          className="size-10 rounded-full bg-muted border-2 border-border flex items-center justify-center mx-3 sm:my-3 sm:mx-0 shrink-0"
        >
          <span className="text-xs font-bold text-muted-foreground">VS</span>
        </motion.div>
        <div className="h-px sm:h-auto sm:w-px flex-1 bg-border" />
      </div>

      <ComparisonCard side={after} type="after" delay={0.2} />
    </div>
  );
}
