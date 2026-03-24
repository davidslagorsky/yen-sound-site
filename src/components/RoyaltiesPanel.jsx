import { useState, useRef } from "react";
import * as XLSX from "xlsx";

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/* ─── design tokens (matches YEN SOUND admin) ─── */
const C = {
  bg:       "#000",
  surface:  "#0a0a0a",
  surface2: "#111",
  border:   "rgba(240,237,232,0.1)",
  borderHi: "rgba(240,237,232,0.35)",
  text:     "#f0ede8",
  muted:    "rgba(240,237,232,0.35)",
  accent:   "#f0ede8",
  green:    "rgba(100,255,180,0.9)",
  red:      "rgba(255,100,100,0.85)",
};

/* ─── primitives ─── */
function Label({ children }) {
  return (
    <p style={{ fontFamily: F, fontSize: "8px", letterSpacing: "0.35em",
      textTransform: "uppercase", color: C.muted, marginBottom: "10px" }}>
      {children}
    </p>
  );
}

function Divider() {
  return <div style={{ height: "1px", background: C.border, margin: "20px 0" }} />;
}

function GhostBtn({ onClick, children, danger, active, full }) {
  const base = {
    fontFamily: F, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase",
    padding: "8px 14px", background: active ? "rgba(240,237,232,0.07)" : "transparent",
    cursor: "pointer",
    border: danger ? "1px solid rgba(255,100,100,0.4)"
      : active ? `1px solid ${C.borderHi}` : `1px solid ${C.border}`,
    color: danger ? C.red : C.text,
    transition: "all 0.15s",
    display: full ? "block" : "inline-block",
    width: full ? "100%" : "auto",
    boxSizing: "border-box",
    textAlign: "center",
  };
  return (
    <button style={base} onClick={onClick}
      onMouseOver={e => { e.currentTarget.style.borderColor = danger ? "rgba(255,100,100,0.7)" : C.borderHi; e.currentTarget.style.background = "rgba(240,237,232,0.05)"; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = danger ? "rgba(255,100,100,0.4)" : active ? C.borderHi : C.border; e.currentTarget.style.background = active ? "rgba(240,237,232,0.07)" : "transparent"; }}>
      {children}
    </button>
  );
}

function PrimaryBtn({ onClick, children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "block", width: "100%", padding: "15px 24px",
      border: `1px solid ${disabled ? C.border : C.borderHi}`,
      background: "transparent", color: disabled ? C.muted : C.text,
      fontFamily: F, fontSize: "10px", fontWeight: 700, letterSpacing: "0.3em",
      textTransform: "uppercase", cursor: disabled ? "default" : "pointer",
      transition: "all 0.15s", boxSizing: "border-box",
    }}
      onMouseOver={e => { if (!disabled) e.currentTarget.style.background = "#111"; }}
      onMouseOut={e => { e.currentTarget.style.background = "transparent"; }}>
      {children}
    </button>
  );
}

/* ─── KPI card ─── */
function Kpi({ label, value, highlight }) {
  return (
    <div style={{
      padding: "18px 16px", border: `1px solid ${highlight ? "rgba(100,255,180,0.2)" : C.border}`,
      background: highlight ? "rgba(100,255,180,0.03)" : "transparent",
      display: "flex", flexDirection: "column", gap: "6px",
    }}>
      <p style={{ fontFamily: F, fontSize: "8px", letterSpacing: "0.3em", textTransform: "uppercase", color: C.muted }}>{label}</p>
      <p style={{ fontFamily: "monospace", fontSize: "20px", color: highlight ? C.green : C.text, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</p>
    </div>
  );
}

/* ─── bar row ─── */
function Bar({ label, value, max, pct: commPct }) {
  const net = value - value * commPct / 100;
  const netMax = max * (1 - commPct / 100);
  const w = netMax > 0 ? Math.max(2, (net / netMax) * 100) : 2;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "9px", direction: "rtl" }}>
      <div style={{ width: "100px", fontFamily: F, fontSize: "9px", color: C.muted,
        textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flexShrink: 0 }}
        title={label}>{label.replace("אינטרנט - ","").replace("אינטרנט – ","")}</div>
      <div style={{ flex: 1, height: "3px", background: "rgba(240,237,232,0.07)", position: "relative" }}>
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${w}%`,
          background: C.borderHi, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
      <div style={{ fontFamily: "monospace", fontSize: "9px", color: C.muted, width: "54px", textAlign: "left", flexShrink: 0 }}>
        ₪{net.toFixed(2)}
      </div>
    </div>
  );
}

/* ─── multi-select performer ─── */
function PerformerSelect({ all, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const filtered = all.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase()));
  const toggle = name => { const s = new Set(selected); s.has(name) ? s.delete(name) : s.add(name); onChange(s); };

  const label = selected.size === 0 ? "כל המבצעים"
    : selected.size === 1 ? [...selected][0]
    : `${selected.size} מבצעים`;

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", padding: "9px 12px", background: "transparent",
        border: `1px solid ${open ? C.borderHi : C.border}`,
        color: selected.size > 0 ? C.text : C.muted,
        fontFamily: F, fontSize: "10px", letterSpacing: "0.05em",
        cursor: "pointer", display: "flex", justifyContent: "space-between",
        alignItems: "center", direction: "rtl", transition: "border-color 0.15s", boxSizing: "border-box",
      }}>
        <span>{label}</span>
        <span style={{ fontSize: "7px", opacity: 0.4, marginRight: "8px" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "100%", right: 0, left: 0, zIndex: 200,
          background: "#090909", border: `1px solid ${C.borderHi}`, borderTop: "none", maxHeight: "200px", overflowY: "auto" }}>
          <div style={{ padding: "8px", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: "#090909" }}>
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="חיפוש..."
              style={{ width: "100%", background: "transparent", border: `1px solid ${C.border}`,
                color: C.text, fontFamily: F, fontSize: "10px", padding: "6px 10px",
                outline: "none", direction: "rtl", boxSizing: "border-box" }} />
          </div>
          {filtered.map(p => (
            <div key={p.name} onClick={() => toggle(p.name)} style={{
              padding: "8px 12px", cursor: "pointer", direction: "rtl",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: `1px solid rgba(240,237,232,0.04)`,
              background: selected.has(p.name) ? "rgba(240,237,232,0.05)" : "transparent",
            }}
              onMouseOver={e => e.currentTarget.style.background = "rgba(240,237,232,0.07)"}
              onMouseOut={e => e.currentTarget.style.background = selected.has(p.name) ? "rgba(240,237,232,0.05)" : "transparent"}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "11px", height: "11px", border: `1px solid ${selected.has(p.name) ? C.text : C.muted}`,
                  background: selected.has(p.name) ? C.text : "transparent", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {selected.has(p.name) && <span style={{ fontSize: "7px", color: "#000", fontWeight: 900 }}>✓</span>}
                </div>
                <span style={{ fontFamily: F, fontSize: "10px", color: C.text }}>{p.name}</span>
              </div>
              <span style={{ fontFamily: "monospace", fontSize: "9px", color: C.muted }}>₪{p.total.toFixed(0)}</span>
            </div>
          ))}
          <div style={{ display: "flex", borderTop: `1px solid ${C.border}`, position: "sticky", bottom: 0, background: "#090909" }}>
            {[["בחר הכל", () => onChange(new Set(all.map(p => p.name)))], ["נקה", () => onChange(new Set())]].map(([lbl, fn]) => (
              <button key={lbl} onClick={fn} style={{ flex: 1, padding: "7px", background: "transparent",
                border: "none", borderRight: lbl === "בחר הכל" ? `1px solid ${C.border}` : "none",
                color: C.muted, fontFamily: F, fontSize: "9px", letterSpacing: "0.15em",
                textTransform: "uppercase", cursor: "pointer" }}
                onMouseOver={e => e.currentTarget.style.color = C.text}
                onMouseOut={e => e.currentTarget.style.color = C.muted}>{lbl}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function RoyaltiesPanel() {
  const fileRef = useRef(null);
  const [allData, setAllData] = useState([]);
  const [fileName, setFileName] = useState(null);
  const [selectedPerformers, setSelectedPerformers] = useState(new Set());
  const [filterSong, setFilterSong] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterDist, setFilterDist] = useState("");
  const [commPct, setCommPct] = useState(15);
  const [sortCol, setSortCol] = useState("amount");
  const [sortDir, setSortDir] = useState(-1);
  const [page, setPage] = useState(1);
  const PAGE = 40;

  /* ── parse ── */
  function handleFile(f) {
    if (!f) return;
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = e => {
      const wb = XLSX.read(e.target.result, { type: "array" });
      const sn = wb.SheetNames.find(n => n.includes("ניו מדיה") || n.includes("new media")) || wb.SheetNames[0];
      const raw = XLSX.utils.sheet_to_json(wb.Sheets[sn], { defval: "" });
      const parsed = raw.map(row => {
        const after = parseFloat(row["סכום למקבל התשלום"]) || 0;
        const before = parseFloat(row['\u05e1\u05db\u05d5\u05dd \u05dc\u05e4\u05e0\u05d9 \u05e7\u05d9\u05d6\u05d5\u05d6 \u05e2\u05de\u05dc\u05ea \u05d4\u05e4\u05d9"\u05dc'] || row["\u05e1\u05db\u05d5\u05dd \u05dc\u05e4\u05e0\u05d9 \u05e7\u05d9\u05d6\u05d5\u05d6 \u05e2\u05de\u05dc\u05ea \u05d4\u05e4\u05d9\u05dc"]) || after;
        return {
          song: String(row["\u05e9\u05dd \u05d4\u05d9\u05e6\u05d9\u05e8\u05d4"] || ""),
          performer: String(row["\u05e9\u05dd \u05d4\u05de\u05d1\u05e6\u05e2"] || ""),
          platform: String(row["\u05e1\u05d5\u05d2 \u05d5\u05d2\u05d5\u05e3"] || ""),
          period: String(row["\u05ea\u05e7\u05d5\u05e4\u05d4"] || ""),
          distribution: String(row["\u05d4\u05d7\u05dc\u05d5\u05e7\u05d4"] || ""),
          streams: parseFloat(row["\u05db\u05de\u05d5\u05ea \u05d4\u05e9\u05de\u05e2\u05d5\u05ea"]) || 0,
          amount: after,
          grossBeforePhil: before,
          philFee: before - after,
        };
      }).filter(r => r.song && r.amount >= 0);
      setAllData(parsed);
      setSelectedPerformers(new Set());
      setFilterSong(""); setFilterPlatform(""); setFilterDist("");
      setPage(1);
    };
    reader.readAsArrayBuffer(f);
  }

  /* ── derived ── */
  const allPerformers = (() => {
    const m = {};
    allData.forEach(r => { if (r.performer) m[r.performer] = (m[r.performer] || 0) + r.amount; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, total]) => ({ name, total }));
  })();

  const uniq = key => [...new Set(allData.map(r => r[key]).filter(Boolean))].sort();

  const filtered = allData.filter(r =>
    (selectedPerformers.size === 0 || selectedPerformers.has(r.performer)) &&
    (!filterSong || r.song === filterSong) &&
    (!filterPlatform || r.platform === filterPlatform) &&
    (!filterDist || r.distribution === filterDist)
  );

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortCol], bv = b[sortCol];
    return typeof av === "number" ? (av - bv) * sortDir : String(av).localeCompare(String(bv), "he") * sortDir;
  });
  const pageRows = sorted.slice((page - 1) * PAGE, page * PAGE);
  const totalPages = Math.ceil(sorted.length / PAGE);

  /* ── totals ── */
  const totalBefore = filtered.reduce((s, r) => s + r.grossBeforePhil, 0);
  const totalAfter  = filtered.reduce((s, r) => s + r.amount, 0);
  const philFeeSum  = totalBefore - totalAfter;
  const myFee       = totalAfter * commPct / 100;
  const net         = totalAfter - myFee;
  const streams     = filtered.reduce((s, r) => s + r.streams, 0);
  const songCount   = new Set(filtered.map(r => r.song)).size;
  const periodCount = new Set(filtered.map(r => r.distribution)).size;

  /* ── chart data ── */
  const bySong = {};
  filtered.forEach(r => { bySong[r.song] = (bySong[r.song] || 0) + r.amount; });
  const topSongs = Object.entries(bySong).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const byPlat = {};
  filtered.forEach(r => { byPlat[r.platform] = (byPlat[r.platform] || 0) + r.amount; });
  const topPlats = Object.entries(byPlat).sort((a, b) => b[1] - a[1]);

  /* ── sort ── */
  const handleSort = col => {
    if (sortCol === col) setSortDir(d => d * -1);
    else { setSortCol(col); setSortDir(-1); }
    setPage(1);
  };

  /* ── PDF export ── */
  function exportPDF() {
    const performer = selectedPerformers.size === 1 ? [...selectedPerformers][0]
      : selectedPerformers.size > 1 ? [...selectedPerformers].join(", ") : "\u05db\u05dc \u05d4\u05de\u05d1\u05e6\u05e2\u05d9\u05dd";
    const dateStr = new Date().toLocaleDateString("he-IL");
    const distributions = [...new Set(filtered.map(r => r.distribution))].join("  \u00b7  ");

    const songMap = {};
    filtered.forEach(r => {
      if (!songMap[r.song]) songMap[r.song] = { streams: 0, after: 0 };
      songMap[r.song].streams += r.streams;
      songMap[r.song].after   += r.amount;
    });
    const songsSorted = Object.entries(songMap).sort((a, b) => b[1].after - a[1].after);

    const byPlatFull = {};
    filtered.forEach(r => { byPlatFull[r.platform] = (byPlatFull[r.platform] || 0) + r.amount; });
    const platsSorted = Object.entries(byPlatFull).sort((a, b) => b[1] - a[1]);
    const maxPlatVal = platsSorted[0]?.[1] || 1;

    const distMap = {};
    filtered.forEach(r => { distMap[r.distribution] = (distMap[r.distribution] || 0) + r.amount; });
    const distSorted = Object.entries(distMap).sort((a, b) => a[0].localeCompare(b[0], "he"));

    const barHtml = (label, val, max) => {
      const netVal = val - val * commPct / 100;
      const netMax = max * (1 - commPct / 100);
      const w = netMax > 0 ? Math.max(1, (netVal / netMax) * 100).toFixed(1) : 1;
      const short = label.replace("\u05d0\u05d9\u05e0\u05d8\u05e8\u05e0\u05d8 - ", "").replace("\u05d0\u05d9\u05e0\u05d8\u05e8\u05e0\u05d8 \u2013 ", "");
      return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:7px;direction:rtl">
        <div style="width:120px;font-size:10px;color:#555;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:0">${short}</div>
        <div style="flex:1;height:3px;background:#e8e8e8;position:relative">
          <div style="position:absolute;right:0;top:0;bottom:0;width:${w}%;background:#111"></div>
        </div>
        <div style="font-size:10px;font-family:'Courier New',monospace;color:#333;white-space:nowrap;width:64px;text-align:left">\u20aa${netVal.toFixed(2)}</div>
      </div>`;
    };

    const html = `<!DOCTYPE html><html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Heebo',Arial,sans-serif;direction:rtl;background:#fff;color:#111;padding:40px}
  .doc-header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:24px;border-bottom:2px solid #111;margin-bottom:32px}
  .brand{font-size:11px;font-weight:700;letter-spacing:0.4em;text-transform:uppercase;color:#111;margin-bottom:4px}
  .doc-type{font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:#888;margin-bottom:16px}
  .performer-name{font-size:28px;font-weight:900;letter-spacing:-0.5px;line-height:1;color:#111}
  .doc-date{font-size:10px;color:#888;letter-spacing:0.1em;margin-bottom:4px;text-align:left}
  .doc-period{font-size:10px;color:#555;max-width:180px;line-height:1.6;text-align:left}
  .net-box{border:1.5px solid #111;padding:20px 24px;margin-bottom:28px;display:flex;align-items:center;justify-content:space-between}
  .net-label{font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#888}
  .net-value{font-size:32px;font-weight:900;letter-spacing:-1px;color:#111;font-family:'Courier New',monospace}
  .stats-row{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid #ddd;margin-bottom:28px}
  .stat{padding:14px 16px;border-left:1px solid #ddd;text-align:center}
  .stat:last-child{border-left:none}
  .stat-label{font-size:8px;letter-spacing:0.25em;text-transform:uppercase;color:#888;margin-bottom:6px}
  .stat-val{font-size:16px;font-weight:700;color:#111;font-family:'Courier New',monospace}
  .section{margin-bottom:28px}
  .section-head{font-size:8px;letter-spacing:0.3em;text-transform:uppercase;color:#888;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #e8e8e8}
  .period-grid{display:flex;gap:10px;flex-wrap:wrap}
  .period-card{border:1px solid #e8e8e8;padding:12px 16px;flex:1;min-width:100px}
  .period-name{font-size:9px;color:#888;margin-bottom:6px}
  .period-val{font-size:14px;font-weight:700;color:#111;font-family:'Courier New',monospace}
  table{width:100%;border-collapse:collapse;font-size:10px}
  th{padding:8px 10px;text-align:right;font-size:8px;letter-spacing:0.25em;text-transform:uppercase;color:#888;border-bottom:1.5px solid #111;font-weight:600}
  th.left{text-align:left}
  td{padding:8px 10px;border-bottom:1px solid #f0f0f0;color:#222;vertical-align:middle}
  td.mono{font-family:'Courier New',monospace;font-size:10px}
  td.net{font-family:'Courier New',monospace;font-weight:700;color:#111}
  tr.total-row td{font-weight:700;border-top:1.5px solid #111;border-bottom:none;background:#f8f8f8;padding-top:10px}
  tr:nth-child(even) td{background:#fafafa}
  .doc-footer{margin-top:32px;padding-top:16px;border-top:1px solid #ddd;display:flex;justify-content:space-between;align-items:center}
  .footer-brand{font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#bbb;font-weight:700}
  .footer-note{font-size:8px;color:#ccc;letter-spacing:0.1em}
  @media print{body{padding:20px}@page{margin:10mm;size:A4}}
</style>
</head>
<body>
  <div class="doc-header">
    <div>
      <div class="brand">YEN SOUND</div>
      <div class="doc-type">\u05d3\u05d5\u05d7 \u05ea\u05de\u05dc\u05d5\u05d2\u05d9 \u05e0\u05d9\u05d5 \u05de\u05d3\u05d9\u05d4</div>
      <div class="performer-name">${performer}</div>
    </div>
    <div>
      <div class="doc-date">${dateStr}</div>
      <div class="doc-period">${distributions}</div>
    </div>
  </div>

  <div class="net-box">
    <span class="net-label">\u05e0\u05d8\u05d5 \u05dc\u05d0\u05de\u05df</span>
    <span class="net-value">\u20aa${net.toFixed(2)}</span>
  </div>

  <div class="stats-row">
    <div class="stat"><div class="stat-label">\u05d4\u05e9\u05de\u05e2\u05d5\u05ea</div><div class="stat-val">${streams.toLocaleString()}</div></div>
    <div class="stat"><div class="stat-label">\u05d9\u05e6\u05d9\u05e8\u05d5\u05ea</div><div class="stat-val">${songCount}</div></div>
    <div class="stat"><div class="stat-label">\u05ea\u05e7\u05d5\u05e4\u05d5\u05ea</div><div class="stat-val">${periodCount}</div></div>
  </div>

  <div class="section">
    <div class="section-head">TOP \u05e9\u05d9\u05e8\u05d9\u05dd</div>
    ${songsSorted.slice(0, 8).map(([n, d]) => barHtml(n, d.after, songsSorted[0]?.[1]?.after || 1)).join("")}
  </div>

  <div class="section">
    <div class="section-head">\u05e4\u05dc\u05d8\u05e4\u05d5\u05e8\u05de\u05d5\u05ea</div>
    ${platsSorted.map(([n, v]) => barHtml(n, v, maxPlatVal)).join("")}
  </div>

  <div class="section">
    <div class="section-head">\u05dc\u05e4\u05d9 \u05ea\u05e7\u05d5\u05e4\u05ea \u05d7\u05dc\u05d5\u05e7\u05d4</div>
    <div class="period-grid">
      ${distSorted.map(([dist, val]) => {
        const dnet = val - val * commPct / 100;
        return `<div class="period-card">
          <div class="period-name">${dist.replace("\u05d7\u05dc\u05d5\u05e7\u05ea \u05e0\u05d9\u05d5 \u05de\u05d3\u05d9\u05d4 ", "")}</div>
          <div class="period-val">\u20aa${dnet.toFixed(2)}</div>
        </div>`;
      }).join("")}
    </div>
  </div>

  <div class="section">
    <div class="section-head">\u05e4\u05d9\u05e8\u05d5\u05d8 \u05dc\u05e4\u05d9 \u05e9\u05d9\u05e8</div>
    <table>
      <thead><tr>
        <th>\u05e9\u05dd \u05e9\u05d9\u05e8</th>
        <th style="text-align:center">\u05d4\u05e9\u05de\u05e2\u05d5\u05ea</th>
        <th class="left">\u05e0\u05d8\u05d5 \u05dc\u05d0\u05de\u05df</th>
      </tr></thead>
      <tbody>
        ${songsSorted.map(([song, d]) => {
          const songNet = d.after - d.after * commPct / 100;
          return `<tr>
            <td>${song}</td>
            <td class="mono" style="text-align:center">${d.streams.toLocaleString()}</td>
            <td class="net left">\u20aa${songNet.toFixed(4)}</td>
          </tr>`;
        }).join("")}
        <tr class="total-row">
          <td>\u05e1\u05d4"\u05db</td>
          <td class="mono" style="text-align:center">${streams.toLocaleString()}</td>
          <td class="net left">\u20aa${net.toFixed(4)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-head">\u05e4\u05d9\u05e8\u05d5\u05d8 \u05e9\u05d5\u05e8\u05d5\u05ea \u05de\u05dc\u05d0</div>
    <table>
      <thead><tr>
        <th>\u05e9\u05dd \u05e9\u05d9\u05e8</th><th>\u05de\u05d1\u05e6\u05e2</th><th>\u05e4\u05dc\u05d8\u05e4\u05d5\u05e8\u05de\u05d4</th><th>\u05ea\u05e7\u05d5\u05e4\u05d4</th>
        <th style="text-align:center">\u05d4\u05e9\u05de\u05e2\u05d5\u05ea</th><th class="left">\u05e0\u05d8\u05d5 \u05dc\u05d0\u05de\u05df</th>
      </tr></thead>
      <tbody>
        ${filtered.map(r => {
          const rowNet = r.amount - r.amount * commPct / 100;
          return `<tr>
            <td style="font-weight:600">${r.song}</td>
            <td style="color:#666;font-size:9px">${r.performer}</td>
            <td style="color:#777">${r.platform.replace("\u05d0\u05d9\u05e0\u05d8\u05e8\u05e0\u05d8 - ","")}</td>
            <td style="color:#999;font-size:9px">${r.period}</td>
            <td class="mono" style="text-align:center">${r.streams.toLocaleString()}</td>
            <td class="net left">\u20aa${rowNet.toFixed(4)}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>
  </div>

  <div class="doc-footer">
    <span class="footer-brand">YEN SOUND</span>
    <span class="footer-note">\u05d4\u05d5\u05e4\u05e7 ${dateStr} \u00b7 \u05de\u05e1\u05de\u05da \u05d6\u05d4 \u05de\u05d9\u05d5\u05e2\u05d3 \u05dc\u05d0\u05de\u05df \u05d1\u05dc\u05d1\u05d3</span>
  </div>
</body></html>`;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 700);
  }

  /* ─── upload screen ─── */
  if (allData.length === 0) return (
    <div>
      <Label>\u05d4\u05e2\u05dc\u05d4 \u05e7\u05d5\u05d1\u05e5 Excel \u05de\u05d4\u05e4\u05d9"\u05dc</Label>
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        style={{
          border: `1px dashed ${C.border}`, padding: "48px 24px",
          textAlign: "center", cursor: "pointer", transition: "border-color 0.2s",
        }}
        onMouseOver={e => e.currentTarget.style.borderColor = C.borderHi}
        onMouseOut={e => e.currentTarget.style.borderColor = C.border}
      >
        <p style={{ fontFamily: F, fontSize: "28px", opacity: 0.15, marginBottom: "14px", lineHeight: 1 }}>&uarr;</p>
        <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: C.muted, marginBottom: "6px" }}>
          \u05d2\u05e8\u05d5\u05e8 \u05e7\u05d5\u05d1\u05e5 xlsx \u05dc\u05db\u05d0\u05df
        </p>
        <p style={{ fontFamily: F, fontSize: "9px", color: "rgba(240,237,232,0.15)", letterSpacing: "0.15em" }}>
          \u05d0\u05d5 \u05dc\u05d7\u05e5 \u05dc\u05d1\u05d7\u05d9\u05e8\u05d4
        </p>
      </div>
      <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }}
        onChange={e => handleFile(e.target.files[0])} />
    </div>
  );

  const selectStyle = {
    width: "100%", background: "transparent", border: `1px solid ${C.border}`,
    color: C.muted, fontFamily: F, fontSize: "10px", padding: "9px 12px",
    outline: "none", cursor: "pointer", direction: "rtl",
    appearance: "none", WebkitAppearance: "none", boxSizing: "border-box",
  };

  const thStyle = {
    fontFamily: F, fontSize: "8px", letterSpacing: "0.25em", textTransform: "uppercase",
    color: C.muted, padding: "10px 12px", textAlign: "right", fontWeight: 600,
    borderBottom: `1px solid ${C.border}`, cursor: "pointer", whiteSpace: "nowrap",
    userSelect: "none",
  };

  const tdStyle = {
    fontFamily: F, fontSize: "10px", padding: "10px 12px",
    borderBottom: `1px solid rgba(240,237,232,0.04)`, color: C.text,
    textAlign: "right", verticalAlign: "middle",
  };

  /* ─── dashboard ─── */
  return (
    <div style={{ direction: "rtl" }}>

      {/* file + reset */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: C.green, opacity: 0.8 }} />
          <span style={{ fontFamily: F, fontSize: "9px", color: C.muted, letterSpacing: "0.05em" }}>{fileName}</span>
          <span style={{ fontFamily: F, fontSize: "9px", color: "rgba(240,237,232,0.18)" }}>
            &middot; {allData.length.toLocaleString()} \u05e9\u05d5\u05e8\u05d5\u05ea
          </span>
        </div>
        <GhostBtn onClick={() => { setAllData([]); setFileName(null); }}>&uarr; \u05e7\u05d5\u05d1\u05e5 \u05d7\u05d3\u05e9</GhostBtn>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1px", background: C.border, marginBottom: "20px" }}>
        <Kpi label='\u05e1\u05d4"\u05db \u05ea\u05de\u05dc\u05d5\u05d2\u05d9\u05dd' value={`\u20aa${totalAfter.toFixed(2)}`} />
        <Kpi label="\u05d4\u05e9\u05de\u05e2\u05d5\u05ea" value={streams.toLocaleString()} />
        <Kpi label="\u05e9\u05d9\u05e8\u05d9\u05dd" value={songCount} />
        <Kpi label="\u05ea\u05e7\u05d5\u05e4\u05d5\u05ea" value={periodCount} />
      </div>

      {/* filters */}
      <div style={{ border: `1px solid ${C.border}`, padding: "16px", marginBottom: "1px" }}>
        <Label>\u05e4\u05d9\u05dc\u05d8\u05e8\u05d9\u05dd</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
          <PerformerSelect all={allPerformers} selected={selectedPerformers}
            onChange={s => { setSelectedPerformers(s); setPage(1); }} />
          <select value={filterSong} onChange={e => { setFilterSong(e.target.value); setPage(1); }} style={selectStyle}>
            <option value="">\u05db\u05dc \u05d4\u05e9\u05d9\u05e8\u05d9\u05dd</option>
            {uniq("song").map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select value={filterPlatform} onChange={e => { setFilterPlatform(e.target.value); setPage(1); }} style={selectStyle}>
            <option value="">\u05db\u05dc \u05d4\u05e4\u05dc\u05d8\u05e4\u05d5\u05e8\u05de\u05d5\u05ea</option>
            {uniq("platform").map(v => <option key={v} value={v}>{v.replace("\u05d0\u05d9\u05e0\u05d8\u05e8\u05e0\u05d8 - ","")}</option>)}
          </select>
          <select value={filterDist} onChange={e => { setFilterDist(e.target.value); setPage(1); }} style={selectStyle}>
            <option value="">\u05db\u05dc \u05d4\u05d7\u05dc\u05d5\u05e7\u05d5\u05ea</option>
            {uniq("distribution").map(v => <option key={v} value={v}>{v.replace("\u05d7\u05dc\u05d5\u05e7\u05ea \u05e0\u05d9\u05d5 \u05de\u05d3\u05d9\u05d4 ","")}</option>)}
          </select>
        </div>
        {(selectedPerformers.size > 0 || filterSong || filterPlatform || filterDist) && (
          <div style={{ marginTop: "8px" }}>
            <GhostBtn onClick={() => { setSelectedPerformers(new Set()); setFilterSong(""); setFilterPlatform(""); setFilterDist(""); setPage(1); }}>
              &uarr; \u05d0\u05e4\u05e1 \u05e4\u05d9\u05dc\u05d8\u05e8\u05d9\u05dd
            </GhostBtn>
          </div>
        )}
      </div>

      {/* commission */}
      <div style={{ border: `1px solid ${C.border}`, borderTop: "none", padding: "16px", marginBottom: "20px" }}>
        <Label>\u05de\u05d7\u05e9\u05d1\u05d5\u05df \u05e2\u05de\u05dc\u05d4</Label>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <input type="number" value={commPct} min={0} max={100} step={0.5}
            onChange={e => setCommPct(parseFloat(e.target.value) || 0)}
            style={{ width: "56px", background: "transparent", border: `1px solid ${C.border}`,
              color: C.text, fontFamily: "monospace", fontSize: "13px", padding: "6px 8px",
              outline: "none", textAlign: "center" }}
            onFocus={e => e.target.style.borderColor = C.borderHi}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          <span style={{ fontFamily: F, fontSize: "9px", color: C.muted, letterSpacing: "0.15em" }}>% \u05e2\u05de\u05dc\u05ea \u05d4\u05e4\u05e6\u05d4 \u05e9\u05dc\u05d9</span>
        </div>
        {[
          ['\u05d1\u05e8\u05d5\u05d8\u05d5 \u05dc\u05e4\u05e0\u05d9 \u05d4\u05e4\u05d9"\u05dc', `\u20aa${totalBefore.toFixed(2)}`],
          ['\u05e2\u05de\u05dc\u05ea \u05d4\u05e4\u05d9"\u05dc', `\u2212\u20aa${philFeeSum.toFixed(2)}`],
          ['\u05d0\u05d7\u05e8\u05d9 \u05d4\u05e4\u05d9"\u05dc', `\u20aa${totalAfter.toFixed(2)}`],
          ["\u05e2\u05de\u05dc\u05ea \u05d4\u05e4\u05e6\u05d4 \u05e9\u05dc\u05d9", `\u2212\u20aa${myFee.toFixed(2)}`],
        ].map(([lbl, val]) => (
          <div key={lbl} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "6px 0", borderBottom: `1px solid rgba(240,237,232,0.05)` }}>
            <span style={{ fontFamily: F, fontSize: "9px", color: C.muted }}>{lbl}</span>
            <span style={{ fontFamily: "monospace", fontSize: "10px", color: C.muted }}>{val}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: "12px" }}>
          <span style={{ fontFamily: F, fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", color: C.text }}>\u05e0\u05d8\u05d5 \u05e1\u05d5\u05e4\u05d9 \u05dc\u05d0\u05de\u05df</span>
          <span style={{ fontFamily: "monospace", fontSize: "18px", color: C.green }}>\u20aa{net.toFixed(2)}</span>
        </div>
      </div>

      {/* charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: C.border, marginBottom: "20px" }}>
        <div style={{ background: C.bg, padding: "16px" }}>
          <Label>TOP \u05e9\u05d9\u05e8\u05d9\u05dd &mdash; \u05e0\u05d8\u05d5</Label>
          {topSongs.map(([name, val]) => (
            <Bar key={name} label={name} value={val} max={topSongs[0]?.[1] || 1} pct={commPct} />
          ))}
        </div>
        <div style={{ background: C.bg, padding: "16px" }}>
          <Label>\u05e4\u05dc\u05d8\u05e4\u05d5\u05e8\u05de\u05d5\u05ea &mdash; \u05e0\u05d8\u05d5</Label>
          {topPlats.map(([name, val]) => (
            <Bar key={name} label={name} value={val} max={topPlats[0]?.[1] || 1} pct={commPct} />
          ))}
        </div>
      </div>

      {/* export */}
      <div style={{ marginBottom: "20px" }}>
        <PrimaryBtn onClick={exportPDF}>\u05d9\u05d9\u05e6\u05d5\u05d0 \u05d3\u05d5\u05d7 \u05dc\u05d0\u05de\u05df &mdash; PDF</PrimaryBtn>
      </div>

      <Divider />

      {/* table header */}
      <div style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Label>\u05e4\u05d9\u05e8\u05d5\u05d8 \u05e9\u05d5\u05e8\u05d5\u05ea</Label>
        <span style={{ fontFamily: F, fontSize: "9px", color: C.muted }}>{filtered.length.toLocaleString()} \u05e9\u05d5\u05e8\u05d5\u05ea</span>
      </div>

      <div style={{ border: `1px solid ${C.border}`, overflowX: "auto", marginBottom: "16px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "480px" }}>
          <thead>
            <tr>
              {[["\u05e9\u05d9\u05e8","song"],["\u05de\u05d1\u05e6\u05e2","performer"],["\u05e4\u05dc\u05d8\u05e4\u05d5\u05e8\u05de\u05d4","platform"],["\u05ea\u05e7\u05d5\u05e4\u05d4","period"],["\u05d4\u05e9\u05de\u05e2\u05d5\u05ea","streams"],["\u05e1\u05db\u05d5\u05dd \u20aa","amount"]].map(([lbl, col]) => (
                <th key={col} onClick={() => handleSort(col)} style={thStyle}>
                  {lbl}{sortCol === col ? (sortDir === 1 ? " \u2191" : " \u2193") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r, i) => (
              <tr key={i}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{r.song}</td>
                <td style={{ ...tdStyle, color: C.muted, fontSize: "9px" }}>{r.performer.length > 22 ? r.performer.substring(0,22) + "\u2026" : r.performer}</td>
                <td style={{ ...tdStyle, color: C.muted, fontSize: "9px" }}>{r.platform.replace("\u05d0\u05d9\u05e0\u05d8\u05e8\u05e0\u05d8 - ","").replace("\u05d0\u05d9\u05e0\u05d8\u05e8\u05e0\u05d8 \u2013 ","")}</td>
                <td style={{ ...tdStyle, color: "rgba(240,237,232,0.25)", fontSize: "9px" }}>{r.period}</td>
                <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "10px", color: C.muted }}>{r.streams.toLocaleString()}</td>
                <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "10px" }}>\u20aa{r.amount.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "4px", justifyContent: "center", flexWrap: "wrap" }}>
          {page > 1 && <GhostBtn onClick={() => setPage(p => p - 1)}>&rarr;</GhostBtn>}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i-1] > 1) acc.push("\u2026"); acc.push(p); return acc; }, [])
            .map((p, i) => p === "\u2026"
              ? <span key={i} style={{ fontFamily: F, fontSize: "9px", color: C.muted, padding: "8px 2px" }}>\u2026</span>
              : <GhostBtn key={p} active={p === page} onClick={() => setPage(p)}>{p}</GhostBtn>
            )}
          {page < totalPages && <GhostBtn onClick={() => setPage(p => p + 1)}>&larr;</GhostBtn>}
        </div>
      )}
    </div>
  );
}
