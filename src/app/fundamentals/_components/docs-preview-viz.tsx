"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocParam {
  name: string;
  location: "path" | "query" | "body";
  type: string;
  required: boolean;
}

interface Preset {
  label: string;
  method: "GET" | "POST";
  path: string;
  summary: string;
  code: string;
  params: DocParam[];
  responseStatus: number;
  responseBody: string;
}

const METHOD_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  GET: { text: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
  POST: { text: "text-blue-400", bg: "bg-blue-500/15", border: "border-blue-500/30" },
};

const LOCATION_COLORS: Record<string, string> = {
  path: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  query: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  body: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

const PRESETS: Preset[] = [
  {
    label: "Simple GET",
    method: "GET", path: "/items/{item_id}",
    summary: "Get a single item by ID",
    code: `@app.get("/items/{item_id}")
async def get_item(
    item_id: int,
):
    """Get a single item by ID."""
    return {"item_id": item_id}`,
    params: [
      { name: "item_id", location: "path", type: "integer", required: true },
    ],
    responseStatus: 200,
    responseBody: `{ "item_id": 0 }`,
  },
  {
    label: "POST + Body",
    method: "POST", path: "/items",
    summary: "Create a new item",
    code: `class Item(BaseModel):
    name: str
    price: float
    in_stock: bool = True

@app.post("/items", status_code=201)
async def create_item(item: Item):
    """Create a new item."""
    return item`,
    params: [
      { name: "name", location: "body", type: "string", required: true },
      { name: "price", location: "body", type: "number", required: true },
      { name: "in_stock", location: "body", type: "boolean", required: false },
    ],
    responseStatus: 201,
    responseBody: `{ "name": "str", "price": 0.0, "in_stock": true }`,
  },
  {
    label: "GET + Query",
    method: "GET", path: "/items",
    summary: "List items with pagination",
    code: `@app.get("/items")
async def list_items(
    skip: int = 0,
    limit: int = 10,
    q: str | None = None,
):
    """List items with search."""
    return {"skip": skip, "limit": limit}`,
    params: [
      { name: "skip", location: "query", type: "integer", required: false },
      { name: "limit", location: "query", type: "integer", required: false },
      { name: "q", location: "query", type: "string", required: false },
    ],
    responseStatus: 200,
    responseBody: `{ "skip": 0, "limit": 10 }`,
  },
];

export function DocsPreviewViz() {
  const [activeIndex, setActiveIndex] = useState(0);
  const preset = PRESETS[activeIndex];
  const mColors = METHOD_COLORS[preset.method];

  return (
    <div className="w-full rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-card/40 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg width="100%" height="100%" className="opacity-[0.03]">
          <defs><pattern id="docs-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.7" fill="currentColor" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#docs-dots)" />
        </svg>
      </div>

      <div className="relative">
        <div className="px-5 sm:px-6 pt-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <FileText className="size-4 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Code → Docs Preview</h3>
                <p className="text-[10px] text-muted-foreground/50 font-mono">type hints become Swagger UI fields</p>
              </div>
            </div>
          </div>

          <div className="flex gap-1 p-1 rounded-lg bg-muted/30 border border-border/30 w-fit">
            {PRESETS.map((p, i) => (
              <button key={i} onClick={() => setActiveIndex(i)}
                className={cn("text-[11px] font-mono font-medium px-3 py-1.5 rounded-md transition-all cursor-pointer",
                  activeIndex === i ? "bg-background text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"
                )}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

        <div className="px-5 sm:px-6 py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
              {/* Left: Python code */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/30">Python Code</span>
                  <ArrowRight className="size-2.5 text-muted-foreground/20 hidden lg:block" />
                </div>
                <div className="rounded-xl border border-border/30 bg-[#1c1e26] p-4">
                  <pre className="font-mono text-xs leading-relaxed text-foreground/60 whitespace-pre overflow-x-auto">{preset.code}</pre>
                </div>
              </div>

              {/* Right: Swagger UI mockup */}
              <div>
                <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/30 block mb-2">Swagger UI Preview</span>
                <div className="rounded-xl border border-border/30 bg-card/50 p-4">
                  {/* Method + Path */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn("text-xs font-mono font-bold rounded px-2 py-0.5 border", mColors.text, mColors.bg, mColors.border)}>
                      {preset.method}
                    </span>
                    <span className="text-sm font-mono text-foreground/70">{preset.path}</span>
                  </div>
                  <p className="text-xs text-muted-foreground/50 mb-4 italic">{preset.summary}</p>

                  {/* Parameters */}
                  {preset.params.length > 0 && (
                    <div className="mb-4">
                      <span className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider block mb-2">Parameters</span>
                      <div className="space-y-1.5">
                        {preset.params.map((param) => (
                          <div key={param.name} className="flex items-center gap-2 text-xs">
                            <span className="font-mono font-medium text-foreground/60 w-16">{param.name}</span>
                            <span className={cn("text-[9px] font-mono rounded px-1.5 py-0.5 border", LOCATION_COLORS[param.location])}>
                              {param.location}
                            </span>
                            <span className="text-muted-foreground/40 font-mono">{param.type}</span>
                            {param.required && <span className="text-[8px] text-red-400/60 font-mono">*required</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Response */}
                  <div>
                    <span className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider block mb-2">
                      Response {preset.responseStatus}
                    </span>
                    <div className="rounded-lg bg-muted/20 border border-border/20 p-2.5">
                      <pre className="font-mono text-[11px] text-foreground/50 whitespace-pre">{preset.responseBody}</pre>
                    </div>
                  </div>

                  {/* Decorative "Try it out" button */}
                  <div className="mt-3 pt-3 border-t border-border/20">
                    <div className="text-[10px] font-medium text-blue-400/40 bg-blue-500/5 border border-blue-500/15 rounded px-3 py-1.5 w-fit cursor-default">
                      Try it out
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-5 sm:px-6 py-3 border-t border-border/20 bg-muted/5 flex items-center justify-between">
          <span className="text-[9px] text-muted-foreground/30 font-mono">type hints → auto-generated docs</span>
          <span className="text-[9px] text-muted-foreground/30 font-mono">Swagger UI / OpenAPI 3.1</span>
        </div>
      </div>
    </div>
  );
}
