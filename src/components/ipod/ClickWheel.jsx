import React from "react";

export default function ClickWheel({ onScroll, onSelect, onMenu }) {
  const handleClick = (action) => {
    if (action === "menu") onMenu();
    else if (action === "left") onScroll("up");
    else if (action === "right") onScroll("down");
    else if (action === "select") onSelect();
  };

  return (
    <div
      style={{
        width: "180px",
        height: "180px",
        borderRadius: "50%",
        background: "radial-gradient(circle at center, #eee 0%, #ccc 100%)",
        boxShadow: "inset 0 2px 5px rgba(0,0,0,0.2)",
        position: "relative",
        touchAction: "manipulation",
        fontFamily: "'Helvetica Neue', sans-serif",
      }}
    >
      {/* MENU (Top) */}
      <div
        onClick={() => handleClick("menu")}
        style={{
          position: "absolute",
          top: "12px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "12px",
          fontWeight: "bold",
          color: "#555",
          userSelect: "none",
          cursor: "pointer",
        }}
      >
        MENU
      </div>

      {/* LEFT (Rewind/Previous) */}
      <div
        onClick={() => handleClick("left")}
        style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "16px",
          color: "#444",
          userSelect: "none",
          cursor: "pointer",
        }}
      >
        ◀◀
      </div>

      {/* RIGHT (Fast Forward/Next) */}
      <div
        onClick={() => handleClick("right")}
        style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "16px",
          color: "#444",
          userSelect: "none",
          cursor: "pointer",
        }}
      >
        ▶▶
      </div>

      {/* BOTTOM (Play/Pause) */}
      <div
        onClick={() => handleClick("select")}
        style={{
          position: "absolute",
          bottom: "12px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "12px",
          color: "#555",
          userSelect: "none",
          cursor: "pointer",
        }}
      >
        ⏯
      </div>

      {/* SELECT Button */}
      <div
        onClick={() => handleClick("select")}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "70px",
          height: "70px",
          background: "radial-gradient(circle at center, #ddd 0%, #bbb 100%)",
          borderRadius: "50%",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
          cursor: "pointer",
        }}
      />
    </div>
  );
}
