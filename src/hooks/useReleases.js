import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export function useReleases() {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReleases() {
      const { data, error } = await supabase
        .from("releases")
        .select("*")
        .order("date", { ascending: false });

      if (!error) {
        setReleases(data.map(r => ({
          title: r.title,
          artist: r.artist,
          type: r.type,
          date: r.date,
          releaseAt: r.release_at,
          slug: r.slug,
          cover: r.cover,
          smartLink: r.smart_link,
          spotifyUrl: r.spotify_url,
          appleUrl: r.apple_url,
          youtubeUrl: r.youtube_url,
          embedYoutubeId: r.embed_youtube_id,
          embedSpotify: r.embed_spotify,
          background: r.background_url ? { url: r.background_url } : null,
          socials: r.socials,
        })));
      }
      setLoading(false);
    }

    fetchReleases();
  }, []);

  return { releases, loading };
}
