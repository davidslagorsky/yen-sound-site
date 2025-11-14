import React, { useState, useEffect, useRef } from "react";
import "./Capsule001.css";

// currency helper
function fmt(n) {
  return new Intl.NumberFormat("en-IL", {
    style: "currency",
    currency: "ILS",
  }).format(n);
}

// product types (JS version)
const KEYCARD = {
  id: "keycard",
  name: "KEYCARD 001",
  price: 150, // not shown in UI
  images: ["https://i.postimg.cc/mgQYt3VJ/3dgifmaker63182.gif"],
  shopify: "https://example.com/keycard-001", // placeholder – replace later
  passwordProtected: true,
  password: "SHOWERBITCH",
};

const CATALOG = [
  {
    id: "tee",
    name: "ASHDOD SHIRT 001",
    price: 80,
    shopify: "https://sighbarbie.myshopify.com/products/ashdod-shirt-001",
    images: [
      "https://i.postimg.cc/L5txcZw7/mens-champion-t-shirt-black-front-69160d5b0435f.png",
      "https://i.postimg.cc/Z5RLcgYv/mens-champion-t-shirt-black-zoomed-in-69160d9b29197.png",
    ],
  },
  {
    id: "bandanna",
    name: "ASHDOD BANDANA 001",
    price: 50,
    shopify: "https://sighbarbie.myshopify.com/products/ashdod-bandana-001",
    images: [
      "https://i.postimg.cc/SRhrfxRZ/all-over-print-bandana-white-m-front-69160f30957a3.png",
      "https://i.postimg.cc/sxsYZH0r/all-over-print-bandana-white-m-product-details-69160f3095f6e.png",
    ],
  },
];

// intersection observer hook for fade-in
function useInView() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

export default function Capsule001() {
  return (
    <div className="capsule-root">
      {/* animated grainy background */}
      <div
        className="capsule-bg"
        style={{
          backgroundImage: "url('https://i.postimg.cc/G28MH8N8/image.gif')",
        }}
      />

      <div className="capsule-inner">
        {/* title */}
        <div className="capsule-title">
          <h1>ASHDOD CAPSULE 001</h1>
  <p className="capsule-subtext">
    LIMITED EDITION, CURATED BY YEN SOUND
  </p>
        </div>

        {/* triangle layout */}
        <main className="capsule-main">
          {/* top keycard */}
          <div className="keycard-wrapper">
            <Card product={KEYCARD} variant="single" />
          </div>

          {/* bottom row */}
          <div className="grid-row">
            {CATALOG.map((p) => (
              <Card key={p.id} product={p} variant="grid" />
            ))}
          </div>
        </main>

        {/* footer logo */}
        <footer className="capsule-footer">
          <a href="/" aria-label="Yen Sound Home">
            <img
              src="https://i.postimg.cc/FHrhnywm/web-footer.png"
              alt="Yen Sound"
            />
          </a>
        </footer>
      </div>
    </div>
  );
}

function Card({ product, variant }) {
  const [hover, setHover] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const mainImage = product.images?.[0];
  const hoverImage = product.images?.[1] ?? product.images?.[0];
  const { ref, visible } = useInView();

  const handlePasswordSubmit = () => {
    if (!product.password) return;
    if (passwordInput.trim().toUpperCase() === product.password.toUpperCase()) {
      setUnlocked(true);
    }
  };

  const isPassworded = product.passwordProtected;
  const showShopLink =
    product.shopify && (!isPassworded || (isPassworded && unlocked));

  const imgClass =
    variant === "single" ? "card-img card-img--single" : "card-img";

  return (
    <div
      ref={ref}
      className={
        "card " +
        (visible ? "card--visible" : "card--hidden")
      }
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="card-img-wrapper">
        <img
          src={hover ? hoverImage : mainImage}
          alt={product.name}
          className={imgClass}
        />
      </div>

      <div className="card-meta">
        <h3>{product.name}</h3>

        {product.id !== "keycard" && (
          <span className="card-price">{fmt(product.price)}</span>
        )}

        <span className="card-caption">Limited Drop</span>

        {/* password gate for keycard */}
        {isPassworded && !unlocked && (
          <div className="password-wrapper">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePasswordSubmit();
              }}
              placeholder="Password"
            />
          </div>
        )}

        {/* discreet shop link */}
        {showShopLink && (
          <a
            href={product.shopify}
            target="_blank"
            rel="noopener noreferrer"
            className="shop-link"
          >
            Shop ↗
          </a>
        )}
      </div>
    </div>
  );
}
