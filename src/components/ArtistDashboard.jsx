import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import roster from '../rosterData';
import { FaInstagram, FaSpotify, FaApple, FaTiktok, FaYoutube } from 'react-icons/fa';

// ── Cloudinary config ──
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
        resolve(d.secure_url.replace('/upload/', '/upload/c_fill,g_face,w_600,h_600,f_auto,q_auto/'));
      } else reject(new Error('Upload failed'));
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
}

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

// Icon options — no icon by default
const ICON_OPTIONS = [
  { value: '',         label: 'None' },
  { value: 'spotify',  label: 'Spotify' },
  { value: 'apple',    label: 'Apple Music' },
  { value: 'youtube',  label: 'YouTube' },
  { value: 'link',     label: 'Link' },
  { value: 'cd',       label: 'CD' },
];
const ICON_RENDER = {
  spotify: <FaSpotify size={13} />,
  apple:   <FaApple size={13} />,
  youtube: <FaYoutube size={13} />,
  link:    <span style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '13px' }}>—</span>,
  cd:      <span style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '13px' }}>◎</span>,
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

function EmbedPlayer({ url }) {
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
    <iframe src={data.src} width="100%" height="152" frameBorder="0" title="Spotify"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy" style={{ display: 'block' }} />
  );
  return <iframe width="100%" height="166" frameBorder="0" title="SoundCloud" src={data.src} style={{ display: 'block' }} />;
}

function uid() { return Math.random().toString(36).slice(2, 8); }

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
function Input({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', boxSizing: 'border-box', background: 'transparent', border: '1px solid rgba(240,237,232,0.2)', color: '#f0ede8', fontFamily: F, fontSize: '11px', letterSpacing: '0.05em', padding: '10px 12px', outline: 'none', transition: 'border-color 0.15s', WebkitAppearance: 'none', borderRadius: 0 }}
      onFocus={e => e.target.style.borderColor = 'rgba(240,237,232,0.6)'}
      onBlur={e => e.target.style.borderColor = 'rgba(240,237,232,0.2)'} />
  );
}
function Textarea({ value, onChange, onBlur, placeholder, rows = 5 }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur} placeholder={placeholder} rows={rows}
      style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', background: 'transparent', border: '1px solid rgba(240,237,232,0.2)', color: '#f0ede8', fontFamily: F, fontSize: '11px', letterSpacing: '0.05em', padding: '10px 12px', outline: 'none', lineHeight: 1.6, transition: 'border-color 0.15s', WebkitAppearance: 'none', borderRadius: 0 }}
      onFocus={e => e.target.style.borderColor = 'rgba(240,237,232,0.6)'}
      onBlur={e => { e.target.style.borderColor = 'rgba(240,237,232,0.2)'; onBlur && onBlur(); }} />
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

function TypeToggle({ value, onChange }) {
  const types = [['link', '→ Link'], ['locked', 'Locked'], ['embed', '▶ Embed']];
  return (
    <div style={{ display: 'flex', border: '1px solid rgba(240,237,232,0.2)', marginBottom: '12px' }}>
      {types.map(([t, label], i) => (
        <button key={t} onClick={() => onChange(t)} style={{
          flex: 1, padding: '9px 4px', background: value === t ? 'rgba(240,237,232,0.1)' : 'transparent',
          border: 'none', color: '#f0ede8', fontFamily: F, fontSize: '8px', fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
          borderRight: i < types.length - 1 ? '1px solid rgba(240,237,232,0.2)' : 'none',
          opacity: value === t ? 1 : 0.35, transition: 'background 0.15s, opacity 0.15s',
        }}>{label}</button>
      ))}
    </div>
  );
}

/* ─── Touch-aware sortable hook ─── */
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
      onDragOver: e => { e.preventDefault(); if (dragIdx.current !== null && dragIdx.current !== index) moveItem(dragIdx.current, index); },
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

/* ─── OrderRow ─── */
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
      icon = <span style={{ fontSize: '11px', opacity: 0.5 }}>▶</span>;
    } else if (item.type === 'locked') {
      label = item.label || 'Locked link';
      icon = <span style={{ fontSize: '11px', opacity: 0.5, fontFamily: F }}>lock</span>;
    } else {
      label = item.label || 'Link';
      icon = item.icon ? (ICON_RENDER[item.icon] || null) : null;
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

/* ─────────────────────────────────────────────────────────────────────
   ButtonItemCard — MUST be top-level (not defined inside render).
   If defined inside the parent component, every keystroke re-creates
   the component type → React unmounts+remounts it → iOS keyboard closes.
───────────────────────────────────────────────────────────────────── */
function ButtonItemCard({ item, index, isActive, dragHandlers, onUpdate, onRemove, onChangeType }) {
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Only the drag handle row gets the drag handlers.
  // Input areas explicitly stop touch propagation so drag never fires while typing.
  const h = dragHandlers(index);

  return (
    <div
      style={{
        marginBottom: '10px',
        border: `1px solid ${isActive ? 'rgba(240,237,232,0.5)' : 'rgba(240,237,232,0.1)'}`,
        background: isActive ? '#111' : '#080808',
        transform: isActive ? 'scale(1.01)' : 'scale(1)',
        transition: 'border-color 0.12s, background 0.12s, transform 0.12s',
      }}>

      {/* drag handle — only this row has drag+touch handlers */}
      <div
        ref={h.ref}
        draggable={h.draggable}
        onDragStart={h.onDragStart}
        onDragOver={h.onDragOver}
        onDragEnd={h.onDragEnd}
        onTouchStart={h.onTouchStart}
        onTouchMove={h.onTouchMove}
        onTouchEnd={h.onTouchEnd}
        style={{ display: 'flex', alignItems: 'center', padding: '10px 14px 0', opacity: 0.3, cursor: 'grab', userSelect: 'none', touchAction: 'none' }}>
        <span style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.2em' }}>⠿ Hold to drag</span>
        <span style={{ fontFamily: F, fontSize: '9px', marginLeft: 'auto' }}>#{index + 1}</span>
      </div>

      {/* all interactive content — touch events explicitly stopped so they never bubble to drag handler */}
      <div
        style={{ padding: '10px 14px 14px' }}
        onTouchStart={e => e.stopPropagation()}
        onTouchMove={e => e.stopPropagation()}
        onTouchEnd={e => e.stopPropagation()}>

        <TypeToggle value={item.type} onChange={t => onChangeType(item.id, t)} />

        {item.type === 'link' && (
          <>
            <FieldLabel>Label</FieldLabel>
            <div style={{ marginBottom: '10px' }}>
              <Input value={item.label} onChange={v => onUpdate(item.id, 'label', v)} placeholder="e.g. BANDCAMP" />
            </div>
            <FieldLabel>URL</FieldLabel>
            <div style={{ marginBottom: '10px' }}>
              <Input value={item.url} onChange={v => onUpdate(item.id, 'url', v)} placeholder="https://..." />
            </div>
            <button onClick={() => setShowIconPicker(v => !v)}
              style={{ background: 'none', border: 'none', color: '#f0ede8', fontFamily: F, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.3, cursor: 'pointer', padding: 0, marginBottom: showIconPicker ? '10px' : 0 }}>
              {showIconPicker ? '- hide icon' : '+ add icon (optional)'}
            </button>
            {showIconPicker && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {ICON_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => onUpdate(item.id, 'icon', opt.value)}
                    style={{ padding: '6px 10px', background: item.icon === opt.value ? 'rgba(240,237,232,0.15)' : 'transparent', border: `1px solid ${item.icon === opt.value ? 'rgba(240,237,232,0.6)' : 'rgba(240,237,232,0.2)'}`, color: '#f0ede8', fontFamily: F, fontSize: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', letterSpacing: '0.1em' }}>
                    {opt.value && ICON_RENDER[opt.value] ? ICON_RENDER[opt.value] : null}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {item.type === 'locked' && (
          <>
            <FieldLabel>Button label (shown publicly)</FieldLabel>
            <div style={{ marginBottom: '10px' }}>
              <Input value={item.label} onChange={v => onUpdate(item.id, 'label', v)} placeholder="e.g. EXCLUSIVE LINK" />
            </div>
            <FieldLabel>Password</FieldLabel>
            <div style={{ marginBottom: '10px' }}>
              <Input value={item.password || ''} onChange={v => onUpdate(item.id, 'password', v)} placeholder="Enter password" />
            </div>
            <FieldLabel>URL revealed after correct password</FieldLabel>
            <div style={{ marginBottom: '8px' }}>
              <Input value={item.url} onChange={v => onUpdate(item.id, 'url', v)} placeholder="https://..." />
            </div>
            <p style={{ fontFamily: F, fontSize: '8px', opacity: 0.3, letterSpacing: '0.08em', lineHeight: 1.6 }}>
              Visitors see a lock button. Correct password opens the URL.
            </p>
          </>
        )}

        {item.type === 'embed' && (
          <>
            <FieldLabel>Label (optional)</FieldLabel>
            <div style={{ marginBottom: '10px' }}>
              <Input value={item.label} onChange={v => onUpdate(item.id, 'label', v)} placeholder="e.g. Latest Track" />
            </div>
            <FieldLabel>Spotify, YouTube, or SoundCloud URL</FieldLabel>
            <Input value={item.url} onChange={v => onUpdate(item.id, 'url', v)} placeholder="https://open.spotify.com/track/..." />
            {item.url && buildEmbedData(item.url) && (
              <div style={{ marginTop: '12px', opacity: 0.65 }}>
                <EmbedPlayer url={item.url} />
              </div>
            )}
            {item.url && !buildEmbedData(item.url) && (
              <p style={{ fontFamily: F, fontSize: '9px', opacity: 0.35, marginTop: '6px', letterSpacing: '0.1em' }}>
                URL not recognised — try a direct Spotify/YouTube/SoundCloud link
              </p>
            )}
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button onClick={() => onRemove(item.id)}
            style={{ background: 'transparent', border: '1px solid rgba(220,80,80,0.4)', color: 'rgba(220,80,80,0.8)', fontFamily: F, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '6px 12px', cursor: 'pointer' }}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── MiniPreview — top-level, never inside main component ─── */
function MiniPreview({ theme, bio, photoUrl, buttonOrder, customButtons, socials, artistDisplayName, currentPhoto }) {
  const isLight = theme === 'light';
  const previewBg = isLight ? '#f5f3ef' : '#000';
  const previewFg = isLight ? '#0a0a0a' : '#f0ede8';
  const previewMuted = isLight ? 'rgba(10,10,10,0.4)' : 'rgba(240,237,232,0.35)';
  const previewBorder = isLight ? 'rgba(10,10,10,0.12)' : 'rgba(240,237,232,0.1)';
  const previewBtnBorder = isLight ? 'rgba(10,10,10,0.6)' : 'rgba(240,237,232,0.7)';
  const logoFilter = isLight ? 'invert(1)' : 'none';
  const PF = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const orderedItems = buttonOrder.map(key => {
    if (PLATFORM_META[key]) {
      if (key === 'press') return { key: 'press', kind: 'platform', label: 'PRESS' };
      const url = socials[key];
      if (!url || url === 'PLACEHOLDER') return null;
      return { key, kind: 'platform', label: PLATFORM_META[key].label };
    }
    const item = customButtons.find(b => b.id === key);
    if (!item) return null;
    if (item.type === 'embed') return { key, kind: 'embed', url: item.url, label: item.label };
    if (item.type === 'locked') return { key, kind: 'locked', label: item.label || 'Locked' };
    if (item.type === 'link' && item.label && item.url) return { key, kind: 'link', label: item.label };
    return null;
  }).filter(Boolean);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '220px', flexShrink: 0, border: '6px solid #1a1a1a', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px rgba(0,0,0,0.7)', position: 'relative', background: previewBg, transition: 'background 0.3s' }}>
        <div style={{ position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)', width: '48px', height: '10px', background: '#1a1a1a', borderRadius: '8px', zIndex: 10 }} />
        <div style={{ height: '420px', overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', background: previewBg }}>

          <div style={{ overflow: 'hidden', borderBottom: `1px solid ${previewBorder}`, padding: '5px 0', marginTop: '24px' }}>
            <div style={{ display: 'inline-flex', animation: 'marquee 18s linear infinite', whiteSpace: 'nowrap' }}>
              {Array(4).fill('YEN SOUND ®   ').map((t, i) => (
                <span key={i} style={{ fontFamily: PF, fontSize: '5px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: previewMuted, paddingRight: '20px' }}>{t}</span>
              ))}
            </div>
          </div>

          {currentPhoto
            ? <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden' }}><img src={currentPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} /></div>
            : <div style={{ width: '100%', aspectRatio: '1', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontFamily: PF, fontSize: '7px', color: previewMuted, letterSpacing: '0.15em' }}>No Photo</span></div>
          }

          {/* spinning logo — no border line */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <img src="/spinning yen logo white.gif" alt="" style={{ width: '14px', height: '14px', opacity: 0.4, filter: logoFilter }} />
          </div>

          <div style={{ padding: '6px 10px 0', textAlign: 'center' }}>
            <p style={{ fontFamily: PF, fontSize: '8px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: previewFg, marginBottom: bio ? '5px' : 0, lineHeight: 1.3 }}>{artistDisplayName}</p>
            {bio && <p style={{ fontFamily: PF, fontSize: '6px', color: previewMuted, lineHeight: 1.6, letterSpacing: '0.04em' }}>{bio.slice(0, 80)}{bio.length > 80 ? '…' : ''}</p>}
          </div>

          <p style={{ fontFamily: PF, fontSize: '5px', letterSpacing: '0.25em', textTransform: 'uppercase', color: previewMuted, textAlign: 'center', padding: '8px 0 5px' }}>Choose music service</p>

          <div style={{ padding: '0 8px 16px' }}>
            {orderedItems.length === 0 && <p style={{ fontFamily: PF, fontSize: '6px', color: previewMuted, textAlign: 'center', padding: '6px 0' }}>No links set</p>}
            {orderedItems.map((item, i) => {
              if (item.kind === 'embed') {
                const ed = buildEmbedData(item.url);
                return (
                  <div key={i} style={{ marginBottom: '5px', border: `1px solid ${previewBorder}`, overflow: 'hidden' }}>
                    {item.label && <p style={{ fontFamily: PF, fontSize: '5px', letterSpacing: '0.15em', textTransform: 'uppercase', color: previewMuted, textAlign: 'center', padding: '4px 0 2px' }}>{item.label}</p>}
                    {ed?.type === 'youtube' && <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}><iframe src={ed.src} title="yt" frameBorder="0" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }} /></div>}
                    {ed?.type === 'spotify' && <iframe src={ed.src} width="100%" height="60" frameBorder="0" title="sp" style={{ display: 'block', pointerEvents: 'none' }} />}
                    {ed?.type === 'soundcloud' && <iframe src={ed.src} width="100%" height="60" frameBorder="0" title="sc" style={{ display: 'block', pointerEvents: 'none' }} />}
                    {!ed && <div style={{ padding: '8px', textAlign: 'center' }}><span style={{ fontFamily: PF, fontSize: '6px', color: previewMuted }}>▶ {item.label || 'Embed'}</span></div>}
                  </div>
                );
              }
              if (item.kind === 'locked') return (
                <div key={i} style={{ padding: '7px 6px', marginBottom: '4px', border: `1px solid ${previewBtnBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span style={{ fontFamily: PF, fontSize: '6px', opacity: 0.5 }}>lock</span>
                  <span style={{ fontFamily: PF, fontSize: '6px', fontWeight: 700, letterSpacing: '0.2em', color: previewFg, textTransform: 'uppercase' }}>{item.label}</span>
                </div>
              );
              return (
                <div key={i} style={{ padding: '7px 6px', marginBottom: '4px', border: `1px solid ${previewBtnBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: PF, fontSize: '6px', fontWeight: 700, letterSpacing: '0.2em', color: previewFg, textTransform: 'uppercase' }}>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ArtistDashboard() {
  const { artistId } = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [theme, setTheme] = useState('dark');
  const [themeStatus, setThemeStatus] = useState('idle');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);
  const [photoStatus, setPhotoStatus] = useState('idle');
  const photoFileRef = useRef(null);
  const [customButtons, setCustomButtons] = useState([]);
  const [buttonOrder, setButtonOrder] = useState(DEFAULT_ORDER);
  const [activePanel, setActivePanel] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const [bioStatus, setBioStatus] = useState('idle');
  const [btnStatus, setBtnStatus] = useState('idle');
  const [resetStatus, setResetStatus] = useState('idle');
  const [saveError, setSaveError] = useState(null);

  // Frozen snapshot for the preview — only updates on blur/save, never on keystroke.
  // This prevents any re-render of MiniPreview while the iOS keyboard is open.
  const [previewSnapshot, setPreviewSnapshot] = useState(null);

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
        setTheme(data.theme || 'dark');
        const migrated = migrateEmbedUrl(data.custom_buttons || [], data.embed_url || '');
        setCustomButtons(migrated);
        const base = data.button_order?.length ? data.button_order : DEFAULT_ORDER;
        const existingIds = migrated.map(b => b.id);
        const order = [...base, ...existingIds.filter(id => !base.includes(id))];
        setButtonOrder(order);
        // Seed preview snapshot so it shows correct content immediately
        setPreviewSnapshot({ bio: data.bio || '', customButtons: migrated, buttonOrder: order, theme: data.theme || 'dark', photoUrl: data.profile_image || '' });
      }
      setLoading(false);
    }
    fetchArtist();
  }, [artistId]);

  // Call this to push current state into the preview (on blur, after save, etc.)
  function refreshPreview() {
    setPreviewSnapshot({ bio, customButtons, buttonOrder, theme, photoUrl });
  }

  useEffect(() => {
    setButtonOrder(prev => {
      const newIds = customButtons.map(b => b.id).filter(id => !prev.includes(id));
      return newIds.length ? [...prev, ...newIds] : prev;
    });
  }, [customButtons]);

  async function saveBio() {
    setBioStatus('saving'); setSaveError(null);
    const { error } = await supabase.from('artists').update({ bio }).eq('id', artistId);
    if (error) { setSaveError(error.message); setBioStatus('error'); } else { setBioStatus('saved'); refreshPreview(); }
    setTimeout(() => setBioStatus('idle'), 2500);
  }

  async function savePhoto(url) {
    setPhotoStatus('saving'); setSaveError(null);
    const { error } = await supabase.from('artists').update({ profile_image: url || null }).eq('id', artistId);
    if (error) { setSaveError(error.message); setPhotoStatus('error'); }
    else { setPhotoStatus('saved'); setPhotoUrl(url); setPreviewSnapshot(prev => ({ ...(prev || {}), photoUrl: url })); setTimeout(() => setPhotoStatus('idle'), 2500); }
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

  async function saveTheme(val) {
    setTheme(val); setThemeStatus('saving');
    const { error } = await supabase.from('artists').update({ theme: val }).eq('id', artistId);
    if (error) { setThemeStatus('error'); alert('Save error: ' + error.message); }
    else { setThemeStatus('saved'); setPreviewSnapshot(prev => ({ ...(prev || {}), theme: val })); setTimeout(() => setThemeStatus('idle'), 2500); }
  }

  async function saveButtons() {
    setBtnStatus('saving'); setSaveError(null);
    const { error } = await supabase.from('artists').update({ custom_buttons: customButtons, button_order: buttonOrder }).eq('id', artistId);
    if (error) { setSaveError(error.message); setBtnStatus('error'); } else { setBtnStatus('saved'); refreshPreview(); }
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

  const addItem = useCallback((type) => {
    const id = uid();
    setCustomButtons(prev => [...prev,
      type === 'embed'  ? { id, type: 'embed',  url: '',  label: '' } :
      type === 'locked' ? { id, type: 'locked', url: '',  label: '', password: '' } :
                          { id, type: 'link',   url: '',  label: '', icon: '' }
    ]);
  }, []);

  const updateItem = useCallback((id, field, val) => {
    setCustomButtons(prev => prev.map(b => b.id === id ? { ...b, [field]: val } : b));
  }, []);

  const removeItem = useCallback((id) => {
    setCustomButtons(prev => prev.filter(b => b.id !== id));
    setButtonOrder(prev => prev.filter(k => k !== id));
  }, []);

  const changeItemType = useCallback((id, newType) => {
    setCustomButtons(prev => prev.map(b => b.id === id ? { ...b, type: newType } : b));
  }, []);

  if (loading) return <div style={centered}><p style={{ fontFamily: F, fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.3, color: '#f0ede8' }}>Loading</p></div>;
  if (!artist) return (
    <div style={centered}>
      <p style={{ fontFamily: F, fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.4, color: '#f0ede8' }}>Artist not found</p>
      <Link to="/" style={{ color: '#f0ede8', fontFamily: F, fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: '24px', opacity: 0.35, textDecoration: 'none' }}>Back</Link>
    </div>
  );

  const folders = [
    { id: 'submit',       label: 'Submit a Release', icon: '＋', href: 'https://docs.google.com/forms/d/e/1FAIpQLSe8rH0NRf1YBN-rD78uuzIoLxwZjJAl4qBKPn7tQ0hZeNr59w/viewform?usp=header', external: true },
    { id: 'distribution', label: 'Distribution Form', icon: '↓', href: '/docs/YEN_DISTRIBUTION_FORM.pdf', download: true },
    { id: 'vault',        label: 'Vault',             icon: '◈', href: artist.upload_url, external: true },
    { id: 'releases',     label: 'My Releases',       icon: '♫', href: `/releases?artist=${encodeURIComponent(artist.filter_name || artistId)}`, internal: true },
  ];

  const tileHov   = e => { e.currentTarget.style.borderColor = 'rgba(240,237,232,0.5)'; e.currentTarget.style.background = '#0a0a0a'; };
  const tileUnhov = e => { e.currentTarget.style.borderColor = 'rgba(240,237,232,0.15)'; e.currentTarget.style.background = 'transparent'; };

  const fullOrderList = buttonOrder.filter(key => PLATFORM_META[key] || customButtons.find(b => b.id === key));

  const snap = previewSnapshot || { bio, customButtons, buttonOrder, theme, photoUrl };
  const miniPreviewProps = {
    theme: snap.theme,
    bio: snap.bio,
    buttonOrder: snap.buttonOrder,
    customButtons: snap.customButtons,
    socials,
    photoUrl: snap.photoUrl,
    artistDisplayName: (rosterArtist?.displayName || artist.display_name || '').toUpperCase(),
    currentPhoto: (typeof snap.photoUrl === 'string' && snap.photoUrl && !snap.photoUrl.startsWith('blob:') ? snap.photoUrl : null) || rosterArtist?.image || null,
  };

  /* Section accordion — safe inside render because it holds no state and contains no inputs */
  const Section = ({ id, label, icon, children }) => {
    const open = activePanel === id;
    return (
      <div style={{ borderBottom: '1px solid rgba(240,237,232,0.1)' }}>
        <button onClick={() => setActivePanel(open ? null : id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', background: open ? '#0d0d0d' : 'transparent', border: 'none', color: '#f0ede8', cursor: 'pointer', transition: 'background 0.15s' }}>
          <span style={{ fontFamily: F, fontSize: '15px', opacity: 0.7, lineHeight: 1 }}>{icon}</span>
          <span style={{ fontFamily: F, fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', flex: 1, textAlign: 'left' }}>{label}</span>
          {/* plain CSS chevron — no emoji */}
          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRight: '1.5px solid rgba(240,237,232,0.4)', borderBottom: '1.5px solid rgba(240,237,232,0.4)', transform: open ? 'rotate(225deg) translateY(-3px)' : 'rotate(45deg)', transition: 'transform 0.2s', marginRight: '4px' }} />
        </button>
        {open && <div style={{ padding: '4px 20px 24px' }}>{children}</div>}
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#f0ede8', maxWidth: '600px', margin: '0 auto' }}>

      {/* ── Editor drawer ── */}
      {showPreview && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#050505', overflowY: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column' }}>

          <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: '#050505', borderBottom: '1px solid rgba(240,237,232,0.1)' }}>
            <p style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.4 }}>Edit My Page</p>
            <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: '1px solid rgba(240,237,232,0.2)', color: '#f0ede8', cursor: 'pointer', fontFamily: F, fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', padding: '6px 14px' }}>Done</button>
          </div>

          <div style={{ padding: '20px 20px 0' }}>
            <p style={{ fontFamily: F, fontSize: '8px', letterSpacing: '0.25em', textTransform: 'uppercase', opacity: 0.25, marginBottom: '10px', textAlign: 'center' }}>Preview</p>
            <MiniPreview {...miniPreviewProps} />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px', alignItems: 'center' }}>
              <button onClick={refreshPreview}
                style={{ background: 'none', border: '1px solid rgba(240,237,232,0.15)', color: '#f0ede8', fontFamily: F, fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.35, cursor: 'pointer', padding: '4px 10px' }}
                onMouseOver={e => e.currentTarget.style.opacity = 0.8} onMouseOut={e => e.currentTarget.style.opacity = 0.35}>
                Refresh
              </button>
              {artist.slug && (
                <a href={`/artist/${artist.slug}`} target="_blank" rel="noreferrer"
                  style={{ fontFamily: F, fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f0ede8', opacity: 0.3, textDecoration: 'none' }}
                  onMouseOver={e => e.currentTarget.style.opacity = 0.8} onMouseOut={e => e.currentTarget.style.opacity = 0.3}>
                  Open full page →
                </a>
              )}
            </div>
          </div>

          {saveError && (
            <div style={{ margin: '16px 20px 0', padding: '12px 16px', border: '1px solid rgba(220,80,80,0.4)', background: 'rgba(220,80,80,0.06)' }}>
              <p style={{ fontFamily: F, fontSize: '10px', color: 'rgba(255,120,120,0.9)', lineHeight: 1.6 }}>Save failed — {saveError}</p>
            </div>
          )}

          <div style={{ marginTop: '20px', borderTop: '1px solid rgba(240,237,232,0.1)' }}>

            <Section id="bio" label="Bio" icon="✎">
              <Textarea value={bio} onChange={setBio} onBlur={refreshPreview} placeholder="Write a short bio..." rows={5} />
              <div style={{ marginTop: '12px' }}>
                <ActionBtn onClick={saveBio} disabled={bioStatus === 'saving'}>
                  {bioStatus === 'saving' ? 'Saving...' : bioStatus === 'saved' ? 'Saved' : 'Save Bio'}
                </ActionBtn>
              </div>
            </Section>

            <Section id="photo" label="Photo" icon="◻">
              <div onClick={() => photoFileRef.current?.click()}
                style={{ width: '100px', height: '100px', margin: '8px auto 14px', overflow: 'hidden', background: '#111', border: '1px solid rgba(240,237,232,0.2)', cursor: 'pointer', position: 'relative' }}>
                {photoUrl
                  ? <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2, fontFamily: F, fontSize: '9px' }}>No Photo</div>
                }
                {photoUploading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <div style={{ width: '56px', height: '2px', background: '#222' }}><div style={{ width: `${photoProgress}%`, height: '100%', background: '#f0ede8', transition: 'width 0.2s' }} /></div>
                    <span style={{ fontFamily: F, fontSize: '8px', color: '#f0ede8', opacity: 0.7 }}>{photoProgress}%</span>
                  </div>
                )}
                {!photoUploading && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.55)', padding: '3px 0', textAlign: 'center' }}>
                    <span style={{ fontFamily: F, fontSize: '7px', letterSpacing: '0.12em', color: '#f0ede8', opacity: 0.6, textTransform: 'uppercase' }}>Tap to Upload</span>
                  </div>
                )}
              </div>
              <input ref={photoFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handlePhotoFile(e.target.files?.[0])} />
              <p style={{ fontFamily: F, fontSize: '8px', opacity: 0.3, letterSpacing: '0.08em', lineHeight: 1.6, textAlign: 'center', marginBottom: '12px' }}>Any shape → auto-cropped square, face-aware.</p>
              <FieldLabel>Or paste image URL</FieldLabel>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={typeof photoUrl === 'string' && photoUrl.startsWith('blob:') ? '' : photoUrl}
                  onChange={e => setPhotoUrl(e.target.value)} placeholder="https://..."
                  style={{ flex: 1, background: 'transparent', border: '1px solid rgba(240,237,232,0.2)', color: '#f0ede8', fontFamily: F, fontSize: '11px', padding: '10px 12px', outline: 'none', borderRadius: 0, WebkitAppearance: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(240,237,232,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(240,237,232,0.2)'} />
                <button onClick={() => savePhoto(photoUrl.trim())} disabled={photoStatus === 'saving' || photoUploading}
                  style={{ flexShrink: 0, padding: '10px 14px', background: 'transparent', border: '1px solid rgba(240,237,232,0.5)', color: '#f0ede8', fontFamily: F, fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', opacity: (photoStatus === 'saving' || photoUploading) ? 0.4 : 1 }}>
                  {photoStatus === 'saving' ? '...' : photoStatus === 'saved' ? 'Saved' : 'Save'}
                </button>
              </div>
              {artist.profile_image && (
                <button onClick={() => savePhoto('')} style={{ marginTop: '8px', background: 'none', border: 'none', color: 'rgba(220,80,80,0.6)', fontFamily: F, fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', padding: 0 }}>Remove photo</button>
              )}
            </Section>

            <Section id="theme" label="Theme" icon="◑">
              <p style={{ fontFamily: F, fontSize: '9px', opacity: 0.4, letterSpacing: '0.08em', lineHeight: 1.7, marginBottom: '14px' }}>Choose how your public page looks to visitors.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <button onClick={() => saveTheme('dark')} style={{ padding: '22px 12px', border: theme === 'dark' ? '2px solid rgba(240,237,232,0.8)' : '1px solid rgba(240,237,232,0.15)', background: '#000', color: '#f0ede8', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'border-color 0.15s' }}>
                  <span style={{ fontFamily: F, fontSize: '18px' }}>◐</span>
                  <span style={{ fontFamily: F, fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Dark</span>
                  {theme === 'dark' && <span style={{ fontFamily: F, fontSize: '7px', letterSpacing: '0.2em', color: 'rgba(100,255,180,0.85)', textTransform: 'uppercase' }}>Active</span>}
                </button>
                <button onClick={() => saveTheme('light')} style={{ padding: '22px 12px', border: theme === 'light' ? '2px solid rgba(10,10,10,0.8)' : '1px solid rgba(10,10,10,0.15)', background: '#f5f3ef', color: '#0a0a0a', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'border-color 0.15s' }}>
                  <span style={{ fontFamily: F, fontSize: '18px' }}>◑</span>
                  <span style={{ fontFamily: F, fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Light</span>
                  {theme === 'light' && <span style={{ fontFamily: F, fontSize: '7px', letterSpacing: '0.2em', color: 'rgba(0,140,80,0.9)', textTransform: 'uppercase' }}>Active</span>}
                </button>
              </div>
              {themeStatus === 'saved' && <p style={{ fontFamily: F, fontSize: '9px', color: 'rgba(100,255,180,0.85)', letterSpacing: '0.1em', textAlign: 'center' }}>Saved</p>}
            </Section>

            <Section id="buttons" label="Links & Embeds" icon="⊞">
              {customButtons.length === 0 && <p style={{ fontFamily: F, fontSize: '10px', opacity: 0.25, textAlign: 'center', padding: '12px 0' }}>No items yet — add below</p>}
              {customButtons.map((item, i) => (
                <ButtonItemCard
                  key={item.id}
                  item={item}
                  index={i}
                  isActive={customActiveIdx === i}
                  dragHandlers={customHandlers}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                  onChangeType={changeItemType}
                />
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', margin: '8px 0 14px' }}>
                {[['link','+ Link'], ['locked','+ Locked'], ['embed','+ Embed']].map(([type, label]) => (
                  <button key={type} onClick={() => addItem(type)}
                    style={{ padding: '12px 6px', background: 'transparent', border: '1px dashed rgba(240,237,232,0.2)', color: '#f0ede8', fontFamily: F, fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(240,237,232,0.5)'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(240,237,232,0.2)'}>
                    {label}
                  </button>
                ))}
              </div>
              <ActionBtn onClick={saveButtons} disabled={btnStatus === 'saving'}>
                {btnStatus === 'saving' ? 'Saving...' : btnStatus === 'saved' ? 'Saved' : 'Save'}
              </ActionBtn>
            </Section>

            <Section id="order" label="Button Order" icon="-">
              <p style={{ fontFamily: F, fontSize: '8px', opacity: 0.3, letterSpacing: '0.12em', lineHeight: 1.6, marginBottom: '12px' }}>Hold and drag to reorder. On mobile, hold 0.4s then drag.</p>
              {fullOrderList.length === 0 && <p style={{ fontFamily: F, fontSize: '10px', opacity: 0.25, textAlign: 'center', padding: '12px 0' }}>Add custom items first</p>}
              {fullOrderList.map((key, i) => (
                <OrderRow key={key} itemKey={key} index={i} customButtons={customButtons} socials={socials} dragHandlers={orderHandlers} isActive={orderActiveIdx === i} />
              ))}
              <div style={{ marginTop: '12px' }}>
                <ActionBtn onClick={saveButtons} disabled={btnStatus === 'saving'}>
                  {btnStatus === 'saving' ? 'Saving...' : btnStatus === 'saved' ? 'Saved' : 'Save Order'}
                </ActionBtn>
              </div>
            </Section>

            <Section id="reset" label="Reset" icon="↺">
              <p style={{ fontFamily: F, fontSize: '10px', opacity: 0.5, letterSpacing: '0.08em', lineHeight: 1.8, marginBottom: '16px' }}>Removes all custom buttons, embeds, and resets order. Bio, photo, theme, streaming links and releases remain.</p>
              <ActionBtn onClick={resetPage} danger disabled={resetStatus === 'saving'}>
                {resetStatus === 'saving' ? 'Resetting...' : resetStatus === 'saved' ? 'Done' : 'Reset to Default'}
              </ActionBtn>
            </Section>

          </div>
          <div style={{ height: '60px', flexShrink: 0 }} />
        </div>
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

      <div style={{ padding: '40px 24px 32px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: F, fontSize: '17px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f0ede8', marginBottom: '6px' }}>Welcome, {artist.display_name}</h1>
        <p style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.25 }}>Artist Dashboard</p>
      </div>

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

      <div style={{ padding: '40px 24px 0' }}>
        <p style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', opacity: 0.2, textAlign: 'center', marginBottom: '16px' }}>My Page</p>
        <button onClick={() => { setActivePanel(null); setShowPreview(true); }}
          style={{ width: '100%', padding: '22px 24px', border: '2px solid rgba(240,237,232,0.8)', background: 'transparent', color: '#f0ede8', fontFamily: F, fontSize: '12px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseOver={e => e.currentTarget.style.background = '#111'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
          Edit My Page
        </button>
        {artist.slug && (
          <a href={`/artist/${artist.slug}`} target="_blank" rel="noreferrer"
            style={{ display: 'block', textAlign: 'center', marginTop: '14px', fontFamily: F, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#f0ede8', opacity: 0.25, textDecoration: 'none', transition: 'opacity 0.2s' }}
            onMouseOver={e => e.currentTarget.style.opacity = 0.7} onMouseOut={e => e.currentTarget.style.opacity = 0.25}>
            View My Page →
          </a>
        )}
      </div>

      <div style={{ padding: '40px 24px 60px', textAlign: 'center', borderTop: '1px solid #1a1a1a', marginTop: '40px' }}>
        <Link to="/" style={{ fontFamily: F, fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#f0ede8', opacity: 0.25, textDecoration: 'none', transition: 'opacity 0.2s' }}
          onMouseOver={e => e.currentTarget.style.opacity = 0.7} onMouseOut={e => e.currentTarget.style.opacity = 0.25}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}

const centered = { minHeight: '100vh', backgroundColor: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' };
