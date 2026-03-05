import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "../supabase";

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export default function PostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      const { data, error } = await supabase
        .from("press_posts")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error || !data) setNotFound(true);
      else setPost(data);
      setLoading(false);
    }
    fetchPost();
  }, [slug]);

  if (loading) return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", padding: "120px 24px", fontFamily: F, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.3, color: "#f0ede8" }}>
      Loading...
    </div>
  );

  if (notFound) return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", padding: "120px 24px", fontFamily: F, color: "#f0ede8" }}>
      <Link to="/press" style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.4, color: "#f0ede8" }}>← Press</Link>
    </div>
  );

  const canonicalUrl = `https://www.yensound.com/press/${post.slug}`;

  return (
    <>
      <Helmet>
        <title>{post.title} — YEN SOUND</title>
        <meta name="description" content={post.excerpt || `${post.title} — YEN SOUND`} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${post.title} — YEN SOUND`} />
        <meta property="og:description" content={post.excerpt || ""} />
        <meta property="og:url" content={canonicalUrl} />
        {post.cover_url && <meta property="og:image" content={post.cover_url} />}
        <meta property="og:site_name" content="YEN SOUND" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} — YEN SOUND`} />
        <meta name="twitter:description" content={post.excerpt || ""} />
        {post.cover_url && <meta name="twitter:image" content={post.cover_url} />}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": post.title,
          "description": post.excerpt || "",
          "image": post.cover_url || "",
          "datePublished": post.date || "",
          "author": { "@type": "Organization", "name": "YEN SOUND" },
          "publisher": { "@type": "Organization", "name": "YEN SOUND", "url": "https://www.yensound.com" },
          "url": canonicalUrl,
        })}</script>
      </Helmet>

      <article style={{ backgroundColor: "#000", minHeight: "100vh", paddingTop: "60px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 24px 100px" }}>

          <Link to="/press" style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#f0ede8", opacity: 0.4, textDecoration: "none", display: "inline-block", marginBottom: "48px" }}>
            ← Press
          </Link>

          <div style={{ direction: "rtl", textAlign: "right", marginBottom: "36px" }}>
            <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.35, marginBottom: "10px" }}>
              {post.artist && <span>{post.artist} · </span>}{formatDate(post.date)}
            </p>
            <h1 style={{ fontFamily: F, fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 700, lineHeight: 1.1, color: "#f0ede8", marginBottom: "16px" }}>
              {post.title}
            </h1>
            {post.excerpt && (
              <p style={{ fontFamily: F, fontSize: "15px", fontWeight: 300, lineHeight: 1.7, color: "#f0ede8", opacity: 0.5, fontStyle: "italic" }}>
                {post.excerpt}
              </p>
            )}
          </div>

          {post.cover_url && (
            <div style={{ width: "100%", aspectRatio: "1", overflow: "hidden", marginBottom: "48px" }}>
              <img src={post.cover_url} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          )}

          <div
            className="press-body"
            dir="rtl"
            style={{ textAlign: "right" }}
            dangerouslySetInnerHTML={{ __html: post.body || "" }}
          />

          <div style={{ marginTop: "64px", paddingTop: "32px", borderTop: "1px solid #1a1a1a" }}>
            <Link to="/press" style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#f0ede8", opacity: 0.4, textDecoration: "none" }}>
              ← Press
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("he-IL", {
    day: "2-digit", month: "long", year: "numeric",
  });
}
