import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";
import linkMap from "./linkMap";

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/* ── Minimal rich editor ── */
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

  const emit = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const saveRange = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount) savedRange.current = sel.getRangeAt(0).cloneRange();
  };

  const restoreRange = () => {
    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const exec = (cmd, value = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    emit();
  };

  const insertLink = () => {
    restoreRange();
    const url = linkUrl.trim();
    const text = linkText.trim();
    if (!url) return;
    const html = `<a href="${url}" target="_blank" rel="noreferrer">${text || url}</a>`;
    document.execCommand("insertHTML", false, html);
    emit();
    setShowLinkDialog(false);
    setLinkUrl(""); setLinkText("");
  };

  const insertImage = () => {
    restoreRange();
    const url = imageUrl.trim();
    if (!url) return;
    const html = `<img src="${url}" alt="" style="width:100%;display:block;margin:24px 0;" />`;
    document.execCommand("insertHTML", false, html);
    emit();
    setShowImageDialog(false);
    setImageUrl("");
  };

  const toolBtn = (label, action, title) => (
    <button
      type="button"
      title={title || label}
      onMouseDown={(e) => { e.preventDefault(); saveRange(); action(); }}
      style={toolBtnStyle}
    >{label}</button>
  );

  return (
    <div style={{ border: "1px solid #222", background: "#050505" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2px", padding: "8px 10px", borderBottom: "1px solid #1a1a1a", alignItems: "center" }}>
        {toolBtn("B",  () => exec("bold"),      "Bold")}
        {toolBtn("I",  () => exec("italic"),     "Italic")}
        {toolBtn("H2", () => exec("formatBlock", "h2"), "Heading 2")}
        {toolBtn("H3", () => exec("formatBlock", "h3"), "Heading 3")}
        {toolBtn("P",  () => exec("formatBlock", "p"),  "Paragraph")}
        {toolBtn("—",  () => exec("insertHorizontalRule"), "Divider")}

        <div style={{ width: "1px", height: "16px", background: "#222", margin: "0 4px" }} />

        <button type="button" onMouseDown={(e) => { e.preventDefault(); saveRange(); setShowLinkDialog(true); setShowImageDialog(false); }} style={toolBtnStyle} title="Insert link">
          Link
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); saveRange(); setShowImageDialog(true); setShowLinkDialog(false); }} style={toolBtnStyle} title="Insert image">
          Img
        </button>

        <div style={{ marginLeft: "auto" }}>
          <button type="button" onClick={() => setPreview(p => !p)} style={{ ...toolBtnStyle, opacity: preview ? 1 : 0.45, letterSpacing: "0.15em" }}>
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
      </div>

      {/* Link dialog */}
      {showLinkDialog && (
        <div style={dialogStyle}>
          <input autoFocus placeholder="URL (https://...)" value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && insertLink()} style={dialogInput} />
          <input placeholder="Display text (optional)" value={linkText} onChange={e => setLinkText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && insertLink()} style={dialogInput} />
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" onClick={insertLink} style={dialogBtn}>Insert</button>
            <button type="button" onClick={() => setShowLinkDialog(false)} style={{ ...dialogBtn, opacity: 0.4 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Image dialog */}
      {showImageDialog && (
        <div style={dialogStyle}>
          <input autoFocus placeholder="Image URL (https://...)" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && insertImage()} style={dialogInput} />
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" onClick={insertImage} style={dialogBtn}>Insert</button>
            <button type="button" onClick={() => setShowImageDialog(false)} style={{ ...dialogBtn, opacity: 0.4 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Editor / Preview */}
      {preview ? (
        <div
          className="press-body"
          style={{ padding: "20px 24px", minHeight: "280px", fontSize: "14px", lineHeight: 1.8, color: "rgba(240,237,232,0.7)" }}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          data-yen-editor
          onInput={emit}
          onBlur={emit}
          style={{
            padding: "20px 24px",
            minHeight: "280px",
            outline: "none",
            fontFamily: F,
            fontSize: "14px",
            lineHeight: 1.8,
            color: "rgba(240,237,232,0.75)",
            caretColor: "#f0ede8",
          }}
        />
      )}
    </div>
  );
}

const toolBtnStyle = {
  background: "transparent", border: "none", color: "#f0ede8",
  fontFamily: F, fontSize: "10px", fontWeight: 700,
  letterSpacing: "0.15em", textTransform: "uppercase",
  cursor: "pointer", padding: "4px 8px", opacity: 0.6,
};

const dialogStyle = {
  padding: "12px 16px", borderBottom: "1px solid #1a1a1a",
  background: "#0a0a0a", display: "flex", flexDirection: "column", gap: "8px",
};

const dialogInput = {
  background: "transparent", border: "none",
  borderBottom: "1px solid #2a2a2a", color: "#f0ede8",
  fontFamily: F, fontSize: "12px", letterSpacing: "0.05em",
  padding: "6px 2px", outline: "none", width: "100%",
};

const dialogBtn = {
  background: "transparent", border: "1px solid #333", color: "#f0ede8",
  fontFamily: F, fontSize: "10px", letterSpacing: "0.2em",
  textTransform: "uppercase", padding: "6px 14px", cursor: "pointer",
};

/* ── Main dashboard ── */
export default function AdminDashboard() {
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [shortlink, setShortlink] = useState("");
  const [destination, setDestination] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(null);

  const [releases, setReleases] = useState([]);
  const [artists, setArtists] = useState([]);
  const [artistForm, setArtistForm] = useState({ id: "", password: "", display_name: "", filter_name: "", upload_url: "" });
  const [artistSubmitStatus, setArtistSubmitStatus] = useState(null);
  const [artistSubmitting, setArtistSubmitting] = useState(false);

  const [posts, setPosts] = useState([]);
  const [postForm, setPostForm] = useState({ id: "", title: "", artist: "", cover_url: "", date: "", excerpt: "", body: "", slug: "" });
  const [postSubmitStatus, setPostSubmitStatus] = useState(null);
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState(false);

  const [form, setForm] = useState({
    title: "", artist: "", type: "Single", date: "", release_at: "",
    slug: "", cover: "", smart_link: "", spotify_url: "", apple_url: "",
    youtube_url: "", embed_youtube_id: "", embed_spotify: "",
    background_url: "", background_darken: 0.0,
    socials_instagram: "", socials_tiktok: "", socials_youtube: "", socials_website: ""
  });
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("yenAdminAuthed") === "true") setAuth(true);
  }, []);

  useEffect(() => {
    if (!auth) return;
    const load = async () => {
      const [rel, art, pst] = await Promise.all([
        supabase.from("releases").select("id,title,artist,date").order("date", { ascending: false }),
        supabase.from("artists").select("*").order("created_at", { ascending: true }),
        supabase.from("press_posts").select("*").order("date", { ascending: false }),
      ]);
      if (rel.data) setReleases(rel.data);
      if (art.data) setArtists(art.data);
      if (pst.data) setPosts(pst.data);
    };
    load();
  }, [auth]);

  const handleLogin = () => {
    if (password === "sighmadethissite") {
      setAuth(true);
      localStorage.setItem("yenAdminAuthed", "true");
    } else setError("Incorrect password");
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    const { error } = await supabase.from("releases").delete().eq("id", id);
    if (!error) setReleases(p => p.filter(r => r.id !== id));
    else alert("Error: " + error.message);
  };

  const handleDeleteArtist = async (id) => {
    if (!window.confirm(`Delete artist "${id}"?`)) return;
    const { error } = await supabase.from("artists").delete().eq("id", id);
    if (!error) setArtists(p => p.filter(a => a.id !== id));
    else alert("Error: " + error.message);
  };

  const generateSnippet = () => `"${shortlink.trim()}": "${destination.trim()}"`;
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateSnippet()).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  const handleCopySlug = (slug) => {
    navigator.clipboard.writeText(`https://yensound.com/${slug}`);
    setCopiedSlug(slug); setTimeout(() => setCopiedSlug(null), 1500);
  };

  const handleFormChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleArtistFormChange = e => setArtistForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handlePostFieldChange = e => setPostForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleAddRelease = async () => {
    if (!form.title || !form.artist || !form.slug || !form.date) {
      setSubmitStatus("error:Please fill in Title, Artist, Slug and Date."); return;
    }
    setSubmitting(true); setSubmitStatus(null);
    const payload = {
      title: form.title, artist: form.artist, type: form.type, date: form.date,
      release_at: form.release_at || null, slug: form.slug,
      cover: form.cover || null, smart_link: form.smart_link || null,
      spotify_url: form.spotify_url || null, apple_url: form.apple_url || null,
      youtube_url: form.youtube_url || null, embed_youtube_id: form.embed_youtube_id || null,
      embed_spotify: form.embed_spotify || null, background_url: form.background_url || null,
      background_darken: parseFloat(form.background_darken) || 0.0,
      socials: {
        instagram: form.socials_instagram || "PLACEHOLDER",
        tiktok: form.socials_tiktok || "PLACEHOLDER",
        youtube: form.socials_youtube || "PLACEHOLDER",
        website: form.socials_website || "PLACEHOLDER",
      }
    };
    const { error } = await supabase.from("releases").insert([payload]);
    if (error) setSubmitStatus("error:" + error.message);
    else {
      setSubmitStatus("success");
      setReleases(p => [{ id: Date.now(), title: form.title, artist: form.artist, date: form.date }, ...p]);
      setForm({ title: "", artist: "", type: "Single", date: "", release_at: "", slug: "", cover: "", smart_link: "", spotify_url: "", apple_url: "", youtube_url: "", embed_youtube_id: "", embed_spotify: "", background_url: "", background_darken: 0.0, socials_instagram: "", socials_tiktok: "", socials_youtube: "", socials_website: "" });
    }
    setSubmitting(false);
  };

  const handleAddArtist = async () => {
    if (!artistForm.id || !artistForm.password || !artistForm.display_name) {
      setArtistSubmitStatus("error:Please fill in ID, Password and Display Name."); return;
    }
    setArtistSubmitting(true); setArtistSubmitStatus(null);
    const { error } = await supabase.from("artists").insert([{
      id: artistForm.id.trim(), password: artistForm.password.trim(),
      display_name: artistForm.display_name.trim(),
      filter_name: artistForm.filter_name.trim() || artistForm.display_name.trim(),
      upload_url: artistForm.upload_url.trim() || null,
    }]);
    if (error) setArtistSubmitStatus("error:" + error.message);
    else { setArtistSubmitStatus("success"); setArtists(p => [...p, { ...artistForm }]); setArtistForm({ id: "", password: "", display_name: "", filter_name: "", upload_url: "" }); }
    setArtistSubmitting(false);
  };

  const slugify = str => str.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 60);

  const handleSavePost = async () => {
    // Read body directly from the editor DOM in case blur hasn't fired
    const editorEl = document.querySelector("[data-yen-editor]");
    const liveBody = editorEl ? editorEl.innerHTML : postForm.body;
    const finalBody = liveBody.trim();

    if (!postForm.title || !finalBody) {
      setPostSubmitStatus("error:Title and body are required."); return;
    }
    setPostSubmitting(true); setPostSubmitStatus(null);
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
    if (err) setPostSubmitStatus("error:" + err.message);
    else {
      setPostSubmitStatus("success");
      setPostForm({ id: "", title: "", artist: "", cover_url: "", date: "", excerpt: "", body: "", slug: "" });
      setEditingPost(false);
    }
    setPostSubmitting(false);
  };

  const handleEditPost = (post) => {
    setEditingPost(true);
    setPostForm({ id: post.id, title: post.title || "", artist: post.artist || "", cover_url: post.cover_url || "", date: post.date || "", excerpt: post.excerpt || "", body: post.body || "", slug: post.slug || "" });
    setPostSubmitStatus(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeletePost = async (id, title) => {
    if (!window.confirm(`Delete post "${title}"?`)) return;
    const { error } = await supabase.from("press_posts").delete().eq("id", id);
    if (!error) setPosts(p => p.filter(x => x.id !== id));
    else alert("Error: " + error.message);
  };

  if (!auth) return (
    <div style={S.container}>
      <h2 style={S.title}>Admin</h2>
      <input type="password" placeholder="Password" value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleLogin()}
        style={S.input} />
      <button onClick={handleLogin} style={{ ...S.button, marginTop: "16px" }}>Enter</button>
      {error && <p style={S.error}>{error}</p>}
    </div>
  );

  return (
    <div style={S.container}>

      <Section title="Add Release">
        {[
          { name: "title", placeholder: "Title *" },
          { name: "artist", placeholder: "Artist *" },
          { name: "slug", placeholder: "Slug * (e.g. bahaimhaele)" },
          { name: "date", placeholder: "Date * (YYYY-MM-DD)" },
          { name: "release_at", placeholder: "Release At (YYYY-MM-DD, countdown)" },
          { name: "cover", placeholder: "Cover image URL" },
          { name: "smart_link", placeholder: "Smart Link" },
          { name: "spotify_url", placeholder: "Spotify URL" },
          { name: "apple_url", placeholder: "Apple Music URL" },
          { name: "youtube_url", placeholder: "YouTube URL" },
          { name: "embed_youtube_id", placeholder: "YouTube Embed ID" },
          { name: "embed_spotify", placeholder: "Spotify Embed URL" },
          { name: "background_url", placeholder: "Background image URL" },
          { name: "socials_instagram", placeholder: "Instagram URL" },
          { name: "socials_tiktok", placeholder: "TikTok URL" },
          { name: "socials_youtube", placeholder: "YouTube channel URL" },
          { name: "socials_website", placeholder: "Website URL" },
        ].map(({ name, placeholder }) => (
          <input key={name} name={name} placeholder={placeholder} value={form[name]} onChange={handleFormChange} style={S.input} />
        ))}
        <select name="type" value={form.type} onChange={handleFormChange} style={{ ...S.input, color: "#f0ede8" }}>
          <option value="Single">Single</option>
          <option value="Album">Album</option>
        </select>
        <button onClick={handleAddRelease} disabled={submitting} style={S.button}>
          {submitting ? "Adding..." : "Add Release"}
        </button>
        <StatusMsg status={submitStatus} noun="Release added" />
      </Section>

      <Section title="Add Artist Login">
        {[
          { name: "id", placeholder: "Artist ID * (e.g. sigh)" },
          { name: "password", placeholder: "Password *" },
          { name: "display_name", placeholder: "Display Name *" },
          { name: "filter_name", placeholder: "Filter Name (exact name in releases)" },
          { name: "upload_url", placeholder: "Google Drive Vault URL" },
        ].map(({ name, placeholder }) => (
          <input key={name} name={name} placeholder={placeholder} value={artistForm[name]} onChange={handleArtistFormChange} style={S.input} />
        ))}
        <button onClick={handleAddArtist} disabled={artistSubmitting} style={S.button}>
          {artistSubmitting ? "Adding..." : "Add Artist"}
        </button>
        <StatusMsg status={artistSubmitStatus} noun="Artist added" />
      </Section>

      <Section title="All Artists">
        {artists.map(a => (
          <Row key={a.id} label={`${a.display_name} (${a.id})`} sub={`Filter: ${a.filter_name}`}>
            <DangerBtn onClick={() => handleDeleteArtist(a.id)}>Delete</DangerBtn>
          </Row>
        ))}
      </Section>

      <Section title="Shortlink Generator">
        <input placeholder="short path (e.g. presskit)" value={shortlink} onChange={e => setShortlink(e.target.value)} style={S.input} />
        <input placeholder="full destination URL" value={destination} onChange={e => setDestination(e.target.value)} style={S.input} />
        <button onClick={copyToClipboard} style={S.button}>Copy Snippet</button>
        {copied && <p style={S.success}>Copied</p>}
        {shortlink && destination && <pre style={S.snippetBox}>{generateSnippet()}</pre>}
        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {Object.entries(linkMap).map(([slug, url]) => (
            <Row key={slug} label={slug} sub={url}>
              <GhostBtn onClick={() => handleCopySlug(slug)}>{copiedSlug === slug ? "Copied" : "Copy"}</GhostBtn>
            </Row>
          ))}
        </div>
      </Section>

      <Section title="All Releases">
        {releases.map(r => (
          <Row key={r.id} label={`${r.title} — ${r.artist}`} sub={r.date}>
            <DangerBtn onClick={() => handleDelete(r.id, r.title)}>Delete</DangerBtn>
          </Row>
        ))}
      </Section>

      <Section title={editingPost ? "Edit Press Post" : "New Press Post"}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
          <input name="title" placeholder="Title *" value={postForm.title}
            onChange={handlePostFieldChange} style={{ ...S.input, gridColumn: "1 / -1" }} />
          <input name="artist" placeholder="Artist tag (e.g. SHOWER)" value={postForm.artist}
            onChange={handlePostFieldChange} style={S.input} />
          <input name="date" placeholder="Date (YYYY-MM-DD)" value={postForm.date}
            onChange={handlePostFieldChange} style={S.input} />
          <input name="slug" placeholder="Slug (auto if blank)" value={postForm.slug}
            onChange={handlePostFieldChange} style={S.input} />
          <input name="cover_url" placeholder="Cover image URL" value={postForm.cover_url}
            onChange={handlePostFieldChange} style={S.input} />
          <input name="excerpt" placeholder="Excerpt / subtitle" value={postForm.excerpt}
            onChange={handlePostFieldChange} style={{ ...S.input, gridColumn: "1 / -1" }} />
        </div>

        <div style={{ marginTop: "16px" }}>
          <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.3, marginBottom: "8px" }}>Body</p>
          <RichEditor key={editingPost ? postForm.id : "new"} value={postForm.body} onChange={v => setPostForm(p => ({ ...p, body: v }))} />
        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
          <button onClick={handleSavePost} disabled={postSubmitting} style={S.button}>
            {postSubmitting ? "Saving..." : editingPost ? "Update Post" : "Publish Post"}
          </button>
          {editingPost && (
            <button onClick={() => { setEditingPost(false); setPostForm({ id: "", title: "", artist: "", cover_url: "", date: "", excerpt: "", body: "", slug: "" }); setPostSubmitStatus(null); }}
              style={{ ...S.button, borderColor: "#222", opacity: 0.45 }}>
              Cancel
            </button>
          )}
        </div>
        <StatusMsg status={postSubmitStatus} noun={editingPost ? "Post updated" : "Post published"} />
      </Section>

      <Section title="All Press Posts">
        {posts.length === 0 && <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.2em", opacity: 0.3, textTransform: "uppercase" }}>No posts yet.</p>}
        {posts.map(p => (
          <Row key={p.id} label={p.title} sub={`${p.artist || "—"} · ${p.date}`}>
            <a href={`/press/${p.slug}`} target="_blank" rel="noreferrer" style={ghostBtnStyle}>View</a>
            <GhostBtn onClick={() => handleEditPost(p)}>Edit</GhostBtn>
            <DangerBtn onClick={() => handleDeletePost(p.id, p.title)}>Delete</DangerBtn>
          </Row>
        ))}
      </Section>

    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: "60px" }}>
      <h2 style={{ fontFamily: F, fontSize: "10px", fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: "#f0ede8", opacity: 0.45, borderBottom: "1px solid #1a1a1a", paddingBottom: "12px", marginBottom: "20px" }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{children}</div>
    </section>
  );
}

function Row({ label, sub, children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", border: "1px solid #111", gap: "12px" }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: F, fontSize: "11px", letterSpacing: "0.05em", color: "#f0ede8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</p>
        {sub && <p style={{ fontFamily: F, fontSize: "10px", opacity: 0.35, marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</p>}
      </div>
      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>{children}</div>
    </div>
  );
}

const ghostBtnStyle = {
  fontFamily: F, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase",
  padding: "5px 10px", background: "transparent", border: "1px solid #2a2a2a",
  color: "#f0ede8", cursor: "pointer", textDecoration: "none", opacity: 0.7,
};

function GhostBtn({ onClick, children }) {
  return <button onClick={onClick} style={ghostBtnStyle}>{children}</button>;
}

function DangerBtn({ onClick, children }) {
  return <button onClick={onClick} style={{ ...ghostBtnStyle, borderColor: "#3a1a1a", color: "#ff6b6b", opacity: 1 }}>{children}</button>;
}

function StatusMsg({ status, noun }) {
  if (!status) return null;
  if (status === "success") return <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.2em", color: "#6bffb8", marginTop: "8px" }}>✓ {noun}</p>;
  if (status.startsWith("error:")) return <p style={{ fontFamily: F, fontSize: "10px", color: "#ff6b6b", marginTop: "8px" }}>{status.replace("error:", "")}</p>;
  return null;
}

const S = {
  container: { padding: "100px 24px 80px", maxWidth: "680px", margin: "0 auto", fontFamily: F, color: "#f0ede8", backgroundColor: "#000", minHeight: "100vh" },
  title: { fontFamily: F, fontSize: "10px", fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: "#f0ede8", marginBottom: "32px", opacity: 0.6 },
  input: { background: "transparent", color: "#f0ede8", padding: "11px 2px", fontFamily: F, fontSize: "11px", letterSpacing: "0.05em", border: "none", borderBottom: "1px solid #1e1e1e", outline: "none", width: "100%" },
  button: { padding: "11px 20px", background: "transparent", color: "#f0ede8", border: "1px solid #2a2a2a", fontFamily: F, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", cursor: "pointer", marginTop: "4px", alignSelf: "flex-start" },
  error: { color: "#ff6b6b", fontFamily: F, fontSize: "10px", letterSpacing: "0.1em", marginTop: "8px" },
  success: { color: "#6bffb8", fontFamily: F, fontSize: "10px", letterSpacing: "0.2em", marginTop: "8px" },
  snippetBox: { marginTop: "12px", background: "#080808", color: "#6bffb8", padding: "12px", fontFamily: "monospace", border: "1px solid #1a1a1a", fontSize: "12px", wordBreak: "break-word" },
};
