"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Route, Search, FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/*
  Interactive component that breaks down a URL and shows
  where FastAPI gets each parameter from.
*/

interface Example {
  id: string;
  label: string;
  method: string;
  url: string;
  segments: Segment[];
  bodyFields?: { key: string; value: string }[];
  handler: string;
  explanation: string;
}

interface Segment {
  text: string;
  type: "static" | "path-param" | "query-key" | "query-value" | "separator" | "body";
  paramName?: string;
}

const EXAMPLES: Example[] = [
  {
    id: "simple",
    label: "GET basics",
    method: "GET",
    url: "/items/42?skip=0&limit=10",
    segments: [
      { text: "/items/", type: "static" },
      { text: "42", type: "path-param", paramName: "item_id: int" },
      { text: "?", type: "separator" },
      { text: "skip", type: "query-key", paramName: "skip: int = 0" },
      { text: "=0", type: "query-value" },
      { text: "&", type: "separator" },
      { text: "limit", type: "query-key", paramName: "limit: int = 10" },
      { text: "=10", type: "query-value" },
    ],
    handler: `@app.get("/items/{item_id}")
async def read_item(
    item_id: int,        # ← from path
    skip: int = 0,       # ← from query
    limit: int = 10,     # ← from query
):`,
    explanation: "item_id is in the path → path param. skip and limit aren't in the path → query params.",
  },
  {
    id: "annotated",
    label: "Annotated",
    method: "GET",
    url: "/users?q=alice&page=1",
    segments: [
      { text: "/users", type: "static" },
      { text: "?", type: "separator" },
      { text: "q", type: "query-key", paramName: "q: Annotated[str, Query(min_length=1)]" },
      { text: "=alice", type: "query-value" },
      { text: "&", type: "separator" },
      { text: "page", type: "query-key", paramName: "page: Annotated[int, Query(ge=1)]" },
      { text: "=1", type: "query-value" },
    ],
    handler: `@app.get("/users")
async def search_users(
    q: Annotated[str, Query(min_length=1)],
    page: Annotated[int, Query(ge=1)] = 1,
):`,
    explanation: "Annotated[type, Query(...)] adds validation without changing the default value position.",
  },
  {
    id: "mixed",
    label: "Path + Query + Body",
    method: "PUT",
    url: "/items/42?notify=true",
    segments: [
      { text: "/items/", type: "static" },
      { text: "42", type: "path-param", paramName: "item_id: int" },
      { text: "?", type: "separator" },
      { text: "notify", type: "query-key", paramName: "notify: bool = False" },
      { text: "=true", type: "query-value" },
    ],
    bodyFields: [
      { key: "name", value: '"Widget"' },
      { key: "price", value: "9.99" },
    ],
    handler: `@app.put("/items/{item_id}")
async def update_item(
    item_id: int,            # ← path (in URL)
    notify: bool = False,    # ← query (after ?)
    item: Item,              # ← body (JSON)
):`,
    explanation: "FastAPI's rule: in the path → path param, scalar with default → query, Pydantic model → body.",
  },
  {
    id: "list",
    label: "List params",
    method: "GET",
    url: "/items?tag=python&tag=fastapi&tag=async",
    segments: [
      { text: "/items", type: "static" },
      { text: "?", type: "separator" },
      { text: "tag", type: "query-key", paramName: "tag: list[str]" },
      { text: "=python", type: "query-value" },
      { text: "&", type: "separator" },
      { text: "tag", type: "query-key" },
      { text: "=fastapi", type: "query-value" },
      { text: "&", type: "separator" },
      { text: "tag", type: "query-key" },
      { text: "=async", type: "query-value" },
    ],
    handler: `@app.get("/items")
async def filter_items(
    tag: Annotated[
        list[str], Query()
    ] = [],
):
    # tag = ["python", "fastapi", "async"]`,
    explanation: "Repeat the same key to pass a list. FastAPI collects them into list[str] automatically.",
  },
];

const TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  "path-param": { bg: "bg-teal-500/15", text: "text-teal-400", label: "Path" },
  "query-key": { bg: "bg-blue-500/15", text: "text-blue-400", label: "Query" },
  "query-value": { bg: "bg-blue-500/8", text: "text-blue-400/60", label: "" },
  "static": { bg: "", text: "text-muted-foreground/60", label: "" },
  "separator": { bg: "", text: "text-muted-foreground/25", label: "" },
  "body": { bg: "bg-purple-500/15", text: "text-purple-400", label: "Body" },
};

export function ParamAnatomy() {
  const [hoveredParam, setHoveredParam] = useState<string | null>(null);

  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      <div className="px-5 py-3.5 border-b bg-muted/20 flex items-center gap-2.5">
        <Route className="size-4 text-teal-400" />
        <span className="text-sm font-semibold tracking-wide">Parameter Anatomy</span>
      </div>

      <Tabs defaultValue="simple" className="gap-0">
        <div className="px-4 pt-3 pb-0 border-b border-border/20 bg-muted/5">
          <TabsList variant="line" className="w-full sm:w-auto">
            {EXAMPLES.map((ex) => (
              <TabsTrigger key={ex.id} value={ex.id} className="text-xs">{ex.label}</TabsTrigger>
            ))}
          </TabsList>
        </div>

        {EXAMPLES.map((ex) => (
          <TabsContent key={ex.id} value={ex.id} className="p-5 space-y-5">
            {/* URL breakdown */}
            <div>
              <p className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest mb-2">URL</p>
              <div className="rounded-xl border bg-muted/10 px-4 py-3 overflow-x-auto">
                <div className="flex items-center gap-0.5 font-mono text-sm flex-wrap">
                  <span className="text-xs font-bold text-muted-foreground/40 mr-1.5">{ex.method}</span>
                  {ex.segments.map((seg, i) => (
                    <motion.span
                      key={i}
                      className={cn(
                        "px-0.5 py-0.5 rounded transition-all cursor-default",
                        TYPE_COLORS[seg.type].bg,
                        TYPE_COLORS[seg.type].text,
                        seg.paramName && hoveredParam === seg.paramName ? "ring-1 ring-current" : ""
                      )}
                      onMouseEnter={() => seg.paramName && setHoveredParam(seg.paramName)}
                      onMouseLeave={() => setHoveredParam(null)}
                    >
                      {seg.text}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>

            {/* Body (if applicable) */}
            {ex.bodyFields && (
              <div>
                <p className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest mb-2">JSON Body</p>
                <div className="rounded-xl border bg-purple-500/5 border-purple-500/15 px-4 py-3 font-mono text-sm">
                  <span className="text-muted-foreground/40">{"{"}</span>
                  {ex.bodyFields.map((f, i) => (
                    <span key={f.key}>
                      <span className="text-purple-400"> &quot;{f.key}&quot;</span>
                      <span className="text-muted-foreground/30">: </span>
                      <span className="text-purple-300">{f.value}</span>
                      {i < (ex.bodyFields?.length ?? 0) - 1 && <span className="text-muted-foreground/30">,</span>}
                    </span>
                  ))}
                  <span className="text-muted-foreground/40"> {"}"}</span>
                </div>
              </div>
            )}

            {/* Handler code */}
            <div>
              <p className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest mb-2">Handler</p>
              <pre className="rounded-xl border bg-muted/10 px-4 py-3 text-xs font-mono text-muted-foreground/70 leading-relaxed whitespace-pre-wrap overflow-x-auto">
                {ex.handler}
              </pre>
            </div>

            {/* Legend + explanation */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded bg-teal-500/40" /><span className="text-xs text-muted-foreground/50">Path</span></span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded bg-blue-500/40" /><span className="text-xs text-muted-foreground/50">Query</span></span>
                {ex.bodyFields && <span className="flex items-center gap-1.5"><span className="size-2.5 rounded bg-purple-500/40" /><span className="text-xs text-muted-foreground/50">Body</span></span>}
              </div>
            </div>

            <div className="rounded-lg bg-teal-500/5 border border-teal-500/15 px-4 py-3">
              <p className="text-xs text-muted-foreground/60 leading-relaxed">
                <span className="text-teal-400 font-semibold">How it works:</span> {ex.explanation}
              </p>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
