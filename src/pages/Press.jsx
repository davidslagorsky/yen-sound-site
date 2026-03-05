import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "../supabase";

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export default function Press() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from("press_posts")
        .select("id, title, artist, cover_url, date, excerpt, slug")
        .order("date", { ascending: false });
      if (error) {
        console.error("Press fetch error:", error);
        setError(error.message);
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    }
    fetchPosts();
  }, []);

  return (
    <>
      <Helmet>
        <title>Press — YEN SOUND</title>
        <meta name="description" content="כתבות, פיצ'רים ועדכונים מאמני YEN SOUND." />
        <meta property="og:title" content="Press — YEN SOUND" />
        <meta property="og:description" content="כתבות, פיצ'רים ועדכונים מאמני YEN SOUND." />
      </Helmet>

      <div style={{ backgroundColor: "#000", minHeight: "100vh", paddingTop: "60px" }}>

        <div style={{ padding: "24px 20px", borderBottom: "1px solid #1a1a1a" }}>
          <h1 style={{ fontFamily: F, fontSize: "11px", fontWeight: 400, letterSpacing: "0.3em", textTransform: "uppercase", color: "#f0ede8", opacity: 0.4 }}>
            Press
          </h1>
        </div>

        {loading && (
          <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.3, padding: "40px 20px" }}>
            Loading...
          </p>
        )}

        {!loading && error && (
          <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.15em", color: "#ff6b6b", padding: "40px 20px" }}>
            Error: {error}
          </p>
        )}

        {!loading && !error && posts.length === 0 && (
          <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.3, padding: "40px 20px" }}>
            No posts yet.
          </p>
        )}

        {!loading && !error && posts.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "0" }}>
            {posts.map((post) => (
              <Link key={post.id} to={`/press/${post.slug}`} style={{ textDecoration: "none", color: "#f0ede8" }}>
                <article style={{ borderRight: "1px solid #111", borderBottom: "1px solid #111" }}>
                  {post.cover_url && (
                    <div style={{ width: "100%", aspectRatio: "1", overflow: "hidden", background: "#111" }}>
                      <img
                        src={post.cover_url}
                        alt={post.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s ease" }}
                        onMouseOver={e => e.currentTarget.style.transform = "scale(1.03)"}
                        onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                      />
                    </div>
                  )}
                  <div style={{ padding: "18px 16px", direction: "rtl", textAlign: "right" }}>
                    <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.35, marginBottom: "7px" }}>
                      {post.artist && <span>{post.artist} · </span>}{formatDate(post.date)}
                    </p>
                    <h2 style={{ fontFamily: F, fontSize: "15px", fontWeight: 700, lineHeight: 1.3, marginBottom: "8px" }}>
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p style={{ fontFamily: F, fontSize: "12px", fontWeight: 300, lineHeight: 1.7, opacity: 0.5,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("he-IL", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
