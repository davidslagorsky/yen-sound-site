import React from "react";

function Footer() {
  return (
    <footer style={{
      width: "100%",
      textAlign: "center",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: "12px",
      fontWeight: "300",
      letterSpacing: "0.5px",
      color: "#888",
      padding: "20px 0 10px 0",
      backgroundColor: "transparent",
      marginTop: "auto"
    }}>
      <img
        src="https://www.yensound.com/yen-logo.gif"
        alt="Spinning Yen Logo"
        style={{
          width: "40px",
          height: "40px",
          marginBottom: "10px"
        }}
      />
      <div>ALL RIGHTS RESERVED – YEN SOUND 2025</div>
    </footer>
  );
}

export default Footer;
