import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function AdminDashboard() {
  const [shortlink, setShortlink] = useState("");
  const [destination, setDestination] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [linkList, setLinkList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Load auth from localStorage
  useEffect(() => {
    if (localStorage.getItem("yenAdminAuthed") === "true") setAuth(true);
  }, []);

  // Load existing links
  useEffect(() => {
    if (auth) fetchLinks();
  }, [auth]);

  const fetchLinks = async () => {
    const { data } = await supabase.from("links").select("*").order("created_at", { ascending: false });
    setLinkList(data || []);
  };

  const handleLogin = () => {
    if (password === "password") {
      setAuth(true);
      localStorage.setItem("yenAdminAuthed", "true");
    } else {
      setError("Incorrect password");
    }
  };

  const handleSubmit = async () => {
    if (!shortlink || !destination) return;

    setLoading(true);
    const trimmedSlug = shortlink.trim();
    const trimmedUrl = destination.trim();

    if (editingId) {
      // Update existing
      await supabase.from("links").update({ slug: trimmedSlug, url: trimmedUrl }).eq("id", editingId);
    } else {
      // Insert new
      const { error } = await supabase.from("links").insert([{ slug: trimmedSlug, url: trimmedUrl }]);
      if (error && error.code === "23505") {
        alert("This shortlink already exists.");
      }
    }

    setShortlink("");
    setDestination("");
    setEditingId(null);
    setLoading(false);
    fetchLinks();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this link?")) {
      await supabase.from("links").delete().eq("id", id);
      fetchLinks();
    }
  };

  const handleEdit = (link) => {
    setShortlink(link.slug);
    setDestination(link.url);
    setEditingId(link.id);
  };

  if (!auth) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Admin Login</h2>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleLogin} style={styles.button}>
          Login
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Shortlink Manager</h2>

      <div style={styles.form}>
        <input
          type="text"
          placeholder="short path"
          value={shortlink}
          onChange={(e) => setShortlink(e.target.value)}
          style={styles.input}
        />
        <input
          type="url"
          placeholder="full destination URL"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleSubmit} disabled={loading} style={styles.button}>
          {editingId ? "Update" : "Save"}
        </button>
      </div>

      <div style={styles.list}>
        {linkList.map((link) => (
          <div key={link.id} style={styles.row}>
            <div style={styles.slug}>{link.slug}</div>
            <a href={link.url} target="_blank" rel="noreferrer" style={styles.url}>
              {link.url}
            </a>
            <div style={styles.actions}>
              <button onClick={() => handleEdit(link)} style={styles.smallBtn}>edit</button>
              <button onClick={() => handleDelete(link.id)} style={styles.smallBtn}>×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px 20px",
    maxWidth: "700px",
    margin: "auto",
    fontFamily: "Arial, sans-serif",
    color: "#fff"
  },
  title: {
    fontSize: "1.6rem",
    textAlign: "center",
    marginBottom: "30px",
    fontWeight: "normal",
    borderBottom: "1px solid #333",
    paddingBottom: "10px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "40px"
  },
  input: {
    background: "transparent",
    color: "#fff",
    padding: "10px",
    fontSize: "1rem",
    border: "1px solid #555",
    borderRadius: "4px"
  },
  button: {
    padding: "10px",
    background: "#fff",
    color: "#000",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    borderRadius: "4px",
    marginTop: "10px"
  },
  error: {
    color: "red",
    marginTop: "10px",
    textAlign: "center"
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  row: {
    display: "flex",
    flexDirection: "column",
    padding: "12px",
    border: "1px solid #333",
    borderRadius: "6px",
    backgroundColor: "#111"
  },
  slug: {
    fontWeight: "bold",
    fontSize: "1rem",
    marginBottom: "6px"
  },
  url: {
    fontSize: "0.9rem",
    color: "#ccc",
    textDecoration: "none",
    wordBreak: "break-all",
    marginBottom: "10px"
  },
  actions: {
    display: "flex",
    gap: "12px"
  },
  smallBtn: {
    fontSize: "0.8rem",
    padding: "6px 10px",
    backgroundColor: "transparent",
    border: "1px solid #666",
    color: "#fff",
    borderRadius: "4px",
    cursor: "pointer"
  }
};
