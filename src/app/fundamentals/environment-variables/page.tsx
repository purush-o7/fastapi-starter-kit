"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { CommonMistakes, type Mistake } from "@/components/common-mistakes";
import { RoughHighlight } from "@/components/rough-highlight";
import { AutoAnimateGrid } from "@/components/auto-animate-grid";
import { EnvConfigViz } from "../_components/env-config-viz";
import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { ConversationalCallout } from "@/components/conversational-callout";
import { SimpleFlow } from "@/components/simple-flow";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { AhaMoment } from "@/components/aha-moment";
import { FailureDeepDive } from "@/components/failure-deep-dive";

const mistakes: Mistake[] = [
  {
    title: "Hardcoding secrets in source code",
    subtitle: "Putting passwords and API keys directly in Python files",
    wrongCode: `from fastapi import FastAPI

app = FastAPI()

DATABASE_URL = "postgresql://admin:p@ssw0rd@db.example.com/prod"
SECRET_KEY = "my-super-secret-jwt-key"
# These will end up on GitHub!`,
    rightCode: `from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str

    class Config:
        env_file = ".env"

settings = Settings()
# Secrets stay in .env, never in source code`,
    filename: "config.py",
    explanation: "Secrets in source code get committed to version control and become visible to anyone with repo access. Use .env files and pydantic-settings to keep secrets separate from code.",
  },
  {
    title: "Forgetting to .gitignore the .env file",
    subtitle: "Committing .env to version control by accident",
    wrongCode: `# .gitignore
__pycache__/
*.pyc
# Oops — .env is not listed!`,
    rightCode: `# .gitignore
__pycache__/
*.pyc
.env
.env.*
*.db`,
    filename: ".gitignore",
    explanation: "Even if you use .env files correctly, forgetting to add .env to .gitignore means your secrets get committed on the first git add. Always add .env to .gitignore before your first commit.",
  },
];

export default function EnvironmentVariablesPage() {
  return (
    <div className="max-w-4xl ambient-fundamentals">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Environment Variables</h1>
          <Badge variant="outline">Fundamentals</Badge>
        </div>
        <TextEffect
          preset="fade-in-blur"
          per="word"
          delay={0.1}
          className="text-lg text-muted-foreground max-w-2xl"
        >
          Your database password is in your source code. Someone just pushed it to GitHub. You have about 30 minutes before things get bad.
        </TextEffect>
      </div>

      {/* 1. Failure hook */}
      <WhatCouldGoWrong
        scenario="You push your code to GitHub. Within 30 minutes, someone has scraped your DATABASE_URL from the commit history and is running queries against your production database."
        error={`[SECURITY ALERT] GitHub detected a potential secret in your repository.\nCommit: a1b2c3d — "Add database config"\nFile: main.py — Line 5: DATABASE_URL = "postgresql://admin:p@ssw0rd@prod-db.example.com:5432/myapp"`}
        errorType="Security Alert"
        accentColor="rose"
        className="mb-8"
      />

      {/* 2. Bridge from failure to concept */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          How does this happen? You write a database URL in your code because you need it to work. You push to GitHub because you need to deploy. And now the entire internet can see your production password. The fix isn&apos;t &quot;be more careful&quot; — it&apos;s to keep secrets out of your code entirely.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model BEFORE code */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The Flow: Secrets Stay Outside Code</h2>
          <p className="text-muted-foreground mb-4">
            Here&apos;s the key idea: your code reads configuration from the environment, never from hardcoded values. This way, secrets live in a file that never gets committed.
          </p>
          <SimpleFlow
            steps={[
              { label: ".env file", detail: "Secrets live here (gitignored)" },
              { label: "load_dotenv() or pydantic-settings", detail: "Reads the file" },
              { label: "Environment variables", detail: "Available to your app" },
              { label: "Your code", detail: "Uses settings.database_url" },
            ]}
            accentColor="rose"
            className="mb-4"
          />
        </section>
      </ScrollReveal>

      {/* 4. Checkpoint */}
      <WhatYouJustLearned
        points={[
          "Secrets in source code get exposed when you push to GitHub",
          "Environment variables keep configuration outside your codebase",
          ".env files store secrets locally — and get gitignored so they're never committed",
        ]}
        section="Why env vars matter"
        className="mb-8"
      />

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Why Not Just Hardcode It?</h2>
          <p className="text-muted-foreground mb-4">
            Beyond security, there&apos;s a practical reason: <RoughHighlight type="highlight" color="#f43f5e">different environments need different values</RoughHighlight>. Your local database URL isn&apos;t the same as staging or production. Hardcoding means changing code every time you deploy somewhere new.
          </p>
          <p className="text-muted-foreground">
            <RoughHighlight type="box" color="#f43f5e">Environment variables</RoughHighlight> let you change configuration without changing code. Same codebase, different settings per environment.
          </p>
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 5. Code walkthrough — .env file */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The .env File</h2>
          <p className="text-muted-foreground mb-4">
            A <code className="text-sm bg-muted px-1.5 py-0.5 rounded">.env</code> file stores your configuration as simple key-value pairs. It lives in your project root and should <strong>never</strong> be committed to version control.
          </p>
          <CodeBlock
            code={`DATABASE_URL=postgresql://user:password@localhost/mydb
SECRET_KEY=super-secret-key-change-me
DEBUG=true
API_VERSION=v1`}
            filename=".env"
          />
          <ConversationalCallout type="warning" className="mt-4">
            <p>
              Add <code className="text-sm bg-muted px-1.5 py-0.5 rounded">.env</code> to your <code className="text-sm bg-muted px-1.5 py-0.5 rounded">.gitignore</code> <em>before your first commit</em>. If you add it after, the file is already in your git history — and removing it from history is a pain.
            </p>
          </ConversationalCallout>
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Loading with python-dotenv</h2>
          <p className="text-muted-foreground mb-4">
            The simplest approach: <code className="text-sm bg-muted px-1.5 py-0.5 rounded">python-dotenv</code> reads your .env file and makes the values available through <code className="text-sm bg-muted px-1.5 py-0.5 rounded">os.getenv()</code>. It works, but there&apos;s no type validation — everything comes back as a string.
          </p>
          <CodeBlock
            code={`from dotenv import load_dotenv
import os

load_dotenv()  # Load .env file into environment

DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-key")
# Careful — this is a string, not a boolean!
DEBUG = os.getenv("DEBUG", "false").lower() == "true"`}
            filename="config.py"
          />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="Wait — os.getenv('DEBUG') returns the string 'true', not the boolean True?"
        reveal="Yep! Environment variables are always strings. That's why os.getenv('DEBUG') == True is always False — you're comparing a string to a boolean. You need to parse it yourself, like checking if the value is 'true'. This is exactly why pydantic-settings is better: it handles type conversion automatically."
        className="mb-8"
      />

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Pydantic Settings (The Better Way)</h2>
          <p className="text-muted-foreground mb-4">
            For production apps, <code className="text-sm bg-muted px-1.5 py-0.5 rounded">pydantic-settings</code> is the move. It reads your .env file, validates types automatically, provides defaults, and gives you a clean settings object with IDE autocomplete.
          </p>
          <CodeBlock
            code={`from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str          # Required — app crashes if missing
    secret_key: str            # Required — no forgetting this one
    debug: bool = False        # Optional with default — auto-parsed!
    api_version: str = "v1"    # Optional with default

    class Config:
        env_file = ".env"

settings = Settings()
# settings.database_url → reads DATABASE_URL from .env
# settings.debug → True (auto-converted from string "true")
# Typo in your env var name? Pydantic catches it at startup.`}
            filename="config.py"
          />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        points={[
          "python-dotenv is simple but everything is a string — you parse types yourself",
          "pydantic-settings validates types, provides defaults, and catches missing vars at startup",
          "Both read from .env files — pydantic-settings just does more for you",
        ]}
        section="Loading config"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Go Deeper: override behavior */}
      <FailureDeepDive
        title="The sneaky override trap"
        scenario="You set DATABASE_URL in both your .env file and a Docker environment variable. Your app uses the wrong one and you spend an hour debugging."
        code={`# .env file
DATABASE_URL=postgresql://user:pass@localhost/dev

# Docker compose
environment:
  - DATABASE_URL=postgresql://user:pass@prod-db/prod

# config.py
from dotenv import load_dotenv
load_dotenv()  # Which value wins?`}
        error={`# You expected the Docker value (prod)
# But load_dotenv loaded the .env value (dev)
# ...or did it?`}
        explanation="By default, python-dotenv does NOT override existing environment variables. If DATABASE_URL is already set in your shell or Docker, the .env value is ignored. But with pydantic-settings, the behavior depends on your configuration."
        fix="Be explicit about override behavior. Use load_dotenv(override=True) if you want .env to always win, or leave it as default if shell/Docker should take priority."
        fixCode={`# Option 1: .env file overrides everything
from dotenv import load_dotenv
load_dotenv(override=True)  # .env always wins

# Option 2: Shell/Docker vars take priority (default)
load_dotenv()  # Existing env vars are NOT overwritten

# Option 3: With pydantic-settings (recommended)
class Settings(BaseSettings):
    database_url: str

    class Config:
        env_file = ".env"
        # Env vars from shell/Docker take priority over .env by default`}
        filename="config.py"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Interactive visualization (KEEP as-is) */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Try It: Config Validator</h2>
          <p className="text-muted-foreground mb-4">Edit the .env values and watch Pydantic Settings validate them in real-time.</p>
          <EnvConfigViz />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="If you set DATABASE_URL in both your .env file and your shell environment, which one does python-dotenv use by default?"
        options={[
          { label: "The .env file value always wins", correct: false, explanation: "That's only true if you pass override=True to load_dotenv()." },
          { label: "The shell environment value wins", correct: true, explanation: "Right! By default, load_dotenv() won't overwrite variables that already exist in the environment." },
          { label: "It raises an error about the conflict", correct: false, explanation: "python-dotenv doesn't detect or report conflicts — it silently picks one." },
          { label: "The last one loaded wins", correct: false, explanation: "It's not about loading order — it's about whether existing env vars get overwritten." },
        ]}
        hint="Think about what 'override' means as a parameter..."
        answer="By default, python-dotenv does NOT override existing environment variables. So the shell value wins. Use override=True in load_dotenv() if you want the .env file to take priority. This trips people up in Docker containers where env vars are set both ways."
        className="mb-8"
      />

      <Separator className="my-8" />

      <AhaMoment
        setup="If I accidentally commit my .env file, can I just delete it and push again?"
        reveal="Deleting the file removes it from the current code, but it's still in your git history. Anyone can see it by looking at past commits. You need to either rewrite git history (with git filter-branch or BFG Repo Cleaner) or — more practically — rotate ALL the secrets that were exposed. Change every password, regenerate every API key. Prevention is way easier than cleanup."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Key Points grid (KEEP existing) */}
      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <AutoAnimateGrid className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4 transition-colors hover:border-rose-500/30 hover:bg-rose-500/5">
              <p className="text-sm font-medium mb-1">Never Commit Secrets</p>
              <p className="text-xs text-muted-foreground">Passwords, API keys, and tokens should never appear in your source code</p>
            </div>
            <div className="rounded-lg border p-4 transition-colors hover:border-rose-500/30 hover:bg-rose-500/5">
              <p className="text-sm font-medium mb-1">.env for Local Config</p>
              <p className="text-xs text-muted-foreground">Store environment-specific values in a .env file at project root</p>
            </div>
            <div className="rounded-lg border p-4 transition-colors hover:border-rose-500/30 hover:bg-rose-500/5">
              <p className="text-sm font-medium mb-1">pydantic-settings for Type Safety</p>
              <p className="text-xs text-muted-foreground">Get automatic validation, defaults, and autocomplete for your config</p>
            </div>
            <div className="rounded-lg border p-4 transition-colors hover:border-rose-500/30 hover:bg-rose-500/5">
              <p className="text-sm font-medium mb-1">.gitignore Your .env</p>
              <p className="text-xs text-muted-foreground">Always add .env to .gitignore to prevent accidental commits</p>
            </div>
          </AutoAnimateGrid>
        </section>
      </ScrollReveal>

      {/* CommonMistakes (KEEP existing) */}
      <CommonMistakes mistakes={mistakes} />
    </div>
  );
}
