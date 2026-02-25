"use client";

import { motion } from "motion/react";
import { Shield, ShieldX, ShieldAlert, Check, X, AlertTriangle, Database, HardDrive, Globe, Clock, Lock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/* ================================================================
   DATA
   ================================================================ */

const BROWSER_STORES = [
  {
    id: "cookies", name: "Cookies", capacity: "~4 KB", lifetime: "Configurable (max_age)",
    scope: "Sent with every HTTP request to the domain", jsAccess: true, autoSent: true,
    useCase: "Auth tokens, session IDs, preferences. Server can set HttpOnly to block JS access.",
    code: `# Server sets cookie (FastAPI)\nresponse.set_cookie(key="session", value="abc", max_age=3600)\n\n// Client reads (only if NOT httponly)\ndocument.cookie  // "session=abc; theme=dark"`,
  },
  {
    id: "local", name: "localStorage", capacity: "5-10 MB", lifetime: "Forever",
    scope: "Per origin (protocol + domain + port)", jsAccess: true, autoSent: false,
    useCase: "User preferences, cached data, theme settings. NOT recommended for auth tokens.",
    code: `// Store & read\nlocalStorage.setItem("theme", "dark");\nconst theme = localStorage.getItem("theme");\n\n// Remove\nlocalStorage.removeItem("theme");\nlocalStorage.clear();`,
  },
  {
    id: "session", name: "sessionStorage", capacity: "5-10 MB", lifetime: "Until tab closes",
    scope: "Per tab — not shared between tabs", jsAccess: true, autoSent: false,
    useCase: "Temporary form data, wizard state. Cleared when user closes the tab.",
    code: `sessionStorage.setItem("step", "3");\nconst step = sessionStorage.getItem("step");\n\n// Each tab has its own copy\n// Tab 1: "3"  |  Tab 2: null`,
  },
  {
    id: "indexeddb", name: "IndexedDB", capacity: "100s of MB+", lifetime: "Forever",
    scope: "Per origin", jsAccess: true, autoSent: false,
    useCase: "Large datasets, offline-first apps, file caching. Overkill for key-value storage.",
    code: `import { openDB } from 'idb';\nconst db = await openDB('app', 1, {\n  upgrade(db) { db.createObjectStore('cache'); }\n});\nawait db.put('cache', data, 'api/users');`,
  },
  {
    id: "memory", name: "In-Memory", capacity: "Unlimited", lifetime: "Until refresh",
    scope: "Current JS execution context only", jsAccess: true, autoSent: false,
    useCase: "Sensitive tokens that should never persist. User re-authenticates on refresh.",
    code: `let token = null;\nexport const setToken = (t) => { token = t; };\nexport const getToken = () => token;\n\n// Or React: const [token, setToken] = useState(null);`,
  },
];

const COOKIE_FLAGS = [
  { flag: "httponly", values: "True / False", purpose: "Hides cookie from JavaScript entirely", protects: "XSS — injected scripts can't read document.cookie", defaultVal: "False (JS can read)", risk: "Without it, any XSS attack steals your auth tokens", critical: true },
  { flag: "secure", values: "True / False", purpose: "Cookie only sent over HTTPS connections", protects: "Man-in-the-middle — tokens can't be intercepted on HTTP", defaultVal: "False (sent on HTTP too)", risk: "On public WiFi, attacker can sniff tokens in plain text", critical: true },
  { flag: "samesite", values: '"strict" / "lax" / "none"', purpose: "Controls when cookie is sent on cross-site requests", protects: "CSRF — prevents forged requests from other sites", defaultVal: '"lax" in modern browsers', risk: '"none" lets any site trigger authenticated requests', critical: true },
  { flag: "max_age", values: "Seconds (int) or None", purpose: "How long cookie lives before browser deletes it", protects: "Limits window of token theft — shorter = safer", defaultVal: "None (session cookie)", risk: "Very long expiry means stolen token works for weeks", critical: false },
  { flag: "domain", values: "String or None", purpose: "Which domains receive this cookie", protects: "Scope restriction — limits cookie to specific subdomains", defaultVal: "Current domain only", risk: '".example.com" shares with ALL subdomains', critical: false },
  { flag: "path", values: 'String (e.g. "/api")', purpose: "Which URL paths receive this cookie", protects: "Scope restriction — limits cookie to specific routes", defaultVal: '"/" (all paths)', risk: "Broad path exposes cookie to parts of app that don't need it", critical: false },
];

const SECURITY_RANKING = [
  { label: "HttpOnly Cookie", rank: "Most Secure", verdict: "Server controls it, JS can't touch it. Add secure + samesite for full protection.", score: 5, color: "#10b981", xss: false, csrf: true, code: `response.set_cookie(key="token", value=jwt,\n    httponly=True, secure=True, samesite="lax")` },
  { label: "In-Memory Variable", rank: "Very Secure", verdict: "Token lives only in JS runtime. No DOM, no storage API. Clears on refresh.", score: 4, color: "#84cc16", xss: false, csrf: false, code: `let token = null;\nasync function login() {\n    token = (await res.json()).access_token;\n}` },
  { label: "sessionStorage", rank: "Moderate", verdict: "Clears on tab close, but any XSS can still read it while tab is open.", score: 3, color: "#f59e0b", xss: true, csrf: false, code: `sessionStorage.setItem("token", access_token);\n// Clears when tab closes` },
  { label: "localStorage", rank: "Risky", verdict: "Persists forever, any injected script steals every token.", score: 2, color: "#f97316", xss: true, csrf: false, code: `localStorage.setItem("token", access_token);\n// ⚠️ XSS = game over` },
  { label: "Regular Cookie (no HttpOnly)", rank: "Worst", verdict: "Vulnerable to both XSS and CSRF. Never use for auth.", score: 1, color: "#ef4444", xss: true, csrf: true, code: `response.set_cookie(key="token", value=jwt,\n    httponly=False)  # DON'T` },
];

const SERVER_STORES = [
  {
    id: "dict", name: "In-Memory (dict)", type: "Process memory", speed: "~ns", persistence: "Lost on restart", scalability: "Single process only",
    useCase: "Dev/prototyping, rate limit counters. Not for production sessions.",
    code: `sessions = {}\n\n@app.post("/login")\nasync def login():\n    sid = generate_id()\n    sessions[sid] = {"user": "alice"}\n    return {"session_id": sid}`,
  },
  {
    id: "redis", name: "Redis", type: "External in-memory store", speed: "~1ms", persistence: "Configurable (AOF/RDB)", scalability: "Shared across workers",
    useCase: "Production sessions, caching, rate limiting. The standard choice.",
    code: `import redis\nr = redis.Redis(host="localhost", port=6379)\n\nr.setex(f"session:{sid}", 3600, json.dumps(data))\ndata = json.loads(r.get(f"session:{sid}"))`,
  },
  {
    id: "db", name: "Database (SQL)", type: "Disk-based persistent", speed: "~5-20ms", persistence: "Permanent", scalability: "Shared, adds DB load",
    useCase: "Audit trails, long-lived sessions, queryable history.",
    code: `class Session(Base):\n    __tablename__ = "sessions"\n    id = Column(String, primary_key=True)\n    user_id = Column(Integer, ForeignKey("users.id"))\n    data = Column(JSON)\n    expires_at = Column(DateTime)`,
  },
];

/* ================================================================
   COMPONENT
   ================================================================ */

export function StorageComparison() {
  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b bg-muted/20 flex items-center gap-2.5">
        <Shield className="size-4 text-blue-400" />
        <span className="text-sm font-semibold tracking-wide">Storage & Security Guide</span>
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="browser" className="gap-0">
        <div className="px-4 pt-3 pb-0 border-b border-border/20 bg-muted/5">
          <TabsList variant="line" className="w-full sm:w-auto">
            <TabsTrigger value="browser" className="text-xs gap-1.5"><Globe className="size-3.5" /> Browser Storage</TabsTrigger>
            <TabsTrigger value="cookies" className="text-xs gap-1.5"><Lock className="size-3.5" /> Cookie Flags</TabsTrigger>
            <TabsTrigger value="security" className="text-xs gap-1.5"><Shield className="size-3.5" /> Security Ranking</TabsTrigger>
            <TabsTrigger value="server" className="text-xs gap-1.5"><Database className="size-3.5" /> Server-Side</TabsTrigger>
          </TabsList>
        </div>

        {/* ===== BROWSER STORAGE ===== */}
        <TabsContent value="browser" className="p-0">
          <Tabs defaultValue="cookies" className="gap-0">
            <div className="px-5 pt-3 pb-0 border-b border-border/10">
              <TabsList className="h-8">
                {BROWSER_STORES.map((s) => (
                  <TabsTrigger key={s.id} value={s.id} className="text-[11px] px-2.5">{s.name}</TabsTrigger>
                ))}
              </TabsList>
            </div>
            {BROWSER_STORES.map((store) => (
              <TabsContent key={store.id} value={store.id} className="p-5 space-y-4">
                {/* Info grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-lg border border-border/15 bg-muted/5 px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground/40 mb-1">Capacity</p>
                    <p className="text-sm font-semibold">{store.capacity}</p>
                  </div>
                  <div className="rounded-lg border border-border/15 bg-muted/5 px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground/40 mb-1">Lifetime</p>
                    <p className="text-sm font-semibold">{store.lifetime}</p>
                  </div>
                  <div className="rounded-lg border border-border/15 bg-muted/5 px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground/40 mb-1">JS Access</p>
                    <p className={cn("text-sm font-semibold", store.jsAccess ? "text-amber-400" : "text-emerald-400")}>
                      {store.jsAccess ? "Readable" : "Hidden"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/15 bg-muted/5 px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground/40 mb-1">Auto-Sent</p>
                    <p className={cn("text-sm font-semibold", store.autoSent ? "text-blue-400" : "text-muted-foreground/50")}>
                      {store.autoSent ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground/50"><span className="text-muted-foreground/40">Scope:</span> {store.scope}</p>

                <div className="rounded-lg bg-blue-500/5 border border-blue-500/15 px-4 py-3">
                  <p className="text-xs text-muted-foreground/70 leading-relaxed">
                    <span className="text-blue-400 font-semibold">Use case:</span> {store.useCase}
                  </p>
                </div>

                <pre className="rounded-xl bg-muted/15 border border-border/10 px-4 py-3 text-xs font-mono text-muted-foreground/60 leading-relaxed whitespace-pre-wrap overflow-x-auto">
                  {store.code}
                </pre>
              </TabsContent>
            ))}
          </Tabs>
          <div className="px-5 py-3 border-t bg-muted/10">
            <p className="text-xs text-muted-foreground/50 leading-relaxed">
              <span className="text-blue-400 font-semibold">Rule of thumb:</span> Cookies for auth, localStorage for preferences, sessionStorage for temp state, IndexedDB for large data, in-memory for sensitive tokens.
            </p>
          </div>
        </TabsContent>

        {/* ===== COOKIE FLAGS ===== */}
        <TabsContent value="cookies" className="p-0">
          <Tabs defaultValue="httponly" className="gap-0">
            <div className="px-5 pt-3 pb-0 border-b border-border/10">
              <TabsList className="h-8">
                {COOKIE_FLAGS.map((f) => (
                  <TabsTrigger key={f.flag} value={f.flag} className="text-[11px] px-2.5 font-mono">{f.flag}</TabsTrigger>
                ))}
              </TabsList>
            </div>
            {COOKIE_FLAGS.map((flag) => (
              <TabsContent key={flag.flag} value={flag.flag} className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <code className={cn(
                    "text-base font-mono font-bold px-3 py-1 rounded-lg",
                    flag.critical ? "bg-amber-500/10 text-amber-400" : "bg-muted/30 text-muted-foreground/70"
                  )}>
                    {flag.flag}
                  </code>
                  <span className="text-sm font-mono text-muted-foreground/40">{flag.values}</span>
                  {flag.critical && <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/60">Critical</span>}
                </div>

                <p className="text-sm text-muted-foreground/70">{flag.purpose}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/3 px-4 py-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Shield className="size-3.5 text-emerald-400/70" />
                      <span className="text-xs font-semibold text-emerald-400/80">Protects Against</span>
                    </div>
                    <p className="text-xs text-muted-foreground/60 leading-relaxed">{flag.protects}</p>
                  </div>
                  <div className="rounded-lg border border-border/15 bg-muted/5 px-4 py-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Clock className="size-3.5 text-muted-foreground/40" />
                      <span className="text-xs font-semibold text-muted-foreground/60">Default</span>
                    </div>
                    <p className="text-xs text-muted-foreground/60 leading-relaxed">{flag.defaultVal}</p>
                  </div>
                  <div className="rounded-lg border border-red-500/15 bg-red-500/3 px-4 py-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <AlertTriangle className="size-3.5 text-red-400/60" />
                      <span className="text-xs font-semibold text-red-400/70">Risk Without It</span>
                    </div>
                    <p className="text-xs text-muted-foreground/60 leading-relaxed">{flag.risk}</p>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
          <div className="px-5 py-3 border-t bg-muted/10">
            <p className="text-xs text-muted-foreground/50 leading-relaxed">
              <span className="text-amber-400 font-semibold">Always set all three:</span>{" "}
              <code className="text-xs font-mono bg-muted px-1 rounded">httponly=True</code> +{" "}
              <code className="text-xs font-mono bg-muted px-1 rounded">secure=True</code> +{" "}
              <code className="text-xs font-mono bg-muted px-1 rounded">samesite=&quot;lax&quot;</code> for any auth cookie.
            </p>
          </div>
        </TabsContent>

        {/* ===== SECURITY RANKING ===== */}
        <TabsContent value="security" className="p-0">
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 opacity-40" />
          <Tabs defaultValue="0" className="gap-0">
            <div className="px-5 pt-3 pb-0 border-b border-border/10">
              <TabsList className="h-8">
                {SECURITY_RANKING.map((opt, i) => (
                  <TabsTrigger key={i} value={String(i)} className="text-[11px] px-2 gap-1.5">
                    <div className="size-4 rounded flex items-center justify-center text-[9px] font-bold font-mono"
                      style={{ backgroundColor: `${opt.color}20`, color: opt.color }}>
                      {i + 1}
                    </div>
                    <span className="hidden sm:inline">{opt.label.split(" ")[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {SECURITY_RANKING.map((opt, i) => (
              <TabsContent key={i} value={String(i)} className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold">{opt.label}</h3>
                    <p className="text-sm font-mono mt-0.5" style={{ color: opt.color }}>{opt.rank}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className="w-3 h-4 rounded-sm" style={{ backgroundColor: s <= opt.score ? opt.color : "currentColor", opacity: s <= opt.score ? 0.7 : 0.06 }} />
                      ))}
                    </div>
                    {opt.score >= 4 ? <Shield className="size-5" style={{ color: opt.color }} /> :
                     opt.score === 3 ? <ShieldAlert className="size-5" style={{ color: opt.color }} /> :
                     <ShieldX className="size-5" style={{ color: opt.color }} />}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    {opt.xss ? <X className="size-4 text-red-400" /> : <Check className="size-4 text-emerald-400" />}
                    <span className="text-sm text-muted-foreground/60">XSS</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    {opt.csrf ? <X className="size-4 text-red-400" /> : <Check className="size-4 text-emerald-400" />}
                    <span className="text-sm text-muted-foreground/60">CSRF</span>
                  </span>
                </div>

                <div className="rounded-xl border px-4 py-3" style={{ borderColor: `${opt.color}20`, backgroundColor: `${opt.color}05` }}>
                  <p className="text-sm text-muted-foreground/70 leading-relaxed">{opt.verdict}</p>
                </div>

                <pre className="rounded-xl bg-muted/15 border border-border/10 px-4 py-3 text-xs font-mono text-muted-foreground/60 leading-relaxed whitespace-pre-wrap overflow-x-auto">
                  {opt.code}
                </pre>

                {opt.score <= 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="rounded-lg bg-red-500/5 border border-red-500/15 px-4 py-3 flex items-center gap-2.5">
                    <AlertTriangle className="size-4 text-red-400 shrink-0" />
                    <p className="text-xs text-red-400/70">Not recommended for production auth tokens.</p>
                  </motion.div>
                )}
              </TabsContent>
            ))}
          </Tabs>
          <div className="px-5 py-3 border-t bg-muted/10">
            <p className="text-xs text-muted-foreground/50 leading-relaxed">
              <span className="text-emerald-400 font-semibold">Best practice:</span> HttpOnly cookies for server-rendered apps. In-memory + refresh tokens for SPAs. <span className="text-red-400/70">Never</span> store auth tokens in localStorage.
            </p>
          </div>
        </TabsContent>

        {/* ===== SERVER-SIDE ===== */}
        <TabsContent value="server" className="p-0">
          <Tabs defaultValue="redis" className="gap-0">
            <div className="px-5 pt-3 pb-0 border-b border-border/10">
              <TabsList className="h-8">
                {SERVER_STORES.map((s) => (
                  <TabsTrigger key={s.id} value={s.id} className="text-[11px] px-2.5">{s.name}</TabsTrigger>
                ))}
              </TabsList>
            </div>
            {SERVER_STORES.map((store) => (
              <TabsContent key={store.id} value={store.id} className="p-5 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-lg border border-border/15 bg-muted/5 px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground/40 mb-1">Type</p>
                    <p className="text-sm font-semibold">{store.type}</p>
                  </div>
                  <div className="rounded-lg border border-border/15 bg-muted/5 px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground/40 mb-1">Speed</p>
                    <p className="text-sm font-semibold">{store.speed}</p>
                  </div>
                  <div className="rounded-lg border border-border/15 bg-muted/5 px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground/40 mb-1">Persistence</p>
                    <p className="text-sm font-semibold">{store.persistence}</p>
                  </div>
                  <div className="rounded-lg border border-border/15 bg-muted/5 px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground/40 mb-1">Scalability</p>
                    <p className="text-sm font-semibold">{store.scalability}</p>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-500/5 border border-blue-500/15 px-4 py-3">
                  <p className="text-xs text-muted-foreground/70 leading-relaxed">
                    <span className="text-blue-400 font-semibold">Use case:</span> {store.useCase}
                  </p>
                </div>

                <pre className="rounded-xl bg-muted/15 border border-border/10 px-4 py-3 text-xs font-mono text-muted-foreground/60 leading-relaxed whitespace-pre-wrap overflow-x-auto">
                  {store.code}
                </pre>
              </TabsContent>
            ))}
          </Tabs>
          <div className="px-5 py-3 border-t bg-muted/10">
            <p className="text-xs text-muted-foreground/50 leading-relaxed">
              <span className="text-blue-400 font-semibold">Production standard:</span> Redis for sessions and caching. Database for audit trails. In-memory dicts only for single-process dev.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
