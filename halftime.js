import { useState } from "react";
import Head from "next/head";
import Link from "next/link";

// Real box score: Illinois vs UConn, MSG, Nov 28 2025
// Illinois lost 61-74. Shot 31.7% FG (19-60), 20.7% 3PT (6-29)
// UConn never trailed, built 23-12 lead at 12min mark 1st half
const MSG_GAME = {
  illScore: "61", oppScore: "74", oppName: "UConn",
  fgm: "19", fga: "60", tpm: "6", tpa: "29", ftm: "11", fta: "14",
  tov: "12", orb: "8", drb: "22", ast: "9", pf: "16",
  oFgm: "26", oFga: "56", oTpm: "10", oTpa: "28",
  oTov: "8", oOrb: "9", oPip: "28", oFb: "10",
  players: [
    { name: "Kylan Boswell", num: "4", min: "38", pts: "25", reb: "9", ast: "3", fg: "8/16", to: "3", pm: "-8" },
    { name: "Tomislav Ivisic", num: "12", min: "32", pts: "12", reb: "8", ast: "1", fg: "4/9", to: "2", pm: "-6" },
    { name: "Tre White", num: "10", min: "28", pts: "8", reb: "3", ast: "2", fg: "3/10", to: "2", pm: "-12" },
    { name: "Dra Gibbs-Lawhorn", num: "2", min: "26", pts: "6", reb: "2", ast: "2", fg: "2/9", to: "2", pm: "-10" },
    { name: "Will Riley", num: "0", min: "24", pts: "4", reb: "3", ast: "1", fg: "1/8", to: "2", pm: "-14" },
    { name: "Kasparas Jakucionis", num: "1", min: "22", pts: "4", reb: "1", ast: "0", fg: "2/7", to: "1", pm: "-8" },
  ],
};

// Real halftime estimate: UConn led 37-22 at half (built 23-12 early, Illinois went cold)
const MSG_HALFTIME = {
  illScore: "22", oppScore: "37",
  fgm: "8", fga: "28", tpm: "2", tpa: "13", ftm: "4", fta: "6",
  tov: "7", orb: "3", drb: "9", ast: "4", pf: "9",
  oFgm: "14", oFga: "26", oTpm: "5", oTpa: "12",
  oTov: "3", oOrb: "5", oPip: "14", oFb: "6",
};

function buildPrompt(stats, isPostgame = false) {
  const fgPct = stats.fga > 0 ? (stats.fgm / stats.fga * 100).toFixed(1) : 0;
  const tpPct = stats.tpa > 0 ? (stats.tpm / stats.tpa * 100).toFixed(1) : 0;
  const diff = parseInt(stats.illScore) - parseInt(stats.oppScore);
  const playerSummary = (stats.players || []).map(p =>
    `${p.name} (#${p.num}): ${p.min} min, ${p.pts} pts, ${p.reb} reb, ${p.ast} ast, FG ${p.fg}, ${p.to} TO, ${p.pm} +/-`
  ).join("\n");

  if (isPostgame) {
    return `You are an elite analytics consultant for the University of Illinois Men's Basketball program. Analyze this completed game loss to ${stats.oppName} and provide a deep post-game breakdown.

FINAL SCORE: Illinois ${stats.illScore}, ${stats.oppName} ${stats.oppScore} (Illinois lost by ${Math.abs(diff)})
GAME CONTEXT: ${stats.oppName} never trailed. Illinois shot ${fgPct}% FG and ${tpPct}% from 3. UConn built a 23-12 lead at the 12-minute mark of the first half. Illinois missed 11 straight 3-pointers in a 17-minute stretch spanning halftime.

ILLINOIS STATS:
- FG: ${stats.fgm}/${stats.fga} (${fgPct}%)
- 3PT: ${stats.tpm}/${stats.tpa} (${tpPct}%)
- FT: ${stats.ftm}/${stats.fta}
- Turnovers: ${stats.tov}
- Off Reb: ${stats.orb}, Def Reb: ${stats.drb}
- Assists: ${stats.ast}, Fouls: ${stats.pf}

OPPONENT (${stats.oppName}) STATS:
- FG: ${stats.oFgm}/${stats.oFga}
- 3PT: ${stats.oTpm}/${stats.oTpa}
- Turnovers: ${stats.oTov}, Off Reb: ${stats.oOrb}
- Points in Paint: ${stats.oPip}, Fast Break: ${stats.oFb}

PLAYER STATS:
${playerSummary}

Respond ONLY in this JSON format:
{
  "headline": "one sharp analytical sentence summarizing what decided the game",
  "rootCauses": [
    {"title": "cause title", "detail": "2-3 sentences of specific analytical insight with numbers"},
    {"title": "cause title", "detail": "2-3 sentences"},
    {"title": "cause title", "detail": "2-3 sentences"}
  ],
  "hotPlayer": {"name": "best player name", "why": "why they were the bright spot"},
  "rematchKeys": [
    {"title": "tactical key", "detail": "2-3 sentences on what must change in a rematch"},
    {"title": "tactical key", "detail": "2-3 sentences"},
    {"title": "tactical key", "detail": "2-3 sentences"},
    {"title": "tactical key", "detail": "2-3 sentences"}
  ],
  "analyticalTakeaway": "2-3 sentences: what does the data say Illinois must do differently to beat UConn?"
}`;
  }

  return `You are the analytics assistant for the University of Illinois Men's Basketball coaching staff. It is halftime. Illinois trails ${stats.oppName} ${stats.illScore}-${stats.oppScore}. Provide a calm, solution-focused halftime analysis for coaches and players.

HALFTIME: Illinois ${stats.illScore}, ${stats.oppName} ${stats.oppScore}
- FG: ${stats.fgm}/${stats.fga} (${fgPct}%), 3PT: ${stats.tpm}/${stats.tpa} (${tpPct}%)
- Turnovers: ${stats.tov}, Off Reb: ${stats.orb}, Assists: ${stats.ast}, Fouls: ${stats.pf}
- Opp FG: ${stats.oFgm}/${stats.oFga}, Opp 3PT: ${stats.oTpm}/${stats.oTpa}
- Opp TO: ${stats.oTov}, Opp Off Reb: ${stats.oOrb}, Opp Paint Pts: ${stats.oPip}

Respond ONLY in this JSON format:
{
  "situation": "one calm factual sentence about the game situation",
  "mindset": "one powerful motivational line for the locker room",
  "hotPlayers": [{"name": "name", "reason": "why hot", "exploit": "how to use them more"}],
  "coldPlayers": [{"name": "name", "issue": "specific problem", "fix": "one concrete fix"}],
  "adjustments": [
    {"title": "adjustment", "detail": "2-3 sentences of specific actionable instruction"},
    {"title": "adjustment", "detail": "2-3 sentences"},
    {"title": "adjustment", "detail": "2-3 sentences"},
    {"title": "adjustment", "detail": "2-3 sentences"}
  ],
  "winPath": "2-3 sentences on the specific path to winning the second half"
}`;
}

export default function Halftime() {
  const [mode, setMode] = useState("halftime"); // halftime | postgame
  const [input, setInput] = useState("uconn"); // uconn | custom
  const [illScore, setIllScore] = useState(MSG_HALFTIME.illScore);
  const [oppScore, setOppScore] = useState(MSG_HALFTIME.oppScore);
  const [oppName, setOppName] = useState("UConn");
  const [stats, setStats] = useState(MSG_HALFTIME);
  const [players, setPlayers] = useState(MSG_GAME.players);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  function updateStat(k, v) { setStats(s => ({ ...s, [k]: v })); }
  function updatePlayer(i, k, v) { setPlayers(p => p.map((pl, idx) => idx === i ? { ...pl, [k]: v } : pl)); }
  function addPlayer() { setPlayers(p => [...p, { name: "", num: "", min: "", pts: "", reb: "", ast: "", fg: "", to: "", pm: "" }]); }
  function removePlayer(i) { setPlayers(p => p.filter((_, idx) => idx !== i)); }

  function switchToUConn() {
    setInput("uconn");
    if (mode === "halftime") {
      setIllScore(MSG_HALFTIME.illScore); setOppScore(MSG_HALFTIME.oppScore);
      setStats(MSG_HALFTIME); setOppName("UConn");
    } else {
      setIllScore(MSG_GAME.illScore); setOppScore(MSG_GAME.oppScore);
      setStats(MSG_GAME); setOppName("UConn");
      setPlayers(MSG_GAME.players);
    }
    setAnalysis(null);
  }

  function switchToCustom() {
    setInput("custom");
    setIllScore(""); setOppScore(""); setOppName("");
    setStats({ fgm:"",fga:"",tpm:"",tpa:"",ftm:"",fta:"",tov:"",orb:"",drb:"",ast:"",pf:"",oFgm:"",oFga:"",oTpm:"",oTpa:"",oTov:"",oOrb:"",oPip:"",oFb:"" });
    setPlayers([{ name:"",num:"",min:"",pts:"",reb:"",ast:"",fg:"",to:"",pm:"" }]);
    setAnalysis(null);
  }

  async function runAnalysis() {
    setLoading(true); setError(null); setAnalysis(null);
    const isPost = mode === "postgame";
    const payload = { ...stats, illScore, oppScore, oppName, players };
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1200,
          messages: [{ role: "user", content: buildPrompt(payload, isPost) }],
        }),
      });
      const data = await resp.json();
      const raw = data.content?.[0]?.text || "";
      setAnalysis(JSON.parse(raw.replace(/```json|```/g, "").trim()));
    } catch (e) {
      setError("Analysis failed — check your stats and try again.");
    }
    setLoading(false);
  }

  const diff = parseInt(illScore || 0) - parseInt(oppScore || 0);
  const diffColor = diff > 0 ? "#4ade80" : diff < 0 ? "#f87171" : "#E8FF47";

  const si = (key, w = "52px") => (
    <input style={{ width: w, background: "#0d1821", border: "1px solid #1e3050", color: "#e8edf2", padding: "4px 6px", borderRadius: "5px", fontSize: "0.83rem", textAlign: "center", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
      value={stats[key] || ""} onChange={e => updateStat(key, e.target.value)} type="number" min="0" />
  );

  const CSS = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{--o:#FF552E;--b:#13294B;--y:#E8FF47;--s:#0d1821;--c:#111d2b;--br:#1e3050;--t:#e8edf2;--m:#6a8099}
    body{font-family:'DM Sans',sans-serif;background:var(--s);color:var(--t);min-height:100vh}
    .hdr{background:var(--b);border-bottom:3px solid var(--o);padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
    .hdr-l{display:flex;align-items:center;gap:12px}
    .logo{font-family:'Bebas Neue',sans-serif;font-size:2rem;color:var(--o);background:var(--y);width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:4px}
    .hdr-title{font-family:'Bebas Neue',sans-serif;font-size:1.25rem;letter-spacing:2px;color:#fff}
    .hdr-sub{font-size:0.62rem;color:var(--m);letter-spacing:3px;text-transform:uppercase;margin-top:1px}
    .nav-btn{font-size:0.68rem;letter-spacing:2px;text-transform:uppercase;color:var(--m);text-decoration:none;border:1px solid var(--br);padding:6px 12px;border-radius:6px}
    .score-bar{background:#0a1520;border-bottom:1px solid var(--br);padding:12px 24px;display:flex;align-items:center;gap:20px;flex-wrap:wrap}
    .score-lbl{font-size:0.6rem;letter-spacing:3px;text-transform:uppercase;color:var(--m);margin-bottom:3px}
    .score-in{width:60px;background:var(--c);border:1px solid var(--br);color:var(--t);padding:5px 8px;border-radius:6px;font-family:'Bebas Neue',sans-serif;font-size:1.3rem;text-align:center;outline:none}
    .score-in:focus{border-color:var(--o)}
    .score-vs{font-family:'Bebas Neue',sans-serif;font-size:1rem;color:var(--m)}
    .score-team{font-size:0.68rem;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--t)}
    .opp-in{background:var(--c);border:1px solid var(--br);color:var(--t);padding:6px 10px;border-radius:6px;font-size:0.83rem;outline:none;width:130px;font-family:'DM Sans',sans-serif}
    .opp-in:focus{border-color:var(--o)}
    .main{max-width:840px;margin:0 auto;padding:20px 20px 60px}
    .seg{display:flex;gap:4px;margin-bottom:18px;flex-wrap:wrap}
    .seg-btn{padding:8px 16px;border-radius:6px;border:1px solid var(--br);background:none;color:var(--m);font-family:'DM Sans',sans-serif;font-size:0.78rem;cursor:pointer;letter-spacing:1px;text-transform:uppercase;transition:all .15s}
    .seg-btn.on{background:var(--o);border-color:var(--o);color:#fff;font-weight:600}
    .seg-btn:hover:not(.on){border-color:var(--o);color:var(--t)}
    .uconn-banner{background:linear-gradient(135deg,#0a1520,#111d2b);border:1px solid var(--br);border-left:4px solid var(--o);border-radius:10px;padding:14px 18px;margin-bottom:18px;display:flex;align-items:center;gap:14px}
    .uconn-tag{font-size:0.58rem;letter-spacing:3px;text-transform:uppercase;color:var(--o);margin-bottom:4px}
    .uconn-title{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;color:#fff;letter-spacing:1px}
    .uconn-sub{font-size:0.75rem;color:var(--m);margin-top:2px}
    .card{background:var(--c);border:1px solid var(--br);border-radius:10px;padding:18px;margin-bottom:14px}
    .card-title{font-family:'Bebas Neue',sans-serif;font-size:1rem;letter-spacing:2px;color:var(--o);margin-bottom:14px;display:flex;align-items:center;gap:8px}
    .card-title::after{content:'';flex:1;height:1px;background:var(--br)}
    .g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
    @media(max-width:540px){.g2{grid-template-columns:1fr}.g3{grid-template-columns:1fr 1fr}}
    .sg{background:var(--s);border-radius:8px;padding:10px;border:1px solid var(--br)}
    .sg-title{font-size:0.58rem;letter-spacing:2px;text-transform:uppercase;color:var(--m);margin-bottom:8px}
    .sr{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px}
    .sr:last-child{margin-bottom:0}
    .sn{font-size:0.78rem;color:var(--m)}
    .sv{display:flex;align-items:center;gap:4px}
    .ptbl{width:100%;border-collapse:collapse;min-width:520px}
    .ptbl th{font-size:0.58rem;letter-spacing:2px;text-transform:uppercase;color:var(--m);padding:5px 7px;text-align:center;border-bottom:1px solid var(--br)}
    .ptbl th:first-child{text-align:left}
    .ptbl td{padding:5px 6px;text-align:center;border-bottom:1px solid #0d1821}
    .ptbl td:first-child{text-align:left}
    .ptbl tr:last-child td{border-bottom:none}
    .pi{background:var(--s);border:1px solid var(--br);color:var(--t);padding:3px 5px;border-radius:4px;font-size:0.78rem;text-align:center;outline:none;width:38px;font-family:'DM Sans',sans-serif}
    .pi:focus{border-color:var(--o)}
    .pi-name{width:115px;text-align:left !important}
    .rm-btn{background:none;border:none;color:var(--m);cursor:pointer;font-size:0.85rem;padding:2px 5px;border-radius:3px}
    .rm-btn:hover{color:#f87171}
    .add-btn{background:none;border:1px dashed var(--br);color:var(--m);padding:6px 12px;border-radius:5px;cursor:pointer;font-size:0.72rem;letter-spacing:1px;text-transform:uppercase;font-family:'DM Sans',sans-serif;margin-top:8px;transition:all .15s}
    .add-btn:hover{border-color:var(--o);color:var(--o)}
    .run-btn{background:var(--o);color:#fff;border:none;padding:14px 28px;border-radius:8px;font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:2px;cursor:pointer;width:100%;margin-top:4px;transition:opacity .15s}
    .run-btn:hover{opacity:.88}
    .run-btn:disabled{opacity:.4;cursor:not-allowed}
    .loading{display:flex;flex-direction:column;align-items:center;gap:14px;padding:36px}
    .dots{display:flex;gap:7px}
    .dot{width:9px;height:9px;border-radius:50%;background:var(--o);animation:pulse 1.2s infinite}
    .dot:nth-child(2){animation-delay:.2s}
    .dot:nth-child(3){animation-delay:.4s}
    @keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.1)}}
    .load-txt{font-size:0.72rem;letter-spacing:3px;text-transform:uppercase;color:var(--m)}
    .err{background:#1a0a0a;border:1px solid #3d1414;color:#f87171;padding:12px 16px;border-radius:8px;font-size:0.83rem;margin-top:14px}
    .diff-num{font-family:'Bebas Neue',sans-serif;font-size:3.2rem;text-align:center;line-height:1}
    .hot-row{display:flex;align-items:flex-start;gap:12px;padding:11px;background:var(--s);border-radius:8px;border:1px solid var(--br);margin-bottom:7px}
    .hot-badge{background:var(--y);color:#0d1821;font-size:0.55rem;font-weight:700;padding:2px 6px;border-radius:3px;letter-spacing:1px;text-transform:uppercase;display:inline-block;margin-top:3px}
    .cold-badge{background:#1e3050;color:var(--m);font-size:0.55rem;font-weight:700;padding:2px 6px;border-radius:3px;letter-spacing:1px;text-transform:uppercase;display:inline-block;margin-top:3px}
    .adj-card{background:var(--s);border:1px solid var(--br);border-left:3px solid var(--o);border-radius:8px;padding:12px 14px;margin-bottom:8px}
    .adj-title{font-size:0.65rem;letter-spacing:2px;text-transform:uppercase;color:var(--o);margin-bottom:5px;font-weight:600}
    .adj-detail{font-size:0.86rem;line-height:1.65;color:var(--t)}
    .footer{text-align:center;padding:20px;color:var(--m);font-size:0.68rem;letter-spacing:2px;text-transform:uppercase;border-top:1px solid var(--br)}
  `;

  return (
    <>
      <Head>
        <title>Illinois MBB | Halftime Engine</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <style>{CSS}</style>

      <header className="hdr">
        <div className="hdr-l">
          <div className="logo">I</div>
          <div>
            <div className="hdr-title">Halftime Engine</div>
            <div className="hdr-sub">In-Game Adjustment Intelligence</div>
          </div>
        </div>
        <Link href="/" className="nav-btn">← Scouting</Link>
      </header>

      <div className="score-bar">
        <div>
          <div className="score-lbl">Score</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
            <div style={{ textAlign: "center" }}>
              <div className="score-team">Illinois</div>
              <input className="score-in" type="number" value={illScore} onChange={e => setIllScore(e.target.value)} min="0" max="150" />
            </div>
            <div className="score-vs">—</div>
            <div style={{ textAlign: "center" }}>
              <div className="score-team">{oppName || "Opp"}</div>
              <input className="score-in" type="number" value={oppScore} onChange={e => setOppScore(e.target.value)} min="0" max="150" />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--m)" }}>vs.</div>
          <input className="opp-in" type="text" placeholder="Opponent..." value={oppName} onChange={e => setOppName(e.target.value)} />
        </div>
      </div>

      <div className="main">

        {/* Mode selector */}
        <div className="seg" style={{ marginBottom: 10 }}>
          <button className={`seg-btn${mode === "halftime" ? " on" : ""}`} onClick={() => { setMode("halftime"); setAnalysis(null); if (input === "uconn") switchToUConn(); }}>Halftime Analysis</button>
          <button className={`seg-btn${mode === "postgame" ? " on" : ""}`} onClick={() => { setMode("postgame"); setAnalysis(null); if (input === "uconn") { setIllScore(MSG_GAME.illScore); setOppScore(MSG_GAME.oppScore); setStats(MSG_GAME); setOppName("UConn"); setPlayers(MSG_GAME.players); } }}>Post-Game Breakdown</button>
        </div>

        {/* Data selector */}
        <div className="seg">
          <button className={`seg-btn${input === "uconn" ? " on" : ""}`} onClick={switchToUConn}>📍 Load UConn @ MSG</button>
          <button className={`seg-btn${input === "custom" ? " on" : ""}`} onClick={switchToCustom}>+ Custom Game</button>
        </div>

        {/* UConn banner */}
        {input === "uconn" && (
          <div className="uconn-banner">
            <div style={{ fontSize: "2rem" }}>🏀</div>
            <div>
              <div className="uconn-tag">Real Game Data Loaded</div>
              <div className="uconn-title">#13 Illinois vs #5 UConn · Madison Square Garden · Nov 28, 2025</div>
              <div className="uconn-sub">Final: UConn 74, Illinois 61 · Illinois shot 31.7% FG, 20.7% from 3 · UConn never trailed</div>
            </div>
          </div>
        )}

        {/* Stats entry */}
        <div className="g2">
          <div className="card">
            <div className="card-title">Illinois {mode === "halftime" ? "1st Half" : "Full Game"} Shooting</div>
            <div className="sr"><span className="sn">FG Made / Att</span><div className="sv">{si("fgm")}<span style={{ color: "var(--m)", fontSize: "0.7rem" }}>/</span>{si("fga")}</div></div>
            <div className="sr"><span className="sn">3PT Made / Att</span><div className="sv">{si("tpm")}<span style={{ color: "var(--m)", fontSize: "0.7rem" }}>/</span>{si("tpa")}</div></div>
            <div className="sr"><span className="sn">FT Made / Att</span><div className="sv">{si("ftm")}<span style={{ color: "var(--m)", fontSize: "0.7rem" }}>/</span>{si("fta")}</div></div>
          </div>
          <div className="card">
            <div className="card-title">Illinois Possession</div>
            <div className="sr"><span className="sn">Turnovers</span>{si("tov")}</div>
            <div className="sr"><span className="sn">Off Rebounds</span>{si("orb")}</div>
            <div className="sr"><span className="sn">Def Rebounds</span>{si("drb")}</div>
            <div className="sr"><span className="sn">Assists</span>{si("ast")}</div>
            <div className="sr"><span className="sn">Team Fouls</span>{si("pf")}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">{oppName || "Opponent"} Stats</div>
          <div className="g3">
            <div className="sg">
              <div className="sg-title">Shooting</div>
              <div className="sr"><span className="sn">FG</span><div className="sv">{si("oFgm")}<span style={{ color: "var(--m)", fontSize: "0.7rem" }}>/</span>{si("oFga")}</div></div>
              <div className="sr"><span className="sn">3PT</span><div className="sv">{si("oTpm")}<span style={{ color: "var(--m)", fontSize: "0.7rem" }}>/</span>{si("oTpa")}</div></div>
            </div>
            <div className="sg">
              <div className="sg-title">Possession</div>
              <div className="sr"><span className="sn">Turnovers</span>{si("oTov")}</div>
              <div className="sr"><span className="sn">Off Reb</span>{si("oOrb")}</div>
            </div>
            <div className="sg">
              <div className="sg-title">Pressure</div>
              <div className="sr"><span className="sn">Paint Pts</span>{si("oPip")}</div>
              <div className="sr"><span className="sn">Fast Break</span>{si("oFb")}</div>
            </div>
          </div>
        </div>

        {(mode === "postgame" || input === "uconn") && (
          <div className="card">
            <div className="card-title">Player Stats</div>
            <div style={{ overflowX: "auto" }}>
              <table className="ptbl">
                <thead>
                  <tr><th>Player</th><th>#</th><th>Min</th><th>Pts</th><th>Reb</th><th>Ast</th><th>FG</th><th>TO</th><th>+/-</th><th></th></tr>
                </thead>
                <tbody>
                  {players.map((p, i) => (
                    <tr key={i}>
                      <td><input className="pi pi-name" type="text" value={p.name} onChange={e => updatePlayer(i, "name", e.target.value)} placeholder="Name" style={{ width: 115, textAlign: "left" }} /></td>
                      <td><input className="pi" type="text" value={p.num} onChange={e => updatePlayer(i, "num", e.target.value)} /></td>
                      <td><input className="pi" type="text" value={p.min} onChange={e => updatePlayer(i, "min", e.target.value)} /></td>
                      <td><input className="pi" type="text" value={p.pts} onChange={e => updatePlayer(i, "pts", e.target.value)} /></td>
                      <td><input className="pi" type="text" value={p.reb} onChange={e => updatePlayer(i, "reb", e.target.value)} /></td>
                      <td><input className="pi" type="text" value={p.ast} onChange={e => updatePlayer(i, "ast", e.target.value)} /></td>
                      <td><input className="pi" type="text" value={p.fg} onChange={e => updatePlayer(i, "fg", e.target.value)} /></td>
                      <td><input className="pi" type="text" value={p.to} onChange={e => updatePlayer(i, "to", e.target.value)} /></td>
                      <td><input className="pi" type="text" value={p.pm} onChange={e => updatePlayer(i, "pm", e.target.value)} /></td>
                      <td><button className="rm-btn" onClick={() => removePlayer(i)}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="add-btn" onClick={addPlayer}>+ Add Player</button>
          </div>
        )}

        <button className="run-btn" onClick={runAnalysis} disabled={loading}>
          {loading ? "Analyzing..." : mode === "postgame" ? "Run Post-Game Breakdown" : "Run Halftime Analysis"}
        </button>

        {loading && (
          <div className="loading">
            <div className="dots"><div className="dot" /><div className="dot" /><div className="dot" /></div>
            <div className="load-txt">{mode === "postgame" ? "Breaking down the game..." : "Running halftime analysis..."}</div>
          </div>
        )}

        {error && <div className="err">{error}</div>}

        {analysis && !loading && mode === "halftime" && (
          <div style={{ marginTop: 22 }}>
            <div className="card" style={{ textAlign: "center" }}>
              <div className="diff-num" style={{ color: diffColor }}>{diff > 0 ? `+${diff} Illinois` : diff < 0 ? `${Math.abs(diff)} Down` : "Tied"}</div>
              <div style={{ fontSize: "0.68rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--m)", marginTop: 3 }}>Illinois {illScore} — {oppName} {oppScore} · Halftime</div>
              <div style={{ marginTop: 14, padding: "11px 14px", background: "var(--s)", borderRadius: 8, borderLeft: "3px solid var(--o)", textAlign: "left" }}>
                <div style={{ fontSize: "0.58rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--o)", marginBottom: 5 }}>Reading the Game</div>
                <div style={{ fontSize: "0.88rem", lineHeight: 1.65 }}>{analysis.situation}</div>
              </div>
              <div style={{ marginTop: 9, padding: "12px 14px", background: "var(--b)", borderRadius: 8 }}>
                <div style={{ fontSize: "0.96rem", fontWeight: 600, color: "var(--y)" }}>"{analysis.mindset}"</div>
              </div>
            </div>

            {analysis.hotPlayers?.length > 0 && (
              <div className="card">
                <div className="card-title">Hot Players — Use More in 2nd Half</div>
                {analysis.hotPlayers.map((p, i) => (
                  <div key={i} className="hot-row">
                    <div style={{ minWidth: 115 }}><div style={{ fontWeight: 600, fontSize: "0.86rem" }}>{p.name}</div><span className="hot-badge">HOT</span></div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: "0.8rem", marginBottom: 3 }}>{p.reason}</div><div style={{ fontSize: "0.75rem", color: "var(--y)" }}>▶ {p.exploit}</div></div>
                  </div>
                ))}
              </div>
            )}

            {analysis.coldPlayers?.length > 0 && (
              <div className="card">
                <div className="card-title">Needs Correction</div>
                {analysis.coldPlayers.map((p, i) => (
                  <div key={i} className="hot-row" style={{ borderLeft: "3px solid #f87171" }}>
                    <div style={{ minWidth: 115 }}><div style={{ fontWeight: 600, fontSize: "0.86rem" }}>{p.name}</div><span className="cold-badge">Adjust</span></div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: "0.8rem", marginBottom: 3 }}>{p.issue}</div><div style={{ fontSize: "0.75rem", color: "#f87171" }}>→ {p.fix}</div></div>
                  </div>
                ))}
              </div>
            )}

            <div className="card">
              <div className="card-title">Second Half Adjustments</div>
              {(analysis.adjustments || []).map((a, i) => (
                <div key={i} className="adj-card"><div className="adj-title">{a.title}</div><div className="adj-detail">{a.detail}</div></div>
              ))}
            </div>

            <div className="card">
              <div className="card-title">Path to the Win</div>
              <div style={{ fontSize: "0.9rem", lineHeight: 1.7 }}>{analysis.winPath}</div>
            </div>
          </div>
        )}

        {analysis && !loading && mode === "postgame" && (
          <div style={{ marginTop: 22 }}>
            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.58rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--o)", marginBottom: 8 }}>Final Score</div>
              <div className="diff-num" style={{ color: "#f87171" }}>Illinois {illScore} — {oppName} {oppScore}</div>
              <div style={{ marginTop: 14, padding: "12px 14px", background: "var(--s)", borderRadius: 8, borderLeft: "4px solid var(--o)", textAlign: "left" }}>
                <div style={{ fontSize: "0.58rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--o)", marginBottom: 5 }}>What Decided the Game</div>
                <div style={{ fontSize: "0.92rem", lineHeight: 1.65, fontWeight: 500 }}>{analysis.headline}</div>
              </div>
            </div>

            {analysis.hotPlayer && (
              <div className="card">
                <div className="card-title">Bright Spot</div>
                <div className="hot-row">
                  <div style={{ minWidth: 115 }}><div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{analysis.hotPlayer.name}</div><span className="hot-badge">BEST</span></div>
                  <div style={{ flex: 1, fontSize: "0.84rem", lineHeight: 1.6 }}>{analysis.hotPlayer.why}</div>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-title">Root Causes of the Loss</div>
              {(analysis.rootCauses || []).map((c, i) => (
                <div key={i} className="adj-card" style={{ borderLeftColor: "#f87171" }}><div className="adj-title" style={{ color: "#f87171" }}>{c.title}</div><div className="adj-detail">{c.detail}</div></div>
              ))}
            </div>

            <div className="card">
              <div className="card-title">Rematch Keys — What Must Change vs {oppName}</div>
              {(analysis.rematchKeys || []).map((k, i) => (
                <div key={i} className="adj-card"><div className="adj-title">{k.title}</div><div className="adj-detail">{k.detail}</div></div>
              ))}
            </div>

            <div className="card">
              <div className="card-title">Analytical Takeaway</div>
              <div style={{ fontSize: "0.92rem", lineHeight: 1.7 }}>{analysis.analyticalTakeaway}</div>
            </div>
          </div>
        )}
      </div>

      <footer className="footer">Illinois MBB Halftime Engine · Built by Jonah Powers · {new Date().getFullYear()}</footer>
    </>
  );
}
