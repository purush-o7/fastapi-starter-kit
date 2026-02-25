"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { CommonMistakes, type Mistake } from "@/components/common-mistakes";

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
          Virtual environments, pip, and requirements.txt — the essential tools for managing Python projects cleanly.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Why Virtual Environments?</h2>
          <p className="text-muted-foreground mb-4">
            Without virtual environments, every Python project on your machine shares the same global packages. This leads to version conflicts: Project A needs FastAPI 0.100, but Project B needs 0.115. Updating one breaks the other.
          </p>
          <p className="text-muted-foreground">
            Virtual environments solve this by giving each project its own isolated sandbox of packages. Each project gets exactly the versions it needs, with zero interference from other projects.
          </p>
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Creating a Virtual Environment</h2>
          <p className="text-muted-foreground mb-4">
            Python ships with the <code className="text-sm bg-muted px-1.5 py-0.5 rounded">venv</code> module built in. Create a virtual environment, activate it, and your terminal will show the environment name in the prompt.
          </p>
          <CodeBlock
            code={`# Create virtual environment
python -m venv .venv

# Activate it
# Windows:
.venv\\Scripts\\activate
# Mac / Linux:
source .venv/bin/activate

# You'll see (.venv) in your prompt
# Deactivate when done:
deactivate`}
            filename="terminal"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Installing Packages</h2>
          <p className="text-muted-foreground mb-4">
            With your virtual environment activated, use <code className="text-sm bg-muted px-1.5 py-0.5 rounded">pip</code> to install packages. They&apos;ll only be available inside this environment.
          </p>
          <CodeBlock
            code={`# Install FastAPI and Uvicorn
pip install fastapi uvicorn

# Install a specific version
pip install fastapi==0.115.0

# See what's installed
pip list

# Save current packages to a file
pip freeze > requirements.txt`}
            filename="terminal"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">requirements.txt</h2>
          <p className="text-muted-foreground mb-4">
            The <code className="text-sm bg-muted px-1.5 py-0.5 rounded">requirements.txt</code> file is the standard way to share and reproduce your project&apos;s dependencies. It lists every package with its exact version.
          </p>
          <CodeBlock
            code={`fastapi==0.115.0
uvicorn==0.32.0
pydantic==2.10.0
python-dotenv==1.0.1`}
            filename="requirements.txt"
          />
          <p className="text-muted-foreground mt-4">
            Anyone can recreate your exact environment with a single command:
          </p>
          <CodeBlock
            code={`pip install -r requirements.txt`}
            filename="terminal"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Always Use Venvs</p>
              <p className="text-xs text-muted-foreground">Isolate each project to avoid dependency conflicts between projects</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">pip Installs Packages</p>
              <p className="text-xs text-muted-foreground">Use pip install to add packages to your active virtual environment</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">pip freeze Saves Deps</p>
              <p className="text-xs text-muted-foreground">Snapshot your installed packages with exact versions to a file</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">requirements.txt Shares Deps</p>
              <p className="text-xs text-muted-foreground">Anyone can recreate your environment with pip install -r requirements.txt</p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <CommonMistakes mistakes={mistakes} />
    </div>
  );
}
