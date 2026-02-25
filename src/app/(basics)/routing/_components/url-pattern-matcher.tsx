"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Pattern {
  decorator: string;
  pattern: string;
  regex: RegExp;
  handler: string;
  example: string;
}

const PATTERNS: Pattern[] = [
  {
    decorator: "@app.get",
    pattern: '"/"',
    regex: /^\/$/,
    handler: "root()",
    example: "/",
  },
  {
    decorator: "@app.get",
    pattern: '"/items"',
    regex: /^\/items$/,
    handler: "read_items()",
    example: "/items",
  },
  {
    decorator: "@app.get",
    pattern: '"/items/{item_id}"',
    regex: /^\/items\/[^/]+$/,
    handler: "get_item(item_id=...)",
    example: "/items/42",
  },
];

export function UrlPatternMatcher() {
  const [url, setUrl] = useState("");

  const matchedIndex = url
    ? PATTERNS.findIndex((p) => p.regex.test(url))
    : -1;
  const hasInput = url.length > 0;

  return (
    <div className="w-full rounded-xl border bg-card/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Search className="size-4 text-teal-500" />
        <h3 className="text-sm font-semibold">URL Pattern Matcher</h3>
      </div>

      {/* Input */}
      <div className="relative mb-5">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-sm font-mono">
          GET
        </span>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Type a URL path like /items/42"
          className="w-full rounded-lg border bg-muted/30 pl-12 pr-4 py-2.5 text-sm font-mono placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 transition-all"
        />
      </div>

      {/* Patterns */}
      <div className="space-y-2">
        {PATTERNS.map((pattern, index) => {
          const isMatch = hasInput && matchedIndex === index;
          const isNoMatch = hasInput && matchedIndex !== index;

          return (
            <motion.div
              key={pattern.pattern}
              animate={{
                opacity: isNoMatch ? 0.35 : 1,
                scale: isMatch ? 1.02 : 1,
              }}
              transition={{ duration: 0.2 }}
              className={cn(
                "relative rounded-lg border p-3 transition-colors duration-300",
                isMatch
                  ? "border-teal-500/50 bg-teal-500/5"
                  : "border-border/50 bg-muted/20"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <code className="text-xs font-mono text-muted-foreground">
                    {pattern.decorator}(
                    <span className={cn(isMatch ? "text-teal-400 font-bold" : "text-foreground")}>
                      {pattern.pattern}
                    </span>
                    )
                  </code>
                </div>

                <AnimatePresence>
                  {isMatch && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="size-5 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0"
                    >
                      <Check className="size-3 text-teal-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {isMatch && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2 pt-2 border-t border-teal-500/20"
                >
                  <span className="text-[11px] text-muted-foreground">
                    Calls{" "}
                    <code className="text-teal-400 font-mono">{pattern.handler}</code>
                  </span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 404 indicator */}
      <AnimatePresence>
        {hasInput && matchedIndex === -1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <X className="size-3.5 text-red-400" />
            <span className="text-xs font-medium text-red-400">
              404 — No matching route for &quot;{url}&quot;
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!hasInput && (
        <p className="text-[10px] text-muted-foreground/50 mt-3">
          Try: <button onClick={() => setUrl("/")} className="text-teal-500/60 hover:text-teal-500 cursor-pointer">/</button>
          {" "}<button onClick={() => setUrl("/items")} className="text-teal-500/60 hover:text-teal-500 cursor-pointer">/items</button>
          {" "}<button onClick={() => setUrl("/items/42")} className="text-teal-500/60 hover:text-teal-500 cursor-pointer">/items/42</button>
          {" "}<button onClick={() => setUrl("/users")} className="text-teal-500/60 hover:text-teal-500 cursor-pointer">/users</button>
        </p>
      )}
    </div>
  );
}
