"use client";

import { motion } from "motion/react";
import { Bug, AlertCircle, HelpCircle, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/code-block";

interface FailureDeepDiveProps {
  title: string;
  scenario: string;
  code: string;
  error: string;
  explanation: string;
  fix: string;
  fixCode: string;
  filename?: string;
  className?: string;
}

export function FailureDeepDive({
  title,
  scenario,
  code,
  error,
  explanation,
  fix,
  fixCode,
  filename,
  className,
}: FailureDeepDiveProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn("rounded-xl border overflow-hidden", className)}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2.5 px-5 py-3 border-b bg-muted/30">
        <Bug className="size-4 text-red-500" />
        <p className="text-sm font-semibold">{title}</p>
      </div>

      {/* Scenario description */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-sm text-muted-foreground leading-relaxed italic">
          {scenario}
        </p>
      </div>

      {/* Tabbed content */}
      <div className="px-5 pb-5">
        <Tabs defaultValue="code" className="mt-3">
          <TabsList className="w-fit">
            <TabsTrigger
              value="code"
              className="flex items-center gap-1.5 text-xs data-[state=active]:text-red-500"
            >
              <Bug className="size-3" />
              The Code
            </TabsTrigger>
            <TabsTrigger
              value="error"
              className="flex items-center gap-1.5 text-xs data-[state=active]:text-orange-500"
            >
              <AlertCircle className="size-3" />
              The Error
            </TabsTrigger>
            <TabsTrigger
              value="why"
              className="flex items-center gap-1.5 text-xs data-[state=active]:text-blue-500"
            >
              <HelpCircle className="size-3" />
              Why?
            </TabsTrigger>
            <TabsTrigger
              value="fix"
              className="flex items-center gap-1.5 text-xs data-[state=active]:text-emerald-500"
            >
              <Wrench className="size-3" />
              The Fix
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code">
            <div className="rounded-xl border border-red-500/20 overflow-hidden [&_.group\/code]:my-0 [&_.group\/code]:rounded-none [&_.group\/code]:border-0 [&_.group\/code]:shadow-none">
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-red-500/15 bg-red-500/[0.06]">
                <Bug className="size-3 text-red-500" />
                <span className="text-[11px] text-red-400 font-medium">
                  Broken code
                </span>
              </div>
              <CodeBlock code={code} filename={filename} />
            </div>
          </TabsContent>

          <TabsContent value="error">
            <div className="rounded-lg overflow-hidden border border-border/40 bg-[#1c1e26]">
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/[0.06] bg-white/[0.03]">
                <AlertCircle className="size-3 text-orange-500" />
                <span className="text-[11px] text-zinc-500 font-mono">
                  output
                </span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-[13px] leading-relaxed font-mono text-red-400/90 whitespace-pre-wrap">
                  {error}
                </pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="why">
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.04] p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {explanation}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="fix">
            <div className="space-y-3">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {fix}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 overflow-hidden [&_.group\/code]:my-0 [&_.group\/code]:rounded-none [&_.group\/code]:border-0 [&_.group\/code]:shadow-none">
                <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-emerald-500/15 bg-emerald-500/[0.06]">
                  <Wrench className="size-3 text-emerald-500" />
                  <span className="text-[11px] text-emerald-400 font-medium">
                    Fixed code
                  </span>
                </div>
                <CodeBlock code={fixCode} filename={filename} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
