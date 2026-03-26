import { Helmet } from "react-helmet-async";

const SITE_NAME  = "YEN SOUND";
const SITE_URL   = "https://yensound.com";
const DEFAULT_IMG = "https://yensound.com/yen sound white on black raw.png";
const DEFAULT_DESC = "Boutique PR & distribution for bold, boundary-pushing music. Based in Tel Aviv.";

export default function SEOMeta({ title, description, image, url, type = "website" }) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  const desc      = description || DEFAULT_DESC;
  const img       = image || DEFAULT_IMG;
  const canonical = url ? `${SITE_URL}${url}` : SITE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />

      {/* Open Graph */}
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:type"        content={type} />
      <meta property="og:url"         content={canonical} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image"       content={img} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image"       content={img} />

      {/* Canonical */}
      <link rel="canonical" href={canonical} />
    </Helmet>
  );
}
