"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface StatusCode {
  code: number;
  text: string;
  description: string;
  when: string;
  example: string;
  category: "success" | "client" | "server";
}

const STATUS_CODES: StatusCode[] = [
  { code: 200, text: "OK", description: "Request succeeded", when: "Returning data or confirming action", example: 'return {"item": "Widget"}', category: "success" },
  { code: 201, text: "Created", description: "Resource created", when: "After POST creates a new resource", example: "status_code=201", category: "success" },
  { code: 204, text: "No Content", description: "Success, no body", when: "DELETE or update with nothing to return", example: "status_code=204", category: "success" },
  { code: 400, text: "Bad Request", description: "Malformed request", when: "Invalid JSON or missing fields", example: "HTTPException(400)", category: "client" },
  { code: 401, text: "Unauthorized", description: "Auth required", when: "Missing or invalid credentials", example: "HTTPException(401)", category: "client" },
  { code: 403, text: "Forbidden", description: "Not allowed", when: "Valid auth but no permission", example: "HTTPException(403)", category: "client" },
  { code: 404, text: "Not Found", description: "Resource missing", when: "Item doesn't exist in database", example: "HTTPException(404)", category: "client" },
  { code: 422, text: "Validation Error", description: "Invalid data", when: "FastAPI auto-returns for bad types", example: "Automatic", category: "client" },
  { code: 500, text: "Server Error", description: "Internal error", when: "Unhandled exception in your code", example: "Custom handler", category: "server" },
  { code: 503, text: "Unavailable", description: "Service down", when: "Database or external service offline", example: "HTTPException(503)", category: "server" },
];

const CATEGORY_COLORS = {
  success: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", badge: "bg-emerald-500" },
  client: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", badge: "bg-amber-500" },
  server: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", badge: "bg-red-500" },
};

export function StatusCodeExplorer() {
  const [expandedCode, setExpandedCode] = useState<number | null>(null);

  return (
    <div className="w-full rounded-xl border bg-card/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">HTTP Status Code Explorer</h3>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500" /> 2xx Success</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-500" /> 4xx Client</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-red-500" /> 5xx Server</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {STATUS_CODES.map((sc) => {
          const colors = CATEGORY_COLORS[sc.category];
          const isExpanded = expandedCode === sc.code;

          return (
            <motion.button
              key={sc.code}
              onClick={() => setExpandedCode(isExpanded ? null : sc.code)}
              layout
              className={cn(
                "rounded-lg border p-2.5 text-left cursor-pointer transition-colors",
                isExpanded ? cn(colors.bg, colors.border) : "border-border/50 hover:border-border",
                isExpanded && "col-span-2 sm:col-span-5"
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-mono font-bold", colors.text)}>
                  {sc.code}
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {sc.text}
                </span>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 pt-2 border-t border-border/30 space-y-1.5 overflow-hidden"
                  >
                    <p className="text-xs font-medium">{sc.description}</p>
                    <p className="text-[11px] text-muted-foreground">
                      <span className="font-medium">When:</span> {sc.when}
                    </p>
                    <code className={cn("text-[11px] font-mono block", colors.text)}>
                      {sc.example}
                    </code>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground/50 mt-3 text-center">
        Click any status code to see details
      </p>
    </div>
  );
}
