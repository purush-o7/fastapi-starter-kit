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
          Keep secrets out of your code with .env files and pydantic-settings for type-safe configuration.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Why Not Hardcode Secrets?</h2>
          <p className="text-muted-foreground mb-4">
            Hardcoding database passwords, API keys, and <RoughHighlight type="highlight" color="#f43f5e">secret tokens</RoughHighlight> directly in your source code is a <RoughHighlight type="underline" color="#f43f5e">major security risk</RoughHighlight>. Your code gets pushed to GitHub, shared with teammates, and stored in version control history forever.
          </p>
          <p className="text-muted-foreground">
            Beyond security, different environments need different values. Your local database URL is not the same as staging or production. <RoughHighlight type="box" color="#f43f5e">Environment variables</RoughHighlight> let you change configuration without changing code.
          </p>
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The .env File</h2>
          <p className="text-muted-foreground mb-4">
            A <code className="text-sm bg-muted px-1.5 py-0.5 rounded">.env</code> file stores configuration as key-value pairs. It lives in your project root and should never be committed to version control.
          </p>
          <CodeBlock
            code={`DATABASE_URL=postgresql://user:password@localhost/mydb
SECRET_KEY=super-secret-key-change-me
DEBUG=true
API_VERSION=v1`}
            filename=".env"
          />
          <p className="text-muted-foreground mt-4">
            <strong>Important:</strong> Always add <code className="text-sm bg-muted px-1.5 py-0.5 rounded">.env</code> to your <code className="text-sm bg-muted px-1.5 py-0.5 rounded">.gitignore</code> file so it never gets committed to your repository!
          </p>
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Loading with python-dotenv</h2>
          <p className="text-muted-foreground mb-4">
            The <code className="text-sm bg-muted px-1.5 py-0.5 rounded">python-dotenv</code> package reads your .env file and makes the values available through <code className="text-sm bg-muted px-1.5 py-0.5 rounded">os.getenv()</code>. Simple and straightforward, but no type validation.
          </p>
          <CodeBlock
            code={`from dotenv import load_dotenv
import os

load_dotenv()  # Load .env file

DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-key")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"`}
            filename="config.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Pydantic Settings (Recommended)</h2>
          <p className="text-muted-foreground mb-4">
            For production apps, <code className="text-sm bg-muted px-1.5 py-0.5 rounded">pydantic-settings</code> is the recommended approach. It reads environment variables, validates their types, provides defaults, and gives you a clean settings object with autocomplete support.
          </p>
          <CodeBlock
            code={`from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    debug: bool = False
    api_version: str = "v1"

    class Config:
        env_file = ".env"

settings = Settings()
# settings.database_url → reads DATABASE_URL from .env
# Automatic type validation!`}
            filename="config.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Try It: Config Validator</h2>
          <p className="text-muted-foreground mb-4">Edit the .env values and watch Pydantic Settings validate them in real-time.</p>
          <EnvConfigViz />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

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

      <CommonMistakes mistakes={mistakes} />
    </div>
  );
}
