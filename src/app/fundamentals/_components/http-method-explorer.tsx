"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface HttpMethod {
  method: string;
  color: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    activeBg: string;
  };
  purpose: string;
  whenToUse: string;
  example: string;
  exampleResponse: string;
  hasBody: boolean;
}

const HTTP_METHODS: HttpMethod[] = [
  {
    method: "GET",
    color: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      badge: "bg-emerald-500",
      activeBg: "bg-emerald-500/5",
    },
    purpose: "Retrieve data from the server without modifying anything.",
    whenToUse: "Fetching a list of items, reading a user profile, or loading page data.",
    example: "GET /items/42",
    exampleResponse: "200 OK",
    hasBody: false,
  },
  {
    method: "POST",
    color: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-400",
      badge: "bg-blue-500",
      activeBg: "bg-blue-500/5",
    },
    purpose: "Create a new resource on the server.",
    whenToUse: "Submitting a form, creating a new user, or uploading data.",
    example: "POST /items",
    exampleResponse: "201 Created",
    hasBody: true,
  },
  {
    method: "PUT",
    color: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-400",
      badge: "bg-amber-500",
      activeBg: "bg-amber-500/5",
    },
    purpose: "Replace an entire resource with new data.",
    whenToUse: "Updating all fields of a user profile or replacing a configuration.",
    example: "PUT /items/42",
    exampleResponse: "200 OK",
    hasBody: true,
  },
  {
    method: "PATCH",
    color: {
      bg: "bg-violet-500/10",
      border: "border-violet-500/30",
      text: "text-violet-400",
      badge: "bg-violet-500",
      activeBg: "bg-violet-500/5",
    },
    purpose: "Partially update a resource with only the changed fields.",
    whenToUse: "Changing just the email on a user profile without touching other fields.",
    example: "PATCH /items/42",
    exampleResponse: "200 OK",
    hasBody: true,
  },
  {
    method: "DELETE",
    color: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-400",
      badge: "bg-red-500",
      activeBg: "bg-red-500/5",
    },
    purpose: "Remove a resource from the server.",
    whenToUse: "Deleting a user account, removing an item, or clearing a session.",
    example: "DELETE /items/42",
    exampleResponse: "204 No Content",
    hasBody: false,
  },
];

export function HttpMethodExplorer() {
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);

  return (
    <div className="w-full rounded-xl border bg-card/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">HTTP Method Explorer</h3>
        <span className="text-[10px] text-muted-foreground/50">
          Click a method to explore
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {HTTP_METHODS.map((m) => {
          const isExpanded = expandedMethod === m.method;

          return (
            <motion.button
              key={m.method}
              onClick={() => setExpandedMethod(isExpanded ? null : m.method)}
              layout
              className={cn(
                "rounded-lg border p-3 text-left cursor-pointer transition-colors",
                isExpanded
                  ? cn(m.color.activeBg, m.color.border, "col-span-2 sm:col-span-5")
                  : "border-border/50 hover:border-border"
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-xs font-mono font-bold",
                    m.color.bg,
                    m.color.text
                  )}
                >
                  {m.method}
                </span>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-border/30 space-y-2.5 overflow-hidden"
                  >
                    <div>
                      <p className="text-[11px] text-muted-foreground font-medium mb-0.5">
                        Purpose
                      </p>
                      <p className="text-xs">{m.purpose}</p>
                    </div>

                    <div>
                      <p className="text-[11px] text-muted-foreground font-medium mb-0.5">
                        When to use
                      </p>
                      <p className="text-xs">{m.whenToUse}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-[11px] text-muted-foreground font-medium mb-0.5">
                          Example
                        </p>
                        <code className={cn("text-[11px] font-mono", m.color.text)}>
                          {m.example} {"\u2192"} {m.exampleResponse}
                        </code>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground font-medium">
                        Has body?
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                          m.hasBody
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {m.hasBody ? "Yes" : "No"}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
