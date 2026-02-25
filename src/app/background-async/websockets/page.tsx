"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { WebSocketViz } from "../_components/websocket-viz";
import { HeartbeatViz } from "../_components/heartbeat-viz";
import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { AhaMoment } from "@/components/aha-moment";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { ConversationalCallout } from "@/components/conversational-callout";
import { FailureDeepDive } from "@/components/failure-deep-dive";
import { SimpleFlow } from "@/components/simple-flow";

export default function WebSocketsPage() {
  return (
    <div className="max-w-4xl ambient-async">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">WebSockets</h1>
          <Badge variant="outline">Real-Time</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          You built a chat app. Two users connected. Messages went nowhere. Let&apos;s fix that.
        </TextEffect>
      </div>

      {/* 1. Failure Hook */}
      <WhatCouldGoWrong
        scenario={`You build a chat app with WebSockets. Two users connect. User A sends a message. User B never receives it. You check the code — each WebSocket connection is independent. There's no built-in broadcast.`}
        error={`# Your WebSocket endpoint:\n@app.websocket("/ws")\nasync def chat(websocket: WebSocket):\n    await websocket.accept()\n    while True:\n        data = await websocket.receive_text()\n        await websocket.send_text(f"You said: {data}")\n        # ← Only echoes back to the SAME user!\n        # User B never receives User A's messages.\n\n# User A sends: "Hello everyone!"\n# User A sees: "You said: Hello everyone!"\n# User B sees: ... nothing.`}
        errorType="No Broadcast"
        accentColor="indigo"
        className="mb-8"
      />

      {/* 2. Bridge */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          Why doesn&apos;t User B get the message? Because WebSocket connections are
          completely isolated. Each client talks to the server through its own
          private tunnel. If you want messages to reach other clients, you
          need to build that yourself.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model — WebSocket vs HTTP */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">WebSocket vs HTTP: Two Different Worlds</h2>
          <p className="text-muted-foreground mb-4">
            HTTP is like sending letters — you write one, send it, get a reply, done.
            WebSockets are like a phone call — you connect once and both sides can
            talk whenever they want.
          </p>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-2">HTTP (request-response):</p>
              <SimpleFlow
                steps={[
                  { label: "Client sends request", detail: "GET /messages" },
                  { label: "Server responds", detail: "Here's your data" },
                  { label: "Connection closes", detail: "Done. Start over for next request.", status: "error" },
                ]}
                accentColor="indigo"
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">WebSocket (persistent connection):</p>
              <SimpleFlow
                steps={[
                  { label: "HTTP upgrade", detail: "Switch to WebSocket" },
                  { label: "Connection open", detail: "Both sides can talk anytime", status: "success" },
                  { label: "Messages flow", detail: "Client ↔ Server", status: "success" },
                  { label: "Until close", detail: "Either side can end it", status: "neutral" },
                ]}
                accentColor="indigo"
              />
            </div>
          </div>
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        points={[
          "HTTP connections are one-shot: request, response, close",
          "WebSocket connections stay open — either side can send messages at any time",
          "Each WebSocket connection is independent — there's no built-in way to talk between connections",
        ]}
        section="websocket basics"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 5. Code — basic echo endpoint */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">A Basic WebSocket: Echo Server</h2>
          <p className="text-muted-foreground mb-4">
            Let&apos;s start with the simplest possible WebSocket — it accepts a connection,
            listens for messages, and echoes them back. This is exactly the &quot;broken&quot; chat
            from the hook, but it&apos;s a perfect starting point.
          </p>
          <CodeBlock code={`from fastapi import FastAPI, WebSocket

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()  # Step 1: accept the connection
    while True:
        # Step 2: wait for a message
        data = await ws.receive_text()
        # Step 3: send something back
        await ws.send_text(f"You said: {data}")
    # This loops forever until the client disconnects`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Handling disconnections */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">When Users Disappear</h2>
          <p className="text-muted-foreground mb-4">
            Clients disconnect all the time — they close the tab, lose WiFi, or their
            battery dies. Without handling this, your server throws an unhandled exception.
          </p>
          <CodeBlock code={`from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            data = await ws.receive_text()
            await ws.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        # Client left — clean up gracefully
        print("Client disconnected")`} filename="main.py" />

          <ConversationalCallout type="warning" className="mt-4">
            <p>
              Always wrap your WebSocket loop in try/except. Without it, every
              disconnection becomes an unhandled exception in your logs. Noisy
              and misleading.
            </p>
          </ConversationalCallout>
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        points={[
          "Always call await ws.accept() before sending or receiving",
          "WebSocket endpoints loop forever — they keep the connection alive",
          "Wrap the loop in try/except WebSocketDisconnect to handle client disconnections cleanly",
        ]}
        section="websocket lifecycle"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* The real fix: ConnectionManager */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The Fix: Broadcasting with a ConnectionManager</h2>
          <p className="text-muted-foreground mb-4">
            Remember the original problem? Messages only went back to the sender. To
            build a real chat, you need to track all active connections and broadcast
            messages to everyone. That&apos;s what a <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">ConnectionManager</code> does.
          </p>
          <CodeBlock code={`from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active_connections.append(ws)

    def disconnect(self, ws: WebSocket):
        self.active_connections.remove(ws)

    async def broadcast(self, message: str):
        # Send to EVERY connected client
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/chat")
async def chat(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            data = await ws.receive_text()
            # Now EVERYONE gets the message!
            await manager.broadcast(f"User says: {data}")
    except WebSocketDisconnect:
        manager.disconnect(ws)
        await manager.broadcast("A user has left the chat")`} filename="main.py" />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="Why doesn't FastAPI have a built-in broadcast? Seems like everyone needs it."
        reveal="Because 'broadcast' means different things in different apps. A chat app broadcasts to a room. A stock ticker broadcasts to subscribers. A notification system broadcasts to specific users. FastAPI gives you the primitives (accept, send, receive) and lets you build the broadcast logic that fits YOUR use case. The ConnectionManager pattern above is just one approach — you could also use Redis Pub/Sub, channels, or rooms."
        className="mb-8"
      />

      <WhatYouJustLearned
        points={[
          "A ConnectionManager tracks all active WebSocket connections in a list",
          "broadcast() iterates through every connection and sends the message to each one",
          "When a client disconnects, remove them from the list to avoid sending to dead connections",
        ]}
        section="broadcasting"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Interactive Visualization */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">See It In Action</h2>
          <p className="text-muted-foreground mb-4">
            Three clients connect to the server. External events — webhooks, scheduled jobs, system alerts — arrive at the server, which broadcasts them to all connected clients in real-time. Watch what happens when a client disconnects mid-stream.
          </p>
          <WebSocketViz />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* JSON messages */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Sending Structured Data</h2>
          <p className="text-muted-foreground mb-4">
            Real apps don&apos;t just send text strings. Use{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">receive_json()</code> and{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">send_json()</code> for structured data.
          </p>
          <CodeBlock code={`@app.websocket("/ws/updates")
async def live_updates(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            # Receive structured data from client
            data = await ws.receive_json()
            # data = {"action": "subscribe", "channel": "prices"}

            # Send structured response back
            await ws.send_json({
                "channel": data["channel"],
                "price": 42.50,
                "timestamp": "2024-01-15T10:30:00Z",
            })
    except WebSocketDisconnect:
        print("Client disconnected")`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Go Deeper: Heartbeats */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: Heartbeats &amp; Dead Connections</h2>
          <p className="text-muted-foreground mb-4">
            WebSocket connections can die silently. The client loses WiFi, the browser
            tab crashes, a proxy times out. Without heartbeats, your server holds onto
            dead connections forever, leaking memory.
          </p>
          <p className="text-muted-foreground mb-4">
            Uvicorn handles protocol-level pings automatically. You just configure the interval:
          </p>
          <CodeBlock code={`# Uvicorn sends automatic keepalive pings:
uvicorn main:app \\
    --ws-ping-interval 20 \\    # Ping every 20 seconds
    --ws-ping-timeout 20        # Close if no pong within 20 seconds

# The client's browser handles Pong responses automatically
# — you don't need any client-side code for this.`} filename="terminal" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Ping / Pong in Action</h2>
          <p className="text-muted-foreground mb-4">
            Watch Uvicorn send periodic pings to keep the connection alive. When the client stops responding, the server detects the dead connection and cleans it up.
          </p>
          <HeartbeatViz />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Application-level heartbeats */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Application-Level Heartbeats</h2>
          <p className="text-muted-foreground mb-4">
            Sometimes protocol-level pings aren&apos;t enough. You might need to detect
            stale sessions, refresh auth tokens, or measure latency. Here&apos;s how to
            add your own heartbeat logic:
          </p>
          <CodeBlock code={`import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()

    async def send_heartbeats():
        """Send application-level heartbeat every 30s"""
        while True:
            await asyncio.sleep(30)
            try:
                await ws.send_json({"type": "heartbeat", "ts": time.time()})
            except Exception:
                break  # Connection is dead

    # Run heartbeat alongside the message loop
    heartbeat_task = asyncio.create_task(send_heartbeats())
    try:
        while True:
            data = await ws.receive_json()
            if data.get("type") == "pong":
                continue  # Client responded to our heartbeat
            await handle_message(data)
    except WebSocketDisconnect:
        heartbeat_task.cancel()
        print("Client disconnected")`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Stale connection cleanup */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Cleaning Up Stale Connections</h2>
          <p className="text-muted-foreground mb-4">
            With a <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">ConnectionManager</code>,
            you should periodically close connections that haven&apos;t responded to heartbeats.
          </p>
          <CodeBlock code={`import time

class ConnectionManager:
    def __init__(self):
        self.connections: dict[WebSocket, float] = {}  # ws → last_seen

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.connections[ws] = time.time()

    def disconnect(self, ws: WebSocket):
        self.connections.pop(ws, None)

    def mark_alive(self, ws: WebSocket):
        self.connections[ws] = time.time()

    async def cleanup_stale(self, max_age: float = 60):
        """Remove connections not seen in max_age seconds"""
        now = time.time()
        stale = [ws for ws, last in self.connections.items()
                 if now - last > max_age]
        for ws in stale:
            self.disconnect(ws)
            try:
                await ws.close(code=1001, reason="Heartbeat timeout")
            except Exception:
                pass  # Already dead`} filename="main.py" />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        points={[
          "Uvicorn handles protocol-level pings automatically with --ws-ping-interval",
          "Application-level heartbeats let you detect stale sessions and measure latency",
          "Track last_seen timestamps and periodically close connections that go silent",
        ]}
        section="heartbeats & cleanup"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="What happens to a WebSocket connection if the server restarts? Does the client automatically reconnect?"
        options={[
          {
            label: "Yes — WebSocket connections automatically reconnect",
            correct: false,
            explanation: "WebSocket has no built-in reconnection mechanism.",
          },
          {
            label: "No — the client needs explicit reconnection logic",
            correct: true,
            explanation: "When the server goes down, the connection just dies. The client must detect this and reconnect manually.",
          },
          {
            label: "It depends on the WebSocket library being used",
            correct: false,
            explanation: "No WebSocket library auto-reconnects by default. It always needs explicit client-side logic.",
          },
        ]}
        hint="Think about what the WebSocket protocol defines vs what you have to build yourself."
        answer="No. WebSocket connections are not auto-reconnecting. When the server restarts, every connected client gets a close event (or just loses the connection). The client needs explicit reconnection logic — typically a loop that detects disconnection and calls new WebSocket() again with exponential backoff. This is one of the most commonly forgotten pieces of WebSocket implementations."
        className="mb-8"
      />

      <AhaMoment
        setup="If WebSockets don't auto-reconnect, won't every server deployment disconnect all users?"
        reveal="Yes! Every deployment, every restart, every crash drops all WebSocket connections. That's why production WebSocket apps always need three things: client-side reconnection with exponential backoff, server-side state that survives restarts (like Redis), and graceful shutdown that warns clients before closing. Without all three, your real-time features are fragile."
        className="mb-8"
      />

      <Separator className="my-8" />

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">@app.websocket()</p>
              <p className="text-xs text-muted-foreground">Declare WebSocket endpoints just like HTTP routes</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Accept First</p>
              <p className="text-xs text-muted-foreground">Always call await ws.accept() before sending or receiving</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">WebSocketDisconnect</p>
              <p className="text-xs text-muted-foreground">Catch this exception to handle client disconnections cleanly</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">ConnectionManager</p>
              <p className="text-xs text-muted-foreground">Track active connections for broadcasting to multiple clients</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">JSON Support</p>
              <p className="text-xs text-muted-foreground">Use send_json() and receive_json() for structured data</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Uvicorn --ws auto</p>
              <p className="text-xs text-muted-foreground">Uvicorn supports WebSockets natively with configurable backends</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Ping / Pong</p>
              <p className="text-xs text-muted-foreground">Uvicorn sends automatic keepalive pings to detect dead connections</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">--ws-ping-interval</p>
              <p className="text-xs text-muted-foreground">Control how often Uvicorn pings clients (default 20s, 0 to disable)</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Stale Cleanup</p>
              <p className="text-xs text-muted-foreground">Track last_seen timestamps and close connections that go silent</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
