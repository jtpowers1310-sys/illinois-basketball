import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import TEAMS from "../data/teams";

function findTeam(name) {
  if (!name) return null;
  const n = name.toLowerCase();
  return TEAMS.find(r => r.Team.toLowerCase() === n) || TEAMS.find(r => r.Team.toLowerCase().includes(n));
}
function safeNum(val) { const n = parseFloat(val); return isNaN(n) ? 0 : n; }
const D1_AVG = { adjO: 103.5, adjD: 103.5, adjT: 68.0, efg: 50.0, tov: 19.0, orb: 29.0, ftr: 33.0 };

function StatBadge({ label, value, avg, higherBetter = true }) {
  const num = safeNum(value), diff = num - avg;
  const positive = higherBetter ? diff > 0 : diff < 0;
  const color = positive ? "#E8FF47" : "#ff5252";
  return (
    <div className="stat-badge">
      <span className="stat-label">{label}</span>
      <span className="stat-value" style={{ color }}>{num.toFixed(1)}</span>
      <span className="stat-diff" style={{ color }}>{diff > 0 ? "+" : ""}{diff.toFixed(1)} vs avg</span>
    </div>
  );
}

function TendBar({ label, value, avg, max, higherBetter = true }) {
  const num = safeNum(value), pct = Math.min((num / max) * 100, 100);
  const positive = (higherBetter ? num - avg : avg - num) > 0;
  return (
    <div className="tend-row">
      <span className="tend-label">{label}</span>
      <div className="tend-track">
        <div className="tend-fill" style={{ width: `${pct}%`, background: positive ? "#E8FF47" : "#ff5252" }} />
        <div className="tend-avg" style={{ left: `${Math.min((avg / max) * 100, 100)}%` }} />
      </div>
      <span className="tend-val" style={{ color: positive ? "#E8FF47" : "#ff5252" }}>{num.toFixed(1)}</span>
    </div>
  );
}

function Notes({ team }) {
  if (!team) return null;
  const o = safeNum(team["AdjOE"]), d = safeNum(team["AdjDE"]), t = safeNum(team["AdjTempo"]);
  const efg = safeNum(team["EFG%"]), tov = safeNum(team["TO%"]), orb = safeNum(team["OR%"]);
  const notes = [];
  if (o > 112) notes.push("⚡ Elite offense — limit transition, force half-court sets");
  else if (o < 97) notes.push("🛡 Below-average offense — apply pressure, force turnovers");
  if (d < 95) notes.push("🔒 Elite defense — expect a grind, value every possession");
  else if (d > 110) notes.push("🎯 Porous defense — attack early, push pace");
  if (t > 71) notes.push("🏃 Fast-paced — set defense early in transition");
  else if (t < 65) notes.push("🧊 Slow pace — patience on offense, don't rush");
  if (tov > 22) notes.push("💸 Turnover-prone — pressure ball-handlers");
  if (orb > 34) notes.push("📦 Elite offensive rebounding — box out aggressively");
  if (efg > 55) notes.push("🎯 Excellent shooting — contest every shot");
  if (notes.length === 0) notes.push("📊 Average profile — study specific matchup tendencies");
  return (
    <div className="notes-wrap">
      <h3>📋 Coaching Notes</h3>
      <ul>{notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [sugg, setSugg] = useState([]);
  const [team, setTeam] = useState(null);
  const [cQuery, setCQuery] = useState("");
  const [cSugg, setCSugg] = useState([]);
  const [cTeam, setCTeam] = useState(null);
  const names = TEAMS.map(t => t.Team).sort();

  useEffect(() => {
    if (query.length < 2) { setSugg([]); return; }
    setSugg(names.filter(n => n.toLowerCase().includes(query.toLowerCase())).slice(0, 8));
  }, [query]);

  useEffect(() => {
    if (cQuery.length < 2) { setCSugg([]); return; }
    setCSugg(names.filter(n => n.toLowerCase().includes(cQuery.toLowerCase())).slice(0, 8));
  }, [cQuery]);

  function pick(name) { setTeam(findTeam(name)); setQuery(name); setSugg([]); }
  function pickC(name) { setCTeam(findTeam(name)); setCQuery(name); setCSugg([]); }

  function radar(t) {
    if (!t) return [];
    return [
      { s: "Off Eff", v: Math.min((safeNum(t["AdjOE"]) / 130) * 100, 100) },
      { s: "Def Eff", v: Math.min(((130 - safeNum(t["AdjDE"])) / 50) * 100, 100) },
      { s: "Tempo", v: Math.min((safeNum(t["AdjTempo"]) / 80) * 100, 100) },
      { s: "eFG%", v: Math.min((safeNum(t["EFG%"]) / 65) * 100, 100) },
      { s: "Ball Ctrl", v: Math.min(((30 - safeNum(t["TO%"])) / 20) * 100, 100) },
      { s: "Off Reb", v: Math.min((safeNum(t["OR%"]) / 45) * 100, 100) },
    ];
  }

  const barData = team ? [
    { n: "AdjO", ill: safeNum(team["AdjOE"]), opp: cTeam ? safeNum(cTeam["AdjOE"]) : null },
    { n: "AdjD", ill: safeNum(team["AdjDE"]), opp: cTeam ? safeNum(cTeam["AdjDE"]) : null },
    { n: "Tempo", ill: safeNum(team["AdjTempo"]), opp: cTeam ? safeNum(cTeam["AdjTempo"]) : null },
  ] : [];

  const CSS = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{--o:#FF552E;--b:#13294B;--y:#E8FF47;--s:#0d1821;--c:#111d2b;--br:#1e3050;--t:#e8edf2;--m:#6a8099}
    body{font-family:'DM Sans',sans-serif;background:var(--s);color:var(--t);min-height:100vh}
    .hdr{background:var(--b);border-bottom:3px solid var(--o);padding:16px 28px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
    .hdr-l{display:flex;align-items:center;gap:14px}
    .logo{font-family:'Bebas Neue',sans-serif;font-size:2.2rem;color:var(--o);background:var(--y);width:44px;height:44px;display:flex;align-items:center;justify-content:center;border-radius:4px}
    .hdr-title{font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:2px;color:#fff}
    .hdr-sub{font-size:0.65rem;color:var(--m);letter-spacing:3px;text-transform:uppercase;margin-top:1px}
    .nav-btn{font-size:0.7rem;letter-spacing:2px;text-transform:uppercase;color:var(--y);text-decoration:none;border:1px solid var(--y);padding:6px 14px;border-radius:6px;transition:all .15s}
    .nav-btn:hover{background:var(--y);color:var(--b)}
    .hero{padding:44px 28px 0;max-width:880px;margin:0 auto}
    .hero-tag{font-size:0.68rem;letter-spacing:4px;text-transform:uppercase;color:var(--o);margin-bottom:10px}
    .hero h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.2rem,5vw,3.8rem);line-height:1;color:#fff;margin-bottom:28px}
    .hero h1 span{color:var(--o)}
    .sw{position:relative}
    .si{width:100%;padding:15px 20px;font-size:1.05rem;font-family:'DM Sans',sans-serif;background:var(--c);border:2px solid var(--br);border-radius:10px;color:var(--t);outline:none;transition:border-color .2s}
    .si:focus{border-color:var(--o)}
    .si::placeholder{color:var(--m)}
    .sug{position:absolute;top:100%;left:0;right:0;background:var(--c);border:1px solid var(--br);border-top:none;border-radius:0 0 10px 10px;z-index:50;overflow:hidden}
    .sug-item{padding:10px 20px;cursor:pointer;font-size:0.92rem;transition:background .15s}
    .sug-item:hover{background:var(--b);color:var(--y)}
    .status{text-align:center;padding:40px;color:var(--m);font-size:0.85rem;letter-spacing:2px;text-transform:uppercase}
    .team-hdr{max-width:880px;margin:28px auto 0;padding:0 28px}
    .team-card{background:linear-gradient(135deg,var(--b) 0%,#0d1821 100%);border:1px solid var(--br);border-left:5px solid var(--o);border-radius:12px;padding:26px 28px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px}
    .team-name h2{font-family:'Bebas Neue',sans-serif;font-size:2.4rem;color:#fff;letter-spacing:2px}
    .team-meta{display:flex;gap:18px;margin-top:4px}
    .team-meta span{font-size:0.72rem;letter-spacing:2px;text-transform:uppercase;color:var(--m)}
    .team-meta strong{color:var(--y)}
    .rk-num{font-family:'Bebas Neue',sans-serif;font-size:4.5rem;color:var(--o);line-height:1}
    .rk-lbl{font-size:0.62rem;letter-spacing:3px;text-transform:uppercase;color:var(--m)}
    .grid{max-width:880px;margin:20px auto;padding:0 28px 60px;display:grid;grid-template-columns:1fr 1fr;gap:18px}
    @media(max-width:620px){.grid{grid-template-columns:1fr;padding:0 16px 60px}.hero{padding:28px 16px 0}.team-hdr{padding:0 16px}}
    .card{background:var(--c);border:1px solid var(--br);border-radius:12px;padding:22px}
    .card.full{grid-column:1/-1}
    .card h3{font-family:'Bebas Neue',sans-serif;font-size:1.05rem;letter-spacing:2px;color:var(--o);margin-bottom:18px;display:flex;align-items:center;gap:8px}
    .card h3::after{content:'';flex:1;height:1px;background:var(--br)}
    .stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
    .stat-badge{background:var(--s);border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:3px;border:1px solid var(--br)}
    .stat-label{font-size:0.58rem;letter-spacing:2px;text-transform:uppercase;color:var(--m)}
    .stat-value{font-family:'Bebas Neue',sans-serif;font-size:1.5rem}
    .stat-diff{font-size:0.64rem;font-weight:600}
    .tend-list{display:flex;flex-direction:column;gap:12px}
    .tend-row{display:flex;align-items:center;gap:10px}
    .tend-label{font-size:0.68rem;text-transform:uppercase;letter-spacing:1px;color:var(--m);width:120px;flex-shrink:0}
    .tend-track{flex:1;height:9px;background:var(--s);border-radius:5px;position:relative;overflow:visible}
    .tend-fill{height:100%;border-radius:5px}
    .tend-avg{position:absolute;top:-4px;bottom:-4px;width:2px;background:var(--m);border-radius:1px}
    .tend-val{font-family:'Bebas Neue',sans-serif;font-size:.95rem;width:38px;text-align:right}
    .notes-wrap h3{font-family:'Bebas Neue',sans-serif;font-size:1.05rem;letter-spacing:2px;color:var(--o);margin-bottom:14px}
    .notes-wrap ul{list-style:none;display:flex;flex-direction:column;gap:8px}
    .notes-wrap li{background:var(--s);border:1px solid var(--br);border-radius:8px;padding:10px 14px;font-size:0.87rem;line-height:1.5}
    .cmp-row{display:flex;gap:10px;align-items:center;margin-bottom:18px;flex-wrap:wrap}
    .cmp-wrap{flex:1;min-width:180px;position:relative}
    .footer{text-align:center;padding:20px;color:var(--m);font-size:0.68rem;letter-spacing:2px;text-transform:uppercase;border-top:1px solid var(--br)}
  `;

  return (
    <>
      <Head>
        <title>Illinois MBB | Scouting</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <style>{CSS}</style>

      <header className="hdr">
        <div className="hdr-l">
          <div className="logo">I</div>
          <div>
            <div className="hdr-title">Illinois MBB Scouting</div>
            <div className="hdr-sub">Opponent Intelligence Dashboard</div>
          </div>
        </div>
        <Link href="/halftime" className="nav-btn">Halftime Engine</Link>
      </header>

      <div className="hero">
        <div className="hero-tag">Illinois Men's Basketball</div>
        <h1>Scout Any <span>Opponent</span></h1>
        <div className="sw">
          <input className="si" placeholder="Search any D1 team..." value={query} onChange={e => setQuery(e.target.value)} autoComplete="off" />
          {sugg.length > 0 && <div className="sug">{sugg.map(s => <div key={s} className="sug-item" onClick={() => pick(s)}>{s}</div>)}</div>}
        </div>
      </div>

      {!team && <div className="status">Search a team above to load scouting report</div>}

      {team && <>
        <div className="team-hdr">
          <div className="team-card">
            <div className="team-name">
              <h2>{team.Team}</h2>
              <div className="team-meta">
                {team.Conf && <span>Conf: <strong>{team.Conf}</strong></span>}
                {team.Record && <span>Record: <strong>{team.Record}</strong></span>}
                {team.WAB && <span>WAB: <strong>{parseFloat(team.WAB).toFixed(1)}</strong></span>}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="rk-num">#{team.Rk}</div>
              <div className="rk-lbl">T-Rank 2024–25</div>
            </div>
          </div>
        </div>

        <div className="grid">
          <div className="card">
            <h3>Efficiency</h3>
            <div className="stat-grid">
              <StatBadge label="Adj. Offense" value={team["AdjOE"]} avg={D1_AVG.adjO} />
              <StatBadge label="Adj. Defense" value={team["AdjDE"]} avg={D1_AVG.adjD} higherBetter={false} />
              <StatBadge label="Tempo" value={team["AdjTempo"]} avg={D1_AVG.adjT} />
            </div>
          </div>

          <div className="card">
            <h3>Profile</h3>
            <ResponsiveContainer width="100%" height={190}>
              <RadarChart data={radar(team)}>
                <PolarGrid stroke="#1e3050" />
                <PolarAngleAxis dataKey="s" tick={{ fill: "#6a8099", fontSize: 10 }} />
                <Radar dataKey="v" stroke="#FF552E" fill="#FF552E" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="card full">
            <h3>Four Factors</h3>
            <div className="tend-list">
              <TendBar label="eFG% (Off)" value={team["EFG%"]} avg={D1_AVG.efg} max={70} />
              <TendBar label="TOV% (Off)" value={team["TO%"]} avg={D1_AVG.tov} max={35} higherBetter={false} />
              <TendBar label="Off Reb%" value={team["OR%"]} avg={D1_AVG.orb} max={50} />
              <TendBar label="FT Rate" value={team["FTRate"]} avg={D1_AVG.ftr} max={55} />
            </div>
          </div>

          <div className="card full notes-wrap"><Notes team={team} /></div>

          <div className="card full">
            <h3>Compare</h3>
            <div className="cmp-row">
              <span style={{ color: "var(--m)", fontSize: "0.82rem" }}>Compare {team.Team} vs:</span>
              <div className="cmp-wrap">
                <input className="si" style={{ padding: "9px 14px", fontSize: "0.88rem" }} placeholder="Search team..." value={cQuery} onChange={e => setCQuery(e.target.value)} autoComplete="off" />
                {cSugg.length > 0 && <div className="sug">{cSugg.map(s => <div key={s} className="sug-item" onClick={() => pickC(s)}>{s}</div>)}</div>}
              </div>
              {cTeam && <button onClick={() => { setCTeam(null); setCQuery(""); }} style={{ background: "none", border: "1px solid var(--br)", color: "var(--m)", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.78rem" }}>Clear</button>}
            </div>
            {cTeam ? (
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={barData} barCategoryGap="30%">
                  <XAxis dataKey="n" tick={{ fill: "#6a8099", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6a8099", fontSize: 10 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ background: "#111d2b", border: "1px solid #1e3050", borderRadius: "8px" }} />
                  <Bar dataKey="ill" name={team.Team} fill="#FF552E" radius={[4, 4, 0, 0]} maxBarSize={44} />
                  <Bar dataKey="opp" name={cTeam.Team} fill="#E8FF47" radius={[4, 4, 0, 0]} maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ color: "var(--m)", fontSize: "0.82rem", textAlign: "center", padding: "22px 0" }}>Search a second team to compare side-by-side</p>}
          </div>
        </div>
      </>}

      <footer className="footer">Data: BartTorvik 2024–25 · Built by Jonah Powers for Illinois MBB · {new Date().getFullYear()}</footer>
    </>
  );
}
