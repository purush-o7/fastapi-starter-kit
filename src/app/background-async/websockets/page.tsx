"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { WebSocketViz } from "../_components/websocket-viz";
import { HeartbeatViz } from "../_components/heartbeat-viz";

export default function WebSocketsPage() {
  return (
    <div className="max-w-4xl ambient-async">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">WebSockets</h1>
          <Badge variant="outline">Real-Time</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          WebSockets provide a persistent, bidirectional connection between client and server. Unlike HTTP, both sides can send messages at any time — ideal for chat, live updates, and notifications.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">WebSocket vs HTTP</h2>
          <p className="text-muted-foreground mb-4">
            HTTP is request-response: the client asks, the server answers, the connection closes. WebSockets upgrade an HTTP connection into a persistent tunnel where either side can push data at any time.
          </p>
          <CodeBlock code={`# HTTP: one request, one response
# Client → GET /messages → Server responds → Connection closes
# Client → GET /messages → Server responds → Connection closes
# (polling = wasteful)

# WebSocket: persistent connection
# Client → Upgrade to WebSocket → Server accepts
# Client ↔ Server (messages flow both ways, anytime)
# Connection stays open until either side closes it`} filename="concept.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Basic WebSocket Endpoint</h2>
          <p className="text-muted-foreground mb-4">
            Use the <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">@app.websocket()</code> decorator to create a WebSocket endpoint. The lifecycle is: accept, send/receive in a loop, then close.
          </p>
          <CodeBlock code={`from fastapi import FastAPI, WebSocket

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    while True:
        # Wait for a message from the client
        data = await ws.receive_text()
        # Echo it back
        await ws.send_text(f"You said: {data}")`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Handling Disconnections</h2>
          <p className="text-muted-foreground mb-4">
            Clients can disconnect at any time. Wrap your receive loop in a try/except to handle <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">WebSocketDisconnect</code> gracefully.
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
        print("Client disconnected")`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Broadcasting to Multiple Clients</h2>
          <p className="text-muted-foreground mb-4">
            A <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">ConnectionManager</code> class tracks active connections and broadcasts messages to all connected clients — the classic chat room pattern.
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
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/chat")
async def chat(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            data = await ws.receive_text()
            await manager.broadcast(f"User says: {data}")
    except WebSocketDisconnect:
        manager.disconnect(ws)
        await manager.broadcast("A user has left the chat")`} filename="main.py" />
        </section>
      </ScrollReveal>

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

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">JSON Messages</h2>
          <p className="text-muted-foreground mb-4">
            WebSockets can send and receive JSON directly using <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">receive_json()</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">send_json()</code>.
          </p>
          <CodeBlock code={`@app.websocket("/ws/updates")
async def live_updates(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            # Receive structured data
            data = await ws.receive_json()
            # data = {"action": "subscribe", "channel": "prices"}

            # Send structured response
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

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Running with Uvicorn</h2>
          <p className="text-muted-foreground mb-4">
            Uvicorn supports WebSockets out of the box. Use the <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">--ws auto</code> flag to let Uvicorn pick the best WebSocket implementation available.
          </p>
          <CodeBlock code={`# Default: Uvicorn uses websockets library
uvicorn main:app --reload

# Explicitly set WebSocket protocol implementation
uvicorn main:app --ws auto        # Auto-detect best option
uvicorn main:app --ws websockets  # Use websockets library
uvicorn main:app --ws wsproto     # Use wsproto library

# Production: with workers
uvicorn main:app --host 0.0.0.0 --port 8000 --ws auto --workers 4`} filename="terminal" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Heartbeats &amp; Keepalive</h2>
          <p className="text-muted-foreground mb-4">
            WebSocket connections can die silently — the client loses network, the browser tab crashes, or a proxy times out. Without heartbeats, the server holds onto dead connections forever, leaking memory and file descriptors.
          </p>
          <p className="text-muted-foreground mb-4">
            The WebSocket protocol has built-in <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Ping</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Pong</code> frames. The server sends a Ping, the client automatically responds with a Pong. If no Pong comes back within the timeout, the connection is considered dead.
          </p>
          <CodeBlock code={`# Uvicorn handles ping/pong automatically:
uvicorn main:app \\
    --ws-ping-interval 20 \\    # Send a ping every 20 seconds
    --ws-ping-timeout 20        # Close if no pong within 20 seconds

# To disable keepalive pings (not recommended):
uvicorn main:app --ws-ping-interval 0

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

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Application-Level Heartbeats</h2>
          <p className="text-muted-foreground mb-4">
            Uvicorn handles protocol-level pings, but sometimes you need application-level heartbeats — to detect stale sessions, refresh auth tokens, or measure latency.
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

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Stale Connection Cleanup</h2>
          <p className="text-muted-foreground mb-4">
            With a <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">ConnectionManager</code>, you should periodically clean up connections that haven&apos;t responded to heartbeats.
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
