"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatYouJustLearnedProps {
  points: string[];
  section?: string;
  className?: string;
}

export function WhatYouJustLearned({
  points,
  section,
  className,
}: WhatYouJustLearnedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn(
        "rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-4",
        className
      )}
    >
      {section && (
        <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-500/70 mb-2.5">
          {section}
        </p>
      )}
      <p className="text-xs font-semibold text-emerald-500 mb-2">
        What you just learned
      </p>
      <div className="space-y-2">
        {points.map((point, index) => (
          <motion.div
            key={point}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.3,
              delay: index * 0.08,
              ease: "easeOut",
            }}
            className="flex items-start gap-2"
          >
            <div className="size-4 rounded-full flex items-center justify-center shrink-0 bg-emerald-500/15 mt-0.5">
              <Check className="size-2.5 text-emerald-500" />
            </div>
            <p className="text-sm text-muted-foreground leading-snug">
              {point}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
