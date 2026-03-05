import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const ICON_MAP = {
  spotify: '◎', apple: '◈', youtube: '▶', instagram: '◻', tiktok: '◇',
  soundcloud: '◉', bandcamp: '◆', link: '→', custom: '＋',
};

/* ── tiny helpers ── */
function Label({ children }) {
  return (
    <p style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.35, marginBottom: '8px' }}>
      {children}
    </p>
  );
}
function Input({ value, onChange, placeholder, style = {} }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', boxSizing: 'border-box',
        background: 'transparent', border: '1px solid rgba(240,237,232,0.2)',
        color: '#f0ede8', fontFamily: F, fontSize: '11px', letterSpacing: '0.05em',
        padding: '10px 12px', outline: 'none',
        transition: 'border-color 0.15s',
        ...style,
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(240,237,232,0.6)'}
      onBlur={e => e.target.style.borderColor = 'rgba(240,237,232,0.2)'}
    />
  );
}
function Textarea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%', boxSizing: 'border-box', resize: 'vertical',
        background: 'transparent', border: '1px solid rgba(240,237,232,0.2)',
        color: '#f0ede8', fontFamily: F, fontSize: '11px', letterSpacing: '0.05em',
        padding: '10px 12px', outline: 'none', lineHeight: 1.6,
        transition: 'border-color 0.15s',
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(240,237,232,0.6)'}
      onBlur={e => e.target.style.borderColor = 'rgba(240,237,232,0.2)'}
    />
  );
}

/* ── section wrapper ── */
function Section({ title, children }) {
  return (
    <div style={{ borderTop: '1px solid #1a1a1a', padding: '32px 24px' }}>
      <p style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', opacity: 0.25, marginBottom: '24px', textAlign: 'center' }}>
        {title}
      </p>
      {children}
    </div>
  );
}

/* ── save button ── */
function SaveBtn({ onClick, status }) {
  const label = status === 'saving' ? 'Saving...' : status === 'saved' ? '✓ Saved' : status === 'error' ? 'Error' : 'Save';
  const opacity = status === 'saved' ? 0.5 : 1;
  return (
    <button onClick={onClick} style={{
      display: 'block', width: '100%', marginTop: '20px',
      padding: '16px 24px', border: '2px solid rgba(240,237,232,0.8)',
      background: 'transparent', color: '#f0ede8', fontFamily: F,
      fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase',
      cursor: 'pointer', transition: 'background 0.15s', opacity,
    }}
      onMouseOver={e => { if (status !== 'saving') e.currentTarget.style.background = '#111'; }}
      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
    >
      {label}
    </button>
  );
}

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
export default function ArtistDashboard() {
  const { artistId } = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  /* editor state */
  const [bio, setBio] = useState('');
  const [customButtons, setCustomButtons] = useState([]); // [{label, url, icon}]
  const [embedUrl, setEmbedUrl] = useState('');
  const [activeTab, setActiveTab] = useState(null); // null | 'bio' | 'buttons' | 'embed'

  /* save status per section */
  const [bioStatus, setBioStatus] = useState('idle');
  const [btnStatus, setBtnStatus] = useState('idle');
  const [embedStatus, setEmbedStatus] = useState('idle');

  useEffect(() => {
    async function fetchArtist() {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('id', artistId)
        .single();
      if (!error && data) {
        setArtist(data);
        setBio(data.bio || '');
        setCustomButtons(data.custom_buttons || []);
        setEmbedUrl(data.embed_url || '');
      }
      setLoading(false);
    }
    fetchArtist();
  }, [artistId]);

  /* ── savers ── */
  async function saveBio() {
    setBioStatus('saving');
    const { error } = await supabase.from('artists').update({ bio }).eq('id', artistId);
    setBioStatus(error ? 'error' : 'saved');
    setTimeout(() => setBioStatus('idle'), 2000);
  }
  async function saveButtons() {
    setBtnStatus('saving');
    const { error } = await supabase.from('artists').update({ custom_buttons: customButtons }).eq('id', artistId);
    setBtnStatus(error ? 'error' : 'saved');
    setTimeout(() => setBtnStatus('idle'), 2000);
  }
  async function saveEmbed() {
    setEmbedStatus('saving');
    const { error } = await supabase.from('artists').update({ embed_url: embedUrl }).eq('id', artistId);
    setEmbedStatus(error ? 'error' : 'saved');
    setTimeout(() => setEmbedStatus('idle'), 2000);
  }

  /* ── button helpers ── */
  function addButton() {
    setCustomButtons(prev => [...prev, { label: '', url: '', icon: 'link' }]);
  }
  function updateButton(i, field, val) {
    setCustomButtons(prev => prev.map((b, idx) => idx === i ? { ...b, [field]: val } : b));
  }
  function removeButton(i) {
    setCustomButtons(prev => prev.filter((_, idx) => idx !== i));
  }
  function moveButton(i, dir) {
    setCustomButtons(prev => {
      const arr = [...prev];
      const swap = i + dir;
      if (swap < 0 || swap >= arr.length) return arr;
      [arr[i], arr[swap]] = [arr[swap], arr[i]];
      return arr;
    });
  }

  /* ── loading / error states ── */
  if (loading) return (
    <div style={centered}>
      <p style={{ fontFamily: F, fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.3, color: '#f0ede8' }}>Loading</p>
    </div>
  );
  if (!artist) return (
    <div style={centered}>
      <p style={{ fontFamily: F, fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.4, color: '#f0ede8' }}>Artist not found</p>
      <Link to="/" style={{ color: '#f0ede8', fontFamily: F, fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: '24px', opacity: 0.35 }}>← Home</Link>
    </div>
  );

  const folders = [
    { id: 'submit', label: 'Submit a Release', icon: '＋', href: 'https://docs.google.com/forms/d/e/1FAIpQLSe8rH0NRf1YBN-rD78uuzIoLxwZjJAl4qBKPn7tQ0hZeNr59w/viewform?usp=header', external: true },
    { id: 'distribution', label: 'Distribution Form', icon: '↓', href: '/docs/YEN_DISTRIBUTION_FORM.pdf', download: true },
    { id: 'vault', label: 'Vault', icon: '◈', href: artist.upload_url, external: true },
    { id: 'releases', label: 'My Releases', icon: '♫', href: `/releases?artist=${encodeURIComponent(artist.filter_name || artistId)}`, internal: true },
  ];

  const tabs = [
    { id: 'bio', label: 'Bio Text' },
    { id: 'buttons', label: 'Custom Buttons' },
    { id: 'embed', label: 'Embed' },
  ];

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#f0ede8', maxWidth: '600px', margin: '0 auto' }}>

      {/* ── Spinning logo + marquee ── */}
      <div style={{ paddingTop: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <img src="/spinning yen logo white.gif" alt="YEN SOUND" className="yen-spin"
            style={{ width: '52px', height: '52px', opacity: 0.55 }} />
        </div>
        <div style={{ overflow: 'hidden', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', padding: '7px 0' }}>
          <div style={{ display: 'inline-flex', animation: 'marquee 18s linear infinite', whiteSpace: 'nowrap' }}>
            {Array(6).fill('YEN SOUND ®   ').map((t, i) => (
              <span key={i} style={{ fontFamily: F, fontSize: '9px', fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', opacity: 0.25, paddingRight: '40px' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Welcome heading ── */}
      <div style={{ padding: '40px 24px 32px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: F, fontSize: '17px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f0ede8', marginBottom: '6px' }}>
          Welcome, {artist.display_name}
        </h1>
        <p style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.25 }}>
          Artist Dashboard
        </p>
      </div>

      {/* ── Quick-access grid ── */}
      <div style={{ padding: '0 24px 8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {folders.map(folder => {
            const inner = (
              <>
                <span style={{ fontSize: '22px', lineHeight: 1, opacity: 0.7, marginBottom: '10px', display: 'block' }}>{folder.icon}</span>
                <span style={{ fontFamily: F, fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.85 }}>{folder.label}</span>
              </>
            );
            const base = {
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '28px 16px', border: '1px solid rgba(240,237,232,0.15)',
              color: '#f0ede8', textDecoration: 'none', cursor: 'pointer',
              transition: 'border-color 0.2s, background 0.2s', background: 'transparent',
            };
            const hov = e => { e.currentTarget.style.borderColor = 'rgba(240,237,232,0.5)'; e.currentTarget.style.background = '#0a0a0a'; };
            const unHov = e => { e.currentTarget.style.borderColor = 'rgba(240,237,232,0.15)'; e.currentTarget.style.background = 'transparent'; };
            if (folder.download) return <a key={folder.id} href={folder.href} download style={base} onMouseEnter={hov} onMouseLeave={unHov}>{inner}</a>;
            if (folder.internal) return <Link key={folder.id} to={folder.href} style={base} onMouseEnter={hov} onMouseLeave={unHov}>{inner}</Link>;
            if (!folder.href) return <div key={folder.id} style={{ ...base, opacity: 0.3, cursor: 'default' }}>{inner}</div>;
            return <a key={folder.id} href={folder.href} target="_blank" rel="noopener noreferrer" style={base} onMouseEnter={hov} onMouseLeave={unHov}>{inner}</a>;
          })}
        </div>
      </div>

      {/* ── My Page editor ── */}
      <div style={{ margin: '32px 24px 0', borderTop: '1px solid #1a1a1a', paddingTop: '32px' }}>
        <p style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', opacity: 0.25, textAlign: 'center', marginBottom: '20px' }}>
          My Page
        </p>

        {/* tab row */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1a1a1a' }}>
          {tabs.map(t => {
            const active = activeTab === t.id;
            return (
              <button key={t.id}
                onClick={() => setActiveTab(active ? null : t.id)}
                style={{
                  flex: 1, padding: '14px 8px', background: 'transparent',
                  border: 'none', borderBottom: active ? '2px solid rgba(240,237,232,0.8)' : '2px solid transparent',
                  color: '#f0ede8', fontFamily: F, fontSize: '9px', fontWeight: 700,
                  letterSpacing: '0.25em', textTransform: 'uppercase',
                  cursor: 'pointer', opacity: active ? 1 : 0.35,
                  transition: 'opacity 0.15s, border-color 0.15s',
                  marginBottom: '-1px',
                }}
                onMouseOver={e => { if (!active) e.currentTarget.style.opacity = 0.7; }}
                onMouseOut={e => { if (!active) e.currentTarget.style.opacity = 0.35; }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── Bio panel ── */}
        {activeTab === 'bio' && (
          <div style={{ padding: '24px 0' }}>
            <Label>Bio Text — shown on your artist page</Label>
            <Textarea
              value={bio}
              onChange={setBio}
              placeholder="Write a short bio about yourself..."
              rows={6}
            />
            <SaveBtn onClick={saveBio} status={bioStatus} />
          </div>
        )}

        {/* ── Custom Buttons panel ── */}
        {activeTab === 'buttons' && (
          <div style={{ padding: '24px 0' }}>
            <Label>Custom buttons — appear on your artist page after the platform links</Label>

            {customButtons.map((btn, i) => (
              <div key={i} style={{ marginBottom: '16px', padding: '16px', border: '1px solid rgba(240,237,232,0.1)' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <Label>Label</Label>
                    <Input value={btn.label} onChange={v => updateButton(i, 'label', v)} placeholder="e.g. BANDCAMP" />
                  </div>
                  <div style={{ width: '90px' }}>
                    <Label>Icon</Label>
                    <select value={btn.icon || 'link'} onChange={e => updateButton(i, 'icon', e.target.value)}
                      style={{ width: '100%', background: '#0a0a0a', border: '1px solid rgba(240,237,232,0.2)', color: '#f0ede8', fontFamily: F, fontSize: '11px', padding: '10px 8px', cursor: 'pointer', outline: 'none' }}>
                      {Object.entries(ICON_MAP).map(([k, v]) => (
                        <option key={k} value={k}>{v} {k}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Label>URL</Label>
                <Input value={btn.url} onChange={v => updateButton(i, 'url', v)} placeholder="https://..." />
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
                  <button onClick={() => moveButton(i, -1)} style={smallBtn} title="Move up">↑</button>
                  <button onClick={() => moveButton(i, 1)} style={smallBtn} title="Move down">↓</button>
                  <button onClick={() => removeButton(i)} style={{ ...smallBtn, color: 'rgba(240,100,100,0.7)' }}>Remove</button>
                </div>
              </div>
            ))}

            <button onClick={addButton} style={{ ...smallBtn, width: '100%', padding: '14px', marginBottom: '4px', border: '1px dashed rgba(240,237,232,0.2)', letterSpacing: '0.2em' }}>
              ＋ Add Button
            </button>
            <SaveBtn onClick={saveButtons} status={btnStatus} />
          </div>
        )}

        {/* ── Embed panel ── */}
        {activeTab === 'embed' && (
          <div style={{ padding: '24px 0' }}>
            <Label>Embed URL — paste a Spotify, YouTube, or SoundCloud link</Label>
            <Input
              value={embedUrl}
              onChange={setEmbedUrl}
              placeholder="https://open.spotify.com/track/... or youtube.com/watch?v=..."
            />
            {embedUrl && (
              <div style={{ marginTop: '16px', opacity: 0.4 }}>
                <Label>Preview</Label>
                <EmbedPreview url={embedUrl} />
              </div>
            )}
            <SaveBtn onClick={saveEmbed} status={embedStatus} />
          </div>
        )}
      </div>

      {/* ── View my page link ── */}
      <div style={{ padding: '32px 24px', textAlign: 'center' }}>
        {artist.slug && (
          <a href={`/artist/${artist.slug}`} target="_blank" rel="noreferrer"
            style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#f0ede8', opacity: 0.3, textDecoration: 'none', display: 'inline-block', marginBottom: '24px', transition: 'opacity 0.2s' }}
            onMouseOver={e => e.currentTarget.style.opacity = 0.8}
            onMouseOut={e => e.currentTarget.style.opacity = 0.3}>
            View My Page →
          </a>
        )}
      </div>

      {/* ── Back to home ── */}
      <div style={{ padding: '0 24px 60px', textAlign: 'center', borderTop: '1px solid #1a1a1a' }}>
        <Link to="/" style={{ background: 'none', border: 'none', color: '#f0ede8', cursor: 'pointer', fontFamily: F, fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', opacity: 0.25, textDecoration: 'none', display: 'inline-block', marginTop: '32px', transition: 'opacity 0.2s' }}
          onMouseOver={e => e.currentTarget.style.opacity = 0.7}
          onMouseOut={e => e.currentTarget.style.opacity = 0.25}>
          ← Back to Home
        </Link>
      </div>

    </div>
  );
}

/* ── embed preview helper ── */
function EmbedPreview({ url }) {
  const spotify = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
  const youtube = url.match(/(?:v=|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
  const soundcloud = url.includes('soundcloud.com');

  if (spotify) {
    const [, type, id] = spotify;
    const src = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
    return <iframe src={src} width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style={{ display: 'block' }} />;
  }
  if (youtube) {
    const src = `https://www.youtube-nocookie.com/embed/${youtube[1]}?rel=0&modestbranding=1`;
    return (
      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
        <iframe src={src} frameBorder="0" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      </div>
    );
  }
  if (soundcloud) {
    const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23f0ede8&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false`;
    return <iframe width="100%" height="166" frameBorder="0" src={src} style={{ display: 'block' }} />;
  }
  return <p style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '10px', opacity: 0.4 }}>Paste a Spotify, YouTube, or SoundCloud URL to preview</p>;
}

/* ── shared micro styles ── */
const centered = {
  minHeight: '100vh', backgroundColor: '#000', display: 'flex',
  flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
};
const smallBtn = {
  background: 'transparent', border: '1px solid rgba(240,237,232,0.2)',
  color: '#f0ede8', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase',
  padding: '8px 12px', cursor: 'pointer', transition: 'border-color 0.15s',
};
