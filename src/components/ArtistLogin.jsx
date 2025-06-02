import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const passwords = {
  showerbitch: 'shower',
  ethelpetel: 'ethel',
  kizelsink: 'kizels',
  sighmadethissite: 'sigh',
  royroyroy: 'roy',
  sgulothaifa: 'sgulot'
};

export default function ArtistLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwords[password]) {
      navigate(`/artist-dashboard/${passwords[password]}`);
    } else {
      setError('Invalid password');
    }
  };

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
      padding: "40px"
    }}>
      <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.5rem)", marginBottom: "20px" }}>
        Artist Login
      </h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "300px" }}>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "12px",
            fontSize: "1rem",
            borderRadius: "5px",
            border: "1px solid #ccc",
            backgroundColor: "#111",
            color: "#fff"
          }}
        />
        <button
          type="submit"
          style={{
            padding: "12px",
            backgroundColor: "transparent",
            color: "#fff",
            border: "2px solid #fff",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
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
          LOGIN
        </button>
        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </form>

      <Link to="/" style={{ marginTop: "30px", textDecoration: "none" }}>
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
