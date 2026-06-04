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
const D1_AVG = { adjO:103.5, adjD:103.5, adjT:68.0, efgPct:50.0, tovPct:19.0, orbPct:29.0, ftRate:33.0 };

function StatBadge({ label, value, avg, higherBetter=true }) {
  const num = safeNum(value), diff = num - avg, positive = higherBetter ? diff > 0 : diff < 0;
  const color = positive ? "#E8FF47" : "#ff5252";
  return <div className="stat-badge"><span className="stat-label">{label}</span><span className="stat-value" style={{color}}>{num.toFixed(1)}</span><span className="stat-diff" style={{color}}>{diff>0?"+":""}{diff.toFixed(1)} vs avg</span></div>;
}
function TendencyBar({ label, value, avg, max, higherBetter=true }) {
  const num = safeNum(value), pct = Math.min((num/max)*100,100), diff = num-avg, positive = higherBetter ? diff>0 : diff<0;
  return <div className="tendency-row"><span className="tend-label">{label}</span><div className="tend-track"><div className="tend-fill" style={{width:`${pct}%`,background:positive?"#E8FF47":"#ff5252"}}/><div className="tend-avg-line" style={{left:`${Math.min((avg/max)*100,100)}%`}}/></div><span className="tend-val" style={{color:positive?"#E8FF47":"#ff5252"}}>{num.toFixed(1)}</span></div>;
}
function ScoutingNote({ team }) {
  if (!team) return null;
  const adjO=safeNum(team["AdjOE"]), adjD=safeNum(team["AdjDE"]), tempo=safeNum(team["AdjTempo"]), efg=safeNum(team["EFG%"]), tov=safeNum(team["TO%"]), orb=safeNum(team["OR%"]);
  const notes = [];
  if (adjO>112) notes.push("⚡ Elite offense — limit transition and force half-court sets");
  else if (adjO<97) notes.push("🛡 Below-average offense — apply pressure, force turnovers");
  if (adjD<95) notes.push("🔒 Elite defense — expect a grind; value every possession");
  else if (adjD>110) notes.push("🎯 Porous defense — attack early, push pace if possible");
  if (tempo>71) notes.push("🏃 Fast-paced team — set your defense early in transition");
  else if (tempo<65) notes.push("🧊 Slow, deliberate pace — patience on offense, don't rush");
  if (tov>22) notes.push("💸 Turnover-prone — pressure ball-handlers, deny entry passes");
  if (orb>34) notes.push("📦 Elite offensive rebounding — box out aggressively, crash boards");
  if (efg>55) notes.push("🎯 Excellent shooting efficiency — contest every shot, no free looks");
  if (notes.length===0) notes.push("📊 Average statistical profile — study tendencies by opponent matchup");
  return <div className="scout-notes"><h3>📋 Coaching Notes</h3><ul>{notes.map((n,i)=><li key={i}>{n}</li>)}</ul></div>;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [year, setYear] = useState("2025");
  const [compareQuery, setCompareQuery] = useState("");
  const [compareTeam, setCompareTeam] = useState(null);
  const [compareSuggestions, setCompareSuggestions] = useState([]);
  const allTeamNames = TEAMS.map(t => t.Team).sort();

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    setSuggestions(allTeamNames.filter(t => t.toLowerCase().includes(query.toLowerCase())).slice(0,8));
  }, [query]);

  useEffect(() => {
    if (compareQuery.length < 2) { setCompareSuggestions([]); return; }
    setCompareSuggestions(allTeamNames.filter(t => t.toLowerCase().includes(compareQuery.toLowerCase())).slice(0,8));
  }, [compareQuery]);

  function selectTeam(name) { setSelectedTeam(findTeam(name)); setQuery(name); setSuggestions([]); }
  function selectCompare(name) { setCompareTeam(findTeam(name)); setCompareQuery(name); setCompareSuggestions([]); }

  function radarData(team) {
    if (!team) return [];
    return [
      { stat:"Off Efficiency", value:Math.min((safeNum(team["AdjOE"])/130)*100,100) },
      { stat:"Def Efficiency", value:Math.min(((130-safeNum(team["AdjDE"]))/50)*100,100) },
      { stat:"Tempo", value:Math.min((safeNum(team["AdjTempo"])/80)*100,100) },
      { stat:"Shooting (eFG%)", value:Math.min((safeNum(team["EFG%"])/65)*100,100) },
      { stat:"Ball Control", value:Math.min(((30-safeNum(team["TO%"]))/20)*100,100) },
      { stat:"Reb Offense", value:Math.min((safeNum(team["OR%"])/45)*100,100) },
    ];
  }

  const teamName = selectedTeam?.Team || "";
  const rank = selectedTeam?.Rk || "—";
  const adjO = selectedTeam ? safeNum(selectedTeam["AdjOE"]) : 0;
  const adjD = selectedTeam ? safeNum(selectedTeam["AdjDE"]) : 0;
  const tempo = selectedTeam ? safeNum(selectedTeam["AdjTempo"]) : 0;
  const comparisonBarData = selectedTeam ? [
    { name:"AdjO", team:adjO, compare:compareTeam?safeNum(compareTeam["AdjOE"]):null },
    { name:"AdjD", team:adjD, compare:compareTeam?safeNum(compareTeam["AdjDE"]):null },
    { name:"Tempo", team:tempo, compare:compareTeam?safeNum(compareTeam["AdjTempo"]):null },
  ] : [];

  return (<>
    <Head>
      <title>Illinois MBB | Opponent Scouting</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
    </Head>
    <style>{`
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      :root{--orange:#FF552E;--blue:#13294B;--yellow:#E8FF47;--surface:#0d1821;--card:#111d2b;--border:#1e3050;--text:#e8edf2;--muted:#6a8099}
      body{font-family:'DM Sans',sans-serif;background:var(--surface);color:var(--text);min-height:100vh}
      .header{background:var(--blue);border-bottom:3px solid var(--orange);padding:18px 32px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
      .header-left{display:flex;align-items:center;gap:16px}
      .illini-i{font-family:'Bebas Neue',sans-serif;font-size:2.4rem;color:var(--orange);background:var(--yellow);width:48px;height:48px;display:flex;align-items:center;justify-content:center;border-radius:4px}
      .header-title{font-family:'Bebas Neue',sans-serif;font-size:1.5rem;letter-spacing:2px;color:white}
      .header-sub{font-size:0.72rem;color:var(--muted);letter-spacing:3px;text-transform:uppercase;margin-top:2px}
      .year-select{background:var(--surface);border:1px solid var(--border);color:var(--text);padding:6px 12px;border-radius:6px;font-size:0.85rem;cursor:pointer}
      .nav-link{font-size:0.72rem;letter-spacing:2px;text-transform:uppercase;color:var(--yellow);text-decoration:none;border:1px solid var(--yellow);padding:6px 14px;border-radius:6px}
      .hero{padding:48px 32px 0;max-width:900px;margin:0 auto}
      .hero-label{font-size:0.7rem;letter-spacing:4px;text-transform:uppercase;color:var(--orange);margin-bottom:12px}
      .hero h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.4rem,5vw,4rem);line-height:1;color:white;margin-bottom:32px}
      .hero h1 span{color:var(--orange)}
      .search-wrap{position:relative}
      .search-input{width:100%;padding:16px 20px;font-size:1.1rem;font-family:'DM Sans',sans-serif;background:var(--card);border:2px solid var(--border);border-radius:10px;color:var(--text);outline:none}
      .search-input:focus{border-color:var(--orange)}
      .search-input::placeholder{color:var(--muted)}
      .suggestions{position:absolute;top:100%;left:0;right:0;background:var(--card);border:1px solid var(--border);border-top:none;border-radius:0 0 10px 10px;z-index:50;overflow:hidden}
      .suggestion-item{padding:10px 20px;cursor:pointer;font-size:0.95rem}
      .suggestion-item:hover{background:var(--blue);color:var(--yellow)}
      .status{text-align:center;padding:40px;color:var(--muted);font-size:0.9rem;letter-spacing:2px;text-transform:uppercase}
      .team-hero{max-width:900px;margin:32px auto 0;padding:0 32px}
      .team-hero-card{background:linear-gradient(135deg,var(--blue) 0%,#0d1821 100%);border:1px solid var(--border);border-left:5px solid var(--orange);border-radius:12px;padding:28px 32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}
      .team-name-block h2{font-family:'Bebas Neue',sans-serif;font-size:2.6rem;color:white;letter-spacing:2px}
      .team-meta{display:flex;gap:20px;margin-top:4px}
      .team-meta span{font-size:0.78rem;letter-spacing:2px;text-transform:uppercase;color:var(--muted)}
      .team-meta strong{color:var(--yellow)}
      .rank-num{font-family:'Bebas Neue',sans-serif;font-size:5rem;color:var(--orange);line-height:1}
      .rank-label{font-size:0.65rem;letter-spacing:3px;text-transform:uppercase;color:var(--muted)}
      .content{max-width:900px;margin:24px auto;padding:0 32px 64px;display:grid;grid-template-columns:1fr 1fr;gap:20px}
      @media(max-width:640px){.content{grid-template-columns:1fr;padding:0 16px 64px}.hero{padding:32px 16px 0}.team-hero{padding:0 16px}}
      .card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px}
      .card.full{grid-column:1/-1}
      .card h3{font-family:'Bebas Neue',sans-serif;font-size:1.15rem;letter-spacing:2px;color:var(--orange);margin-bottom:20px;display:flex;align-items:center;gap:8px}
      .card h3::after{content:'';flex:1;height:1px;background:var(--border)}
      .stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
      .stat-badge{background:var(--surface);border-radius:8px;padding:14px 12px;display:flex;flex-direction:column;gap:4px;border:1px solid var(--border)}
      .stat-label{font-size:0.62rem;letter-spacing:2px;text-transform:uppercase;color:var(--muted)}
      .stat-value{font-family:'Bebas Neue',sans-serif;font-size:1.6rem}
      .stat-diff{font-size:0.68rem;font-weight:600}
      .tendency-list{display:flex;flex-direction:column;gap:14px}
      .tendency-row{display:flex;align-items:center;gap:10px}
      .tend-label{font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;color:var(--muted);width:130px;flex-shrink:0}
      .tend-track{flex:1;height:10px;background:var(--surface);border-radius:5px;position:relative;overflow:visible}
      .tend-fill{height:100%;border-radius:5px}
      .tend-avg-line{position:absolute;top:-4px;bottom:-4px;width:2px;background:var(--muted);border-radius:1px}
      .tend-val{font-family:'Bebas Neue',sans-serif;font-size:1rem;width:40px;text-align:right}
      .scout-notes h3{font-family:'Bebas Neue',sans-serif;font-size:1.15rem;letter-spacing:2px;color:var(--orange);margin-bottom:16px}
      .scout-notes ul{list-style:none;display:flex;flex-direction:column;gap:10px}
      .scout-notes li{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px 16px;font-size:0.9rem;line-height:1.5}
      .compare-row{display:flex;gap:12px;align-items:center;margin-bottom:20px;flex-wrap:wrap}
      .compare-wrap{flex:1;min-width:200px;position:relative}
      .footer{text-align:center;padding:24px;color:var(--muted);font-size:0.72rem;letter-spacing:2px;text-transform:uppercase;border-top:1px solid var(--border)}
    `}</style>

    <header className="header">
      <div className="header-left">
        <div className="illini-i">I</div>
        <div><div className="header-title">Illinois MBB Scouting</div><div className="header-sub">Opponent Intelligence Dashboard</div></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <Link href="/halftime" className="nav-link">Halftime Engine</Link>
        <select className="year-select" value={year} onChange={e=>setYear(e.target.value)}>
          {["2025","2024","2023","2022"].map(y=><option key={y} value={y}>{parseInt(y)-1}–{y.slice(2)} Season</option>)}
        </select>
      </div>
    </header>

    <div className="hero">
      <div className="hero-label">Illinois Men's Basketball</div>
      <h1>Scout Any <span>Opponent</span></h1>
      <div className="search-wrap">
        <input className="search-input" placeholder="Search any D1 team..." value={query} onChange={e=>setQuery(e.target.value)} autoComplete="off" />
        {suggestions.length>0 && <div className="suggestions">{suggestions.map(t=><div key={t} className="suggestion-item" onClick={()=>selectTeam(t)}>{t}</div>)}</div>}
      </div>
    </div>

    {selectedTeam && <>
      <div className="team-hero">
        <div className="team-hero-card">
          <div className="team-name-block">
            <h2>{teamName}</h2>
            <div className="team-meta">
              {selectedTeam.Conf && <span>Conf: <strong>{selectedTeam.Conf}</strong></span>}
              {selectedTeam.Record && <span>Record: <strong>{selectedTeam.Record}</strong></span>}
              {selectedTeam.WAB && <span>WAB: <strong>{parseFloat(selectedTeam.WAB).toFixed(1)}</strong></span>}
            </div>
          </div>
          <div><div className="rank-num">#{rank}</div><div className="rank-label">T-Rank 2024–25</div></div>
        </div>
      </div>
      <div className="content">
        <div className="card"><h3>Efficiency</h3><div className="stat-grid">
          <StatBadge label="Adj. Offense" value={selectedTeam["AdjOE"]} avg={D1_AVG.adjO} />
          <StatBadge label="Adj. Defense" value={selectedTeam["AdjDE"]} avg={D1_AVG.adjD} higherBetter={false} />
          <StatBadge label="Tempo" value={selectedTeam["AdjTempo"]} avg={D1_AVG.adjT} />
        </div></div>
        <div className="card"><h3>Profile</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData(selectedTeam)}>
              <PolarGrid stroke="#1e3050"/><PolarAngleAxis dataKey="stat" tick={{fill:"#6a8099",fontSize:10}}/>
              <Radar dataKey="value" stroke="#FF552E" fill="#FF552E" fillOpacity={0.25} strokeWidth={2}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="card full"><h3>Four Factors</h3><div className="tendency-list">
          <TendencyBar label="eFG% (Off)" value={selectedTeam["EFG%"]} avg={D1_AVG.efgPct} max={70} />
          <TendencyBar label="Turnover % (Off)" value={selectedTeam["TO%"]} avg={D1_AVG.tovPct} max={35} higherBetter={false} />
          <TendencyBar label="Off Reb %" value={selectedTeam["OR%"]} avg={D1_AVG.orbPct} max={50} />
          <TendencyBar label="FT Rate" value={selectedTeam["FTRate"]} avg={D1_AVG.ftRate} max={55} />
        </div></div>
        <div className="card full scout-notes"><ScoutingNote team={selectedTeam} /></div>
        <div className="card full"><h3>Compare vs Opponent</h3>
          <div className="compare-row">
            <span style={{color:"var(--muted)",fontSize:"0.85rem"}}>Compare {teamName} vs:</span>
            <div className="compare-wrap">
              <input className="search-input" style={{padding:"10px 14px",fontSize:"0.9rem"}} placeholder="Search team to compare..." value={compareQuery} onChange={e=>setCompareQuery(e.target.value)} autoComplete="off"/>
              {compareSuggestions.length>0 && <div className="suggestions">{compareSuggestions.map(t=><div key={t} className="suggestion-item" onClick={()=>selectCompare(t)}>{t}</div>)}</div>}
            </div>
            {compareTeam && <button onClick={()=>{setCompareTeam(null);setCompareQuery("");}} style={{background:"none",border:"1px solid var(--border)",color:"var(--muted)",padding:"8px 14px",borderRadius:"6px",cursor:"pointer",fontSize:"0.8rem"}}>Clear</button>}
          </div>
          {compareTeam ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={comparisonBarData} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{fill:"#6a8099",fontSize:12}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:"#6a8099",fontSize:11}} axisLine={false} tickLine={false} domain={["auto","auto"]}/>
                <Tooltip contentStyle={{background:"#111d2b",border:"1px solid #1e3050",borderRadius:"8px"}}/>
                <Bar dataKey="team" name={teamName} fill="#FF552E" radius={[4,4,0,0]} maxBarSize={48}/>
                <Bar dataKey="compare" name={compareTeam.Team} fill="#E8FF47" radius={[4,4,0,0]} maxBarSize={48}/>
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{color:"var(--muted)",fontSize:"0.85rem",textAlign:"center",padding:"24px 0"}}>Search a second team above to compare key metrics side-by-side</p>}
        </div>
      </div>
    </>}

    {!selectedTeam && <div className="status">Search a team above to load scouting report</div>}
    <footer className="footer">Data sourced from BartTorvik · Built for Illinois MBB · {new Date().getFullYear()}</footer>
  </>);
}
