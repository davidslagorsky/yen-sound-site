import React, { useState, useRef, useEffect } from "react";
import "./RSVP.css";

export default function RSVP() {
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const iframeRef = useRef(null);
  const submittingRef = useRef(false);
  const loadCountRef = useRef(0);
  const submitFallbackRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const onLoad = () => {
      // Count every load event from the hidden iframe
      loadCountRef.current += 1;

      // If we submitted and we've seen at least 2 loads (about:blank + postback),
      // treat as success and clear any fallback.
      if (submittingRef.current && loadCountRef.current >= 2) {
        if (submitFallbackRef.current) {
          clearTimeout(submitFallbackRef.current);
          submitFallbackRef.current = null;
        }
        submittingRef.current = false;
        setSubmitted(true);
        document.body.classList.remove("rsvp-loading");
      }
    };

    iframe.addEventListener("load", onLoad);
    return () => {
      iframe.removeEventListener("load", onLoad);
      if (submitFallbackRef.current) {
        clearTimeout(submitFallbackRef.current);
        submitFallbackRef.current = null;
      }
    };
  }, []);

  const onSubmit = () => {
    // mark we are submitting
    submittingRef.current = true;
    document.body.classList.add("rsvp-loading");

    // reset the load counter for a fresh submit cycle
    loadCountRef.current = 1; // we already loaded about:blank once on mount

    // Fallback: if iframe response is blocked and no load fires, show success anyway
    // after a short delay. Adjust 2500–3500ms if needed.
    if (submitFallbackRef.current) clearTimeout(submitFallbackRef.current);
    submitFallbackRef.current = setTimeout(() => {
      if (submittingRef.current) {
        submittingRef.current = false;
        setSubmitted(true);
        document.body.classList.remove("rsvp-loading");
      }
    }, 1000);
  };

  /* ---------- Intro screen ---------- */
  if (!started) {
    return (
      <div className="rsvp-intro">
        <img
          src="https://iili.io/Kh68qbV.png"
          alt="Summer's Over Logo"
          className="intro-logo"
        />
        <button className="intro-btn" onClick={() => setStarted(true)}>
          RSVP
        </button>
      </div>
    );
  }

  /* ---------- Main form ---------- */
  return (
    <div className="rsvp-page dark fade-in">
      <div className="rsvp-card dark">
        {!submitted ? (
          <>
            <header className="rsvp-header">
              <img
                src="https://iili.io/Kh68qbV.png"
                alt="Summer's Over Logo"
                className="rsvp-logo"
              />
              <p className="rsvp-subtitle">RSVP to join us</p>

              <div className="rsvp-details">
                <p className="lines en">
                  BARAK ZVULUN<br />
                  SIGHDAFEKT<br />
                  MISHEL SHIMONOV
                </p>
                <p className="lines he" lang="he" dir="rtl">
                  21.10.25<br />
                  סט שקיעה<br />
                  עיבודים מיוחדים<br />
                  דלתות 17:00, הופעה 18:00<br />
                  כתובת זמנית 21, תל אביב
                </p>
                <p className="note he" lang="he" dir="rtl">
                  נא הרשמו על פי כמות האנשים הרצויה
                </p>
              </div>
            </header>

            <hr className="rsvp-divider" />

            {/* Hidden iframe (force an initial load so we can count reliably) */}
            <iframe
              ref={iframeRef}
              name="hidden_rsvp_iframe"
              title="hidden_rsvp_iframe"
              src="about:blank"
              style={{ display: "none" }}
            />

            <form
              className="rsvp-form"
              action="https://docs.google.com/forms/d/e/1FAIpQLSdOubaN8gwWuGQDTTHlNbisjS-I7PnQqr0Q-Y5cYufa_D3Ojg/formResponse"
              method="POST"
              target="hidden_rsvp_iframe"
              onSubmit={onSubmit}
              acceptCharset="utf-8"
            >
              {/* Honeypot */}
              <input
                type="text"
                name="website"
                tabIndex="-1"
                autoComplete="off"
                className="honeypot"
                aria-hidden="true"
              />

              <div className="rsvp-grid">
                <label>
                  <span>First Name *</span>
                  <input
                    name="entry.1864820461"
                    type="text"
                    required
                    placeholder="Your first name"
                    autoComplete="given-name"
                  />
                </label>

                <label>
                  <span>Last Name *</span>
                  <input
                    name="entry.429598730"
                    type="text"
                    required
                    placeholder="Your last name"
                    autoComplete="family-name"
                  />
                </label>

                <label>
                  <span>Email *</span>
                  <input
                    name="entry.218426401"
                    type="email"
                    required
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </label>

                <label>
                  <span>Phone *</span>
                  <input
                    name="entry.711459920"
                    type="tel"
                    required
                    placeholder="+972 50 000 0000"
                    inputMode="tel"
                    pattern="[0-9+\\-\\s]{7,}"
                  />
                </label>

                <label>
                  <span>Guests *</span>
                  <select name="entry.1950966565" required defaultValue="">
                    <option value="" disabled>Choose…</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </label>
              </div>

              <button className="rsvp-btn" type="submit">RSVP</button>
            </form>

            <p className="rsvp-footnote">
              Having trouble?{" "}
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSdOubaN8gwWuGQDTTHlNbisjS-I7PnQqr0Q-Y5cYufa_D3Ojg/viewform"
                target="_blank"
                rel="noreferrer"
              >
                Open the form in a new tab
              </a>.
            </p>
          </>
        ) : (
          <div className="rsvp-success">
            <h2 className="rsvp-success-title">You’re in</h2>
            <p className="rsvp-success-text">
              Thanks for RSVPing. We’ll be in touch with final details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
