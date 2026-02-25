"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Method {
  id: string;
  method: string;
  label: string;
  crud: string;
  color: string;
  idempotent: boolean;
  hasBody: boolean;
  description: string;
  example: { path: string; body?: string; response: string; status: number };
}

const METHODS: Method[] = [
  {
    id: "get", method: "GET", label: "Read", crud: "READ", color: "#10b981",
    idempotent: true, hasBody: false,
    description: "Retrieve data. Should never modify anything on the server. Safe to call multiple times.",
    example: { path: "/items?skip=0&limit=10", response: '[{"id": 1, "name": "Widget"}]', status: 200 },
  },
  {
    id: "post", method: "POST", label: "Create", crud: "CREATE", color: "#3b82f6",
    idempotent: false, hasBody: true,
    description: "Create a new resource. Each call creates a new item — calling twice = two items.",
    example: { path: "/items", body: '{"name": "Widget", "price": 9.99}', response: '{"id": 1, "name": "Widget"}', status: 201 },
  },
  {
    id: "put", method: "PUT", label: "Replace", crud: "UPDATE", color: "#f59e0b",
    idempotent: true, hasBody: true,
    description: "Replace an entire resource. Send the full object — missing fields get reset.",
    example: { path: "/items/1", body: '{"name": "Gadget", "price": 19.99}', response: '{"id": 1, "name": "Gadget"}', status: 200 },
  },
  {
    id: "patch", method: "PATCH", label: "Update", crud: "UPDATE", color: "#8b5cf6",
    idempotent: true, hasBody: true,
    description: "Partially update a resource. Only send the fields you want to change.",
    example: { path: "/items/1", body: '{"price": 14.99}', response: '{"id": 1, "name": "Gadget", "price": 14.99}', status: 200 },
  },
  {
    id: "delete", method: "DELETE", label: "Delete", crud: "DELETE", color: "#ef4444",
    idempotent: true, hasBody: false,
    description: "Remove a resource. Calling twice on the same resource: first succeeds, second returns 404.",
    example: { path: "/items/1", response: "null", status: 204 },
  },
];

export function HttpMethodExplorer() {
  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      <div className="px-5 py-3.5 border-b bg-muted/20 flex items-center gap-2.5">
        <div className="size-2 rounded-full bg-teal-400 animate-pulse" />
        <span className="text-sm font-semibold tracking-wide">HTTP Methods — Visual Guide</span>
      </div>

      <Tabs defaultValue="get" className="gap-0">
        <div className="px-4 pt-3 pb-0 border-b border-border/20 bg-muted/5">
          <TabsList variant="line" className="w-full sm:w-auto">
            {METHODS.map((m) => (
              <TabsTrigger key={m.id} value={m.id} className="text-xs gap-1.5 font-mono">
                <span className="size-2 rounded-full" style={{ backgroundColor: m.color }} />
                {m.method}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {METHODS.map((m) => (
          <TabsContent key={m.id} value={m.id} className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <span className="text-lg font-mono font-bold px-3 py-1 rounded-lg" style={{ color: m.color, backgroundColor: `${m.color}12` }}>
                {m.method}
              </span>
              <div>
                <p className="text-sm font-semibold">{m.label}</p>
                <p className="text-[11px] text-muted-foreground/50">{m.crud} operation</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground/70 leading-relaxed">{m.description}</p>

            {/* Properties */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className={cn("size-2 rounded-full", m.idempotent ? "bg-emerald-400" : "bg-amber-400")} />
                <span className="text-xs text-muted-foreground/60">
                  {m.idempotent ? "Idempotent" : "Not idempotent"} — {m.idempotent ? "safe to retry" : "each call has side effects"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={cn("size-2 rounded-full", m.hasBody ? "bg-blue-400" : "bg-muted-foreground/20")} />
                <span className="text-xs text-muted-foreground/60">
                  {m.hasBody ? "Has request body" : "No request body"}
                </span>
              </div>
            </div>

            {/* Request / Response */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Request */}
              <div className="rounded-xl border border-border/15 bg-muted/5 p-4">
                <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-2">Request</p>
                <p className="text-sm font-mono font-semibold" style={{ color: m.color }}>
                  {m.method} {m.example.path}
                </p>
                {m.example.body && (
                  <pre className="mt-2 text-xs font-mono text-muted-foreground/60 leading-relaxed bg-muted/10 rounded-lg p-2.5">
                    {m.example.body}
                  </pre>
                )}
                {!m.example.body && (
                  <p className="mt-2 text-xs text-muted-foreground/30 italic">No body</p>
                )}
              </div>

              {/* Response */}
              <div className="rounded-xl border border-border/15 bg-muted/5 p-4">
                <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-2">Response</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-mono font-bold" style={{ color: m.color }}>{m.example.status}</span>
                  <span className="text-xs text-muted-foreground/40">
                    {m.example.status === 200 ? "OK" : m.example.status === 201 ? "Created" : "No Content"}
                  </span>
                </div>
                <pre className="text-xs font-mono text-muted-foreground/60 leading-relaxed bg-muted/10 rounded-lg p-2.5">
                  {m.example.response}
                </pre>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
