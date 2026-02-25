"use client";

import { useState } from "react";
import { X, Check, ChevronDown, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { CodeBlock } from "@/components/code-block";

export interface Mistake {
  title: string;
  subtitle: string;
  wrongCode: string;
  rightCode: string;
  filename: string;
  explanation: string;
}

function MistakeCard({
  mistake,
  index,
}: {
  mistake: Mistake;
  index: number;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold font-mono mt-0.5">
            {index + 1}
          </span>
          <div className="space-y-1">
            <CardTitle className="text-base">{mistake.title}</CardTitle>
            <CardDescription>{mistake.subtitle}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <Tabs defaultValue="wrong">
          <TabsList className="w-fit">
            <TabsTrigger
              value="wrong"
              className="flex items-center gap-1.5 data-[state=active]:text-red-500"
            >
              <X className="size-3.5" />
              Wrong
            </TabsTrigger>
            <TabsTrigger
              value="right"
              className="flex items-center gap-1.5 data-[state=active]:text-green-500"
            >
              <Check className="size-3.5" />
              Fixed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wrong">
            <div className="rounded-xl border border-red-500/20 overflow-hidden [&_.group\/code]:my-0 [&_.group\/code]:rounded-none [&_.group\/code]:border-0 [&_.group\/code]:shadow-none">
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-red-500/15 bg-red-500/[0.06]">
                <X className="size-3 text-red-500" />
                <span className="text-[11px] text-red-400 font-medium">
                  Don&apos;t do this
                </span>
              </div>
              <CodeBlock code={mistake.wrongCode} filename={mistake.filename} />
            </div>
          </TabsContent>

          <TabsContent value="right">
            <div className="rounded-xl border border-green-500/20 overflow-hidden [&_.group\/code]:my-0 [&_.group\/code]:rounded-none [&_.group\/code]:border-0 [&_.group\/code]:shadow-none">
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-green-500/15 bg-green-500/[0.06]">
                <Check className="size-3 text-green-500" />
                <span className="text-[11px] text-green-400 font-medium">
                  Do this instead
                </span>
              </div>
              <CodeBlock
                code={mistake.rightCode}
                filename={mistake.filename}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="rounded-lg bg-muted/50 border border-border/50 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
          {mistake.explanation}
        </div>
      </CardContent>
    </Card>
  );
}

interface CommonMistakesProps {
  mistakes: Mistake[];
}

export function CommonMistakes({ mistakes }: CommonMistakesProps) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <section className="space-y-4">
        <CollapsibleTrigger className="flex w-full items-center justify-between group cursor-pointer">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-5 text-amber-500" />
            <h2 className="text-2xl font-bold">Common Mistakes</h2>
            <Badge variant="secondary" className="font-mono text-xs">
              {mistakes.length}
            </Badge>
          </div>
          <ChevronDown className="size-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              These are the patterns that trip up developers most often. Switch
              between{" "}
              <span className="font-medium text-red-400">Wrong</span> and{" "}
              <span className="font-medium text-green-400">Fixed</span> to
              compare the code side by side.
            </p>
          </div>

          {mistakes.map((mistake, i) => (
            <MistakeCard key={mistake.title} mistake={mistake} index={i} />
          ))}
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}
