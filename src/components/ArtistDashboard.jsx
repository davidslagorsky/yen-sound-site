import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import roster from '../rosterData';
import { FaInstagram, FaSpotify, FaApple, FaTiktok, FaYoutube } from 'react-icons/fa';

// ── Cloudinary config (free tier: 25GB, no card needed) ──
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME';
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'YOUR_UNSIGNED_PRESET';

async function uploadSquarePhoto(file, folder, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
    xhr.upload.onprogress = e => { if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => {
      if (xhr.status === 200) {
        const d = JSON.parse(xhr.responseText);
        // Auto face-detect + square crop, auto format & quality
        const squareUrl = d.secure_url.replace('/upload/', '/upload/c_fill,g_face,w_600,h_600,f_auto,q_auto/');
        resolve(squareUrl);
      } else reject(new Error('Upload failed'));
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
}

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/*
  custom_buttons item shape:
    { id: string, type: 'link' | 'embed', label?: string, url: string, icon?: string }
  button_order: array of keys — streaming keys + custom item ids
*/

const CUSTOM_ICON_MAP = {
  link: '→', spotify: '◎', apple: '◈', youtube: '▶',
  instagram: '◻', tiktok: '◇', soundcloud: '◉', bandcamp: '◆',
};
const DEFAULT_ORDER = ['spotify','appleMusic','youtube','tiktok','instagram','press'];
const PLATFORM_META = {
  spotify:    { label: 'SPOTIFY',     icon: <FaSpotify size={15} />   },
  appleMusic: { label: 'APPLE MUSIC', icon: <FaApple size={15} />     },
  youtube:    { label: 'YOUTUBE',     icon: <FaYoutube size={15} />   },
  tiktok:     { label: 'TIKTOK',      icon: <FaTiktok size={15} />    },
  instagram:  { label: 'INSTAGRAM',   icon: <FaInstagram size={15} /> },
  press:      { label: 'PRESS',       icon: null                       },
};

/* ── embed parsing ── */
function buildEmbedData(url = '') {
  if (!url?.trim()) return null;
  const u = url.trim();
  const spotify = u.match(/open\.spotify\.com\/(track|album|playlist|episode|artist)\/([A-Za-z0-9]+)/);
  const youtube = u.match(/(?:[?&]v=|youtu\.be\/|\/shorts\/|\/embed\/)([A-Za-z0-9_-]{11})/);
  const sc = u.includes('soundcloud.com/');
  if (spotify) return { type: 'spotify', src: `https://open.spotify.com/embed/${spotify[1]}/${spotify[2]}?utm_source=generator&theme=0` };
  if (youtube) return { type: 'youtube', src: `https://www.youtube-nocookie.com/embed/${youtube[1]}?rel=0&modestbranding=1&playsinline=1` };
  if (sc) return { type: 'soundcloud', src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(u)}&color=%23f0ede8&auto_play=false&hide_related=true&show_comments=false&show_user=true` };
  return null;
}
function detectEmbedService(url = '') {
  if (url.includes('spotify.com')) return 'spotify';
  if (url.includes('youtu')) return 'youtube';
  if (url.includes('soundcloud.com')) return 'soundcloud';
  return null;
}

function EmbedPlayer({ url, compact = false }) {
  const data = buildEmbedData(url);
  if (!data) return <p style={{ fontFamily: F, fontSize: '10px', opacity: 0.3, padding: '8px 0' }}>Paste a Spotify, YouTube, or SoundCloud URL</p>;
  if (data.type === 'youtube') return (
    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
      <iframe src={data.src} title="YouTube" frameBorder="0" allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
    </div>
  );
  if (data.type === 'spotify') return (
    <iframe src={data.src} width="100%" height={compact ? 80 : 152} frameBorder="0" title="Spotify"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy" style={{ display: 'block' }} />
  );
  return <iframe width="100%" height={compact ? 100 : 166} frameBorder="0" title="SoundCloud" src={data.src} style={{ display: 'block' }} />;
}

/* ── uid generator ── */
function uid() { return Math.random().toString(36).slice(2, 8); }

/* ── migrate old embed_url into custom_buttons list ── */
function migrateEmbedUrl(buttons, embedUrl) {
  if (!embedUrl?.trim()) return buttons;
  const alreadyMigrated = buttons.some(b => b.type === 'embed' && b.url === embedUrl.trim());
  if (alreadyMigrated) return buttons;
  return [...buttons, { id: uid(), type: 'embed', url: embedUrl.trim(), label: '' }];
}

/* ─── UI helpers ─── */
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
      <span style={{ fontSize: '20px', lineHeight: 1, opacity: 0.7 }}>{icon}</span>
      <span style={{ fontFamily: F, fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: active ? 1 : 0.6 }}>{label}</span>
    </button>
  );
}

/* ─── type toggle ─── */
function TypeToggle({ value, onChange }) {
  return (
    <div style={{ display: 'flex', border: '1px solid rgba(240,237,232,0.2)', marginBottom: '12px' }}>
      {['link', 'embed'].map(t => (
        <button key={t} onClick={() => onChange(t)} style={{
          flex: 1, padding: '9px', background: value === t ? 'rgba(240,237,232,0.1)' : 'transparent',
          border: 'none', color: '#f0ede8', fontFamily: F, fontSize: '9px', fontWeight: 700,
          letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer',
          borderRight: t === 'link' ? '1px solid rgba(240,237,232,0.2)' : 'none',
          opacity: value === t ? 1 : 0.4, transition: 'background 0.15s, opacity 0.15s',
        }}>
          {t === 'link' ? '→ Link' : '▶ Embed'}
        </button>
      ))}
    </div>
  );
}

/* ─── Preview Modal ─── */
function PreviewModal({ onClose, artist, rosterArtist, buttonOrder, customButtons, bio }) {
  const socials = rosterArtist?.socials || {};

  /* build full ordered item list */
  const orderedItems = buttonOrder.map(key => {
    /* streaming platform */
    if (PLATFORM_META[key]) {
      if (key === 'press') return { key: 'press', kind: 'platform', label: 'PRESS', icon: null };
      const url = socials[key];
      if (!url || url === 'PLACEHOLDER') return null;
      return { key, kind: 'platform', label: PLATFORM_META[key].label, icon: PLATFORM_META[key].icon };
    }
    /* custom item */
    const item = customButtons.find(b => b.id === key);
    if (!item) return null;
    if (item.type === 'embed') return { key, kind: 'embed', url: item.url, label: item.label };
    if (item.type === 'link' && item.label && item.url) return { key, kind: 'link', label: item.label, icon: item.icon, url: item.url };
    return null;
  }).filter(Boolean);

  /* append any custom items not yet in order */
  customButtons.forEach(b => {
    if (!buttonOrder.includes(b.id)) {
      if (b.type === 'embed') orderedItems.push({ key: b.id, kind: 'embed', url: b.url, label: b.label });
      else if (b.label && b.url) orderedItems.push({ key: b.id, kind: 'link', label: b.label, icon: b.icon, url: b.url });
    }
  });

  const btnS = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    width: 'calc(100% - 28px)', margin: '0 14px 8px', padding: '13px 14px',
    border: '2px solid rgba(240,237,232,0.8)', background: 'transparent',
    fontFamily: F, fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em',
    textTransform: 'uppercase', color: '#f0ede8', boxSizing: 'border-box',
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.93)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '375px', marginBottom: '10px' }}>
        <p style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.35, color: '#f0ede8' }}>Live Preview</p>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#f0ede8', cursor: 'pointer', fontFamily: F, fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', opacity: 0.4, padding: 0 }}
          onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0.4}>
          ✕ Close
        </button>
      </div>

      {/* phone shell */}
      <div style={{ width: '100%', maxWidth: '375px', height: '72vh', maxHeight: '760px', border: '1px solid rgba(240,237,232,0.18)', borderRadius: '38px', overflow: 'hidden', position: 'relative', background: '#000', boxShadow: '0 0 80px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
        <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '26px', background: '#000', borderRadius: '20px', zIndex: 10, border: '1px solid #111' }} />

        <div style={{ width: '100%', height: '100%', overflowY: 'auto', background: '#000', color: '#f0ede8', WebkitOverflowScrolling: 'touch' }}>
          {/* logo */}
          <div style={{ paddingTop: '52px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <img src="/spinning yen logo white.gif" alt="YEN SOUND" style={{ width: '32px', height: '32px', opacity: 0.55 }} />
            </div>
            <div style={{ overflow: 'hidden', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', padding: '5px 0' }}>
              <div style={{ display: 'inline-flex', animation: 'marquee 18s linear infinite', whiteSpace: 'nowrap' }}>
                {Array(6).fill('YEN SOUND ®   ').map((t, i) => (
                  <span key={i} style={{ fontFamily: F, fontSize: '7px', fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', opacity: 0.25, paddingRight: '28px' }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* cover */}
          {rosterArtist?.image && (
            <div style={{ width: '100%', marginTop: '14px' }}>
              <img src={rosterArtist.image} alt="" style={{ width: '100%', display: 'block', aspectRatio: '1', objectFit: 'cover', objectPosition: 'top' }} />
            </div>
          )}

          {/* name + bio */}
          <div style={{ padding: '16px 14px 12px', textAlign: 'center' }}>
            <h1 style={{ fontFamily: F, fontSize: '12px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f0ede8', marginBottom: '6px', lineHeight: 1.3 }}>
              {(rosterArtist?.displayName || artist.display_name || '').toUpperCase()}
            </h1>
            {bio && <p style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.06em', lineHeight: 1.7, opacity: 0.55, marginBottom: '8px' }}>{bio}</p>}
            <p style={{ fontFamily: F, fontSize: '8px', letterSpacing: '0.28em', textTransform: 'uppercase', opacity: 0.35, marginTop: bio ? '10px' : 0 }}>Choose music service</p>
          </div>

          {/* items */}
          <div style={{ paddingBottom: '14px' }}>
            {orderedItems.map((item, i) => {
              if (item.kind === 'embed') {
                return (
                  <div key={i} style={{ margin: '0 14px 10px', border: '1px solid rgba(240,237,232,0.15)', overflow: 'hidden' }}>
                    {item.label && <p style={{ fontFamily: F, fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.4, padding: '8px 10px 4px', textAlign: 'center' }}>{item.label}</p>}
                    <EmbedPlayer url={item.url} compact />
                  </div>
                );
              }
              return (
                <div key={i} style={btnS}>
                  {item.icon && <span style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>{item.icon}</span>}
                  {!item.icon && item.kind === 'link' && <span style={{ opacity: 0.7 }}>{CUSTOM_ICON_MAP[item.iconKey] || '→'}</span>}
                  {item.label}
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid #1a1a1a', padding: '16px', textAlign: 'center' }}>
            <p style={{ fontFamily: F, fontSize: '7px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.2 }}>Distributed by Yen Sound</p>
          </div>
        </div>
      </div>
      <p style={{ fontFamily: F, fontSize: '8px', letterSpacing: '0.2em', opacity: 0.18, color: '#f0ede8', marginTop: '10px', textTransform: 'uppercase' }}>Tap outside to close</p>
    </div>
  );
}

/* ─── Touch-aware sortable hook ───────────────────────────────────
   Desktop: standard HTML drag-and-drop
   Mobile: long-press (400ms) activates drag mode, then touch-move reorders
─────────────────────────────────────────────────────────────────── */
function useTouchSort(setList) {
  const dragIdx = useRef(null);
  const longPressTimer = useRef(null);
  const isDragging = useRef(false);
  const rowRefs = useRef([]);
  const startY = useRef(0);
  const [activeIdx, setActiveIdx] = useState(null);

  function getRowAtY(y) {
    let closest = null, closestDist = Infinity;
    rowRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const dist = Math.abs(y - mid);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    });
    return closest;
  }

  function moveItem(from, to) {
    if (from === to || from === null || to === null) return;
    setList(prev => {
      const a = [...prev];
      const [m] = a.splice(from, 1);
      a.splice(to, 0, m);
      return a;
    });
    dragIdx.current = to;
    setActiveIdx(to);
  }

  function handlers(index) {
    return {
      ref: el => { rowRefs.current[index] = el; },
      draggable: true,
      onDragStart: () => { dragIdx.current = index; setActiveIdx(index); },
      onDragOver: e => {
        e.preventDefault();
        if (dragIdx.current !== null && dragIdx.current !== index) moveItem(dragIdx.current, index);
      },
      onDragEnd: () => { dragIdx.current = null; setActiveIdx(null); },
      onTouchStart: e => {
        startY.current = e.touches[0].clientY;
        longPressTimer.current = setTimeout(() => {
          isDragging.current = true;
          dragIdx.current = index;
          setActiveIdx(index);
          if (navigator.vibrate) navigator.vibrate(30);
        }, 400);
      },
      onTouchMove: e => {
        if (!isDragging.current) {
          if (Math.abs(e.touches[0].clientY - startY.current) > 8) clearTimeout(longPressTimer.current);
          return;
        }
        e.preventDefault();
        const target = getRowAtY(e.touches[0].clientY);
        if (target !== null && dragIdx.current !== null && target !== dragIdx.current) moveItem(dragIdx.current, target);
      },
      onTouchEnd: () => {
        clearTimeout(longPressTimer.current);
        isDragging.current = false;
        dragIdx.current = null;
        setActiveIdx(null);
      },
    };
  }

  return { handlers, activeIdx };
}

/* ─── Order row — handles both platform keys and custom item ids ─── */
function OrderRow({ itemKey, index, customButtons, socials, dragHandlers, isActive }) {
  const platform = PLATFORM_META[itemKey];
  let label, icon, dimmed = false;

  if (platform) {
    label = platform.label;
    icon = platform.icon;
    dimmed = itemKey !== 'press' && !(socials[itemKey] && socials[itemKey] !== 'PLACEHOLDER');
  } else {
    const item = customButtons.find(b => b.id === itemKey);
    if (!item) return null;
    if (item.type === 'embed') {
      const svc = detectEmbedService(item.url);
      label = item.label || (svc ? `${svc} embed` : 'Embed');
      icon = <span style={{ fontSize: '11px', opacity: 0.6 }}>▶</span>;
    } else {
      label = item.label || 'Link';
      icon = <span style={{ fontSize: '12px', opacity: 0.6 }}>{CUSTOM_ICON_MAP[item.icon] || '→'}</span>;
    }
  }

  const h = dragHandlers(index);
  return (
    <div ref={h.ref} draggable={h.draggable}
      onDragStart={h.onDragStart} onDragOver={h.onDragOver} onDragEnd={h.onDragEnd}
      onTouchStart={h.onTouchStart} onTouchMove={h.onTouchMove} onTouchEnd={h.onTouchEnd}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
        marginBottom: '6px', userSelect: 'none', touchAction: 'none',
        border: `1px solid ${isActive ? 'rgba(240,237,232,0.5)' : 'rgba(240,237,232,0.1)'}`,
        background: isActive ? '#111' : '#050505',
        cursor: 'grab', opacity: dimmed ? 0.3 : 1,
        transform: isActive ? 'scale(1.015)' : 'scale(1)',
        transition: 'border-color 0.12s, background 0.12s, transform 0.12s',
      }}>
      <span style={{ fontFamily: F, fontSize: '14px', opacity: 0.3, lineHeight: 1 }}>⠿</span>
      <span style={{ display: 'flex', alignItems: 'center', minWidth: '18px' }}>{icon}</span>
      <span style={{ fontFamily: F, fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', flex: 1 }}>{label}</span>
      {isActive && <span style={{ fontFamily: F, fontSize: '8px', letterSpacing: '0.12em', opacity: 0.5, textTransform: 'uppercase' }}>moving</span>}
      {!isActive && dimmed && <span style={{ fontFamily: F, fontSize: '8px', letterSpacing: '0.15em', opacity: 0.4, textTransform: 'uppercase' }}>Not set</span>}
      {!isActive && !platform && !dimmed && <span style={{ fontFamily: F, fontSize: '8px', letterSpacing: '0.1em', opacity: 0.25, textTransform: 'uppercase' }}>custom</span>}
      <span style={{ fontFamily: F, fontSize: '9px', opacity: 0.2 }}>#{index + 1}</span>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════ */
export default function ArtistDashboard() {
  const { artistId } = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);
  const [photoStatus, setPhotoStatus] = useState('idle'); // idle|saving|saved|error
  const photoFileRef = useRef(null);
  const [customButtons, setCustomButtons] = useState([]);  // [{id, type, label, url, icon}]
  const [buttonOrder, setButtonOrder] = useState(DEFAULT_ORDER);
  const [activePanel, setActivePanel] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const [bioStatus, setBioStatus] = useState('idle');
  const [btnStatus, setBtnStatus] = useState('idle');
  const [resetStatus, setResetStatus] = useState('idle');
  const [saveError, setSaveError] = useState(null);

  const { handlers: customHandlers, activeIdx: customActiveIdx } = useTouchSort(setCustomButtons);
  const { handlers: orderHandlers, activeIdx: orderActiveIdx } = useTouchSort(setButtonOrder);

  const rosterArtist = artist?.slug ? roster.find(r => r.slug === artist.slug) : null;
  const socials = rosterArtist?.socials || {};

  useEffect(() => {
    async function fetchArtist() {
      const { data, error } = await supabase.from('artists').select('*').eq('id', artistId).single();
      if (!error && data) {
        setArtist(data);
        setBio(data.bio || '');
        setPhotoUrl(data.profile_image || '');
        /* migrate old embed_url into custom_buttons if needed */
        const migrated = migrateEmbedUrl(data.custom_buttons || [], data.embed_url || '');
        setCustomButtons(migrated);
        /* ensure all custom item ids are in order */
        const base = data.button_order?.length ? data.button_order : DEFAULT_ORDER;
        const existingIds = migrated.map(b => b.id);
        const merged = [...base, ...existingIds.filter(id => !base.includes(id))];
        setButtonOrder(merged);
      }
      setLoading(false);
    }
    fetchArtist();
  }, [artistId]);

  /* sync order whenever customButtons change (add new ids) */
  useEffect(() => {
    setButtonOrder(prev => {
      const newIds = customButtons.map(b => b.id).filter(id => !prev.includes(id));
      return newIds.length ? [...prev, ...newIds] : prev;
    });
  }, [customButtons]);

  async function saveBio() {
    setBioStatus('saving'); setSaveError(null);
    const { error } = await supabase.from('artists').update({ bio }).eq('id', artistId);
    if (error) { setSaveError(error.message); setBioStatus('error'); } else setBioStatus('saved');
    setTimeout(() => setBioStatus('idle'), 2500);
  }

  async function savePhoto(url) {
    setPhotoStatus('saving'); setSaveError(null);
    const { error } = await supabase.from('artists').update({ profile_image: url || null }).eq('id', artistId);
    if (error) { setSaveError(error.message); setPhotoStatus('error'); }
    else { setPhotoStatus('saved'); setPhotoUrl(url); setTimeout(() => setPhotoStatus('idle'), 2500); }
  }

  async function handlePhotoFile(file) {
    if (!file) return;
    if (CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME') { alert('Cloudinary not configured — paste a URL instead.'); return; }
    const objectUrl = URL.createObjectURL(file);
    setPhotoUrl(objectUrl);
    setPhotoUploading(true); setPhotoProgress(0);
    try {
      const url = await uploadSquarePhoto(file, `yen-sound/artists/${artistId}`, setPhotoProgress);
      setPhotoUploading(false);
      await savePhoto(url);
    } catch (err) {
      setPhotoUploading(false); setPhotoStatus('error');
      alert('Upload failed: ' + err.message);
    }
  }

  async function saveButtons() {
    setBtnStatus('saving'); setSaveError(null);
    const { error } = await supabase.from('artists').update({ custom_buttons: customButtons, button_order: buttonOrder }).eq('id', artistId);
    if (error) { setSaveError(error.message); setBtnStatus('error'); } else setBtnStatus('saved');
    setTimeout(() => setBtnStatus('idle'), 2500);
  }

  async function resetPage() {
    if (!window.confirm('Remove all custom buttons, embeds, and reset order?')) return;
    setResetStatus('saving'); setSaveError(null);
    const { error } = await supabase.from('artists').update({ custom_buttons: [], embed_url: '', button_order: DEFAULT_ORDER }).eq('id', artistId);
    if (error) { setSaveError(error.message); setResetStatus('error'); }
    else { setCustomButtons([]); setButtonOrder(DEFAULT_ORDER); setResetStatus('saved'); }
    setTimeout(() => setResetStatus('idle'), 2500);
  }

  function addItem(type) {
    const id = uid();
    setCustomButtons(prev => [...prev, type === 'embed'
      ? { id, type: 'embed', url: '', label: '' }
      : { id, type: 'link', label: '', url: '', icon: 'link' }
    ]);
  }
  function updateItem(id, field, val) {
    setCustomButtons(prev => prev.map(b => b.id === id ? { ...b, [field]: val } : b));
  }
  function removeItem(id) {
    setCustomButtons(prev => prev.filter(b => b.id !== id));
    setButtonOrder(prev => prev.filter(k => k !== id));
  }
  function changeItemType(id, newType) {
    setCustomButtons(prev => prev.map(b => b.id === id ? { ...b, type: newType } : b));
  }

  /* custom button drag — handled by useTouchSort hook */

  /* drag order — handled by useTouchSort hook above */

  if (loading) return <div style={centered}><p style={{ fontFamily: F, fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.3, color: '#f0ede8' }}>Loading</p></div>;
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
    { id: 'bio',     icon: '✎', label: 'Bio'     },
    { id: 'buttons', icon: '⊞', label: 'Buttons' },
    { id: 'order',   icon: '↕', label: 'Order'   },
    { id: 'photo',   icon: '◻', label: 'Photo'   },
    { id: 'preview', icon: '◉', label: 'Preview' },
    { id: 'reset',   icon: '↺', label: 'Reset'   },
  ];

  const tileHov   = e => { e.currentTarget.style.borderColor = 'rgba(240,237,232,0.5)'; e.currentTarget.style.background = '#0a0a0a'; };
  const tileUnhov = e => { e.currentTarget.style.borderColor = 'rgba(240,237,232,0.15)'; e.currentTarget.style.background = 'transparent'; };

  /* full order list for Order panel */
  const fullOrderList = buttonOrder.filter(key =>
    PLATFORM_META[key] || customButtons.find(b => b.id === key)
  );

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#f0ede8', maxWidth: '600px', margin: '0 auto' }}>

      {showPreview && (
        <PreviewModal onClose={() => setShowPreview(false)}
          artist={artist} rosterArtist={rosterArtist}
          buttonOrder={buttonOrder} customButtons={customButtons} bio={bio} />
      )}

      {/* logo + marquee */}
      <div style={{ paddingTop: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <img src="/spinning yen logo white.gif" alt="YEN SOUND" className="yen-spin" style={{ width: '52px', height: '52px', opacity: 0.55 }} />
        </div>
        <div style={{ overflow: 'hidden', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', padding: '7px 0' }}>
          <div style={{ display: 'inline-flex', animation: 'marquee 18s linear infinite', whiteSpace: 'nowrap' }}>
            {Array(6).fill('YEN SOUND ®   ').map((t, i) => (
              <span key={i} style={{ fontFamily: F, fontSize: '9px', fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', opacity: 0.25, paddingRight: '40px' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* welcome */}
      <div style={{ padding: '40px 24px 32px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: F, fontSize: '17px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f0ede8', marginBottom: '6px' }}>
          Welcome, {artist.display_name}
        </h1>
        <p style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.25 }}>Artist Dashboard</p>
      </div>

      {/* quick access */}
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

      {/* my page */}
      <div style={{ padding: '40px 24px 0' }}>
        <p style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', opacity: 0.2, textAlign: 'center', marginBottom: '16px' }}>My Page</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {editorTiles.map(t => (
            t.id === 'preview'
              ? <EditorTile key={t.id} icon={t.icon} label={t.label} active={false} onClick={() => setShowPreview(true)} />
              : <EditorTile key={t.id} icon={t.icon} label={t.label} active={activePanel === t.id} onClick={() => setActivePanel(activePanel === t.id ? null : t.id)} />
          ))}
        </div>

        {/* error */}
        {saveError && (
          <div style={{ marginBottom: '16px', padding: '12px 16px', border: '1px solid rgba(220,80,80,0.4)', background: 'rgba(220,80,80,0.06)' }}>
            <p style={{ fontFamily: F, fontSize: '10px', color: 'rgba(255,120,120,0.9)', lineHeight: 1.6 }}>Save failed — {saveError}</p>
          </div>
        )}

        {/* ── Bio ── */}
        {activePanel === 'bio' && (
          <div style={{ border: '1px solid rgba(240,237,232,0.15)', padding: '24px', marginBottom: '12px' }}>
            <FieldLabel>Bio — shown under your name</FieldLabel>
            <Textarea value={bio} onChange={setBio} placeholder="Write a short bio..." rows={6} />
            <div style={{ marginTop: '16px' }}>
              <ActionBtn onClick={saveBio} disabled={bioStatus === 'saving'}>
                {bioStatus === 'saving' ? 'Saving...' : bioStatus === 'saved' ? '✓ Saved' : 'Save Bio'}
              </ActionBtn>
            </div>
          </div>
        )}

        {/* ── Buttons (links + embeds) ── */}
        {activePanel === 'buttons' && (
          <div style={{ border: '1px solid rgba(240,237,232,0.15)', padding: '24px', marginBottom: '12px' }}>
            <FieldLabel>Custom items — links and embeds · drag to reorder</FieldLabel>

            {customButtons.length === 0 && (
              <p style={{ fontFamily: F, fontSize: '10px', letterSpacing: '0.15em', opacity: 0.25, textAlign: 'center', padding: '16px 0' }}>No items yet — add a link or embed below</p>
            )}

            {customButtons.map((item, i) => {
              const h = customHandlers(i);
              return (
              <div key={item.id} ref={h.ref} draggable={h.draggable}
                onDragStart={h.onDragStart} onDragOver={h.onDragOver} onDragEnd={h.onDragEnd}
                onTouchStart={h.onTouchStart} onTouchMove={h.onTouchMove} onTouchEnd={h.onTouchEnd}
                style={{
                  marginBottom: '12px', padding: '14px',
                  border: `1px solid ${customActiveIdx === i ? 'rgba(240,237,232,0.5)' : 'rgba(240,237,232,0.1)'}`,
                  background: customActiveIdx === i ? '#111' : '#050505',
                  cursor: 'grab', userSelect: 'none', touchAction: 'none',
                  transform: customActiveIdx === i ? 'scale(1.01)' : 'scale(1)',
                  transition: 'border-color 0.12s, background 0.12s, transform 0.12s',
                }}>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', opacity: 0.3 }}>
                  <span style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.2em' }}>⠿ Drag</span>
                  <span style={{ fontFamily: F, fontSize: '9px', marginLeft: 'auto' }}>#{i + 1}</span>
                </div>

                {/* type toggle */}
                <TypeToggle value={item.type} onChange={t => changeItemType(item.id, t)} />

                {item.type === 'link' && (
                  <>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <FieldLabel>Label</FieldLabel>
                        <Input value={item.label} onChange={v => updateItem(item.id, 'label', v)} placeholder="e.g. BANDCAMP" />
                      </div>
                      <div style={{ width: '110px' }}>
                        <FieldLabel>Icon</FieldLabel>
                        <select value={item.icon || 'link'} onChange={e => updateItem(item.id, 'icon', e.target.value)}
                          style={{ width: '100%', background: '#000', border: '1px solid rgba(240,237,232,0.2)', color: '#f0ede8', fontFamily: F, fontSize: '11px', padding: '10px 8px', cursor: 'pointer', outline: 'none' }}>
                          {Object.entries(CUSTOM_ICON_MAP).map(([k, v]) => <option key={k} value={k}>{v} {k}</option>)}
                        </select>
                      </div>
                    </div>
                    <FieldLabel>URL</FieldLabel>
                    <Input value={item.url} onChange={v => updateItem(item.id, 'url', v)} placeholder="https://..." />
                  </>
                )}

                {item.type === 'embed' && (
                  <>
                    <div style={{ marginBottom: '10px' }}>
                      <FieldLabel>Label (optional)</FieldLabel>
                      <Input value={item.label} onChange={v => updateItem(item.id, 'label', v)} placeholder="e.g. Latest Track" />
                    </div>
                    <FieldLabel>Spotify, YouTube, or SoundCloud URL</FieldLabel>
                    <Input value={item.url} onChange={v => updateItem(item.id, 'url', v)} placeholder="https://open.spotify.com/track/..." />
                    {item.url && buildEmbedData(item.url) && (
                      <div style={{ marginTop: '12px', opacity: 0.65 }}>
                        <EmbedPlayer url={item.url} />
                      </div>
                    )}
                    {item.url && !buildEmbedData(item.url) && (
                      <p style={{ fontFamily: F, fontSize: '9px', opacity: 0.35, marginTop: '6px', letterSpacing: '0.1em' }}>URL not recognised — try a direct Spotify/YouTube/SoundCloud link</p>
                    )}
                  </>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button onClick={() => removeItem(item.id)}
                    style={{ background: 'transparent', border: '1px solid rgba(220,80,80,0.4)', color: 'rgba(220,80,80,0.8)', fontFamily: F, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '6px 12px', cursor: 'pointer' }}>
                    Remove
                  </button>
                </div>
              </div>
            );})}

            {/* add buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px', marginBottom: '16px' }}>
              <button onClick={() => addItem('link')}
                style={{ padding: '13px', background: 'transparent', border: '1px dashed rgba(240,237,232,0.2)', color: '#f0ede8', fontFamily: F, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(240,237,232,0.5)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(240,237,232,0.2)'}>
                → Add Link
              </button>
              <button onClick={() => addItem('embed')}
                style={{ padding: '13px', background: 'transparent', border: '1px dashed rgba(240,237,232,0.2)', color: '#f0ede8', fontFamily: F, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(240,237,232,0.5)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(240,237,232,0.2)'}>
                ▶ Add Embed
              </button>
            </div>

            <ActionBtn onClick={saveButtons} disabled={btnStatus === 'saving'}>
              {btnStatus === 'saving' ? 'Saving...' : btnStatus === 'saved' ? '✓ Saved' : 'Save'}
            </ActionBtn>
          </div>
        )}

        {/* ── Order ── */}
        {activePanel === 'order' && (
          <div style={{ border: '1px solid rgba(240,237,232,0.15)', padding: '24px', marginBottom: '12px' }}>
            <FieldLabel>Full page order — streaming links + all custom items</FieldLabel>
            {fullOrderList.length === 0 && (
              <p style={{ fontFamily: F, fontSize: '10px', opacity: 0.25, textAlign: 'center', padding: '16px 0' }}>Add custom items first</p>
            )}
            {fullOrderList.map((key, i) => (
              <OrderRow key={key} itemKey={key} index={i}
                customButtons={customButtons} socials={socials}
                dragHandlers={orderHandlers} isActive={orderActiveIdx === i} />
            ))}
            <div style={{ marginTop: '12px' }}>
              <ActionBtn onClick={saveButtons} disabled={btnStatus === 'saving'}>
                {btnStatus === 'saving' ? 'Saving...' : btnStatus === 'saved' ? '✓ Saved' : 'Save Order'}
              </ActionBtn>
            </div>
          </div>
        )}

        {/* ── Reset ── */}
        {activePanel === 'reset' && (
          <div style={{ border: '1px solid rgba(220,80,80,0.2)', padding: '24px', marginBottom: '12px' }}>
            <p style={{ fontFamily: F, fontSize: '10px', letterSpacing: '0.1em', lineHeight: 1.8, opacity: 0.6, marginBottom: '20px' }}>
              Removes all custom buttons, embeds, and resets order. Streaming links, releases and press remain.
            </p>
            <ActionBtn onClick={resetPage} danger disabled={resetStatus === 'saving'}>
              {resetStatus === 'saving' ? 'Resetting...' : resetStatus === 'saved' ? '✓ Reset' : '↺ Reset Page to Default'}
            </ActionBtn>
          </div>
        )}

        {/* ── Photo ── */}
        {activePanel === 'photo' && (
          <div style={{ border: '1px solid rgba(240,237,232,0.15)', padding: '24px', marginBottom: '12px' }}>
            <FieldLabel>Profile Photo — auto-cropped to square</FieldLabel>

            {/* square preview */}
            <div
              onClick={() => photoFileRef.current?.click()}
              style={{ width: '120px', height: '120px', margin: '0 auto 16px', overflow: 'hidden', background: '#111', border: '1px solid rgba(240,237,232,0.2)', cursor: 'pointer', position: 'relative' }}
            >
              {photoUrl
                ? <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2, fontFamily: F, fontSize: '9px', letterSpacing: '0.2em' }}>No Photo</div>
              }
              {photoUploading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <div style={{ width: '60px', height: '2px', background: '#222' }}>
                    <div style={{ width: `${photoProgress}%`, height: '100%', background: '#f0ede8', transition: 'width 0.2s' }} />
                  </div>
                  <span style={{ fontFamily: F, fontSize: '8px', color: '#f0ede8', opacity: 0.7 }}>{photoProgress}%</span>
                </div>
              )}
              {!photoUploading && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.55)', padding: '4px 0', textAlign: 'center' }}>
                  <span style={{ fontFamily: F, fontSize: '7px', letterSpacing: '0.15em', color: '#f0ede8', opacity: 0.6, textTransform: 'uppercase' }}>Click to Upload</span>
                </div>
              )}
            </div>
            <input ref={photoFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handlePhotoFile(e.target.files?.[0])} />

            <p style={{ fontFamily: F, fontSize: '8px', opacity: 0.35, letterSpacing: '0.1em', lineHeight: 1.7, textAlign: 'center', marginBottom: '16px' }}>
              Any shape photo will be auto-cropped to a square (face-aware). Stored free on Cloudinary.
            </p>

            {/* URL paste fallback */}
            <FieldLabel>Or paste image URL</FieldLabel>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                value={typeof photoUrl === 'string' && photoUrl.startsWith('blob:') ? '' : photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                placeholder="https://..."
                style={{ flex: 1, background: 'transparent', border: '1px solid rgba(240,237,232,0.2)', color: '#f0ede8', fontFamily: F, fontSize: '11px', padding: '10px 12px', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'rgba(240,237,232,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(240,237,232,0.2)'}
              />
              <button
                onClick={() => savePhoto(photoUrl.trim())}
                disabled={photoStatus === 'saving' || photoUploading}
                style={{ flexShrink: 0, padding: '10px 16px', background: 'transparent', border: '1px solid rgba(240,237,232,0.5)', color: '#f0ede8', fontFamily: F, fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', opacity: photoStatus === 'saving' ? 0.4 : 1 }}
              >
                {photoStatus === 'saving' ? '...' : photoStatus === 'saved' ? '✓' : 'Save'}
              </button>
            </div>

            {photoStatus === 'saved' && <p style={{ fontFamily: F, fontSize: '10px', color: 'rgba(100,255,180,0.85)', letterSpacing: '0.1em' }}>✓ Photo saved</p>}
            {artist.profile_image && (
              <button onClick={() => savePhoto('')} style={{ marginTop: '8px', background: 'none', border: 'none', color: 'rgba(220,80,80,0.6)', fontFamily: F, fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', padding: 0 }}>
                ↺ Remove photo
              </button>
            )}
          </div>
        )}
      </div>

      {/* view page */}
      {artist.slug && (
        <div style={{ padding: '32px 24px 0', textAlign: 'center' }}>
          <a href={`/artist/${artist.slug}`} target="_blank" rel="noreferrer"
            style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#f0ede8', opacity: 0.3, textDecoration: 'none', transition: 'opacity 0.2s' }}
            onMouseOver={e => e.currentTarget.style.opacity = 0.8} onMouseOut={e => e.currentTarget.style.opacity = 0.3}>
            View My Page →
          </a>
        </div>
      )}

      {/* back */}
      <div style={{ padding: '32px 24px 60px', textAlign: 'center', borderTop: '1px solid #1a1a1a', marginTop: '40px' }}>
        <Link to="/" style={{ fontFamily: F, fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#f0ede8', opacity: 0.25, textDecoration: 'none', transition: 'opacity 0.2s' }}
          onMouseOver={e => e.currentTarget.style.opacity = 0.7} onMouseOut={e => e.currentTarget.style.opacity = 0.25}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

const centered = { minHeight: '100vh', backgroundColor: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' };
