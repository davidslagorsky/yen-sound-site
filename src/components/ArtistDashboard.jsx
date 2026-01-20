import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ArtistDashboard() {
  const { artistId } = useParams();

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
    BenDan: 'https://drive.google.com/drive/folders/1KM-dHnySbbdyGw1CZL_pe6qcF1WxXVfj?usp=sharing'
  };

  const displayName = artistId.charAt(0).toUpperCase() + artistId.slice(1);
  const uploadURL = uploadLinks[artistId];

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>
        Welcome, {displayName}
      </h2>

      <div style={buttonGroupStyle}>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSe8rH0NRf1YBN-rD78uuzIoLxwZjJAl4qBKPn7tQ0hZeNr59w/viewform?usp=header"
          target="_blank"
          rel="noopener noreferrer"
          style={buttonStyle}
        >
          Submit a Release
        </a>
        <a href="/docs/YEN_DISTRIBUTION_FORM.pdf" download style={buttonStyle}>
          Download Distribution Form
        </a>
        <a href={uploadURL} target="_blank" rel="noopener noreferrer" style={buttonStyle}>
          Vault
        </a>
      </div>

      <Link to="/" style={{ marginTop: "40px", textDecoration: "none", width: "100%", maxWidth: "300px" }}>
        <button
          style={backButtonStyle}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#fff";
            e.currentTarget.style.color = "#000";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#fff";
          }}
        >
          ← Back to Home
        </button>
      </Link>
    </div>
  );
}

// 🔧 Styles
const containerStyle = {
  minHeight: "100vh",
  backgroundColor: "#000",
  color: "#fff",
  fontFamily: "Arial, sans-serif",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: "40px 20px",
  textAlign: "center",
};

const headingStyle = {
  fontSize: "clamp(1.8rem, 6vw, 2.5rem)",
  marginBottom: "30px"
};

const buttonGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  width: "100%",
  maxWidth: "300px"
};

const buttonStyle = {
  padding: "14px 24px",
  backgroundColor: "transparent",
  color: "#fff",
  border: "2px solid #fff",
  borderRadius: "5px",
  fontWeight: "bold",
  fontSize: "clamp(1rem, 3vw, 1.1rem)",
  textDecoration: "none",
  textAlign: "center",
  transition: "all 0.3s ease-in-out"
};

const backButtonStyle = {
  ...buttonStyle,
  width: "100%",
  marginTop: "20px",
  cursor: "pointer"
};
