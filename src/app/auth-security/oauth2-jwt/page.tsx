"use client";

import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
const JwtAnatomy = dynamic(
  () => import("../_components/jwt-anatomy").then(m => m.JwtAnatomy),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);

import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { AhaMoment } from "@/components/aha-moment";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { ConversationalCallout } from "@/components/conversational-callout";
import { SimpleFlow } from "@/components/simple-flow";
import { Key } from "lucide-react";

export default function OAuth2JwtPage() {
  return (
    <div className="max-w-4xl relative">
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">OAuth2 & JWT</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          FastAPI has built-in support for OAuth2 with Password flow. Combined with JWT tokens, you get a complete authentication system with automatic Swagger UI integration.
        </TextEffect>
      </div>

      {/* 1. Failure hook — first thing after the title */}
      <WhatCouldGoWrong
        scenario="A user logs in and gets a JWT token. It works perfectly for weeks. Then you realize the token was set to expire in 30 days instead of 30 minutes. A compromised token gives an attacker a month of access to your API."
        error={`# JWT Payload (decoded):
{
  "sub": "alice@example.com",
  "exp": 1737590400,  // ← 30 DAYS from now!
  "iat": 1735000000
}

# Alice's laptop gets stolen on day 2.
# The thief has 28 more days of full API access.
# Alice changes her password. The token STILL works.
# JWTs are stateless — the server can't revoke them.`}
        errorType="Security Hole"
        accentColor="amber"
        className="mb-8"
      />

      {/* 2. Bridge from failure to concept */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          So how do you protect your API when tokens can&apos;t be revoked? The answer is: keep them short-lived.
          A 30-minute token means a stolen credential is only dangerous for 30 minutes, not 30 days.
        </p>
        <p>
          Let&apos;s build an OAuth2 + JWT auth system from scratch and make sure you don&apos;t fall into this trap.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model BEFORE code */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">How JWT Auth Actually Works</h2>
          <p className="text-muted-foreground mb-4">
            Before we write a single line of code, here&apos;s the flow you&apos;re building.
            Every JWT auth system follows this exact pattern.
          </p>
          <SimpleFlow
            steps={[
              { label: "User POSTs credentials", detail: "username + password to /token", status: "neutral" },
              { label: "Server verifies", detail: "Checks password hash", status: "neutral" },
              { label: "Server creates JWT", detail: "Signs with SECRET_KEY", status: "success" },
              { label: "Client stores token", detail: "Sends it in Authorization header", status: "neutral" },
              { label: "Server decodes JWT", detail: "Validates signature + expiry", status: "success" },
            ]}
            accentColor="amber"
            className="mb-6"
          />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="The Big Picture"
        points={[
          "JWTs are stateless — the server doesn't store sessions",
          "The token carries its own data (user ID, expiry) inside it",
          "The signature proves the token wasn't tampered with",
          "Short expiry times are your main defense against stolen tokens",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 4. Code section: Setting up OAuth2 */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Setting Up OAuth2</h2>
          <p className="text-muted-foreground mb-4">
            First, you need two things: an OAuth2 scheme that tells FastAPI where to find the token,
            and a function that creates tokens with a proper expiry. Notice we set{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">ACCESS_TOKEN_EXPIRE_MINUTES = 30</code> — not 30 days.
          </p>
          <CodeBlock code={`from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = "your-secret-key"  # In production, use a real secret!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # ← 30 MINUTES, not days

def create_access_token(data: dict):
    to_encode = data.copy()
    # This is the critical part — the expiry
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)`} filename="auth.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="warning" className="mb-8">
        <p>
          See that <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">SECRET_KEY = &quot;your-secret-key&quot;</code>?
          In production, that needs to be a long, random string stored in an environment variable.
          If someone discovers your secret key, they can forge valid tokens for any user.
        </p>
      </ConversationalCallout>

      <Separator className="my-8" />

      {/* 5. Code section: Token endpoint */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The Token Endpoint</h2>
          <p className="text-muted-foreground mb-4">
            This is where users exchange their username and password for a JWT.
            FastAPI&apos;s <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">OAuth2PasswordRequestForm</code> gives you
            a form that works automatically with the Swagger UI &quot;Authorize&quot; button.
          </p>
          <CodeBlock code={`@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Step 1: Check if the user exists and password is correct
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},  # OAuth2 spec requires this
        )
    # Step 2: Create a token with the user's identity
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup='Why does the login endpoint return 401 with a WWW-Authenticate header instead of just 403 Forbidden?'
        reveal="It's part of the OAuth2 spec. The 401 status code means 'you need to authenticate,' and the WWW-Authenticate: Bearer header tells the client HOW to authenticate — by sending a Bearer token. This is what makes the Swagger UI Authorize button work automatically. FastAPI reads this and builds the login form for you."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 6. Code section: Protecting endpoints */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Protecting Your Endpoints</h2>
          <p className="text-muted-foreground mb-4">
            Now for the magic part. You create a dependency that decodes the JWT from every request.
            If the token is invalid, expired, or missing — the user gets a 401 before your endpoint code even runs.
          </p>
          <CodeBlock code={`async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the JWT — this checks the signature AND expiry
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        # Token is invalid, expired, or tampered with
        raise credentials_exception
    user = get_user(username)
    if user is None:
        raise credentials_exception
    return user

# Now just add the dependency — that's it!
@app.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user  # Only runs if token is valid`} filename="main.py" />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="Authentication Flow"
        points={[
          "OAuth2PasswordBearer extracts the token from the Authorization header",
          "jwt.decode() verifies the signature AND checks if the token is expired",
          "The dependency pattern means you write the auth logic once and reuse it everywhere",
          "Swagger UI gets a working Authorize button automatically from OAuth2PasswordBearer",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 7. Go Deeper: Token revocation */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: What About Token Revocation?</h2>
          <p className="text-muted-foreground mb-4">
            Remember our opening scenario? Alice&apos;s laptop gets stolen, but the JWT still works.
            Short expiry helps, but what if you need to revoke a token immediately?
          </p>
          <p className="text-muted-foreground mb-4">
            JWTs are stateless by design — the server doesn&apos;t track them. So you have a few options:
          </p>
          <SimpleFlow
            steps={[
              { label: "Short Expiry", detail: "30 min tokens = small window of risk", status: "success" },
              { label: "Token Blocklist", detail: "Store revoked token IDs in Redis", status: "neutral" },
              { label: "Refresh Tokens", detail: "Short access token + long refresh token", status: "neutral" },
            ]}
            direction="vertical"
            accentColor="amber"
            className="mb-4"
          />
          <ConversationalCallout type="insight" className="mt-4">
            <p>
              The blocklist approach trades some of JWT&apos;s statelessness for revocation ability.
              You check every request against a Redis set of revoked tokens. It&apos;s fast (O(1) lookup),
              and you only need to store tokens until they&apos;d naturally expire.
            </p>
          </ConversationalCallout>
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 8. Existing interactive visualization — KEPT as-is */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Understanding JWT Tokens</h2>
          <p className="text-muted-foreground mb-4">
            A JWT is three base64-encoded segments joined by dots. Explore its structure below,
            see how signing works, and try tampering with the payload to see what happens.
          </p>
          <JwtAnatomy />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 9. Mental Model Challenge */}
      <MentalModelChallenge
        question="A JWT is base64-encoded, not encrypted. If someone intercepts a token, can they read the user's email from it?"
        options={[
          { label: "No — the signature prevents reading the contents", correct: false, explanation: "The signature prevents tampering, not reading. Anyone can decode a JWT payload." },
          { label: "Yes — anyone can decode and read the payload", correct: true, explanation: "Exactly right. That's why you never put sensitive data like passwords in the JWT." },
          { label: "Only if they know the SECRET_KEY", correct: false, explanation: "The SECRET_KEY is for verifying/creating signatures. The payload is just base64 — no key needed to decode it." },
        ]}
        hint="Think about what base64 encoding actually does. Is it encryption?"
        answer="Yes, absolutely. Anyone can decode a JWT and read the payload — it's just base64. That's why you should never put sensitive data (passwords, SSNs, API keys) in the JWT payload. The signature only prevents tampering, not reading. Think of it like a postcard: anyone can read it, but they can't change it without you knowing."
        className="mb-8"
      />

      {/* 10. Aha Moment */}
      <AhaMoment
        setup="If JWTs are stateless and the server doesn't store them, how does the server know the token is valid?"
        reveal="The server doesn't need to remember the token — it just needs the SECRET_KEY. When a JWT comes in, the server recalculates the signature using the header + payload + SECRET_KEY. If it matches the signature in the token, the data hasn't been tampered with. The expiry check is just reading the 'exp' claim from the payload. No database lookup needed."
        icon={<Key className="size-5 text-amber-500" />}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 11. Key Points grid — KEPT */}
      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">OAuth2PasswordBearer</p>
              <p className="text-xs text-muted-foreground">Extracts Bearer token from Authorization header</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">JWT Tokens</p>
              <p className="text-xs text-muted-foreground">Stateless auth — no server-side session storage needed</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Swagger Integration</p>
              <p className="text-xs text-muted-foreground">The /docs page gets a working Authorize button automatically</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Token Expiry</p>
              <p className="text-xs text-muted-foreground">Always set exp claim — short-lived tokens are more secure</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
