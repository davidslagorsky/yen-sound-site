import React, { useMemo } from "react";
import { Widget } from "@typeform/embed-react";
import "./RSVP.css";

export default function RSVP() {
  const formUrl = "https://jx4omz1zr14.typeform.com/to/lFmAFbIQ";

  // Optional hidden fields for basic tracking (arrive with each submission)
  const hidden = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      source: "yensound.com",
      r: document.referrer || "",
      utm_source: params.get("utm_source") || "",
      utm_campaign: params.get("utm_campaign") || "",
    };
  }, []);

  const handleSubmit = () => {
    // If you want a thank-you page, uncomment:
    // window.location.assign("/thanks");
  };

  return (
    <div className="rsvp-full">
      <Widget
        id={formUrl}                 // full URL or just the form ID
        style={{ width: "100%", height: "100%" }}
        className="rsvp-typeform"
        autoResize
        hideHeaders
        hideFooter
        onSubmit={handleSubmit}
        hidden={hidden}
        // If your form ever needs device access, uncomment:
        // iframeProps={{ allow: "camera; microphone; autoplay; encrypted-media" }}
      />
    </div>
  );
}
