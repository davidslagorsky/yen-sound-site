import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";
import roster from "./rosterData";

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/* ══════════════════════════════════════════════
   SHARED UI PRIMITIVES
══════════════════════════════════════════════ */
function FieldLabel({ children }) {
  return <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.35, marginBottom: "6px" }}>{children}</p>;
}

function Input({ value, onChange, placeholder, name, type = "text" }) {
  return (
    <input
      name={name} type={type} value={value}
      onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", boxSizing: "border-box", background: "transparent", border: "1px solid rgba(240,237,232,0.2)", color: "#f0ede8", fontFamily: F, fontSize: "11px", letterSpacing: "0.05em", padding: "10px 12px", outline: "none", transition: "border-color 0.15s" }}
      onFocus={e => e.target.style.borderColor = "rgba(240,237,232,0.6)"}
      onBlur={e => e.target.style.borderColor = "rgba(240,237,232,0.2)"}
    />
  );
}

function NamedInput({ name, value, onChange, placeholder, type = "text" }) {
  return (
    <input
      name={name} type={type} value={value}
      onChange={onChange} placeholder={placeholder}
      style={{ width: "100%", boxSizing: "border-box", background: "transparent", border: "1px solid rgba(240,237,232,0.2)", color: "#f0ede8", fontFamily: F, fontSize: "11px", letterSpacing: "0.05em", padding: "10px 12px", outline: "none", transition: "border-color 0.15s" }}
      onFocus={e => e.target.style.borderColor = "rgba(240,237,232,0.6)"}
      onBlur={e => e.target.style.borderColor = "rgba(240,237,232,0.2)"}
    />
  );
}

function ActionBtn({ onClick, children, danger = false, disabled = false, small = false }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "block", width: "100%", padding: small ? "10px 16px" : "16px 24px",
      border: danger ? "2px solid rgba(220,80,80,0.6)" : "2px solid rgba(240,237,232,0.8)",
      background: "transparent", color: danger ? "rgba(220,80,80,0.9)" : "#f0ede8",
      fontFamily: F, fontSize: "11px", fontWeight: 700, letterSpacing: "0.3em",
      textTransform: "uppercase", cursor: disabled ? "default" : "pointer",
      transition: "background 0.15s", opacity: disabled ? 0.4 : 1, boxSizing: "border-box",
    }}
      onMouseOver={e => { if (!disabled) e.currentTarget.style.background = danger ? "rgba(220,80,80,0.08)" : "#111"; }}
      onMouseOut={e => e.currentTarget.style.background = "transparent"}
    >{children}</button>
  );
}

function GhostBtn({ onClick, href, children, danger = false }) {
  const s = {
    fontFamily: F, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase",
    padding: "7px 12px", background: "transparent", cursor: "pointer", textDecoration: "none",
    border: danger ? "1px solid rgba(220,80,80,0.5)" : "1px solid rgba(240,237,232,0.25)",
    color: danger ? "rgba(220,80,80,0.9)" : "#f0ede8",
    transition: "border-color 0.15s",
  };
  if (href) return <a href={href} target="_blank" rel="noreferrer" style={s}>{children}</a>;
  return <button onClick={onClick} style={s}>{children}</button>;
}

function DashTile({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: "10px", padding: "28px 16px",
      border: active ? "1px solid rgba(240,237,232,0.6)" : "1px solid rgba(240,237,232,0.15)",
      background: active ? "#0d0d0d" : "transparent", color: "#f0ede8",
      cursor: "pointer", transition: "border-color 0.2s, background 0.2s", width: "100%",
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = "rgba(240,237,232,0.4)"; e.currentTarget.style.background = "#0a0a0a"; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = "rgba(240,237,232,0.15)"; e.currentTarget.style.background = "transparent"; } }}
    >
      <span style={{ fontSize: "22px", lineHeight: 1, opacity: 0.7 }}>{icon}</span>
      <span style={{ fontFamily: F, fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", opacity: active ? 1 : 0.7 }}>{label}</span>
    </button>
  );
}

function StatusMsg({ status, noun }) {
  if (!status) return null;
  const ok = status === "success";
  return (
    <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.15em", marginTop: "10px", color: ok ? "rgba(100,255,180,0.85)" : "rgba(255,100,100,0.85)" }}>
      {ok ? `✓ ${noun}` : status.replace("error:", "")}
    </p>
  );
}

function DataRow({ label, sub, children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", border: "1px solid #111", gap: "12px" }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontFamily: F, fontSize: "11px", letterSpacing: "0.05em", color: "#f0ede8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</p>
        {sub && <p style={{ fontFamily: F, fontSize: "9px", opacity: 0.35, marginTop: "2px", letterSpacing: "0.08em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</p>}
      </div>
      {children && <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>{children}</div>}
    </div>
  );
}

function Panel({ children }) {
  return <div style={{ border: "1px solid rgba(240,237,232,0.15)", padding: "24px", marginBottom: "12px" }}>{children}</div>;
}

function SectionLabel({ children }) {
  return <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.35em", textTransform: "uppercase", opacity: 0.2, textAlign: "center", marginBottom: "16px" }}>{children}</p>;
}

/* ══════════════════════════════════════════════
   RICH TEXT EDITOR (for press posts)
══════════════════════════════════════════════ */
function RichEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState(false);
  const savedRange = useRef(null);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== value) el.innerHTML = value || "";
  }, []); // eslint-disable-line

  const emit = useCallback(() => { if (editorRef.current) onChange(editorRef.current.innerHTML); }, [onChange]);
  const saveRange = () => { const s = window.getSelection(); if (s?.rangeCount) savedRange.current = s.getRangeAt(0).cloneRange(); };
  const restoreRange = () => { const s = window.getSelection(); if (savedRange.current && s) { s.removeAllRanges(); s.addRange(savedRange.current); } };
  const exec = (cmd, val = null) => { editorRef.current?.focus(); document.execCommand(cmd, false, val); emit(); };

  const insertLink = () => {
    restoreRange();
    const url = linkUrl.trim(); if (!url) return;
    document.execCommand("insertHTML", false, `<a href="${url}" target="_blank" rel="noreferrer">${linkText.trim() || url}</a>`);
    emit(); setShowLinkDialog(false); setLinkUrl(""); setLinkText("");
  };
  const insertImage = () => {
    restoreRange();
    const url = imageUrl.trim(); if (!url) return;
    document.execCommand("insertHTML", false, `<img src="${url}" alt="" style="width:100%;display:block;margin:24px 0;" />`);
    emit(); setShowImageDialog(false); setImageUrl("");
  };

  const toolBtn = (label, action, title) => (
    <button type="button" title={title || label}
      onMouseDown={e => { e.preventDefault(); saveRange(); action(); }}
      style={{ background: "transparent", border: "none", color: "#f0ede8", fontFamily: F, fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", padding: "4px 8px", opacity: 0.6 }}>
      {label}
    </button>
  );

  const dInput = { background: "transparent", border: "none", borderBottom: "1px solid #2a2a2a", color: "#f0ede8", fontFamily: F, fontSize: "12px", letterSpacing: "0.05em", padding: "6px 2px", outline: "none", width: "100%" };
  const dBtn = { background: "transparent", border: "1px solid #333", color: "#f0ede8", fontFamily: F, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", padding: "6px 14px", cursor: "pointer" };

  return (
    <div style={{ border: "1px solid #222", background: "#050505" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2px", padding: "8px 10px", borderBottom: "1px solid #1a1a1a", alignItems: "center" }}>
        {toolBtn("B", () => exec("bold"), "Bold")}
        {toolBtn("I", () => exec("italic"), "Italic")}
        {toolBtn("H2", () => exec("formatBlock", "h2"), "Heading 2")}
        {toolBtn("H3", () => exec("formatBlock", "h3"), "Heading 3")}
        {toolBtn("P", () => exec("formatBlock", "p"), "Paragraph")}
        {toolBtn("—", () => exec("insertHorizontalRule"), "Divider")}
        <div style={{ width: "1px", height: "16px", background: "#222", margin: "0 4px" }} />
        <button type="button" onMouseDown={e => { e.preventDefault(); saveRange(); setShowLinkDialog(true); setShowImageDialog(false); }}
          style={{ background: "transparent", border: "none", color: "#f0ede8", fontFamily: F, fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", padding: "4px 8px", opacity: 0.6 }}>Link</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); saveRange(); setShowImageDialog(true); setShowLinkDialog(false); }}
          style={{ background: "transparent", border: "none", color: "#f0ede8", fontFamily: F, fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", padding: "4px 8px", opacity: 0.6 }}>Img</button>
        <div style={{ marginLeft: "auto" }}>
          <button type="button" onClick={() => setPreview(p => !p)}
            style={{ background: "transparent", border: "none", color: "#f0ede8", fontFamily: F, fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", padding: "4px 8px", opacity: preview ? 1 : 0.45 }}>
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
      </div>
      {showLinkDialog && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1a1a", background: "#0a0a0a", display: "flex", flexDirection: "column", gap: "8px" }}>
          <input autoFocus placeholder="URL (https://...)" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && insertLink()} style={dInput} />
          <input placeholder="Display text (optional)" value={linkText} onChange={e => setLinkText(e.target.value)} onKeyDown={e => e.key === "Enter" && insertLink()} style={dInput} />
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" onClick={insertLink} style={dBtn}>Insert</button>
            <button type="button" onClick={() => setShowLinkDialog(false)} style={{ ...dBtn, opacity: 0.4 }}>Cancel</button>
          </div>
        </div>
      )}
      {showImageDialog && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1a1a", background: "#0a0a0a", display: "flex", flexDirection: "column", gap: "8px" }}>
          <input autoFocus placeholder="Image URL (https://...)" value={imageUrl} onChange={e => setImageUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && insertImage()} style={dInput} />
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" onClick={insertImage} style={dBtn}>Insert</button>
            <button type="button" onClick={() => setShowImageDialog(false)} style={{ ...dBtn, opacity: 0.4 }}>Cancel</button>
          </div>
        </div>
      )}
      {preview ? (
        <div className="press-body" style={{ padding: "20px 24px", minHeight: "280px", fontSize: "14px", lineHeight: 1.8, color: "rgba(240,237,232,0.7)" }} dangerouslySetInnerHTML={{ __html: value }} />
      ) : (
        <div ref={editorRef} contentEditable suppressContentEditableWarning data-yen-editor onInput={emit} onBlur={emit}
          style={{ padding: "20px 24px", minHeight: "280px", outline: "none", fontFamily: F, fontSize: "14px", lineHeight: 1.8, color: "rgba(240,237,232,0.75)", caretColor: "#f0ede8" }} />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SLUG MANAGER PANEL
══════════════════════════════════════════════ */
function SlugManager({ artists }) {
  const [slugs, setSlugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableError, setTableError] = useState(null);
  const [newSlug, setNewSlug] = useState("");
  const [newDest, setNewDest] = useState("");
  const [addStatus, setAddStatus] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("slugs").select("*").order("created_at", { ascending: false });
      if (error) {
        setTableError(error.message);
      } else {
        setSlugs(data || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function addSlug() {
    const slug = newSlug.trim().toLowerCase().replace(/\s+/g, "-");
    const dest = newDest.trim();
    if (!slug || !dest) { setAddStatus("error:Slug and destination are both required."); return; }
    setAddStatus("saving");
    const { data, error } = await supabase.from("slugs").insert([{ slug, destination: dest }]).select().single();
    if (error) {
      setAddStatus("error:" + error.message);
    } else {
      setSlugs(p => [data, ...p]);
      setNewSlug(""); setNewDest("");
      setAddStatus("success");
    }
    setTimeout(() => setAddStatus(null), 3000);
  }

  async function deleteSlug(id, slug) {
    if (!window.confirm(`Delete slug "/${slug}"?`)) return;
    const { error } = await supabase.from("slugs").delete().eq("id", id);
    if (!error) setSlugs(p => p.filter(s => s.id !== id));
    else alert("Delete error: " + error.message);
  }

  function copyLink(path) {
    navigator.clipboard.writeText(`https://yensound.com/${path}`);
    setCopiedId(path); setTimeout(() => setCopiedId(null), 1500);
  }

  const artistSlugs = artists.filter(a => a.slug);

  /* Table doesn't exist yet — show SQL setup instructions */
  if (tableError) return (
    <div>
      <p style={{ fontFamily: F, fontSize: "10px", color: "rgba(255,100,100,0.85)", marginBottom: "16px", lineHeight: 1.7 }}>
        ⚠ Supabase error: {tableError}
      </p>
      <FieldLabel>Run this SQL in your Supabase dashboard → SQL Editor</FieldLabel>
      <pre style={{ background: "#080808", border: "1px solid #1a1a1a", padding: "16px", fontFamily: "monospace", fontSize: "11px", color: "rgba(100,255,180,0.85)", overflowX: "auto", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
{`CREATE TABLE slugs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  destination text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE slugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON slugs
  FOR SELECT USING (true);

CREATE POLICY "Anon insert" ON slugs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon delete" ON slugs
  FOR DELETE USING (true);`}
      </pre>
      <p style={{ fontFamily: F, fontSize: "9px", opacity: 0.4, marginTop: "12px", letterSpacing: "0.1em" }}>
        After running, reload this page.
      </p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>

      {/* Artist page slugs (read-only) */}
      <div style={{ marginBottom: "28px" }}>
        <FieldLabel>Artist Page Slugs — /artist/:slug</FieldLabel>
        {artistSlugs.length === 0 && (
          <p style={{ fontFamily: F, fontSize: "10px", opacity: 0.25, padding: "10px 0" }}>No artist slugs set yet.</p>
        )}
        {artistSlugs.map(a => (
          <DataRow key={a.id} label={`/artist/${a.slug}`} sub={a.display_name}>
            <GhostBtn onClick={() => copyLink(`artist/${a.slug}`)}>
              {copiedId === `artist/${a.slug}` ? "Copied" : "Copy"}
            </GhostBtn>
            <GhostBtn href={`/artist/${a.slug}`}>View</GhostBtn>
          </DataRow>
        ))}
      </div>

      {/* Custom redirect slugs */}
      <div>
        <FieldLabel>Custom Redirects — /:slug → any URL</FieldLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
          <Input value={newSlug} onChange={setNewSlug} placeholder="short path (e.g. presskit)" />
          <Input value={newDest} onChange={setNewDest} placeholder="destination (https://...)" />
          <ActionBtn onClick={addSlug} disabled={addStatus === "saving"}>
            {addStatus === "saving" ? "Saving..." : "Add Redirect"}
          </ActionBtn>
          <StatusMsg status={addStatus} noun="Redirect saved — visit /shortpath to test" />
        </div>

        {loading && <p style={{ fontFamily: F, fontSize: "10px", opacity: 0.25 }}>Loading...</p>}
        {!loading && slugs.length === 0 && (
          <p style={{ fontFamily: F, fontSize: "10px", opacity: 0.25, padding: "10px 0" }}>No custom redirects yet.</p>
        )}
        {slugs.map(s => (
          <DataRow key={s.id} label={`/${s.slug}`} sub={s.destination}>
            <GhostBtn onClick={() => copyLink(s.slug)}>
              {copiedId === s.slug ? "Copied" : "Copy"}
            </GhostBtn>
            <GhostBtn danger onClick={() => deleteSlug(s.id, s.slug)}>Delete</GhostBtn>
          </DataRow>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PHOTOS PANEL
   Manages profile_image overrides per artist.
   Falls back to rosterData.image on the site if not set.
   Requires: ALTER TABLE artists ADD COLUMN IF NOT EXISTS profile_image text;
══════════════════════════════════════════════ */

function PhotosPanel({ artists, onUpdate }) {
  const [edits, setEdits] = useState({});         // { artistId: urlString }
  const [statuses, setStatuses] = useState({});   // { artistId: 'saving'|'saved'|'error' }

  async function save(artistId) {
    const url = (edits[artistId] ?? "").trim();
    setStatuses(p => ({ ...p, [artistId]: "saving" }));
    const { error } = await supabase
      .from("artists")
      .update({ profile_image: url || null })
      .eq("id", artistId);
    if (error) {
      setStatuses(p => ({ ...p, [artistId]: "error" }));
      alert("Save error: " + error.message);
    } else {
      setStatuses(p => ({ ...p, [artistId]: "saved" }));
      onUpdate({ id: artistId, profile_image: url || null });
      setTimeout(() => setStatuses(p => ({ ...p, [artistId]: "idle" })), 2500);
    }
  }

  // Build merged list: every roster artist, with Supabase override if exists
  const rows = roster.map(r => {
    const dbArtist = artists.find(a => a.slug === r.slug || a.display_name?.toLowerCase() === r.displayName?.toLowerCase());
    return {
      rosterEntry: r,
      dbArtist,
      currentImage: dbArtist?.profile_image || r.image,
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <FieldLabel>Artist Profile Images — paste any image URL to override</FieldLabel>
      {rows.map(({ rosterEntry: r, dbArtist, currentImage }) => {
        const id = dbArtist?.id;
        const editVal = edits[id] ?? dbArtist?.profile_image ?? "";
        const status = statuses[id] || "idle";
        const previewUrl = editVal.trim() || currentImage;

        return (
          <div key={r.slug || r.name} style={{ display: "flex", gap: "14px", alignItems: "flex-start", padding: "16px", border: "1px solid rgba(240,237,232,0.1)", background: "#050505" }}>
            {/* thumbnail */}
            <div style={{ width: "56px", height: "56px", flexShrink: 0, overflow: "hidden", background: "#111", border: "1px solid #1a1a1a" }}>
              {previewUrl
                ? <img src={previewUrl} alt={r.displayName} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.2, fontFamily: F, fontSize: "9px" }}>?</div>
              }
            </div>

            {/* name + input */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: F, fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
                {r.displayName}
                {dbArtist?.profile_image && <span style={{ fontFamily: F, fontSize: "8px", letterSpacing: "0.15em", opacity: 0.4, marginLeft: "8px", fontWeight: 400 }}>custom</span>}
                {!dbArtist?.profile_image && <span style={{ fontFamily: F, fontSize: "8px", letterSpacing: "0.15em", opacity: 0.25, marginLeft: "8px", fontWeight: 400 }}>from rosterData</span>}
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  value={editVal}
                  onChange={e => setEdits(p => ({ ...p, [id]: e.target.value }))}
                  placeholder={id ? "https://..." : "Artist not in Supabase yet"}
                  disabled={!id}
                  style={{ flex: 1, background: "transparent", border: "1px solid rgba(240,237,232,0.2)", color: "#f0ede8", fontFamily: F, fontSize: "11px", padding: "8px 10px", outline: "none", opacity: id ? 1 : 0.3 }}
                  onFocus={e => e.target.style.borderColor = "rgba(240,237,232,0.6)"}
                  onBlur={e => e.target.style.borderColor = "rgba(240,237,232,0.2)"}
                />
                {id && (
                  <button
                    onClick={() => save(id)}
                    disabled={status === "saving"}
                    style={{ flexShrink: 0, padding: "8px 14px", background: "transparent", border: "1px solid rgba(240,237,232,0.5)", color: "#f0ede8", fontFamily: F, fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", opacity: status === "saving" ? 0.4 : 1 }}
                  >
                    {status === "saving" ? "..." : status === "saved" ? "✓" : "Save"}
                  </button>
                )}
              </div>
              {!id && <p style={{ fontFamily: F, fontSize: "8px", opacity: 0.3, marginTop: "4px", letterSpacing: "0.1em" }}>Add this artist to Supabase to enable image override</p>}
              {dbArtist?.profile_image && (
                <button
                  onClick={() => { setEdits(p => ({ ...p, [id]: "" })); save(id); }}
                  style={{ marginTop: "4px", background: "none", border: "none", color: "rgba(220,80,80,0.6)", fontFamily: F, fontSize: "8px", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", padding: 0 }}
                >
                  ↺ revert to rosterData
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  /* data */
  const [releases, setReleases] = useState([]);
  const [artists, setArtists] = useState([]);
  const [posts, setPosts] = useState([]);

  /* active panel */
  const [activePanel, setActivePanel] = useState(null);

  /* release form */
  const [releaseForm, setReleaseForm] = useState({
    title: "", artist: "", type: "Single", date: "", release_at: "",
    slug: "", cover: "", smart_link: "", spotify_url: "", apple_url: "",
    youtube_url: "", embed_youtube_id: "", embed_spotify: "",
    background_url: "", socials_instagram: "", socials_tiktok: "", socials_youtube: "", socials_website: "",
  });
  const [releaseStatus, setReleaseStatus] = useState(null);
  const [releaseSubmitting, setReleaseSubmitting] = useState(false);

  /* artist form */
  const [artistForm, setArtistForm] = useState({ id: "", password: "", display_name: "", filter_name: "", upload_url: "", slug: "" });
  const [artistStatus, setArtistStatus] = useState(null);
  const [artistSubmitting, setArtistSubmitting] = useState(false);

  /* press form */
  const [postForm, setPostForm] = useState({ id: "", title: "", artist: "", cover_url: "", date: "", excerpt: "", body: "", slug: "" });
  const [postStatus, setPostStatus] = useState(null);
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState(false);

  /* auth */
  useEffect(() => { if (localStorage.getItem("yenAdminAuthed") === "true") setAuth(true); }, []);

  useEffect(() => {
    if (!auth) return;
    (async () => {
      const [rel, art, pst] = await Promise.all([
        supabase.from("releases").select("id,title,artist,date").order("date", { ascending: false }),
        supabase.from("artists").select("*").order("created_at", { ascending: true }),
        supabase.from("press_posts").select("*").order("date", { ascending: false }),
      ]);
      if (rel.data) setReleases(rel.data);
      if (art.data) setArtists(art.data);
      if (pst.data) setPosts(pst.data);
    })();
  }, [auth]);

  const handleLogin = () => {
    if (password === "sighmadethissite") { setAuth(true); localStorage.setItem("yenAdminAuthed", "true"); }
    else setAuthError("Incorrect password");
  };

  const slugify = str => str.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 60);

  /* ── Release handlers ── */
  const handleReleaseChange = e => setReleaseForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleAddRelease = async () => {
    if (!releaseForm.title || !releaseForm.artist || !releaseForm.slug || !releaseForm.date) {
      setReleaseStatus("error:Title, Artist, Slug and Date are required."); return;
    }
    setReleaseSubmitting(true); setReleaseStatus(null);
    const { error } = await supabase.from("releases").insert([{
      title: releaseForm.title, artist: releaseForm.artist, type: releaseForm.type,
      date: releaseForm.date, release_at: releaseForm.release_at || null,
      slug: releaseForm.slug, cover: releaseForm.cover || null,
      smart_link: releaseForm.smart_link || null, spotify_url: releaseForm.spotify_url || null,
      apple_url: releaseForm.apple_url || null, youtube_url: releaseForm.youtube_url || null,
      embed_youtube_id: releaseForm.embed_youtube_id || null, embed_spotify: releaseForm.embed_spotify || null,
      background_url: releaseForm.background_url || null,
      socials: {
        instagram: releaseForm.socials_instagram || "PLACEHOLDER",
        tiktok: releaseForm.socials_tiktok || "PLACEHOLDER",
        youtube: releaseForm.socials_youtube || "PLACEHOLDER",
        website: releaseForm.socials_website || "PLACEHOLDER",
      },
    }]);
    if (error) setReleaseStatus("error:" + error.message);
    else {
      setReleaseStatus("success");
      setReleases(p => [{ id: Date.now(), title: releaseForm.title, artist: releaseForm.artist, date: releaseForm.date }, ...p]);
      setReleaseForm({ title: "", artist: "", type: "Single", date: "", release_at: "", slug: "", cover: "", smart_link: "", spotify_url: "", apple_url: "", youtube_url: "", embed_youtube_id: "", embed_spotify: "", background_url: "", socials_instagram: "", socials_tiktok: "", socials_youtube: "", socials_website: "" });
    }
    setReleaseSubmitting(false);
  };
  const handleDeleteRelease = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    const { error } = await supabase.from("releases").delete().eq("id", id);
    if (!error) setReleases(p => p.filter(r => r.id !== id));
    else alert(error.message);
  };

  /* ── Artist handlers ── */
  const handleArtistChange = e => setArtistForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleAddArtist = async () => {
    if (!artistForm.id || !artistForm.password || !artistForm.display_name) {
      setArtistStatus("error:ID, Password and Display Name are required."); return;
    }
    setArtistSubmitting(true); setArtistStatus(null);
    const { error } = await supabase.from("artists").insert([{
      id: artistForm.id.trim(), password: artistForm.password.trim(),
      display_name: artistForm.display_name.trim(),
      filter_name: artistForm.filter_name.trim() || artistForm.display_name.trim(),
      upload_url: artistForm.upload_url.trim() || null,
      slug: artistForm.slug.trim() || null,
    }]);
    if (error) setArtistStatus("error:" + error.message);
    else { setArtistStatus("success"); setArtists(p => [...p, { ...artistForm }]); setArtistForm({ id: "", password: "", display_name: "", filter_name: "", upload_url: "", slug: "" }); }
    setArtistSubmitting(false);
  };
  const handleDeleteArtist = async (id) => {
    if (!window.confirm(`Delete artist "${id}"?`)) return;
    const { error } = await supabase.from("artists").delete().eq("id", id);
    if (!error) setArtists(p => p.filter(a => a.id !== id));
    else alert(error.message);
  };

  /* ── Press handlers ── */
  const handlePostChange = e => setPostForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleSavePost = async () => {
    const editorEl = document.querySelector("[data-yen-editor]");
    const finalBody = (editorEl ? editorEl.innerHTML : postForm.body).trim();
    if (!postForm.title || !finalBody) { setPostStatus("error:Title and body are required."); return; }
    setPostSubmitting(true); setPostStatus(null);
    const payload = {
      title: postForm.title.trim(), artist: postForm.artist.trim() || null,
      cover_url: postForm.cover_url.trim() || null,
      date: postForm.date || new Date().toISOString().slice(0, 10),
      excerpt: postForm.excerpt.trim() || null,
      body: finalBody,
      slug: postForm.slug.trim() || slugify(postForm.title),
    };
    let err;
    if (editingPost && postForm.id) {
      ({ error: err } = await supabase.from("press_posts").update(payload).eq("id", postForm.id));
      if (!err) setPosts(p => p.map(x => x.id === postForm.id ? { ...x, ...payload } : x));
    } else {
      ({ error: err } = await supabase.from("press_posts").insert([payload]));
      if (!err) setPosts(p => [{ ...payload, id: Date.now() }, ...p]);
    }
    if (err) setPostStatus("error:" + err.message);
    else { setPostStatus("success"); setPostForm({ id: "", title: "", artist: "", cover_url: "", date: "", excerpt: "", body: "", slug: "" }); setEditingPost(false); }
    setPostSubmitting(false);
  };
  const handleEditPost = post => {
    setEditingPost(true);
    setPostForm({ id: post.id, title: post.title || "", artist: post.artist || "", cover_url: post.cover_url || "", date: post.date || "", excerpt: post.excerpt || "", body: post.body || "", slug: post.slug || "" });
    setPostStatus(null);
    setActivePanel("press");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleDeletePost = async (id, title) => {
    if (!window.confirm(`Delete post "${title}"?`)) return;
    const { error } = await supabase.from("press_posts").delete().eq("id", id);
    if (!error) setPosts(p => p.filter(x => x.id !== id));
    else alert(error.message);
  };

  /* ── Login screen ── */
  if (!auth) return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", color: "#f0ede8", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ paddingTop: "36px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <img src="/spinning yen logo white.gif" alt="YEN SOUND" style={{ width: "52px", height: "52px", opacity: 0.55 }} />
        </div>
        <div style={{ overflow: "hidden", borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a", padding: "7px 0" }}>
          <div style={{ display: "inline-flex", animation: "marquee 18s linear infinite", whiteSpace: "nowrap" }}>
            {Array(6).fill("YEN SOUND ®   ").map((t, i) => (
              <span key={i} style={{ fontFamily: F, fontSize: "9px", fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", opacity: 0.25, paddingRight: "40px" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ padding: "60px 24px", maxWidth: "320px", margin: "0 auto" }}>
        <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.35em", textTransform: "uppercase", opacity: 0.25, marginBottom: "24px", textAlign: "center" }}>Admin</p>
        <Input value={password} onChange={setPassword} placeholder="Password" type="password" />
        {authError && <p style={{ fontFamily: F, fontSize: "10px", color: "rgba(255,100,100,0.8)", marginTop: "8px" }}>{authError}</p>}
        <div style={{ marginTop: "16px" }}>
          <ActionBtn onClick={handleLogin}>Enter</ActionBtn>
        </div>
      </div>
    </div>
  );

  const tiles = [
    { id: "releases", icon: "♫", label: "Releases" },
    { id: "artists",  icon: "◈", label: "Artists"  },
    { id: "press",    icon: "✎", label: "Press"    },
    { id: "slugs",    icon: "⌘", label: "Slugs"    },
    { id: "photos",   icon: "◻", label: "Photos"   },
  ];

  const toggle = id => setActivePanel(p => p === id ? null : id);

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", color: "#f0ede8", maxWidth: "600px", margin: "0 auto" }}>

      {/* logo + marquee */}
      <div style={{ paddingTop: "36px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <img src="/spinning yen logo white.gif" alt="YEN SOUND" className="yen-spin" style={{ width: "52px", height: "52px", opacity: 0.55 }} />
        </div>
        <div style={{ overflow: "hidden", borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a", padding: "7px 0" }}>
          <div style={{ display: "inline-flex", animation: "marquee 18s linear infinite", whiteSpace: "nowrap" }}>
            {Array(6).fill("YEN SOUND ®   ").map((t, i) => (
              <span key={i} style={{ fontFamily: F, fontSize: "9px", fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", opacity: 0.25, paddingRight: "40px" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* title */}
      <div style={{ padding: "40px 24px 32px", textAlign: "center" }}>
        <h1 style={{ fontFamily: F, fontSize: "17px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#f0ede8", marginBottom: "6px" }}>Admin</h1>
        <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.25 }}>Yen Sound Dashboard</p>
      </div>

      {/* tile grid */}
      <div style={{ padding: "0 24px" }}>
        <SectionLabel>Manage</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "24px" }}>
          {tiles.map(t => <DashTile key={t.id} icon={t.icon} label={t.label} active={activePanel === t.id} onClick={() => toggle(t.id)} />)}
        </div>
      </div>

      {/* panels */}
      <div style={{ padding: "0 24px 80px" }}>

        {/* ── Releases ── */}
        {activePanel === "releases" && (
          <>
            <Panel>
              <FieldLabel>Add Release</FieldLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { name: "title",           placeholder: "Title *"                       },
                  { name: "artist",          placeholder: "Artist *"                      },
                  { name: "slug",            placeholder: "Slug * (e.g. bahaimhaele)"     },
                  { name: "date",            placeholder: "Date * (YYYY-MM-DD)"           },
                  { name: "release_at",      placeholder: "Release At (countdown)"        },
                  { name: "cover",           placeholder: "Cover image URL"               },
                  { name: "smart_link",      placeholder: "Smart Link URL"                },
                  { name: "spotify_url",     placeholder: "Spotify URL"                   },
                  { name: "apple_url",       placeholder: "Apple Music URL"               },
                  { name: "youtube_url",     placeholder: "YouTube URL"                   },
                  { name: "embed_youtube_id",placeholder: "YouTube Embed ID"              },
                  { name: "embed_spotify",   placeholder: "Spotify Embed URL"             },
                  { name: "background_url",  placeholder: "Background image URL"          },
                  { name: "socials_instagram",placeholder: "Instagram URL"               },
                  { name: "socials_tiktok",  placeholder: "TikTok URL"                    },
                  { name: "socials_youtube", placeholder: "YouTube channel URL"           },
                  { name: "socials_website", placeholder: "Website URL"                   },
                ].map(f => <NamedInput key={f.name} name={f.name} value={releaseForm[f.name]} onChange={handleReleaseChange} placeholder={f.placeholder} />)}
                <select name="type" value={releaseForm.type} onChange={handleReleaseChange}
                  style={{ background: "#000", border: "1px solid rgba(240,237,232,0.2)", color: "#f0ede8", fontFamily: F, fontSize: "11px", padding: "10px 12px", cursor: "pointer", outline: "none", width: "100%" }}>
                  <option value="Single">Single</option>
                  <option value="Album">Album</option>
                  <option value="EP">EP</option>
                </select>
                <ActionBtn onClick={handleAddRelease} disabled={releaseSubmitting}>
                  {releaseSubmitting ? "Adding..." : "Add Release"}
                </ActionBtn>
                <StatusMsg status={releaseStatus} noun="Release added" />
              </div>
            </Panel>

            <Panel>
              <FieldLabel>All Releases · {releases.length}</FieldLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {releases.map(r => (
                  <DataRow key={r.id} label={r.title} sub={`${r.artist} · ${r.date}`}>
                    <GhostBtn href={`/release/${r.slug || r.id}`}>View</GhostBtn>
                    <GhostBtn danger onClick={() => handleDeleteRelease(r.id, r.title)}>Delete</GhostBtn>
                  </DataRow>
                ))}
              </div>
            </Panel>
          </>
        )}

        {/* ── Artists ── */}
        {activePanel === "artists" && (
          <>
            <Panel>
              <FieldLabel>Add Artist Login</FieldLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { name: "id",           placeholder: "Artist ID * (e.g. sigh)"               },
                  { name: "password",     placeholder: "Password *"                             },
                  { name: "display_name", placeholder: "Display Name *"                         },
                  { name: "filter_name",  placeholder: "Filter Name (exact name in releases)"   },
                  { name: "slug",         placeholder: "Slug (e.g. sighdafekt — for /artist/…)" },
                  { name: "upload_url",   placeholder: "Google Drive Vault URL"                 },
                ].map(f => <NamedInput key={f.name} name={f.name} value={artistForm[f.name]} onChange={handleArtistChange} placeholder={f.placeholder} />)}
                <ActionBtn onClick={handleAddArtist} disabled={artistSubmitting}>
                  {artistSubmitting ? "Adding..." : "Add Artist"}
                </ActionBtn>
                <StatusMsg status={artistStatus} noun="Artist added" />
              </div>
            </Panel>

            <Panel>
              <FieldLabel>All Artists · {artists.length}</FieldLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {artists.map(a => (
                  <DataRow key={a.id} label={a.display_name} sub={`ID: ${a.id}${a.slug ? ` · /artist/${a.slug}` : " · no slug"}`}>
                    {a.slug && <GhostBtn href={`/artist/${a.slug}`}>View</GhostBtn>}
                    <GhostBtn danger onClick={() => handleDeleteArtist(a.id)}>Delete</GhostBtn>
                  </DataRow>
                ))}
              </div>
            </Panel>
          </>
        )}

        {/* ── Press ── */}
        {activePanel === "press" && (
          <>
            <Panel>
              <FieldLabel>{editingPost ? "Edit Post" : "New Press Post"}</FieldLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <NamedInput name="title" value={postForm.title} onChange={handlePostChange} placeholder="Title *" />
                  <NamedInput name="artist" value={postForm.artist} onChange={handlePostChange} placeholder="Artist tag" />
                  <NamedInput name="date" value={postForm.date} onChange={handlePostChange} placeholder="Date (YYYY-MM-DD)" />
                  <NamedInput name="slug" value={postForm.slug} onChange={handlePostChange} placeholder="Slug (auto if blank)" />
                  <NamedInput name="cover_url" value={postForm.cover_url} onChange={handlePostChange} placeholder="Cover image URL" />
                  <NamedInput name="excerpt" value={postForm.excerpt} onChange={handlePostChange} placeholder="Excerpt / subtitle" />
                </div>
                <div style={{ marginTop: "8px" }}>
                  <FieldLabel>Body</FieldLabel>
                  <RichEditor key={editingPost ? postForm.id : "new"} value={postForm.body} onChange={v => setPostForm(p => ({ ...p, body: v }))} />
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <ActionBtn onClick={handleSavePost} disabled={postSubmitting}>
                    {postSubmitting ? "Saving..." : editingPost ? "Update Post" : "Publish Post"}
                  </ActionBtn>
                  {editingPost && (
                    <ActionBtn onClick={() => { setEditingPost(false); setPostForm({ id: "", title: "", artist: "", cover_url: "", date: "", excerpt: "", body: "", slug: "" }); setPostStatus(null); }}>
                      Cancel
                    </ActionBtn>
                  )}
                </div>
                <StatusMsg status={postStatus} noun={editingPost ? "Post updated" : "Post published"} />
              </div>
            </Panel>

            <Panel>
              <FieldLabel>All Posts · {posts.length}</FieldLabel>
              {posts.length === 0 && <p style={{ fontFamily: F, fontSize: "10px", opacity: 0.25 }}>No posts yet.</p>}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {posts.map(p => (
                  <DataRow key={p.id} label={p.title} sub={`${p.artist || "—"} · ${p.date}`}>
                    <GhostBtn href={`/press/${p.slug}`}>View</GhostBtn>
                    <GhostBtn onClick={() => handleEditPost(p)}>Edit</GhostBtn>
                    <GhostBtn danger onClick={() => handleDeletePost(p.id, p.title)}>Delete</GhostBtn>
                  </DataRow>
                ))}
              </div>
            </Panel>
          </>
        )}

        {/* ── Slugs ── */}
        {activePanel === "slugs" && (
          <Panel>
            <SlugManager artists={artists} />
          </Panel>
        )}

        {/* ── Photos ── */}
        {activePanel === "photos" && (
          <PhotosPanel artists={artists} onUpdate={updated => setArtists(p => p.map(a => a.id === updated.id ? { ...a, profile_image: updated.profile_image } : a))} />
        )}
      </div>
    </div>
  );
}
