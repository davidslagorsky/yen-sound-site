import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ArtistDashboard() {
  const { artistId } = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArtist() {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('id', artistId)
        .single();
      if (!error && data) setArtist(data);
      setLoading(false);
    }
    fetchArtist();
  }, [artistId]);

  if (loading) {
    return (
      <div style={containerStyle}>
        <p style={{ opacity: 0.6 }}>Loading...</p>
      </div>
    );
  }

  if (!artist) {
    return (
      <div style={containerStyle}>
        <p style={{ opacity: 0.6 }}>Artist not found.</p>
        <Link to="/" style={{ color: "#fff", marginTop: 20 }}>← Back to Home</Link>
      </div>
    );
  }

  const folders = [
    {
      id: 'submit',
      label: 'Submit a Release',
      icon: '＋',
      href: 'https://docs.google.com/forms/d/e/1FAIpQLSe8rH0NRf1YBN-rD78uuzIoLxwZjJAl4qBKPn7tQ0hZeNr59w/viewform?usp=header',
      external: true,
    },
    {
      id: 'distribution',
      label: 'Distribution Form',
      icon: '↓',
      href: '/docs/YEN_DISTRIBUTION_FORM.pdf',
      download: true,
    },
    {
      id: 'vault',
      label: 'Vault',
      icon: '◈',
      href: artist.upload_url,
      external: true,
    },
    {
      id: 'releases',
      label: 'My Releases',
      icon: '♫',
      href: `/releases?artist=${encodeURIComponent(artist.filter_name || artistId)}`,
      internal: true,
    },
  ];

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Welcome, {artist.display_name}</h2>

      <div style={gridStyle}>
        {folders.map((folder) => {
          if (folder.download) {
            return (
              <a key={folder.id} href={folder.href} download style={folderStyle}
                onMouseEnter={e => applyHover(e)} onMouseLeave={e => removeHover(e)}
              >
                <span style={iconStyle}>{folder.icon}</span>
                <span style={labelStyle}>{folder.label}</span>
              </a>
            );
          }
          if (folder.internal) {
            return (
              <Link key={folder.id} to={folder.href} style={folderStyle}
                onMouseEnter={e => applyHover(e)} onMouseLeave={e => removeHover(e)}
              >
                <span style={iconStyle}>{folder.icon}</span>
                <span style={labelStyle}>{folder.label}</span>
              </Link>
            );
          }
          return (
            <a key={folder.id} href={folder.href} target="_blank" rel="noopener noreferrer" style={folderStyle}
              onMouseEnter={e => applyHover(e)} onMouseLeave={e => removeHover(e)}
            >
              <span style={iconStyle}>{folder.icon}</span>
              <span style={labelStyle}>{folder.label}</span>
            </a>
          );
        })}
      </div>

      <Link to="/" style={{ marginTop: "48px", textDecoration: "none" }}>
        <button style={backButtonStyle}
          onMouseOver={e => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.color = "#000"; }}
          onMouseOut={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#fff"; }}
        >
          ← Back to Home
        </button>
      </Link>
    </div>
  );
}

function applyHover(e) {
  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
  e.currentTarget.style.transform = "translateY(-3px)";
}
function removeHover(e) {
  e.currentTarget.style.backgroundColor = "transparent";
  e.currentTarget.style.transform = "translateY(0)";
}

const containerStyle = {
  minHeight: "100vh",
  backgroundColor: "#000",
  color: "#fff",
  fontFamily: "Arial, sans-serif",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: "60px 24px",
  textAlign: "center",
};
const headingStyle = {
  fontSize: "clamp(1.8rem, 6vw, 2.5rem)",
  fontWeight: 800,
  marginBottom: "48px",
  letterSpacing: "0.5px",
};
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "20px",
  width: "100%",
  maxWidth: "480px",
};
const folderStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  padding: "32px 16px",
  border: "1px solid rgba(255,255,255,0.3)",
  borderRadius: "12px",
  backgroundColor: "transparent",
  color: "#fff",
  textDecoration: "none",
  cursor: "pointer",
  transition: "background-color 0.2s ease, transform 0.2s ease",
  boxSizing: "border-box",
};
const iconStyle = { fontSize: "28px", lineHeight: 1, opacity: 0.85 };
const labelStyle = { fontSize: "0.9rem", fontWeight: 600, letterSpacing: "0.5px", opacity: 0.9 };
const backButtonStyle = {
  padding: "12px 28px",
  backgroundColor: "transparent",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.3)",
  borderRadius: "8px",
  fontWeight: "bold",
  fontSize: "0.95rem",
  cursor: "pointer",
  transition: "all 0.2s ease",
};
