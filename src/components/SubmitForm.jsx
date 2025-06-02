import React, { useEffect } from "react";

export default function SubmitForm() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//embed.typeform.com/next/embed.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#000",
      color: "#fff",
      fontFamily: "Arial, sans-serif",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "40px"
    }}>
      <div data-tf-live="01JWQVGWYWVZW7SCMJ5FZRY5C3" style={{ width: "100%", maxWidth: "700px" }}></div>
    </div>
  );
}
