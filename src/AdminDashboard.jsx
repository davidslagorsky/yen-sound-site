import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import RoyaltiesPanel from "./components/RoyaltiesPanel";
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
   CLOUDINARY PHOTO UPLOAD HELPER
   Free tier: 25 GB storage/bandwidth, no credit card.
   Setup: create a free account at cloudinary.com,
   then create an "unsigned" upload preset and paste
   your cloud_name + preset below (or use env vars).
══════════════════════════════════════════════ */

// ── configure these two values ──
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "YOUR_CLOUD_NAME";
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || "YOUR_UNSIGNED_PRESET";

/**
 * Uploads a file to Cloudinary and returns a square-cropped URL.
 * Uses "fill" gravity so any non-square image is intelligently cropped.
 */
async function uploadToCloudinary(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "yen-sound/artists");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
    xhr.upload.onprogress = e => { if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        // Return a square-cropped version via Cloudinary URL transforms
        const squareUrl = data.secure_url.replace("/upload/", "/upload/c_fill,g_face,w_600,h_600,f_auto,q_auto/");
        resolve({ url: squareUrl, publicId: data.public_id });
      } else {
        reject(new Error("Upload failed: " + xhr.responseText));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
}

/* ── single-artist photo upload row ── */
function ArtistPhotoRow({ rosterEntry: r, dbArtist, currentImage, onSaved }) {
  const id = dbArtist?.id;
  const [urlInput, setUrlInput] = useState(dbArtist?.profile_image ?? "");
  const [preview, setPreview] = useState(currentImage);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const fileRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    // Client-side preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true); setProgress(0); setStatus("idle");
    try {
      const { url } = await uploadToCloudinary(file, setProgress);
      setUrlInput(url);
      setPreview(url);
      setUploading(false);
      await saveUrl(id, url, onSaved);
    } catch (err) {
      setUploading(false);
      setStatus("error");
      alert("Upload error: " + err.message);
    }
  }

  async function saveUrl(artistId, url, cb) {
    if (!artistId) return;
    setStatus("saving");
    const { error } = await supabase.from("artists").update({ profile_image: url || null }).eq("id", artistId);
    if (error) { setStatus("error"); alert("Save error: " + error.message); }
    else { setStatus("saved"); cb({ id: artistId, profile_image: url || null }); setTimeout(() => setStatus("idle"), 2500); }
  }

  async function handleRevert() {
    setUrlInput(""); setPreview(r.image);
    await saveUrl(id, null, onSaved);
  }

  const configured = CLOUDINARY_CLOUD_NAME !== "YOUR_CLOUD_NAME";

  return (
    <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", padding: "16px", border: "1px solid rgba(240,237,232,0.1)", background: "#050505" }}>
      {/* square thumbnail */}
      <div
        style={{ width: "64px", height: "64px", flexShrink: 0, overflow: "hidden", background: "#111", border: "1px solid #1a1a1a", cursor: id ? "pointer" : "default", position: "relative" }}
        onClick={() => id && configured && fileRef.current?.click()}
        title={id && configured ? "Click to upload new photo" : ""}
      >
        {preview
          ? <img src={preview} alt={r.displayName} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.2, fontFamily: F, fontSize: "9px" }}>?</div>
        }
        {uploading && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px" }}>
            <div style={{ width: "36px", height: "2px", background: "#222" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "#f0ede8", transition: "width 0.2s" }} />
            </div>
            <span style={{ fontFamily: F, fontSize: "7px", letterSpacing: "0.15em", color: "#f0ede8", opacity: 0.7 }}>{progress}%</span>
          </div>
        )}
        {id && configured && !uploading && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", padding: "3px 0", textAlign: "center" }}>
            <span style={{ fontFamily: F, fontSize: "6px", letterSpacing: "0.15em", color: "#f0ede8", opacity: 0.6, textTransform: "uppercase" }}>Upload</span>
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files?.[0])} />

      {/* name + url input */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: F, fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
          {r.displayName}
          {dbArtist?.profile_image && <span style={{ fontFamily: F, fontSize: "8px", letterSpacing: "0.15em", opacity: 0.4, marginLeft: "8px", fontWeight: 400 }}>custom</span>}
          {!dbArtist?.profile_image && <span style={{ fontFamily: F, fontSize: "8px", letterSpacing: "0.15em", opacity: 0.25, marginLeft: "8px", fontWeight: 400 }}>from rosterData</span>}
        </p>

        {!configured && (
          <p style={{ fontFamily: F, fontSize: "8px", opacity: 0.4, letterSpacing: "0.1em", lineHeight: 1.6, marginBottom: "6px" }}>
            ⚠ Set REACT_APP_CLOUDINARY_CLOUD_NAME + REACT_APP_CLOUDINARY_UPLOAD_PRESET in .env to enable uploads. URL paste still works.
          </p>
        )}

        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={urlInput}
            onChange={e => { setUrlInput(e.target.value); setPreview(e.target.value || currentImage); }}
            placeholder={id ? "https://... or click thumbnail to upload" : "Artist not in Supabase yet"}
            disabled={!id}
            style={{ flex: 1, background: "transparent", border: "1px solid rgba(240,237,232,0.2)", color: "#f0ede8", fontFamily: F, fontSize: "11px", padding: "8px 10px", outline: "none", opacity: id ? 1 : 0.3 }}
            onFocus={e => e.target.style.borderColor = "rgba(240,237,232,0.6)"}
            onBlur={e => e.target.style.borderColor = "rgba(240,237,232,0.2)"}
          />
          {id && (
            <button
              onClick={() => saveUrl(id, urlInput.trim(), onSaved)}
              disabled={status === "saving" || uploading}
              style={{ flexShrink: 0, padding: "8px 14px", background: "transparent", border: "1px solid rgba(240,237,232,0.5)", color: "#f0ede8", fontFamily: F, fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", opacity: (status === "saving" || uploading) ? 0.4 : 1 }}
            >
              {status === "saving" ? "..." : status === "saved" ? "✓" : "Save"}
            </button>
          )}
        </div>
        {!id && <p style={{ fontFamily: F, fontSize: "8px", opacity: 0.3, marginTop: "4px", letterSpacing: "0.1em" }}>Add this artist to Supabase to enable image override</p>}
        {id && dbArtist?.profile_image && (
          <button onClick={handleRevert} style={{ marginTop: "4px", background: "none", border: "none", color: "rgba(220,80,80,0.6)", fontFamily: F, fontSize: "8px", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", padding: 0 }}>
            ↺ revert to rosterData
          </button>
        )}
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
  const rows = roster.map(r => {
    const dbArtist = artists.find(a => a.slug === r.slug || a.display_name?.toLowerCase() === r.displayName?.toLowerCase());
    return { rosterEntry: r, dbArtist, currentImage: dbArtist?.profile_image || r.image };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <FieldLabel>Artist Profile Images — click thumbnail to upload (auto-squared) or paste URL</FieldLabel>
      {rows.map(({ rosterEntry: r, dbArtist, currentImage }) => (
        <ArtistPhotoRow key={r.slug || r.name} rosterEntry={r} dbArtist={dbArtist} currentImage={currentImage} onSaved={onUpdate} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SITE BACKGROUND PANEL
   Stores bg settings in Supabase site_settings table.
   Run this SQL first:
     CREATE TABLE IF NOT EXISTS site_settings (
       key text PRIMARY KEY,
       value jsonb
     );
     INSERT INTO site_settings (key, value) VALUES ('background', '{"type":"color","value":"#000000"}'::jsonb)
       ON CONFLICT (key) DO NOTHING;
     ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
     CREATE POLICY "Public read" ON site_settings FOR SELECT USING (true);
     CREATE POLICY "Anon write" ON site_settings FOR ALL USING (true) WITH CHECK (true);
══════════════════════════════════════════════ */

const BG_PRESETS = [
  { label: "Pure Black",       value: "#000000", type: "color"    },
  { label: "Warm Dark",        value: "#0a0805", type: "color"    },
  { label: "Dark Navy",        value: "#050810", type: "color"    },
  { label: "Deep Forest",      value: "#050a06", type: "color"    },
  { label: "Black → Charcoal", value: "linear-gradient(135deg,#000 0%,#1a1a1a 100%)", type: "gradient" },
  { label: "Black → Deep Blue",value: "linear-gradient(180deg,#000 0%,#080c18 100%)", type: "gradient" },
  { label: "Radial Warm",      value: "radial-gradient(ellipse at 50% 0%,#1a1008 0%,#000 70%)", type: "gradient" },
];

function SiteBackgroundPanel() {
  const [bg, setBg] = useState({ type: "color", value: "#000000" });
  const [imgUrl, setImgUrl] = useState("");
  const [imgUploadStatus, setImgUploadStatus] = useState("idle");
  const [imgProgress, setImgProgress] = useState(0);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [loading, setLoading] = useState(true);
  const fileRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "background").single();
      if (data?.value) {
        setBg(data.value);
        if (data.value.type === "image") setImgUrl(data.value.value || "");
      }
      setLoading(false);
    })();
  }, []);

  async function save(newBg) {
    setSaveStatus("saving");
    const { error } = await supabase.from("site_settings").upsert({ key: "background", value: newBg });
    if (error) { setSaveStatus("error"); alert("Save error: " + error.message); }
    else { setSaveStatus("saved"); setTimeout(() => setSaveStatus("idle"), 2500); }
  }

  async function handleBgImageFile(file) {
    if (!file) return;
    if (CLOUDINARY_CLOUD_NAME === "YOUR_CLOUD_NAME") { alert("Configure Cloudinary env vars first."); return; }
    setImgUploadStatus("uploading"); setImgProgress(0);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", "yen-sound/backgrounds");
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
      xhr.upload.onprogress = e => { if (e.lengthComputable) setImgProgress(Math.round((e.loaded / e.total) * 100)); };
      xhr.onload = async () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          // Deliver a high-quality, auto-format version — no cropping for backgrounds
          const url = data.secure_url.replace("/upload/", "/upload/f_auto,q_auto/");
          setImgUrl(url);
          const newBg = { type: "image", value: url };
          setBg(newBg);
          setImgUploadStatus("done");
          await save(newBg);
        } else {
          setImgUploadStatus("error");
          alert("Upload failed");
        }
      };
      xhr.onerror = () => { setImgUploadStatus("error"); alert("Network error"); };
      xhr.send(formData);
    } catch (err) {
      setImgUploadStatus("error");
      alert(err.message);
    }
  }

  function applyPreset(preset) {
    const newBg = { type: preset.type, value: preset.value };
    setBg(newBg);
    save(newBg);
  }

  const previewStyle = bg.type === "image"
    ? { backgroundImage: `url(${bg.value})`, backgroundSize: "cover", backgroundPosition: "center" }
    : bg.type === "gradient"
      ? { background: bg.value }
      : { backgroundColor: bg.value };

  if (loading) return <p style={{ fontFamily: F, fontSize: "10px", opacity: 0.25 }}>Loading...</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <FieldLabel>Site Background — applies site-wide, adapts to all screen sizes</FieldLabel>

      {/* Live preview swatch */}
      <div style={{ width: "100%", height: "80px", border: "1px solid rgba(240,237,232,0.15)", ...previewStyle, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <span style={{ fontFamily: F, fontSize: "8px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#f0ede8", opacity: 0.5, background: "rgba(0,0,0,0.5)", padding: "4px 10px" }}>Preview</span>
        {saveStatus === "saved" && (
          <span style={{ position: "absolute", top: "8px", right: "10px", fontFamily: F, fontSize: "8px", letterSpacing: "0.2em", color: "rgba(100,255,180,0.9)" }}>✓ Saved</span>
        )}
      </div>

      {/* Preset colors/gradients */}
      <div>
        <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.35, marginBottom: "10px" }}>Presets</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
          {BG_PRESETS.map(p => (
            <button key={p.label} onClick={() => applyPreset(p)} style={{
              padding: "10px 12px", border: bg.value === p.value ? "1px solid rgba(240,237,232,0.6)" : "1px solid rgba(240,237,232,0.15)",
              background: "transparent", color: "#f0ede8", fontFamily: F, fontSize: "9px", letterSpacing: "0.15em",
              textTransform: "uppercase", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "10px"
            }}>
              <span style={{ width: "18px", height: "18px", flexShrink: 0, display: "block", ...(p.type === "gradient" ? { background: p.value } : { backgroundColor: p.value }), border: "1px solid rgba(255,255,255,0.1)" }} />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom color */}
      <div>
        <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.35, marginBottom: "10px" }}>Custom Color</p>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input type="color" value={bg.type === "color" ? bg.value : "#000000"}
            onChange={e => setBg({ type: "color", value: e.target.value })}
            style={{ width: "44px", height: "44px", border: "1px solid rgba(240,237,232,0.2)", background: "transparent", cursor: "pointer", padding: "2px" }} />
          <ActionBtn onClick={() => save(bg)} disabled={saveStatus === "saving"} small>
            {saveStatus === "saving" ? "Saving..." : "Apply Color"}
          </ActionBtn>
        </div>
      </div>

      {/* Background image upload */}
      <div>
        <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.35, marginBottom: "10px" }}>Background Image</p>
        <p style={{ fontFamily: F, fontSize: "8px", opacity: 0.35, letterSpacing: "0.08em", lineHeight: 1.7, marginBottom: "12px" }}>
          Uses CSS <code style={{ opacity: 0.7 }}>background-size: cover</code> — works perfectly on all screen sizes. Landscape images recommended (1920×1080 or wider).
        </p>

        {/* upload or paste URL */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
          <input
            value={imgUrl}
            onChange={e => { setImgUrl(e.target.value); }}
            placeholder="Paste image URL..."
            style={{ flex: 1, background: "transparent", border: "1px solid rgba(240,237,232,0.2)", color: "#f0ede8", fontFamily: F, fontSize: "11px", padding: "10px 12px", outline: "none" }}
            onFocus={e => e.target.style.borderColor = "rgba(240,237,232,0.6)"}
            onBlur={e => e.target.style.borderColor = "rgba(240,237,232,0.2)"}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <button onClick={() => fileRef.current?.click()}
              style={{ padding: "11px", background: "transparent", border: "1px dashed rgba(240,237,232,0.25)", color: "#f0ede8", fontFamily: F, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>
              {imgUploadStatus === "uploading" ? `${imgProgress}%` : "↑ Upload File"}
            </button>
            <ActionBtn onClick={() => { if (imgUrl.trim()) { const nb = { type: "image", value: imgUrl.trim() }; setBg(nb); save(nb); } }} disabled={!imgUrl.trim() || saveStatus === "saving"} small>
              Apply URL
            </ActionBtn>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleBgImageFile(e.target.files?.[0])} />
        </div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════
   RELEASE PAGE CONFIG PANEL
   Manages custom_buttons, button_order, embed_url per release
══════════════════════════════════════════════ */
const RELEASE_PLATFORMS = ["spotify","appleMusic","youtube","tiktok","instagram","soundcloud","bandcamp","website"];
const RELEASE_PLATFORM_LABELS = {
  spotify:"Spotify", appleMusic:"Apple Music", youtube:"YouTube",
  tiktok:"TikTok", instagram:"Instagram", soundcloud:"SoundCloud",
  bandcamp:"Bandcamp", website:"Website",
};

function ReleasePageConfig({ releaseId, initialButtons, initialOrder, initialEmbedUrl, onSaved }) {
  const [buttons, setButtons] = useState(initialButtons || []);
  const [buttonOrder, setButtonOrder] = useState(
    initialOrder?.length ? initialOrder : [...RELEASE_PLATFORMS]
  );
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  // new custom button form
  const [newType, setNewType] = useState("link");
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const allCustomIds = buttons.map(b => b.id);
  const fullOrder = [...buttonOrder, ...allCustomIds.filter(id => !buttonOrder.includes(id))];

  function moveUp(key) {
    const i = fullOrder.indexOf(key);
    if (i <= 0) return;
    const next = [...fullOrder];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    setButtonOrder(next);
  }
  function moveDown(key) {
    const i = fullOrder.indexOf(key);
    if (i >= fullOrder.length - 1) return;
    const next = [...fullOrder];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    setButtonOrder(next);
  }
  function removeCustom(id) {
    setButtons(b => b.filter(x => x.id !== id));
    setButtonOrder(o => o.filter(x => x !== id));
  }
  function addCustom() {
    if (!newUrl.trim()) { setStatus("error:URL is required"); return; }
    if (newType !== "embed" && !newLabel.trim()) { setStatus("error:Label is required"); return; }
    const id = `custom_${Date.now()}`;
    const btn = { id, type: newType, url: newUrl.trim(), label: newLabel.trim() };
    if (newType === "locked") btn.password = newPassword.trim();
    setButtons(b => [...b, btn]);
    setButtonOrder(o => [...o, id]);
    setNewLabel(""); setNewUrl(""); setNewPassword(""); setStatus(null);
  }

  async function save() {
    setSaving(true); setStatus(null);
    const { error } = await supabase.from("releases").update({
      custom_buttons: buttons,
      button_order: fullOrder,
      embed_url: null,
    }).eq("id", releaseId);
    if (error) setStatus("error:" + error.message);
    else { setStatus("success"); onSaved?.(); setTimeout(() => setStatus(null), 2500); }
    setSaving(false);
  }

  const selectStyle = {
    background: "#000", border: "1px solid rgba(240,237,232,0.2)", color: "#f0ede8",
    fontFamily: F, fontSize: "11px", padding: "10px 12px", cursor: "pointer",
    outline: "none", width: "100%",
  };

  return (
    <div>
      <FieldLabel>Button Order</FieldLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "20px" }}>
        {fullOrder.map((key, i) => {
          const isPlatform = RELEASE_PLATFORMS.includes(key);
          const customBtn = buttons.find(b => b.id === key);
          const label = isPlatform ? RELEASE_PLATFORM_LABELS[key] : (customBtn?.label || customBtn?.type || key);
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", border: "1px solid rgba(240,237,232,0.1)", background: "#050505" }}>
              <span style={{ fontFamily: F, fontSize: "10px", flex: 1, color: "#f0ede8", opacity: isPlatform ? 0.5 : 1 }}>
                {isPlatform ? `[${label}]` : label}
                {!isPlatform && customBtn && <span style={{ opacity: 0.3, fontSize: "9px", marginLeft: "8px" }}>{customBtn.type}</span>}
              </span>
              <GhostBtn onClick={() => moveUp(key)}>↑</GhostBtn>
              <GhostBtn onClick={() => moveDown(key)}>↓</GhostBtn>
              {!isPlatform && <GhostBtn danger onClick={() => removeCustom(key)}>✕</GhostBtn>}
            </div>
          );
        })}
      </div>

      <FieldLabel>Add Custom Button</FieldLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
        <select value={newType} onChange={e => setNewType(e.target.value)} style={selectStyle}>
          <option value="link">Link</option>
          <option value="embed">Embed (Spotify / YouTube / SoundCloud)</option>
          <option value="locked">Password-Locked Link</option>
        </select>
        {newType !== "embed" && (
          <Input value={newLabel} onChange={setNewLabel} placeholder="Button label" />
        )}
        <Input value={newUrl} onChange={setNewUrl} placeholder="URL" />
        {newType === "locked" && (
          <Input value={newPassword} onChange={setNewPassword} placeholder="Password" />
        )}
        <ActionBtn onClick={addCustom}>+ Add Button</ActionBtn>
      </div>

      <ActionBtn onClick={save} disabled={saving}>
        {saving ? "Saving..." : "Save Page Config"}
      </ActionBtn>
      <StatusMsg status={status} noun="Page config saved" />
    </div>
  );
}


/* ══════════════════════════════════════════════
   ANALYTICS PANEL
══════════════════════════════════════════════ */
function AnalyticsPanel({ releases }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("page_events")
        .select("page_slug,event_type,label,created_at")
        .eq("page_type", "release")
        .order("created_at", { ascending: false });
      setRows(data || []);
      setLoading(false);
    })();
  }, []);

  /* aggregate per release */
  const byRelease = useMemo(() => {
    const map = {};
    rows.forEach(r => {
      if (!map[r.page_slug]) map[r.page_slug] = { views: 0, clicks: {}, total_clicks: 0 };
      if (r.event_type === "view") map[r.page_slug].views++;
      if (r.event_type === "click") {
        const k = r.label || "Unknown";
        map[r.page_slug].clicks[k] = (map[r.page_slug].clicks[k] || 0) + 1;
        map[r.page_slug].total_clicks++;
      }
    });
    return map;
  }, [rows]);

  /* sorted by views desc */
  const sorted = useMemo(() =>
    Object.entries(byRelease)
      .sort((a, b) => b[1].views - a[1].views)
      .map(([slug, data]) => {
        const release = releases.find(r => r.slug === slug);
        return { slug, title: release?.title || slug, artist: release?.artist || "", ...data };
      }),
    [byRelease, releases]
  );

  function exportPDF(entry) {
    setPdfLoading(true);
    const dateStr = new Date().toLocaleDateString("he-IL");
    const clickRows = Object.entries(entry.clicks).sort((a,b) => b[1]-a[1]);
    const totalClicks = entry.total_clicks;

    const html = `<!DOCTYPE html><html lang="he" dir="rtl">
<head><meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Heebo',Arial,sans-serif;direction:rtl;background:#fff;color:#111;padding:40px}
  .doc-header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:2px solid #111;margin-bottom:28px}
  .brand{font-size:11px;font-weight:700;letter-spacing:0.4em;text-transform:uppercase;color:#111;margin-bottom:4px}
  .doc-type{font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:#888;margin-bottom:12px}
  .release-name{font-size:26px;font-weight:900;letter-spacing:-0.5px;line-height:1}
  .artist-name{font-size:12px;color:#666;margin-top:4px;letter-spacing:0.05em}
  .kpi-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px}
  .kpi{border:1px solid #ddd;padding:18px;text-align:center}
  .kpi-label{font-size:8px;letter-spacing:0.3em;text-transform:uppercase;color:#888;margin-bottom:8px}
  .kpi-val{font-size:28px;font-weight:900;color:#111;font-family:'Courier New',monospace}
  .section-head{font-size:8px;letter-spacing:0.3em;text-transform:uppercase;color:#888;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #e8e8e8}
  table{width:100%;border-collapse:collapse;font-size:11px}
  th{padding:8px 10px;text-align:right;font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:#888;border-bottom:1.5px solid #111;font-weight:600}
  th.num{text-align:left}
  td{padding:8px 10px;border-bottom:1px solid #f0f0f0}
  td.num{text-align:left;font-family:'Courier New',monospace;font-weight:700}
  .bar-wrap{flex:1;height:4px;background:#f0f0f0;margin:0 10px;position:relative}
  .bar-fill{position:absolute;right:0;top:0;bottom:0;background:#111}
  tr:nth-child(even) td{background:#fafafa}
  .footer{margin-top:28px;padding-top:14px;border-top:1px solid #ddd;display:flex;justify-content:space-between}
  .footer-brand{font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#bbb;font-weight:700}
  .footer-note{font-size:8px;color:#ccc}
  @media print{body{padding:20px}@page{margin:10mm;size:A4}}
</style></head><body>
  <div class="doc-header">
    <div>
      <div class="brand">YEN SOUND</div>
      <div class="doc-type">Analytics Report</div>
      <div class="release-name">${entry.title}</div>
      ${entry.artist ? `<div class="artist-name">${entry.artist}</div>` : ''}
    </div>
    <div style="text-align:left">
      <div style="font-size:10px;color:#888">${dateStr}</div>
      <div style="font-size:10px;color:#555;margin-top:4px">yensound.com/release/${entry.slug}</div>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi"><div class="kpi-label">Page Views</div><div class="kpi-val">${entry.views.toLocaleString()}</div></div>
    <div class="kpi"><div class="kpi-label">Link Clicks</div><div class="kpi-val">${totalClicks.toLocaleString()}</div></div>
  </div>

  ${clickRows.length > 0 ? `
  <div style="margin-bottom:28px">
    <div class="section-head">Clicks by Button</div>
    <table>
      <thead><tr>
        <th>Button</th>
        <th class="num">Clicks</th>
        <th class="num">%</th>
      </tr></thead>
      <tbody>
        ${clickRows.map(([label, count]) => `
          <tr>
            <td>${label}</td>
            <td class="num">${count}</td>
            <td class="num">${totalClicks > 0 ? Math.round(count/totalClicks*100) : 0}%</td>
          </tr>`).join('')}
      </tbody>
    </table>
  </div>` : ''}

  <div class="footer">
    <span class="footer-brand">YEN SOUND</span>
    <span class="footer-note">הופק ${dateStr} · מסמך זה מיועד לאמן בלבד</span>
  </div>
</body></html>`;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); setPdfLoading(false); }, 600);
  }

  if (loading) return <p style={{ fontFamily: F, fontSize: "10px", opacity: 0.25 }}>Loading...</p>;
  if (rows.length === 0) return (
    <div>
      <p style={{ fontFamily: F, fontSize: "10px", opacity: 0.25, marginBottom: "12px" }}>No data yet.</p>
      <p style={{ fontFamily: F, fontSize: "9px", opacity: 0.2, lineHeight: 1.7, letterSpacing: "0.08em" }}>
        Analytics are tracked automatically when visitors open release pages and click buttons.
        Make sure to run the SQL below in Supabase first.
      </p>
      <pre style={{ background: "#080808", border: "1px solid #1a1a1a", padding: "16px", fontFamily: "monospace", fontSize: "11px", color: "rgba(100,255,180,0.85)", overflowX: "auto", lineHeight: 1.6, marginTop: "16px", whiteSpace: "pre-wrap" }}>
{`CREATE TABLE IF NOT EXISTS page_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page_type text NOT NULL,
  page_slug text NOT NULL,
  event_type text NOT NULL,
  label text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE page_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon insert" ON page_events
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon select" ON page_events
  FOR SELECT USING (true);`}
      </pre>
    </div>
  );

  return (
    <div>
      <FieldLabel>Release Performance</FieldLabel>
      {selectedSlug && (() => {
        const entry = sorted.find(s => s.slug === selectedSlug);
        if (!entry) return null;
        const clickRows = Object.entries(entry.clicks).sort((a,b) => b[1]-a[1]);
        const maxClicks = clickRows[0]?.[1] || 1;
        return (
          <div style={{ border: "1px solid rgba(240,237,232,0.15)", marginBottom: "16px", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <p style={{ fontFamily: F, fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", color: "#f0ede8" }}>{entry.title}</p>
                {entry.artist && <p style={{ fontFamily: F, fontSize: "10px", opacity: 0.4, marginTop: "2px" }}>{entry.artist}</p>}
              </div>
              <GhostBtn onClick={() => setSelectedSlug(null)}>✕</GhostBtn>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
              {[["Page Views", entry.views], ["Link Clicks", entry.total_clicks]].map(([label, val]) => (
                <div key={label} style={{ border: "1px solid rgba(240,237,232,0.1)", padding: "14px", textAlign: "center" }}>
                  <p style={{ fontFamily: F, fontSize: "8px", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.35, marginBottom: "8px" }}>{label}</p>
                  <p style={{ fontFamily: "monospace", fontSize: "22px", color: "#f0ede8" }}>{val.toLocaleString()}</p>
                </div>
              ))}
            </div>

            {clickRows.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <p style={{ fontFamily: F, fontSize: "8px", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.3, marginBottom: "12px" }}>Clicks by Button</p>
                {clickRows.map(([label, count]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", direction: "rtl" }}>
                    <span style={{ fontFamily: F, fontSize: "10px", width: "100px", textAlign: "right", flexShrink: 0, opacity: 0.7 }}>{label}</span>
                    <div style={{ flex: 1, height: "3px", background: "rgba(240,237,232,0.07)" }}>
                      <div style={{ height: "100%", width: `${(count/maxClicks)*100}%`, background: "rgba(240,237,232,0.5)", transition: "width 0.4s" }} />
                    </div>
                    <span style={{ fontFamily: "monospace", fontSize: "10px", opacity: 0.5, width: "30px", textAlign: "left", flexShrink: 0 }}>{count}</span>
                  </div>
                ))}
              </div>
            )}

            <ActionBtn onClick={() => exportPDF(entry)} disabled={pdfLoading}>
              {pdfLoading ? "Generating..." : "Export PDF Report"}
            </ActionBtn>
          </div>
        );
      })()}

      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {sorted.map(entry => (
          <div key={entry.slug}
            onClick={() => setSelectedSlug(entry.slug === selectedSlug ? null : entry.slug)}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", border: `1px solid ${entry.slug === selectedSlug ? "rgba(240,237,232,0.4)" : "rgba(240,237,232,0.08)"}`, cursor: "pointer", background: entry.slug === selectedSlug ? "#0d0d0d" : "transparent", transition: "all 0.15s" }}
            onMouseOver={e => { if (entry.slug !== selectedSlug) e.currentTarget.style.borderColor = "rgba(240,237,232,0.2)"; }}
            onMouseOut={e => { if (entry.slug !== selectedSlug) e.currentTarget.style.borderColor = "rgba(240,237,232,0.08)"; }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontFamily: F, fontSize: "11px", letterSpacing: "0.05em", color: "#f0ede8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.title}</p>
              {entry.artist && <p style={{ fontFamily: F, fontSize: "9px", opacity: 0.35, marginTop: "2px" }}>{entry.artist}</p>}
            </div>
            <div style={{ display: "flex", gap: "16px", flexShrink: 0, marginRight: "8px" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "monospace", fontSize: "14px", color: "#f0ede8" }}>{entry.views.toLocaleString()}</p>
                <p style={{ fontFamily: F, fontSize: "7px", opacity: 0.3, letterSpacing: "0.15em", textTransform: "uppercase" }}>views</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "monospace", fontSize: "14px", color: "#f0ede8" }}>{entry.total_clicks.toLocaleString()}</p>
                <p style={{ fontFamily: F, fontSize: "7px", opacity: 0.3, letterSpacing: "0.15em", textTransform: "uppercase" }}>clicks</p>
              </div>
            </div>
            <span style={{ opacity: 0.3, fontSize: "10px" }}>{entry.slug === selectedSlug ? "▲" : "▼"}</span>
          </div>
        ))}
      </div>
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
  const [editingRelease, setEditingRelease] = useState(null); // release object being edited
  const [configRelease, setConfigRelease] = useState(null); // release being page-configured

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
  const handleEditRelease = async (r) => {
    // fetch full release from Supabase to get all fields
    const { data } = await supabase.from("releases").select("*").eq("id", r.id).single();
    const d = data || r;
    setEditingRelease(d);
    setConfigRelease(null);
    setReleaseForm({
      title: d.title || "", artist: d.artist || "", type: d.type || "Single",
      date: d.date || "", release_at: d.release_at || "",
      slug: d.slug || "", cover: d.cover || "",
      smart_link: d.smart_link || "", spotify_url: d.spotify_url || "",
      apple_url: d.apple_url || "", youtube_url: d.youtube_url || "",
      embed_youtube_id: d.embed_youtube_id || "", embed_spotify: d.embed_spotify || "",
      background_url: d.background_url || "",
      socials_instagram: d.socials?.instagram || "",
      socials_tiktok: d.socials?.tiktok || "",
      socials_youtube: d.socials?.youtube || "",
      socials_website: d.socials?.website || "",
    });
    setReleaseStatus(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleUpdateRelease = async () => {
    if (!editingRelease) return;
    setReleaseSubmitting(true); setReleaseStatus(null);
    const { error } = await supabase.from("releases").update({
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
    }).eq("id", editingRelease.id);
    if (error) setReleaseStatus("error:" + error.message);
    else {
      setReleaseStatus("success");
      setReleases(p => p.map(r => r.id === editingRelease.id ? { ...r, title: releaseForm.title, artist: releaseForm.artist, date: releaseForm.date } : r));
      setEditingRelease(null);
      setReleaseForm({ title: "", artist: "", type: "Single", date: "", release_at: "", slug: "", cover: "", smart_link: "", spotify_url: "", apple_url: "", youtube_url: "", embed_youtube_id: "", embed_spotify: "", background_url: "", socials_instagram: "", socials_tiktok: "", socials_youtube: "", socials_website: "" });
    }
    setReleaseSubmitting(false);
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
    { id: "releases",   icon: "♫", label: "Releases"   },
    { id: "artists",    icon: "◈", label: "Artists"    },
    { id: "press",      icon: "✎", label: "Press"      },
    { id: "slugs",      icon: "⌘", label: "Slugs"      },
    { id: "photos",     icon: "◻", label: "Photos"     },
    { id: "bg",         icon: "▣", label: "Background" },
    { id: "royalties",  icon: "₪", label: "Royalties"  },
    { id: "analytics",  icon: "◎", label: "Analytics"  },
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
          {tiles.map(t => <DashTile key={t.id} icon={t.icon} label={t.label} active={activePanel === t.id} onClick={() => toggle(t.id)} />)}
        </div>
      </div>

      {/* panels */}
      <div style={{ padding: "0 24px 80px" }}>

        {/* ── Releases ── */}
        {activePanel === "releases" && (
          <>
            <Panel>
              <FieldLabel>{editingRelease ? `Editing: ${editingRelease.title}` : "Add Release"}</FieldLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { name: "title",            placeholder: "Title *"                   },
                  { name: "artist",           placeholder: "Artist *"                  },
                  { name: "slug",             placeholder: "Slug * (e.g. bahaimhaele)" },
                  { name: "date",             placeholder: "Date * (YYYY-MM-DD)"       },
                  { name: "release_at",       placeholder: "Release At (countdown)"    },
                  { name: "cover",            placeholder: "Cover image URL"           },
                  { name: "smart_link",       placeholder: "Smart Link URL"            },
                  { name: "spotify_url",      placeholder: "Spotify URL"               },
                  { name: "apple_url",        placeholder: "Apple Music URL"           },
                  { name: "youtube_url",      placeholder: "YouTube URL"               },
                  { name: "embed_youtube_id", placeholder: "YouTube Embed ID"          },
                  { name: "embed_spotify",    placeholder: "Spotify Embed URL"         },
                  { name: "background_url",   placeholder: "Background image URL"      },
                  { name: "socials_instagram",placeholder: "Instagram URL"             },
                  { name: "socials_tiktok",   placeholder: "TikTok URL"               },
                  { name: "socials_youtube",  placeholder: "YouTube channel URL"       },
                  { name: "socials_website",  placeholder: "Website URL"               },
                ].map(f => <NamedInput key={f.name} name={f.name} value={releaseForm[f.name]} onChange={handleReleaseChange} placeholder={f.placeholder} />)}
                <select name="type" value={releaseForm.type} onChange={handleReleaseChange}
                  style={{ background: "#000", border: "1px solid rgba(240,237,232,0.2)", color: "#f0ede8", fontFamily: F, fontSize: "11px", padding: "10px 12px", cursor: "pointer", outline: "none", width: "100%" }}>
                  <option value="Single">Single</option>
                  <option value="Album">Album</option>
                  <option value="EP">EP</option>
                </select>
                <div style={{ display: "flex", gap: "8px" }}>
                  <ActionBtn onClick={editingRelease ? handleUpdateRelease : handleAddRelease} disabled={releaseSubmitting}>
                    {releaseSubmitting ? "Saving..." : editingRelease ? "Update Release" : "Add Release"}
                  </ActionBtn>
                  {editingRelease && (
                    <ActionBtn onClick={() => {
                      setEditingRelease(null);
                      setReleaseForm({ title: "", artist: "", type: "Single", date: "", release_at: "", slug: "", cover: "", smart_link: "", spotify_url: "", apple_url: "", youtube_url: "", embed_youtube_id: "", embed_spotify: "", background_url: "", socials_instagram: "", socials_tiktok: "", socials_youtube: "", socials_website: "" });
                      setReleaseStatus(null);
                    }}>Cancel</ActionBtn>
                  )}
                </div>
                <StatusMsg status={releaseStatus} noun={editingRelease ? "Release updated" : "Release added"} />
              </div>
            </Panel>

            {configRelease && (
              <Panel>
                <FieldLabel>Page Config — {releases.find(r => r.id === configRelease.id)?.title || "Release"}</FieldLabel>
                <ReleasePageConfig
                  key={configRelease.id}
                  releaseId={configRelease.id}
                  initialButtons={configRelease.custom_buttons || []}
                  initialOrder={configRelease.button_order || []}
                  initialEmbedUrl={configRelease.embed_url || ""}
                  onSaved={() => setConfigRelease(null)}
                />
                <div style={{ marginTop: "12px" }}>
                  <GhostBtn onClick={() => setConfigRelease(null)}>Cancel</GhostBtn>
                </div>
              </Panel>
            )}

            <Panel>
              <FieldLabel>All Releases · {releases.length}</FieldLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {releases.map(r => (
                  <DataRow key={r.id} label={r.title} sub={`${r.artist} · ${r.date}`}>
                    <GhostBtn href={`/release/${r.slug || r.id}`}>View</GhostBtn>
                    <GhostBtn onClick={() => { handleEditRelease(r); setActivePanel("releases"); }}>Edit</GhostBtn>
                    <GhostBtn onClick={async () => {
                      const { data } = await supabase.from("releases").select("id,custom_buttons,button_order,embed_url").eq("id", r.id).single();
                      setConfigRelease(data || r);
                      setEditingRelease(null);
                      setActivePanel("releases");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}>Page</GhostBtn>
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
          <Panel>
            <PhotosPanel artists={artists} onUpdate={updated => setArtists(p => p.map(a => a.id === updated.id ? { ...a, profile_image: updated.profile_image } : a))} />
          </Panel>
        )}

        {/* ── Background ── */}
        {activePanel === "bg" && (
          <Panel>
            <SiteBackgroundPanel />
          </Panel>
        )}

        {/* ── Analytics ── */}
        {activePanel === "analytics" && (
          <Panel>
            <AnalyticsPanel releases={releases} />
          </Panel>
        )}

        {/* ── Royalties ── */}
        {activePanel === "royalties" && (
          <Panel>
            <RoyaltiesPanel />
          </Panel>
        )}
      </div>
    </div>
  );
}
