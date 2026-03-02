import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import linkMap from "./linkMap";

export default function AdminDashboard() {
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Shortlink generator
  const [shortlink, setShortlink] = useState("");
  const [destination, setDestination] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(null);

  // Releases
  const [releases, setReleases] = useState([]);

  // Add release form
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
    async function fetchReleases() {
      const { data } = await supabase
        .from("releases")
        .select("id, title, artist, date")
        .order("date", { ascending: false });
      if (data) setReleases(data);
    }
    fetchReleases();
  }, [auth]);

  const handleLogin = () => {
    if (password === "sighmadethissite") {
      setAuth(true);
      localStorage.setItem("yenAdminAuthed", "true");
    } else {
      setError("Incorrect password");
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    const { error } = await supabase.from("releases").delete().eq("id", id);
    if (!error) {
      setReleases((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert("Error deleting: " + error.message);
    }
  };

  const generateSnippet = () => `"${shortlink.trim()}": "${destination.trim()}"`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateSnippet()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopySlug = (slug) => {
    navigator.clipboard.writeText(`https://yensound.com/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 1500);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRelease = async () => {
    if (!form.title || !form.artist || !form.slug || !form.date) {
      setSubmitStatus("error:Please fill in Title, Artist, Slug and Date.");
      return;
    }
    setSubmitting(true);
    setSubmitStatus(null);

    const payload = {
      title: form.title,
      artist: form.artist,
      type: form.type,
      date: form.date,
      release_at: form.release_at || null,
      slug: form.slug,
      cover: form.cover || null,
      smart_link: form.smart_link || null,
      spotify_url: form.spotify_url || null,
      apple_url: form.apple_url || null,
      youtube_url: form.youtube_url || null,
      embed_youtube_id: form.embed_youtube_id || null,
      embed_spotify: form.embed_spotify || null,
      background_url: form.background_url || null,
      background_darken: parseFloat(form.background_darken) || 0.0,
      socials: {
        instagram: form.socials_instagram || "PLACEHOLDER",
        tiktok: form.socials_tiktok || "PLACEHOLDER",
        youtube: form.socials_youtube || "PLACEHOLDER",
        website: form.socials_website || "PLACEHOLDER",
      }
    };

    const { error } = await supabase.from("releases").insert([payload]);

    if (error) {
      setSubmitStatus("error:" + error.message);
    } else {
      setSubmitStatus("success");
      setReleases((prev) => [{ id: Date.now(), title: form.title, artist: form.artist, date: form.date }, ...prev]);
      setForm({
        title: "", artist: "", type: "Single", date: "", release_at: "",
        slug: "", cover: "", smart_link: "", spotify_url: "", apple_url: "",
        youtube_url: "", embed_youtube_id: "", embed_spotify: "",
        background_url: "", background_darken: 0.0,
        socials_instagram: "", socials_tiktok: "", socials_youtube: "", socials_website: ""
      });
    }
    setSubmitting(false);
  };

  if (!auth) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Admin Login</h2>
        <input type="password" placeholder="Enter password" value={password}
          onChange={(e) => setPassword(e.target.value)} style={styles.input} />
        <button onClick={handleLogin} style={styles.button}>Login</button>
        {error && <p style={styles.error}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* ── Add Release ── */}
      <h2 style={styles.title}>Add Release</h2>
      <div style={styles.form}>
        {[
          { name: "title", placeholder: "Title *" },
          { name: "artist", placeholder: "Artist * (e.g. SHOWER)" },
          { name: "slug", placeholder: "Slug * (e.g. bahaimhaele)" },
          { name: "date", placeholder: "Date * (YYYY-MM-DD)" },
          { name: "release_at", placeholder: "Release At (YYYY-MM-DD, for countdown)" },
          { name: "cover", placeholder: "Cover image URL" },
          { name: "smart_link", placeholder: "Smart Link (e.g. https://ffm.to/...)" },
          { name: "spotify_url", placeholder: "Spotify URL" },
          { name: "apple_url", placeholder: "Apple Music URL" },
          { name: "youtube_url", placeholder: "YouTube URL" },
          { name: "embed_youtube_id", placeholder: "YouTube Embed ID (e.g. dxHyjFmKwUg)" },
          { name: "embed_spotify", placeholder: "Spotify Embed URL" },
          { name: "background_url", placeholder: "Background GIF/image URL" },
          { name: "socials_instagram", placeholder: "Instagram URL" },
          { name: "socials_tiktok", placeholder: "TikTok URL" },
          { name: "socials_youtube", placeholder: "YouTube channel URL" },
          { name: "socials_website", placeholder: "Website URL" },
        ].map(({ name, placeholder }) => (
          <input key={name} name={name} placeholder={placeholder}
            value={form[name]} onChange={handleFormChange} style={styles.input} />
        ))}

        <select name="type" value={form.type} onChange={handleFormChange} style={styles.input}>
          <option value="Single">Single</option>
          <option value="Album">Album</option>
        </select>

        <button onClick={handleAddRelease} disabled={submitting} style={styles.button}>
          {submitting ? "Adding..." : "Add Release"}
        </button>

        {submitStatus === "success" && (
          <p style={styles.success}>✅ Release added successfully!</p>
        )}
        {submitStatus?.startsWith("error:") && (
          <p style={styles.error}>{submitStatus.replace("error:", "")}</p>
        )}
      </div>

      {/* ── Shortlink Generator ── */}
      <h2 style={{ ...styles.title, marginTop: "60px" }}>Shortlink Generator</h2>
      <div style={styles.form}>
        <input type="text" placeholder="short path (e.g. presskit)" value={shortlink}
          onChange={(e) => setShortlink(e.target.value)} style={styles.input} />
        <input type="url" placeholder="full destination URL" value={destination}
          onChange={(e) => setDestination(e.target.value)} style={styles.input} />
        <button onClick={copyToClipboard} style={styles.button}>Copy Snippet</button>
        {copied && <p style={styles.success}>Copied to clipboard</p>}
        {shortlink && destination && (
          <pre style={styles.snippetBox}>{generateSnippet()}</pre>
        )}
      </div>

      <h3 style={styles.subtitle}>Existing Links</h3>
      <div style={styles.list}>
        {Object.entries(linkMap).map(([slug, url]) => (
          <div key={slug} style={styles.row}>
            <div style={styles.linkHeader}>
              <span style={styles.slug}>{slug}</span>
              <button onClick={() => handleCopySlug(slug)} style={styles.copyButton}>
                {copiedSlug === slug ? "Copied" : "Copy URL"}
              </button>
            </div>
            <a href={url} target="_blank" rel="noreferrer" style={styles.url}>{url}</a>
          </div>
        ))}
      </div>

      {/* ── All Releases ── */}
      <h2 style={{ ...styles.title, marginTop: "60px" }}>All Releases</h2>
      <div style={styles.list}>
        {releases.map((r) => (
          <div key={r.id} style={styles.row}>
            <div style={styles.linkHeader}>
              <span style={styles.slug}>{r.title} — {r.artist}</span>
              <button
                onClick={() => handleDelete(r.id, r.title)}
                style={{ ...styles.copyButton, borderColor: "red", color: "red" }}
              >
                Delete
              </button>
            </div>
            <span style={{ color: "#aaa", fontSize: "0.85rem" }}>{r.date}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

const styles = {
  container: { padding: "40px 20px", maxWidth: "700px", margin: "auto", fontFamily: "Arial, sans-serif", color: "#fff" },
  title: { fontSize: "1.6rem", textAlign: "center", marginBottom: "30px", fontWeight: "normal", borderBottom: "1px solid #333", paddingBottom: "10px" },
  subtitle: { marginTop: "50px", fontSize: "1.2rem", borderBottom: "1px solid #444", paddingBottom: "10px" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { background: "transparent", color: "#fff", padding: "10px", fontSize: "1rem", border: "1px solid #555", borderRadius: "4px" },
  button: { padding: "10px", background: "black", color: "white", border: "1px solid white", fontWeight: "bold", cursor: "pointer", borderRadius: "4px", marginTop: "10px" },
  error: { color: "red", textAlign: "center", marginTop: "10px" },
  success: { color: "lightgreen", marginTop: "10px", textAlign: "center", fontSize: "0.9rem" },
  snippetBox: { marginTop: "20px", backgroundColor: "#111", color: "#0f0", padding: "10px", fontFamily: "monospace", border: "1px solid #333", borderRadius: "6px", fontSize: "0.95rem", wordBreak: "break-word" },
  list: { display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" },
  row: { display: "flex", flexDirection: "column", padding: "12px", border: "1px solid #333", borderRadius: "6px", backgroundColor: "#111" },
  linkHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" },
  slug: { fontWeight: "bold", fontSize: "1rem" },
  url: { fontSize: "0.9rem", color: "#ccc", textDecoration: "none", wordBreak: "break-all" },
  copyButton: { fontSize: "0.75rem", padding: "4px 10px", backgroundColor: "black", color: "white", border: "1px solid white", borderRadius: "4px", cursor: "pointer" }
};
