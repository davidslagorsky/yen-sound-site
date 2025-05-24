import React, { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault(); // Prevents the automatic prompt
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      console.log("App installed");
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      left: 20,
      right: 20,
      background: "#000",
      color: "#fff",
      padding: "16px",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      textAlign: "center",
      zIndex: 1000,
    }}>
      <p style={{ margin: "0 0 8px" }}>Add YEN SOUND to your home screen for easy access!</p>
      <button
        onClick={handleClick}
        style={{
          background: "#fff",
          color: "#000",
          border: "none",
          padding: "10px 20px",
          borderRadius: "6px",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        Add to Home Screen
      </button>
    </div>
  );
}
