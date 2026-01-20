import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Redirector() {
  const { shortlink } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLink() {
      const { data } = await supabase
        .from("links")
        .select("url")
        .eq("slug", shortlink)
        .single();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
      }
    }

    fetchLink();
  }, [shortlink]);

  if (loading) {
    return (
      <p style={{ paddingTop: "100px", textAlign: "center" }}>
        🔄 Checking link...
      </p>
    );
  }

  return (
    <h1 style={{ paddingTop: "100px", textAlign: "center" }}>
      404 – Link Not Found
    </h1>
  );
}
