"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Key, Lightbulb, Shield, Lock, CheckCircle } from "lucide-react";
import { CommonMistakes, type Mistake } from "@/components/common-mistakes";
import { AnimatedFlow, type FlowStep } from "@/components/animated-flow";
import { AuthHeroViz } from "./_components/auth-hero-viz";
import { JwtDecoder } from "./_components/jwt-decoder";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Separator } from "@/components/ui/separator";

const topics = [
  {
    href: "/auth-security/oauth2-jwt",
    label: "OAuth2 & JWT",
    icon: KeyRound,
    description: "Implement token-based authentication with OAuth2 password flow and JWT tokens.",
  },
  {
    href: "/auth-security/api-keys",
    label: "API Keys",
    icon: Key,
    description: "Simple API key authentication using headers or query parameters.",
  },
];

const flowSteps: FlowStep[] = [
  { id: "credentials", label: "Send Credentials", description: "The client sends a username and password to the /token endpoint.", icon: KeyRound, color: "amber-500" },
  { id: "verify", label: "Verify Identity", description: "FastAPI hashes the password and checks it against the stored hash in the database.", icon: Shield, color: "amber-500" },
  { id: "issue", label: "Issue JWT", description: "A signed JWT access token is created with the user's claims and an expiration time.", icon: Key, color: "yellow-500" },
  { id: "bearer", label: "Bearer Token", description: "The client includes the JWT in the Authorization header for subsequent requests.", icon: Lock, color: "yellow-500" },
  { id: "authorize", label: "Validate & Authorize", description: "FastAPI decodes the token, verifies the signature, and grants access to the protected route.", icon: CheckCircle, color: "amber-500" },
];

const mistakes: Mistake[] = [
  {
    title: "Storing secrets in code",
    subtitle: "Hardcoding JWT secrets and API keys in source files",
    wrongCode: `SECRET_KEY = "my-super-secret-key"  # Hardcoded!
ALGORITHM = "HS256"

def create_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)`,
    rightCode: `from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    secret_key: str
    algorithm: str = "HS256"

    class Config:
        env_file = ".env"

settings = Settings()

def create_token(data: dict):
    return jwt.encode(data, settings.secret_key, algorithm=settings.algorithm)`,
    filename: "auth.py",
    explanation: "Never hardcode secrets in source files. Use environment variables or a .env file with pydantic-settings to manage configuration securely.",
  },
  {
    title: "Not validating token expiry",
    subtitle: "Creating tokens without expiration timestamps",
    wrongCode: `def create_access_token(data: dict):
    to_encode = data.copy()
    # No expiry!
    return jwt.encode(to_encode, SECRET_KEY)`,
    rightCode: `from datetime import datetime, timedelta, timezone

def create_access_token(
    data: dict,
    expires_delta: timedelta = timedelta(minutes=30),
):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)`,
    filename: "auth.py",
    explanation: "Always set an expiration time on JWT tokens. Without expiry, a leaked token grants permanent access. Use short-lived access tokens with refresh tokens for better security.",
  },
];

export default function AuthSecurityPage() {
  return (
    <div className="max-w-4xl ambient-auth">
      <div className="h-1 w-20 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 mb-8" />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Auth & Security</h1>
          <Badge variant="secondary">2 topics</Badge>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Secure your API endpoints with authentication and authorization.
          From simple API keys to full OAuth2 flows with JWT tokens.
        </p>
      </div>

      {/* Hero Visualization: JWT Auth Flow */}
      <ScrollReveal className="mb-8">
        <AuthHeroViz />
      </ScrollReveal>

      <div className="rounded-lg border bg-amber-500/5 border-amber-500/20 p-4 mb-8">
        <div className="flex gap-3">
          <Lightbulb className="size-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Tip</p>
            <p className="text-sm text-muted-foreground">
              FastAPI has built-in support for OAuth2 with Password flow and
              Bearer tokens. The security utilities integrate with the
              automatic OpenAPI documentation, so your /docs page gets a
              working &quot;Authorize&quot; button.
            </p>
          </div>
        </div>
      </div>

      {/* Animated Flow: Auth Flow Steps */}
      <ScrollReveal className="mb-8">
        <h2 className="text-lg font-semibold mb-4">How JWT Authentication Works</h2>
        <AnimatedFlow steps={flowSteps} accentColor="amber" />
      </ScrollReveal>

      <Separator className="my-8" />

      <div className="grid gap-4 sm:grid-cols-2 mb-12">
        {topics.map((topic) => (
          <Link key={topic.href} href={topic.href}>
            <Card className="group h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer border-border/50 hover:border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <topic.icon className="size-4 text-amber-500" />
                  <CardTitle className="text-base">{topic.label}</CardTitle>
                </div>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Interactive: JWT Decoder */}
      <ScrollReveal className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Try It: JWT Decoder</h2>
        <JwtDecoder />
      </ScrollReveal>

      <CommonMistakes mistakes={mistakes} />
    </div>
  );
}
