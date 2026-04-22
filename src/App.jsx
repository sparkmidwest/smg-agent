import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://sptshgnjazpceumdghwh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwdHNoZ25qYXpwY2V1bWRnaHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MTc3MzgsImV4cCI6MjA5MTA5MzczOH0.HHfe3CMrw3jx0pRHoniZvRgZ7rKFRIFNTbcBnj1V1m8";

const GOLD = "#F59E0B";
const DARK = "#0D1B2A";
const MID  = "#1B3A5C";
const SC_BLUE = "#0057B8";

// ── SUPABASE HELPERS ─────────────────────────────────────────
function sbFetch(path, opts) {
  var method = (opts && opts.method) || "GET";
  var body   = (opts && opts.body)   || undefined;
  var prefer = (opts && opts.prefer) || "return=representation";
  return fetch(SUPABASE_URL + "/rest/v1/" + path, {
    method, body,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json",
      "Prefer": prefer
    }
  }).then(function(r) {
    if (!r.ok) return r.text().then(function(e){ console.error("SB:", e); return null; });
    return r.text().then(function(t){ return t ? JSON.parse(t) : null; });
  }).catch(function(e){ console.error("sbFetch:", e); return null; });
}

function sbUpsert(table, row) {
  return sbFetch(table, {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=representation",
    body: JSON.stringify(row)
  }).then(function(d){ return d ? d[0] : null; });
}

function sbDelete(table, filter) {
  return sbFetch(table + "?" + filter, { method: "DELETE" });
}

// ── STATIC CLIENT DATA (synced with SMG files) ───────────────
var CLIENTS = [
  {
    id: "riche",
    name: "Jamel 'Riche' Runcie Shade",
    email: "northernamericangroupllc@gmail.com",
    phone: "",
    business: "Northern American Group LLC",
    ein: "92-1872105",
    state: "FL + MD",
    plan: "SPARK Elite",
    retainer: 2500,
    retainerPaid: true,
    monitor: true,
    tu: 794, ex: 762, eq: 763,
    goal: "MCA Payoff + Fix & Flip + Sober Living",
    status: "active",
    avatar: "JR",
    color: "#10B981",
    keyItems: [
      "MCA payoff — $64,290 to Lendr.Online (5th Third ABA 042000314)",
      "324 Sheridan Ave — $125k ARV, free & clear, $950/mo rent (Naomi's LLC)",
      "134 Hedges — $25k offer, $150k ARV, $30-35k rehab needed",
      "New Ohio LLC needed for business credit → loan to NAG for MCA payoff",
      "NAG registered FL (original) + MD foreign (Feb 2026) — DOT authority + plating in MD",
      "PRGOH — Prime Route Group OH — new Ohio filing, receives $1,200/wk per truck from NAG",
      "Big Think Capital HELOC — 3-5 day close on 324 Sheridan",
    ],
    pendingDocs: ["Business card list + balances for NAG", "New Ohio LLC name decision"],
  },
  {
    id: "roberto",
    name: "Roberto Mayorquin",
    email: "primeroutegroupllc@gmail.com",
    phone: "",
    business: "La Familia Enterprise LLC / Prime Route Group LLC",
    ein: "41-2731303 / 41-3137331",
    state: "OH (new filing)",
    plan: "SPARK Business",
    retainer: 2500,
    retainerPaid: true,
    monitor: true,
    tu: 775, ex: 777, eq: 775,
    goal: "Navy Federal Funding + Box Trucking (PRGOH)",
    status: "active",
    avatar: "RM",
    color: "#3B82F6",
    keyItems: [
      "Navy Federal 6-month funding window — June 16, 2026 — HIGH PRIORITY",
      "Prime Route Group OH (PRGOH) — new Ohio filing, operating trucking entity",
      "PRGOH receives $1,200/wk per truck from NAG (2 trucks = $2,400/wk guaranteed)",
      "I Stay Trucking (IST) manages + operates PRGOH day-to-day",
      "Business card utilization issue on La Familia LLC — ~85% (needs to drop below 30%)",
      "Commercial insurance for PRGOH needed before trucks can operate",
    ],
    pendingDocs: ["PRGOH Ohio LLC filing ($99)", "Commercial insurance quotes", "Business bank account for PRGOH"],
  },
  {
    id: "justin",
    name: "Justin A. Drayton",
    email: "viralnewwavellc@gmail.com",
    phone: "",
    business: "Viral New Wave LLC",
    ein: "85-3876498",
    state: "NV",
    plan: "SPARK Business",
    retainer: 2500,
    retainerPaid: false,
    monitor: false,
    tu: 642, ex: 596, eq: 596,
    goal: "Tour Funding + Score 700+",
    status: "pending",
    avatar: "JD",
    color: "#8B5CF6",
    keyItems: [
      "Retainer NOT paid — invoice pending",
      "Verizon collection $219 — send Pay-for-Delete this week",
      "OpenSky charge-off (paid) — send Goodwill deletion letter",
      "Essex Property $2,530 on TU only — investigate immediately (possible judgment)",
      "2 Dept of Ed student loan lates — contact for goodwill",
      "Kiva microloan 0% — apply now, no credit check",
      "D&B DUNS registration for Viral New Wave LLC",
    ],
    pendingDocs: ["Retainer payment", "Revenue docs 2023-present", "Bank statements 12mo"],
  },
  {
    id: "sheikh",
    name: "Sheikh Tijan Fye",
    email: "contact@istayfamous.com",
    phone: "",
    business: "Finding Artists Making Empires LLC (FAME)",
    ein: "84-4123330",
    state: "CA (suspended) → New OH filing",
    plan: "SPARK Elite",
    retainer: 3500,
    retainerPaid: false,
    monitor: false,
    tu: "N/A", ex: "N/A", eq: "N/A",
    goal: "FAME LLC reinstatement + Label Funding + New Ohio entity",
    status: "pending",
    avatar: "SF",
    color: "#F59E0B",
    keyItems: [
      "Personal credit NOT pulled — send SmartCredit link: smartcredit.com/join/?pid=67187",
      "Mwenza (wife) — TU 546 / EX 548 / EQ no file (IdentityIQ 3/11/2026)",
      "FAME LLC CA SUSPENDED — FTB inactive since 05/01/2025 — refer to accountant",
      "Filing NEW Ohio FAME LLC entity instead of reinstating CA — clean start",
      "I Stay Trucking LLC — new Ohio filing, manages PRGOH operations",
      "JV agreement with SMG signed 03/03/2026 — SMG retains 100% retainers",
      "Strategy meeting needed — today/tomorrow",
    ],
    pendingDocs: ["Sheikh personal SmartCredit pull", "Tax returns 2022-2024 (joint w/ Mwenza)", "PayPal statements 12mo", "Bluevine statements 12mo", "New Ohio LLC name for FAME"],
  },
];

var PRIORITIES = ["urgent", "high", "medium", "low"];
var TASK_TYPES = ["dispute", "filing", "funding", "document", "call", "meeting", "follow-up", "other"];
var LOG_TYPES  = ["call", "meeting", "text", "email", "note"];

// ── MAIN APP ─────────────────────────────────────────────────
export default function SMGAgent() {
  var [view,        setView]        = useState("dashboard");
  var [activeClient,setActiveClient]= useState(null);
  var [tasks,       setTasks]       = useState([]);
  var [logs,        setLogs]        = useState([]);
  var [loading,     setLoading]     = useState(true);
  var [aiQuery,     setAiQuery]     = useState("");
  var [aiResponse,  setAiResponse]  = useState("");
  var [aiLoading,   setAiLoading]   = useState(false);
  var [showAddTask, setShowAddTask] = useState(false);
  var [showAddLog,  setShowAddLog]  = useState(false);
  var [newTask,     setNewTask]     = useState({ clientId:"", title:"", type:"other", priority:"high", due:"", notes:"" });
  var [newLog,      setNewLog]      = useState({ clientId:"", type:"call", summary:"", notes:"" });
  var [filterClient,setFilterClient]= useState("all");

  // Load from Supabase
  useEffect(function() {
    (async function() {
      setLoading(true);
      try {
        var t = await sbFetch("smg_tasks?order=created_at.desc");
        var l = await sbFetch("smg_logs?order=created_at.desc");
        setTasks(t || []);
        setLogs(l || []);
      } catch(e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  // ── TASK CRUD ──────────────────────────────────────────────
  async function addTask() {
    var t = Object.assign({}, newTask, {
      id: "task_" + Date.now(),
      done: false,
      created_at: new Date().toISOString()
    });
    await sbUpsert("smg_tasks", t);
    setTasks(function(prev){ return [t].concat(prev); });
    setNewTask({ clientId:"", title:"", type:"other", priority:"high", due:"", notes:"" });
    setShowAddTask(false);
  }

  async function toggleTask(id) {
    var task = tasks.find(function(t){ return t.id === id; });
    if (!task) return;
    var updated = Object.assign({}, task, { done: !task.done });
    await sbUpsert("smg_tasks", updated);
    setTasks(function(prev){ return prev.map(function(t){ return t.id===id ? updated : t; }); });
  }

  async function deleteTask(id) {
    await sbDelete("smg_tasks", "id=eq." + id);
    setTasks(function(prev){ return prev.filter(function(t){ return t.id !== id; }); });
  }

  // ── LOG CRUD ───────────────────────────────────────────────
  async function addLog() {
    var l = Object.assign({}, newLog, {
      id: "log_" + Date.now(),
      created_at: new Date().toISOString()
    });
    await sbUpsert("smg_logs", l);
    setLogs(function(prev){ return [l].concat(prev); });
    setNewLog({ clientId:"", type:"call", summary:"", notes:"" });
    setShowAddLog(false);
  }

  // ── AI ASSISTANT ──────────────────────────────────────────
  async function askAI() {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse("");

    var clientContext = CLIENTS.map(function(c) {
      return c.name + " (" + c.business + "): TU " + c.tu + " / EX " + c.ex + " / EQ " + c.eq +
        " | Plan: " + c.plan + " | Retainer: $" + c.retainer + (c.retainerPaid ? " PAID" : " UNPAID") +
        " | Goal: " + c.goal +
        " | Key items: " + c.keyItems.join("; ") +
        " | Pending docs: " + c.pendingDocs.join(", ");
    }).join("\n\n");

    var pendingTasks = tasks.filter(function(t){ return !t.done; }).map(function(t){
      var client = CLIENTS.find(function(c){ return c.id === t.clientId; });
      return (client ? client.name : t.clientId) + " — " + t.title + " [" + t.priority + "]";
    }).join("\n");

    var recentLogs = logs.slice(0,10).map(function(l){
      var client = CLIENTS.find(function(c){ return c.id === l.clientId; });
      return (client ? client.name : l.clientId) + " [" + l.type + "]: " + l.summary;
    }).join("\n");

    var system = "You are the AI assistant for Spark Midwest Group (SMG), a credit consulting and funding strategy company run by Naomi Jackson. " +
      "You have full knowledge of all SMG clients, their credit profiles, business structures, funding strategies, and pending tasks. " +
      "SMG retains 100% of all client retainers. FAME (Sheikh) earns 5% success fee only on capital secured. " +
      "Be direct, specific, and actionable. Reference specific client data in your answers.\n\n" +
      "CURRENT CLIENT DATA:\n" + clientContext + "\n\n" +
      "PENDING TASKS:\n" + (pendingTasks || "None") + "\n\n" +
      "RECENT INTERACTIONS:\n" + (recentLogs || "None");

    try {
      var res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: system,
          messages: [{ role: "user", content: aiQuery }]
        })
      });
      var data = await res.json();
      var text = (data.content || []).filter(function(b){ return b.type==="text"; }).map(function(b){ return b.text; }).join("");
      setAiResponse(text || "No response.");
    } catch(e) {
      setAiResponse("Error: " + e.message);
    }
    setAiLoading(false);
  }

  // ── HELPERS ────────────────────────────────────────────────
  function getClient(id) { return CLIENTS.find(function(c){ return c.id===id; }); }
  function clientTasks(id) { return tasks.filter(function(t){ return t.clientId===id; }); }
  function clientLogs(id)  { return logs.filter(function(l){ return l.clientId===id; }); }
  function urgentTasks()   { return tasks.filter(function(t){ return !t.done && t.priority==="urgent"; }); }
  function pendingTasks()  { return tasks.filter(function(t){ return !t.done; }); }

  var filteredTasks = filterClient === "all"
    ? tasks
    : tasks.filter(function(t){ return t.clientId === filterClient; });

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#F0F4F8", fontFamily:"'DM Sans', system-ui, sans-serif" }}>

      {/* SIDEBAR */}
      <div style={{ width:220, background:DARK, display:"flex", flexDirection:"column", flexShrink:0, padding:"20px 0" }}>
        {/* Logo */}
        <div style={{ padding:"0 20px 20px", borderBottom:"0.5px solid rgba(255,255,255,0.1)", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
              <path d="M14 0 L15.5 12.5 L28 14 L15.5 15.5 L14 28 L12.5 15.5 L0 14 L12.5 12.5 Z" fill="#5BC8F5"/>
            </svg>
            <span style={{ fontSize:16, fontWeight:700, color:"white", letterSpacing:-0.5 }}>spark.</span>
          </div>
          <div style={{ fontSize:9, color:"#6B7280", letterSpacing:2, textTransform:"uppercase" }}>SMG Agent · Internal</div>
        </div>

        {/* Nav */}
        {[
          { id:"dashboard", icon:"⬡", label:"Dashboard" },
          { id:"clients",   icon:"◈", label:"Clients" },
          { id:"tasks",     icon:"◎", label:"Tasks" },
          { id:"log",       icon:"◉", label:"Interactions" },
          { id:"ai",        icon:"✦", label:"AI Assistant" },
        ].map(function(item) {
          var active = view === item.id;
          return (
            <button key={item.id} onClick={function(){ setView(item.id); setActiveClient(null); }}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 20px",
                background: active ? "rgba(245,158,11,0.15)" : "transparent",
                border:"none", borderLeft: active ? "3px solid " + GOLD : "3px solid transparent",
                cursor:"pointer", width:"100%", textAlign:"left" }}>
              <span style={{ fontSize:14, color: active ? GOLD : "#9CA3AF" }}>{item.icon}</span>
              <span style={{ fontSize:13, fontWeight: active ? 600 : 400, color: active ? GOLD : "#9CA3AF" }}>{item.label}</span>
            </button>
          );
        })}

        {/* Client quick links */}
        <div style={{ padding:"16px 20px 8px", marginTop:8, borderTop:"0.5px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize:9, color:"#4B5563", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Clients</div>
          {CLIENTS.map(function(c) {
            return (
              <button key={c.id} onClick={function(){ setActiveClient(c.id); setView("client_detail"); }}
                style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 0",
                  background:"transparent", border:"none", cursor:"pointer", width:"100%" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:c.color + "30",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:9, fontWeight:700, color:c.color, flexShrink:0 }}>
                  {c.avatar}
                </div>
                <div style={{ textAlign:"left" }}>
                  <div style={{ fontSize:11, color:c.retainerPaid ? "#D1D5DB" : "#FCA5A5", fontWeight:500 }}>
                    {c.name.split(" ")[0]} {c.name.split(" ")[1]}
                  </div>
                  <div style={{ fontSize:9, color: c.retainerPaid ? "#10B981" : "#EF4444" }}>
                    {c.retainerPaid ? "● Active" : "● Pending"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex:1, overflow:"auto" }}>

        {/* Top bar */}
        <div style={{ background:"white", padding:"14px 24px", borderBottom:"0.5px solid #E2E8F0",
          display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:10 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:600, color:DARK }}>
              {view === "dashboard" && "Dashboard"}
              {view === "clients"   && "All Clients"}
              {view === "tasks"     && "Task Tracker"}
              {view === "log"       && "Interaction Log"}
              {view === "ai"        && "AI Assistant"}
              {view === "client_detail" && activeClient && getClient(activeClient) && getClient(activeClient).name}
            </div>
            <div style={{ fontSize:11, color:"#94A3B8" }}>Spark Midwest Group · Internal CRM</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={function(){ setShowAddTask(true); }}
              style={{ padding:"7px 14px", background:DARK, color:"white", border:"none",
                borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>
              + Task
            </button>
            <button onClick={function(){ setShowAddLog(true); }}
              style={{ padding:"7px 14px", background:GOLD, color:DARK, border:"none",
                borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>
              + Log Interaction
            </button>
          </div>
        </div>

        <div style={{ padding:24 }}>

          {/* ── DASHBOARD ── */}
          {view === "dashboard" && (
            <div>
              {/* Stats */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginBottom:24 }}>
                {[
                  { label:"Active Clients",     value:CLIENTS.filter(function(c){ return c.retainerPaid; }).length, color:"#10B981" },
                  { label:"Pending Clients",     value:CLIENTS.filter(function(c){ return !c.retainerPaid; }).length, color:GOLD },
                  { label:"Urgent Tasks",        value:urgentTasks().length, color:"#EF4444" },
                  { label:"Total Pending Tasks", value:pendingTasks().length, color:MID },
                  { label:"Monthly Retainers",   value:"$" + CLIENTS.filter(function(c){ return c.monitor; }).length * 97 + "/mo", color:"#8B5CF6" },
                  { label:"Total Retainers",     value:"$" + CLIENTS.filter(function(c){ return c.retainerPaid; }).reduce(function(s,c){ return s+c.retainer; },0).toLocaleString(), color:"#10B981" },
                ].map(function(s,i) {
                  return (
                    <div key={i} style={{ background:"white", borderRadius:12, padding:"16px 18px",
                      border:"0.5px solid #E2E8F0" }}>
                      <div style={{ fontSize:11, color:"#94A3B8", marginBottom:6 }}>{s.label}</div>
                      <div style={{ fontSize:22, fontWeight:700, color:s.color }}>{s.value}</div>
                    </div>
                  );
                })}
              </div>

              {/* Client cards */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16, marginBottom:24 }}>
                {CLIENTS.map(function(c) {
                  var cTasks = clientTasks(c.id).filter(function(t){ return !t.done; });
                  var urgent = cTasks.filter(function(t){ return t.priority==="urgent"; }).length;
                  return (
                    <div key={c.id} onClick={function(){ setActiveClient(c.id); setView("client_detail"); }}
                      style={{ background:"white", borderRadius:14, padding:"18px 20px",
                        border:"0.5px solid #E2E8F0", cursor:"pointer",
                        borderTop: "3px solid " + c.color }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:36, height:36, borderRadius:"50%", background:c.color + "20",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:12, fontWeight:700, color:c.color }}>
                            {c.avatar}
                          </div>
                          <div>
                            <div style={{ fontSize:13, fontWeight:600, color:DARK }}>{c.name.split(" ").slice(0,2).join(" ")}</div>
                            <div style={{ fontSize:10, color:"#94A3B8" }}>{c.plan}</div>
                          </div>
                        </div>
                        <div style={{ fontSize:10, fontWeight:600, padding:"3px 8px", borderRadius:99,
                          background: c.retainerPaid ? "#D1FAE5" : "#FEF3C7",
                          color: c.retainerPaid ? "#065F46" : "#92400E" }}>
                          {c.retainerPaid ? "Active" : "Pending"}
                        </div>
                      </div>

                      {/* Scores */}
                      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                        {[["TU",c.tu,"#3B82F6"],["EX",c.ex,"#8B5CF6"],["EQ",c.eq,"#10B981"]].map(function(s) {
                          var score = typeof s[1]==="number" ? s[1] : null;
                          var color = score ? (score>=740?"#10B981":score>=680?GOLD:score>=620?"#3B82F6":"#EF4444") : "#94A3B8";
                          return (
                            <div key={s[0]} style={{ flex:1, background:"#F8FAFC", borderRadius:8, padding:"6px 8px", textAlign:"center" }}>
                              <div style={{ fontSize:9, color:"#94A3B8" }}>{s[0]}</div>
                              <div style={{ fontSize:14, fontWeight:700, color:color }}>{score || "—"}</div>
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ fontSize:11, color:"#64748B", marginBottom:10, lineHeight:1.5 }}>{c.goal}</div>

                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div style={{ fontSize:11, color:"#94A3B8" }}>{cTasks.length} open tasks</div>
                        {urgent > 0 && (
                          <div style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:99,
                            background:"#FEE2E2", color:"#B91C1C" }}>
                            {urgent} urgent
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Urgent tasks */}
              {urgentTasks().length > 0 && (
                <div style={{ background:"white", borderRadius:14, padding:"18px 20px", border:"0.5px solid #E2E8F0" }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"#B91C1C", marginBottom:14 }}>🚨 Urgent Tasks</div>
                  {urgentTasks().slice(0,5).map(function(t) {
                    var c = getClient(t.clientId);
                    return (
                      <div key={t.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 0",
                        borderBottom:"0.5px solid #F1F5F9" }}>
                        <input type="checkbox" checked={t.done} onChange={function(){ toggleTask(t.id); }} style={{ cursor:"pointer" }} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, fontWeight:500, color:DARK }}>{t.title}</div>
                          <div style={{ fontSize:10, color:"#94A3B8" }}>{c ? c.name.split(" ")[0] : t.clientId} · {t.type} {t.due ? "· Due " + t.due : ""}</div>
                        </div>
                        <button onClick={function(){ deleteTask(t.id); }}
                          style={{ fontSize:11, color:"#EF4444", background:"none", border:"none", cursor:"pointer" }}>✕</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── CLIENT DETAIL ── */}
          {view === "client_detail" && activeClient && (function(){
            var c = getClient(activeClient);
            if (!c) return null;
            var cTasks = clientTasks(c.id);
            var cLogs  = clientLogs(c.id);
            return (
              <div>
                <button onClick={function(){ setView("clients"); setActiveClient(null); }}
                  style={{ fontSize:12, color:"#64748B", background:"none", border:"none", cursor:"pointer", marginBottom:16 }}>
                  ← Back to clients
                </button>

                {/* Header */}
                <div style={{ background:"white", borderRadius:14, padding:"20px 24px", border:"0.5px solid #E2E8F0",
                  marginBottom:16, borderTop:"4px solid " + c.color }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                      <div style={{ width:48, height:48, borderRadius:"50%", background:c.color + "20",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:16, fontWeight:700, color:c.color }}>
                        {c.avatar}
                      </div>
                      <div>
                        <div style={{ fontSize:18, fontWeight:700, color:DARK }}>{c.name}</div>
                        <div style={{ fontSize:12, color:"#64748B" }}>{c.business}</div>
                        <div style={{ fontSize:11, color:"#94A3B8" }}>{c.email}</div>
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:11, fontWeight:600, padding:"4px 12px", borderRadius:99, marginBottom:6,
                        background: c.retainerPaid ? "#D1FAE5" : "#FEF3C7",
                        color: c.retainerPaid ? "#065F46" : "#92400E" }}>
                        {c.retainerPaid ? "● Retainer Paid — $" + c.retainer.toLocaleString() : "● Retainer UNPAID"}
                      </div>
                      <div style={{ fontSize:11, color:"#94A3B8" }}>{c.plan} {c.monitor ? "· Monitor $97/mo" : "· No Monitor yet"}</div>
                    </div>
                  </div>

                  {/* Score bars */}
                  <div style={{ display:"flex", gap:12, marginBottom:16 }}>
                    {[["TransUnion",c.tu],["Experian",c.ex],["Equifax",c.eq]].map(function(s) {
                      var score = typeof s[1]==="number" ? s[1] : null;
                      var pct   = score ? ((score-300)/550)*100 : 0;
                      var color = score ? (score>=740?"#10B981":score>=680?GOLD:score>=620?"#3B82F6":"#EF4444") : "#94A3B8";
                      return (
                        <div key={s[0]} style={{ flex:1, background:"#F8FAFC", borderRadius:10, padding:"12px 14px" }}>
                          <div style={{ fontSize:10, color:"#94A3B8", marginBottom:4 }}>{s[0]}</div>
                          <div style={{ fontSize:20, fontWeight:700, color:color, marginBottom:6 }}>{score || "N/A"}</div>
                          {score && (
                            <div style={{ height:4, background:"#E2E8F0", borderRadius:9, overflow:"hidden" }}>
                              <div style={{ height:"100%", width:pct+"%", background:color, borderRadius:9 }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ fontSize:12, color:"#64748B", fontWeight:500, marginBottom:8 }}>Goal: {c.goal}</div>
                  <div style={{ fontSize:11, color:"#94A3B8" }}>EIN: {c.ein} · State: {c.state}</div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
                  {/* Key items */}
                  <div style={{ background:"white", borderRadius:14, padding:"18px 20px", border:"0.5px solid #E2E8F0" }}>
                    <div style={{ fontSize:13, fontWeight:600, color:DARK, marginBottom:12 }}>Key Items</div>
                    {c.keyItems.map(function(item, i) {
                      var isUrgent = item.toLowerCase().includes("urgent") || item.toLowerCase().includes("not paid") || item.toLowerCase().includes("suspended") || item.toLowerCase().includes("not pulled");
                      return (
                        <div key={i} style={{ display:"flex", gap:8, padding:"6px 0",
                          borderBottom: i<c.keyItems.length-1 ? "0.5px solid #F1F5F9" : "none" }}>
                          <span style={{ color: isUrgent ? "#EF4444" : "#10B981", fontSize:11, flexShrink:0, marginTop:1 }}>
                            {isUrgent ? "⚠" : "✓"}
                          </span>
                          <span style={{ fontSize:11, color: isUrgent ? "#B91C1C" : "#374151", lineHeight:1.5 }}>{item}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pending docs */}
                  <div style={{ background:"white", borderRadius:14, padding:"18px 20px", border:"0.5px solid #E2E8F0" }}>
                    <div style={{ fontSize:13, fontWeight:600, color:DARK, marginBottom:12 }}>Pending Documents</div>
                    {c.pendingDocs.length === 0
                      ? <div style={{ fontSize:12, color:"#10B981" }}>✓ All documents received</div>
                      : c.pendingDocs.map(function(doc,i) {
                          return (
                            <div key={i} style={{ display:"flex", gap:8, padding:"6px 0",
                              borderBottom: i<c.pendingDocs.length-1 ? "0.5px solid #F1F5F9" : "none" }}>
                              <span style={{ color:"#EF4444", fontSize:11, flexShrink:0 }}>○</span>
                              <span style={{ fontSize:11, color:"#B91C1C" }}>{doc}</span>
                            </div>
                          );
                        })
                    }
                  </div>
                </div>

                {/* Tasks for this client */}
                <div style={{ background:"white", borderRadius:14, padding:"18px 20px", border:"0.5px solid #E2E8F0", marginBottom:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:DARK }}>Tasks ({cTasks.filter(function(t){ return !t.done; }).length} open)</div>
                    <button onClick={function(){ setNewTask(function(p){ return Object.assign({},p,{clientId:c.id}); }); setShowAddTask(true); }}
                      style={{ fontSize:11, padding:"5px 12px", background:DARK, color:"white", border:"none", borderRadius:6, cursor:"pointer" }}>
                      + Add Task
                    </button>
                  </div>
                  {cTasks.length === 0
                    ? <div style={{ fontSize:12, color:"#94A3B8" }}>No tasks yet — add one above</div>
                    : cTasks.map(function(t) {
                        return (
                          <div key={t.id} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"8px 0",
                            borderBottom:"0.5px solid #F1F5F9", opacity: t.done ? 0.5 : 1 }}>
                            <input type="checkbox" checked={t.done} onChange={function(){ toggleTask(t.id); }} style={{ marginTop:2, cursor:"pointer" }} />
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:12, fontWeight:500, color:DARK, textDecoration: t.done ? "line-through" : "none" }}>{t.title}</div>
                              <div style={{ display:"flex", gap:6, marginTop:3 }}>
                                <span style={{ fontSize:9, padding:"1px 6px", borderRadius:99, background:
                                  t.priority==="urgent"?"#FEE2E2":t.priority==="high"?"#FEF3C7":t.priority==="medium"?"#EFF6FF":"#F0FDF4",
                                  color: t.priority==="urgent"?"#B91C1C":t.priority==="high"?"#92400E":t.priority==="medium"?"#1E40AF":"#166534" }}>
                                  {t.priority}
                                </span>
                                <span style={{ fontSize:9, color:"#94A3B8" }}>{t.type}</span>
                                {t.due && <span style={{ fontSize:9, color:"#94A3B8" }}>Due {t.due}</span>}
                              </div>
                              {t.notes && <div style={{ fontSize:10, color:"#64748B", marginTop:3 }}>{t.notes}</div>}
                            </div>
                            <button onClick={function(){ deleteTask(t.id); }}
                              style={{ fontSize:11, color:"#EF4444", background:"none", border:"none", cursor:"pointer" }}>✕</button>
                          </div>
                        );
                      })
                  }
                </div>

                {/* Interaction log for this client */}
                <div style={{ background:"white", borderRadius:14, padding:"18px 20px", border:"0.5px solid #E2E8F0" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:DARK }}>Interaction Log ({cLogs.length})</div>
                    <button onClick={function(){ setNewLog(function(p){ return Object.assign({},p,{clientId:c.id}); }); setShowAddLog(true); }}
                      style={{ fontSize:11, padding:"5px 12px", background:GOLD, color:DARK, border:"none", borderRadius:6, cursor:"pointer", fontWeight:600 }}>
                      + Log Interaction
                    </button>
                  </div>
                  {cLogs.length === 0
                    ? <div style={{ fontSize:12, color:"#94A3B8" }}>No interactions logged yet</div>
                    : cLogs.map(function(l) {
                        return (
                          <div key={l.id} style={{ padding:"10px 0", borderBottom:"0.5px solid #F1F5F9" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                              <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:99,
                                background: l.type==="call"?"#EFF6FF":l.type==="meeting"?"#F0FDF4":l.type==="text"?"#FEF3C7":"#F8FAFC",
                                color: l.type==="call"?"#1E40AF":l.type==="meeting"?"#166534":l.type==="text"?"#92400E":"#64748B" }}>
                                {l.type}
                              </span>
                              <span style={{ fontSize:10, color:"#94A3B8" }}>{new Date(l.created_at).toLocaleDateString()}</span>
                            </div>
                            <div style={{ fontSize:12, fontWeight:500, color:DARK, marginBottom:2 }}>{l.summary}</div>
                            {l.notes && <div style={{ fontSize:11, color:"#64748B" }}>{l.notes}</div>}
                          </div>
                        );
                      })
                  }
                </div>
              </div>
            );
          })()}

          {/* ── TASKS VIEW ── */}
          {view === "tasks" && (
            <div>
              <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
                {[["all","All"]].concat(CLIENTS.map(function(c){ return [c.id, c.name.split(" ")[0]]; })).map(function(f) {
                  return (
                    <button key={f[0]} onClick={function(){ setFilterClient(f[0]); }}
                      style={{ padding:"6px 14px", fontSize:12, borderRadius:99, cursor:"pointer",
                        background: filterClient===f[0] ? DARK : "white",
                        color: filterClient===f[0] ? "white" : "#64748B",
                        border: filterClient===f[0] ? "none" : "0.5px solid #E2E8F0" }}>
                      {f[1]}
                    </button>
                  );
                })}
              </div>
              <div style={{ background:"white", borderRadius:14, border:"0.5px solid #E2E8F0", overflow:"hidden" }}>
                {filteredTasks.length === 0
                  ? <div style={{ padding:24, fontSize:13, color:"#94A3B8", textAlign:"center" }}>No tasks yet — add one with the button above</div>
                  : filteredTasks.map(function(t, i) {
                      var c = getClient(t.clientId);
                      return (
                        <div key={t.id} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 20px",
                          borderBottom: i<filteredTasks.length-1 ? "0.5px solid #F1F5F9" : "none",
                          opacity: t.done ? 0.5 : 1, background: t.priority==="urgent" && !t.done ? "#FFFBF0" : "white" }}>
                          <input type="checkbox" checked={t.done} onChange={function(){ toggleTask(t.id); }} style={{ marginTop:2, cursor:"pointer" }} />
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:13, fontWeight:500, color:DARK, textDecoration: t.done ? "line-through" : "none", marginBottom:4 }}>{t.title}</div>
                            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                              {c && (
                                <span style={{ fontSize:10, padding:"1px 8px", borderRadius:99, background:c.color+"20", color:c.color, fontWeight:600 }}>
                                  {c.name.split(" ")[0]}
                                </span>
                              )}
                              <span style={{ fontSize:10, padding:"1px 8px", borderRadius:99,
                                background: t.priority==="urgent"?"#FEE2E2":t.priority==="high"?"#FEF3C7":"#F1F5F9",
                                color: t.priority==="urgent"?"#B91C1C":t.priority==="high"?"#92400E":"#64748B" }}>
                                {t.priority}
                              </span>
                              <span style={{ fontSize:10, color:"#94A3B8" }}>{t.type}</span>
                              {t.due && <span style={{ fontSize:10, color:"#94A3B8" }}>Due {t.due}</span>}
                            </div>
                            {t.notes && <div style={{ fontSize:11, color:"#64748B", marginTop:4 }}>{t.notes}</div>}
                          </div>
                          <button onClick={function(){ deleteTask(t.id); }}
                            style={{ fontSize:12, color:"#EF4444", background:"none", border:"none", cursor:"pointer", padding:4 }}>✕</button>
                        </div>
                      );
                    })
                }
              </div>
            </div>
          )}

          {/* ── LOG VIEW ── */}
          {view === "log" && (
            <div style={{ background:"white", borderRadius:14, border:"0.5px solid #E2E8F0", overflow:"hidden" }}>
              {logs.length === 0
                ? <div style={{ padding:40, textAlign:"center", fontSize:13, color:"#94A3B8" }}>
                    No interactions logged yet — use the + Log Interaction button to start tracking
                  </div>
                : logs.map(function(l, i) {
                    var c = getClient(l.clientId);
                    return (
                      <div key={l.id} style={{ padding:"14px 20px", borderBottom: i<logs.length-1 ? "0.5px solid #F1F5F9" : "none" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                          {c && (
                            <div style={{ width:24, height:24, borderRadius:"50%", background:c.color+"20",
                              display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:c.color }}>
                              {c.avatar}
                            </div>
                          )}
                          <span style={{ fontSize:12, fontWeight:600, color:DARK }}>{c ? c.name.split(" ")[0] + " " + c.name.split(" ")[1] : l.clientId}</span>
                          <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:99,
                            background: l.type==="call"?"#EFF6FF":l.type==="meeting"?"#F0FDF4":l.type==="text"?"#FEF3C7":"#F8FAFC",
                            color: l.type==="call"?"#1E40AF":l.type==="meeting"?"#166534":l.type==="text"?"#92400E":"#64748B" }}>
                            {l.type}
                          </span>
                          <span style={{ fontSize:10, color:"#94A3B8", marginLeft:"auto" }}>{new Date(l.created_at).toLocaleDateString()} {new Date(l.created_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span>
                        </div>
                        <div style={{ fontSize:13, fontWeight:500, color:DARK, marginBottom:4 }}>{l.summary}</div>
                        {l.notes && <div style={{ fontSize:11, color:"#64748B", lineHeight:1.6 }}>{l.notes}</div>}
                      </div>
                    );
                  })
              }
            </div>
          )}

          {/* ── AI ASSISTANT ── */}
          {view === "ai" && (
            <div>
              <div style={{ background:"white", borderRadius:14, padding:"24px", border:"0.5px solid #E2E8F0", marginBottom:16 }}>
                <div style={{ fontSize:13, fontWeight:600, color:DARK, marginBottom:6 }}>Ask anything about your clients</div>
                <div style={{ fontSize:11, color:"#94A3B8", marginBottom:16 }}>
                  The AI knows all client profiles, scores, tasks, pending docs, and your recent interactions.
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <input value={aiQuery} onChange={function(e){ setAiQuery(e.target.value); }}
                    onKeyDown={function(e){ if(e.key==="Enter") askAI(); }}
                    placeholder='e.g. "What are the most urgent things to do for Roberto?" or "What documents are missing from Sheikh?"'
                    style={{ flex:1, padding:"10px 14px", border:"0.5px solid #E2E8F0", borderRadius:8,
                      fontSize:13, fontFamily:"inherit", outline:"none" }} />
                  <button onClick={askAI} disabled={aiLoading || !aiQuery.trim()}
                    style={{ padding:"10px 20px", background:DARK, color:"white", border:"none",
                      borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
                    {aiLoading ? "Thinking..." : "Ask AI →"}
                  </button>
                </div>
              </div>

              {/* Quick questions */}
              <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
                {[
                  "What's the most urgent task across all clients?",
                  "What documents are still missing?",
                  "What's the next step for Roberto's Navy Fed deadline?",
                  "Which clients haven't paid their retainer?",
                  "Summarize Sheikh's situation",
                  "What's the status of Riche's MCA payoff plan?",
                ].map(function(q) {
                  return (
                    <button key={q} onClick={function(){ setAiQuery(q); }}
                      style={{ fontSize:11, padding:"6px 12px", background:"white", border:"0.5px solid #E2E8F0",
                        borderRadius:99, cursor:"pointer", color:"#64748B" }}>
                      {q}
                    </button>
                  );
                })}
              </div>

              {aiResponse && (
                <div style={{ background:"white", borderRadius:14, padding:"20px 24px", border:"0.5px solid #E2E8F0" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                    <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
                      <path d="M14 0 L15.5 12.5 L28 14 L15.5 15.5 L14 28 L12.5 15.5 L0 14 L12.5 12.5 Z" fill="#5BC8F5"/>
                    </svg>
                    <span style={{ fontSize:12, fontWeight:600, color:MID }}>SMG AI Agent</span>
                  </div>
                  <div style={{ fontSize:13, color:"#374151", lineHeight:1.8, whiteSpace:"pre-wrap" }}>{aiResponse}</div>
                </div>
              )}
            </div>
          )}

          {/* ── CLIENTS LIST ── */}
          {view === "clients" && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:16 }}>
              {CLIENTS.map(function(c) {
                return (
                  <div key={c.id} onClick={function(){ setActiveClient(c.id); setView("client_detail"); }}
                    style={{ background:"white", borderRadius:14, padding:"20px", border:"0.5px solid #E2E8F0",
                      cursor:"pointer", borderLeft:"4px solid " + c.color }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                      <div style={{ width:40, height:40, borderRadius:"50%", background:c.color+"20",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:14, fontWeight:700, color:c.color }}>
                        {c.avatar}
                      </div>
                      <div>
                        <div style={{ fontSize:14, fontWeight:600, color:DARK }}>{c.name}</div>
                        <div style={{ fontSize:11, color:"#64748B" }}>{c.business}</div>
                        <div style={{ fontSize:11, color:"#94A3B8" }}>{c.email}</div>
                      </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12 }}>
                      {[["TU",c.tu],["EX",c.ex],["EQ",c.eq]].map(function(s){
                        var score = typeof s[1]==="number" ? s[1] : null;
                        var color = score ? (score>=740?"#10B981":score>=680?GOLD:score>=620?"#3B82F6":"#EF4444") : "#94A3B8";
                        return (
                          <div key={s[0]} style={{ background:"#F8FAFC", borderRadius:8, padding:"8px", textAlign:"center" }}>
                            <div style={{ fontSize:9, color:"#94A3B8" }}>{s[0]}</div>
                            <div style={{ fontSize:15, fontWeight:700, color:color }}>{score || "—"}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:11, color:"#64748B" }}>{c.plan} · EIN {c.ein}</span>
                      <span style={{ fontSize:10, fontWeight:600, padding:"3px 8px", borderRadius:99,
                        background: c.retainerPaid ? "#D1FAE5" : "#FEF3C7",
                        color: c.retainerPaid ? "#065F46" : "#92400E" }}>
                        {c.retainerPaid ? "Active" : "Pending"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── ADD TASK MODAL ── */}
      {showAddTask && (
        <div style={{ position:"fixed", inset:0, background:"rgba(13,27,42,0.7)", display:"flex",
          alignItems:"center", justifyContent:"center", zIndex:9999, padding:16 }}>
          <div style={{ background:"white", borderRadius:16, padding:28, width:"100%", maxWidth:440 }}>
            <div style={{ fontSize:16, fontWeight:600, color:DARK, marginBottom:20 }}>Add Task</div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <select value={newTask.clientId} onChange={function(e){ setNewTask(function(p){ return Object.assign({},p,{clientId:e.target.value}); }) }}
                style={{ padding:"9px 12px", border:"0.5px solid #E2E8F0", borderRadius:8, fontSize:13, fontFamily:"inherit" }}>
                <option value="">Select client</option>
                {CLIENTS.map(function(c){ return <option key={c.id} value={c.id}>{c.name.split(" ").slice(0,2).join(" ")}</option>; })}
              </select>
              <input value={newTask.title} onChange={function(e){ setNewTask(function(p){ return Object.assign({},p,{title:e.target.value}); }) }}
                placeholder="Task title"
                style={{ padding:"9px 12px", border:"0.5px solid #E2E8F0", borderRadius:8, fontSize:13 }} />
              <div style={{ display:"flex", gap:8 }}>
                <select value={newTask.type} onChange={function(e){ setNewTask(function(p){ return Object.assign({},p,{type:e.target.value}); }) }}
                  style={{ flex:1, padding:"9px 12px", border:"0.5px solid #E2E8F0", borderRadius:8, fontSize:13, fontFamily:"inherit" }}>
                  {TASK_TYPES.map(function(t){ return <option key={t} value={t}>{t}</option>; })}
                </select>
                <select value={newTask.priority} onChange={function(e){ setNewTask(function(p){ return Object.assign({},p,{priority:e.target.value}); }) }}
                  style={{ flex:1, padding:"9px 12px", border:"0.5px solid #E2E8F0", borderRadius:8, fontSize:13, fontFamily:"inherit" }}>
                  {PRIORITIES.map(function(p){ return <option key={p} value={p}>{p}</option>; })}
                </select>
              </div>
              <input type="date" value={newTask.due} onChange={function(e){ setNewTask(function(p){ return Object.assign({},p,{due:e.target.value}); }) }}
                style={{ padding:"9px 12px", border:"0.5px solid #E2E8F0", borderRadius:8, fontSize:13 }} />
              <textarea value={newTask.notes} onChange={function(e){ setNewTask(function(p){ return Object.assign({},p,{notes:e.target.value}); }) }}
                placeholder="Notes (optional)" rows={3}
                style={{ padding:"9px 12px", border:"0.5px solid #E2E8F0", borderRadius:8, fontSize:13, fontFamily:"inherit", resize:"vertical" }} />
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={function(){ setShowAddTask(false); }}
                  style={{ flex:1, padding:"10px", background:"#F8FAFC", border:"0.5px solid #E2E8F0",
                    borderRadius:8, fontSize:13, cursor:"pointer" }}>Cancel</button>
                <button onClick={addTask} disabled={!newTask.clientId || !newTask.title}
                  style={{ flex:1, padding:"10px", background:DARK, color:"white",
                    border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" }}>Save Task</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD LOG MODAL ── */}
      {showAddLog && (
        <div style={{ position:"fixed", inset:0, background:"rgba(13,27,42,0.7)", display:"flex",
          alignItems:"center", justifyContent:"center", zIndex:9999, padding:16 }}>
          <div style={{ background:"white", borderRadius:16, padding:28, width:"100%", maxWidth:440 }}>
            <div style={{ fontSize:16, fontWeight:600, color:DARK, marginBottom:20 }}>Log Interaction</div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <select value={newLog.clientId} onChange={function(e){ setNewLog(function(p){ return Object.assign({},p,{clientId:e.target.value}); }) }}
                style={{ padding:"9px 12px", border:"0.5px solid #E2E8F0", borderRadius:8, fontSize:13, fontFamily:"inherit" }}>
                <option value="">Select client</option>
                {CLIENTS.map(function(c){ return <option key={c.id} value={c.id}>{c.name.split(" ").slice(0,2).join(" ")}</option>; })}
              </select>
              <select value={newLog.type} onChange={function(e){ setNewLog(function(p){ return Object.assign({},p,{type:e.target.value}); }) }}
                style={{ padding:"9px 12px", border:"0.5px solid #E2E8F0", borderRadius:8, fontSize:13, fontFamily:"inherit" }}>
                {LOG_TYPES.map(function(t){ return <option key={t} value={t}>{t}</option>; })}
              </select>
              <input value={newLog.summary} onChange={function(e){ setNewLog(function(p){ return Object.assign({},p,{summary:e.target.value}); }) }}
                placeholder="Summary (e.g. 'Discussed MCA payoff strategy')"
                style={{ padding:"9px 12px", border:"0.5px solid #E2E8F0", borderRadius:8, fontSize:13 }} />
              <textarea value={newLog.notes} onChange={function(e){ setNewLog(function(p){ return Object.assign({},p,{notes:e.target.value}); }) }}
                placeholder="Detailed notes..." rows={4}
                style={{ padding:"9px 12px", border:"0.5px solid #E2E8F0", borderRadius:8, fontSize:13, fontFamily:"inherit", resize:"vertical" }} />
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={function(){ setShowAddLog(false); }}
                  style={{ flex:1, padding:"10px", background:"#F8FAFC", border:"0.5px solid #E2E8F0",
                    borderRadius:8, fontSize:13, cursor:"pointer" }}>Cancel</button>
                <button onClick={addLog} disabled={!newLog.clientId || !newLog.summary}
                  style={{ flex:1, padding:"10px", background:GOLD, color:DARK,
                    border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" }}>Save Log</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
