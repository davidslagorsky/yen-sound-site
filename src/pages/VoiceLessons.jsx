import React, { useMemo, useState, useEffect, useRef } from "react";
import "./VoiceLessons.css";
import { voiceContent } from "../content/voiceLessonsContent";

const HERO_IMG =
  "https://mcusercontent.com/f6bfdd76bde1d8b90b791aaa6/_compresseds/b2f081cd-ad76-4f1e-9048-873dba6ab494.jpg";

const TITLE_IMG = "https://i.postimg.cc/43ndG2YD/pytwh-qwl-bbt-ym.png";

function useRevealOnScroll() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      el.classList.add("isVisible");
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("isVisible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return ref;
}

export default function VoiceLessons() {
  const [lang, setLang] = useState("he");
  const t = useMemo(() => voiceContent[lang], [lang]);
  const isHebrew = lang === "he";

  const scrollToForm = () => {
    const el = document.getElementById("typeform-area");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToHow = () => {
    const el = document.getElementById("how-it-works");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // reveal refs
  const r1 = useRevealOnScroll();
  const r2 = useRevealOnScroll();
  const r3 = useRevealOnScroll();
  const r4 = useRevealOnScroll();
  const r5 = useRevealOnScroll();
  const r6 = useRevealOnScroll();

  return (
    <div className={`voiceFunnel ${isHebrew ? "rtl" : "ltr"}`}>
      {/* Top bar */}
      <div className="vfTop">
        <div className="vfLang">
          <button
            className={`vfLangBtn ${lang === "he" ? "active" : ""}`}
            onClick={() => setLang("he")}
            type="button"
          >
            עברית
          </button>
          <span className="vfSep">|</span>
          <button
            className={`vfLangBtn ${lang === "ru" ? "active" : ""}`}
            onClick={() => setLang("ru")}
            type="button"
          >
            Русский
          </button>
        </div>

        <button className="vfTopCta" onClick={scrollToForm} type="button">
          {t.ctaPrimary}
        </button>
      </div>

      {/* Hero */}
      <section className="vfHero">
        <div className="vfHeroImg" style={{ backgroundImage: `url(${HERO_IMG})` }} />
        <div className="vfHeroOverlay" />

        {/* Bottom shelf so the image stays visible */}
        <div className="vfHeroShelf heroEnter">
          {lang === "he" ? (
  <img
    className="vfTitleImg"
    src={TITLE_IMG}
    alt={t.title}
    loading="eager"
    draggable="false"
  />
) : (
  <h1 className="vfTitleText">{t.title}</h1>
)}


          <p className="vfSubtitle">{t.subtitle}</p>

          <div className="vfPills">
            {t.bulletsTop.map((b, i) => (
              <span key={i} className="vfPill">
                {b}
              </span>
            ))}
          </div>

          <div className="vfHeroBtns">
            <button className="vfBtnPrimary" onClick={scrollToForm} type="button">
              {t.ctaPrimary}
            </button>
            <button className="vfBtnGhost" onClick={scrollToHow} type="button">
              {t.ctaSecondary}
            </button>
          </div>
        </div>

        {/* Small scroll hint */}
        <div className="vfScrollHint" aria-hidden="true">
          <span className="vfScrollDot" />
        </div>
      </section>

      {/* Content */}
      <main className="vfWrap">
        <section ref={r1} className="vfSection accentPink">
          <div className="vfKicker">{isHebrew ? "מהות" : "Суть"}</div>
          <h2 className="vfH2 gradientTitle">{t.section1Title}</h2>
          <p className="vfText preline">{t.section1Text}</p>
        </section>

        <section ref={r2} className="vfSection accentPurple">
          <div className="vfKicker">{isHebrew ? "קהל יעד" : "Кому"}</div>
          <h2 className="vfH2 gradientTitle">{t.section2Title}</h2>
          <ul className="vfList">
            {t.section2List.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </section>

        <section ref={r3} className="vfSection accentBlue" id="how-it-works">
          <div className="vfKicker">{isHebrew ? "שלבים" : "Шаги"}</div>
          <h2 className="vfH2 gradientTitle">{t.section3Title}</h2>
          <div className="vfSteps">
            {t.section3Steps.map((s, i) => (
              <div key={i} className="vfStep">
                <div className="vfStepNum">{i + 1}</div>
                <div className="vfStepTitle">{s.title}</div>
                <div className="vfStepText">{s.text}</div>
              </div>
            ))}
          </div>
        </section>

        <section ref={r4} className="vfSection accentPink">
          <div className="vfKicker">{isHebrew ? "פרופיל" : "Профиль"}</div>
          <h2 className="vfH2 gradientTitle">{t.section4Title}</h2>
          <div className="vfAboutName">{t.section4Name}</div>
          <p className="vfText preline">{t.section4Text}</p>
        </section>

        <section ref={r5} className="vfSection accentPurple">
          <div className="vfKicker">{isHebrew ? "FAQ" : "FAQ"}</div>
          <h2 className="vfH2 gradientTitle">{t.faqTitle}</h2>
          <div className="vfFaq">
            {t.faq.map((item, i) => (
              <details key={i} className="vfFaqItem">
                <summary className="vfFaqQ">{item.q}</summary>
                <div className="vfFaqA">{item.a}</div>
              </details>
            ))}
          </div>
        </section>

        <section ref={r6} className="vfSection accentBlue" id="typeform-area">
          <div className="vfKicker">{isHebrew ? "הרשמה" : "Заявка"}</div>
          <h2 className="vfH2 gradientTitle">{t.formTitle}</h2>
          <div className="vfTypeformBox">
            <p className="vfTypeformNote">{t.formNote}</p>
          </div>
        </section>

        <footer className="vfFooter">{t.footer}</footer>
      </main>

      {/* Bottom sticky CTA (safe, no overlap) */}
      <div className="vfSticky">
        <button className="vfStickyBtn" onClick={scrollToForm} type="button">
          {t.ctaPrimary}
        </button>
      </div>
    </div>
  );
}
