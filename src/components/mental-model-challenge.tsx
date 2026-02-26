"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, Check, X, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

interface ChallengeOption {
  label: string;
  correct: boolean;
  explanation: string;
}

interface MentalModelChallengeProps {
  question: string;
  options?: ChallengeOption[];
  hint?: string;
  answer: string;
  className?: string;
}

export function MentalModelChallenge({
  question,
  options,
  hint,
  answer,
  className,
}: MentalModelChallengeProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    setRevealed(true);
    trackEvent("challenge_answer_revealed", { question: question.slice(0, 80) });
  };

  const handleSelect = (index: number) => {
    if (revealed) return;
    setSelected(index);
    trackEvent("challenge_option_selected", { question: question.slice(0, 80), option_index: index });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn(
        "rounded-xl border-2 border-dashed border-indigo-500/30 bg-indigo-500/[0.03] p-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="size-9 rounded-lg flex items-center justify-center bg-indigo-500/10">
          <Brain className="size-5 text-indigo-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-indigo-400">
            Think about it...
          </p>
        </div>
      </div>

      {/* Question */}
      <p className="text-base font-medium mb-4 leading-relaxed">{question}</p>

      {/* Hint */}
      {hint && !revealed && (
        <p className="text-xs text-muted-foreground italic mb-4">
          Hint: {hint}
        </p>
      )}

      {/* Options (if provided) */}
      {options && (
        <div className="space-y-2 mb-4">
          {options.map((option, index) => {
            const isSelected = selected === index;
            const showResult = revealed;

            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={revealed}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-all duration-200",
                  !showResult && isSelected
                    ? "border-indigo-500/50 bg-indigo-500/10"
                    : !showResult
                    ? "border-border/50 bg-background/50 hover:border-indigo-500/30 hover:bg-indigo-500/5 cursor-pointer"
                    : option.correct
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : isSelected && !option.correct
                    ? "border-red-500/50 bg-red-500/10"
                    : "border-border/30 bg-background/30 opacity-50"
                )}
              >
                <div
                  className={cn(
                    "size-5 rounded-full flex items-center justify-center shrink-0 border-2",
                    !showResult && isSelected
                      ? "border-indigo-500 bg-indigo-500/20"
                      : !showResult
                      ? "border-border"
                      : option.correct
                      ? "border-emerald-500 bg-emerald-500/20"
                      : isSelected
                      ? "border-red-500 bg-red-500/20"
                      : "border-border/50"
                  )}
                >
                  {showResult && option.correct && (
                    <Check className="size-3 text-emerald-500" />
                  )}
                  {showResult && isSelected && !option.correct && (
                    <X className="size-3 text-red-500" />
                  )}
                </div>
                <span className={cn(showResult && !option.correct && !isSelected && "text-muted-foreground")}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Reveal button */}
      {!revealed && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReveal}
          className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
        >
          <Eye className="size-3.5 mr-1.5" />
          {options ? "Check Answer" : "Reveal Answer"}
        </Button>
      )}

      {/* Answer reveal */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{
              height: { type: "spring", stiffness: 300, damping: 25 },
              opacity: { duration: 0.2, delay: 0.1 },
            }}
          >
            <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-4 mt-3">
              <p className="text-sm text-foreground leading-relaxed">
                {answer}
              </p>
              {/* Show selected option's explanation if options exist */}
              {options && selected !== null && (
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-indigo-500/10">
                  {options[selected].explanation}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
