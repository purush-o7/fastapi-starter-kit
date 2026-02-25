"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Play, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  success: boolean;
  data?: Record<string, unknown>;
  errors?: ValidationError[];
}

const MODEL_CODE = `from pydantic import BaseModel, Field

class Item(BaseModel):
    name: str
    price: float  # must be > 0
    tags: list[str] = Field(
        default_factory=list
    )`;

const DEFAULT_JSON = `{
  "name": "Widget",
  "price": -9.99,
  "tags": ["electronics", "new"]
}`;

function validate(input: string): ValidationResult {
  let parsed: Record<string, unknown>;

  try {
    parsed = JSON.parse(input);
  } catch {
    return {
      success: false,
      errors: [{ field: "json", message: "Invalid JSON syntax" }],
    };
  }

  const errors: ValidationError[] = [];

  // Check name
  if (parsed.name === undefined || parsed.name === null) {
    errors.push({ field: "name", message: "Field required" });
  } else if (typeof parsed.name !== "string") {
    errors.push({
      field: "name",
      message: `Expected string, got ${typeof parsed.name}`,
    });
  }

  // Check price
  if (parsed.price === undefined || parsed.price === null) {
    errors.push({ field: "price", message: "Field required" });
  } else if (typeof parsed.price !== "number") {
    errors.push({
      field: "price",
      message: `Expected number, got ${typeof parsed.price}`,
    });
  } else if (parsed.price <= 0) {
    errors.push({
      field: "price",
      message: `Value must be greater than 0, got ${parsed.price}`,
    });
  }

  // Check tags (optional, defaults to [])
  if (parsed.tags !== undefined && parsed.tags !== null) {
    if (!Array.isArray(parsed.tags)) {
      errors.push({
        field: "tags",
        message: `Expected list, got ${typeof parsed.tags}`,
      });
    } else {
      const nonStrings = parsed.tags.filter(
        (t: unknown) => typeof t !== "string"
      );
      if (nonStrings.length > 0) {
        errors.push({
          field: "tags",
          message: "All items must be strings",
        });
      }
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name: parsed.name,
      price: parsed.price,
      tags: parsed.tags ?? [],
    },
  };
}

export function PydanticPlayground() {
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const handleValidate = () => {
    setResult(validate(jsonInput));
  };

  const handleReset = () => {
    setJsonInput(DEFAULT_JSON);
    setResult(null);
  };

  return (
    <div className="w-full rounded-xl border bg-card/50 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-indigo-500" />
          <h3 className="text-sm font-semibold">Pydantic Playground</h3>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted cursor-pointer"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {/* Left: Model definition */}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-500 mb-2">
            Pydantic Model
          </div>
          <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3 font-mono text-[11px] sm:text-xs leading-relaxed">
            <pre className="text-foreground/80 whitespace-pre overflow-x-auto">
              {MODEL_CODE}
            </pre>
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-2">
            Defines the schema. Fields are validated automatically.
          </p>
        </div>

        {/* Right: JSON input & validation */}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-500 mb-2">
            JSON Input
          </div>
          <textarea
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              setResult(null);
            }}
            spellCheck={false}
            className={cn(
              "w-full rounded-lg border bg-muted/30 p-3 font-mono text-[11px] sm:text-xs leading-relaxed resize-none h-[148px] focus:outline-none focus:ring-2 transition-colors",
              result === null
                ? "border-border/50 focus:ring-blue-500/30"
                : result.success
                ? "border-emerald-500/30 focus:ring-emerald-500/30"
                : "border-red-500/30 focus:ring-red-500/30"
            )}
          />

          <button
            onClick={handleValidate}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-md bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors cursor-pointer w-full justify-center"
          >
            <Play className="size-3" />
            Validate
          </button>
        </div>
      </div>

      {/* Result panel */}
      <AnimatePresence mode="popLayout">
        {result && (
          <motion.div
            key={result.success ? "success" : "error"}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-4"
          >
            {result.success ? (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-500">
                    Validation Passed
                  </span>
                </div>
                <div className="rounded-md bg-emerald-500/5 border border-emerald-500/10 p-3 font-mono text-[11px] sm:text-xs">
                  <pre className="text-emerald-400 whitespace-pre overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="size-4 text-red-500" />
                  <span className="text-sm font-semibold text-red-500">
                    Validation Error
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-mono">
                    {result.errors!.length} error
                    {result.errors!.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="space-y-2">
                  {result.errors!.map((err, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-2 text-xs"
                    >
                      <span className="font-mono text-red-400 shrink-0 font-semibold">
                        {err.field}:
                      </span>
                      <span className="text-muted-foreground">
                        {err.message}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
