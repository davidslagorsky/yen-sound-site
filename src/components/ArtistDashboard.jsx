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
    sgulot: 'https://drive.google.com/drive/folders/1A4q1Ye3WEjE05HBhFKv4vGb_cWdOX0yp'
  };

  const displayName = artistId.charAt(0).toUpperCase() + artistId.slice(1);
  const uploadURL = uploadLinks[artistId];

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#000",
      color: "#fff",
      fontFamily: "Arial, sans-serif",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "40px",
      textAlign: "center"
    }}>
      <h2 style={{ fontSize: "clamp(1.8rem, 5vw, 2.5rem)", marginBottom: "30px" }}>
        Welcome, {displayName}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "300px" }}>
        <Link to="/artist-dashboard/submit" style={buttonStyle}>Submit a Release</Link>
        <a href={uploadURL} target="_blank" rel="noopener noreferrer" style={buttonStyle}>Upload Files</a>
        <a href="/docs/YEN_DISTRIBUTION_FORM.pdf" download style={buttonStyle}>Download Distribution Form</a>
      </div>

      <Link to="/" style={{ marginTop: "40px", textDecoration: "none" }}>
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "transparent",
            color: "#fff",
            border: "2px solid #fff",
            borderRadius: "5px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.3s ease-in-out"
          }}
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

const buttonStyle = {
  padding: "14px 24px",
  backgroundColor: "transparent",
  color: "#fff",
  border: "2px solid #fff",
  borderRadius: "5px",
  fontWeight: "bold",
  fontSize: "1rem",
  textDecoration: "none",
  transition: "all 0.3s ease-in-out"
};
