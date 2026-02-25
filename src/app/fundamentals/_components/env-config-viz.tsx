"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileKey, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnvField {
  key: string;
  value: string;
  type: "str" | "bool" | "int";
  required: boolean;
  default?: string;
}

const INITIAL_FIELDS: EnvField[] = [
  { key: "DATABASE_URL", value: "postgresql://user:pass@localhost/mydb", type: "str", required: true },
  { key: "SECRET_KEY", value: "", type: "str", required: true },
  { key: "DEBUG", value: "true", type: "bool", required: false, default: "false" },
  { key: "PORT", value: "8000", type: "int", required: false, default: "8000" },
];

const SETTINGS_CODE = `class Settings(BaseSettings):
    database_url: str
    secret_key: str
    debug: bool = False
    port: int = 8000

    model_config = ConfigDict(
        env_file=".env"
    )`;

type Status = "valid" | "error" | "warning";

function validate(field: EnvField): { status: Status; message: string } {
  if (field.required && !field.value.trim()) {
    return { status: "error", message: "Required — field is empty" };
  }
  if (field.type === "bool" && field.value && !["true", "false", "1", "0"].includes(field.value.toLowerCase())) {
    return { status: "warning", message: `Expected bool, got "${field.value}"` };
  }
  if (field.type === "int" && field.value && isNaN(Number(field.value))) {
    return { status: "warning", message: `Expected int, got "${field.value}"` };
  }
  if (!field.value && !field.required) {
    return { status: "valid", message: `Using default: ${field.default}` };
  }
  return { status: "valid", message: "Valid" };
}

export function EnvConfigViz() {
  const [fields, setFields] = useState<EnvField[]>(INITIAL_FIELDS);

  const results = useMemo(() => fields.map(validate), [fields]);
  const errorCount = results.filter((r) => r.status === "error").length;
  const validCount = results.filter((r) => r.status === "valid").length;

  const updateField = (index: number, value: string) => {
    setFields((prev) => prev.map((f, i) => i === index ? { ...f, value } : f));
  };

  return (
    <div className="w-full rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-card/40 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg width="100%" height="100%" className="opacity-[0.03]">
          <defs><pattern id="env-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.7" fill="currentColor" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#env-dots)" />
        </svg>
      </div>

      <div className="relative">
        <div className="px-5 sm:px-6 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <FileKey className="size-4 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Environment Config Validator</h3>
                <p className="text-[10px] text-muted-foreground/50 font-mono">edit values, see live validation</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              {errorCount > 0 && <span className="text-red-400">{errorCount} error{errorCount !== 1 ? "s" : ""}</span>}
              {validCount > 0 && <span className="text-emerald-400/60">{validCount} valid</span>}
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

        <div className="px-5 sm:px-6 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* .env editor */}
            <div>
              <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/30 block mb-2">.env file</span>
              <div className="rounded-xl border border-border/30 bg-muted/10 p-4 space-y-2.5">
                {fields.map((field, i) => {
                  const result = results[i];
                  return (
                    <div key={field.key}>
                      <div className="flex items-center gap-2">
                        <motion.div
                          className={cn("size-2 rounded-full shrink-0 transition-colors duration-300",
                            result.status === "valid" && "bg-emerald-400",
                            result.status === "error" && "bg-red-400",
                            result.status === "warning" && "bg-amber-400",
                          )}
                          animate={result.status === "error" ? { scale: [1, 1.3, 1] } : {}}
                          transition={{ duration: 0.5, repeat: result.status === "error" ? Infinity : 0 }}
                        />
                        <span className="text-xs font-mono text-foreground/60 w-28 shrink-0">{field.key}=</span>
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => updateField(i, e.target.value)}
                          className={cn(
                            "flex-1 text-xs font-mono bg-transparent border-b px-1 py-0.5 outline-none transition-colors min-w-0",
                            result.status === "valid" && "border-emerald-500/30 text-foreground/70",
                            result.status === "error" && "border-red-500/40 text-red-400/80",
                            result.status === "warning" && "border-amber-500/40 text-amber-400/80",
                          )}
                          spellCheck={false}
                        />
                      </div>
                      <AnimatePresence>
                        {result.status !== "valid" && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                            className="pl-8 mt-1">
                            <span className={cn("text-[10px] font-mono",
                              result.status === "error" ? "text-red-400/60" : "text-amber-400/60",
                            )}>{result.message}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pydantic Settings */}
            <div>
              <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/30 block mb-2">Pydantic Settings</span>
              <div className="rounded-xl border border-indigo-500/15 bg-indigo-500/[0.03] p-4">
                <pre className="font-mono text-xs leading-relaxed text-foreground/60 whitespace-pre overflow-x-auto">
                  {SETTINGS_CODE}
                </pre>
              </div>
              <p className="text-[10px] text-muted-foreground/40 mt-2">
                Pydantic reads your .env file and validates types automatically. Missing required fields raise an error at startup — not at runtime.
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-6 py-3 border-t border-border/20 bg-muted/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5"><div className="size-1.5 rounded-full bg-emerald-400" /><span className="text-[9px] text-muted-foreground/40 font-mono">Valid</span></div>
            <div className="flex items-center gap-1.5"><div className="size-1.5 rounded-full bg-red-400" /><span className="text-[9px] text-muted-foreground/40 font-mono">Error</span></div>
            <div className="flex items-center gap-1.5"><div className="size-1.5 rounded-full bg-amber-400" /><span className="text-[9px] text-muted-foreground/40 font-mono">Warning</span></div>
          </div>
          <span className="text-[9px] text-muted-foreground/30 font-mono">pydantic-settings</span>
        </div>
      </div>
    </div>
  );
}
