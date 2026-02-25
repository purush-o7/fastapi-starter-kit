"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { CommonMistakes, type Mistake } from "@/components/common-mistakes";
import { RoughHighlight } from "@/components/rough-highlight";
import { AutoAnimateGrid } from "@/components/auto-animate-grid";
import { VenvIsolationViz } from "../_components/venv-isolation-viz";
import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { ConversationalCallout } from "@/components/conversational-callout";
import { SimpleFlow } from "@/components/simple-flow";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { AhaMoment } from "@/components/aha-moment";
import { FailureDeepDive } from "@/components/failure-deep-dive";

const mistakes: Mistake[] = [
  {
    title: "Installing packages globally",
    subtitle: "Not activating a virtual environment before pip install",
    wrongCode: `# No virtual environment active!
pip install fastapi uvicorn
# Packages installed globally — conflicts with other projects`,
    rightCode: `# Create and activate venv first
python -m venv .venv
source .venv/bin/activate  # Mac/Linux
# .venv\\Scripts\\activate   # Windows

pip install fastapi uvicorn
# Packages isolated to this project only`,
    filename: "terminal",
    explanation: "Without an active virtual environment, pip installs packages globally. This causes version conflicts between projects and makes it impossible to reproduce your exact setup.",
  },
  {
    title: "Forgetting to freeze dependencies",
    subtitle: "Not saving installed packages to requirements.txt",
    wrongCode: `pip install fastapi uvicorn httpx
# Works on your machine...
# But your teammate clones the repo and has no idea
# what packages to install!`,
    rightCode: `pip install fastapi uvicorn httpx

# Save all packages with exact versions
pip freeze > requirements.txt

# Now anyone can recreate your environment:
# pip install -r requirements.txt`,
    filename: "terminal",
    explanation: "Without requirements.txt, no one else can reproduce your environment. Always run pip freeze after installing new packages to keep the file up to date.",
  },
];

export default function PythonSetupPage() {
  return (
    <div className="max-w-4xl ambient-fundamentals">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Python Setup</h1>
          <Badge variant="outline">Fundamentals</Badge>
        </div>
        <TextEffect
          preset="fade-in-blur"
          per="word"
          delay={0.1}
          className="text-lg text-muted-foreground max-w-2xl"
        >
          You just installed FastAPI. So why can&apos;t Python find it? Let&apos;s fix that — and make sure it never happens again.
        </TextEffect>
      </div>

      {/* 1. Failure hook */}
      <WhatCouldGoWrong
        scenario="You install FastAPI, run uvicorn main:app, and get: ModuleNotFoundError. You literally just installed it. What went wrong?"
        error={`$ uvicorn main:app --reload\nTraceback (most recent call last):\n  File "main.py", line 1\n    from fastapi import FastAPI\nModuleNotFoundError: No module named 'fastapi'`}
        errorType="ModuleNotFoundError"
        accentColor="rose"
        className="mb-8"
      />

      {/* 2. Bridge from failure to concept */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          You ran <code className="text-sm bg-muted px-1.5 py-0.5 rounded">pip install fastapi</code> and it said &quot;Successfully installed.&quot; So where did it go? The answer: it went to the <em>wrong</em> Python. And that&apos;s exactly the problem virtual environments solve.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model BEFORE code */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The Two Paths: Global vs. Isolated</h2>
          <p className="text-muted-foreground mb-4">
            Without a virtual environment, every project shares the same pile of packages. With one, each project gets its own sandbox. Here&apos;s the difference at a glance:
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-red-400 mb-2">The wrong way:</p>
              <SimpleFlow
                steps={[
                  { label: "System Python", detail: "Shared by everything", status: "error" },
                  { label: "pip install", status: "error" },
                  { label: "System packages", detail: "Version conflicts!", status: "error" },
                ]}
                accentColor="rose"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-400 mb-2">The right way:</p>
              <SimpleFlow
                steps={[
                  { label: "Venv Python", detail: "Project-specific", status: "success" },
                  { label: "pip install", status: "success" },
                  { label: "Isolated packages", detail: "No conflicts!", status: "success" },
                ]}
                accentColor="rose"
              />
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 4. Checkpoint */}
      <WhatYouJustLearned
        points={[
          "ModuleNotFoundError usually means you installed to the wrong Python",
          "Without a venv, packages go to the global system Python",
          "Virtual environments give each project its own isolated set of packages",
        ]}
        section="Why venvs exist"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 5. Code walkthrough — creating a venv */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Why Virtual Environments?</h2>
          <p className="text-muted-foreground mb-4">
            Without virtual environments, every Python project on your machine shares the same <RoughHighlight type="highlight" color="#f43f5e">global packages</RoughHighlight>. This leads to <RoughHighlight type="underline" color="#f43f5e">version conflicts</RoughHighlight>: Project A needs FastAPI 0.100, but Project B needs 0.115. Update one, break the other.
          </p>
          <p className="text-muted-foreground">
            Virtual environments solve this by giving each project its own <RoughHighlight type="box" color="#f43f5e">isolated sandbox</RoughHighlight> of packages. Each project gets exactly the versions it needs, with zero interference.
          </p>
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Interactive visualization (KEEP as-is) */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Visualize: Package Isolation</h2>
          <p className="text-muted-foreground mb-4">See what happens when two projects share global packages versus using isolated virtual environments.</p>
          <VenvIsolationViz />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Creating a Virtual Environment</h2>
          <p className="text-muted-foreground mb-4">
            Python ships with <code className="text-sm bg-muted px-1.5 py-0.5 rounded">venv</code> built in — no extra installs needed. Create it, activate it, and you&apos;ll see the environment name in your terminal prompt. That&apos;s how you know it&apos;s working.
          </p>
          <CodeBlock
            code={`# Create virtual environment
python -m venv .venv

# Activate it
# Windows:
.venv\\Scripts\\activate
# Mac / Linux:
source .venv/bin/activate

# You'll see (.venv) in your prompt — that means it's active!
# When you're done:
deactivate`}
            filename="terminal"
          />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="warning" className="mb-8">
        <p>
          If you don&apos;t see <code className="text-sm bg-muted px-1.5 py-0.5 rounded">(.venv)</code> in your terminal prompt, the environment isn&apos;t active. Any <code className="text-sm bg-muted px-1.5 py-0.5 rounded">pip install</code> you run will go to your system Python instead. Always check the prompt before installing anything.
        </p>
      </ConversationalCallout>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Installing Packages</h2>
          <p className="text-muted-foreground mb-4">
            With your venv activated, use <code className="text-sm bg-muted px-1.5 py-0.5 rounded">pip</code> to install packages. They&apos;ll only exist inside this environment — other projects won&apos;t even know they&apos;re there.
          </p>
          <CodeBlock
            code={`# Install FastAPI and Uvicorn (the server)
pip install fastapi uvicorn

# Pin to a specific version if you need to
pip install fastapi==0.115.0

# See everything that's installed
pip list

# Save your packages to a file (do this after every install!)
pip freeze > requirements.txt`}
            filename="terminal"
          />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="Why do I need to 'freeze' my packages? Can't my teammate just run pip install fastapi?"
        reveal="They could — but they'd get whatever the latest version is, which might be different from yours. pip freeze captures exact versions (like fastapi==0.115.0) so everyone gets identical environments. It's the difference between 'install FastAPI' and 'install the exact same FastAPI you're using.'"
        className="mb-8"
      />

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">requirements.txt: Your Project&apos;s Recipe</h2>
          <p className="text-muted-foreground mb-4">
            This file is the standard way to share your project&apos;s dependencies. It lists every package with its exact version — so anyone can recreate your environment perfectly.
          </p>
          <CodeBlock
            code={`fastapi==0.115.0
uvicorn==0.32.0
pydantic==2.10.0
python-dotenv==1.0.1`}
            filename="requirements.txt"
          />
          <p className="text-muted-foreground mt-4">
            Your teammate clones the repo and runs one command:
          </p>
          <CodeBlock
            code={`# Recreate the exact same environment
pip install -r requirements.txt`}
            filename="terminal"
          />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        points={[
          "Always create and activate a venv before installing packages",
          "pip install puts packages in whatever Python is currently active",
          "pip freeze > requirements.txt saves exact versions for reproducibility",
          "pip install -r requirements.txt recreates an environment from scratch",
        ]}
        section="Setup workflow"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Failure deep dive */}
      <FailureDeepDive
        title="The 'I just installed it!' problem"
        scenario="You open a new terminal, forget to activate the venv, and install a package. It goes to your system Python. Then you activate the venv and the package isn't there."
        code={`# Terminal 1 — you forgot to activate the venv
pip install httpx
# Installing to system Python...

# Terminal 2 — venv is active
source .venv/bin/activate
python -c "import httpx"
# ModuleNotFoundError: No module named 'httpx'`}
        error={`ModuleNotFoundError: No module named 'httpx'`}
        explanation="pip installed httpx into your system Python, not your virtual environment. The venv has its own separate set of packages, so it can't see what's installed globally."
        fix="Always activate the venv first. Check your prompt for (.venv) before running pip install."
        fixCode={`# Always activate first!
source .venv/bin/activate  # or .venv\\Scripts\\activate on Windows

# Now install — it goes to the right place
pip install httpx

# Verify it's there
pip list | grep httpx
# httpx 0.27.0 ✓`}
        filename="terminal"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="You have Python 3.11 and 3.12 installed. You create a venv with 3.11 but pip install from the global terminal. Which Python gets the package?"
        options={[
          { label: "Python 3.11 (the venv)", correct: false, explanation: "Nope — the venv isn't active, so pip doesn't know about it." },
          { label: "Whichever python 'pip' points to (probably 3.12)", correct: true, explanation: "Correct! Without activating the venv, pip installs to whatever Python it's linked to globally." },
          { label: "Both Python versions", correct: false, explanation: "pip only installs to one Python at a time — whichever it's currently linked to." },
          { label: "Neither — it fails", correct: false, explanation: "It won't fail — it'll happily install to the wrong place, which is almost worse." },
        ]}
        hint="What happens when the venv isn't activated?"
        answer="The global Python gets it — whichever version 'pip' points to (probably 3.12). Your 3.11 venv won't have the package. Always activate the venv first, or use 'python -m pip install' to be explicit about which Python you're targeting."
        className="mb-8"
      />

      <Separator className="my-8" />

      <AhaMoment
        setup="Is there a way to check which Python my pip is actually installing to?"
        reveal="Run 'pip --version' — it shows the exact Python path. If it says something like '/usr/lib/python3.12/site-packages', that's your system Python. If it says '.venv/lib/python3.11/site-packages', you're in the venv. You can also use 'which pip' (Mac/Linux) or 'where pip' (Windows) to see the path."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Key Points grid (KEEP existing) */}
      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <AutoAnimateGrid className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4 transition-colors hover:border-rose-500/30 hover:bg-rose-500/5">
              <p className="text-sm font-medium mb-1">Always Use Venvs</p>
              <p className="text-xs text-muted-foreground">Isolate each project to avoid dependency conflicts between projects</p>
            </div>
            <div className="rounded-lg border p-4 transition-colors hover:border-rose-500/30 hover:bg-rose-500/5">
              <p className="text-sm font-medium mb-1">pip Installs Packages</p>
              <p className="text-xs text-muted-foreground">Use pip install to add packages to your active virtual environment</p>
            </div>
            <div className="rounded-lg border p-4 transition-colors hover:border-rose-500/30 hover:bg-rose-500/5">
              <p className="text-sm font-medium mb-1">pip freeze Saves Deps</p>
              <p className="text-xs text-muted-foreground">Snapshot your installed packages with exact versions to a file</p>
            </div>
            <div className="rounded-lg border p-4 transition-colors hover:border-rose-500/30 hover:bg-rose-500/5">
              <p className="text-sm font-medium mb-1">requirements.txt Shares Deps</p>
              <p className="text-xs text-muted-foreground">Anyone can recreate your environment with pip install -r requirements.txt</p>
            </div>
          </AutoAnimateGrid>
        </section>
      </ScrollReveal>

      {/* CommonMistakes (KEEP existing) */}
      <CommonMistakes mistakes={mistakes} />
    </div>
  );
}
