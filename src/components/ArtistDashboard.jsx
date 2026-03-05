import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const ICON_MAP = {
  link: '→', spotify: '◎', apple: '◈', youtube: '▶',
  instagram: '◻', tiktok: '◇', soundcloud: '◉', bandcamp: '◆',
};

/* ── tiny helpers ── */
function FieldLabel({ children }) {
  return <p style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.35, marginBottom: '6px' }}>{children}</p>;
}
function Input({ value, onChange, placeholder }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', boxSizing: 'border-box', background: 'transparent', border: '1px solid rgba(240,237,232,0.2)', color: '#f0ede8', fontFamily: F, fontSize: '11px', letterSpacing: '0.05em', padding: '10px 12px', outline: 'none', transition: 'border-color 0.15s' }}
      onFocus={e => e.target.style.borderColor = 'rgba(240,237,232,0.6)'}
      onBlur={e => e.target.style.borderColor = 'rgba(240,237,232,0.2)'} />
  );
}
function Textarea({ value, onChange, placeholder, rows = 5 }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', background: 'transparent', border: '1px solid rgba(240,237,232,0.2)', color: '#f0ede8', fontFamily: F, fontSize: '11px', letterSpacing: '0.05em', padding: '10px 12px', outline: 'none', lineHeight: 1.6, transition: 'border-color 0.15s' }}
      onFocus={e => e.target.style.borderColor = 'rgba(240,237,232,0.6)'}
      onBlur={e => e.target.style.borderColor = 'rgba(240,237,232,0.2)'} />
  );
}

/* ── full-width action button ── */
function ActionBtn({ onClick, children, danger = false, disabled = false }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'block', width: '100%', padding: '16px 24px',
      border: danger ? '2px solid rgba(220,80,80,0.6)' : '2px solid rgba(240,237,232,0.8)',
      background: 'transparent', color: danger ? 'rgba(220,80,80,0.9)' : '#f0ede8',
      fontFamily: F, fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em',
      textTransform: 'uppercase', cursor: disabled ? 'default' : 'pointer',
      transition: 'background 0.15s', opacity: disabled ? 0.4 : 1, boxSizing: 'border-box',
    }}
      onMouseOver={e => { if (!disabled) e.currentTarget.style.background = danger ? 'rgba(220,80,80,0.08)' : '#111'; }}
      onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
      {children}
    </button>
  );
}

/* ── grid tile (matches main dashboard blocks) ── */
function EditorTile({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '10px', padding: '28px 16px',
      border: active ? '1px solid rgba(240,237,232,0.6)' : '1px solid rgba(240,237,232,0.15)',
      background: active ? '#0d0d0d' : 'transparent', color: '#f0ede8',
      cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s', width: '100%',
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(240,237,232,0.4)'; e.currentTarget.style.background = '#0a0a0a'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(240,237,232,0.15)'; e.currentTarget.style.background = 'transparent'; } }}>
      <span style={{ fontSize: '22px', lineHeight: 1, opacity: 0.7 }}>{icon}</span>
      <span style={{ fontFamily: F, fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: active ? 1 : 0.7 }}>{label}</span>
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
  const [customButtons, setCustomButtons] = useState([]);
  const [embedUrl, setEmbedUrl] = useState('');
  const [activePanel, setActivePanel] = useState(null);

  /* statuses */
  const [bioStatus, setBioStatus] = useState('idle');
  const [btnStatus, setBtnStatus] = useState('idle');
  const [embedStatus, setEmbedStatus] = useState('idle');
  const [resetStatus, setResetStatus] = useState('idle');
  const [saveError, setSaveError] = useState(null);

  /* drag state */
  const dragIndex = useRef(null);

  useEffect(() => {
    async function fetchArtist() {
      const { data, error } = await supabase.from('artists').select('*').eq('id', artistId).single();
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
    setBioStatus('saving'); setSaveError(null);
    const { error } = await supabase.from('artists').update({ bio }).eq('id', artistId);
    if (error) { setSaveError(error.message); setBioStatus('error'); } else setBioStatus('saved');
    setTimeout(() => setBioStatus('idle'), 2500);
  }
  async function saveButtons() {
    setBtnStatus('saving'); setSaveError(null);
    const { error } = await supabase.from('artists').update({ custom_buttons: customButtons }).eq('id', artistId);
    if (error) { setSaveError(error.message); setBtnStatus('error'); } else setBtnStatus('saved');
    setTimeout(() => setBtnStatus('idle'), 2500);
  }
  async function saveEmbed() {
    setEmbedStatus('saving'); setSaveError(null);
    const { error } = await supabase.from('artists').update({ embed_url: embedUrl }).eq('id', artistId);
    if (error) { setSaveError(error.message); setEmbedStatus('error'); } else setEmbedStatus('saved');
    setTimeout(() => setEmbedStatus('idle'), 2500);
  }

  /* ── reset: clears custom buttons + embed ── */
  async function resetPage() {
    if (!window.confirm('This will remove all custom buttons and embeds from your page. Continue?')) return;
    setResetStatus('saving'); setSaveError(null);
    const { error } = await supabase.from('artists').update({ custom_buttons: [], embed_url: '' }).eq('id', artistId);
    if (error) { setSaveError(error.message); setResetStatus('error'); }
    else { setCustomButtons([]); setEmbedUrl(''); setResetStatus('saved'); }
    setTimeout(() => setResetStatus('idle'), 2500);
  }

  /* ── button list helpers ── */
  function addButton() { setCustomButtons(prev => [...prev, { label: '', url: '', icon: 'link' }]); }
  function updateButton(i, field, val) { setCustomButtons(prev => prev.map((b, idx) => idx === i ? { ...b, [field]: val } : b)); }
  function removeButton(i) { setCustomButtons(prev => prev.filter((_, idx) => idx !== i)); }

  /* drag-to-reorder */
  function onDragStart(i) { dragIndex.current = i; }
  function onDragOver(e, i) {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === i) return;
    setCustomButtons(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIndex.current, 1);
      arr.splice(i, 0, moved);
      dragIndex.current = i;
      return arr;
    });
  }
  function onDragEnd() { dragIndex.current = null; }

  /* ── loading / not found ── */
  if (loading) return (
    <div style={centered}>
      <p style={{ fontFamily: F, fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.3, color: '#f0ede8' }}>Loading</p>
    </div>
  );
  if (!artist) return (
    <div style={centered}>
      <p style={{ fontFamily: F, fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.4, color: '#f0ede8' }}>Artist not found</p>
      <Link to="/" style={{ color: '#f0ede8', fontFamily: F, fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: '24px', opacity: 0.35, textDecoration: 'none' }}>← Home</Link>
    </div>
  );

  const folders = [
    { id: 'submit',       label: 'Submit a Release', icon: '＋', href: 'https://docs.google.com/forms/d/e/1FAIpQLSe8rH0NRf1YBN-rD78uuzIoLxwZjJAl4qBKPn7tQ0hZeNr59w/viewform?usp=header', external: true },
    { id: 'distribution', label: 'Distribution Form', icon: '↓', href: '/docs/YEN_DISTRIBUTION_FORM.pdf', download: true },
    { id: 'vault',        label: 'Vault',             icon: '◈', href: artist.upload_url, external: true },
    { id: 'releases',     label: 'My Releases',       icon: '♫', href: `/releases?artist=${encodeURIComponent(artist.filter_name || artistId)}`, internal: true },
  ];

  const editorTiles = [
    { id: 'bio',     icon: '✎', label: 'Bio Text'   },
    { id: 'buttons', icon: '⊞', label: 'Buttons'    },
    { id: 'embed',   icon: '▶', label: 'Embed'      },
    { id: 'reset',   icon: '↺', label: 'Reset Page' },
  ];

  const tileHov   = e => { e.currentTarget.style.borderColor = 'rgba(240,237,232,0.5)'; e.currentTarget.style.background = '#0a0a0a'; };
  const tileUnhov = e => { e.currentTarget.style.borderColor = 'rgba(240,237,232,0.15)'; e.currentTarget.style.background = 'transparent'; };

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

      {/* ── Welcome ── */}
      <div style={{ padding: '40px 24px 32px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: F, fontSize: '17px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f0ede8', marginBottom: '6px' }}>
          Welcome, {artist.display_name}
        </h1>
        <p style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.25 }}>Artist Dashboard</p>
      </div>

      {/* ── Quick-access grid ── */}
      <div style={{ padding: '0 24px' }}>
        <p style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', opacity: 0.2, textAlign: 'center', marginBottom: '16px' }}>Quick Access</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {folders.map(folder => {
            const inner = (
              <>
                <span style={{ fontSize: '22px', lineHeight: 1, opacity: 0.7, marginBottom: '10px', display: 'block' }}>{folder.icon}</span>
                <span style={{ fontFamily: F, fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.85 }}>{folder.label}</span>
              </>
            );
            const base = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 16px', border: '1px solid rgba(240,237,232,0.15)', color: '#f0ede8', textDecoration: 'none', cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s', background: 'transparent' };
            if (folder.download) return <a key={folder.id} href={folder.href} download style={base} onMouseEnter={tileHov} onMouseLeave={tileUnhov}>{inner}</a>;
            if (folder.internal) return <Link key={folder.id} to={folder.href} style={base} onMouseEnter={tileHov} onMouseLeave={tileUnhov}>{inner}</Link>;
            if (!folder.href) return <div key={folder.id} style={{ ...base, opacity: 0.3, cursor: 'default' }}>{inner}</div>;
            return <a key={folder.id} href={folder.href} target="_blank" rel="noopener noreferrer" style={base} onMouseEnter={tileHov} onMouseLeave={tileUnhov}>{inner}</a>;
          })}
        </div>
      </div>

      {/* ── My Page editor ── */}
      <div style={{ padding: '40px 24px 0' }}>
        <p style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', opacity: 0.2, textAlign: 'center', marginBottom: '16px' }}>My Page</p>

        {/* editor tile grid — same style as quick access */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {editorTiles.map(t => (
            <EditorTile key={t.id} icon={t.icon} label={t.label}
              active={activePanel === t.id}
              onClick={() => setActivePanel(activePanel === t.id ? null : t.id)} />
          ))}
        </div>

        {/* error banner */}
        {saveError && (
          <div style={{ marginBottom: '16px', padding: '12px 16px', border: '1px solid rgba(220,80,80,0.4)', background: 'rgba(220,80,80,0.06)' }}>
            <p style={{ fontFamily: F, fontSize: '10px', letterSpacing: '0.1em', color: 'rgba(255,120,120,0.9)', lineHeight: 1.6 }}>
              Save failed — {saveError}
            </p>
            {saveError.includes('column') && (
              <p style={{ fontFamily: F, fontSize: '9px', opacity: 0.55, marginTop: '6px', color: '#f0ede8', lineHeight: 1.7 }}>
                Run in Supabase SQL Editor:<br />
                <code style={{ fontFamily: 'monospace', fontSize: '10px' }}>
                  ALTER TABLE artists ADD COLUMN IF NOT EXISTS bio text;<br />
                  ALTER TABLE artists ADD COLUMN IF NOT EXISTS custom_buttons jsonb DEFAULT '[]';<br />
                  ALTER TABLE artists ADD COLUMN IF NOT EXISTS embed_url text;<br />
                  ALTER TABLE artists ADD COLUMN IF NOT EXISTS slug text;
                </code>
              </p>
            )}
          </div>
        )}

        {/* ── Bio panel ── */}
        {activePanel === 'bio' && (
          <div style={{ border: '1px solid rgba(240,237,232,0.15)', padding: '24px', marginBottom: '12px' }}>
            <FieldLabel>Bio — shown under your name on your artist page</FieldLabel>
            <Textarea value={bio} onChange={setBio} placeholder="Write a short bio about yourself..." rows={6} />
            <div style={{ marginTop: '16px' }}>
              <ActionBtn onClick={saveBio} disabled={bioStatus === 'saving'}>
                {bioStatus === 'saving' ? 'Saving...' : bioStatus === 'saved' ? '✓ Saved' : 'Save Bio'}
              </ActionBtn>
            </div>
          </div>
        )}

        {/* ── Buttons panel ── */}
        {activePanel === 'buttons' && (
          <div style={{ border: '1px solid rgba(240,237,232,0.15)', padding: '24px', marginBottom: '12px' }}>
            <FieldLabel>Custom Buttons — drag to reorder · appear after streaming links</FieldLabel>

            {customButtons.length === 0 && (
              <p style={{ fontFamily: F, fontSize: '10px', letterSpacing: '0.15em', opacity: 0.25, textAlign: 'center', padding: '20px 0' }}>No custom buttons yet</p>
            )}

            {customButtons.map((btn, i) => (
              <div key={i}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragOver={e => onDragOver(e, i)}
                onDragEnd={onDragEnd}
                style={{ marginBottom: '10px', padding: '14px', border: '1px solid rgba(240,237,232,0.12)', background: '#050505', cursor: 'grab', userSelect: 'none' }}>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', opacity: 0.3 }}>
                  <span style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.2em' }}>⠿ Drag to reorder</span>
                  <span style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.2em', marginLeft: 'auto' }}>#{i + 1}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <FieldLabel>Label</FieldLabel>
                    <Input value={btn.label} onChange={v => updateButton(i, 'label', v)} placeholder="e.g. BANDCAMP" />
                  </div>
                  <div style={{ width: '110px' }}>
                    <FieldLabel>Icon</FieldLabel>
                    <select value={btn.icon || 'link'} onChange={e => updateButton(i, 'icon', e.target.value)}
                      style={{ width: '100%', background: '#000', border: '1px solid rgba(240,237,232,0.2)', color: '#f0ede8', fontFamily: F, fontSize: '11px', padding: '10px 8px', cursor: 'pointer', outline: 'none' }}>
                      {Object.entries(ICON_MAP).map(([k, v]) => (
                        <option key={k} value={k}>{v} {k}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <FieldLabel>URL</FieldLabel>
                <Input value={btn.url} onChange={v => updateButton(i, 'url', v)} placeholder="https://..." />

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button onClick={() => removeButton(i)}
                    style={{ background: 'transparent', border: '1px solid rgba(220,80,80,0.4)', color: 'rgba(220,80,80,0.8)', fontFamily: F, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '6px 12px', cursor: 'pointer' }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button onClick={addButton}
              style={{ width: '100%', padding: '14px', marginTop: '4px', marginBottom: '16px', background: 'transparent', border: '1px dashed rgba(240,237,232,0.2)', color: '#f0ede8', fontFamily: F, fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer' }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(240,237,232,0.5)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(240,237,232,0.2)'}>
              ＋ Add Button
            </button>

            <ActionBtn onClick={saveButtons} disabled={btnStatus === 'saving'}>
              {btnStatus === 'saving' ? 'Saving...' : btnStatus === 'saved' ? '✓ Saved' : 'Save Buttons'}
            </ActionBtn>
          </div>
        )}

        {/* ── Embed panel ── */}
        {activePanel === 'embed' && (
          <div style={{ border: '1px solid rgba(240,237,232,0.15)', padding: '24px', marginBottom: '12px' }}>
            <FieldLabel>Embed URL — Spotify, YouTube, or SoundCloud</FieldLabel>
            <Input value={embedUrl} onChange={setEmbedUrl} placeholder="https://open.spotify.com/track/..." />
            {embedUrl && (
              <div style={{ marginTop: '16px' }}>
                <FieldLabel>Preview</FieldLabel>
                <div style={{ opacity: 0.6 }}>
                  <EmbedPreview url={embedUrl} />
                </div>
              </div>
            )}
            <div style={{ marginTop: '16px' }}>
              <ActionBtn onClick={saveEmbed} disabled={embedStatus === 'saving'}>
                {embedStatus === 'saving' ? 'Saving...' : embedStatus === 'saved' ? '✓ Saved' : 'Save Embed'}
              </ActionBtn>
            </div>
          </div>
        )}

        {/* ── Reset panel ── */}
        {activePanel === 'reset' && (
          <div style={{ border: '1px solid rgba(220,80,80,0.2)', padding: '24px', marginBottom: '12px' }}>
            <p style={{ fontFamily: F, fontSize: '10px', letterSpacing: '0.1em', lineHeight: 1.8, opacity: 0.6, marginBottom: '20px' }}>
              Removes all custom buttons and embeds from your artist page. Your streaming links, social links, releases, and press posts will remain.
            </p>
            <ActionBtn onClick={resetPage} danger disabled={resetStatus === 'saving'}>
              {resetStatus === 'saving' ? 'Resetting...' : resetStatus === 'saved' ? '✓ Reset' : '↺ Reset Page to Default'}
            </ActionBtn>
          </div>
        )}
      </div>

      {/* ── View my page ── */}
      {artist.slug && (
        <div style={{ padding: '32px 24px 0', textAlign: 'center' }}>
          <a href={`/artist/${artist.slug}`} target="_blank" rel="noreferrer"
            style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#f0ede8', opacity: 0.3, textDecoration: 'none', transition: 'opacity 0.2s' }}
            onMouseOver={e => e.currentTarget.style.opacity = 0.8}
            onMouseOut={e => e.currentTarget.style.opacity = 0.3}>
            View My Page →
          </a>
        </div>
      )}

      {/* ── Back ── */}
      <div style={{ padding: '32px 24px 60px', textAlign: 'center', borderTop: '1px solid #1a1a1a', marginTop: '40px' }}>
        <Link to="/"
          style={{ fontFamily: F, fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#f0ede8', opacity: 0.25, textDecoration: 'none', transition: 'opacity 0.2s' }}
          onMouseOver={e => e.currentTarget.style.opacity = 0.7}
          onMouseOut={e => e.currentTarget.style.opacity = 0.25}>
          ← Back to Home
        </Link>
      </div>

    </div>
  );
}

/* ── embed preview ── */
function EmbedPreview({ url }) {
  const spotify = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
  const youtube = url.match(/(?:v=|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
  const soundcloud = url.includes('soundcloud.com');
  if (spotify) {
    const [, type, id] = spotify;
    return <iframe src={`https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`} width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title="Spotify embed preview" style={{ display: 'block' }} />;
  }
  if (youtube) {
    return (
      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
        <iframe src={`https://www.youtube-nocookie.com/embed/${youtube[1]}?rel=0&modestbranding=1`} frameBorder="0" allowFullScreen title="YouTube embed preview" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      </div>
    );
  }
  if (soundcloud) {
    return <iframe width="100%" height="166" frameBorder="0" src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23f0ede8&auto_play=false&hide_related=true&show_comments=false`} title="SoundCloud embed preview" style={{ display: 'block' }} />;
  }
  return <p style={{ fontFamily: F, fontSize: '10px', opacity: 0.35 }}>Paste a Spotify, YouTube, or SoundCloud URL to preview</p>;
}

const centered = { minHeight: '100vh', backgroundColor: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' };
