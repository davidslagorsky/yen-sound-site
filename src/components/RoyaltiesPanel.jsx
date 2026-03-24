import { useState, useRef } from "react";
import * as XLSX from "xlsx";

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/* ─── shared primitives (matching AdminDashboard style) ─── */
function FieldLabel({ children }) {
  return (
    <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.35, marginBottom: "6px" }}>
      {children}
    </p>
  );
}

function GhostBtn({ onClick, children, danger = false, active = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: F, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase",
        padding: "7px 12px", background: active ? "rgba(240,237,232,0.08)" : "transparent",
        cursor: "pointer", border: danger
          ? "1px solid rgba(220,80,80,0.5)"
          : active ? "1px solid rgba(240,237,232,0.5)" : "1px solid rgba(240,237,232,0.25)",
        color: danger ? "rgba(220,80,80,0.9)" : "#f0ede8",
        transition: "border-color 0.15s",
      }}
      onMouseOver={e => { e.currentTarget.style.borderColor = danger ? "rgba(220,80,80,0.8)" : "rgba(240,237,232,0.6)"; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = danger ? "rgba(220,80,80,0.5)" : active ? "rgba(240,237,232,0.5)" : "rgba(240,237,232,0.25)"; }}
    >
      {children}
    </button>
  );
}

function ActionBtn({ onClick, children, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "block", width: "100%", padding: "14px 24px",
        border: "2px solid rgba(240,237,232,0.8)", background: "transparent",
        color: "#f0ede8", fontFamily: F, fontSize: "11px", fontWeight: 700,
        letterSpacing: "0.3em", textTransform: "uppercase",
        cursor: disabled ? "default" : "pointer", transition: "background 0.15s",
        opacity: disabled ? 0.4 : 1, boxSizing: "border-box",
      }}
      onMouseOver={e => { if (!disabled) e.currentTarget.style.background = "#111"; }}
      onMouseOut={e => { e.currentTarget.style.background = "transparent"; }}
    >
      {children}
    </button>
  );
}

/* ─── multi-select performer dropdown ─── */
function PerformerSelect({ allPerformers, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef(null);

  const filtered = allPerformers.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = name => {
    const next = new Set(selected);
    next.has(name) ? next.delete(name) : next.add(name);
    onChange(next);
  };

  const label = selected.size === 0
    ? "כל המבצעים"
    : selected.size === 1
      ? [...selected][0]
      : `${selected.size} מבצעים נבחרו`;

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "10px 12px", background: "transparent",
          border: `1px solid rgba(240,237,232,${open ? "0.5" : "0.2"})`,
          color: "#f0ede8", fontFamily: F, fontSize: "11px", letterSpacing: "0.05em",
          cursor: "pointer", display: "flex", justifyContent: "space-between",
          alignItems: "center", direction: "rtl", transition: "border-color 0.15s",
        }}
      >
        <span style={{ opacity: selected.size === 0 ? 0.4 : 1 }}>{label}</span>
        <span style={{ opacity: 0.4, fontSize: "8px", marginRight: "6px" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "100%", right: 0, left: 0, zIndex: 100,
          background: "#080808", border: "1px solid rgba(240,237,232,0.2)",
          borderTop: "none", maxHeight: "220px", overflowY: "auto",
        }}>
          {/* search */}
          <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(240,237,232,0.08)", position: "sticky", top: 0, background: "#080808" }}>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="חיפוש..."
              style={{
                width: "100%", background: "transparent", border: "1px solid rgba(240,237,232,0.15)",
                color: "#f0ede8", fontFamily: F, fontSize: "11px", padding: "6px 10px",
                outline: "none", direction: "rtl", boxSizing: "border-box",
              }}
            />
          </div>

          {/* options */}
          {filtered.map(p => (
            <div
              key={p.name}
              onClick={() => toggle(p.name)}
              style={{
                padding: "8px 12px", cursor: "pointer", direction: "rtl",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderBottom: "1px solid rgba(240,237,232,0.04)",
                background: selected.has(p.name) ? "rgba(240,237,232,0.05)" : "transparent",
                transition: "background 0.1s",
              }}
              onMouseOver={e => { e.currentTarget.style.background = "rgba(240,237,232,0.08)"; }}
              onMouseOut={e => { e.currentTarget.style.background = selected.has(p.name) ? "rgba(240,237,232,0.05)" : "transparent"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "12px", height: "12px", border: "1px solid rgba(240,237,232,0.4)",
                  background: selected.has(p.name) ? "#f0ede8" : "transparent",
                  flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {selected.has(p.name) && <span style={{ fontSize: "8px", color: "#000", fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontFamily: F, fontSize: "11px", color: "#f0ede8" }}>{p.name}</span>
              </div>
              <span style={{ fontFamily: "monospace", fontSize: "9px", opacity: 0.35 }}>
                ₪{p.total.toFixed(0)}
              </span>
            </div>
          ))}

          {/* actions */}
          <div style={{ display: "flex", gap: "0", borderTop: "1px solid rgba(240,237,232,0.08)", position: "sticky", bottom: 0, background: "#080808" }}>
            {[["בחר הכל", () => onChange(new Set(allPerformers.map(p => p.name)))],
              ["נקה", () => onChange(new Set())]].map(([label, fn]) => (
              <button key={label} onClick={fn} style={{
                flex: 1, padding: "8px", background: "transparent",
                border: "none", borderRight: label === "בחר הכל" ? "1px solid rgba(240,237,232,0.08)" : "none",
                color: "#f0ede8", fontFamily: F, fontSize: "9px", letterSpacing: "0.15em",
                textTransform: "uppercase", cursor: "pointer", opacity: 0.5,
              }}>{label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── bar chart row ─── */
function BarRow({ label, value, max, accent = false }) {
  const pct = max > 0 ? Math.max(1, (value / max) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", direction: "rtl" }}>
      <div style={{ width: "110px", fontFamily: F, fontSize: "10px", opacity: 0.55, textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flexShrink: 0 }}
        title={label}>{label}</div>
      <div style={{ flex: 1, height: "16px", background: "rgba(240,237,232,0.06)", position: "relative" }}>
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0,
          width: `${pct}%`,
          background: accent ? "rgba(240,237,232,0.7)" : "rgba(240,237,232,0.25)",
          transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>
      <div style={{ fontFamily: "monospace", fontSize: "9px", opacity: 0.5, whiteSpace: "nowrap", width: "60px", textAlign: "left" }}>
        ₪{value.toFixed(2)}
      </div>
    </div>
  );
}

/* ─── KPI card ─── */
function KpiCard({ label, value }) {
  return (
    <div style={{ border: "1px solid rgba(240,237,232,0.12)", padding: "16px 14px", textAlign: "center" }}>
      <p style={{ fontFamily: F, fontSize: "8px", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.3, marginBottom: "8px" }}>{label}</p>
      <p style={{ fontFamily: "monospace", fontSize: "18px", color: "#f0ede8", letterSpacing: "-0.02em" }}>{value}</p>
    </div>
  );
}

/* ─── main panel ─── */
export default function RoyaltiesPanel() {
  const fileInputRef = useRef(null);
  const [allData, setAllData] = useState([]);
  const [fileName, setFileName] = useState(null);
  const [selectedPerformers, setSelectedPerformers] = useState(new Set());
  const [filterSong, setFilterSong] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterDist, setFilterDist] = useState("");
  const [commissionPct, setCommissionPct] = useState(15);
  const [sortCol, setSortCol] = useState("amount");
  const [sortDir, setSortDir] = useState(-1);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 40;

  /* ── parse uploaded file ── */
  function handleFile(file) {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const wb = XLSX.read(e.target.result, { type: "array" });
      const sheetName = wb.SheetNames.find(n => n.includes("ניו מדיה") || n.includes("new media")) || wb.SheetNames[0];
      const raw = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: "" });
      const parsed = raw.map(row => {
        const afterPhil = parseFloat(row["סכום למקבל התשלום"]) || 0;
        const beforePhil = parseFloat(row['סכום לפני קיזוז עמלת הפי"ל'] || row["סכום לפני קיזוז עמלת הפיל"]) || afterPhil;
        return {
          song: String(row["שם היצירה"] || ""),
          performer: String(row["שם המבצע"] || ""),
          platform: String(row["סוג וגוף"] || ""),
          period: String(row["תקופה"] || ""),
          distribution: String(row["החלוקה"] || ""),
          streams: parseFloat(row["כמות השמעות"]) || 0,
          amount: afterPhil,
          grossBeforePhil: beforePhil,
          philFee: beforePhil - afterPhil,
        };
      }).filter(r => r.song && r.amount >= 0);
      setAllData(parsed);
      setSelectedPerformers(new Set());
      setFilterSong(""); setFilterPlatform(""); setFilterDist("");
      setPage(1);
    };
    reader.readAsArrayBuffer(file);
  }

  /* ── derived data ── */
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

  const paginatedRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);

  /* ── totals ── */
  const totalBeforePhil = filtered.reduce((s, r) => s + r.grossBeforePhil, 0);
  const totalAfterPhil = filtered.reduce((s, r) => s + r.amount, 0);
  const totalPhilFee = totalBeforePhil - totalAfterPhil;
  const myFee = totalAfterPhil * commissionPct / 100;
  const net = totalAfterPhil - myFee;
  const totalStreams = filtered.reduce((s, r) => s + r.streams, 0);
  const songCount = new Set(filtered.map(r => r.song)).size;
  const periodCount = new Set(filtered.map(r => r.distribution)).size;

  /* ── chart data ── */
  const bySong = {};
  filtered.forEach(r => { bySong[r.song] = (bySong[r.song] || 0) + r.amount; });
  const topSongs = Object.entries(bySong).sort((a, b) => b[1] - a[1]).slice(0, 7);

  const byPlat = {};
  filtered.forEach(r => {
    const short = r.platform.replace("אינטרנט - ", "").replace("אינטרנט – ", "");
    byPlat[short] = (byPlat[short] || 0) + r.amount;
  });
  const topPlats = Object.entries(byPlat).sort((a, b) => b[1] - a[1]);

  /* ── sort toggle ── */
  const handleSort = col => {
    if (sortCol === col) setSortDir(d => d * -1);
    else { setSortCol(col); setSortDir(-1); }
    setPage(1);
  };

  /* ── PDF export ── */
  function exportPDF() {
    const performer = selectedPerformers.size === 1
      ? [...selectedPerformers][0]
      : selectedPerformers.size > 1 ? `${selectedPerformers.size} מבצעים` : "כל המבצעים";
    const dateStr = new Date().toLocaleDateString("he-IL");
    const distributions = [...new Set(filtered.map(r => r.distribution))].join(", ");

    const songMap = {};
    filtered.forEach(r => {
      if (!songMap[r.song]) songMap[r.song] = { streams: 0, afterPhil: 0 };
      songMap[r.song].streams += r.streams;
      songMap[r.song].afterPhil += r.amount;
    });
    const songsSorted = Object.entries(songMap).sort((a, b) => b[1].afterPhil - a[1].afterPhil);

    const byPlatFull = {};
    filtered.forEach(r => { byPlatFull[r.platform] = (byPlatFull[r.platform] || 0) + r.amount; });
    const platsSorted = Object.entries(byPlatFull).sort((a, b) => b[1] - a[1]);
    const maxPlat = platsSorted[0]?.[1] || 1;

    const distMap = {};
    filtered.forEach(r => { distMap[r.distribution] = (distMap[r.distribution] || 0) + r.amount; });
    const distSorted = Object.entries(distMap).sort((a, b) => a[0].localeCompare(b[0], "he"));

    const barRow = (label, val, max) => {
      const w = Math.max(1, (val / max) * 100).toFixed(1);
      const short = label.replace("אינטרנט - ", "").replace("אינטרנט – ", "");
      return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
        <div style="width:110px;font-size:10px;color:#555;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:0" title="${label}">${short}</div>
        <div style="flex:1;height:14px;background:#f0f0f0;border-radius:2px;overflow:hidden">
          <div style="height:100%;width:${w}%;background:#222;border-radius:2px"></div>
        </div>
        <div style="font-size:10px;font-family:monospace;color:#333;white-space:nowrap">₪${val.toFixed(2)}</div>
      </div>`;
    };

    const html = `<!DOCTYPE html><html lang="he" dir="rtl">
<head><meta charset="UTF-8">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;direction:rtl;padding:32px;color:#111;background:#fff}
  h1{font-size:20px;font-weight:700;letter-spacing:-0.3px;margin-bottom:3px}
  .sub{font-size:11px;color:#888;margin-bottom:24px;letter-spacing:0.02em}
  .kpi-grid{display:grid;grid-template-columns:1fr;gap:0;border:1px solid #ddd;margin-bottom:22px;max-width:280px}
  .kpi{padding:14px 18px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center}
  .kpi:last-child{border-bottom:none}
  .kpi-label{font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#888;font-weight:600}
  .kpi-val{font-family:monospace;font-size:15px;font-weight:700;color:#111}
  .kpi-val.green{color:#1a7a1a;font-size:18px}
  .section{border:1px solid #e5e5e5;border-radius:2px;overflow:hidden;margin-bottom:18px}
  .section-head{background:#f8f8f8;padding:8px 14px;font-size:9px;font-weight:700;letter-spacing:1.5px;color:#888;text-transform:uppercase;border-bottom:1px solid #e5e5e5}
  .section-body{padding:16px}
  table{width:100%;border-collapse:collapse;font-size:10px}
  th{padding:7px 10px;text-align:right;color:#555;border-bottom:1px solid #eee;font-weight:600;font-size:9px;text-transform:uppercase;letter-spacing:.5px;background:#fafafa}
  td{padding:6px 10px;border-bottom:1px solid #f5f5f5;color:#222}
  tr.total td{font-weight:700;background:#f8f8f8;border-top:2px solid #ddd}
  .net{color:#1a7a1a;font-weight:700}
  .period-grid{display:flex;gap:10px;flex-wrap:wrap}
  .period-card{border:1px solid #eee;padding:10px 14px;flex:1;min-width:110px}
  .period-name{font-size:9px;color:#888;margin-bottom:4px}
  .period-val{font-family:monospace;font-size:13px;font-weight:700;color:#1a7a1a}
  .footer{font-size:9px;color:#bbb;text-align:center;padding-top:10px;border-top:1px solid #eee;margin-top:10px}
  @media print{body{padding:16px}@page{margin:10mm}}
</style></head><body>
  <h1>${performer}</h1>
  <div class="sub">${distributions} · הופק ${dateStr}</div>

  <div class="kpi-grid">
    <div class="kpi"><span class="kpi-label">נטו לאמן</span><span class="kpi-val green">₪${net.toFixed(2)}</span></div>
    <div class="kpi"><span class="kpi-label">סה"כ השמעות</span><span class="kpi-val">${totalStreams.toLocaleString()}</span></div>
    <div class="kpi"><span class="kpi-label">יצירות</span><span class="kpi-val">${songCount}</span></div>
    <div class="kpi"><span class="kpi-label">תקופות חלוקה</span><span class="kpi-val">${periodCount}</span></div>
  </div>

  <div class="section">
    <div class="section-head">TOP שירים</div>
    <div class="section-body">
      ${topSongs.map(([n, v]) => barRow(n, v - v * commissionPct / 100, (topSongs[0]?.[1] || 1) * (1 - commissionPct / 100))).join("")}
    </div>
  </div>

  <div class="section">
    <div class="section-head">פלטפורמות</div>
    <div class="section-body">
      ${platsSorted.map(([n, v]) => barRow(n, v - v * commissionPct / 100, maxPlat * (1 - commissionPct / 100))).join("")}
    </div>
  </div>

  <div class="section">
    <div class="section-head">לפי תקופת חלוקה</div>
    <div class="section-body">
      <div class="period-grid">
        ${distSorted.map(([dist, val]) => {
          const dnet = val - val * commissionPct / 100;
          return `<div class="period-card">
            <div class="period-name">${dist.replace("חלוקת ניו מדיה ", "")}</div>
            <div class="period-val">₪${dnet.toFixed(2)}</div>
          </div>`;
        }).join("")}
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-head">פירוט לפי שיר</div>
    <table>
      <thead><tr>
        <th>שם שיר</th><th style="text-align:center">השמעות</th><th style="text-align:left">נטו לאמן</th>
      </tr></thead>
      <tbody>
        ${songsSorted.map(([song, d], i) => {
          const songNet = d.afterPhil - d.afterPhil * commissionPct / 100;
          return `<tr style="background:${i % 2 ? "#fafafa" : "#fff"}">
            <td>${song}</td>
            <td style="text-align:center;font-family:monospace">${d.streams.toLocaleString()}</td>
            <td style="text-align:left;font-family:monospace" class="net">₪${songNet.toFixed(4)}</td>
          </tr>`;
        }).join("")}
        <tr class="total">
          <td>סה"כ</td>
          <td style="text-align:center;font-family:monospace">${totalStreams.toLocaleString()}</td>
          <td style="text-align:left;font-family:monospace" class="net">₪${net.toFixed(4)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-head">פירוט שורות מלא</div>
    <table>
      <thead><tr>
        <th>שם שיר</th><th>מבצע</th><th>פלטפורמה</th><th>תקופה</th>
        <th style="text-align:center">השמעות</th><th style="text-align:left">נטו לאמן</th>
      </tr></thead>
      <tbody>
        ${filtered.map((r, i) => {
          const rowNet = r.amount - r.amount * commissionPct / 100;
          return `<tr style="background:${i % 2 ? "#fafafa" : "#fff"}">
            <td>${r.song}</td>
            <td style="color:#666;font-size:9px">${r.performer}</td>
            <td style="color:#666">${r.platform.replace("אינטרנט - ", "")}</td>
            <td style="color:#888;font-size:9px">${r.period}</td>
            <td style="text-align:center;font-family:monospace">${r.streams.toLocaleString()}</td>
            <td style="text-align:left;font-family:monospace" class="net">₪${rowNet.toFixed(4)}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>
  </div>

  <div class="footer">הופק ${dateStr}</div>
</body></html>`;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 600);
  }

  const selectStyle = {
    width: "100%", background: "transparent", border: "1px solid rgba(240,237,232,0.2)",
    color: "#f0ede8", fontFamily: F, fontSize: "11px", padding: "10px 12px",
    outline: "none", cursor: "pointer", direction: "rtl",
    appearance: "none", WebkitAppearance: "none",
  };

  const thStyle = {
    fontFamily: F, fontSize: "8px", letterSpacing: "0.25em", textTransform: "uppercase",
    opacity: 0.35, padding: "10px 12px", textAlign: "right", fontWeight: 700,
    borderBottom: "1px solid rgba(240,237,232,0.08)", cursor: "pointer", whiteSpace: "nowrap",
  };

  const tdStyle = {
    fontFamily: F, fontSize: "10px", padding: "10px 12px",
    borderBottom: "1px solid rgba(240,237,232,0.05)", color: "#f0ede8",
    textAlign: "right", verticalAlign: "middle",
  };

  /* ─── upload state ─── */
  if (allData.length === 0) {
    return (
      <div>
        <FieldLabel>העלה קובץ Excel מהפי"ל</FieldLabel>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          style={{
            border: "1px dashed rgba(240,237,232,0.2)", padding: "40px 24px",
            textAlign: "center", cursor: "pointer", transition: "border-color 0.15s",
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(240,237,232,0.5)"; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(240,237,232,0.2)"; }}
        >
          <p style={{ fontFamily: F, fontSize: "22px", opacity: 0.25, marginBottom: "12px" }}>↑</p>
          <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.4, marginBottom: "6px" }}>
            גרור קובץ או לחץ לבחירה
          </p>
          <p style={{ fontFamily: F, fontSize: "9px", opacity: 0.2, letterSpacing: "0.1em" }}>xlsx · xls</p>
        </div>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }}
          onChange={e => handleFile(e.target.files[0])} />
      </div>
    );
  }

  /* ─── dashboard ─── */
  return (
    <div style={{ direction: "rtl" }}>

      {/* file badge + reset */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#f0ede8", opacity: 0.5 }} />
          <span style={{ fontFamily: F, fontSize: "9px", opacity: 0.4, letterSpacing: "0.1em" }}>{fileName}</span>
          <span style={{ fontFamily: F, fontSize: "9px", opacity: 0.2, letterSpacing: "0.08em" }}>· {allData.length.toLocaleString()} שורות</span>
        </div>
        <GhostBtn onClick={() => { setAllData([]); setFileName(null); }}>↺ קובץ חדש</GhostBtn>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "rgba(240,237,232,0.08)", marginBottom: "20px" }}>
        <KpiCard label="סה״כ תמלוגים" value={`₪${totalAfterPhil.toFixed(2)}`} />
        <KpiCard label="השמעות" value={totalStreams.toLocaleString()} />
        <KpiCard label="שירים" value={songCount} />
        <KpiCard label="תקופות" value={periodCount} />
      </div>

      {/* filters */}
      <div style={{ border: "1px solid rgba(240,237,232,0.12)", padding: "16px", marginBottom: "16px" }}>
        <FieldLabel>פילטרים</FieldLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
          <PerformerSelect allPerformers={allPerformers} selected={selectedPerformers} onChange={s => { setSelectedPerformers(s); setPage(1); }} />
          <select value={filterSong} onChange={e => { setFilterSong(e.target.value); setPage(1); }} style={selectStyle}>
            <option value="">כל השירים</option>
            {uniq("song").map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select value={filterPlatform} onChange={e => { setFilterPlatform(e.target.value); setPage(1); }} style={selectStyle}>
            <option value="">כל הפלטפורמות</option>
            {uniq("platform").map(v => <option key={v} value={v}>{v.replace("אינטרנט - ", "")}</option>)}
          </select>
          <select value={filterDist} onChange={e => { setFilterDist(e.target.value); setPage(1); }} style={selectStyle}>
            <option value="">כל החלוקות</option>
            {uniq("distribution").map(v => <option key={v} value={v}>{v.replace("חלוקת ניו מדיה ", "")}</option>)}
          </select>
        </div>
        {(selectedPerformers.size > 0 || filterSong || filterPlatform || filterDist) && (
          <GhostBtn onClick={() => { setSelectedPerformers(new Set()); setFilterSong(""); setFilterPlatform(""); setFilterDist(""); setPage(1); }}>
            ↺ אפס פילטרים
          </GhostBtn>
        )}
      </div>

      {/* commission calculator */}
      <div style={{ border: "1px solid rgba(240,237,232,0.12)", padding: "16px", marginBottom: "16px" }}>
        <FieldLabel>מחשבון עמלה</FieldLabel>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <input
            type="number" value={commissionPct} min={0} max={100} step={0.5}
            onChange={e => setCommissionPct(parseFloat(e.target.value) || 0)}
            style={{ width: "60px", background: "transparent", border: "1px solid rgba(240,237,232,0.2)", color: "#f0ede8", fontFamily: "monospace", fontSize: "13px", padding: "6px 10px", outline: "none", textAlign: "center" }}
          />
          <span style={{ fontFamily: F, fontSize: "10px", opacity: 0.4, letterSpacing: "0.1em" }}>% עמלת הפצה שלי</span>
        </div>
        {[
          ["ברוטו לפני הפי\"ל", `₪${totalBeforePhil.toFixed(2)}`, 0.35],
          ["עמלת הפי\"ל", `−₪${totalPhilFee.toFixed(2)}`, 0.35],
          ["אחרי הפי\"ל", `₪${totalAfterPhil.toFixed(2)}`, 0.55],
          ["עמלת הפצה שלי", `−₪${myFee.toFixed(2)}`, 0.35],
        ].map(([label, val, op]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(240,237,232,0.06)" }}>
            <span style={{ fontFamily: F, fontSize: "10px", opacity: op, letterSpacing: "0.05em" }}>{label}</span>
            <span style={{ fontFamily: "monospace", fontSize: "11px", opacity: op }}>{val}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0" }}>
          <span style={{ fontFamily: F, fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em" }}>נטו סופי לאמן</span>
          <span style={{ fontFamily: "monospace", fontSize: "15px", fontWeight: 700 }}>₪{net.toFixed(2)}</span>
        </div>
      </div>

      {/* charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        <div style={{ border: "1px solid rgba(240,237,232,0.12)", padding: "14px" }}>
          <FieldLabel>TOP שירים</FieldLabel>
          {topSongs.map(([name, val]) => (
            <BarRow key={name} label={name} value={val - val * commissionPct / 100}
              max={(topSongs[0]?.[1] || 1) * (1 - commissionPct / 100)} />
          ))}
        </div>
        <div style={{ border: "1px solid rgba(240,237,232,0.12)", padding: "14px" }}>
          <FieldLabel>פלטפורמות</FieldLabel>
          {topPlats.map(([name, val]) => (
            <BarRow key={name} label={name} value={val - val * commissionPct / 100}
              max={maxPlat * (1 - commissionPct / 100)} accent />
          ))}
        </div>
      </div>

      {/* export */}
      <div style={{ marginBottom: "16px" }}>
        <ActionBtn onClick={exportPDF}>📄 ייצוא דשבורד + פירוט לאמן</ActionBtn>
      </div>

      {/* table */}
      <div style={{ border: "1px solid rgba(240,237,232,0.12)", marginBottom: "16px", overflowX: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderBottom: "1px solid rgba(240,237,232,0.08)" }}>
          <FieldLabel>פירוט שורות</FieldLabel>
          <span style={{ fontFamily: F, fontSize: "9px", opacity: 0.25 }}>{filtered.length.toLocaleString()} שורות</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px" }}>
          <thead>
            <tr>
              {[["שיר", "song"], ["מבצע", "performer"], ["פלטפורמה", "platform"], ["תקופה", "period"], ["השמעות", "streams"], ["סכום ₪", "amount"]].map(([label, col]) => (
                <th key={col} onClick={() => handleSort(col)} style={thStyle}>
                  {label}{sortCol === col ? (sortDir === 1 ? " ↑" : " ↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(240,237,232,0.015)" }}>
                <td style={tdStyle}><strong style={{ fontWeight: 600 }}>{r.song}</strong></td>
                <td style={{ ...tdStyle, opacity: 0.45, fontSize: "9px" }}>{r.performer.substring(0, 25)}{r.performer.length > 25 ? "…" : ""}</td>
                <td style={{ ...tdStyle, opacity: 0.5, fontSize: "9px" }}>{r.platform.replace("אינטרנט - ", "").replace("אינטרנט – ", "")}</td>
                <td style={{ ...tdStyle, opacity: 0.4, fontSize: "9px" }}>{r.period}</td>
                <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "10px", opacity: 0.6 }}>{r.streams.toLocaleString()}</td>
                <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "10px" }}>₪{r.amount.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "16px", flexWrap: "wrap" }}>
          {page > 1 && <GhostBtn onClick={() => setPage(p => p - 1)}>→</GhostBtn>}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
              acc.push(p); return acc;
            }, [])
            .map((p, i) => p === "..." ? (
              <span key={i} style={{ fontFamily: F, fontSize: "9px", opacity: 0.25, padding: "7px 4px" }}>…</span>
            ) : (
              <GhostBtn key={p} active={p === page} onClick={() => setPage(p)}>{p}</GhostBtn>
            ))}
          {page < totalPages && <GhostBtn onClick={() => setPage(p => p + 1)}>←</GhostBtn>}
        </div>
      )}
    </div>
  );
}
