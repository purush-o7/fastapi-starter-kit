"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Play,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileCheck,
  AlertTriangle,
  Braces,
  Sparkles,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────
interface FieldDef {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  rules?: string[];
  validate: (value: unknown, data: Record<string, unknown>) => string | null;
}

interface Schema {
  id: string;
  label: string;
  modelName: string;
  modelCode: string;
  fields: FieldDef[];
  defaultJson: string;
  brokenJson: string;
}

interface FieldResult {
  field: string;
  type: string;
  status: "pass" | "fail" | "default";
  value: unknown;
  message?: string;
}

// ── Schemas ────────────────────────────────────────────────────
const SCHEMAS: Schema[] = [
  {
    id: "item",
    label: "Item",
    modelName: "Item",
    modelCode: `class Item(BaseModel):
    name: str
    price: float = Field(gt=0)
    tags: list[str] = []
    in_stock: bool = True`,
    fields: [
      {
        name: "name", type: "str", required: true,
        validate: (v) => {
          if (v === undefined || v === null) return "Field required";
          if (typeof v !== "string") return `Expected string, got ${typeof v}`;
          if (v.length === 0) return "String must not be empty";
          return null;
        },
      },
      {
        name: "price", type: "float", required: true, rules: ["gt=0"],
        validate: (v) => {
          if (v === undefined || v === null) return "Field required";
          if (typeof v !== "number") return `Expected number, got ${typeof v}`;
          if (v <= 0) return `Must be > 0, got ${v}`;
          return null;
        },
      },
      {
        name: "tags", type: "list[str]", required: false, default: "[]",
        validate: (v) => {
          if (v === undefined || v === null) return null;
          if (!Array.isArray(v)) return `Expected list, got ${typeof v}`;
          const bad = v.find((item: unknown) => typeof item !== "string");
          if (bad !== undefined) return `All items must be strings`;
          return null;
        },
      },
      {
        name: "in_stock", type: "bool", required: false, default: "True",
        validate: (v) => {
          if (v === undefined || v === null) return null;
          if (typeof v !== "boolean") return `Expected bool, got ${typeof v}`;
          return null;
        },
      },
    ],
    defaultJson: `{
  "name": "Widget",
  "price": 29.99,
  "tags": ["electronics", "new"]
}`,
    brokenJson: `{
  "name": "",
  "price": -5,
  "tags": [123, true]
}`,
  },
  {
    id: "user",
    label: "User",
    modelName: "User",
    modelCode: `class User(BaseModel):
    name: str = Field(min_length=1)
    email: str
    age: int = Field(ge=0, le=150)
    is_active: bool = True`,
    fields: [
      {
        name: "name", type: "str", required: true, rules: ["min_length=1"],
        validate: (v) => {
          if (v === undefined || v === null) return "Field required";
          if (typeof v !== "string") return `Expected string, got ${typeof v}`;
          if (v.length < 1) return "Must be at least 1 character";
          return null;
        },
      },
      {
        name: "email", type: "str", required: true, rules: ["must contain @"],
        validate: (v) => {
          if (v === undefined || v === null) return "Field required";
          if (typeof v !== "string") return `Expected string, got ${typeof v}`;
          if (!v.includes("@")) return "Invalid email — missing @";
          return null;
        },
      },
      {
        name: "age", type: "int", required: true, rules: ["ge=0", "le=150"],
        validate: (v) => {
          if (v === undefined || v === null) return "Field required";
          if (typeof v !== "number" || !Number.isInteger(v)) return `Expected integer, got ${typeof v}`;
          if (v < 0) return `Must be >= 0, got ${v}`;
          if (v > 150) return `Must be <= 150, got ${v}`;
          return null;
        },
      },
      {
        name: "is_active", type: "bool", required: false, default: "True",
        validate: (v) => {
          if (v === undefined || v === null) return null;
          if (typeof v !== "boolean") return `Expected bool, got ${typeof v}`;
          return null;
        },
      },
    ],
    defaultJson: `{
  "name": "Alice",
  "email": "alice@example.com",
  "age": 28
}`,
    brokenJson: `{
  "name": "",
  "email": "not-an-email",
  "age": 200
}`,
  },
  {
    id: "order",
    label: "Order",
    modelName: "Order",
    modelCode: `class Order(BaseModel):
    product: str
    quantity: int = Field(ge=1)
    unit_price: float = Field(gt=0)
    discount: float = Field(
        default=0, ge=0, le=1
    )`,
    fields: [
      {
        name: "product", type: "str", required: true,
        validate: (v) => {
          if (v === undefined || v === null) return "Field required";
          if (typeof v !== "string") return `Expected string, got ${typeof v}`;
          if (v.length === 0) return "Must not be empty";
          return null;
        },
      },
      {
        name: "quantity", type: "int", required: true, rules: ["ge=1"],
        validate: (v) => {
          if (v === undefined || v === null) return "Field required";
          if (typeof v !== "number" || !Number.isInteger(v)) return `Expected integer`;
          if (v < 1) return `Must be >= 1, got ${v}`;
          return null;
        },
      },
      {
        name: "unit_price", type: "float", required: true, rules: ["gt=0"],
        validate: (v) => {
          if (v === undefined || v === null) return "Field required";
          if (typeof v !== "number") return `Expected number, got ${typeof v}`;
          if (v <= 0) return `Must be > 0, got ${v}`;
          return null;
        },
      },
      {
        name: "discount", type: "float", required: false, default: "0", rules: ["ge=0", "le=1"],
        validate: (v) => {
          if (v === undefined || v === null) return null;
          if (typeof v !== "number") return `Expected number, got ${typeof v}`;
          if (v < 0 || v > 1) return `Must be between 0 and 1, got ${v}`;
          return null;
        },
      },
    ],
    defaultJson: `{
  "product": "Laptop Stand",
  "quantity": 2,
  "unit_price": 49.99,
  "discount": 0.1
}`,
    brokenJson: `{
  "product": "",
  "quantity": 0,
  "unit_price": -10
}`,
  },
];

// ── Field Result Row ───────────────────────────────────────────
function FieldRow({ result, index }: { result: FieldResult; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
      className={cn(
        "flex items-start gap-2.5 px-3 py-2 rounded-lg border transition-colors",
        result.status === "pass" && "border-emerald-500/20 bg-emerald-500/[0.04]",
        result.status === "fail" && "border-red-500/20 bg-red-500/[0.04]",
        result.status === "default" && "border-blue-500/15 bg-blue-500/[0.03]",
      )}
    >
      {/* Status icon */}
      <div className="mt-0.5 shrink-0">
        {result.status === "pass" && <CheckCircle2 className="size-3.5 text-emerald-400" />}
        {result.status === "fail" && <XCircle className="size-3.5 text-red-400" />}
        {result.status === "default" && <Sparkles className="size-3.5 text-blue-400" />}
      </div>

      {/* Field info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono font-bold text-foreground/80">{result.field}</span>
          <span className="text-[10px] font-mono text-muted-foreground/40">{result.type}</span>
        </div>
        {result.status === "pass" && (
          <p className="text-[11px] font-mono text-emerald-400/60 mt-0.5 truncate">
            {JSON.stringify(result.value)}
          </p>
        )}
        {result.status === "fail" && (
          <p className="text-[11px] text-red-400/80 mt-0.5">{result.message}</p>
        )}
        {result.status === "default" && (
          <p className="text-[11px] text-blue-400/60 mt-0.5">
            using default value
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export function PydanticPlayground() {
  const [activeSchemaId, setActiveSchemaId] = useState("item");
  const [jsonInput, setJsonInput] = useState(SCHEMAS[0].defaultJson);
  const [fieldResults, setFieldResults] = useState<FieldResult[] | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);

  const schema = SCHEMAS.find((s) => s.id === activeSchemaId)!;

  const switchSchema = useCallback((id: string) => {
    const newSchema = SCHEMAS.find((s) => s.id === id)!;
    setActiveSchemaId(id);
    setJsonInput(newSchema.defaultJson);
    setFieldResults(null);
    setJsonError(null);
    setValidated(false);
  }, []);

  const loadBroken = useCallback(() => {
    setJsonInput(schema.brokenJson);
    setFieldResults(null);
    setJsonError(null);
    setValidated(false);
  }, [schema]);

  const resetJson = useCallback(() => {
    setJsonInput(schema.defaultJson);
    setFieldResults(null);
    setJsonError(null);
    setValidated(false);
  }, [schema]);

  const handleValidate = useCallback(() => {
    setJsonError(null);
    let parsed: Record<string, unknown>;

    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      setJsonError("Invalid JSON syntax");
      setFieldResults(null);
      setValidated(true);
      return;
    }

    const results: FieldResult[] = schema.fields.map((field) => {
      const value = parsed[field.name];
      const error = field.validate(value, parsed);

      if (error) {
        return { field: field.name, type: field.type, status: "fail" as const, value, message: error };
      }

      if ((value === undefined || value === null) && !field.required) {
        return { field: field.name, type: field.type, status: "default" as const, value: field.default };
      }

      return { field: field.name, type: field.type, status: "pass" as const, value };
    });

    setFieldResults(results);
    setValidated(true);
  }, [jsonInput, schema]);

  const passCount = fieldResults?.filter((r) => r.status === "pass").length ?? 0;
  const failCount = fieldResults?.filter((r) => r.status === "fail").length ?? 0;
  const defaultCount = fieldResults?.filter((r) => r.status === "default").length ?? 0;
  const allPassed = fieldResults !== null && failCount === 0 && !jsonError;

  return (
    <div className="w-full rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-card/40 overflow-hidden relative">
      {/* Dot grid background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg width="100%" height="100%" className="opacity-[0.03]">
          <defs>
            <pattern id="pydantic-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.7" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pydantic-dots)" />
        </svg>
      </div>

      <div className="relative">
        {/* ── Header ── */}
        <div className="px-5 sm:px-6 pt-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <FileCheck className="size-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Pydantic Playground</h3>
                <p className="text-[10px] text-muted-foreground/50 font-mono">edit JSON &middot; validate against model</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={loadBroken}
                className="text-[10px] font-mono text-muted-foreground/40 hover:text-red-400/60 transition-colors px-2 py-1 rounded hover:bg-red-500/5 cursor-pointer"
                title="Load broken data to see errors"
              >
                <AlertTriangle className="size-3 inline mr-1" />
                break it
              </button>
              <button
                onClick={resetJson}
                className="text-muted-foreground/40 hover:text-foreground/60 transition-colors p-1.5 rounded hover:bg-muted cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Schema selector */}
          <div className="flex gap-1 p-1 rounded-lg bg-muted/30 border border-border/30 w-fit">
            {SCHEMAS.map((s) => (
              <button
                key={s.id}
                onClick={() => switchSchema(s.id)}
                className={cn(
                  "text-[11px] font-mono font-medium px-3 py-1.5 rounded-md transition-all cursor-pointer",
                  activeSchemaId === s.id
                    ? "bg-background text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

        {/* ── Body ── */}
        <div className="px-5 sm:px-6 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Left: Model definition */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Braces className="size-3 text-indigo-400/60" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400/50">
                  {schema.modelName} Model
                </span>
              </div>
              <div className="rounded-xl border border-indigo-500/15 bg-indigo-500/[0.03] p-4">
                <pre className="font-mono text-xs leading-relaxed text-foreground/70 whitespace-pre overflow-x-auto">
                  {schema.modelCode}
                </pre>
              </div>

              {/* Field reference */}
              <div className="mt-3 space-y-1">
                {schema.fields.map((field) => (
                  <div key={field.name} className="flex items-center gap-2 text-[11px]">
                    <span className="font-mono font-semibold text-foreground/50 w-20">{field.name}</span>
                    <span className="font-mono text-muted-foreground/30">{field.type}</span>
                    {field.required ? (
                      <span className="text-[9px] font-mono text-amber-400/40 bg-amber-500/5 rounded px-1.5 py-0.5">required</span>
                    ) : (
                      <span className="text-[9px] font-mono text-blue-400/40 bg-blue-500/5 rounded px-1.5 py-0.5">optional = {field.default}</span>
                    )}
                    {field.rules?.map((rule) => (
                      <span key={rule} className="text-[9px] font-mono text-purple-400/40 bg-purple-500/5 rounded px-1.5 py-0.5">{rule}</span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: JSON input */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Play className="size-3 text-blue-400/60" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400/50">
                  JSON Input
                </span>
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setFieldResults(null);
                  setJsonError(null);
                  setValidated(false);
                }}
                spellCheck={false}
                className={cn(
                  "w-full rounded-xl border bg-muted/20 p-4 font-mono text-xs leading-relaxed resize-none h-[180px] focus:outline-none focus:ring-2 transition-all",
                  !validated && "border-border/40 focus:ring-blue-500/30",
                  validated && allPassed && "border-emerald-500/30 focus:ring-emerald-500/30",
                  validated && !allPassed && "border-red-500/30 focus:ring-red-500/30",
                )}
              />

              <button
                onClick={handleValidate}
                className={cn(
                  "mt-3 inline-flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-lg transition-all cursor-pointer w-full justify-center",
                  validated && allPassed
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : validated && !allPassed
                      ? "bg-red-500/10 text-red-500 border border-red-500/20"
                      : "bg-blue-500 text-white hover:bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                )}
              >
                {validated && allPassed ? (
                  <>
                    <CheckCircle2 className="size-3.5" />
                    All Fields Valid
                  </>
                ) : validated && !allPassed ? (
                  <>
                    <XCircle className="size-3.5" />
                    {failCount} Error{failCount !== 1 ? "s" : ""} Found
                  </>
                ) : (
                  <>
                    <Play className="size-3.5" />
                    Validate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Results Panel ── */}
        <AnimatePresence>
          {(fieldResults || jsonError) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
              <div className="px-5 sm:px-6 py-5">
                {/* JSON parse error */}
                {jsonError && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4 flex items-start gap-3"
                  >
                    <XCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-400">Parse Error</p>
                      <p className="text-xs text-red-400/60 mt-0.5">{jsonError}</p>
                    </div>
                  </motion.div>
                )}

                {/* Field-by-field results */}
                {fieldResults && (
                  <div>
                    {/* Summary bar */}
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-xs font-semibold text-foreground/60">
                        Validation Result
                      </span>
                      <div className="flex items-center gap-3 text-[11px] font-mono">
                        {passCount > 0 && (
                          <span className="text-emerald-400/60">
                            <CheckCircle2 className="size-3 inline mr-0.5" />{passCount} passed
                          </span>
                        )}
                        {failCount > 0 && (
                          <span className="text-red-400/60">
                            <XCircle className="size-3 inline mr-0.5" />{failCount} failed
                          </span>
                        )}
                        {defaultCount > 0 && (
                          <span className="text-blue-400/60">
                            <Sparkles className="size-3 inline mr-0.5" />{defaultCount} defaulted
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Field rows */}
                    <div className="space-y-1.5">
                      {fieldResults.map((result, i) => (
                        <FieldRow key={result.field} result={result} index={i} />
                      ))}
                    </div>

                    {/* Success output */}
                    <AnimatePresence>
                      {allPassed && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="size-4 text-emerald-400" />
                            <span className="text-sm font-semibold text-emerald-400">
                              {schema.modelName}(**data) created successfully
                            </span>
                          </div>
                          <pre className="font-mono text-xs text-emerald-400/70 whitespace-pre overflow-x-auto leading-relaxed">
                            {JSON.stringify(
                              Object.fromEntries(
                                fieldResults.map((r) => [
                                  r.field,
                                  r.status === "default"
                                    ? schema.fields.find((f) => f.name === r.field)?.default ?? null
                                    : r.value,
                                ])
                              ),
                              null,
                              2
                            )}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Footer ── */}
        <div className="px-5 sm:px-6 py-3 border-t border-border/20 bg-muted/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {[
              { color: "bg-emerald-400", label: "Pass" },
              { color: "bg-red-400", label: "Fail" },
              { color: "bg-blue-400", label: "Default" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className={cn("size-1.5 rounded-full", item.color)} />
                <span className="text-[9px] text-muted-foreground/40 font-mono">{item.label}</span>
              </div>
            ))}
          </div>
          <span className="text-[9px] text-muted-foreground/30 font-mono">
            pydantic v2
          </span>
        </div>
      </div>
    </div>
  );
}
