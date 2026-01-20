import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const passwords = {
  s8shower888: 'shower',
  ethelpetel: 'ethel',
  kizelspink: 'kizels',
  sighmadethissite: 'sigh',
  royroyroy: 'roy',
  sgulothaifa: 'sgulot',
  stikiwiththestick: 'stiki',
  yalifromtheblock: 'yali',
  guykuguykumusic: 'guyku',
  romirothromiroth: 'Romi',
  bigrigshi2025: 'RIGSHI',
  bendanlegend: 'BenDan'
};

export default function ArtistLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fadeIn, setFadeIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 10); // delay ensures transition triggers
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwords[password]) {
      navigate(`/artist-dashboard/${passwords[password]}`);
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div style={{ ...containerStyle, ...(fadeIn ? fadeInStyle : {}) }}>
      <h1 style={headingStyle}>Artist Login</h1>

      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button
          type="submit"
          style={buttonStyle}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#fff";
            e.currentTarget.style.color = "#000";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#fff";
          }}
        >
          LOGIN
        </button>

        {error && <p style={errorStyle}>{error}</p>}
      </form>

      <Link to="/" style={{ marginTop: "30px", textDecoration: "none", width: "100%", maxWidth: "300px" }}>
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
  opacity: 0,
  transform: "translateY(20px)",
  transition: "opacity 0.6s ease-out, transform 0.6s ease-out"
};

const fadeInStyle = {
  opacity: 1,
  transform: "translateY(0)"
};

const headingStyle = {
  fontSize: "clamp(1.8rem, 6vw, 2.5rem)",
  marginBottom: "20px"
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  width: "100%",
  maxWidth: "300px"
};

const inputStyle = {
  padding: "12px",
  fontSize: "1rem",
  borderRadius: "5px",
  border: "1px solid #ccc",
  backgroundColor: "#111",
  color: "#fff"
};

const buttonStyle = {
  padding: "12px",
  backgroundColor: "transparent",
  color: "#fff",
  border: "2px solid #fff",
  borderRadius: "5px",
  fontWeight: "bold",
  fontSize: "clamp(1rem, 3vw, 1.1rem)",
  cursor: "pointer",
  transition: "all 0.3s ease-in-out"
};

const backButtonStyle = {
  ...buttonStyle,
  width: "100%",
  marginTop: "20px"
};

const errorStyle = {
  color: "red",
  fontSize: "0.95rem",
  marginTop: "10px"
};
