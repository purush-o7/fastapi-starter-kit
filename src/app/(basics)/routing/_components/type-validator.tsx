"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, Variable } from "lucide-react";
import { cn } from "@/lib/utils";

/*
  Interactive type validator:
  User types a value, picks a type, and instantly sees
  whether FastAPI would accept it or return 422.
*/

interface TypeDef {
  id: string;
  label: string;
  color: string;
  validate: (v: string) => boolean;
  hint: string;
  examples: { valid: string[]; invalid: string[] };
}

const TYPES: TypeDef[] = [
  {
    id: "int", label: "int", color: "#10b981",
    validate: (v) => v !== "" && /^-?\d+$/.test(v),
    hint: "Whole numbers only. No decimals, no letters.",
    examples: { valid: ["42", "0", "-7"], invalid: ["3.14", "abc", ""] },
  },
  {
    id: "float", label: "float", color: "#06b6d4",
    validate: (v) => v !== "" && !isNaN(Number(v)) && v.trim() !== "",
    hint: "Any numeric value — integers and decimals both work.",
    examples: { valid: ["3.14", "42", "-0.5"], invalid: ["abc", "12.3.4", ""] },
  },
  {
    id: "bool", label: "bool", color: "#8b5cf6",
    validate: (v) => ["true", "false", "1", "0", "yes", "no", "on", "off"].includes(v.toLowerCase()),
    hint: 'Accepts: true, false, 1, 0, yes, no, on, off',
    examples: { valid: ["true", "1", "yes"], invalid: ["maybe", "2", ""] },
  },
  {
    id: "uuid", label: "UUID", color: "#f59e0b",
    validate: (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
    hint: "Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (hex chars)",
    examples: { valid: ["550e8400-e29b-41d4-a716-446655440000"], invalid: ["not-a-uuid", "123"] },
  },
  {
    id: "date", label: "date", color: "#ec4899",
    validate: (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v)),
    hint: "ISO format: YYYY-MM-DD",
    examples: { valid: ["2024-01-15", "2023-12-31"], invalid: ["15/01/2024", "yesterday"] },
  },
  {
    id: "enum", label: "Enum", color: "#6366f1",
    validate: (v) => ["alexnet", "resnet", "lenet"].includes(v.toLowerCase()),
    hint: 'Only accepts: "alexnet", "resnet", "lenet"',
    examples: { valid: ["alexnet", "resnet"], invalid: ["vgg", "bert"] },
  },
];

export function TypeValidator() {
  const [input, setInput] = useState("42");
  const [selectedType, setSelectedType] = useState("int");

  const typeDef = TYPES.find((t) => t.id === selectedType)!;
  const isValid = useMemo(() => typeDef.validate(input), [input, typeDef]);
  const isEmpty = input.trim() === "";

  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      <div className="px-5 py-3.5 border-b bg-muted/20 flex items-center gap-2.5">
        <Variable className="size-4 text-teal-400" />
        <span className="text-sm font-semibold tracking-wide">Type Validator — Try It</span>
      </div>

      {/* Type selector */}
      <div className="px-5 py-3 border-b border-border/20 bg-muted/5 flex items-center gap-1.5 overflow-x-auto">
        {TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedType(t.id)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer relative",
              selectedType === t.id ? "text-foreground" : "text-muted-foreground/35 hover:text-muted-foreground/60"
            )}
          >
            {selectedType === t.id && (
              <motion.div
                layoutId="type-tab"
                className="absolute inset-0 rounded-lg border"
                style={{ backgroundColor: `${t.color}10`, borderColor: `${t.color}25` }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4">
        {/* Input */}
        <div>
          <p className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest mb-2">
            Enter a value for <span style={{ color: typeDef.color }}>{typeDef.label}</span>
          </p>
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a value..."
              className={cn(
                "w-full rounded-xl border-2 bg-muted/10 px-4 py-3 text-sm font-mono outline-none transition-colors duration-300",
                isEmpty ? "border-border/20 focus:border-border/40" :
                isValid ? "border-emerald-500/30 focus:border-emerald-500/50" :
                "border-red-500/30 focus:border-red-500/50"
              )}
              spellCheck={false}
            />
            {/* Result indicator */}
            <AnimatePresence>
              {!isEmpty && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 size-7 rounded-full flex items-center justify-center",
                    isValid ? "bg-emerald-500/15" : "bg-red-500/15"
                  )}
                >
                  {isValid ? <Check className="size-4 text-emerald-400" /> : <X className="size-4 text-red-400" />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Result message */}
        <AnimatePresence mode="wait">
          {!isEmpty && (
            <motion.div
              key={`${isValid}-${selectedType}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className={cn(
                "rounded-xl border px-4 py-3",
                isValid ? "border-emerald-500/15 bg-emerald-500/5" : "border-red-500/15 bg-red-500/5"
              )}
            >
              <p className={cn("text-sm font-semibold", isValid ? "text-emerald-400" : "text-red-400")}>
                {isValid ? `✓ Valid ${typeDef.label}` : `✗ 422 Validation Error`}
              </p>
              <p className="text-xs text-muted-foreground/50 mt-1">
                {isValid
                  ? <><code className="font-mono" style={{ color: typeDef.color }}>&quot;{input}&quot;</code> → parsed as <code className="font-mono" style={{ color: typeDef.color }}>{typeDef.label}</code> successfully</>
                  : <><code className="font-mono text-red-400/70">&quot;{input}&quot;</code> is not a valid <code className="font-mono">{typeDef.label}</code>. {typeDef.hint}</>
                }
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick try buttons */}
        <div>
          <p className="text-[10px] font-mono text-muted-foreground/25 uppercase tracking-widest mb-2">Quick try</p>
          <div className="flex flex-wrap gap-1.5">
            {[...typeDef.examples.valid, ...typeDef.examples.invalid].map((ex) => {
              const valid = typeDef.validate(ex);
              return (
                <button
                  key={ex}
                  onClick={() => setInput(ex)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border",
                    valid
                      ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400/70 hover:bg-emerald-500/10"
                      : "border-red-500/20 bg-red-500/5 text-red-400/70 hover:bg-red-500/10"
                  )}
                >
                  {ex}
                </button>
              );
            })}
          </div>
        </div>

        {/* Type hint */}
        <p className="text-xs text-muted-foreground/40">
          <span className="font-mono" style={{ color: typeDef.color }}>{typeDef.label}</span>: {typeDef.hint}
        </p>
      </div>
    </div>
  );
}
