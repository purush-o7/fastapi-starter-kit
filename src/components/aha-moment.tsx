"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lightbulb, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

interface AhaMomentProps {
  setup: string;
  reveal: string;
  icon?: React.ReactNode;
  className?: string;
}

export function AhaMoment({ setup, reveal, icon, className }: AhaMomentProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn(
        "rounded-xl border-2 overflow-hidden transition-colors duration-300",
        revealed
          ? "border-amber-500/40 bg-amber-500/[0.06]"
          : "border-amber-500/20 bg-amber-500/[0.03]",
        className
      )}
    >
      {/* Setup / question */}
      <button
        onClick={() => {
          if (!revealed) trackEvent("aha_moment_revealed", { setup: setup.slice(0, 80) });
          setRevealed(!revealed);
        }}
        className="flex items-start gap-3 w-full p-5 text-left cursor-pointer group"
      >
        <div className="size-9 rounded-lg flex items-center justify-center shrink-0 bg-amber-500/10 mt-0.5">
          {icon || <Lightbulb className="size-5 text-amber-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-relaxed">{setup}</p>
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
            <ChevronRight
              className={cn(
                "size-3 transition-transform duration-200",
                revealed && "rotate-90"
              )}
            />
            {revealed ? "Got it!" : "Click to reveal the insight"}
          </p>
        </div>
      </button>

      {/* Reveal */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { type: "spring", stiffness: 300, damping: 25 },
              opacity: { duration: 0.2 },
            }}
          >
            <div className="px-5 pb-5 pt-0">
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  {reveal}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
