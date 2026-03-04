import React from 'react';
import { useParams, Link } from 'react-router-dom';

const uploadLinks = {
  shower: 'https://drive.google.com/drive/folders/1p3I41eppQKql17vzdD9i87WEIr-XHShH',
  ethel: 'https://drive.google.com/drive/folders/1XRYkgXSwyyL5TbkzKPDmdtPGb8sUW5bX',
  kizels: 'https://drive.google.com/drive/folders/1n0GhZZ8G2V269I9JM9V9nwxaZdXXT5La',
  sigh: 'https://drive.google.com/drive/folders/1ExzeNkW5aCpWGQYpa0V4jtPZEBh1VFyB',
  roy: 'https://drive.google.com/drive/folders/1UZm61m2oY6WL_C_cSliKf7IsuvKEYZ5D',
  sgulot: 'https://drive.google.com/drive/folders/1A4q1Ye3WEjE05HBhFKv4vGb_cWdOX0yp',
  stiki: 'https://drive.google.com/drive/folders/1zZI3YqR2jxc6dHGWst5Yh3fRfsKtCAiD?usp=sharing',
  yali: 'https://drive.google.com/drive/folders/1IBW6jSvoeU40ZvGB3euhCca--4YlAiDx?usp=sharing',
  guyku: 'https://drive.google.com/drive/folders/1_Y89A4rp6TShNH-6_d8hxCNrevWs95I_?usp=share_link',
  Romi: 'https://drive.google.com/drive/folders/1kzMJpdL8nfEPO1wUsGwSw0mWJa0e5r6n?usp=share_link',
  RIGSHI: 'https://drive.google.com/drive/folders/16W8SGZX_tUOJVwdGVL3xD1iRhTfVHGrZ?usp=share_link',
  BenDan: 'https://drive.google.com/drive/folders/1KM-dHnySbbdyGw1CZL_pe6qcF1WxXVfj?usp=sharing',
  Coco: 'https://drive.google.com/drive/folders/15xrOjYExLtjKb9oewXhV2hE-cbicLvna?usp=sharing',
  MaorBezalel: 'https://example.com/'
};

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
    href: null, // filled dynamically per artist
    external: true,
  },
  {
    id: 'releases',
    label: 'My Releases',
    icon: '♫',
    href: null, // filled dynamically per artist
    internal: true,
  },
];

export default function ArtistDashboard() {
  const { artistId } = useParams();
  const displayName = artistId.charAt(0).toUpperCase() + artistId.slice(1);
  const uploadURL = uploadLinks[artistId];

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Welcome, {displayName}</h2>

      <div style={gridStyle}>
        {folders.map((folder) => {
          let href = folder.href;
          if (folder.id === 'vault') href = uploadURL;
          if (folder.id === 'releases') href = `/releases?artist=${encodeURIComponent(artistId)}`;

          const commonStyle = folderStyle;

          if (folder.download) {
            return (
              <a key={folder.id} href={href} download style={commonStyle}
                onMouseEnter={e => applyHover(e)}
                onMouseLeave={e => removeHover(e)}
              >
                <span style={iconStyle}>{folder.icon}</span>
                <span style={labelStyle}>{folder.label}</span>
              </a>
            );
          }

          if (folder.internal) {
            return (
              <Link key={folder.id} to={href} style={commonStyle}
                onMouseEnter={e => applyHover(e)}
                onMouseLeave={e => removeHover(e)}
              >
                <span style={iconStyle}>{folder.icon}</span>
                <span style={labelStyle}>{folder.label}</span>
              </Link>
            );
          }

          return (
            <a key={folder.id} href={href} target="_blank" rel="noopener noreferrer" style={commonStyle}
              onMouseEnter={e => applyHover(e)}
              onMouseLeave={e => removeHover(e)}
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

const iconStyle = {
  fontSize: "28px",
  lineHeight: 1,
  opacity: 0.85,
};

const labelStyle = {
  fontSize: "0.9rem",
  fontWeight: 600,
  letterSpacing: "0.5px",
  opacity: 0.9,
};

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
