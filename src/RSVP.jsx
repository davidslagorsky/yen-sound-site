import React, { useState, useRef, useEffect } from "react";
import "./RSVP.css";

export default function RSVP() {
  const [submitted, setSubmitted] = useState(false);
  const iframeRef = useRef(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    const onLoad = () => {
      if (submittingRef.current) {
        setSubmitted(true);
        submittingRef.current = false;
      }
    };
    if (iframe) iframe.addEventListener("load", onLoad);
    return () => iframe && iframe.removeEventListener("load", onLoad);
  }, []);

  return (
    <div className="rsvp-page dark">
      <div className="rsvp-card dark">
        {!submitted ? (
          <>
            <header className="rsvp-header">
              <h1 className="rsvp-title">SUMMER'S OVER</h1>

              {/* Details block (centered) */}
              <div className="rsvp-details">
                <p className="lines en" aria-label="lineup">
                  21.10.25<br />
                  BARAK ZVULUN<br />
                  SIGHDAFEKT<br />
                  MISHEL SHIMONOV
                </p>

                <p className="lines he" lang="he" dir="rtl" aria-label="hebrew details">
                  סט שקיעה<br />
                  עיבודים מיוחדים<br />
                  דלתות 17:00<br />
                  הופעה 18:00<br />
                  כתובת זמנית 21, תל אביב
                </p>

                <p className="note he" lang="he" dir="rtl">
                  נא הרשמו על פי כמות האנשים הרצויה
                </p>
              </div>
            </header>

            {/* Hidden iframe prevents navigation on submit */}
            <iframe
              ref={iframeRef}
              name="hidden_rsvp_iframe"
              title="hidden_rsvp_iframe"
              style={{ display: "none" }}
            />

            <form
              className="rsvp-form"
              action="https://docs.google.com/forms/d/e/1FAIpQLSdOubaN8gwWuGQDTTHlNbisjS-I7PnQqr0Q-Y5cYufa_D3Ojg/formResponse"
              method="POST"
              target="hidden_rsvp_iframe"
              onSubmit={() => (submittingRef.current = true)}
              acceptCharset="utf-8"
            >
              {/* Honeypot anti-spam */}
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
                    name="entry.1864820461" // ✅ correct ID
                    type="text"
                    required
                    placeholder="Your first name"
                    autoComplete="given-name"
                  />
                </label>

                <label>
                  <span>Last Name *</span>
                  <input
                    name="entry.429598730" // ✅ correct ID
                    type="text"
                    required
                    placeholder="Your last name"
                    autoComplete="family-name"
                  />
                </label>

                <label>
                  <span>Email *</span>
                  <input
                    name="entry.218426401" // ✅ correct ID
                    type="email"
                    required
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </label>

                <label>
                  <span>Phone *</span>
                  <input
                    name="entry.711459920" // ✅ correct ID
                    type="tel"
                    required
                    placeholder="+972 50 000 0000"
                    inputMode="tel"
                    pattern="[0-9+\-\s]{7,}"
                  />
                </label>

                <label>
                  <span>Guests *</span>
                  <select
                    name="entry.1950966565" // ✅ correct ID
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Choose…
                    </option>
                    {[...Array(10)].map((_, i) => {
                      const v = String(i + 1);
                      return (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      );
                    })}
                  </select>
                </label>
              </div>

              <button className="rsvp-btn" type="submit">RSVP</button>
            </form>
          </>
        ) : (
          <div className="rsvp-success">
            <h2>Thank you!</h2>
            <p>Your RSVP was received — we’ll be in touch soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
