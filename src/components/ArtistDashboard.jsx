import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import roster from '../rosterData';
import { FaInstagram, FaSpotify, FaApple, FaTiktok, FaYoutube } from 'react-icons/fa';

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

const ICON_OPTIONS = [
  { value: '',        label: 'None' },
  { value: 'spotify', label: 'Spotify' },
  { value: 'apple',   label: 'Apple Music' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'link',    label: 'Link' },
  { value: 'cd',      label: 'CD' },
];
const ICON_RENDER = {
  spotify: <FaSpotify size={13} />,
  apple:   <FaApple size={13} />,
  youtube: <FaYoutube size={13} />,
  link:    <span style={{ fontSize: '13px' }}>—</span>,
  cd:      <span style={{ fontSize: '13px' }}>◎</span>,
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
  const already = buttons.some(b => b.type === 'embed' && b.url === embedUrl.trim());
  if (already) return buttons;
  return [...buttons, { id: uid(), type: 'embed', url: embedUrl.trim(), label: '' }];
}

/* ─── Shared input styles ─── */
const inputStyle = {
  width: '100%', boxSizing: 'border-box', background: 'transparent',
  border: '1px solid rgba(240,237,232,0.2)', color: '#f0ede8',
  fontFamily: F, fontSize: '16px', letterSpacing: '0.05em',
  padding: '12px 12px', outline: 'none', borderRadius: 0, WebkitAppearance: 'none',
};
function focusBorder(e) { e.target.style.borderColor = 'rgba(240,237,232,0.6)'; }
function blurBorder(e)  { e.target.style.borderColor = 'rgba(240,237,232,0.2)'; }

function FieldLabel({ children }) {
  return <p style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.35, marginBottom: '6px' }}>{children}</p>;
}

function ActionBtn({ onClick, children, danger = false, disabled = false }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'block', width: '100%', padding: '16px 24px', minHeight: '52px',
      border: danger ? '2px solid rgba(220,80,80,0.6)' : '2px solid rgba(240,237,232,0.8)',
      background: 'transparent', color: danger ? 'rgba(220,80,80,0.9)' : '#f0ede8',
      fontFamily: F, fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em',
      textTransform: 'uppercase', cursor: disabled ? 'default' : 'pointer',
      transition: 'background 0.15s', opacity: disabled ? 0.4 : 1, boxSizing: 'border-box',
      WebkitTapHighlightColor: 'transparent',
    }}
      onMouseOver={e => { if (!disabled) e.currentTarget.style.background = danger ? 'rgba(220,80,80,0.08)' : '#111'; }}
      onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}>
      {children}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   Section — MUST be top-level. If defined inside render(), React
   creates a new component type on every parent re-render, which
   unmounts/remounts children → focused inputs lose focus → keyboard closes.
══════════════════════════════════════════════════════════════ */
function Section({ id, activePanel, setActivePanel, label, icon, children }) {
  const open = activePanel === id;
  return (
    <div style={{ borderBottom: '1px solid rgba(240,237,232,0.1)' }}>
      <button
        onClick={() => setActivePanel(open ? null : id)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 20px', minHeight: '56px', background: open ? '#0d0d0d' : 'transparent', border: 'none', color: '#f0ede8', cursor: 'pointer', transition: 'background 0.15s', WebkitTapHighlightColor: 'transparent' }}>
        <span style={{ fontFamily: F, fontSize: '15px', opacity: 0.7, lineHeight: 1 }}>{icon}</span>
        <span style={{ fontFamily: F, fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', flex: 1, textAlign: 'left' }}>{label}</span>
        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRight: '1.5px solid rgba(240,237,232,0.4)', borderBottom: '1.5px solid rgba(240,237,232,0.4)', transform: open ? 'rotate(225deg) translateY(-2px)' : 'rotate(45deg)', transition: 'transform 0.2s', marginRight: '4px' }} />
      </button>
      {open && <div style={{ padding: '4px 20px 28px' }}>{children}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   BioEditor — top-level, local state for typing.
   Parent state only updated on blur → zero parent re-renders while typing.
══════════════════════════════════════════════════════════════ */
function BioEditor({ initialBio, onSave, saveStatus }) {
  const [local, setLocal] = useState(initialBio);
  // Sync if parent resets (e.g. after load)
  const prev = useRef(initialBio);
  if (initialBio !== prev.current) { prev.current = initialBio; setLocal(initialBio); }

  return (
    <>
      <textarea
        value={local}
        onChange={e => setLocal(e.target.value)}
        onBlur={() => onSave(local, false)}
        placeholder="Write a short bio..."
        rows={5}
        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, width: '100%', boxSizing: 'border-box' }}
        onFocus={focusBorder}
      />
      <div style={{ marginTop: '12px' }}>
        <ActionBtn onClick={() => onSave(local, true)} disabled={saveStatus === 'saving'}>
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save Bio'}
        </ActionBtn>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   TypeToggle
══════════════════════════════════════════════════════════════ */
function TypeToggle({ value, onChange }) {
  const types = [['link', '→ Link'], ['locked', 'Locked'], ['embed', '▶ Embed']];
  return (
    <div style={{ display: 'flex', border: '1px solid rgba(240,237,232,0.2)', marginBottom: '12px' }}>
      {types.map(([t, lbl], i) => (
        <button key={t} onClick={() => onChange(t)} style={{
          flex: 1, padding: '9px 4px', background: value === t ? 'rgba(240,237,232,0.1)' : 'transparent',
          border: 'none', color: '#f0ede8', fontFamily: F, fontSize: '8px', fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
          borderRight: i < types.length - 1 ? '1px solid rgba(240,237,232,0.2)' : 'none',
          opacity: value === t ? 1 : 0.35, transition: 'background 0.15s, opacity 0.15s',
        }}>{lbl}</button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ButtonItemCard — top-level, local state for all text fields.
   Flushes to parent only on blur → typing never re-renders parent.
══════════════════════════════════════════════════════════════ */
function ButtonItemCard({ item, index, isActive, dragHandlers, onFlush, onRemove, onChangeType, artistId }) {
  const [localLabel,    setLocalLabel]    = useState(item.label    || '');
  const [localUrl,      setLocalUrl]      = useState(item.url      || '');
  const [localPassword, setLocalPassword] = useState(item.password || '');
  const [localImage,    setLocalImage]    = useState(item.image    || '');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [imgUploading,  setImgUploading]  = useState(false);
  const [imgProgress,   setImgProgress]   = useState(0);
  const imgFileRef = useRef(null);

  // Sync if item replaced from outside (e.g. type change resets fields)
  const prevId = useRef(item.id);
  const prevType = useRef(item.type);
  if (item.id !== prevId.current || item.type !== prevType.current) {
    prevId.current = item.id;
    prevType.current = item.type;
    setLocalLabel(item.label || '');
    setLocalUrl(item.url || '');
    setLocalPassword(item.password || '');
    setLocalImage(item.image || '');
  }

  function flush(overrides = {}) {
    onFlush(item.id, { label: localLabel, url: localUrl, password: localPassword, image: localImage, ...overrides });
  }

  async function handleImageFile(file) {
    if (!file) return;
    if (CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME') { alert('Cloudinary not configured.'); return; }
    setImgUploading(true); setImgProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', `yen-sound/artists/${artistId}/buttons`);
      const url = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
        xhr.upload.onprogress = e => { if (e.lengthComputable) setImgProgress(Math.round((e.loaded / e.total) * 100)); };
        xhr.onload = () => {
          if (xhr.status === 200) {
            const d = JSON.parse(xhr.responseText);
            resolve(d.secure_url.replace('/upload/', '/upload/c_fill,ar_4:3,f_auto,q_auto/'));
          } else reject(new Error('Upload failed'));
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
      });
      setLocalImage(url);
      onFlush(item.id, { image: url });
    } catch (err) { alert('Upload failed: ' + err.message); }
    setImgUploading(false);
  }

  const h = dragHandlers(index);

  return (
    <div style={{
      marginBottom: '10px',
      border: `1px solid ${isActive ? 'rgba(240,237,232,0.5)' : 'rgba(240,237,232,0.1)'}`,
      background: isActive ? '#111' : '#080808',
      transform: isActive ? 'scale(1.01)' : 'scale(1)',
      transition: 'border-color 0.12s, background 0.12s, transform 0.12s',
    }}>
      {/* drag handle — only this strip has drag+touch handlers */}
      <div ref={h.ref} draggable={h.draggable}
        onDragStart={h.onDragStart} onDragOver={h.onDragOver} onDragEnd={h.onDragEnd}
        onTouchStart={h.onTouchStart} onTouchMove={h.onTouchMove} onTouchEnd={h.onTouchEnd}
        style={{ display: 'flex', alignItems: 'center', padding: '10px 14px 0', opacity: 0.3, cursor: 'grab', userSelect: 'none', touchAction: 'none' }}>
        <span style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.2em' }}>⠿ Hold to drag</span>
        <span style={{ fontFamily: F, fontSize: '9px', marginLeft: 'auto' }}>#{index + 1}</span>
      </div>

      {/* fields — touch events stopped so they never bubble to drag handle */}
      <div style={{ padding: '10px 14px 14px' }}
        onTouchStart={e => e.stopPropagation()}
        onTouchMove={e => e.stopPropagation()}
        onTouchEnd={e => e.stopPropagation()}>

        <TypeToggle value={item.type} onChange={t => onChangeType(item.id, t)} />

        {item.type === 'link' && (
          <>
            <FieldLabel>Label</FieldLabel>
            <div style={{ marginBottom: '10px' }}>
              <input value={localLabel} onChange={e => setLocalLabel(e.target.value)}
                onBlur={() => flush()} placeholder="e.g. BANDCAMP"
                style={inputStyle} onFocus={focusBorder} />
            </div>
            <FieldLabel>URL</FieldLabel>
            <div style={{ marginBottom: '10px' }}>
              <input value={localUrl} onChange={e => setLocalUrl(e.target.value)}
                onBlur={() => flush()} placeholder="https://..."
                style={inputStyle} onFocus={focusBorder} />
            </div>

            {/* Image section */}
            <FieldLabel>Cover Image (optional · 4:3)</FieldLabel>
            {localImage ? (
              <div style={{ marginBottom: '10px', position: 'relative' }}>
                <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden', background: '#111', marginBottom: '6px' }}>
                  <img src={localImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => imgFileRef.current?.click()}
                    style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid rgba(240,237,232,0.2)', color: '#f0ede8', fontFamily: F, fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>
                    Replace
                  </button>
                  <button onClick={() => { setLocalImage(''); onFlush(item.id, { image: '' }); }}
                    style={{ padding: '8px 14px', background: 'transparent', border: '1px solid rgba(220,80,80,0.4)', color: 'rgba(220,80,80,0.8)', fontFamily: F, fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '10px' }}>
                {/* Upload button */}
                <div onClick={() => imgFileRef.current?.click()}
                  style={{ width: '100%', aspectRatio: '4/3', background: '#0a0a0a', border: '1px dashed rgba(240,237,232,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px', position: 'relative' }}>
                  {imgUploading ? (
                    <>
                      <div style={{ width: '80px', height: '2px', background: '#222' }}>
                        <div style={{ width: `${imgProgress}%`, height: '100%', background: '#f0ede8', transition: 'width 0.2s' }} />
                      </div>
                      <span style={{ fontFamily: F, fontSize: '8px', opacity: 0.4, letterSpacing: '0.1em' }}>{imgProgress}%</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontFamily: F, fontSize: '18px', opacity: 0.2 }}>+</span>
                      <span style={{ fontFamily: F, fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.3 }}>Upload Image</span>
                    </>
                  )}
                </div>
                {/* URL paste */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input value={localImage} onChange={e => setLocalImage(e.target.value)}
                    onBlur={() => flush()} placeholder="or paste image URL..."
                    style={{ ...inputStyle, fontSize: '13px' }} onFocus={focusBorder} />
                </div>
              </div>
            )}
            <input ref={imgFileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => handleImageFile(e.target.files?.[0])} />

            <button onClick={() => setShowIconPicker(v => !v)}
              style={{ background: 'none', border: 'none', color: '#f0ede8', fontFamily: F, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.3, cursor: 'pointer', padding: 0, marginBottom: showIconPicker ? '10px' : 0 }}>
              {showIconPicker ? '- hide icon' : '+ add icon (optional)'}
            </button>
            {showIconPicker && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {ICON_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => { onFlush(item.id, { icon: opt.value }); }}
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
              <input value={localLabel} onChange={e => setLocalLabel(e.target.value)}
                onBlur={() => flush()} placeholder="e.g. EXCLUSIVE LINK"
                style={inputStyle} onFocus={focusBorder} />
            </div>
            <FieldLabel>Password</FieldLabel>
            <div style={{ marginBottom: '10px' }}>
              <input value={localPassword} onChange={e => setLocalPassword(e.target.value)}
                onBlur={() => flush()} placeholder="Enter password"
                style={inputStyle} onFocus={focusBorder} />
            </div>
            <FieldLabel>URL revealed after correct password</FieldLabel>
            <div style={{ marginBottom: '8px' }}>
              <input value={localUrl} onChange={e => setLocalUrl(e.target.value)}
                onBlur={() => flush()} placeholder="https://..."
                style={inputStyle} onFocus={focusBorder} />
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
              <input value={localLabel} onChange={e => setLocalLabel(e.target.value)}
                onBlur={() => flush()} placeholder="e.g. Latest Track"
                style={inputStyle} onFocus={focusBorder} />
            </div>
            <FieldLabel>Spotify, YouTube, or SoundCloud URL</FieldLabel>
            <input value={localUrl} onChange={e => setLocalUrl(e.target.value)}
              onBlur={() => flush()} placeholder="https://open.spotify.com/track/..."
              style={inputStyle} onFocus={focusBorder} />
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

/* ══════════════════════════════════════════════════════════════
   Touch-aware sortable hook
══════════════════════════════════════════════════════════════ */
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
    setList(prev => { const a = [...prev]; const [m] = a.splice(from, 1); a.splice(to, 0, m); return a; });
    dragIdx.current = to; setActiveIdx(to);
  }

  const handlers = useCallback((index) => ({
    ref: el => { rowRefs.current[index] = el; },
    draggable: true,
    onDragStart: () => { dragIdx.current = index; setActiveIdx(index); },
    onDragOver: e => { e.preventDefault(); if (dragIdx.current !== null && dragIdx.current !== index) moveItem(dragIdx.current, index); },
    onDragEnd: () => { dragIdx.current = null; setActiveIdx(null); },
    onTouchStart: e => {
      startY.current = e.touches[0].clientY;
      longPressTimer.current = setTimeout(() => {
        isDragging.current = true; dragIdx.current = index; setActiveIdx(index);
        if (navigator.vibrate) navigator.vibrate(30);
      }, 400);
    },
    onTouchMove: e => {
      if (!isDragging.current) { if (Math.abs(e.touches[0].clientY - startY.current) > 8) clearTimeout(longPressTimer.current); return; }
      e.preventDefault();
      const target = getRowAtY(e.touches[0].clientY);
      if (target !== null && dragIdx.current !== null && target !== dragIdx.current) moveItem(dragIdx.current, target);
    },
    onTouchEnd: () => { clearTimeout(longPressTimer.current); isDragging.current = false; dragIdx.current = null; setActiveIdx(null); },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  return { handlers, activeIdx };
}

/* ══════════════════════════════════════════════════════════════
   OrderRow
══════════════════════════════════════════════════════════════ */
function OrderRow({ itemKey, index, customButtons, socials, dragHandlers, isActive }) {
  const platform = PLATFORM_META[itemKey];
  let label, icon, dimmed = false;

  if (platform) {
    label = platform.label; icon = platform.icon;
    dimmed = itemKey !== 'press' && !(socials[itemKey] && socials[itemKey] !== 'PLACEHOLDER');
  } else {
    const item = customButtons.find(b => b.id === itemKey);
    if (!item) return null;
    if (item.type === 'embed') { const svc = detectEmbedService(item.url); label = item.label || (svc ? `${svc} embed` : 'Embed'); icon = <span style={{ fontSize: '11px', opacity: 0.5 }}>▶</span>; }
    else if (item.type === 'locked') { label = item.label || 'Locked link'; icon = <span style={{ fontSize: '10px', opacity: 0.5, fontFamily: F }}>lock</span>; }
    else { label = item.label || 'Link'; icon = item.icon ? (ICON_RENDER[item.icon] || null) : null; }
  }

  const h = dragHandlers(index);
  return (
    <div ref={h.ref} draggable={h.draggable}
      onDragStart={h.onDragStart} onDragOver={h.onDragOver} onDragEnd={h.onDragEnd}
      onTouchStart={h.onTouchStart} onTouchMove={h.onTouchMove} onTouchEnd={h.onTouchEnd}
      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', marginBottom: '6px', userSelect: 'none', touchAction: 'none', border: `1px solid ${isActive ? 'rgba(240,237,232,0.5)' : 'rgba(240,237,232,0.1)'}`, background: isActive ? '#111' : '#050505', cursor: 'grab', opacity: dimmed ? 0.3 : 1, transform: isActive ? 'scale(1.015)' : 'scale(1)', transition: 'border-color 0.12s, background 0.12s, transform 0.12s' }}>
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

/* ══════════════════════════════════════════════════════════════
   MiniPreview — top-level, receives a frozen snapshot
══════════════════════════════════════════════════════════════ */
function MiniPreview({ theme, bio, photoUrl, buttonOrder, customButtons, socials, artistDisplayName, currentPhoto }) {
  const isLight = theme === 'light';
  const bg = isLight ? '#f5f3ef' : '#000';
  const fg = isLight ? '#0a0a0a' : '#f0ede8';
  const muted = isLight ? 'rgba(10,10,10,0.4)' : 'rgba(240,237,232,0.35)';
  const border = isLight ? 'rgba(10,10,10,0.12)' : 'rgba(240,237,232,0.1)';
  const btnBorder = isLight ? 'rgba(10,10,10,0.6)' : 'rgba(240,237,232,0.7)';
  const logoFilter = isLight ? 'invert(1)' : 'none';
  const PF = F;

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
      <div style={{ width: '220px', flexShrink: 0, border: '6px solid #1a1a1a', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px rgba(0,0,0,0.7)', background: bg, transition: 'background 0.3s' }}>
        <div style={{ position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)', width: '48px', height: '10px', background: '#1a1a1a', borderRadius: '8px', zIndex: 10 }} />
        <div style={{ height: '420px', overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', background: bg }}>
          <div style={{ overflow: 'hidden', borderBottom: `1px solid ${border}`, padding: '5px 0', marginTop: '24px' }}>
            <div style={{ display: 'inline-flex', animation: 'marquee 18s linear infinite', whiteSpace: 'nowrap' }}>
              {Array(4).fill('YEN SOUND ®   ').map((t, i) => <span key={i} style={{ fontFamily: PF, fontSize: '5px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: muted, paddingRight: '20px' }}>{t}</span>)}
            </div>
          </div>
          {currentPhoto
            ? <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden' }}><img src={currentPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} /></div>
            : <div style={{ width: '100%', aspectRatio: '1', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontFamily: PF, fontSize: '7px', color: muted, letterSpacing: '0.15em' }}>No Photo</span></div>
          }
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <img src="/spinning yen logo white.gif" alt="" style={{ width: '14px', height: '14px', opacity: 0.4, filter: logoFilter }} />
          </div>
          <div style={{ padding: '6px 10px 0', textAlign: 'center' }}>
            <p style={{ fontFamily: PF, fontSize: '8px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: fg, marginBottom: bio ? '5px' : 0, lineHeight: 1.3 }}>{artistDisplayName}</p>
            {bio && <p style={{ fontFamily: PF, fontSize: '6px', color: muted, lineHeight: 1.6, letterSpacing: '0.04em' }}>{bio.slice(0, 80)}{bio.length > 80 ? '…' : ''}</p>}
          </div>
          <p style={{ fontFamily: PF, fontSize: '5px', letterSpacing: '0.25em', textTransform: 'uppercase', color: muted, textAlign: 'center', padding: '8px 0 5px' }}>Choose music service</p>
          <div style={{ padding: '0 8px 16px' }}>
            {orderedItems.length === 0 && <p style={{ fontFamily: PF, fontSize: '6px', color: muted, textAlign: 'center', padding: '6px 0' }}>No links set</p>}
            {orderedItems.map((item, i) => {
              if (item.kind === 'embed') {
                const ed = buildEmbedData(item.url);
                return (
                  <div key={i} style={{ marginBottom: '5px', border: `1px solid ${border}`, overflow: 'hidden' }}>
                    {item.label && <p style={{ fontFamily: PF, fontSize: '5px', letterSpacing: '0.15em', textTransform: 'uppercase', color: muted, textAlign: 'center', padding: '4px 0 2px' }}>{item.label}</p>}
                    {ed?.type === 'youtube' && <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}><iframe src={ed.src} title="yt" frameBorder="0" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }} /></div>}
                    {ed?.type === 'spotify' && <iframe src={ed.src} width="100%" height="60" frameBorder="0" title="sp" style={{ display: 'block', pointerEvents: 'none' }} />}
                    {ed?.type === 'soundcloud' && <iframe src={ed.src} width="100%" height="60" frameBorder="0" title="sc" style={{ display: 'block', pointerEvents: 'none' }} />}
                    {!ed && <div style={{ padding: '8px', textAlign: 'center' }}><span style={{ fontFamily: PF, fontSize: '6px', color: muted }}>▶ {item.label || 'Embed'}</span></div>}
                  </div>
                );
              }
              if (item.kind === 'locked') return (
                <div key={i} style={{ padding: '7px 6px', marginBottom: '4px', border: `1px solid ${btnBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span style={{ fontFamily: PF, fontSize: '6px', opacity: 0.5 }}>lock</span>
                  <span style={{ fontFamily: PF, fontSize: '6px', fontWeight: 700, letterSpacing: '0.2em', color: fg, textTransform: 'uppercase' }}>{item.label}</span>
                </div>
              );
              return (
                <div key={i} style={{ padding: '7px 6px', marginBottom: '4px', border: `1px solid ${btnBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: PF, fontSize: '6px', fontWeight: 700, letterSpacing: '0.2em', color: fg, textTransform: 'uppercase' }}>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
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

  // Frozen snapshot for preview — only updates on explicit refresh, never on keystrokes
  const [previewSnapshot, setPreviewSnapshot] = useState(null);

  const { handlers: customHandlers, activeIdx: customActiveIdx } = useTouchSort(setCustomButtons);
  const { handlers: orderHandlers, activeIdx: orderActiveIdx } = useTouchSort(setButtonOrder);

  const rosterArtist = artist?.slug ? roster.find(r => r.slug === artist.slug) : null;
  const socials = rosterArtist?.socials || {};

  function buildSnapshot(overrides = {}) {
    return { bio, customButtons, buttonOrder, theme, photoUrl, ...overrides };
  }
  function refreshPreview(overrides = {}) {
    setPreviewSnapshot(buildSnapshot(overrides));
  }

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
        const order = [...base, ...migrated.map(b => b.id).filter(id => !base.includes(id))];
        setButtonOrder(order);
        setPreviewSnapshot({ bio: data.bio || '', customButtons: migrated, buttonOrder: order, theme: data.theme || 'dark', photoUrl: data.profile_image || '' });
      }
      setLoading(false);
    }
    fetchArtist();
  }, [artistId]);

  useEffect(() => {
    setButtonOrder(prev => {
      const newIds = customButtons.map(b => b.id).filter(id => !prev.includes(id));
      return newIds.length ? [...prev, ...newIds] : prev;
    });
  }, [customButtons]);

  async function saveBio(value, explicit) {
    setBio(value);
    if (!explicit) return; // blur just updates local, explicit Save button actually saves
    setBioStatus('saving'); setSaveError(null);
    const { error } = await supabase.from('artists').update({ bio: value }).eq('id', artistId);
    if (error) { setSaveError(error.message); setBioStatus('error'); }
    else { setBioStatus('saved'); refreshPreview({ bio: value }); }
    setTimeout(() => setBioStatus('idle'), 2500);
  }

  async function savePhoto(url) {
    setPhotoStatus('saving'); setSaveError(null);
    const { error } = await supabase.from('artists').update({ profile_image: url || null }).eq('id', artistId);
    if (error) { setSaveError(error.message); setPhotoStatus('error'); }
    else { setPhotoStatus('saved'); setPhotoUrl(url); setPreviewSnapshot(p => ({ ...(p || buildSnapshot()), photoUrl: url })); setTimeout(() => setPhotoStatus('idle'), 2500); }
  }

  async function handlePhotoFile(file) {
    if (!file) return;
    if (CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME') { alert('Cloudinary not configured — paste a URL instead.'); return; }
    setPhotoUrl(URL.createObjectURL(file));
    setPhotoUploading(true); setPhotoProgress(0);
    try {
      const url = await uploadSquarePhoto(file, `yen-sound/artists/${artistId}`, setPhotoProgress);
      setPhotoUploading(false);
      await savePhoto(url);
    } catch (err) { setPhotoUploading(false); setPhotoStatus('error'); alert('Upload failed: ' + err.message); }
  }

  async function saveTheme(val) {
    setTheme(val); setThemeStatus('saving');
    const { error } = await supabase.from('artists').update({ theme: val }).eq('id', artistId);
    if (error) { setThemeStatus('error'); alert('Save error: ' + error.message); }
    else { setThemeStatus('saved'); setPreviewSnapshot(p => ({ ...(p || buildSnapshot()), theme: val })); setTimeout(() => setThemeStatus('idle'), 2500); }
  }

  async function saveButtons() {
    setBtnStatus('saving'); setSaveError(null);
    const { error } = await supabase.from('artists').update({ custom_buttons: customButtons, button_order: buttonOrder }).eq('id', artistId);
    if (error) { setSaveError(error.message); setBtnStatus('error'); }
    else { setBtnStatus('saved'); refreshPreview(); }
    setTimeout(() => setBtnStatus('idle'), 2500);
  }

  async function resetPage() {
    if (!window.confirm('Remove all custom buttons, embeds, and reset order?')) return;
    setResetStatus('saving'); setSaveError(null);
    const { error } = await supabase.from('artists').update({ custom_buttons: [], embed_url: '', button_order: DEFAULT_ORDER }).eq('id', artistId);
    if (error) { setSaveError(error.message); setResetStatus('error'); }
    else { setCustomButtons([]); setButtonOrder(DEFAULT_ORDER); setResetStatus('saved'); refreshPreview({ customButtons: [], buttonOrder: DEFAULT_ORDER }); }
    setTimeout(() => setResetStatus('idle'), 2500);
  }

  const addItem = useCallback((type) => {
    const id = uid();
    setCustomButtons(prev => [...prev,
      type === 'embed'  ? { id, type: 'embed',  url: '', label: '' } :
      type === 'locked' ? { id, type: 'locked', url: '', label: '', password: '' } :
                          { id, type: 'link',   url: '', label: '', icon: '' }
    ]);
  }, []);

  // flush is called from ButtonItemCard on blur — merges partial fields into the item
  const flushItem = useCallback((id, fields) => {
    setCustomButtons(prev => prev.map(b => b.id === id ? { ...b, ...fields } : b));
  }, []);

  const removeItem = useCallback((id) => {
    setCustomButtons(prev => prev.filter(b => b.id !== id));
    setButtonOrder(prev => prev.filter(k => k !== id));
  }, []);

  const changeItemType = useCallback((id, newType) => {
    setCustomButtons(prev => prev.map(b => b.id === id ? { ...b, type: newType, label: '', url: '', password: '' } : b));
  }, []);

  if (loading) return <div style={centered}><p style={{ fontFamily: F, fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.3, color: '#f0ede8' }}>Loading</p></div>;
  if (!artist) return (
    <div style={centered}>
      <p style={{ fontFamily: F, fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.4, color: '#f0ede8' }}>Artist not found</p>
      <Link to="/" style={{ color: '#f0ede8', fontFamily: F, fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: '24px', opacity: 0.35, textDecoration: 'none' }}>Back</Link>
    </div>
  );

  const folders = [
    { id: 'submit',       label: 'Submit a Release', icon: '＋', href: 'https://docs.google.com/forms/d/e/1FAIpQLSe8rH0NRf1YBN-rD78uuzIoLxwZjJAl4qBKPn7tQ0hZeNr59w/viewform?usp=header' },
    { id: 'distribution', label: 'Distribution Form', icon: '↓', href: '/docs/YEN_DISTRIBUTION_FORM.pdf', download: true },
    { id: 'vault',        label: 'Vault',             icon: '◈', href: artist.upload_url },
    { id: 'releases',     label: 'My Releases',       icon: '♫', href: `/releases?artist=${encodeURIComponent(artist.filter_name || artistId)}`, internal: true },
  ];

  const tileHov   = e => { e.currentTarget.style.borderColor = 'rgba(240,237,232,0.5)'; e.currentTarget.style.background = '#0a0a0a'; };
  const tileUnhov = e => { e.currentTarget.style.borderColor = 'rgba(240,237,232,0.15)'; e.currentTarget.style.background = 'transparent'; };

  const fullOrderList = buttonOrder.filter(key => PLATFORM_META[key] || customButtons.find(b => b.id === key));

  const snap = previewSnapshot || buildSnapshot();
  const miniPreviewProps = {
    theme: snap.theme, bio: snap.bio, buttonOrder: snap.buttonOrder,
    customButtons: snap.customButtons, socials,
    photoUrl: snap.photoUrl,
    artistDisplayName: (rosterArtist?.displayName || artist.display_name || '').toUpperCase(),
    currentPhoto: (snap.photoUrl && !snap.photoUrl.startsWith('blob:') ? snap.photoUrl : null) || rosterArtist?.image || null,
  };

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#f0ede8', maxWidth: '480px', margin: '0 auto', paddingBottom: 'env(safe-area-inset-bottom)' }}>

      {/* ── Editor drawer ── */}
      {showPreview && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#050505', overflowY: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* sticky header — full width */}
          <div style={{ position: 'sticky', top: 0, zIndex: 10, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', paddingTop: 'calc(14px + env(safe-area-inset-top))', background: '#050505', borderBottom: '1px solid rgba(240,237,232,0.1)' }}>
            <p style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.4 }}>Edit My Page</p>
            <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: '1px solid rgba(240,237,232,0.2)', color: '#f0ede8', cursor: 'pointer', fontFamily: F, fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', padding: '10px 18px', minHeight: '44px' }}>Done</button>
          </div>

          {/* desktop: two-col; mobile: single col */}
          <div style={{ width: '100%', maxWidth: '960px', display: 'flex', flexDirection: 'row', alignItems: 'flex-start', flex: 1 }}>

            {/* LEFT — sticky preview (hidden on narrow screens via inline media-ish trick using a class) */}
            <div className="dash-preview-col" style={{ position: 'sticky', top: '57px', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', alignSelf: 'flex-start' }}>
              <p style={{ fontFamily: F, fontSize: '8px', letterSpacing: '0.25em', textTransform: 'uppercase', opacity: 0.25, textAlign: 'center' }}>Preview</p>
              <MiniPreview {...miniPreviewProps} />
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'center' }}>
                <button onClick={() => refreshPreview()}
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

            {/* RIGHT — editor */}
            <div style={{ flex: 1, minWidth: 0, borderLeft: '1px solid rgba(240,237,232,0.07)' }}>

          {saveError && (
            <div style={{ margin: '16px 20px 0', padding: '12px 16px', border: '1px solid rgba(220,80,80,0.4)', background: 'rgba(220,80,80,0.06)' }}>
              <p style={{ fontFamily: F, fontSize: '10px', color: 'rgba(255,120,120,0.9)', lineHeight: 1.6 }}>Save failed — {saveError}</p>
            </div>
          )}

          {/* accordion */}
          <div style={{ marginTop: '20px', borderTop: '1px solid rgba(240,237,232,0.1)' }}>

            <Section id="bio" activePanel={activePanel} setActivePanel={setActivePanel} label="Bio" icon="✎">
              <BioEditor initialBio={bio} onSave={saveBio} saveStatus={bioStatus} />
            </Section>

            <Section id="photo" activePanel={activePanel} setActivePanel={setActivePanel} label="Photo" icon="◻">
              <div onClick={() => photoFileRef.current?.click()}
                style={{ width: '100px', height: '100px', margin: '8px auto 14px', overflow: 'hidden', background: '#111', border: '1px solid rgba(240,237,232,0.2)', cursor: 'pointer', position: 'relative' }}>
                {photoUrl
                  ? <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
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
              <p style={{ fontFamily: F, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.35, marginBottom: '6px' }}>Or paste image URL</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={typeof photoUrl === 'string' && photoUrl.startsWith('blob:') ? '' : photoUrl}
                  onChange={e => setPhotoUrl(e.target.value)} placeholder="https://..."
                  style={{ ...inputStyle, flex: 1 }} onFocus={focusBorder} onBlur={blurBorder} />
                <button onClick={() => savePhoto(photoUrl.trim())} disabled={photoStatus === 'saving' || photoUploading}
                  style={{ flexShrink: 0, padding: '10px 14px', background: 'transparent', border: '1px solid rgba(240,237,232,0.5)', color: '#f0ede8', fontFamily: F, fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', opacity: (photoStatus === 'saving' || photoUploading) ? 0.4 : 1 }}>
                  {photoStatus === 'saving' ? '...' : photoStatus === 'saved' ? 'Saved' : 'Save'}
                </button>
              </div>
              {artist.profile_image && (
                <button onClick={() => savePhoto('')} style={{ marginTop: '8px', background: 'none', border: 'none', color: 'rgba(220,80,80,0.6)', fontFamily: F, fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', padding: 0 }}>Remove photo</button>
              )}
            </Section>

            <Section id="theme" activePanel={activePanel} setActivePanel={setActivePanel} label="Theme" icon="◑">
              <p style={{ fontFamily: F, fontSize: '9px', opacity: 0.4, letterSpacing: '0.08em', lineHeight: 1.7, marginBottom: '14px' }}>Choose how your public page looks to visitors.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <button onClick={() => saveTheme('dark')} style={{ padding: '22px 12px', border: theme === 'dark' ? '2px solid rgba(240,237,232,0.8)' : '1px solid rgba(240,237,232,0.15)', background: '#000', color: '#f0ede8', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: F, fontSize: '18px' }}>◐</span>
                  <span style={{ fontFamily: F, fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Dark</span>
                  {theme === 'dark' && <span style={{ fontFamily: F, fontSize: '7px', letterSpacing: '0.2em', color: 'rgba(100,255,180,0.85)', textTransform: 'uppercase' }}>Active</span>}
                </button>
                <button onClick={() => saveTheme('light')} style={{ padding: '22px 12px', border: theme === 'light' ? '2px solid rgba(10,10,10,0.8)' : '1px solid rgba(10,10,10,0.15)', background: '#f5f3ef', color: '#0a0a0a', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: F, fontSize: '18px' }}>◑</span>
                  <span style={{ fontFamily: F, fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Light</span>
                  {theme === 'light' && <span style={{ fontFamily: F, fontSize: '7px', letterSpacing: '0.2em', color: 'rgba(0,140,80,0.9)', textTransform: 'uppercase' }}>Active</span>}
                </button>
              </div>
              {themeStatus === 'saved' && <p style={{ fontFamily: F, fontSize: '9px', color: 'rgba(100,255,180,0.85)', letterSpacing: '0.1em', textAlign: 'center' }}>Saved</p>}
            </Section>

            <Section id="buttons" activePanel={activePanel} setActivePanel={setActivePanel} label="Links & Embeds" icon="⊞">
              {customButtons.length === 0 && <p style={{ fontFamily: F, fontSize: '10px', opacity: 0.25, textAlign: 'center', padding: '12px 0' }}>No items yet — add below</p>}
              {customButtons.map((item, i) => (
                <ButtonItemCard
                  key={item.id}
                  item={item}
                  index={i}
                  isActive={customActiveIdx === i}
                  dragHandlers={customHandlers}
                  onFlush={flushItem}
                  onRemove={removeItem}
                  onChangeType={changeItemType}
                  artistId={artistId}
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

            <Section id="order" activePanel={activePanel} setActivePanel={setActivePanel} label="Button Order" icon="=">
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

            <Section id="reset" activePanel={activePanel} setActivePanel={setActivePanel} label="Reset" icon="↺">
              <p style={{ fontFamily: F, fontSize: '10px', opacity: 0.5, letterSpacing: '0.08em', lineHeight: 1.8, marginBottom: '16px' }}>Removes all custom buttons, embeds, and resets order. Bio, photo, theme, streaming links and releases remain.</p>
              <ActionBtn onClick={resetPage} danger disabled={resetStatus === 'saving'}>
                {resetStatus === 'saving' ? 'Resetting...' : resetStatus === 'saved' ? 'Done' : 'Reset to Default'}
              </ActionBtn>
            </Section>

          </div>
          <div style={{ height: '60px', flexShrink: 0 }} />
          </div>{/* end right col */}
          </div>{/* end two-col */}
        </div>
      )}

      {/* logo + marquee */}
      <div style={{ paddingTop: 'calc(36px + env(safe-area-inset-top))' }}>
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
            const base = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', minHeight: '110px', border: '1px solid rgba(240,237,232,0.15)', color: '#f0ede8', textDecoration: 'none', cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s', background: 'transparent', WebkitTapHighlightColor: 'transparent' };
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
          style={{ width: '100%', padding: '24px 24px', minHeight: '68px', border: '2px solid rgba(240,237,232,0.8)', background: 'transparent', color: '#f0ede8', fontFamily: F, fontSize: '12px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.15s', WebkitTapHighlightColor: 'transparent' }}
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
