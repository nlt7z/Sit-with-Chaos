// Home Repair flow — REVISED pass (v2).
// Uber Base (light) design system, refined: merged header status, lower
// information density, blind one-by-one quote reveal (20-min validity),
// viewport-fit phone, interactive quick replies + review sheet, and a new
// AI-agent scenario. Original prototype lives in app.js untouched.

// Extra keyframes for the revised motion system — injected once at boot so the
// packed template's stylesheet doesn't need to change.
(function () {
  if (typeof document === 'undefined') return;
  if (document.getElementById('rvx-styles')) return;
  const s = document.createElement('style');
  s.id = 'rvx-styles';
  s.textContent = `
    @keyframes rvx-shimmer { 0% { background-position: -180px 0; } 100% { background-position: 180px 0; } }
    @keyframes rvx-reveal { 0% { opacity: 0; transform: translateY(10px) scale(.97); filter: blur(3px); } 60% { filter: blur(0); } 100% { opacity: 1; transform: none; filter: blur(0); } }
    @keyframes rvx-pop { 0% { opacity: 0; transform: scale(.6); } 70% { transform: scale(1.06); } 100% { opacity: 1; transform: scale(1); } }
    @keyframes rvx-ring { 0% { box-shadow: 0 0 0 0 rgba(0,0,0,.18); } 100% { box-shadow: 0 0 0 8px rgba(0,0,0,0); } }
    @keyframes rvx-stream { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
    @keyframes rvx-ai-spin { to { transform: rotate(360deg); } }
    @keyframes rvx-breathe { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
    @keyframes rvx-bar { from { width: 0; } }
    .rvx-skel { background: linear-gradient(90deg, #EEEEEE 25%, #F6F6F6 45%, #EEEEEE 65%); background-size: 360px 100%; animation: rvx-shimmer 1.3s linear infinite; }
  `;
  document.head.appendChild(s);
})();

// ─── Uber Base · light tokens ───────────────────────────────────────
const MT = {
  // primary action = Uber black
  brand:       '#000000',
  brandHover:  '#1F1F1F',
  brandDeep:   '#000000',
  brandSoft:   '#F3F3F3',
  brandTint:   '#F6F6F6',
  brandInk:    '#FFFFFF',   // text/icon sitting ON the black brand fill
  // surfaces — mono ramp
  bg:          '#F6F6F6',   // mono200 — chat canvas
  surface:     '#FFFFFF',   // mono100
  surfaceAlt:  '#F6F6F6',   // mono200
  surfaceDeep: '#EEEEEE',   // mono300
  // content
  ink:         '#000000',   // contentPrimary
  inkSoft:     '#141414',   // body copy (near-black)
  inkLight:    '#545454',   // contentSecondary
  muted:       '#757575',   // contentTertiary (mono700)
  mutedSoft:   '#AFAFAF',   // mono600
  hairline:    '#E2E2E2',   // borderOpaque (mono400)
  divider:     '#EBEBEB',
  // semantics
  red:         '#000000',   // prices/ratings now render as black (Base treats $ as content)
  redDeep:     '#000000',
  redBg:       '#FFEFED',
  negative:    '#E11900',   // true error / expired
  negBg:       '#FDECEA',
  green:       '#05944F',   // Base positive
  greenDeep:   '#048848',
  greenBg:     '#E7F2EC',
  blue:        '#276EF1',   // Base accent
  blueBg:      '#EEF3FE',
  // AI identity — Meituan yellow, never blue
  ai:          '#FFD100',
  aiInk:       '#8A6A00',   // readable amber for AI text on white
  aiBg:        '#FFF7CC',
  aiBorder:    '#F0DD8C',
  orange:      '#BB8B2D',
  // chat bubbles — outgoing black, incoming white
  meBubble:    '#000000',
  meInk:       '#FFFFFF',
  botBubble:   '#FFFFFF',
  proBubble:   '#FFFFFF',
  // elevation
  shadowSm:    '0 1px 1px rgba(0,0,0,.03), 0 2px 4px rgba(0,0,0,.04)',
  shadowMd:    '0 1px 2px rgba(0,0,0,.05), 0 8px 22px -6px rgba(0,0,0,.10)',
  shadowLg:    '0 16px 48px -16px rgba(0,0,0,.30), 0 4px 14px -6px rgba(0,0,0,.10)',
};
const FF = {
  text:    "'Manrope', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
  display: "'Manrope', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
  num:     "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
};

const __RM = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
const __R = (id, path) => (typeof window !== 'undefined' && window.__resources && window.__resources[id]) || path;

// ─── Chrome ─────────────────────────────────────────────────────────
// iOS status bar — faithful to the system spec: SF-style 17pt semibold time on
// the left, then cellular (4 ascending bars), Wi-Fi (3 nested arcs) and the
// battery capsule at true proportions on the right.
function StatusBar({ tint = MT.ink } = {}) {
  return (
    <div style={{
      height: 59, padding: '21px 30px 0 34px', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: FF.num, fontWeight: 600, fontSize: 17, color: tint,
      lineHeight: 1, letterSpacing: '-0.3px',
    }}>
      <span className="tnum">9:41</span>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Cellular */}
        <svg width="19" height="12" viewBox="0 0 19.2 12.2" fill="none">
          <rect x="0" y="7.6" width="3.4" height="4.6" rx="1.1" fill={tint}/>
          <rect x="5.2" y="5" width="3.4" height="7.2" rx="1.1" fill={tint}/>
          <rect x="10.4" y="2.5" width="3.4" height="9.7" rx="1.1" fill={tint}/>
          <rect x="15.6" y="0" width="3.4" height="12.2" rx="1.1" fill={tint}/>
        </svg>
        {/* Wi-Fi */}
        <svg width="17" height="12" viewBox="0 0 17.1 12.2" fill="none">
          <path d="M8.55 2.44c2.5 0 4.9.98 6.68 2.74a.55.55 0 0 0 .78 0l1.28-1.28a.57.57 0 0 0 0-.8A12.5 12.5 0 0 0 8.55 0C5.3 0 2.2 1.28-.06 3.1a.57.57 0 0 0 0 .8L1.1 5.18a.55.55 0 0 0 .78 0A9.45 9.45 0 0 1 8.55 2.44z" transform="translate(0.06 0)" fill={tint}/>
          <path d="M8.55 6.5c1.4 0 2.75.55 3.75 1.53a.55.55 0 0 0 .78 0l1.28-1.27a.57.57 0 0 0 0-.8 8.25 8.25 0 0 0-11.62 0 .57.57 0 0 0 0 .8l1.27 1.27a.55.55 0 0 0 .79 0A5.32 5.32 0 0 1 8.55 6.5z" fill={tint}/>
          <path d="M10.7 10.42a.55.55 0 0 0 0-.79 3.05 3.05 0 0 0-4.3 0 .55.55 0 0 0 0 .79l1.75 1.76a.55.55 0 0 0 .79 0l1.76-1.76z" fill={tint}/>
        </svg>
        {/* Battery */}
        <svg width="27" height="13" viewBox="0 0 27.4 13" fill="none">
          <rect x="0.5" y="0.5" width="24" height="12" rx="3.8" stroke={tint} strokeOpacity="0.35"/>
          <path d="M26 4.28v4.34c.87-.36 1.44-1.2 1.44-2.17 0-.97-.57-1.8-1.44-2.17z" fill={tint} fillOpacity="0.4"/>
          <rect x="2" y="2" width="21" height="9" rx="2.4" fill={tint}/>
        </svg>
      </div>
    </div>
  );
}

function HomeIndicator() {
  return (
    <div style={{ height: 22, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: 7, flexShrink: 0 }}>
      <div style={{ width: 134, height: 5, borderRadius: 100, background: MT.ink }} />
    </div>
  );
}

// Header — title, live status (merged from the old status strip) and the step
// rail in one block. One fewer band on screen; the status reads under the name.
function headerStatus({ stage, scenario, vendor, ai }) {
  if (scenario === 'off-hours')    return { text: 'After hours · back 9 AM', dot: MT.muted };
  if (scenario === 'return-visit') return { text: 'Order #4729 · complete', dot: MT.green };
  if (ai) {
    if (stage <= 1) return { text: 'AI agent · answers in seconds', dot: MT.ai, pulse: true };
    if (stage === 2 || stage === 3) return { text: 'AI diagnosing · human on standby', dot: MT.ai, pulse: true };
    return vendor ? { text: 'Booked · tracking arrival', dot: MT.green, pulse: true }
                  : { text: 'Collecting quotes', dot: MT.ai, pulse: true };
  }
  if (stage === 1) return { text: 'Assistant ready', dot: MT.ink };
  if (stage === 2) return { text: 'Mike Chen · Plumbing, 8 yrs', dot: MT.green, pulse: true };
  if (stage === 3) return { text: 'Drafting order #4729', dot: MT.ink, pulse: true };
  return vendor ? { text: 'Booked · tracking arrival', dot: MT.green, pulse: true }
                : { text: 'Collecting quotes', dot: MT.ink, pulse: true };
}

function Header({ active = 1, onBack, stage = 1, scenario, vendor, ai }) {
  const steps = ai ? ['Describe', 'AI check', 'Plan', 'Match'] : ['Describe', 'Diagnose', 'Plan', 'Match'];
  const progressPct = Math.min(100, ((active - 1) / (steps.length - 1)) * 100);
  const st = headerStatus({ stage, scenario, vendor, ai });
  return (
    <div style={{ background: MT.surface, borderBottom: `1px solid ${MT.divider}`, flexShrink: 0 }}>
      <div style={{ height: 50, display: 'flex', alignItems: 'center', padding: '0 14px', justifyContent: 'space-between' }}>
        <button onClick={onBack} className="btn-press" style={{ width: 44, height: 44, border: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <svg width="10" height="18" viewBox="0 0 11 20"><path d="M9 1L1 10l8 9" stroke={MT.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        </button>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{
            fontFamily: FF.display, fontSize: 16, fontWeight: 700,
            color: MT.ink, letterSpacing: '-0.2px', lineHeight: '19px',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            {ai ? 'Repair AI' : 'Repair Expert'}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              fontSize: 10, fontWeight: 800, fontFamily: FF.text, letterSpacing: '.3px',
              color: ai ? MT.aiInk : MT.greenDeep, background: ai ? MT.aiBg : MT.greenBg,
              border: `1px solid ${ai ? MT.aiBorder : '#C3E3D2'}`,
              borderRadius: 100, padding: '1px 7px', textTransform: 'uppercase',
            }}>
              <svg width="8" height="8" viewBox="0 0 6 6"><circle cx="3" cy="3" r="3" fill={ai ? MT.ai : MT.green}/><path d="M1.6 3l1 1 1.8-2.1" stroke="#fff" strokeWidth="0.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {ai ? 'AI' : 'Official'}
            </span>
          </span>
          {/* Live status — replaces the old separate status strip */}
          <div key={st.text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: MT.muted, fontFamily: FF.text, animation: 'soft-in .35s ease-out both' }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: st.dot, flexShrink: 0, animation: st.pulse ? 'rvx-breathe 1.6s ease-in-out infinite' : 'none' }} />
            <span style={{ whiteSpace: 'nowrap' }}>{st.text}</span>
          </div>
        </div>
        <button className="btn-press" style={{ width: 44, height: 44, border: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <svg width="18" height="5" viewBox="0 0 20 5"><circle cx="2.5" cy="2.5" r="1.6" fill={MT.ink}/><circle cx="10" cy="2.5" r="1.6" fill={MT.ink}/><circle cx="17.5" cy="2.5" r="1.6" fill={MT.ink}/></svg>
        </button>
      </div>
      {/* Step rail — plain dots (small), wide inset from the bezel */}
      <div style={{ padding: '8px 32px 14px' }}>
        <div style={{ position: 'relative', height: 3, borderRadius: 2, background: MT.surfaceDeep }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progressPct}%`,
            background: MT.brand, borderRadius: 2,
            transition: 'width .6s cubic-bezier(.2,.8,.2,1)',
          }} />
          {steps.map((_, i) => {
            const left = (i / (steps.length - 1)) * 100;
            const idx = i + 1;
            const isActive = idx === active;
            const isPast = idx < active;
            return (
              <div key={i} style={{ position: 'absolute', left: `${left}%`, top: '50%', transform: 'translate(-50%, -50%)' }}>
                <div style={{
                  width: isActive ? 9 : 6, height: isActive ? 9 : 6, borderRadius: '50%',
                  background: isActive ? MT.surface : (isPast ? MT.brand : MT.surfaceDeep),
                  border: isActive ? `2px solid ${MT.brand}` : 'none',
                  transition: 'all .35s cubic-bezier(.2,.8,.2,1)',
                  animation: isActive ? 'step-ping 2s ease-out infinite' : 'none',
                }} />
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
          {steps.map((s, i) => {
            const idx = i + 1;
            const isActive = idx === active;
            const isPast = idx < active;
            return (
              <span key={s} style={{
                fontSize: 12, fontFamily: FF.text,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? MT.ink : (isPast ? MT.inkLight : MT.muted),
                transition: 'color .3s',
              }}>{s}</span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick }) {
  return (
    <button onClick={onClick} className="btn-press" style={{
      width: 40, height: 40, borderRadius: 20, border: 0,
      background: MT.surfaceAlt,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', padding: 0,
    }}>{children}</button>
  );
}

function Composer({ leftLabel, placeholder = 'Reply to Mike Chen…' }) {
  // Sits low: minimal bottom padding so the field hugs the home indicator.
  return (
    <div style={{ background: MT.surface, padding: '10px 12px 2px', flexShrink: 0 }}>
      {leftLabel && (
        <div style={{ marginLeft: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: MT.muted, fontFamily: FF.text, textTransform: 'uppercase', letterSpacing: '.6px', fontWeight: 700 }}>{leftLabel}</span>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconBtn>
          <svg width="16" height="18" viewBox="0 0 16 18" fill="none"><rect x="5.5" y="1" width="5" height="9" rx="2.5" stroke={MT.inkLight} strokeWidth="1.5"/><path d="M2 8a6 6 0 0 0 12 0M8 14v3" stroke={MT.inkLight} strokeWidth="1.5" strokeLinecap="round"/></svg>
        </IconBtn>
        <div style={{
          flex: 1, height: 38, background: MT.surfaceAlt, borderRadius: 8,
          display: 'flex', alignItems: 'center', padding: '0 14px',
          color: MT.muted, fontSize: 14, fontFamily: FF.text,
        }}>{placeholder}</div>
        <IconBtn>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke={MT.inkLight} strokeWidth="1.5"/><circle cx="6.5" cy="7.8" r="0.9" fill={MT.inkLight}/><circle cx="11.5" cy="7.8" r="0.9" fill={MT.inkLight}/><path d="M6 11c1.2 1.4 4.8 1.4 6 0" stroke={MT.inkLight} strokeWidth="1.4" strokeLinecap="round" fill="none"/></svg>
        </IconBtn>
        <IconBtn>
          <svg width="18" height="18" viewBox="0 0 14 14"><path d="M7 1.5v11M1.5 7h11" stroke={MT.inkLight} strokeWidth="1.6" strokeLinecap="round"/></svg>
        </IconBtn>
      </div>
    </div>
  );
}

// ─── Avatars ────────────────────────────────────────────────────────
function BotAvatar() {
  return (
    <div style={{
      width: 34, height: 34, borderRadius: 17, flexShrink: 0,
      background: MT.ink,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="20" height="18" viewBox="0 0 24 22" fill="none">
        <path d="M12 2a10 10 0 0 1 10 10v2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M2 12A10 10 0 0 1 12 2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
        <rect x="1" y="12" width="4" height="7" rx="2" stroke="#fff" strokeWidth="1.7"/>
        <rect x="19" y="12" width="4" height="7" rx="2" stroke="#fff" strokeWidth="1.7"/>
        <path d="M23 19v1a3 3 0 0 1-3 3h-3" stroke="#fff" strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

const EXPERTS = {
  default: { src: __R('expertImg', 'assets/expert.webp'), pos: '50% 6%' },
  local:   { src: __R('localExpertImg', 'assets/local-expert.webp'), pos: '50% 32%' },
};
let CUR_EXPERT = EXPERTS.default;
function ProAvatar({ noVerify }) {
  return (
    <div style={{ width: 34, height: 34, flexShrink: 0, position: 'relative' }}>
      <div style={{ width: 34, height: 34, borderRadius: 17, overflow: 'hidden', background: '#E8E8E8' }}>
        <img src={CUR_EXPERT.src} alt="Mike Chen" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: CUR_EXPERT.pos, display: 'block' }} />
      </div>
      {!noVerify && (
        <span style={{
          position: 'absolute', right: -3, bottom: -3,
          width: 14, height: 14, borderRadius: 7,
          background: MT.green, border: `2px solid ${MT.surface}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="7" height="7" viewBox="0 0 6 6"><path d="M1 3l1.5 1.5L5 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        </span>
      )}
    </div>
  );
}

function UserAvatar() {
  return (
    <div style={{
      width: 34, height: 34, borderRadius: 17, flexShrink: 0,
      overflow: 'hidden', background: '#CFCFCF',
    }}>
      <img
        src={__R('userProfileImg', 'assets/user-profile.jpeg')}
        alt="User"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 15%', display: 'block' }}
      />
    </div>
  );
}

// ─── Bubbles ────────────────────────────────────────────────────────
const EASE_OUT    = 'cubic-bezier(.16,.84,.44,1)';
const ENTER       = { animation: `msg-in .34s ${EASE_OUT} both`, transformOrigin: '0 100%' };
const ENTER_RIGHT = { animation: `msg-in-right .34s ${EASE_OUT} both`, transformOrigin: '100% 100%' };
const ENTER_SOFT  = { animation: `soft-in .3s ${EASE_OUT} both` };

function BotBubble({ children, tight, wide }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: `${tight ? 1 : 7}px 16px`, alignItems: 'flex-start', ...ENTER }}>
      <BotAvatar />
      <div style={{
        background: MT.botBubble, borderRadius: '4px 14px 14px 14px',
        padding: '12px 16px', fontSize: 15, lineHeight: '23px',
        maxWidth: 272,
        color: MT.inkSoft, fontFamily: FF.text,
        border: `1px solid ${MT.divider}`,
      }}>{children}</div>
    </div>
  );
}

function ProBubble({ children, tight }) {
  return (
    <div style={{ padding: `${tight ? 1 : 7}px 16px`, ...ENTER }}>
      {!tight && (
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginLeft: 44, marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: MT.ink, fontWeight: 700, fontFamily: FF.text }}>Mike Chen</span>
        <span style={{ fontSize: 12, color: MT.muted, fontFamily: FF.text }}>· Plumbing specialist</span>
      </div>
      )}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <ProAvatar />
        <div style={{
          background: MT.proBubble, borderRadius: '4px 14px 14px 14px',
          padding: '12px 16px', maxWidth: 280, fontSize: 15, lineHeight: '23px',
          color: MT.inkSoft, fontFamily: FF.text,
          border: `1px solid ${MT.divider}`,
        }}>{children}</div>
      </div>
    </div>
  );
}

function MeBubble({ children, status, tight }) {
  return (
    <div style={{ display: 'flex', padding: `${tight ? 1 : 7}px 16px`, justifyContent: 'flex-end', gap: 10, alignItems: 'flex-start', ...ENTER_RIGHT }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', maxWidth: 268 }}>
        <div style={{
          background: MT.meBubble, borderRadius: '14px 4px 14px 14px',
          padding: '12px 16px', fontSize: 15, lineHeight: '23px',
          color: MT.meInk, fontFamily: FF.text, fontWeight: 500,
        }}>{children}</div>
        {status && (
          <div style={{ marginTop: 5, marginRight: 4, fontSize: 12, color: status === 'Read' ? MT.green : MT.muted, fontFamily: FF.text, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="8" viewBox="0 0 14 9" fill="none"><path d="M1 5l2.5 2.5L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 5l2.5 2.5L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {status}
          </div>
        )}
      </div>
      <UserAvatar />
    </div>
  );
}

// Specialist matching — three phases
function Handshake({ time }) {
  // Two clean phases: searching dots → the specialist chip rises in.
  const [joined, setJoined] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setJoined(true), 1050);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ textAlign: 'center', padding: '20px 0 8px' }}>
      <div style={{ fontSize: 12, color: MT.muted, fontFamily: FF.text, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.6px', animation: 'soft-in .26s ease-out both' }}>{time}</div>
      <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', minHeight: 44 }}>
        {!joined ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '9px 18px', borderRadius: 100, background: MT.surface, border: `1px solid ${MT.hairline}`, animation: 'joined-rise .3s cubic-bezier(.2,.8,.2,1) both' }}>
            <span style={{ display: 'inline-flex', gap: 4 }}>
              {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: 3, background: MT.muted, animation: `dot-pulse 1.3s ${i * 0.18}s infinite ease-in-out` }}/>)}
            </span>
            <span style={{ fontSize: 13, fontFamily: FF.text, color: MT.inkSoft, fontWeight: 600 }}>Finding your specialist</span>
          </div>
        ) : (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '6px 15px 6px 6px', borderRadius: 100, background: MT.surface, border: `1px solid ${MT.ink}`, boxShadow: MT.shadowSm, animation: 'joined-rise .42s cubic-bezier(.2,.8,.2,1) both' }}>
            <span style={{ display: 'inline-flex', animation: 'avatar-pop .26s cubic-bezier(.2,.8,.2,1) both' }}><ProAvatar /></span>
            <span style={{ fontSize: 13, fontFamily: FF.text, color: MT.ink }}>
              <span style={{ fontWeight: 700 }}>Mike Chen</span> <span style={{ color: MT.muted }}>joined</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, color: MT.ink, fontWeight: 700, paddingLeft: 3, borderLeft: `1px solid ${MT.hairline}`, marginLeft: 1 }}>
              <svg width="11" height="11" viewBox="0 0 12 12"><path d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 8.5 3 10.5 3.5 7 1 4.5 4.5 4z" fill={MT.ink}/></svg>
              <span className="tnum">4.96</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function SystemText({ time, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '14px 0 6px', ...ENTER_SOFT }}>
      <div style={{ fontSize: 12, color: MT.muted, fontFamily: FF.text, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.6px' }}>{time}</div>
      {sub && (
        <div style={{ fontSize: 12, color: MT.muted, marginTop: 5, fontFamily: FF.text, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          {/privacy|encrypted/i.test(sub) && (
            <svg width="10" height="12" viewBox="0 0 9 11"><rect x="1" y="4.5" width="7" height="6" rx="1" fill="none" stroke={MT.muted} strokeWidth="1"/><path d="M2.5 4.5V3a2 2 0 0 1 4 0v1.5" fill="none" stroke={MT.muted} strokeWidth="1" strokeLinecap="round"/></svg>
          )}
          {sub}
        </div>
      )}
    </div>
  );
}

function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 30px 14px', ...ENTER_SOFT }}>
      <div style={{ flex: 1, height: 1, background: MT.divider }} />
      <span style={{ fontSize: 12, color: MT.muted, fontFamily: FF.text, textTransform: 'uppercase', letterSpacing: '.6px', fontWeight: 600 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: MT.divider }} />
    </div>
  );
}

function TypingBubble({ variant }) {
  const Av = variant === 'pro' ? ProAvatar : BotAvatar;
  return (
    <div style={{ display: 'flex', gap: 10, padding: '4px 16px', alignItems: 'flex-start', ...ENTER }}>
      <Av />
      <div style={{
        background: MT.surface, borderRadius: '4px 14px 14px 14px',
        padding: '14px 15px', border: `1px solid ${MT.divider}`,
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{ width: 6, height: 6, borderRadius: 3, background: MT.muted, display: 'inline-block', animation: `dot-pulse 1.4s ${i * 0.18}s infinite ease-in-out` }}/>
        ))}
      </div>
    </div>
  );
}

// ─── Hero — Uber black promo card ──────────────────────────────────
function Hero() {
  return (
    <div style={{
      margin: '12px 16px 0', borderRadius: 16, overflow: 'hidden',
      background: MT.ink,
      position: 'relative', flexShrink: 0,
      animation: 'msg-in .3s cubic-bezier(.2,.8,.2,1) both',
    }}>
      <div style={{ padding: '24px 24px 26px', position: 'relative', maxWidth: '80%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 10 10"><path d="M2 5l2 2 4-5" stroke={MT.ink} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{ fontSize: 12, fontFamily: FF.text, color: 'rgba(255,255,255,0.66)', letterSpacing: '0.8px', fontWeight: 700, textTransform: 'uppercase' }}>Meituan Home · Fast match</div>
        </div>
        <div style={{ marginTop: 16, fontSize: 26, fontFamily: FF.display, fontWeight: 800, letterSpacing: '-0.6px', lineHeight: '32px', color: '#fff' }}>
          A specialist on the line<br/>
          <span style={{ color: '#fff' }}>in 30 seconds.</span>
        </div>
        <div style={{ marginTop: 18, display: 'flex', gap: 16, fontSize: 12, fontFamily: FF.text, color: 'rgba(255,255,255,0.82)', flexWrap: 'wrap' }}>
          {[
            { t: 'Verified pros',  i: <path d="M2 6l3 3 7-7" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/> },
            { t: 'Free diagnosis', i: <circle cx="7" cy="7" r="5" stroke="#fff" strokeWidth="1.4" fill="none"/> },
            { t: 'No fix, no charge', i: <path d="M2 4h10M2 8h7" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round"/> },
          ].map(({t, i}) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
              <svg width="12" height="12" viewBox="0 0 14 14">{i}</svg>{t}
            </div>
          ))}
        </div>
      </div>
      {/* Decorative wrench */}
      <svg viewBox="0 0 100 100" width="100" height="100" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} fill="none">
        <path d="M70 18 a15 15 0 0 0 -19 19 L18 70 a8 8 0 0 0 12 12 L63 49 a15 15 0 0 0 19 -19 l-9 9 -9 -1 -1 -9 9 -9 z" fill="rgba(255,255,255,0.13)"/>
      </svg>
    </div>
  );
}

// ─── Opening intro — official diagnosis card ───────────────────────
function IntroCard() {
  // Three rules, perfectly balanced: every row is title + one-line note, two
  // lines each. The Official badge lives in the header now, not here.
  const rows = [
    { t: 'Official experts', s: 'No upsell, ever.',
      i: <><path d="M12 3l7 2.4v5.3c0 4.4-3 7.5-7 8.9-4-1.4-7-4.5-7-8.9V5.4L12 3z" stroke={MT.ink} strokeWidth="1.6" fill="none" strokeLinejoin="round"/><path d="M8.6 11.7l2.4 2.4 4.4-5" stroke={MT.ink} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></> },
    { t: 'Free diagnosis', s: 'Real cause in seconds.',
      i: <><circle cx="12" cy="12" r="8.4" stroke={MT.ink} strokeWidth="1.6" fill="none"/><path d="M12 7.2V12l3.2 1.9" stroke={MT.ink} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></> },
    { t: 'Open quotes', s: 'Pros bid on one order.',
      i: <><path d="M4 12.3l8-8.3H19a1.6 1.6 0 0 1 1.6 1.6v7l-8 8.3a1.6 1.6 0 0 1-2.3 0l-6.3-6.3a1.6 1.6 0 0 1 0-2.3z" stroke={MT.ink} strokeWidth="1.6" fill="none" strokeLinejoin="round"/><circle cx="15.7" cy="8.3" r="1.35" stroke={MT.ink} strokeWidth="1.4" fill="none"/></> },
  ];
  return (
    <div style={{
      margin: '14px 16px 2px', borderRadius: 16, overflow: 'hidden',
      background: MT.surface, border: `1px solid ${MT.divider}`, boxShadow: MT.shadowSm,
      flexShrink: 0, display: 'flex', minHeight: 178, animation: 'msg-in .3s cubic-bezier(.2,.8,.2,1) both',
    }}>
      {/* Left — three balanced rules, generous spacing */}
      <div style={{ flex: 1, minWidth: 0, padding: '20px 8px 20px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', animation: `soft-in .3s ${160 + i * 90}ms both` }}>
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>{r.i}</svg>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: MT.ink, fontFamily: FF.text, lineHeight: '18px' }}>{r.t}</div>
              <div style={{ fontSize: 12.5, color: MT.muted, fontFamily: FF.text, marginTop: 3, lineHeight: '16px' }}>{r.s}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Right — the upper half of the portrait, face large and clear */}
      <div style={{ width: 148, flexShrink: 0, position: 'relative', overflow: 'hidden', background: '#EDEDED' }}>
        <img src={__R('introWorkerImg', 'assets/intro-worker.png')} alt="" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '200%', objectFit: 'cover', objectPosition: '50% 0%', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(255,255,255,.9) 0%, rgba(255,255,255,.25) 26%, rgba(255,255,255,0) 55%)' }}/>
        <span style={{ position: 'absolute', right: 9, bottom: 9, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, fontFamily: FF.text, color: '#fff', background: 'rgba(0,0,0,.5)', borderRadius: 100, padding: '3px 9px' }}>
          <svg width="9" height="9" viewBox="0 0 6 6"><circle cx="3" cy="3" r="3" fill={MT.green}/><path d="M1.6 3l1 1 1.8-2.1" stroke="#fff" strokeWidth="0.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Verified
        </span>
      </div>
    </div>
  );
}

function SuggestedQ({ children, onTap }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div onClick={onTap}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className="btn-press"
      style={{
        padding: '12px 16px',
        border: `1px solid ${hover ? MT.ink : MT.hairline}`,
        borderRadius: 10,
        color: MT.ink,
        fontSize: 14, fontFamily: FF.text, fontWeight: 500, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: hover ? MT.surfaceAlt : MT.surface,
        transition: 'all .18s',
      }}>
      <span>{children}</span>
      <svg width="8" height="12" viewBox="0 0 7 11" style={{ transition: 'transform .2s', transform: hover ? 'translateX(2px)' : 'translateX(0)' }}>
        <path d="M1 1l4.5 4.5L1 10" stroke={hover ? MT.ink : MT.muted} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function VideoMessage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 14px', gap: 10, alignItems: 'flex-start', ...ENTER }}>
      <div style={{ width: 180, height: 220, borderRadius: 12, overflow: 'hidden', position: 'relative', border: `1px solid ${MT.hairline}` }}>
        <img src={__R('toiletImg', 'assets/toilet.webp')} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="18" viewBox="0 0 13 15"><path d="M2 1.5L12 7.5L2 13.5Z" fill="#FFFFFF"/></svg>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 8, left: 10, color: MT.surface, fontSize: 12, fontFamily: FF.text, fontWeight: 600 }}>00:15</div>
      </div>
      <UserAvatar />
    </div>
  );
}

function PhotoStrip() {
  const Img = ({ play, src }) => (
    <div style={{ width: 42, height: 42, borderRadius: 6, background: '#E2DCD0', position: 'relative', overflow: 'hidden' }}>
      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      {play && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}><svg width="10" height="12" viewBox="0 0 9 11"><path d="M1 1l7 4.5L1 10z" fill={MT.surface}/></svg></div>}
    </div>
  );
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      <Img src={__R('toiletImg', 'assets/toilet.webp')}/><Img src={__R('toilet2Img', 'assets/toilet2.webp')}/><Img src={__R('toiletImg', 'assets/toilet.webp')}/><Img play src={__R('toilet2Img', 'assets/toilet2.webp')}/>
      <svg width="7" height="12" viewBox="0 0 6 10"><path d="M1 1l4 4-4 4" stroke={MT.muted} strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>
    </div>
  );
}

function CatLitterPhoto() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 14px', gap: 10, alignItems: 'flex-start', ...ENTER }}>
      <div style={{ width: 156, height: 156, borderRadius: 12, overflow: 'hidden', border: `1px solid ${MT.hairline}` }}>
        <img src={__R('toiletCatImg', 'assets/toilet-cat.webp')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <UserAvatar />
    </div>
  );
}

// ─── Order card ────────────────────────────────────────────────────
function OrderRow({ k, v, last, delay = 0 }) {
  return (
    <div style={{
      display: 'flex', gap: 14, padding: '13px 0',
      borderBottom: last ? 'none' : `1px solid ${MT.divider}`,
      alignItems: 'flex-start',
      animation: `soft-in .26s ${delay}ms both`,
    }}>
      <div style={{ width: 60, color: MT.muted, fontFamily: FF.text, fontSize: 12, paddingTop: 2, textTransform: 'uppercase', letterSpacing: '.6px', fontWeight: 700 }}>{k}</div>
      <div style={{ flex: 1, fontSize: 14, fontFamily: FF.text, color: MT.ink, lineHeight: '20px' }}>{v}</div>
    </div>
  );
}

function PrimaryBtn({ children, full, disabled, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={disabled ? undefined : onClick} className="btn-press"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
      height: 44, width: full ? '100%' : 'auto', padding: full ? 0 : '0 22px',
      border: 0, borderRadius: 12,
      background: disabled ? MT.surfaceDeep : (hover ? MT.brandHover : MT.brand),
      color: disabled ? MT.muted : MT.brandInk,
      fontWeight: 700, fontSize: 15, fontFamily: FF.display, letterSpacing: '-0.1px',
      cursor: disabled ? 'default' : 'pointer',
      transition: 'background .18s ease',
    }}>{children}</button>
  );
}

function GhostBtn({ children, onClick }) {
  return (
    <button onClick={onClick} className="btn-press" style={{
      height: 32, padding: '0 14px', borderRadius: 100, border: `1px solid ${MT.hairline}`,
      background: MT.surface, color: MT.inkSoft, fontFamily: FF.text, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    }}>{children}</button>
  );
}

function RepairOrderCard({ pending, ai, when, onGetQuotes, onPickTime }) {
  const chev = <svg width="7" height="12" viewBox="0 0 6 10"><path d="M1 1l4 4-4 4" stroke={MT.muted} strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>;
  return (
    <div style={{ padding: '6px 14px', ...ENTER }}>
      <div style={{ marginBottom: 4, marginLeft: 44, fontSize: 12, color: ai ? MT.aiInk : MT.ink, fontWeight: 700, fontFamily: FF.text }}>
        {ai ? 'Repair AI' : 'Mike Chen'} <span style={{ color: MT.muted, fontWeight: 400, marginLeft: 6 }}>drafted your repair order</span>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {ai ? <AIAvatar /> : <ProAvatar />}
        <div style={{
          background: MT.surface, borderRadius: '4px 16px 16px 16px',
          width: 300, border: `1px solid ${MT.divider}`, overflow: 'hidden',
        }}>
          {/* Header — just the title, nothing else */}
          <div style={{
            padding: '12px 14px',
            background: MT.brandTint,
            borderBottom: `1px solid ${MT.divider}`,
          }}>
            <span style={{ fontFamily: FF.display, fontSize: 15, fontWeight: 700, color: MT.ink }}>Repair order</span>
          </div>
          <div style={{ padding: '6px 18px 18px' }}>
            <OrderRow delay={50}  k="Issue"  v="TOTO toilet · sewer odor" />
            <OrderRow delay={110} k="Photos" v={<PhotoStrip />} />
            <OrderRow delay={170} k="Plan"   v={<>
              <div>Replace flange wax ring</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                <span style={{ fontSize: 12, color: MT.muted, fontFamily: FF.text, textTransform: 'uppercase', letterSpacing: '.6px', fontWeight: 700 }}>Estimate</span>
                <span style={{ color: MT.ink, fontWeight: 700, fontSize: 12, fontFamily: FF.display }}>$</span>
                <span className="tnum" style={{ color: MT.ink, fontWeight: 800, fontSize: 18, fontFamily: FF.display, letterSpacing: '-.4px', lineHeight: '20px' }}>35</span>
              </div>
            </>}/>
            <OrderRow delay={230} k="When"   v={<span onClick={onPickTime} className="btn-press" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              {pending ? <span style={{ color: MT.negative, fontWeight: 700 }}>Pick a time</span> : (when || 'Right now')}{chev}
            </span>}/>
            <OrderRow delay={290} last k="Where" v={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>820 W Ridge Ln, Apt 4B{chev}</span>}/>
            <div style={{ marginTop: 16 }}>
              <PrimaryBtn full onClick={pending ? onPickTime : onGetQuotes}>{pending ? 'Set a time to continue' : 'Request quotes'}</PrimaryBtn>
            </div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 12, color: MT.muted, fontFamily: FF.text }}>
              <svg width="10" height="12" viewBox="0 0 9 11"><rect x="1" y="4.5" width="7" height="6" rx="1" fill="none" stroke={MT.muted} strokeWidth="1"/><path d="M2.5 4.5V3a2 2 0 0 1 4 0v1.5" fill="none" stroke={MT.muted} strokeWidth="1" strokeLinecap="round"/></svg>
              <span>No charge until you confirm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tags ───────────────────────────────────────────────────────────
function Tag({ children, tone = 'neutral' }) {
  const t = tone === 'brand'    ? { c: MT.ink,       bg: MT.surfaceAlt, b: MT.hairline } :
            tone === 'negative' ? { c: MT.negative,  bg: MT.negBg,      b: '#F6CDC8' } :
            tone === 'green'    ? { c: MT.greenDeep, bg: MT.greenBg,    b: '#C3E3D2' } :
            tone === 'blue'     ? { c: MT.blue,      bg: MT.blueBg,     b: '#CFE0FD' } :
            tone === 'red'      ? { c: MT.ink,       bg: MT.surfaceAlt, b: MT.hairline } :
                                  { c: MT.inkLight,  bg: MT.surfaceAlt, b: MT.hairline };
  return (
    <span style={{ fontSize: 12, color: t.c, background: t.bg, fontFamily: FF.text, padding: '2px 8px', borderRadius: 100, fontWeight: 600, border: `1px solid ${t.b}`, lineHeight: '16px', whiteSpace: 'nowrap' }}>{children}</span>
  );
}

// Vendor photos
const VENDOR_IMG = { bath: __R('merchant1Img', 'assets/merchant1.jpg'), tech: __R('merchant2Img', 'assets/merchant2.webp'), cleaner: __R('merchant3Img', 'assets/merchant3.webp') };
function VendorImage({ kind }) {
  return <img src={VENDOR_IMG[kind] || VENDOR_IMG.bath} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />;
}

// Capped-price shield pill — the ceiling guarantee, reused across surfaces.
function CapPill({ cap }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, fontFamily: FF.text, color: MT.greenDeep, background: MT.greenBg, border: '1px solid #C3E3D2', borderRadius: 100, padding: '2px 9px', whiteSpace: 'nowrap' }}>
      <svg width="10" height="11" viewBox="0 0 11 12" fill="none"><path d="M5.5 1L9.5 2.4v3.1c0 2.6-1.7 4.4-4 5.4-2.3-1-4-2.8-4-5.4V2.4L5.5 1z" stroke={MT.greenDeep} strokeWidth="1.1" fill="none"/><path d="M3.7 6l1.4 1.4 2.3-2.6" stroke={MT.greenDeep} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
      Capped ${cap}
    </span>
  );
}

// Vendor row — three lines max: name+price, rating·time+cap, service tags.
// The whole row opens the vendor page; no separate button, no "Recommended".
function VendorCard({ v, last, onView }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', gap: 13, padding: '14px 0',
        borderBottom: last ? 'none' : `1px solid ${MT.divider}`,
        cursor: 'pointer', alignItems: 'center',
        background: hover ? MT.surfaceAlt : 'transparent',
        margin: '0 -2px', paddingLeft: 2, paddingRight: 2,
        borderRadius: hover ? 10 : 0,
        transition: 'background .18s',
      }} onClick={onView}>
      <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}><VendorImage kind={v.image} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Line 1 — name + price with the cap right beside it */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 700, color: MT.ink, fontFamily: FF.display, lineHeight: '19px', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name}</span>
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1, flexShrink: 0 }}>
            <span style={{ color: MT.ink, fontSize: 12, fontWeight: 700, fontFamily: FF.display }}>$</span>
            <span className="tnum" style={{ color: MT.ink, fontSize: 16, fontWeight: 800, fontFamily: FF.display, letterSpacing: '-0.3px' }}>{v.priceLo}–{v.priceHi}</span>
          </span>
        </div>
        {/* Line 2 — rating · arrival + capped pill next to the price column */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <span style={{ flex: 1, minWidth: 0, display: 'flex', gap: 5, alignItems: 'center', fontSize: 12, color: MT.muted, fontFamily: FF.text, whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <svg width="11" height="11" viewBox="0 0 12 12" style={{ flexShrink: 0 }}><path d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 8.5 3 10.5 3.5 7 1 4.5 4.5 4z" fill={MT.ink}/></svg>
            <span className="tnum" style={{ color: MT.ink, fontWeight: 700 }}>{v.rating}</span>
            <span className="tnum">· {String(v.reviews).replace(' reviews', '')}</span>
            <span className="tnum">· ~{v.eta} min</span>
          </span>
          <span style={{ flexShrink: 0 }}><CapPill cap={v.cap} /></span>
        </div>
        {/* Line 3 — service tags */}
        <div style={{ display: 'flex', gap: 4, marginTop: 6, overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {v.tags.map((t, i) => <Tag key={i} tone={t.tone}>{t.text}</Tag>)}
        </div>
      </div>
      <svg width="7" height="12" viewBox="0 0 6 10" style={{ flexShrink: 0 }}><path d="M1 1l4 4-4 4" stroke={MT.mutedSoft} strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>
    </div>
  );
}

// Quote data — numeric so the comparison can sort by price / rating / ETA, and
// each carries a `cap`: the merchant's committed ceiling for this diagnosis.
const QUOTE_VENDORS = [
  { key: 'citrus', name: 'Citrus Home Services', image: 'bath',    rating: 4.9, reviews: '2.1k reviews', distance: 1.2, eta: 30, priceLo: 45, priceHi: 60, cap: 66, tags: [{ text: '90-day warranty', tone: 'brand' }, { text: 'No fix, no charge' }] },
  { key: 'master', name: 'ServiceMaster Pro',    image: 'tech',    rating: 5.0, reviews: '12k reviews', distance: 2.6, eta: 45, priceLo: 50, priceHi: 68, cap: 75, tags: [{ text: 'Surcharge refund', tone: 'brand' }, { text: 'After-hours' }] },
  { key: 'quack',  name: 'QuackFix Appliance',   image: 'cleaner', rating: 4.9, reviews: '6.8k reviews', distance: 0.8, eta: 22, priceLo: 42, priceHi: 56, cap: 62, tags: [{ text: 'Online estimate', tone: 'brand' }, { text: 'No fix, no charge' }] },
];

function CountUp({ to, ms = 1800 }) {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    let raf;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      setN(Math.round(e * to));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return <span key={n} className="tnum" style={{ display: 'inline-block', animation: 'num-up .3s cubic-bezier(.2,.8,.2,1) both' }}>{n}</span>;
}

// ─── Quotes — sealed bids reveal one by one, then comparison ─────────
// While collecting, merchant identity stays hidden: each slot is a sealed
// placeholder that flips open the moment that pro's quote lands. Quotes stay
// valid for 20 minutes.
function MerchantQuotesCard({ stale, onView }) {
  // phase 0 = collecting (sealed bids land one by one), phase 1 = comparison.
  const [phase, setPhase] = React.useState(stale ? 1 : 0);
  const [revealed, setRevealed] = React.useState(stale ? 3 : 0); // how many bids are in
  React.useEffect(() => {
    if (stale) return;
    const T = [];
    T.push(setTimeout(() => setRevealed(1), 1100));
    T.push(setTimeout(() => setRevealed(2), 2600));
    T.push(setTimeout(() => setRevealed(3), 4100));
    T.push(setTimeout(() => setPhase(1), 5100));
    return () => T.forEach(clearTimeout);
  }, [stale]);

  const [secondsLeft, setSecondsLeft] = React.useState(1198); // 20-minute window
  React.useEffect(() => {
    if (stale) return;
    const id = setInterval(() => setSecondsLeft(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [stale]);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const windowExpired = !stale && secondsLeft === 0;
  const collecting = phase === 0 && !stale;

  const [sort, setSort] = React.useState('best');
  const SORTS = [{ key: 'best', label: 'Best match' }, { key: 'price', label: 'Price' }, { key: 'rating', label: 'Rating' }, { key: 'fastest', label: 'Fastest' }];
  const scored = QUOTE_VENDORS.map(v => ({ ...v, _score: v.rating * 2 - v.eta * 0.012 - v.priceLo * 0.02 - v.distance * 0.08 }));
  const sorted = [...scored].sort((a, b) =>
    sort === 'price'   ? a.priceLo - b.priceLo :
    sort === 'rating'  ? (b.rating - a.rating) || (a.priceLo - b.priceLo) :
    sort === 'fastest' ? a.eta - b.eta :
                         b._score - a._score
  );
  const explain =
    sort === 'price'   ? 'Lowest capped price first' :
    sort === 'rating'  ? 'Highest rated first' :
    sort === 'fastest' ? 'Soonest arrival first' :
                         null;
  const topNoteFor = (i) => {
    if (i !== 0) return null;
    if (sort === 'price')   return { label: 'Lowest quote', tone: 'green' };
    if (sort === 'rating')  return { label: 'Top rated', tone: 'brand' };
    if (sort === 'fastest') return { label: 'Soonest arrival', tone: 'brand' };
    return { label: 'Recommended', tone: 'brand' };
  };

  return (
    <div style={{ ...ENTER }}>
      <div style={{ margin: '12px 16px', background: MT.surface, borderRadius: 16, padding: '0 16px 14px', border: `1px solid ${MT.divider}`, overflow: 'hidden' }}>
        {/* Header — collecting / settled / expired, all in one place */}
        <div style={{ margin: '0 -16px', padding: '14px 16px 12px', background: stale ? MT.surface : (collecting ? MT.brandTint : MT.greenBg), borderBottom: `1px solid ${MT.divider}`, transition: 'background .3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {stale
              ? <div style={{ width: 8, height: 8, borderRadius: 4, background: MT.negative }}/>
              : collecting
                ? <svg width="20" height="20" viewBox="0 0 20 20" style={{ animation: 'spin .9s linear infinite', flexShrink: 0 }}><circle cx="10" cy="10" r="7.5" fill="none" stroke="rgba(0,0,0,.12)" strokeWidth="2"/><circle cx="10" cy="10" r="7.5" fill="none" stroke={MT.brand} strokeWidth="2" strokeLinecap="round" strokeDasharray="16 31"/></svg>
                : <span style={{ width: 22, height: 22, borderRadius: 11, background: MT.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: 'rvx-pop .4s cubic-bezier(.2,.8,.2,1) both' }}><svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 6.4l2 2 4.2-5" stroke="#fff" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></span>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: MT.ink, fontFamily: FF.text }}>
                {stale ? 'Quotes expired' : collecting ? 'Collecting sealed bids' : '3 quotes in'}
              </div>
              {collecting && <div style={{ fontSize: 12, color: MT.muted, marginTop: 1, fontFamily: FF.text }}>Same order · pros can't see each other</div>}
            </div>
            {!stale && !collecting && (
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: MT.muted, fontWeight: 700, fontFamily: FF.text, textTransform: 'uppercase', letterSpacing: '.6px' }}>Valid</div>
                <div className="tnum" style={{ fontSize: 13, fontFamily: FF.num, fontWeight: 700, color: windowExpired ? MT.muted : MT.inkSoft }}>{windowExpired ? 'Expired' : `${mm}:${ss}`}</div>
              </div>
            )}
            {collecting && <span className="tnum" style={{ fontSize: 13, fontWeight: 700, color: MT.ink, fontFamily: FF.text, flexShrink: 0 }}>{revealed}/3</span>}
          </div>
        </div>

        {/* Collecting — sealed slots; a bid flips its slot open when it lands */}
        {collecting && (
          <div style={{ animation: 'soft-in .2s ease-out both' }}>
            {QUOTE_VENDORS.map((p, i) => {
              const isIn = i < revealed;
              return (
                <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 0', borderBottom: i < QUOTE_VENDORS.length - 1 ? `1px solid ${MT.divider}` : 'none', minHeight: 60 }}>
                  {isIn ? (
                    <React.Fragment>
                      <div style={{ width: 38, height: 38, borderRadius: 10, overflow: 'hidden', flexShrink: 0, animation: 'rvx-pop .45s cubic-bezier(.2,.8,.2,1) both' }}><VendorImage kind={p.image}/></div>
                      <div style={{ flex: 1, minWidth: 0, animation: 'rvx-reveal .5s cubic-bezier(.16,.84,.44,1) both' }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: MT.ink, fontFamily: FF.text, lineHeight: '17px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, fontSize: 12, color: MT.muted, fontFamily: FF.text }}>
                          <svg width="10" height="10" viewBox="0 0 12 12"><path d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 8.5 3 10.5 3.5 7 1 4.5 4.5 4z" fill={MT.ink}/></svg>
                          <span className="tnum" style={{ color: MT.ink, fontWeight: 700 }}>{p.rating}</span>
                          <span className="tnum">· ~{p.eta} min</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, animation: 'rvx-reveal .5s .08s cubic-bezier(.16,.84,.44,1) both' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, justifyContent: 'flex-end' }}>
                          <span style={{ color: MT.ink, fontSize: 12, fontWeight: 700, fontFamily: FF.display }}>$</span>
                          <span className="tnum" style={{ color: MT.ink, fontSize: 16, fontWeight: 800, fontFamily: FF.display, letterSpacing: '-0.3px' }}>{p.priceLo}–{p.priceHi}</span>
                        </div>
                        <div style={{ marginTop: 3 }}><CapPill cap={p.cap} /></div>
                      </div>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <div className="rvx-skel" style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="rvx-skel" style={{ width: '58%', height: 11, borderRadius: 6 }} />
                        <div className="rvx-skel" style={{ width: '34%', height: 9, borderRadius: 6, marginTop: 7 }} />
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, fontFamily: FF.text, color: MT.muted, background: MT.surfaceAlt, border: `1px solid ${MT.hairline}`, borderRadius: 100, padding: '4px 10px', flexShrink: 0 }}>
                        <svg width="9" height="11" viewBox="0 0 9 11"><rect x="1" y="4.5" width="7" height="6" rx="1" fill="none" stroke={MT.muted} strokeWidth="1"/><path d="M2.5 4.5V3a2 2 0 0 1 4 0v1.5" fill="none" stroke={MT.muted} strokeWidth="1" strokeLinecap="round"/></svg>
                        Sealed
                      </span>
                    </React.Fragment>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Comparison — sort control + sorted vendor cards */}
        {!collecting && (
          <>
            {!stale && (
              <div style={{ margin: '0 -16px', padding: explain ? '12px 16px 2px' : '12px 16px 11px', background: MT.surface, borderBottom: `1px solid ${MT.divider}` }}>
                <div className="scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
                  {SORTS.map(s => {
                    const on = sort === s.key;
                    return (
                      <button key={s.key} onClick={() => setSort(s.key)} className="btn-press" style={{ height: 30, padding: '0 13px', borderRadius: 100, flexShrink: 0, border: `1px solid ${on ? MT.ink : MT.hairline}`, background: on ? MT.ink : MT.surface, color: on ? MT.brandInk : MT.inkSoft, fontSize: 12, fontWeight: 700, fontFamily: FF.text, cursor: 'pointer', transition: 'all .18s' }}>{s.label}</button>
                    );
                  })}
                </div>
                {explain && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 1px 8px', fontSize: 12, color: MT.muted, fontFamily: FF.text }}>
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M4 7h6M6 10h2" stroke={MT.muted} strokeWidth="1.3" strokeLinecap="round"/></svg>
                    <span>{explain}</span>
                  </div>
                )}
              </div>
            )}
            {sorted.map((v, i) => (
              <div key={sort + '-' + v.key} style={stale ? undefined : { animation: 'soft-in .24s ease-out both', animationDelay: `${i * 60}ms` }}>
                <VendorCard v={v} last={i === sorted.length - 1} onView={() => onView && onView(v.key)} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function QuickRating({ onPick }) {
  const [picked, setPicked] = React.useState(null);
  const opts = [
    { key: 'negative', label: 'Off',   ink: MT.negative,
      svg: <svg width="18" height="18" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke={MT.negative} strokeWidth="1.5"/><circle cx="8" cy="9.5" r="1" fill={MT.negative}/><circle cx="14" cy="9.5" r="1" fill={MT.negative}/><path d="M7.5 15c1.5-1.5 5.5-1.5 7 0" stroke={MT.negative} strokeWidth="1.4" strokeLinecap="round" fill="none" transform="rotate(180 11 15)"/></svg> },
    { key: 'neutral',  label: 'Okay',  ink: MT.inkLight,
      svg: <svg width="18" height="18" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke={MT.inkLight} strokeWidth="1.5"/><circle cx="8" cy="9.5" r="1" fill={MT.inkLight}/><circle cx="14" cy="9.5" r="1" fill={MT.inkLight}/><path d="M7.5 14.5h7" stroke={MT.inkLight} strokeWidth="1.5" strokeLinecap="round"/></svg> },
    { key: 'positive', label: 'Great', ink: MT.green,
      svg: <svg width="18" height="18" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke={MT.green} strokeWidth="1.5"/><circle cx="8" cy="9.5" r="1" fill={MT.green}/><circle cx="14" cy="9.5" r="1" fill={MT.green}/><path d="M7.5 13c1.5 2 5.5 2 7 0" stroke={MT.green} strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg> },
  ];
  return (
    <div style={{ padding: '6px 14px', ...ENTER }}>
      <div style={{ marginBottom: 4, marginLeft: 44, fontSize: 12, color: MT.ink, fontWeight: 700, fontFamily: FF.text }}>
        Meituan <span style={{ color: MT.muted, fontWeight: 400, marginLeft: 6 }}>quick rating</span>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <BotAvatar />
        <div style={{
          width: 300, background: MT.surface, borderRadius: '4px 16px 16px 16px',
          border: `1px solid ${MT.divider}`, padding: '14px 16px',
        }}>
          <div style={{ fontSize: 14, color: MT.inkSoft, fontFamily: FF.text, lineHeight: '20px' }}>
            How was your time with <span style={{ fontWeight: 700, color: MT.ink }}>Mike</span>?
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            {opts.map(o => {
              const isPicked = picked === o.key;
              const isOther = picked && !isPicked;
              return (
                <button key={o.key}
                  onClick={() => { if (picked) return; setPicked(o.key); onPick && onPick(o.key); }}
                  className="btn-press"
                  disabled={!!picked}
                  style={{
                    flex: 1, height: 56, borderRadius: 12,
                    border: `1px solid ${isPicked ? o.ink : MT.hairline}`,
                    background: isPicked ? `${o.ink}10` : MT.surface,
                    opacity: isOther ? 0.4 : 1,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 3,
                    cursor: picked ? 'default' : 'pointer',
                    fontFamily: FF.text, transition: 'all .22s',
                  }}>
                  {o.svg}
                  <span style={{ fontSize: 12, fontWeight: isPicked ? 700 : 500, color: isPicked ? o.ink : MT.muted }}>{o.label}</span>
                </button>
              );
            })}
          </div>
          {picked && (
            <div style={{ marginTop: 10, fontSize: 12, color: MT.muted, fontFamily: FF.text, animation: 'soft-in .3s ease-out both' }}>
              Thanks — noted. Want to leave a longer review?
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ onBuy }) {
  return (
    <div style={{ padding: '6px 14px', ...ENTER }}>
      <div style={{ marginBottom: 4, marginLeft: 44, fontSize: 12, color: MT.ink, fontWeight: 700, fontFamily: FF.text }}>
        Mike Chen <span style={{ color: MT.muted, fontWeight: 400, marginLeft: 6 }}>recommends</span>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <ProAvatar />
        <div style={{ background: MT.surface, borderRadius: '4px 16px 16px 16px', width: 300, border: `1px solid ${MT.divider}`, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: 100, position: 'relative', background: MT.surfaceAlt, overflow: 'hidden' }}>
            <img src={__R('toiletImg', 'assets/toilet.webp')} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: 8, left: 8, display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 800, color: '#fff', fontFamily: FF.text, background: MT.ink, padding: '2px 7px', borderRadius: 100, letterSpacing: '.4px', whiteSpace: 'nowrap', zIndex: 1 }}>
              <svg width="8" height="8" viewBox="0 0 12 12"><path d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 8.5 3 10.5 3.5 7 1 4.5 4.5 4z" fill="#fff"/></svg>
              <span>Official</span>
            </div>
          </div>
          <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: '19px', color: MT.ink, fontFamily: FF.display, letterSpacing: '-0.2px' }}>Worry-Free Toilet Unclog</div>
            <div style={{ fontSize: 12, color: MT.muted, fontFamily: FF.text, marginTop: 3 }}>Express on-site visit</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
              <Tag tone="brand">Flat rate</Tag>
              <Tag tone="green">No fix, no charge</Tag>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                <span style={{ color: MT.ink, fontSize: 13, fontWeight: 700, fontFamily: FF.display }}>$</span>
                <span className="tnum" style={{ color: MT.ink, fontSize: 22, fontWeight: 800, fontFamily: FF.display, letterSpacing: '-0.4px' }}>59</span>
              </div>
              <button onClick={onBuy} className="btn-press" style={{ height: 36, padding: '0 16px', borderRadius: 100, border: 0, background: MT.brand, color: MT.brandInk, fontSize: 13, fontWeight: 700, fontFamily: FF.text, cursor: 'pointer' }}>Buy</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Completed-order recap (opens the post-service follow-up) ───────
function OrderRecapCard() {
  const row = (k, v) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
      <span style={{ width: 52, flexShrink: 0, color: MT.muted, fontFamily: FF.text, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.6px', fontWeight: 700 }}>{k}</span>
      <span style={{ flex: 1, fontSize: 13.5, fontFamily: FF.text, color: MT.ink, lineHeight: '19px' }}>{v}</span>
    </div>
  );
  return (
    <div style={{ padding: '6px 14px', ...ENTER }}>
      <div style={{ background: MT.surface, border: `1px solid ${MT.divider}`, borderRadius: 16, overflow: 'hidden', boxShadow: MT.shadowSm }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 14px', borderBottom: `1px solid ${MT.divider}` }}>
          <span style={{ width: 20, height: 20, borderRadius: 10, background: MT.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="11" height="11" viewBox="0 0 12 12"><path d="M3 6.4l2 2 4.2-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <span style={{ fontSize: 14.5, fontWeight: 800, color: MT.ink, fontFamily: FF.display, letterSpacing: '-0.2px' }}>Order #4729</span>
          <span style={{ fontSize: 12.5, color: MT.muted, fontFamily: FF.text }}>Completed</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: MT.greenDeep, background: MT.greenBg, border: '1px solid #C3E3D2', borderRadius: 100, padding: '2px 9px', fontFamily: FF.text, whiteSpace: 'nowrap' }}>Paid $52</span>
        </div>
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 9 }}>
          {row('Issue', 'TOTO toilet · sewer odor')}
          {row('Pro', 'Citrus Home Services · ★ 4.9')}
          {row('Done', 'Yesterday, 6:40 PM · 45-day warranty')}
        </div>
      </div>
    </div>
  );
}

// ─── Review sheet — fully interactive ────────────────────────────────
function ReviewSheet({ onClose, onSubmit }) {
  const MOODS = ['Awful', 'Bad', 'Okay', 'Good', 'Amazing'];
  const [mood, setMood] = React.useState(4);
  const [tags, setTags] = React.useState({ 'Friendly tech': true, 'Fast repair': true, 'Knew their stuff': false, 'Spot-on diagnosis': false });
  const [resolved, setResolved] = React.useState('Yes, resolved');
  const [done, setDone] = React.useState(false);

  const lineColor = (a) => a ? '#fff' : MT.muted;
  const FACES = [
    (a) => <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke={lineColor(a)} strokeWidth="1.4"/><circle cx="7" cy="9" r="1" fill={lineColor(a)}/><circle cx="13" cy="9" r="1" fill={lineColor(a)}/><path d="M6.5 14c1-1.2 4-1.2 5 0" stroke={lineColor(a)} strokeWidth="1.3" strokeLinecap="round" fill="none" transform="rotate(180 9 14)"/></svg>,
    (a) => <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke={lineColor(a)} strokeWidth="1.4"/><circle cx="7" cy="9" r="1" fill={lineColor(a)}/><circle cx="13" cy="9" r="1" fill={lineColor(a)}/><path d="M7 13.5c1-1 4-1 6 0" stroke={lineColor(a)} strokeWidth="1.3" strokeLinecap="round" fill="none" transform="rotate(180 10 13.5)"/></svg>,
    (a) => <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke={lineColor(a)} strokeWidth="1.4"/><circle cx="7" cy="9" r="1" fill={lineColor(a)}/><circle cx="13" cy="9" r="1" fill={lineColor(a)}/><path d="M7 13.5h6" stroke={lineColor(a)} strokeWidth="1.3" strokeLinecap="round"/></svg>,
    (a) => <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke={lineColor(a)} strokeWidth="1.4"/><circle cx="7" cy="9" r="1" fill={lineColor(a)}/><circle cx="13" cy="9" r="1" fill={lineColor(a)}/><path d="M7 12c1 1.2 4 1.2 5 0" stroke={lineColor(a)} strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>,
    (a) => <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke={lineColor(a)} strokeWidth="1.5"/><path d="M6.5 8.5l1.2-1.2M13.5 8.5l-1.2-1.2" stroke={lineColor(a)} strokeWidth="1.4" strokeLinecap="round"/><path d="M7 12c1 1.6 5 1.6 6 0" stroke={lineColor(a)} strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>,
  ];

  const Chip = ({ children, active, onTap }) => (
    <button onClick={onTap} className="btn-press" style={{ height: 32, border: `1px solid ${active ? MT.ink : MT.hairline}`, borderRadius: 100, padding: '0 14px', background: active ? MT.surfaceAlt : MT.surface, color: active ? MT.ink : MT.inkLight, fontSize: 13, fontWeight: active ? 700 : 500, fontFamily: FF.text, cursor: 'pointer', transition: 'all .18s' }}>{children}</button>
  );

  const submit = () => {
    setDone(true);
    setTimeout(() => { onSubmit ? onSubmit({ mood: MOODS[mood], resolved }) : onClose(); }, 850);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 60, animation: 'fade-in .2s both' }}/>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: MT.surface, boxShadow: MT.shadowLg, borderRadius: '20px 20px 0 0', padding: '12px 20px 20px', zIndex: 61, animation: 'sheet-up .4s cubic-bezier(.2,.8,.2,1) both' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: MT.surfaceDeep }}/>
        </div>
        {done ? (
          <div style={{ padding: '26px 0 34px', textAlign: 'center', animation: 'soft-in .3s ease-out both' }}>
            <span style={{ width: 46, height: 46, borderRadius: 23, background: MT.green, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', animation: 'rvx-pop .4s cubic-bezier(.2,.8,.2,1) both' }}>
              <svg width="20" height="20" viewBox="0 0 12 12"><path d="M3 6.4l2 2 4.2-5" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <div style={{ marginTop: 12, fontSize: 16, fontWeight: 800, fontFamily: FF.display, color: MT.ink }}>Review posted</div>
            <div style={{ marginTop: 3, fontSize: 13, color: MT.muted, fontFamily: FF.text }}>Thanks — this helps the next customer.</div>
          </div>
        ) : (
          <React.Fragment>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 18, fontWeight: 800, fontFamily: FF.display, color: MT.ink, letterSpacing: '-0.3px' }}>How did Mike do?</span>
              <svg onClick={onClose} style={{ cursor: 'pointer' }} width="14" height="14" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2L2 12" stroke={MT.muted} strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
              {MOODS.map((label, i) => {
                const active = mood === i;
                return (
                  <button key={label} onClick={() => setMood(i)} className="btn-press" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flex: 1, background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 21,
                      background: active ? MT.ink : MT.surfaceAlt,
                      border: `1px solid ${active ? MT.ink : MT.hairline}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all .22s cubic-bezier(.2,.8,.2,1)',
                      transform: active ? 'scale(1.08)' : 'scale(1)',
                    }}>{FACES[i](active)}</div>
                    <span style={{ fontSize: 12, color: active ? MT.ink : MT.muted, fontWeight: active ? 700 : 500, fontFamily: FF.text }}>{label}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              {Object.keys(tags).map(t => (
                <Chip key={t} active={tags[t]} onTap={() => setTags(x => ({ ...x, [t]: !x[t] }))}>{t}</Chip>
              ))}
            </div>
            <div style={{ background: MT.surfaceAlt, borderRadius: 12, padding: 12, marginBottom: 18, position: 'relative', height: 68, border: `1px solid ${MT.hairline}` }}>
              <span style={{ color: MT.muted, fontSize: 13, fontFamily: FF.text }}>Anything to add? (optional)</span>
              <span className="tnum" style={{ position: 'absolute', right: 12, bottom: 8, color: MT.muted, fontSize: 12, fontFamily: FF.text }}>0 / 100</span>
            </div>
            <div style={{ fontSize: 12, color: MT.muted, marginBottom: 8, fontFamily: FF.text, textTransform: 'uppercase', letterSpacing: '.6px', fontWeight: 700 }}>Did this resolve your issue?</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {['Yes, resolved', 'Not yet'].map(r => (
                <Chip key={r} active={resolved === r} onTap={() => setResolved(r)}>{r}</Chip>
              ))}
            </div>
            <PrimaryBtn full onClick={submit}>Submit review</PrimaryBtn>
          </React.Fragment>
        )}
      </div>
    </>
  );
}

function ExpiredModal({ onAct }) {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 60, animation: 'fade-in .25s both' }}/>
      <div style={{ position: 'absolute', left: 28, right: 28, top: '30%', background: MT.surface, boxShadow: MT.shadowLg, borderRadius: 18, padding: '24px 22px 20px', zIndex: 61, animation: 'pop-in .24s cubic-bezier(.2,.8,.2,1) both', textAlign: 'center' }}>
        <div style={{
          width: 52, height: 52, borderRadius: 26, margin: '0 auto 14px',
          background: MT.negBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="7" stroke={MT.negative} strokeWidth="1.6" fill="none"/><path d="M9 5v4.5L11.5 11" stroke={MT.negative} strokeWidth="1.6" strokeLinecap="round" fill="none"/></svg>
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: MT.ink, marginBottom: 8, fontFamily: FF.display, letterSpacing: '-0.3px' }}>This quote has expired</div>
        <div style={{ fontSize: 13, lineHeight: '20px', color: MT.inkLight, marginBottom: 20, fontFamily: FF.text }}>
          The 20-minute window passed. We'll re-collect quotes from available pros.
        </div>
        <PrimaryBtn full onClick={onAct}>Re-match vendors</PrimaryBtn>
        <button onClick={onAct} className="btn-press" style={{ background: 'transparent', border: 0, color: MT.muted, fontSize: 12, fontFamily: FF.text, padding: '12px 0 0', cursor: 'pointer', display: 'block', width: '100%' }}>Keep current quotes anyway</button>
      </div>
    </>
  );
}

function ExpertIntroCard() {
  return (
    <div style={{ padding: '6px 14px', ...ENTER }}>
      <div style={{ marginLeft: 44, marginBottom: 4, fontSize: 12, color: MT.muted, fontFamily: FF.text }}>
        <span style={{ color: MT.ink, fontWeight: 700 }}>Mike Chen</span> joined
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <ProAvatar />
        <div style={{
          width: 300, background: MT.surface, borderRadius: '4px 16px 16px 16px',
          border: `1px solid ${MT.divider}`, padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: MT.ink, fontFamily: FF.display, letterSpacing: '-0.3px', lineHeight: '20px' }}>Mike Chen</div>
              <div style={{ fontSize: 12, color: MT.muted, fontFamily: FF.text, marginTop: 3 }}>Plumbing specialist · 8 yrs</div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: MT.ink, fontFamily: FF.text, fontWeight: 700, flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 8.5 3 10.5 3.5 7 1 4.5 4.5 4z" fill={MT.ink}/></svg>
              <span className="tnum">4.96</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 12, color: MT.inkLight, fontFamily: FF.text }}>
            <svg width="11" height="13" viewBox="0 0 11 13" fill="none"><path d="M5.5 1C3.6 1 2 2.5 2 4.4c0 2.5 3.5 6.6 3.5 6.6S9 6.9 9 4.4C9 2.5 7.4 1 5.5 1z" stroke={MT.ink} strokeWidth="1.2"/><circle cx="5.5" cy="4.4" r="1.3" fill={MT.ink}/></svg>
            <span><span style={{ color: MT.ink, fontWeight: 700 }}>Near you</span> · 2.3 mi</span>
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 12, flexWrap: 'wrap' }}>
            <Tag tone="green">Background checked</Tag>
            <Tag tone="brand">Local specialist</Tag>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AI agent mode ───────────────────────────────────────────────────
// What makes the AI feel different from the human flow, deliberately:
// instant answers (no typing theater), stated confidence, structured output,
// 24/7 availability — and a human always one tap away.
// Repair AI is the Meituan kangaroo — the real mascot.
const KANGAROO_3D = '/assets/meituan-im/kangaroo-3d.png';
const KANGAROO_3D_AVATAR = '/assets/meituan-im/kangaroo-3d-avatar.png';
function AIAvatar() {
  return (
    <div style={{ position: 'relative', width: 34, height: 34, flexShrink: 0 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 17,
        border: `1px solid ${MT.divider}`, overflow: 'hidden',
      }}>
        <img src={KANGAROO_3D_AVATAR} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      {/* AI capsule pinned to the avatar — replaces the name line above bubbles */}
      <span style={{
        position: 'absolute', right: -7, bottom: -3,
        fontSize: 8, fontWeight: 800, fontFamily: FF.text, letterSpacing: '.4px',
        color: '#3D2E00', background: MT.ai,
        borderRadius: 100, padding: '1.5px 5.5px', border: '1.5px solid #fff', lineHeight: 1.2,
      }}>AI</span>
    </div>
  );
}

function AIBubble({ children, tight, wide }) {
  // No name line — the AI capsule on the avatar carries the identity.
  return (
    <div style={{ padding: `${tight ? 1 : 7}px 16px`, ...ENTER }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <AIAvatar />
        <div style={{
          background: MT.surface, borderRadius: '4px 14px 14px 14px',
          padding: '12px 16px', fontSize: 15, lineHeight: '23px',
          maxWidth: 272,
          color: MT.inkSoft, fontFamily: FF.text,
          border: `1px solid ${MT.divider}`,
          animation: 'rvx-stream .5s cubic-bezier(.2,.8,.2,1) both',
        }}>{children}</div>
      </div>
    </div>
  );
}

function AIIntroCard() {
  const rows = [
    { t: 'Instant answers', s: 'No queue, no wait.',
      i: <path d="M13 2L5 13h5l-1 7 8-11h-5l1-7z" stroke={MT.ink} strokeWidth="1.6" fill="none" strokeLinejoin="round"/> },
    { t: 'Trained on 1M+ repairs', s: 'Real orders, real outcomes.',
      i: <><rect x="4" y="5" width="16" height="14" rx="2.5" stroke={MT.ink} strokeWidth="1.6" fill="none"/><path d="M8 10h8M8 14h5" stroke={MT.ink} strokeWidth="1.6" strokeLinecap="round"/></> },
    { t: 'Human on standby', s: 'One tap, any time.',
      i: <><circle cx="12" cy="9" r="3.4" stroke={MT.ink} strokeWidth="1.6" fill="none"/><path d="M5.5 19.5c1-3.4 3.5-5 6.5-5s5.5 1.6 6.5 5" stroke={MT.ink} strokeWidth="1.6" fill="none" strokeLinecap="round"/></> },
  ];
  return (
    <div style={{
      margin: '12px 16px 2px', borderRadius: 16, overflow: 'hidden', position: 'relative',
      background: MT.surface, border: `1px solid ${MT.divider}`, boxShadow: MT.shadowSm,
      flexShrink: 0, display: 'flex', minHeight: 164, animation: 'msg-in .3s cubic-bezier(.2,.8,.2,1) both',
    }}>
      {/* A small yellow glow, bottom-left corner only */}
      <div aria-hidden style={{ position: 'absolute', left: -40, bottom: -48, width: 190, height: 160, background: 'radial-gradient(closest-side, rgba(255,209,0,.5), rgba(255,209,0,0))' }} />
      {/* Left half — the kangaroo */}
      <div style={{ width: '50%', flexShrink: 0, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
        <img src={KANGAROO_3D} alt="" style={{ width: 112, height: 116, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,.14))', animation: 'rvx-pop .5s .15s cubic-bezier(.2,.8,.2,1) both' }} />
        <span style={{ fontSize: 10, fontWeight: 800, fontFamily: FF.text, color: MT.aiInk, letterSpacing: '.6px', textTransform: 'uppercase', background: MT.aiBg, border: `1px solid ${MT.aiBorder}`, borderRadius: 100, padding: '2px 9px' }}>Meituan AI · 24/7</span>
      </div>
      {/* Right half — text starts at the midpoint */}
      <div style={{ width: '50%', minWidth: 0, position: 'relative', padding: '14px 14px 14px 2px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', animation: `soft-in .3s ${180 + i * 90}ms both` }}>
            <svg width="17" height="17" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>{r.i}</svg>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: MT.ink, fontFamily: FF.text, lineHeight: '17px' }}>{r.t}</div>
              <div style={{ fontSize: 12, color: MT.muted, fontFamily: FF.text, marginTop: 2, lineHeight: '15px' }}>{r.s}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Structured diagnosis: the AI visibly analyzes first, then lands on a
// conclusion. The probability breakdown is collapsed behind "How I got here".
function AIDiagnosisCard({ confidence = 92, confirmed }) {
  const [phase, setPhase] = React.useState(confirmed ? 1 : 0); // 0 analyzing → 1 concluded
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (confirmed) return;
    const t = setTimeout(() => setPhase(1), 1600);
    return () => clearTimeout(t);
  }, [confirmed]);
  const causes = confirmed
    ? [{ t: 'Wax ring failure', p: 97 }, { t: 'Flange crack', p: 2 }, { t: 'Drain vent issue', p: 1 }]
    : [{ t: 'Wax ring failure', p: confidence }, { t: 'Flange crack', p: 6 }, { t: 'Drain vent issue', p: 2 }];
  const conf = confirmed ? 97 : confidence;
  const analyzing = phase === 0;
  return (
    <div style={{ padding: '6px 14px', ...ENTER }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <AIAvatar />
        <div style={{ width: 300, background: MT.surface, borderRadius: '4px 16px 16px 16px', border: `1px solid ${MT.divider}`, overflow: 'hidden' }}>
          {analyzing ? (
            /* Phase 1 — visibly working */
            <div style={{ padding: '13px 14px 14px', animation: 'soft-in .25s both' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="15" height="15" viewBox="0 0 20 20" style={{ animation: 'spin 1s linear infinite' }}><circle cx="10" cy="10" r="7.5" fill="none" stroke="rgba(0,0,0,.1)" strokeWidth="2.4"/><circle cx="10" cy="10" r="7.5" fill="none" stroke={MT.ai} strokeWidth="2.4" strokeLinecap="round" strokeDasharray="14 33"/></svg>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: MT.ink, fontFamily: FF.text }}>Analyzing photo & description…</span>
              </div>
              <div style={{ marginTop: 12 }}>
                <div className="rvx-skel" style={{ width: '86%', height: 10, borderRadius: 6 }} />
                <div className="rvx-skel" style={{ width: '64%', height: 10, borderRadius: 6, marginTop: 8 }} />
                <div className="rvx-skel" style={{ width: '74%', height: 10, borderRadius: 6, marginTop: 8 }} />
              </div>
            </div>
          ) : (
            /* Phase 2 — conclusion, details folded away */
            <div style={{ animation: 'soft-in .3s both' }}>
              <div style={{ padding: '13px 14px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: MT.muted, fontFamily: FF.text, textTransform: 'uppercase', letterSpacing: '.6px' }}>Most likely cause</span>
                  <span className="tnum" style={{ fontSize: 12, fontWeight: 800, color: MT.aiInk, fontFamily: FF.text, background: MT.aiBg, border: `1px solid ${MT.aiBorder}`, borderRadius: 100, padding: '2px 8px' }}>{conf}%</span>
                </div>
                <div style={{ marginTop: 5, fontSize: 16, fontWeight: 800, color: MT.ink, fontFamily: FF.display, letterSpacing: '-0.2px' }}>Wax ring failure</div>
                <div style={{ marginTop: 5, height: 4, borderRadius: 2, background: MT.surfaceAlt, overflow: 'hidden' }}>
                  <div style={{ width: `${conf}%`, height: '100%', borderRadius: 2, background: MT.ai, animation: 'rvx-bar .9s .15s cubic-bezier(.2,.8,.2,1) both' }}/>
                </div>
              </div>
              {/* Fold — how I got here */}
              <button onClick={() => setOpen(o => !o)} className="btn-press" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'transparent', border: 0, borderTop: `1px solid ${MT.divider}`, cursor: 'pointer' }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: MT.inkLight, fontFamily: FF.text }}>How I got here</span>
                <svg width="11" height="7" viewBox="0 0 12 8" style={{ transition: 'transform .3s cubic-bezier(.2,.8,.2,1)', transform: open ? 'rotate(180deg)' : 'none' }}><path d="M1 1.5l5 5 5-5" stroke={MT.muted} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <div style={{ maxHeight: open ? 190 : 0, overflow: 'hidden', transition: 'max-height .45s cubic-bezier(.2,.8,.2,1)' }}>
                <div style={{ padding: '4px 14px 6px' }}>
                  {causes.map((c, i) => (
                    <div key={c.t} style={{ padding: '5px 0 8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: 12.5, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? MT.ink : MT.muted, fontFamily: FF.text }}>{c.t}</span>
                        <span className="tnum" style={{ fontSize: 12, fontWeight: 700, color: i === 0 ? MT.ink : MT.mutedSoft, fontFamily: FF.text }}>{c.p}%</span>
                      </div>
                      <div style={{ marginTop: 4, height: 3, borderRadius: 2, background: MT.surfaceAlt, overflow: 'hidden' }}>
                        <div style={{ width: `${c.p}%`, height: '100%', borderRadius: 2, background: i === 0 ? MT.ai : MT.surfaceDeep }}/>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0 8px', fontSize: 12, color: MT.muted, fontFamily: FF.text }}>
                    <svg width="11" height="11" viewBox="0 0 24 24"><path d="M12 3l7 2.4v5.3c0 4.4-3 7.5-7 8.9-4-1.4-7-4.5-7-8.9V5.4L12 3z" stroke={MT.muted} strokeWidth="1.8" fill="none" strokeLinejoin="round"/></svg>
                    <span>A licensed pro reviews before any visit</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// The merchant declares these on-site triggers up front. Anything NOT on this
// list stays inside the cap — that's what turns a "range" into a commitment.
const PRICE_CHANGES = [
  'A core part needs replacing (the flange itself, not just the wax ring)',
  'Hidden water damage is found once the toilet is pulled',
  'You add work beyond this diagnosis on-site',
];
const VENDORS = {
  citrus: { name: 'Citrus Home Services', image: 'bath', rating: '4.9', reviews: '2.1k', tagline: 'Independent · 4.9 · 2.1k jobs', warranty: '90-day', price: '$45 – $60', cap: 66, eta: 30, distance: '1.2', blurb: 'Family-run shop covering all of SF — plumbing, drains, and minor fixtures. Same-day windows on weekdays.', tags: ['90-day warranty', 'Transparent pricing', 'No fix, no charge'], breakdown: [{ k: 'Visit fee', v: '$0' }, { k: 'Diagnostic', v: '$7' }, { k: 'Wax ring + labor', v: '$38 – $53' }] },
  master: { name: 'ServiceMaster Pro',    image: 'tech', rating: '5.0', reviews: '12k', tagline: '#2 Home repair · SF · 5.0',     warranty: '60-day', price: '$50 – $68', cap: 75, eta: 45, distance: '2.6', blurb: 'High-volume crew with strict pricing standards. Best for after-hours and complex jobs.', tags: ['Surcharge refund', 'Transparent pricing', 'After-hours'], breakdown: [{ k: 'Visit fee', v: '$0' }, { k: 'Diagnostic', v: '$9' }, { k: 'Wax ring + labor', v: '$41 – $59' }] },
  quack:  { name: 'QuackFix Appliance',   image: 'cleaner', rating: '4.9', reviews: '6.8k', tagline: 'Online estimate · 4.9 · 6.8k', warranty: '45-day', price: '$42 – $56', cap: 62, eta: 22, distance: '0.8', blurb: 'Lightweight specialists. Send photos, get a flat quote in minutes, no surprises on arrival.', tags: ['Online estimate', 'No fix, no charge', 'Surcharge refund'], breakdown: [{ k: 'Visit fee', v: '$0' }, { k: 'Diagnostic', v: '$6' }, { k: 'Wax ring + labor', v: '$36 – $50' }] },
};

// Reviews — shown as cards on the vendor page (Uber Eats style).
const REVIEWS = [
  { initial: 'L', name: 'Lena R.',   when: '2 days ago',  stars: 5, job: 'Toilet odor repair', text: 'Showed up right on the dot and the quote held exactly — no surprises at the end. Tidied up before leaving.' },
  { initial: 'M', name: 'Marcus T.', when: '1 week ago',  stars: 5, job: 'Wax ring replace',   text: 'Found the source in a couple minutes and fixed it the same visit. Friendly and clearly knew his stuff.' },
  { initial: 'P', name: 'Priya N.',  when: '3 weeks ago', stars: 4, job: 'Flange leak',        text: 'Fair pricing and good communication throughout. Already booked them again for another unit.' },
];

function Stars({ n, size = 13, color = MT.ink }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1.5 }}>
      {[0, 1, 2, 3, 4].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 12 12">
          <path d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 8.5 3 10.5 3.5 7 1 4.5 4.5 4z" fill={i < n ? color : MT.surfaceDeep}/>
        </svg>
      ))}
    </span>
  );
}

function VendorDetailOverlay({ vendorKey, onClose, onBook }) {
  const v = VENDORS[vendorKey];
  if (!v) return null;
  const priceNum = v.price.replace(/\$|\s/g, '');
  const label = { fontSize: 11, color: MT.muted, fontFamily: FF.text, textTransform: 'uppercase', letterSpacing: '.6px', fontWeight: 700 };
  const sectionTitle = { fontSize: 18, fontWeight: 800, color: MT.ink, fontFamily: FF.display, letterSpacing: '-0.3px' };

  const metric = (icon, big, small) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, textAlign: 'center' }}>
      <svg width="22" height="22" viewBox="0 0 24 24" style={{ marginBottom: 1 }}>{icon}</svg>
      <span className="tnum" style={{ fontSize: 16, fontWeight: 800, color: MT.ink, fontFamily: FF.display, letterSpacing: '-0.3px' }}>{big}</span>
      <span style={{ fontSize: 11.5, color: MT.muted, fontFamily: FF.text, fontWeight: 600 }}>{small}</span>
    </div>
  );
  const round = Math.round(parseFloat(v.rating));

  return (
    <div style={{ position: 'absolute', inset: 0, background: MT.surface, zIndex: 60, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slide-up .34s cubic-bezier(.16,.84,.44,1) both' }}>
      {/* Hero photo */}
      <div style={{ position: 'relative', height: 196, flexShrink: 0 }}>
        <VendorImage kind={v.image}/>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,.58) 0%, rgba(0,0,0,.30) 12%, rgba(0,0,0,0) 36%)' }}/>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}><StatusBar tint="#fff" /></div>
        <button onClick={onClose} className="btn-press" style={{ position: 'absolute', top: 54, left: 16, width: 38, height: 38, borderRadius: 19, border: 0, background: MT.surface, boxShadow: MT.shadowMd, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="10" height="17" viewBox="0 0 11 20"><path d="M9 1L1 10l8 9" stroke={MT.ink} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        </button>
        <button className="btn-press" style={{ position: 'absolute', top: 54, right: 16, width: 38, height: 38, borderRadius: 19, border: 0, background: MT.surface, boxShadow: MT.shadowMd, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 20C7.5 16.5 4 13.8 4 9.8 4 7.1 6 5 8.6 5 10.1 5 11.4 5.8 12 7c.6-1.2 1.9-2 3.4-2C18 5 20 7.1 20 9.8c0 4-3.5 6.7-8 10.2z" stroke={MT.ink} strokeWidth="1.7" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* Body — one screen, no scroll */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative', marginTop: -22, background: MT.surface, borderRadius: '22px 22px 0 0', display: 'flex', flexDirection: 'column', padding: '22px 20px 0' }}>
        {/* Identity */}
        <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800, color: MT.ink, fontFamily: FF.display, letterSpacing: '-0.7px', lineHeight: '29px' }}>{v.name}</h1>
        <div style={{ marginTop: 9, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Stars n={round} size={15} />
          <span className="tnum" style={{ fontSize: 15, fontWeight: 800, color: MT.ink, fontFamily: FF.display }}>{v.rating}</span>
          <span style={{ fontSize: 13, color: MT.muted, fontFamily: FF.text }}>· {v.reviews} reviews</span>
        </div>

        {/* Hard metrics — nudged down, generous spacing */}
        <div style={{ marginTop: 26, display: 'flex', alignItems: 'stretch', background: MT.surface, borderRadius: 16, border: `1px solid ${MT.divider}`, padding: '18px 8px' }}>
          {metric(<><circle cx="12" cy="12" r="8.4" stroke={MT.ink} strokeWidth="1.6" fill="none"/><path d="M12 7.4V12l3.2 1.9" stroke={MT.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>, `~${v.eta} min`, 'Arrival')}
          <div style={{ width: 1, background: MT.divider, margin: '2px 0' }} />
          {metric(<><path d="M12 2.6C8.6 2.6 6 5.2 6 8.5c0 4.4 6 11 6 11s6-6.6 6-11c0-3.3-2.6-5.9-6-5.9z" stroke={MT.ink} strokeWidth="1.6" fill="none" strokeLinejoin="round"/><circle cx="12" cy="8.5" r="2.2" stroke={MT.ink} strokeWidth="1.5" fill="none"/></>, `${v.distance} mi`, 'Distance')}
          <div style={{ width: 1, background: MT.divider, margin: '2px 0' }} />
          {metric(<><path d="M12 3l7 2.4v5.3c0 4.4-3 7.5-7 8.9-4-1.4-7-4.5-7-8.9V5.4L12 3z" stroke={MT.greenDeep} strokeWidth="1.6" fill="none" strokeLinejoin="round"/><path d="M8.7 11.7l2.4 2.4 4.3-5" stroke={MT.greenDeep} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>, v.warranty, 'Warranty')}
        </div>

        {/* Reviews */}
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={sectionTitle}>Reviews</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: MT.muted, fontFamily: FF.text }}>{v.reviews} total</span>
        </div>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {REVIEWS.slice(0, 2).map((r, i) => (
            <div key={i} style={{ background: MT.surface, borderRadius: 16, border: `1px solid ${MT.divider}`, padding: '15px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{ width: 38, height: 38, borderRadius: 19, background: MT.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, fontFamily: FF.display, flexShrink: 0 }}>{r.initial}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: MT.ink, fontFamily: FF.text }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: MT.muted, fontFamily: FF.text, marginTop: 1 }}>{r.when} · {r.job}</div>
                </div>
                <Stars n={r.stars} size={13} />
              </div>
              <p style={{ margin: '11px 0 0', fontSize: 13.5, color: MT.inkSoft, fontFamily: FF.text, lineHeight: '20px' }}>{r.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{ padding: '14px 16px', borderTop: `1px solid ${MT.divider}`, background: MT.surface, display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={label}>Quote</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, whiteSpace: 'nowrap' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <span style={{ color: MT.ink, fontSize: 14, fontWeight: 700, fontFamily: FF.display }}>$</span>
              <span className="tnum" style={{ color: MT.ink, fontSize: 20, fontWeight: 800, fontFamily: FF.display, letterSpacing: '-0.3px' }}>{priceNum}</span>
            </div>
            <CapPill cap={v.cap} />
          </div>
        </div>
        <PrimaryBtn onClick={() => onBook && onBook(vendorKey)}>Book this vendor</PrimaryBtn>
      </div>
      <HomeIndicator />
    </div>
  );
}

function BookingCard({ vendorKey, orderNum, onTrack, onCall }) {
  const v = VENDORS[vendorKey] || VENDORS.citrus;
  const [eta, setEta] = React.useState(v.eta || 14);
  React.useEffect(() => {
    const id = setInterval(() => setEta(e => (e > 11 ? e - 1 : e)), 18000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ padding: '6px 14px', ...ENTER }}>
      <div style={{ marginBottom: 4, marginLeft: 44, fontSize: 12, color: MT.ink, fontWeight: 700, fontFamily: FF.text }}>
        Meituan <span style={{ color: MT.muted, fontWeight: 400, marginLeft: 6 }}>confirmed your booking</span>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <BotAvatar />
        <div style={{
          width: 300, background: MT.surface, borderRadius: '4px 16px 16px 16px',
          border: `1px solid ${MT.divider}`, overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 14px',
            background: MT.greenBg,
            borderBottom: `1px solid ${MT.divider}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, background: MT.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 6.5l2 2 4-5" stroke="#FFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontFamily: FF.display, fontSize: 15, fontWeight: 700, color: MT.ink }}>Booked</span>
            </div>
            <span className="tnum" style={{ fontSize: 12, color: MT.muted, fontFamily: FF.text, letterSpacing: '.6px' }}>ORDER · {orderNum || '#4729-A'}</span>
          </div>
          <div style={{ padding: '12px 14px 10px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${MT.divider}` }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
              <VendorImage kind={v.image}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: MT.ink, fontFamily: FF.display, letterSpacing: '-0.2px' }}>{v.name}</div>
              <div style={{ marginTop: 2, fontSize: 12, color: MT.muted, fontFamily: FF.text }}>{v.tagline}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: MT.muted, fontFamily: FF.text, textTransform: 'uppercase', letterSpacing: '.6px', fontWeight: 700 }}>Quoted</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, justifyContent: 'flex-end' }}>
                <span style={{ color: MT.ink, fontSize: 12, fontWeight: 700, fontFamily: FF.display }}>$</span>
                <span className="tnum" style={{ color: MT.ink, fontSize: 14, fontWeight: 800, fontFamily: FF.display }}>{v.price.replace(/\$|\s/g, '')}</span>
              </div>
            </div>
          </div>
          <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 19, flexShrink: 0,
              background: MT.surfaceAlt, border: `1px solid ${MT.hairline}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke={MT.ink} strokeWidth="1.4"/>
                <path d="M8 4.5V8l2.4 1.4" stroke={MT.ink} strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: MT.muted, fontFamily: FF.text, textTransform: 'uppercase', letterSpacing: '.6px', fontWeight: 700 }}>Arriving in</div>
              <div style={{ marginTop: 2, fontSize: 15, fontWeight: 700, color: MT.ink, fontFamily: FF.display }}>
                <span className="tnum" style={{ color: MT.ink }}>~{eta}</span> min · between <span className="tnum">6:00</span> — <span className="tnum">6:15 PM</span>
              </div>
            </div>
          </div>
          <div style={{ padding: '0 12px 12px', display: 'flex', gap: 8 }}>
            <button onClick={onCall} className="btn-press" style={{
              flex: 1, height: 36, borderRadius: 100,
              border: `1px solid ${MT.hairline}`, background: MT.surface,
              fontSize: 13, fontWeight: 700, fontFamily: FF.text, color: MT.ink,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 2.5l2 0 1 3-1.5 1c0.6 1.7 2 3.2 3.8 3.8l1-1.5 3 1 0 2c0 0.5-0.4 1-1 1C5 12.8 1.2 9 1.2 4c0-0.5 0.4-1 0.9-1z" stroke={MT.ink} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Call vendor
            </button>
            <button onClick={onTrack} className="btn-press" style={{
              flex: 1, height: 36, borderRadius: 100, border: 0,
              background: MT.brand, color: MT.brandInk,
              fontSize: 13, fontWeight: 700, fontFamily: FF.text,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              Track arrival
              <svg width="12" height="12" viewBox="0 0 10 10"><path d="M2 5h6M5 2l3 3-3 3" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Secondary pages — every tappable CTA leads somewhere real ───────

// Track arrival — full-screen map view with live ETA and progress timeline.
function TrackOverlay({ vendorKey, onClose, onCall }) {
  const v = VENDORS[vendorKey] || VENDORS.citrus;
  const [eta, setEta] = React.useState(12);
  React.useEffect(() => {
    const id = setInterval(() => setEta(e => (e > 4 ? e - 1 : e)), 9000);
    return () => clearInterval(id);
  }, []);
  const steps = [
    { t: 'Booked', s: '5:46 PM', done: true },
    { t: 'On the way', s: `${v.name} · ${v.distance} mi out`, done: true, live: true },
    { t: 'Arrives', s: '6:00 – 6:15 PM', done: false },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: MT.surface, zIndex: 60, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slide-up .34s cubic-bezier(.16,.84,.44,1) both' }}>
      {/* Map */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative', background: 'linear-gradient(150deg, #EDF1EA 0%, #E6EBEF 55%, #EDEDE9 100%)' }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 424 480" preserveAspectRatio="none" aria-hidden>
          <path d="M-10 130 H434 M-10 260 H434 M-10 390 H434 M90 -10 V490 M210 -10 V490 M330 -10 V490" stroke="rgba(0,0,0,.05)" strokeWidth="10"/>
          <path d="M92 388 L92 262 Q92 240 114 240 L206 240 Q212 240 212 232 L212 138" fill="none" stroke={MT.ink} strokeWidth="4" strokeLinecap="round" strokeDasharray="1 10"/>
        </svg>
        {/* Pro pin — pulsing */}
        <div style={{ position: 'absolute', left: 78, top: 356, animation: 'rvx-pop .4s .2s both' }}>
          <div style={{ position: 'relative', width: 40, height: 40, borderRadius: 20, overflow: 'hidden', border: '3px solid #fff', boxShadow: MT.shadowMd, animation: 'rvx-ring 1.8s ease-out infinite' }}>
            <VendorImage kind={v.image}/>
          </div>
        </div>
        {/* Home pin */}
        <div style={{ position: 'absolute', left: 198, top: 106, animation: 'rvx-pop .4s .35s both' }}>
          <div style={{ width: 30, height: 30, borderRadius: 15, background: MT.ink, border: '3px solid #fff', boxShadow: MT.shadowMd, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 6.5L7 2l5 4.5V12a.8.8 0 0 1-.8.8H8.5V9h-3v3.8H2.8A.8.8 0 0 1 2 12V6.5z" fill="#fff"/></svg>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}><StatusBar /></div>
        <button onClick={onClose} className="btn-press" style={{ position: 'absolute', top: 62, left: 16, width: 38, height: 38, borderRadius: 19, border: 0, background: MT.surface, boxShadow: MT.shadowMd, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="12" height="12" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2L2 12" stroke={MT.ink} strokeWidth="1.7" strokeLinecap="round"/></svg>
        </button>
      </div>
      {/* Bottom card */}
      <div style={{ flexShrink: 0, background: MT.surface, borderRadius: '22px 22px 0 0', marginTop: -22, position: 'relative', padding: '18px 20px 8px', boxShadow: '0 -12px 32px -18px rgba(0,0,0,.25)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 20, fontWeight: 800, fontFamily: FF.display, color: MT.ink, letterSpacing: '-0.4px' }}>
            Arriving in <span className="tnum">~{eta} min</span>
          </span>
          <span className="tnum" style={{ fontSize: 12, color: MT.muted, fontFamily: FF.text, letterSpacing: '.5px' }}>#4729-A</span>
        </div>
        <div style={{ marginTop: 16 }}>
          {steps.map((st, i) => (
            <div key={st.t} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', animation: `soft-in .3s ${200 + i * 100}ms both` }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 14, flexShrink: 0 }}>
                <span style={{ width: 10, height: 10, borderRadius: 5, marginTop: 3, background: st.done ? MT.ink : MT.surface, border: `2px solid ${st.done ? MT.ink : MT.mutedSoft}`, animation: st.live ? 'rvx-ring 1.6s ease-out infinite' : 'none' }}/>
                {i < steps.length - 1 && <span style={{ width: 2, flex: 1, minHeight: 18, background: st.done ? MT.ink : MT.surfaceDeep, margin: '3px 0' }}/>}
              </div>
              <div style={{ paddingBottom: i < steps.length - 1 ? 10 : 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: st.live ? 800 : 600, color: st.done ? MT.ink : MT.muted, fontFamily: FF.text }}>{st.t}</div>
                <div style={{ fontSize: 12, color: MT.muted, fontFamily: FF.text, marginTop: 1 }}>{st.s}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={onCall} className="btn-press" style={{ flex: 1, height: 42, borderRadius: 100, border: `1px solid ${MT.hairline}`, background: MT.surface, fontSize: 13.5, fontWeight: 700, fontFamily: FF.text, color: MT.ink, cursor: 'pointer' }}>Call {v.name.split(' ')[0]}</button>
          <button onClick={onClose} className="btn-press" style={{ flex: 1, height: 42, borderRadius: 100, border: 0, background: MT.brand, color: MT.brandInk, fontSize: 13.5, fontWeight: 700, fontFamily: FF.text, cursor: 'pointer' }}>Message</button>
        </div>
        <HomeIndicator />
      </div>
    </div>
  );
}

// Call sheet — the number stays private, one tap to connect.
function CallSheet({ vendorKey, onClose }) {
  const v = VENDORS[vendorKey] || VENDORS.citrus;
  const [calling, setCalling] = React.useState(false);
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 60, animation: 'fade-in .2s both' }}/>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: MT.surface, boxShadow: MT.shadowLg, borderRadius: '20px 20px 0 0', padding: '12px 20px 20px', zIndex: 61, animation: 'sheet-up .4s cubic-bezier(.2,.8,.2,1) both', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: MT.surfaceDeep }}/>
        </div>
        <div style={{ width: 62, height: 62, borderRadius: 31, overflow: 'hidden', margin: '0 auto', border: `1px solid ${MT.hairline}`, animation: calling ? 'rvx-ring 1.4s ease-out infinite' : 'none' }}>
          <VendorImage kind={v.image}/>
        </div>
        <div style={{ marginTop: 12, fontSize: 17, fontWeight: 800, fontFamily: FF.display, color: MT.ink, letterSpacing: '-0.3px' }}>{v.name}</div>
        <div style={{ marginTop: 4, fontSize: 13, color: MT.muted, fontFamily: FF.text }}>
          {calling ? 'Connecting…' : 'Your number stays private'}
        </div>
        <div style={{ marginTop: 18 }}>
          {calling ? (
            <button onClick={onClose} className="btn-press" style={{ width: '100%', height: 46, borderRadius: 100, border: 0, background: MT.negative, color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: FF.display, cursor: 'pointer', animation: 'soft-in .25s both' }}>End call</button>
          ) : (
            <React.Fragment>
              <PrimaryBtn full onClick={() => setCalling(true)}>Call now</PrimaryBtn>
              <button onClick={onClose} className="btn-press" style={{ background: 'transparent', border: 0, color: MT.muted, fontSize: 13, fontFamily: FF.text, padding: '14px 0 0', cursor: 'pointer', width: '100%' }}>Cancel</button>
            </React.Fragment>
          )}
        </div>
      </div>
    </>
  );
}

// Order receipt — the completed order in full.
function ReceiptOverlay({ onClose }) {
  const rows = [
    { k: 'Wax ring + labor', v: '$45' },
    { k: 'Diagnostic', v: '$7' },
    { k: 'Visit fee', v: '$0' },
  ];
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 60, animation: 'fade-in .2s both' }}/>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: MT.surface, boxShadow: MT.shadowLg, borderRadius: '20px 20px 0 0', padding: '12px 20px 20px', zIndex: 61, animation: 'sheet-up .4s cubic-bezier(.2,.8,.2,1) both' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: MT.surfaceDeep }}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 18, fontWeight: 800, fontFamily: FF.display, color: MT.ink, letterSpacing: '-0.3px' }}>Order #4729</span>
          <svg onClick={onClose} style={{ cursor: 'pointer' }} width="14" height="14" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2L2 12" stroke={MT.muted} strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
        <div style={{ fontSize: 12.5, color: MT.muted, fontFamily: FF.text, marginBottom: 14 }}>Completed yesterday, 6:40 PM · Citrus Home Services</div>
        <div style={{ border: `1px solid ${MT.divider}`, borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
          {rows.map((r, i) => (
            <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 14px', borderBottom: `1px solid ${MT.divider}`, fontSize: 13.5, fontFamily: FF.text, animation: `soft-in .3s ${140 + i * 80}ms both` }}>
              <span style={{ color: MT.inkSoft }}>{r.k}</span>
              <span className="tnum" style={{ color: MT.ink, fontWeight: 700 }}>{r.v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: MT.ink, fontSize: 13, fontFamily: FF.text }}>
            <span style={{ color: 'rgba(255,255,255,.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', fontSize: 11 }}>Total paid</span>
            <span className="tnum" style={{ color: '#fff', fontWeight: 800, fontSize: 15, fontFamily: FF.display }}>$52</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: 12.5, color: MT.greenDeep, fontFamily: FF.text, fontWeight: 600 }}>
          <svg width="12" height="12" viewBox="0 0 24 24"><path d="M12 3l7 2.4v5.3c0 4.4-3 7.5-7 8.9-4-1.4-7-4.5-7-8.9V5.4L12 3z" stroke={MT.greenDeep} strokeWidth="1.8" fill="none" strokeLinejoin="round"/></svg>
          <span>45-day warranty · until Oct 16</span>
        </div>
        <PrimaryBtn full onClick={onClose}>Done</PrimaryBtn>
      </div>
    </>
  );
}

// Time picker — pick a date + slot, then quotes re-collect for that window.
function TimeSheet({ onClose, onConfirm }) {
  const days = ['Today', 'Tomorrow', 'Thu 9/4'];
  const slots = ['9–11 AM', '11–1 PM', '1–3 PM', '3–5 PM', '5–7 PM', '7–9 PM'];
  const [day, setDay] = React.useState(1);
  const [slot, setSlot] = React.useState(2);
  const label = `${days[day]} · ${slots[slot]}`;
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 60, animation: 'fade-in .2s both' }}/>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: MT.surface, boxShadow: MT.shadowLg, borderRadius: '20px 20px 0 0', padding: '12px 20px 20px', zIndex: 61, animation: 'sheet-up .4s cubic-bezier(.2,.8,.2,1) both' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: MT.surfaceDeep }}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 18, fontWeight: 800, fontFamily: FF.display, color: MT.ink, letterSpacing: '-0.3px' }}>Pick a time</span>
          <svg onClick={onClose} style={{ cursor: 'pointer' }} width="14" height="14" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2L2 12" stroke={MT.muted} strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {days.map((d, i) => (
            <button key={d} onClick={() => setDay(i)} className="btn-press" style={{ flex: 1, height: 38, borderRadius: 10, border: `1px solid ${day === i ? MT.ink : MT.hairline}`, background: day === i ? MT.ink : MT.surface, color: day === i ? '#fff' : MT.inkSoft, fontSize: 13, fontWeight: 700, fontFamily: FF.text, cursor: 'pointer', transition: 'all .18s' }}>{d}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          {slots.map((s, i) => (
            <button key={s} onClick={() => setSlot(i)} className="btn-press" style={{ height: 38, borderRadius: 10, border: `1px solid ${slot === i ? MT.ink : MT.hairline}`, background: slot === i ? MT.surfaceAlt : MT.surface, color: slot === i ? MT.ink : MT.inkLight, fontSize: 12.5, fontWeight: slot === i ? 700 : 500, fontFamily: FF.text, cursor: 'pointer', transition: 'all .15s' }}>{s}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: 12, color: MT.muted, fontFamily: FF.text }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke={MT.muted} strokeWidth="1.2"/><path d="M7 4.2V7l2 1.2" stroke={MT.muted} strokeWidth="1.3" strokeLinecap="round"/></svg>
          <span>Quotes re-collect for the new window — diagnosis carries over</span>
        </div>
        <PrimaryBtn full onClick={() => onConfirm(label)}>Confirm {label}</PrimaryBtn>
      </div>
    </>
  );
}

function InviteCard({ onAct }) {
  return (
    <div style={{ padding: '6px 14px', ...ENTER }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <ProAvatar />
        <div style={{ background: MT.surface, borderRadius: '4px 16px 16px 16px', width: 300, padding: '14px 16px', border: `1px solid ${MT.divider}` }}>
          <div style={{ fontFamily: FF.display, fontSize: 15, fontWeight: 800, color: MT.ink, letterSpacing: '-0.2px' }}>Quick favor — rate us?</div>
          <div style={{ marginTop: 6, fontSize: 13, lineHeight: '20px', color: MT.inkLight, fontFamily: FF.text }}>Happy? Leave a review. Anything off — message me and I'll make it right.</div>
          <div style={{ marginTop: 12 }}><PrimaryBtn full onClick={onAct}>Rate this service</PrimaryBtn></div>
        </div>
      </div>
      <div style={{ marginLeft: 44, marginTop: 6 }}>
        <button style={{ background: 'transparent', border: 0, color: MT.muted, fontSize: 12, fontFamily: FF.text, padding: '4px 0', cursor: 'pointer' }}>Dismiss</button>
      </div>
    </div>
  );
}

// ─── Quick-reply chips above the composer — every chip answers ───────
// Tapping a chip sends it as the user's message and gets a canned reply, so
// everything that looks tappable actually works.
const CHIP_REPLIES = {
  'Pricing':        { text: 'How does pricing work?',  reply: 'Diagnosis is free. Pros quote against your order — a fixed price or a hard-capped range. The final bill can never pass the cap.' },
  'Common issues':  { text: 'What do you fix most?',   reply: 'Toilets, drains, leaks and fixtures are the big four. Describe yours and we go from there.' },
  'Service area':   { text: 'Do you cover my area?',   reply: 'All of San Francisco, Mon–Sun 9 AM – 10 PM. Your address at 820 W Ridge Ln is covered.' },
  'Leave a note':   { text: "I'll leave a note for the team", reply: "Noted — a specialist will pick this up the moment we reopen at 9 AM." },
  'Order details':  { text: 'Show my order details',   reply: 'Order #4729 · wax ring replaced by Citrus Home Services · paid $52 · 45-day warranty.' },
  'Order status':   { text: "What's my order status?", reply: 'Your pro is on the way — arriving in about 14 minutes.' },
  'Reschedule':     { text: "I'd like to reschedule",  reply: 'Sure — pick a new time on the order card above and everything else carries over.' },
  'Edit order':     { text: 'I want to edit my order', reply: 'Tap any row on the order card above to change it — the quotes update automatically.' },
  'Contact vendor': { text: 'Contact my vendor',       reply: "Calling connects you directly — or reply here and we'll relay it in seconds." },
  'Report an issue':{ text: 'I want to report an issue', reply: "Sorry to hear that. Tell me what happened — if the bill passed the quote, the gap is refunded first, no haggling." },
  'Tip the pro':    { text: "I'd like to tip Mike",    reply: 'That is kind — a tip option was added to your receipt. 100% goes to Mike.' },
  'Cancel':         { text: 'Cancel my request',       reply: 'Done — nothing was charged. Your diagnosis is saved if you change your mind.' },
};

function QuickReplies({ stage, scenario, onChip }) {
  let chips;
  if (scenario === 'off-hours')        chips = ['Leave a note', 'Common issues', 'Pricing', 'Service area'];
  else if (scenario === 'return-visit') chips = ['Order details', 'Talk to a pro', 'Report an issue', 'Tip the pro'];
  else if (stage <= 2)                  chips = ['Common issues', 'Pricing', 'Service area', 'Talk to a pro'];
  else if (stage === 3)                 chips = ['Edit order', 'Reschedule', 'Talk to a pro', 'Cancel'];
  else                                  chips = ['Order status', 'Reschedule', 'Contact vendor', 'Talk to a pro'];
  return (
    <div className="scroll" style={{
      display: 'flex', gap: 6, padding: '8px 16px 6px',
      background: MT.surface, borderTop: `1px solid ${MT.divider}`,
      overflowX: 'auto', flexShrink: 0,
      WebkitMaskImage: 'linear-gradient(to right, #000 calc(100% - 26px), transparent 100%)',
      maskImage: 'linear-gradient(to right, #000 calc(100% - 26px), transparent 100%)',
    }}>
      {chips.map(c => (
        <button key={c} onClick={() => onChip && onChip(c)} className="btn-press" style={{
          height: 32, padding: '0 14px', borderRadius: 100, border: `1px solid ${MT.hairline}`,
          background: MT.surface, color: MT.inkSoft,
          fontSize: 12, fontWeight: 600, fontFamily: FF.text,
          whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0,
        }}>{c}</button>
      ))}
    </div>
  );
}

// ─── Message renderer ───────────────────────────────────────────────
function senderOf(t) {
  if (t === 'me' || t === 'me-video' || t === 'me-photo') return 'me';
  if (t === 'pro' || t === 'typing-pro' || t === 'order' || t === 'product' || t === 'expert-intro' || t === 'invite') return 'pro';
  if (t === 'bot' || t === 'bot-q' || t === 'typing-bot' || t === 'quotes' || t === 'quick-rating' || t === 'booking') return 'bot';
  if (t === 'ai' || t === 'ai-intro' || t === 'ai-diag') return 'bot';
  return null;
}

function renderMessage(m, ctx, tight) {
  switch (m.type) {
    case 'bot': return <BotBubble key={m.id} tight={tight}>{m.text}</BotBubble>;
    case 'ai': return <AIBubble key={m.id} tight={tight}>{m.text}</AIBubble>;
    case 'ai-intro': return <AIIntroCard key={m.id} />;
    case 'ai-diag': return <AIDiagnosisCard key={m.id} confidence={m.confidence} confirmed={m.confirmed} />;
    case 'bot-q': {
      const Wrap = m.ai ? AIBubble : BotBubble;
      return (
        <Wrap key={m.id}>
          <div>{m.text}</div>
          {m.options.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 208 }}>
              {m.options.map((q, i) => <SuggestedQ key={i} onTap={() => ctx.onPick(m.id, q)}>{q}</SuggestedQ>)}
            </div>
          )}
        </Wrap>
      );
    }
    case 'pro': return <ProBubble key={m.id} tight={tight}>{m.text}</ProBubble>;
    case 'me': return <MeBubble key={m.id} status={m.status} tight={tight}>{m.text}</MeBubble>;
    case 'me-video': return <VideoMessage key={m.id} />;
    case 'me-photo': return <CatLitterPhoto key={m.id} />;
    case 'system': return <SystemText key={m.id} time={m.time} sub={m.sub} />;
    case 'handshake': return <Handshake key={m.id} time={m.time} />;
    case 'divider': return <Divider key={m.id} label={m.label} />;
    case 'hero': return <Hero key={m.id} />;
    case 'intro': return <IntroCard key={m.id} />;
    case 'typing-bot': return <TypingBubble key={m.id} />;
    case 'typing-pro': return <TypingBubble key={m.id} variant="pro" />;
    case 'order': return <RepairOrderCard key={m.id} pending={m.pending} ai={m.ai} when={m.when} onGetQuotes={() => ctx.onAction('get-quotes')} onPickTime={() => ctx.onAction('open-time')} />;
    case 'quotes': return <div key={m.id} data-msg-type="quotes"><MerchantQuotesCard stale={m.stale} onView={(k) => ctx.onAction('view-vendor:' + k)} /></div>;
    case 'booking': return <BookingCard key={m.id} vendorKey={ctx.bookedVendor || m.vendor} orderNum={m.orderNum} onTrack={() => ctx.onAction('open-track')} onCall={() => ctx.onAction('open-call')} />;
    case 'expert-intro': return <ExpertIntroCard key={m.id} />;
    case 'product': return <ProductCard key={m.id} onBuy={() => ctx.onAction('buy-product')} />;
    case 'quick-rating': return <QuickRating key={m.id} onPick={(k) => ctx.onAction('rate:' + k)} />;
    case 'invite': return <InviteCard key={m.id} onAct={() => ctx.onAction('open-review')} />;
    case 'order-recap': return <OrderRecapCard key={m.id} />;
    default: return null;
  }
}

const SCRIPTS = {
  default: [
    { delay: 0,    append: { type: 'intro', id: 'intro' } },
    { delay: 360,  append: { type: 'system', id: 's1', time: '5:33 PM', sub: 'Private & encrypted' } },
    { delay: 700,  append: { type: 'typing-bot', id: 't1' } },
    { delay: 900,  replace: 't1', append: { type: 'bot-q', id: 'q1', text: "Hey — what's the trouble? Tell me what's going on and I'll take a look.", options: ['Toilet smells', "Toilet won't refill", 'Toilet is clogged'] } },
    { wait: 'q1' },
    { delay: 600,  append: { type: 'me', id: 'm1', text: "Toilet smells. I can't tell where the odor is coming from." } },
    { delay: 900,  stage: 2, append: { type: 'handshake', id: 's2', time: '5:40 PM' } },
    { delay: 1500, append: { type: 'expert-intro', id: 'expert' } },
    { delay: 700, append: { type: 'typing-pro', id: 't2' } },
    { delay: 800, replace: 't2', append: { type: 'pro', id: 'p1', text: 'Could you film a short clip of the toilet?' } },
    { delay: 900,  append: { type: 'me', id: 'm2', text: 'Sure thing' } },
    { delay: 600,  append: { type: 'me-video', id: 'm3' } },
    { delay: 800, append: { type: 'typing-pro', id: 't3' } },
    { delay: 800, replace: 't3', stage: 3, append: { type: 'pro', id: 'p2', text: "The wax ring under the base has worn out — that's the source. Replacing it fixes it." } },
    { delay: 900,  append: { type: 'typing-pro', id: 't4' } },
    { delay: 700,  replace: 't4', append: { type: 'pro', id: 'p3', text: 'Here is your repair order. Confirm time and address to collect quotes.' } },
    { delay: 700,  append: { type: 'order', id: 'order' } },
    { wait: 'action:get-quotes' },
    { delay: 400,  stage: 4, append: { type: 'typing-bot', id: 't5' } },
    { delay: 500,  replace: 't5', append: { type: 'system', id: 's3', time: '5:44 PM' } },
    { delay: 300,  append: { type: 'bot', id: 'b2', text: 'Reaching out to nearby pros…' } },
    { delay: 600,  append: { type: 'quotes', id: 'quotes' } },
    { wait: 'action:book-vendor' },
    { delay: 400,  append: { type: 'system', id: 's4', time: '5:46 PM' } },
    { delay: 200,  append: { type: 'typing-bot', id: 't6' } },
    { delay: 700,  replace: 't6', append: { type: 'bot', id: 'b3', text: 'Booked — your pro is on the way.' } },
    { delay: 500,  append: { type: 'booking', id: 'booking', orderNum: '#4729-A' } },
  ],

  // AI agent — instant, confident, structured; a human is one tap away.
  'ai-agent': [
    { delay: 0,   append: { type: 'ai-intro', id: 'intro' } },
    { delay: 320, append: { type: 'system', id: 's1', time: '2:13 AM', sub: 'AI answers 24/7 · humans from 9 AM' } },
    { delay: 450, append: { type: 'bot-q', id: 'q1', ai: true, text: "Hey — what's the trouble? Tell me what's going on and I'll take a look.", options: ['Toilet smells', "Toilet won't refill", 'Toilet is clogged'] } },
    { wait: 'q1' },
    { delay: 450, append: { type: 'me', id: 'm1', text: "Toilet smells. I can't tell where the odor is coming from." } },
    { delay: 260, stage: 2, append: { type: 'ai', id: 'a1', text: 'Most likely a failed wax ring under the base. Here is my read:' } },
    { delay: 340, append: { type: 'ai-diag', id: 'd1', confidence: 92 } },
    { delay: 2400, append: { type: 'bot-q', id: 'q2', ai: true, text: 'A short clip would confirm it.', options: ['Send a video', 'Talk to a human'] } },
    { wait: 'q2' },
    { delay: 500, append: { type: 'me-video', id: 'm2' } },
    { delay: 300, append: { type: 'ai', id: 'a2', text: 'Confirmed — wax ring it is.' } },
    { delay: 320, stage: 3, append: { type: 'ai-diag', id: 'd2', confirmed: true } },
    { delay: 450, append: { type: 'ai', id: 'a3', text: 'Order drafted. Confirm time and address to collect quotes.' } },
    { delay: 400, append: { type: 'order', id: 'order', ai: true } },
    { wait: 'action:get-quotes' },
    { delay: 300, stage: 4, append: { type: 'system', id: 's3', time: '2:15 AM' } },
    { delay: 400, append: { type: 'quotes', id: 'quotes' } },
    { wait: 'action:book-vendor' },
    { delay: 350, append: { type: 'ai', id: 'a4', text: 'Booked — your pro arrives at 9 AM sharp.' } },
    { delay: 400, append: { type: 'booking', id: 'booking', orderNum: '#4729-B' } },
  ],

  'cat-litter': [
    { delay: 0,    append: { type: 'intro', id: 'intro' } },
    { delay: 360,  append: { type: 'system', id: 's1', time: '5:33 PM', sub: 'Private & encrypted' } },
    { delay: 700,  append: { type: 'typing-bot', id: 't1' } },
    { delay: 900,  replace: 't1', append: { type: 'bot-q', id: 'q1', text: "Hey — what's the trouble? Tell me what's going on and I'll take a look.", options: ['How do I deal with a clogged toilet?', 'How much does unclogging cost?'] } },
    { wait: 'q1' },
    { delay: 600,  append: { type: 'me', id: 'm1', text: "The toilet's clogged with cat litter" } },
    { delay: 900,  stage: 2, append: { type: 'handshake', id: 's2', time: '5:40 PM' } },
    { delay: 1500, append: { type: 'expert-intro', id: 'expert' } },
    { delay: 700, append: { type: 'typing-pro', id: 't2' } },
    { delay: 800, replace: 't2', append: { type: 'pro', id: 'p1', text: 'Quick question — is it tofu litter, clay, or a mix? A photo would help.' } },
    { delay: 800,  append: { type: 'me', id: 'm2', text: 'Tofu litter' } },
    { delay: 600,  append: { type: 'me-photo', id: 'm3' } },
    { delay: 800, append: { type: 'typing-pro', id: 't3' } },
    { delay: 800, replace: 't3', append: { type: 'pro', id: 'p2', text: 'Tofu litter dissolves slowly — wait ten minutes and flush again. Still stuck? The bundle below sends a tech.' } },
    { delay: 800,  append: { type: 'product', id: 'product' } },
    { wait: 'action:buy-product' },
    { delay: 400,  append: { type: 'system', id: 's3', time: '5:45 PM', sub: 'Order placed · arriving 6:15 PM' } },
    { delay: 800, append: { type: 'typing-pro', id: 't4' } },
    { delay: 900,  replace: 't4', append: { type: 'bot-q', id: 'q2', text: 'Did that clear it up?', options: ['Yes, it cleared', 'Still clogged — talk to a pro'] } },
    { wait: 'q2' },
    { delay: 700,  append: { type: 'typing-pro', id: 't5' } },
    { delay: 900,  replace: 't5', append: { type: 'pro', id: 'p3', text: 'Great. Closing the ticket — ping us anytime.' } },
  ],

  'off-hours': [
    { delay: 0,   append: { type: 'intro', id: 'intro' } },
    { delay: 360, append: { type: 'system', id: 's1', time: '10:48 PM', sub: 'Private & encrypted' } },
    { delay: 700, append: { type: 'typing-bot', id: 't1' } },
    { delay: 900, replace: 't1', append: { type: 'bot', id: 'b1', text: "We're closed right now (9 AM – 10 PM daily). Leave a note — a specialist replies the moment we reopen." } },
    { delay: 600, append: { type: 'bot-q', id: 'q1', text: 'Or skip the wait:', options: ['Ask the AI agent — it never sleeps'] } },
  ],

  'expired-modal': [
    { delay: 0,    stage: 4, append: { type: 'system', id: 's0', time: '5:44 PM' } },
    { delay: 200,  append: { type: 'bot', id: 'b0', text: 'Got it — pinging nearby pros now.' } },
    { delay: 300,  append: { type: 'quotes', id: 'quotes' } },
    { delay: 400,  action: 'show-modal' },
  ],

  'expired-chat': [
    { delay: 0,    stage: 4, append: { type: 'quotes', id: 'quotes', stale: true } },
    { delay: 600,  append: { type: 'divider', id: 'd1', label: 'Earlier conversation' } },
    { delay: 400,  append: { type: 'typing-pro', id: 't1' } },
    { delay: 900,  replace: 't1', append: { type: 'pro', id: 'p1', text: "Your quotes expired. Pick a new time and we'll re-collect." } },
    { delay: 800,  append: { type: 'order', id: 'order', pending: true } },
    { wait: 'action:time-picked' },
    { delay: 350,  append: { type: 'system', id: 's2', time: '6:02 PM' } },
    { delay: 300,  append: { type: 'bot', id: 'b2', text: 'Re-collecting quotes for your new window…' } },
    { delay: 550,  append: { type: 'quotes', id: 'quotes2' } },
    { wait: 'action:book-vendor' },
    { delay: 300,  append: { type: 'bot', id: 'b3', text: 'Booked — your pro is on the way.' } },
    { delay: 450,  append: { type: 'booking', id: 'booking', orderNum: '#4729-A' } },
  ],

  'return-visit': [
    { delay: 0,    stage: 4, append: { type: 'order-recap', id: 'recap' } },
    { delay: 120,  append: { type: 'divider', id: 'd1', label: 'Earlier conversation' } },
    { delay: 400,  append: { type: 'typing-pro', id: 't1' } },
    { delay: 900,  replace: 't1', append: { type: 'bot-q', id: 'q1', text: 'Did the previous tech sort it out for you? Anything else I can help with?', options: ['The diagnosis was off', "The repair plan didn't hold up", 'The vendor charged more than the quote'] } },
    { wait: 'q1' },
    { delay: 600,  append: { type: 'me', id: 'm1', text: 'Nope, all good' } },
    { delay: 900,  append: { type: 'typing-pro', id: 't2' } },
    { delay: 800,  replace: 't2', append: { type: 'pro', id: 'p1', text: "Glad to hear it. One quick thing before I close out — how was it?" } },
    { delay: 500,  append: { type: 'quick-rating', id: 'rate' } },
    { wait: 'action:rate' },
    { delay: 600,  append: { type: 'pro', id: 'p2', text: 'Appreciate it. A longer review helps the next customer — optional.' } },
    { delay: 600,  append: { type: 'invite', id: 'invite' } },
  ],
};

const STAGE_BY_SCENARIO = {
  default: 1, 'ai-agent': 1, 'cat-litter': 1, 'off-hours': 1,
  'expired-modal': 4, 'expired-chat': 4, 'return-visit': 4,
};

// When a deep-link carries ?seek=1 (the deck's flow slides), fast-forward each
// scenario to the step index below — its key state — and pause there instead of
// replaying the whole conversation from the first message.
const SEEK = {
  default:         16, // the drafted repair-order (service) card, awaiting "get quotes"
  'ai-agent':      13, // the AI-drafted order card
  'cat-litter':    14, // the self-serve product bundle card
  'off-hours':      3, // the after-hours message
  'expired-modal':  3, // live quotes + the expired modal
  'expired-chat':   4, // stale quotes + the re-quote order
  'return-visit':   3, // the return-visit question (after the order-recap card)
};

// ─── Player ─────────────────────────────────────────────────────────
function Player({ scenario, onSceneEnd }) {
  CUR_EXPERT = scenario === 'cat-litter' ? EXPERTS.local : EXPERTS.default;
  const [messages, setMessages] = React.useState([]);
  const [stage, setStage] = React.useState(STAGE_BY_SCENARIO[scenario] || 1);
  const [waiting, setWaiting] = React.useState(null);
  const [modal, setModal] = React.useState(null);
  const [bookedVendor, setBookedVendor] = React.useState(null);
  const scrollRef = React.useRef(null);
  const stepIdx = React.useRef(0);
  const cancelled = React.useRef(false);

  React.useEffect(() => {
    cancelled.current = true;
    setMessages([]);
    setWaiting(null);
    setModal(null);
    setBookedVendor(null);
    setStage(STAGE_BY_SCENARIO[scenario] || 1);
    stepIdx.current = 0;
    cancelled.current = false;
    const sv = __seekStep();
    const fu = sv == null ? undefined : (sv === true ? SEEK[scenario] : sv);
    runFrom(0, (fu != null) ? { fastUntil: fu } : undefined);
    // eslint-disable-next-line
  }, [scenario]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Opening: keep the chat pinned to the top so the intro card reads first —
    // until the user sends their first reply, then resume bottom-following.
    const hasUserMsg = messages.some(m => senderOf(m.type) === 'me');
    if (stage <= 1 && !hasUserMsg) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const last = messages[messages.length - 1];
    if (last && last.type === 'quotes') {
      requestAnimationFrame(() => {
        const qEl = el.querySelector('[data-msg-type="quotes"]');
        if (qEl) {
          // offsetTop is relative to the positioned phone shell, not the scroll
          // container — measure with rects so the card header + sort control
          // land at the top instead of overshooting past them.
          const top = qEl.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop - 12;
          el.scrollTo({ top, behavior: 'smooth' });
          return;
        }
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      });
      return;
    }
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, modal, stage]);

  function applyStep(step) {
    if (step.stage) setStage(step.stage);
    if (step.action === 'show-modal') {
      setModal('expired');
      return;
    }
    setMessages(prev => {
      let next = prev;
      if (step.replace) next = next.filter(m => m.id !== step.replace);
      if (step.append) next = [...next, step.append];
      return next;
    });
  }

  function runFrom(idx, opts) {
    const script = SCRIPTS[scenario];
    if (!script) return;
    // fastUntil: when seeking (deck deep-links), apply every step up to and
    // including this index instantly — no delays, and auto-pass any wait — so the
    // flow lands on its key state. Normal playback resumes at the next step.
    const fastUntil = (opts && opts.fastUntil != null) ? opts.fastUntil : -1;
    let i = idx;
    const next = () => {
      if (cancelled.current) return;
      if (i >= script.length) { onSceneEnd && onSceneEnd(); return; }
      const step = script[i];
      const fast = i <= fastUntil;
      if (step.wait) {
        if (fast) {
          // Seeking past an answered question — drop its tappable options so the
          // built-up state reads as already replied, then continue without pausing.
          setMessages(prev => prev.map(m => (m.id === step.wait ? { ...m, options: [] } : m)));
          i++;
          stepIdx.current = i;
          next();
          return;
        }
        setWaiting(step.wait);
        return;
      }
      const run = () => {
        if (cancelled.current) return;
        applyStep(step);
        i++;
        stepIdx.current = i;
        next();
      };
      if (fast) run();
      else setTimeout(run, __RM ? Math.min(step.delay || 0, 100) : (step.delay || 0));
    };
    next();
  }

  const ctx = {
    // Quick-reply chips: send the tap as a user message, then answer it with a
    // canned reply — out-of-band, without touching the scripted flow.
    onChip: (chip) => {
      if (/talk to a pro/i.test(chip)) { onSceneEnd && onSceneEnd('default'); return; }
      // Chips with a real secondary page open it instead of a canned reply.
      if (chip === 'Order status')   { setModal('track');   return; }
      if (chip === 'Contact vendor') { setModal('call');    return; }
      if (chip === 'Order details')  { setModal('receipt'); return; }
      if (chip === 'Reschedule')     { setModal('time');    return; }
      const c = CHIP_REPLIES[chip];
      if (!c) return;
      const now = Date.now();
      setMessages(prev => [...prev, { type: 'me', id: 'chip-' + now, text: c.text }]);
      setTimeout(() => {
        if (cancelled.current) return;
        setMessages(prev => [...prev, { type: 'typing-bot', id: 'chip-t-' + now }]);
      }, 350);
      setTimeout(() => {
        if (cancelled.current) return;
        setMessages(prev => [...prev.filter(m => m.id !== 'chip-t-' + now), { type: 'bot', id: 'chip-r-' + now, text: c.reply }]);
      }, 1150);
    },
    onPick: (qId, text) => {
      if (waiting === qId) {
        setMessages(prev => prev.map(m => m.id === qId ? { ...m, options: [] } : m));
        setMessages(prev => [...prev, { type: 'me', id: 'pick-' + Date.now(), text }]);
        setWaiting(null);
        if (/talk to a (pro|human)/i.test(text)) {
          onSceneEnd && onSceneEnd('default');
          return;
        }
        if (/ai agent/i.test(text)) {
          onSceneEnd && onSceneEnd('ai-agent');
          return;
        }
        runFrom(stepIdx.current + 1);
        stepIdx.current = stepIdx.current + 1;
      }
    },
    onAction: (a) => {
      const fullKey = 'action:' + a;
      const prefixKey = 'action:' + a.split(':')[0];
      const matchedWait = waiting && (waiting === fullKey || waiting === prefixKey);

      if (a.startsWith('book-vendor:')) {
        const k = a.split(':')[1];
        setBookedVendor(k);
        setModal(null);
      }
      if (a === 'open-time')  { setModal('time');  return; }
      if (a === 'open-track') { setModal('track'); return; }
      if (a === 'open-call')  { setModal('call');  return; }
      if (a.startsWith('time-picked')) {
        const label = a.slice('time-picked:'.length);
        setModal(null);
        setMessages(prev => prev.map(m => (m.type === 'order' ? { ...m, pending: false, when: label } : m)));
      }
      if (matchedWait) {
        setWaiting(null);
        runFrom(stepIdx.current + 1);
        stepIdx.current = stepIdx.current + 1;
        return;
      }
      if (a === 'open-review') {
        setModal('review');
        return;
      }
      if (a.startsWith('view-vendor:')) {
        setModal('vendor:' + a.split(':')[1]);
      }
    },
    bookedVendor,
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Phone bezel */}
      <div style={{
        width: 432, height: 924, borderRadius: 56,
        background: '#1A1A1C',
        padding: 4, position: 'relative',
        border: '1px solid #000',
        boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ position: 'absolute', left: -2, top: 110, width: 3, height: 32, borderRadius: 2, background: '#0A0A0C' }} />
        <div style={{ position: 'absolute', left: -2, top: 180, width: 3, height: 60, borderRadius: 2, background: '#0A0A0C' }} />
        <div style={{ position: 'absolute', left: -2, top: 248, width: 3, height: 60, borderRadius: 2, background: '#0A0A0C' }} />
        <div style={{ position: 'absolute', right: -2, top: 200, width: 3, height: 96, borderRadius: 2, background: '#0A0A0C' }} />
        <div style={{ width: 424, height: 916, borderRadius: 52, overflow: 'hidden', background: MT.surface, position: 'relative', display: 'flex', flexDirection: 'column', fontFamily: FF.text, color: MT.ink }}>
          <div style={{
            position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
            width: 120, height: 36, borderRadius: 22, background: '#08080A', zIndex: 50,
          }} />
          <StatusBar />
          <Header active={scenario === 'return-visit' ? 5 : stage} stage={stage} scenario={scenario} vendor={bookedVendor} ai={scenario === 'ai-agent'} />
          <div ref={scrollRef} className="scroll" style={{ flex: 1, overflow: 'auto', background: MT.bg, paddingBottom: 14, overscrollBehavior: 'contain' }}>
            {messages.map((m, __i) => {
              const __p = messages[__i - 1];
              const __sd = !!(__p && senderOf(__p.type) && senderOf(__p.type) === senderOf(m.type));
              return renderMessage(m, ctx, __sd);
            })}
          </div>
          <QuickReplies stage={stage} scenario={scenario} onChip={ctx.onChip} />
          <Composer
            leftLabel={scenario === 'return-visit' ? 'Rate this conversation' : null}
            placeholder={
              scenario === 'return-visit' ? 'How was it?' :
              scenario === 'off-hours' ? 'Leave a note for the team…' :
              stage < 2 ? 'Tell us what is going on…' :
              scenario === 'ai-agent' ? 'Reply to Repair AI…' :
              'Reply to Mike Chen…'
            }
          />
          <HomeIndicator />

          {modal === 'expired' && <ExpiredModal onAct={() => { setModal(null); onSceneEnd && onSceneEnd('expired-chat'); }} />}
          {modal === 'track'   && <TrackOverlay vendorKey={bookedVendor} onClose={() => setModal(null)} onCall={() => setModal('call')} />}
          {modal === 'call'    && <CallSheet vendorKey={bookedVendor} onClose={() => setModal(null)} />}
          {modal === 'receipt' && <ReceiptOverlay onClose={() => setModal(null)} />}
          {modal === 'time'    && <TimeSheet onClose={() => setModal(null)} onConfirm={(label) => ctx.onAction('time-picked:' + label)} />}
          {modal === 'review'  && <ReviewSheet onClose={() => setModal(null)} onSubmit={() => {
            setModal(null);
            setMessages(prev => [...prev, { type: 'bot', id: 'rev-' + Date.now(), text: 'Review posted — thank you. See you next time.' }]);
          }} />}
          {modal && modal.startsWith('vendor:') && (
            <VendorDetailOverlay
              vendorKey={modal.split(':')[1]}
              onClose={() => setModal(null)}
              onBook={(k) => ctx.onAction('book-vendor:' + k)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Merchant console (ToB, desktop) — the pro's side of the same order ──
function MerchantConsole() {
  const [capOn, setCapOn] = React.useState(true);
  const [declared, setDeclared] = React.useState([true, true, true]);
  const [sent, setSent] = React.useState(false);
  const CAP = 66;
  const label = { fontSize: 11, fontWeight: 700, color: MT.muted, fontFamily: FF.text, textTransform: 'uppercase', letterSpacing: '.7px' };
  const toggleDecl = (i) => setDeclared(d => d.map((x, j) => (j === i ? !x : x)));
  const pencil = <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9.4 2.6l2 2L5 11l-2.6.6L3 9 9.4 2.6z" stroke={MT.mutedSoft} strokeWidth="1.2" strokeLinejoin="round"/></svg>;
  const orderRows = [
    { k: 'Issue', v: 'TOTO toilet · sewer odor' },
    { k: 'Photos', v: <PhotoStrip /> },
    { k: 'Plan', v: 'Replace flange wax ring' },
    { k: 'Note', v: '2-story home · water shut-off under the sink' },
    { k: 'When', v: 'Today · 820 W Ridge Ln · 1.2 mi away' },
  ];
  // No visit fee, no diagnostic charge — the quote is the work itself.
  const lineItems = [
    { k: 'Wax ring + labor', v: '$45 – $60', sub: 'Parts and on-site work, all-in' },
  ];

  return (
    <div style={{ width: 1060, borderRadius: 18, overflow: 'hidden', background: MT.surface, border: `1px solid ${MT.hairline}`, boxShadow: MT.shadowLg, fontFamily: FF.text, color: MT.ink }}>
      {/* Window title bar */}
      <div style={{ height: 38, background: MT.surfaceAlt, borderBottom: `1px solid ${MT.divider}`, display: 'flex', alignItems: 'center', padding: '0 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 7 }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <span key={c} style={{ width: 11, height: 11, borderRadius: 6, background: c }}/>)}
        </div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: MT.muted, fontFamily: FF.text }}>Meituan Partner — Quote Desk</div>
        <div style={{ width: 54 }}/>
      </div>

      {/* App top bar */}
      <div style={{ height: 60, borderBottom: `1px solid ${MT.divider}`, display: 'flex', alignItems: 'center', padding: '0 22px', gap: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: MT.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10.8 5a2.4 2.4 0 0 0-3.1 3.1L3 12.8 4.2 14l4.7-4.7A2.4 2.4 0 0 0 12 6.2l-1.4 1.4-1.3-.2-.2-1.3L10.8 5z" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, fontFamily: FF.display, letterSpacing: '-0.3px' }}>Meituan Partner</span>
        </div>
        <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
          {[['Orders', false], ['Live quotes', true], ['Earnings', false]].map(([t, on]) => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', fontSize: 13.5, fontWeight: on ? 700 : 500, color: on ? MT.ink : MT.muted, fontFamily: FF.text, padding: '7px 12px', borderRadius: 8, background: on ? MT.surfaceAlt : 'transparent' }}>
              {t}{on && <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: '#fff', background: MT.negative, borderRadius: 100, padding: '1px 6px' }}>1</span>}
            </span>
          ))}
        </div>
        <div style={{ flex: 1 }}/>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: MT.inkLight, fontFamily: FF.text }}>
          <span style={{ width: 7, height: 7, borderRadius: 4, background: MT.green }}/> Online
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginLeft: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: 17, overflow: 'hidden', background: '#E8E8E8' }}><VendorImage kind="bath" /></div>
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: FF.text }}>Citrus Home Services</div>
            <div className="tnum" style={{ fontSize: 11.5, color: MT.muted, fontFamily: FF.text }}>★ 4.9 · 2.1k jobs</div>
          </div>
        </div>
      </div>

      {/* Workspace — two panes */}
      <div style={{ display: 'flex', height: 656 }}>
        {/* Left — incoming request from the diagnosis */}
        <div style={{ width: 392, borderRight: `1px solid ${MT.divider}`, background: MT.surfaceAlt, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '18px 22px 14px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 100, background: MT.brandTint, border: `1px solid ${MT.hairline}` }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: MT.green }}/>
              <span style={{ fontSize: 12.5, fontWeight: 700, fontFamily: FF.text }}>New request</span>
              <span className="tnum" style={{ fontSize: 12, color: MT.muted, fontFamily: FF.text }}>· 0:12 ago</span>
            </div>
            <div style={{ marginTop: 18, fontSize: 18, fontWeight: 800, fontFamily: FF.display, letterSpacing: '-0.3px' }}>Repair request</div>
            <div style={{ fontSize: 12.5, color: MT.muted, fontFamily: FF.text, marginTop: 3, lineHeight: '17px' }}>Structured by Meituan's diagnosis — you quote blind against the same order.</div>
          </div>
          <div className="scroll" style={{ padding: '0 22px 18px', overflow: 'auto' }}>
            {orderRows.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, padding: '13px 0', borderTop: `1px solid ${MT.divider}`, alignItems: 'flex-start' }}>
                <div style={{ width: 52, ...label, paddingTop: 2 }}>{r.k}</div>
                <div style={{ flex: 1, fontSize: 14, color: MT.ink, fontFamily: FF.text, lineHeight: '20px' }}>{r.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — quote builder */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div className="scroll" style={{ flex: 1, overflow: 'auto', padding: '20px 24px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: FF.display, letterSpacing: '-0.4px' }}>Your quote</div>
                <div style={{ fontSize: 13, color: MT.muted, fontFamily: FF.text, marginTop: 2 }}>The customer compares this against the other pros.</div>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: MT.inkLight, fontFamily: FF.text, padding: '7px 12px', borderRadius: 100, background: MT.surfaceAlt, border: `1px solid ${MT.hairline}`, flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke={MT.inkLight} strokeWidth="1.4"/><path d="M8 4.5V8l2.4 1.4" stroke={MT.inkLight} strokeWidth="1.4" strokeLinecap="round"/></svg>
                Respond within <span className="tnum">20:00</span>
              </span>
            </div>

            {/* Line items */}
            <div style={{ marginTop: 16, border: `1px solid ${MT.divider}`, borderRadius: 14, overflow: 'hidden' }}>
              {lineItems.map((r, i, a) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: i < a.length - 1 ? `1px solid ${MT.divider}` : 'none' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, fontFamily: FF.text }}>{r.k}</div>
                    {r.sub && <div style={{ fontSize: 12, color: MT.muted, fontFamily: FF.text, marginTop: 1 }}>{r.sub}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="tnum" style={{ fontSize: 14, fontWeight: 700, fontFamily: FF.text }}>{r.v}</span>
                    <button className="btn-press" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 7, border: `1px solid ${MT.hairline}`, background: MT.surface, cursor: 'pointer' }}>{pencil}</button>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: MT.ink }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.7)', fontFamily: FF.text, textTransform: 'uppercase', letterSpacing: '.6px' }}>Quote to customer</span>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <span style={{ color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: FF.display }}>$</span>
                  <span className="tnum" style={{ color: '#fff', fontSize: 22, fontWeight: 800, fontFamily: FF.display, letterSpacing: '-0.4px' }}>45–60</span>
                </span>
              </div>
            </div>

            {/* Cap + declare, side by side */}
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ borderRadius: 14, border: `1px solid ${capOn ? '#C3E3D2' : MT.divider}`, background: capOn ? MT.greenBg : MT.surface, padding: '15px 16px', transition: 'all .2s' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <svg width="15" height="16" viewBox="0 0 14 15" fill="none"><path d="M7 1L12 2.8v3.9C12 10 9.9 12.3 7 13.4 4.1 12.3 2 10 2 6.7V2.8L7 1z" stroke={capOn ? MT.greenDeep : MT.muted} strokeWidth="1.2"/></svg>
                    <span style={{ fontSize: 14.5, fontWeight: 800, fontFamily: FF.display, letterSpacing: '-0.2px' }}>Price cap</span>
                  </div>
                  <button onClick={() => setCapOn(x => !x)} className="btn-press" style={{ width: 46, height: 28, borderRadius: 100, border: 0, background: capOn ? MT.green : MT.surfaceDeep, position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background .2s' }}>
                    <span style={{ position: 'absolute', top: 3, left: capOn ? 21 : 3, width: 22, height: 22, borderRadius: 11, background: '#fff', boxShadow: MT.shadowSm, transition: 'left .2s cubic-bezier(.2,.8,.2,1)' }}/>
                  </button>
                </div>
                <div style={{ marginTop: 9, fontSize: 13, color: MT.inkLight, fontFamily: FF.text, lineHeight: '19px' }}>
                  You cover anything past <span className="tnum" style={{ fontWeight: 700, color: capOn ? MT.greenDeep : MT.ink }}>${CAP}</span> within this diagnosis. Capped quotes rank higher and win ~2× more.
                </div>
              </div>
              <div style={{ borderRadius: 14, border: `1px solid ${MT.divider}`, padding: '15px 16px' }}>
                <div style={{ fontSize: 14.5, fontWeight: 800, fontFamily: FF.display, letterSpacing: '-0.2px' }}>What could change it</div>
                <div style={{ fontSize: 12, color: MT.muted, fontFamily: FF.text, marginTop: 2, marginBottom: 7 }}>Shown to the customer up front.</div>
                {PRICE_CHANGES.map((t, i) => {
                  const on = declared[i];
                  return (
                    <button key={i} onClick={() => toggleDecl(i)} className="btn-press" style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '7px 0', width: '100%', background: 'transparent', border: 0, textAlign: 'left', cursor: 'pointer' }}>
                      <span style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1, border: `1.5px solid ${on ? MT.ink : MT.mutedSoft}`, background: on ? MT.ink : MT.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}>
                        {on && <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2.5 6.2l2.2 2.2L9.5 3.4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </span>
                      <span style={{ fontSize: 12.5, color: MT.inkSoft, fontFamily: FF.text, lineHeight: '17px' }}>{t}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div style={{ borderTop: `1px solid ${MT.divider}`, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            {sent ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, flex: 1, animation: 'soft-in .26s ease-out both' }}>
                <span style={{ width: 32, height: 32, borderRadius: 16, background: MT.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 12 12"><path d="M3 6.4l2 2 4.2-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 800, fontFamily: FF.display }}>Quote sent to the customer</div>
                  <div style={{ fontSize: 12.5, color: MT.muted, fontFamily: FF.text, marginTop: 1 }}>You'll be notified if they pick you · valid 20 min</div>
                </div>
                <button onClick={() => setSent(false)} className="btn-press" style={{ height: 38, padding: '0 16px', borderRadius: 10, border: `1px solid ${MT.hairline}`, background: MT.surface, color: MT.inkSoft, fontSize: 13, fontWeight: 700, fontFamily: FF.text, cursor: 'pointer' }}>Edit quote</button>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, fontSize: 12.5, color: MT.muted, fontFamily: FF.text, lineHeight: '17px' }}>
                  {capOn ? <>Sends with a <b style={{ color: MT.greenDeep }}>Capped ${CAP}</b> badge — overage on you, beyond the declared triggers.</> : 'No cap — your quote shows as a range only.'}
                </div>
                <button onClick={() => setSent(true)} className="btn-press" style={{ height: 46, padding: '0 26px', border: 0, borderRadius: 12, background: MT.brand, color: MT.brandInk, fontWeight: 800, fontSize: 15, fontFamily: FF.display, letterSpacing: '-0.1px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  Send quote{capOn && <span style={{ fontSize: 12.5, fontWeight: 700, opacity: .82 }}>· capped ${CAP}</span>}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── macOS desktop frame for the pro (ToB) view ─────────────────────
function MacDesktop({ children }) {
  const menu = ['File', 'Edit', 'View', 'Window', 'Help'];
  return (
    <div style={{
      width: 1140, borderRadius: 14, overflow: 'hidden',
      background: 'linear-gradient(155deg, #d7e2ef 0%, #e7ecf3 48%, #efe7ef 100%)',
      boxShadow: MT.shadowLg, border: '1px solid rgba(0,0,0,.07)',
    }}>
      {/* macOS menu bar */}
      <div style={{ height: 28, background: 'rgba(255,255,255,.66)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 20 }}>
        <svg width="13" height="15" viewBox="0 0 14 16" fill={MT.ink}><path d="M11.2 8.5c0-1.7 1.4-2.5 1.5-2.6-.8-1.2-2.1-1.3-2.5-1.4-1.1-.1-2.1.6-2.6.6-.5 0-1.4-.6-2.3-.6-1.2 0-2.3.7-2.9 1.8-1.2 2.1-.3 5.3.9 7 .6.8 1.3 1.8 2.2 1.7.9 0 1.2-.6 2.3-.6 1.1 0 1.3.6 2.3.6.9 0 1.5-.8 2.1-1.7.7-1 .9-1.9.9-2-.1 0-1.8-.7-1.9-2.8zM9.5 3.3c.5-.6.8-1.4.7-2.3-.7 0-1.5.5-2 1.1-.4.5-.8 1.3-.7 2.1.8.1 1.5-.4 2-.9z"/></svg>
        <span style={{ fontSize: 13, fontWeight: 700, color: MT.ink, fontFamily: FF.text }}>Meituan Partner</span>
        {menu.map(m => <span key={m} style={{ fontSize: 13, color: MT.inkLight, fontFamily: FF.text }}>{m}</span>)}
        <div style={{ flex: 1 }} />
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M8 3.2c2 0 3.8.8 5.1 2.1l.9-.9A8 8 0 0 0 8 1.8 8 8 0 0 0 2 4.4l.9.9A7 7 0 0 1 8 3.2z" fill={MT.ink}/><path d="M8 6.4c1.1 0 2.1.4 2.9 1.2l.9-.9A5.5 5.5 0 0 0 8 5a5.5 5.5 0 0 0-3.8 1.7l.9.9A4 4 0 0 1 8 6.4z" fill={MT.ink}/><circle cx="8" cy="9.6" r="1.3" fill={MT.ink}/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke={MT.ink} strokeOpacity="0.45" fill="none"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill={MT.ink}/><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill={MT.ink} fillOpacity="0.45"/></svg>
        <span className="tnum" style={{ fontSize: 12.5, fontWeight: 600, color: MT.ink, fontFamily: FF.text }}>Tue 5:44 PM</span>
      </div>
      <div style={{ padding: '32px 40px 42px', display: 'flex', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────
const SCENARIOS = [
  { id: 'default',         label: 'Standard repair · book a pro' },
  { id: 'ai-agent',        label: 'AI agent · instant' },
  { id: 'cat-litter',      label: 'Self-serve fix' },
  { id: 'off-hours',       label: 'After hours' },
  { id: 'expired-modal',   label: 'Quote expired · before action' },
  { id: 'expired-chat',    label: 'Quote expired · after action' },
  { id: 'return-visit',    label: 'Post-service follow-up' },
  { id: 'merchant',        label: 'Pro view · quote desk' },
];

function __flowParams() {
  try {
    var h = (window.location.hash || '').replace(/^#/, '');
    var s = (window.location.search || '').replace(/^\?/, '');
    return new URLSearchParams([h, s].filter(Boolean).join('&'));
  } catch (e) { return new URLSearchParams(''); }
}
function __initialScenario() {
  var f = __flowParams().get('flow') || __flowParams().get('scenario');
  return (f && (SCRIPTS[f] || f === 'merchant')) ? f : 'default';
}
function __railHidden() {
  var p = __flowParams();
  return p.get('rail') === '0' || p.has('solo');
}
function __seekRequested() {
  var p = __flowParams();
  return p.has('seek') && p.get('seek') !== '0';
}
// seek=1 → fast-forward to the scenario's key state (SEEK map);
// seek=<n> (n>1) → fast-forward to that explicit step index instead.
function __seekStep() {
  var p = __flowParams();
  if (!p.has('seek') || p.get('seek') === '0') return null;
  var n = parseInt(p.get('seek'), 10);
  return (isFinite(n) && n > 1) ? n : true;
}

// Fit-to-viewport: the phone (or console) plus the scenario rail always fit the
// window in one screen — no scrolling to see the full device on any display.
function useViewportScale(natW, natH, pad = 12) {
  const [s, setS] = React.useState(1);
  React.useEffect(() => {
    const f = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      setS(Math.min(1, (vw - pad * 2) / natW, (vh - pad * 2) / natH));
    };
    f();
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, [natW, natH, pad]);
  return s;
}

function App() {
  const [scenario, setScenario] = React.useState(__initialScenario);
  const hideRail = __railHidden();
  const [nonce, setNonce] = React.useState(0);
  const replay = () => setNonce(n => n + 1);
  const onSceneEnd = (next) => { if (next) setScenario(next); };

  const isMerchant = scenario === 'merchant';
  // Width includes room for the scenario rail (wraps to ~2 rows at 760);
  // height = device + gap + rail so the whole thing always fits one screen.
  const natW = isMerchant ? 1064 : (hideRail ? 432 : 760);
  const natH = (isMerchant ? 758 : 924) + (hideRail ? 0 : 146);
  const s = useViewportScale(natW, natH);

  return (
    <div style={{ width: natW * s, height: natH * s, margin: '0 auto' }}>
      <div style={{
        width: natW, transform: `scale(${s})`, transformOrigin: 'top left',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
      }}>
      {scenario === 'merchant'
        ? <MerchantConsole key={'merchant-' + nonce} />
        : <Player key={scenario + '-' + nonce} scenario={scenario} onSceneEnd={onSceneEnd} />}
      {!hideRail && (
      <div style={{
        display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center',
        padding: 6, borderRadius: 100,
        background: MT.surface,
        border: `1px solid ${MT.hairline}`,
        maxWidth: 720,
      }}>
        {SCENARIOS.map(s => (
          <button key={s.id}
            onClick={() => { setScenario(s.id); setNonce(n => n + 1); }}
            className="btn-press"
            style={{
              height: 34, padding: '0 16px', borderRadius: 100, border: 0,
              background: scenario === s.id ? MT.brand : 'transparent',
              color: scenario === s.id ? MT.brandInk : MT.inkLight,
              fontFamily: FF.text,
              fontSize: 13, fontWeight: scenario === s.id ? 700 : 500,
              cursor: 'pointer',
              transition: 'background .25s, color .25s',
            }}>{s.label}</button>
        ))}
        <div style={{ width: 1, background: MT.hairline, margin: '4px 4px' }} />
        <button onClick={replay} className="btn-press" style={{ height: 34, padding: '0 16px', borderRadius: 100, border: 0, background: 'transparent', color: MT.muted, fontFamily: FF.text, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 6a4 4 0 1 1-1.2-2.8M10 2v2.5H7.5" stroke={MT.muted} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Replay
        </button>
      </div>
      )}
      </div>
    </div>
  );
}

module.exports = { App };
