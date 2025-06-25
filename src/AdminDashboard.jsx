import { useState, useEffect } from "react";
import linkMap from "./linkMap";

export default function AdminDashboard() {
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [shortlink, setShortlink] = useState("");
  const [destination, setDestination] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("yenAdminAuthed") === "true") setAuth(true);
  }, []);

  const handleLogin = () => {
    if (password === "password") {
      setAuth(true);
      localStorage.setItem("yenAdminAuthed", "true");
    } else {
      setError("Incorrect password");
    }
  };

  const generateSnippet = () => {
    return `"${shortlink.trim()}": "${destination.trim()}"`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateSnippet()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopySlug = (slug) => {
    const fullURL = `https://yensound.com/${slug}`;
    navigator.clipboard.writeText(fullURL);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 1500);
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
      <h2 style={styles.title}>Shortlink Generator</h2>

      <div style={styles.form}>
        <input
          type="text"
          placeholder="short path (e.g. presskit)"
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
        <button onClick={copyToClipboard} style={styles.button}>
          Copy Snippet
        </button>
        {copied && <p style={styles.success}>Copied to clipboard</p>}
        {shortlink && destination && (
          <pre style={styles.snippetBox}>
            {generateSnippet()}
          </pre>
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
            <a href={url} target="_blank" rel="noreferrer" style={styles.url}>
              {url}
            </a>
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
  subtitle: {
    marginTop: "50px",
    fontSize: "1.2rem",
    borderBottom: "1px solid #444",
    paddingBottom: "10px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
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
    background: "black",
    color: "white",
    border: "1px solid white",
    fontWeight: "bold",
    cursor: "pointer",
    borderRadius: "4px",
    marginTop: "10px"
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: "10px"
  },
  success: {
    color: "lightgreen",
    marginTop: "10px",
    textAlign: "center",
    fontSize: "0.9rem"
  },
  snippetBox: {
    marginTop: "20px",
    backgroundColor: "#111",
    color: "#0f0",
    padding: "10px",
    fontFamily: "monospace",
    border: "1px solid #333",
    borderRadius: "6px",
    fontSize: "0.95rem",
    wordBreak: "break-word"
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginTop: "20px"
  },
  row: {
    display: "flex",
    flexDirection: "column",
    padding: "12px",
    border: "1px solid #333",
    borderRadius: "6px",
    backgroundColor: "#111"
  },
  linkHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px"
  },
  slug: {
    fontWeight: "bold",
    fontSize: "1rem"
  },
  url: {
    fontSize: "0.9rem",
    color: "#ccc",
    textDecoration: "none",
    wordBreak: "break-all"
  },
  copyButton: {
    fontSize: "0.75rem",
    padding: "4px 10px",
    backgroundColor: "black",
    color: "white",
    border: "1px solid white",
    borderRadius: "4px",
    cursor: "pointer"
  }
};
