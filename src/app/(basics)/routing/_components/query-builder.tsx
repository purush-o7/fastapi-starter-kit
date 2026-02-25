"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/*
  Interactive query string builder:
  Users add/remove query params and see the full URL
  + what FastAPI would parse from it.
*/

interface Param {
  id: number;
  key: string;
  value: string;
}

const PRESETS = [
  { label: "Pagination", params: [{ key: "skip", value: "0" }, { key: "limit", value: "10" }] },
  { label: "Search", params: [{ key: "q", value: "fastapi" }, { key: "category", value: "web" }] },
  { label: "List params", params: [{ key: "tag", value: "python" }, { key: "tag", value: "fastapi" }, { key: "tag", value: "async" }] },
  { label: "Boolean", params: [{ key: "short", value: "true" }, { key: "include_deleted", value: "false" }] },
];

export function QueryBuilder() {
  const [params, setParams] = useState<Param[]>([
    { id: 1, key: "skip", value: "0" },
    { id: 2, key: "limit", value: "10" },
  ]);
  const [nextId, setNextId] = useState(3);
  const [basePath] = useState("/items");

  const addParam = () => {
    setParams((p) => [...p, { id: nextId, key: "", value: "" }]);
    setNextId((n) => n + 1);
  };

  const removeParam = (id: number) => {
    setParams((p) => p.filter((param) => param.id !== id));
  };

  const updateParam = (id: number, field: "key" | "value", val: string) => {
    setParams((p) => p.map((param) => param.id === id ? { ...param, [field]: val } : param));
  };

  const loadPreset = (preset: typeof PRESETS[0]) => {
    const newParams = preset.params.map((p, i) => ({ id: nextId + i, key: p.key, value: p.value }));
    setParams(newParams);
    setNextId(nextId + preset.params.length);
  };

  // Build the URL
  const queryString = useMemo(() => {
    const validParams = params.filter((p) => p.key.trim() !== "");
    if (validParams.length === 0) return "";
    return "?" + validParams.map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join("&");
  }, [params]);

  // Parse into FastAPI-style dict
  const parsed = useMemo(() => {
    const result: Record<string, string | string[]> = {};
    params.filter((p) => p.key.trim() !== "").forEach((p) => {
      const existing = result[p.key];
      if (existing !== undefined) {
        // Multiple values for same key → list
        if (Array.isArray(existing)) {
          existing.push(p.value);
        } else {
          result[p.key] = [existing, p.value];
        }
      } else {
        result[p.key] = p.value;
      }
    });
    return result;
  }, [params]);

  const fullUrl = `GET ${basePath}${queryString}`;

  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      <div className="px-5 py-3.5 border-b bg-muted/20 flex items-center gap-2.5">
        <Search className="size-4 text-blue-400" />
        <span className="text-sm font-semibold tracking-wide">Query String Builder</span>
      </div>

      {/* Presets */}
      <div className="px-5 py-2.5 border-b border-border/20 bg-muted/5 flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[10px] text-muted-foreground/30 shrink-0 mr-1">Presets:</span>
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => loadPreset(preset)}
            className="shrink-0 px-2.5 py-1 rounded-md text-[11px] font-medium text-muted-foreground/50 hover:text-muted-foreground bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4">
        {/* Param rows */}
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {params.map((param) => (
              <motion.div
                key={param.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={param.key}
                    onChange={(e) => updateParam(param.id, "key", e.target.value)}
                    placeholder="key"
                    className="flex-1 rounded-lg border border-border/20 bg-muted/10 px-3 py-2 text-sm font-mono outline-none focus:border-blue-500/40 transition-colors"
                    spellCheck={false}
                  />
                  <span className="text-muted-foreground/25 font-mono">=</span>
                  <input
                    type="text"
                    value={param.value}
                    onChange={(e) => updateParam(param.id, "value", e.target.value)}
                    placeholder="value"
                    className="flex-1 rounded-lg border border-border/20 bg-muted/10 px-3 py-2 text-sm font-mono outline-none focus:border-blue-500/40 transition-colors"
                    spellCheck={false}
                  />
                  <button
                    onClick={() => removeParam(param.id)}
                    className="size-8 rounded-lg flex items-center justify-center text-muted-foreground/30 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button
            onClick={addParam}
            className="w-full py-2 rounded-lg border border-dashed border-border/20 text-xs text-muted-foreground/40 hover:text-muted-foreground/60 hover:border-border/40 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="size-3" /> Add parameter
          </button>
        </div>

        {/* Generated URL */}
        <div>
          <p className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest mb-2">Generated URL</p>
          <div className="rounded-xl border bg-muted/10 px-4 py-3 overflow-x-auto">
            <p className="text-sm font-mono">
              <span className="text-emerald-400 font-bold">GET</span>
              <span className="text-muted-foreground/60"> {basePath}</span>
              {queryString && (
                <span className="text-blue-400">{queryString}</span>
              )}
            </p>
          </div>
        </div>

        {/* Parsed result */}
        <div className="flex items-start gap-3">
          <ArrowRight className="size-4 text-muted-foreground/20 mt-1 shrink-0" />
          <div className="flex-1">
            <p className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest mb-2">FastAPI Receives</p>
            <div className="rounded-xl border bg-muted/10 px-4 py-3">
              {Object.keys(parsed).length === 0 ? (
                <p className="text-sm text-muted-foreground/30 italic">No query parameters</p>
              ) : (
                <div className="space-y-1.5">
                  {Object.entries(parsed).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-sm font-mono">
                      <span className="text-blue-400 font-semibold">{key}</span>
                      <span className="text-muted-foreground/30">=</span>
                      {Array.isArray(value) ? (
                        <span className="text-purple-400">
                          [{value.map((v, i) => (
                            <span key={i}>&quot;{v}&quot;{i < value.length - 1 ? ", " : ""}</span>
                          ))}]
                          <span className="text-xs text-muted-foreground/40 ml-2">list[str]</span>
                        </span>
                      ) : (
                        <span className="text-emerald-400">&quot;{value}&quot;</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* List detection note */}
            <AnimatePresence>
              {Object.values(parsed).some((v) => Array.isArray(v)) && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-purple-400/60 mt-2"
                >
                  Repeated keys automatically become <code className="font-mono bg-purple-500/10 px-1 rounded">list[str]</code> in FastAPI
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
