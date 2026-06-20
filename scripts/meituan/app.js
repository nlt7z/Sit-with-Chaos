// Home Repair flow — restyled to the Uber Base (light) design system.
// Black primary, mono neutral ramp, Base positive/accent/negative semantics,
// Manrope (Uber Move–like) type, restrained Base motion. All interactions
// and animations preserved from the original prototype.

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
function StatusBar() {
  return (
    <div style={{
      height: 54, padding: '16px 16px 0', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: FF.num, fontWeight: 600, fontSize: 15, color: MT.ink, lineHeight: 1,
    }}>
      <span className="tnum">9:41</span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="6.5" width="3" height="4.5" rx="0.7" fill={MT.ink}/><rect x="4.5" y="4.2" width="3" height="6.8" rx="0.7" fill={MT.ink}/><rect x="9" y="2" width="3" height="9" rx="0.7" fill={MT.ink}/><rect x="13.5" y="0" width="3" height="11" rx="0.7" fill={MT.ink}/></svg>
        <svg width="16" height="11" viewBox="0 0 16 11"><path d="M8 3.4C10.1 3.4 12 4.2 13.4 5.6L14.4 4.6C12.7 2.9 10.4 1.9 8 1.9C5.6 1.9 3.3 2.9 1.6 4.6L2.6 5.6C4 4.2 5.9 3.4 8 3.4Z" fill={MT.ink}/><path d="M8 6.7C9.2 6.7 10.3 7.1 11.2 8L12.2 7C10.9 5.9 9.5 5.2 8 5.2C6.5 5.2 5.1 5.9 3.8 7L4.8 8C5.7 7.1 6.8 6.7 8 6.7Z" fill={MT.ink}/><circle cx="8" cy="9.6" r="1.4" fill={MT.ink}/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke={MT.ink} strokeOpacity="0.4" fill="none"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill={MT.ink}/><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill={MT.ink} fillOpacity="0.4"/></svg>
      </div>
    </div>
  );
}

function HomeIndicator() {
  return (
    <div style={{ height: 28, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: 8, flexShrink: 0 }}>
      <div style={{ width: 134, height: 5, borderRadius: 100, background: MT.ink }} />
    </div>
  );
}

function Header({ active = 1, proJoined = false, onBack }) {
  const steps = ['Describe', 'Diagnose', 'Plan', 'Match'];
  const progressPct = ((active - 1) / (steps.length - 1)) * 100;
  return (
    <div style={{ background: MT.surface, borderBottom: `1px solid ${MT.divider}`, flexShrink: 0 }}>
      <div style={{ height: 48, display: 'flex', alignItems: 'center', padding: '0 14px', justifyContent: 'space-between' }}>
        <button onClick={onBack} className="btn-press" style={{ width: 44, height: 44, border: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <svg width="10" height="18" viewBox="0 0 11 20"><path d="M9 1L1 10l8 9" stroke={MT.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        </button>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span key={proJoined ? 'mike' : 'cs'} style={{
              fontFamily: FF.display, fontSize: 16, fontWeight: 700,
              color: MT.ink, letterSpacing: '-0.2px',
              animation: 'soft-in .32s ease-out both',
            }}>
              {proJoined ? 'Mike Chen' : 'Repair Expert'}
            </span>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: MT.green }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: MT.muted, fontFamily: FF.text }}>
            {proJoined ? <span>Plumbing · 8 yrs</span> : <span>Instant diagnosis · official service</span>}
          </div>
        </div>
        <button className="btn-press" style={{ width: 44, height: 44, border: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <svg width="18" height="5" viewBox="0 0 20 5"><circle cx="2.5" cy="2.5" r="1.6" fill={MT.ink}/><circle cx="10" cy="2.5" r="1.6" fill={MT.ink}/><circle cx="17.5" cy="2.5" r="1.6" fill={MT.ink}/></svg>
        </button>
      </div>
      {/* Step rail */}
      <div style={{ padding: '8px 16px 16px' }}>
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
                  width: isActive ? 12 : 8, height: isActive ? 12 : 8, borderRadius: '50%',
                  background: isActive ? MT.surface : (isPast ? MT.brand : MT.surfaceDeep),
                  border: isActive ? `2.5px solid ${MT.brand}` : 'none',
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
  return (
    <div style={{ background: MT.surface, padding: '10px 12px', flexShrink: 0 }}>
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

function BotBubble({ children, tight }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: `${tight ? 1 : 7}px 16px`, alignItems: 'flex-start', ...ENTER }}>
      <BotAvatar />
      <div style={{
        background: MT.botBubble, borderRadius: '4px 14px 14px 14px',
        padding: '12px 16px', maxWidth: 286, fontSize: 15, lineHeight: '23px',
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
          padding: '12px 16px', maxWidth: 286, fontSize: 15, lineHeight: '23px',
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
  const rows = [
    { t: 'Official experts', s: 'Here to help — never to upsell.',
      i: <><path d="M12 3l7 2.4v5.3c0 4.4-3 7.5-7 8.9-4-1.4-7-4.5-7-8.9V5.4L12 3z" stroke={MT.green} strokeWidth="1.6" fill="none" strokeLinejoin="round"/><path d="M8.6 11.7l2.4 2.4 4.4-5" stroke={MT.green} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></> },
    { t: 'Free diagnosis', s: 'Real cause, found in seconds.',
      i: <><circle cx="12" cy="12" r="8.4" stroke={MT.ink} strokeWidth="1.6" fill="none"/><path d="M12 7.2V12l3.2 1.9" stroke={MT.ink} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></> },
    { t: 'Open quotes', s: 'Guide price, then competing bids.',
      i: <><path d="M4 12.3l8-8.3H19a1.6 1.6 0 0 1 1.6 1.6v7l-8 8.3a1.6 1.6 0 0 1-2.3 0l-6.3-6.3a1.6 1.6 0 0 1 0-2.3z" stroke={MT.ink} strokeWidth="1.6" fill="none" strokeLinejoin="round"/><circle cx="15.7" cy="8.3" r="1.35" stroke={MT.ink} strokeWidth="1.4" fill="none"/></> },
  ];
  return (
    <div style={{
      margin: '14px 16px 2px', borderRadius: 16, overflow: 'hidden',
      background: MT.surface, border: `1px solid ${MT.divider}`, boxShadow: MT.shadowSm,
      flexShrink: 0, display: 'flex', minHeight: 196, animation: 'msg-in .3s cubic-bezier(.2,.8,.2,1) both',
    }}>
      {/* Left — value points */}
      <div style={{ flex: 1, minWidth: 0, padding: '15px 4px 15px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ marginBottom: 10 }}><Tag tone="green">Meituan · Official diagnosis</Tag></div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '7px 0' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>{r.i}</svg>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: MT.ink, fontFamily: FF.text, lineHeight: '17px' }}>{r.t}</div>
              <div style={{ fontSize: 12.5, color: MT.muted, fontFamily: FF.text, marginTop: 1, lineHeight: '16px' }}>{r.s}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Right — large expert portrait filling the full right side */}
      <div style={{ width: 166, flexShrink: 0, position: 'relative', background: '#E8E8E8' }}>
        <img src={__R('introWorkerImg', 'assets/intro-worker.png')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '15% 8%', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(255,255,255,.97) 0%, rgba(255,255,255,.7) 20%, rgba(255,255,255,.28) 42%, rgba(255,255,255,0) 70%)' }}/>
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

function RepairOrderCard({ pending, onGetQuotes }) {
  const chev = <svg width="7" height="12" viewBox="0 0 6 10"><path d="M1 1l4 4-4 4" stroke={MT.muted} strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>;
  return (
    <div style={{ padding: '6px 14px', ...ENTER }}>
      <div style={{ marginBottom: 4, marginLeft: 44, fontSize: 12, color: MT.ink, fontWeight: 700, fontFamily: FF.text }}>
        Mike Chen <span style={{ color: MT.muted, fontWeight: 400, marginLeft: 6 }}>drafted your repair order</span>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <ProAvatar />
        <div style={{
          background: MT.surface, borderRadius: '4px 16px 16px 16px',
          flex: 1, border: `1px solid ${MT.divider}`, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 14px',
            background: MT.brandTint,
            borderBottom: `1px solid ${MT.divider}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, background: MT.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 6.5l2 2 4-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontFamily: FF.display, fontSize: 15, fontWeight: 700, color: MT.ink }}>Repair order</span>
            </div>
            <span className="tnum" style={{ fontSize: 12, color: MT.muted, fontFamily: FF.text, letterSpacing: '.6px' }}>DRAFT · #4729</span>
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
                <span style={{ fontSize: 12, color: MT.muted, fontFamily: FF.text }}>· merchants quote next</span>
              </div>
            </>}/>
            <OrderRow delay={230} k="When"   v={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {pending ? <span style={{ color: MT.negative, fontWeight: 700 }}>Pick a time</span> : 'Right now'}{chev}
            </span>}/>
            <OrderRow delay={290} last k="Where" v={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>820 W Ridge Ln, Apt 4B{chev}</span>}/>
            <div style={{ marginTop: 16 }}>
              <PrimaryBtn full disabled={pending} onClick={onGetQuotes}>{pending ? 'Set a time to continue' : 'Request quotes'}</PrimaryBtn>
            </div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 12, color: MT.muted, fontFamily: FF.text }}>
              <svg width="10" height="12" viewBox="0 0 9 11"><rect x="1" y="4.5" width="7" height="6" rx="1" fill="none" stroke={MT.muted} strokeWidth="1"/><path d="M2.5 4.5V3a2 2 0 0 1 4 0v1.5" fill="none" stroke={MT.muted} strokeWidth="1" strokeLinecap="round"/></svg>
              <span>Hold until you confirm a vendor · no charge yet</span>
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

function VendorCard({ v, last, button = 'View', onView, topNote }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', gap: 14, padding: '16px 0',
        borderBottom: last ? 'none' : `1px solid ${MT.divider}`,
        cursor: 'pointer',
        background: hover ? MT.surfaceAlt : 'transparent',
        margin: '0 -2px', paddingLeft: 2, paddingRight: 2,
        borderRadius: hover ? 10 : 0,
        transition: 'background .18s',
      }} onClick={onView}>
      <div style={{ width: 84, height: 84, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}><VendorImage kind={v.image} /></div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {topNote && <div style={{ marginBottom: 5 }}><Tag tone={topNote.tone}>{topNote.label}</Tag></div>}
        <div style={{ fontSize: 15, fontWeight: 700, color: MT.ink, fontFamily: FF.display, lineHeight: '20px', letterSpacing: '-0.2px' }}>{v.name}</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 5, fontSize: 12, color: MT.muted, fontFamily: FF.text, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 8.5 3 10.5 3.5 7 1 4.5 4.5 4z" fill={MT.ink}/></svg>
            <span className="tnum" style={{ color: MT.ink, fontWeight: 700 }}>{v.rating}</span>
          </span>
          <span>· {v.reviews}</span>
          <span className="tnum">· {v.distance} mi</span>
          <span className="tnum">· ~{v.eta} min</span>
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 7 }}>
          {v.tags.map((t, i) => <Tag key={i} tone={t.tone}>{t.text}</Tag>)}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 9, gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <span style={{ color: MT.ink, fontSize: 12, fontWeight: 700, fontFamily: FF.display }}>$</span>
              <span className="tnum" style={{ color: MT.ink, fontSize: 17, fontWeight: 800, fontFamily: FF.display, letterSpacing: '-0.3px' }}>{v.priceLo}</span>
              <span style={{ color: MT.muted, fontSize: 13, fontWeight: 700, fontFamily: FF.display, margin: '0 1px' }}>–</span>
              <span className="tnum" style={{ color: MT.ink, fontSize: 17, fontWeight: 800, fontFamily: FF.display, letterSpacing: '-0.3px' }}>{v.priceHi}</span>
            </div>
            <div style={{ marginTop: 5 }}><CapPill cap={v.cap} /></div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onView && onView(); }}
            className="btn-press"
            style={{
              height: 36, padding: '0 16px', borderRadius: 100, border: 0,
              background: MT.brand,
              color: MT.brandInk,
              fontSize: 13, fontWeight: 700, fontFamily: FF.text, cursor: 'pointer', flexShrink: 0,
            }}>{button}</button>
        </div>
      </div>
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

// ─── Quotes — collecting status + comparison, in one card ───────────
function MerchantQuotesCard({ stale, onView }) {
  // phase 0 = collecting (pros respond live), phase 1 = comparison.
  const [phase, setPhase] = React.useState(stale ? 1 : 0);
  const [stages, setStages] = React.useState(stale ? [2, 2, 2] : [1, 0, 0]); // 0 notified, 1 viewing, 2 quoted
  React.useEffect(() => {
    if (stale) return;
    const T = [];
    T.push(setTimeout(() => setStages(s => [2, s[1], s[2]]), 550));
    T.push(setTimeout(() => setStages(s => [s[0], 1, s[2]]), 450));
    T.push(setTimeout(() => setStages(s => [s[0], s[1], 1]), 950));
    T.push(setTimeout(() => setStages(s => [s[0], 2, s[2]]), 1450));
    T.push(setTimeout(() => setStages([2, 2, 2]), 2050));
    T.push(setTimeout(() => setPhase(1), 2250));
    return () => T.forEach(clearTimeout);
  }, [stale]);

  const [secondsLeft, setSecondsLeft] = React.useState(298);
  React.useEffect(() => {
    if (stale) return;
    const id = setInterval(() => setSecondsLeft(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [stale]);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const windowExpired = !stale && secondsLeft === 0;
  const quoted = stages.filter(s => s === 2).length;
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
                         'Ranked by rating × distance × capped price';
  const topNoteFor = (i) => {
    if (i !== 0) return null;
    if (sort === 'price')   return { label: 'Lowest quote', tone: 'green' };
    if (sort === 'rating')  return { label: 'Top rated', tone: 'brand' };
    if (sort === 'fastest') return { label: 'Soonest arrival', tone: 'brand' };
    return { label: 'Recommended', tone: 'brand' };
  };
  const statusPill = (st) =>
    st === 2 ? { c: MT.greenDeep, bg: MT.greenBg, b: '#C3E3D2', label: 'Quoted', icon: true } :
    st === 1 ? { c: MT.ink, bg: MT.surfaceAlt, b: MT.hairline, label: 'Viewing', pulse: true } :
               { c: MT.muted, bg: MT.surfaceAlt, b: MT.hairline, label: 'Notified' };

  return (
    <div style={{ ...ENTER }}>
      <div style={{ margin: '12px 16px', background: MT.surface, borderRadius: 16, padding: '0 16px 14px', border: `1px solid ${MT.divider}`, overflow: 'hidden' }}>
        {/* Header — collecting / settled / expired, all in one place */}
        <div style={{ margin: '0 -16px', padding: '15px 16px 13px', background: stale ? MT.surface : (collecting ? MT.brandTint : MT.greenBg), borderBottom: `1px solid ${MT.divider}`, transition: 'background .3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {stale
              ? <div style={{ width: 8, height: 8, borderRadius: 4, background: MT.negative }}/>
              : collecting
                ? <svg width="20" height="20" viewBox="0 0 20 20" style={{ animation: 'spin .9s linear infinite', flexShrink: 0 }}><circle cx="10" cy="10" r="7.5" fill="none" stroke="rgba(0,0,0,.12)" strokeWidth="2"/><circle cx="10" cy="10" r="7.5" fill="none" stroke={MT.brand} strokeWidth="2" strokeLinecap="round" strokeDasharray="16 31"/></svg>
                : <span style={{ width: 22, height: 22, borderRadius: 11, background: MT.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 6.4l2 2 4.2-5" stroke="#fff" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></span>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: MT.ink, fontFamily: FF.text }}>
                {stale ? 'Quote window expired — re-poll to refresh' : collecting ? 'Collecting quotes from 3 certified pros' : '3 pros quoted · every price capped'}
              </div>
              {!stale && <div style={{ fontSize: 12, color: MT.inkLight, marginTop: 2, fontFamily: FF.text }}>{collecting ? 'Same diagnosis · they quote without seeing each other' : 'Compare and pick who you trust.'}</div>}
            </div>
            {!stale && !collecting && (
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: MT.muted, fontWeight: 700, fontFamily: FF.text, textTransform: 'uppercase', letterSpacing: '.6px' }}>Quote valid</div>
                <div className="tnum" style={{ fontSize: 13, fontFamily: FF.num, fontWeight: 700, color: windowExpired ? MT.muted : MT.inkSoft }}>{windowExpired ? 'Expired' : `${mm}:${ss}`}</div>
              </div>
            )}
            {collecting && <span className="tnum" style={{ fontSize: 13, fontWeight: 700, color: MT.ink, fontFamily: FF.text, flexShrink: 0 }}>{quoted}/3</span>}
          </div>
        </div>

        {/* Collecting — live pro status rows */}
        {collecting && (
          <div style={{ animation: 'soft-in .2s ease-out both' }}>
            {QUOTE_VENDORS.map((p, i) => {
              const st = statusPill(stages[i]);
              return (
                <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 0', borderBottom: `1px solid ${MT.divider}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}><VendorImage kind={p.image}/></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: MT.ink, fontFamily: FF.text, lineHeight: '17px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div className="tnum" style={{ fontSize: 12, color: MT.muted, fontFamily: FF.text, marginTop: 1 }}>★ {p.rating} · {p.distance} mi · ~{p.eta} min</div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, fontFamily: FF.text, color: st.c, background: st.bg, border: `1px solid ${st.b}`, borderRadius: 100, padding: '4px 10px', flexShrink: 0, transition: 'all .25s' }}>
                    {st.icon
                      ? <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2.5 6.2l2.2 2.2L9.5 3.4" stroke={st.c} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : <span style={{ width: 6, height: 6, borderRadius: 3, background: st.c, opacity: st.pulse ? 1 : .55, animation: st.pulse ? 'dot-pulse 1.2s infinite ease-in-out' : 'none' }}/>}
                    {st.label}
                  </span>
                </div>
              );
            })}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 0 2px', fontSize: 12, color: MT.muted, fontFamily: FF.text }}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke={MT.muted} strokeWidth="1.2"/><path d="M7 4.2v3.2M7 9.6h.01" stroke={MT.muted} strokeWidth="1.3" strokeLinecap="round"/></svg>
              <span>No quote in 3 min? We widen the search automatically.</span>
            </div>
          </div>
        )}

        {/* Comparison — sort control + sorted vendor cards */}
        {!collecting && (
          <>
            {!stale && (
              <div style={{ margin: '0 -16px', padding: '12px 16px 2px', background: MT.surface, borderBottom: `1px solid ${MT.divider}` }}>
                <div className="scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
                  {SORTS.map(s => {
                    const on = sort === s.key;
                    return (
                      <button key={s.key} onClick={() => setSort(s.key)} className="btn-press" style={{ height: 30, padding: '0 13px', borderRadius: 100, flexShrink: 0, border: `1px solid ${on ? MT.ink : MT.hairline}`, background: on ? MT.ink : MT.surface, color: on ? MT.brandInk : MT.inkSoft, fontSize: 12, fontWeight: 700, fontFamily: FF.text, cursor: 'pointer', transition: 'all .18s' }}>{s.label}</button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 1px 8px', fontSize: 12, color: MT.muted, fontFamily: FF.text }}>
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M4 7h6M6 10h2" stroke={MT.muted} strokeWidth="1.3" strokeLinecap="round"/></svg>
                  <span>{explain}</span>
                </div>
              </div>
            )}
            {sorted.map((v, i) => (
              <div key={sort + '-' + v.key} style={stale ? undefined : { animation: 'soft-in .24s ease-out both', animationDelay: `${i * 60}ms` }}>
                <VendorCard v={v} last={i === sorted.length - 1} topNote={stale ? null : topNoteFor(i)} button={stale ? 'Grab it' : 'View'} onView={() => onView && onView(v.key)} />
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
          flex: 1, background: MT.surface, borderRadius: '4px 16px 16px 16px',
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
        <div style={{ background: MT.surface, borderRadius: '4px 16px 16px 16px', flex: 1, border: `1px solid ${MT.divider}`, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: 100, position: 'relative', background: MT.surfaceAlt, overflow: 'hidden' }}>
            <img src={__R('toiletImg', 'assets/toilet.webp')} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: 8, left: 8, display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 800, color: '#fff', fontFamily: FF.text, background: MT.ink, padding: '2px 6px', borderRadius: 100, letterSpacing: '.4px', zIndex: 1 }}>
              <span>★</span>
              <span>FIRST-PARTY</span>
            </div>
          </div>
          <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: '19px', color: MT.ink, fontFamily: FF.display, letterSpacing: '-0.2px' }}>Worry-Free Toilet Unclog · Express on-site</div>
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

// ─── Review sheet ───────────────────────────────────────────────────
function ReviewSheet({ onClose }) {
  const Em = ({ children, label, active }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flex: 1 }}>
      <div style={{
        width: 42, height: 42, borderRadius: 21,
        background: active ? MT.ink : MT.surfaceAlt,
        border: `1px solid ${active ? MT.ink : MT.hairline}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .25s',
      }}>{children(active)}</div>
      <span style={{ fontSize: 12, color: active ? MT.ink : MT.muted, fontWeight: active ? 700 : 500, fontFamily: FF.text }}>{label}</span>
    </div>
  );
  const lineColor = (a) => a ? '#fff' : MT.muted;
  const Chip = ({ children, active }) => (
    <button className="btn-press" style={{ height: 32, border: `1px solid ${active ? MT.ink : MT.hairline}`, borderRadius: 100, padding: '0 14px', background: active ? MT.surfaceAlt : MT.surface, color: active ? MT.ink : MT.inkLight, fontSize: 13, fontWeight: active ? 700 : 500, fontFamily: FF.text, cursor: 'pointer' }}>{children}</button>
  );
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 60, animation: 'fade-in .2s both' }}/>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: MT.surface, boxShadow: MT.shadowLg, borderRadius: '20px 20px 0 0', padding: '12px 20px 20px', zIndex: 61, animation: 'sheet-up .4s cubic-bezier(.2,.8,.2,1) both' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: MT.surfaceDeep }}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: 18, fontWeight: 800, fontFamily: FF.display, color: MT.ink, letterSpacing: '-0.3px' }}>How did Mike do?</span>
          <svg onClick={onClose} style={{ cursor: 'pointer' }} width="14" height="14" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2L2 12" stroke={MT.muted} strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          <Em label="Awful">{(a) => (
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke={lineColor(a)} strokeWidth="1.4"/><circle cx="7" cy="9" r="1" fill={lineColor(a)}/><circle cx="13" cy="9" r="1" fill={lineColor(a)}/><path d="M6.5 14c1-1.2 4-1.2 5 0" stroke={lineColor(a)} strokeWidth="1.3" strokeLinecap="round" fill="none" transform="rotate(180 9 14)"/></svg>
          )}</Em>
          <Em label="Bad">{(a) => (
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke={lineColor(a)} strokeWidth="1.4"/><circle cx="7" cy="9" r="1" fill={lineColor(a)}/><circle cx="13" cy="9" r="1" fill={lineColor(a)}/><path d="M7 13.5c1-1 4-1 6 0" stroke={lineColor(a)} strokeWidth="1.3" strokeLinecap="round" fill="none" transform="rotate(180 10 13.5)"/></svg>
          )}</Em>
          <Em label="Okay">{(a) => (
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke={lineColor(a)} strokeWidth="1.4"/><circle cx="7" cy="9" r="1" fill={lineColor(a)}/><circle cx="13" cy="9" r="1" fill={lineColor(a)}/><path d="M7 13.5h6" stroke={lineColor(a)} strokeWidth="1.3" strokeLinecap="round"/></svg>
          )}</Em>
          <Em label="Good">{(a) => (
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke={lineColor(a)} strokeWidth="1.4"/><circle cx="7" cy="9" r="1" fill={lineColor(a)}/><circle cx="13" cy="9" r="1" fill={lineColor(a)}/><path d="M7 12c1 1.2 4 1.2 5 0" stroke={lineColor(a)} strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>
          )}</Em>
          <Em label="Amazing" active>{(a) => (
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke={lineColor(a)} strokeWidth="1.5"/><path d="M6.5 8.5l1.2-1.2M13.5 8.5l-1.2-1.2" stroke={lineColor(a)} strokeWidth="1.4" strokeLinecap="round"/><path d="M7 12c1 1.6 5 1.6 6 0" stroke={lineColor(a)} strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
          )}</Em>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <Chip active>Friendly tech</Chip><Chip active>Fast repair</Chip><Chip>Knew their stuff</Chip><Chip>Spot-on diagnosis</Chip>
        </div>
        <div style={{ background: MT.surfaceAlt, borderRadius: 12, padding: 12, marginBottom: 18, position: 'relative', height: 76, border: `1px solid ${MT.hairline}` }}>
          <span style={{ color: MT.muted, fontSize: 13, fontFamily: FF.text }}>Tell us what went well — your kind words matter</span>
          <span className="tnum" style={{ position: 'absolute', right: 12, bottom: 8, color: MT.muted, fontSize: 12, fontFamily: FF.text }}>0 / 100</span>
        </div>
        <div style={{ fontSize: 12, color: MT.muted, marginBottom: 8, fontFamily: FF.text, textTransform: 'uppercase', letterSpacing: '.6px', fontWeight: 700 }}>Did this resolve your issue?</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}><Chip active>Yes, resolved</Chip><Chip>Not yet</Chip></div>
        <PrimaryBtn full onClick={onClose}>Submit review</PrimaryBtn>
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
          Your quote window passed and the vendor's quote is no longer valid. Update your request and we'll re-collect quotes from available pros.
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
          flex: 1, background: MT.surface, borderRadius: '4px 16px 16px 16px',
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
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,.3) 0%, rgba(0,0,0,0) 32%)' }}/>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}><StatusBar /></div>
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
            <span className="tnum" style={{ fontSize: 11.5, fontWeight: 700, color: MT.greenDeep, fontFamily: FF.text }}>· capped ${v.cap}</span>
          </div>
        </div>
        <PrimaryBtn onClick={() => onBook && onBook(vendorKey)}>Book this vendor</PrimaryBtn>
      </div>
      <HomeIndicator />
    </div>
  );
}

function BookingCard({ vendorKey, orderNum }) {
  const v = VENDORS[vendorKey] || VENDORS.citrus;
  const [eta, setEta] = React.useState(14);
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
          flex: 1, background: MT.surface, borderRadius: '4px 16px 16px 16px',
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
                <span className="tnum" style={{ color: MT.ink }}>~{eta}</span> min · between <span className="tnum">4:15</span> — <span className="tnum">4:30 PM</span>
              </div>
            </div>
          </div>
          <div style={{ padding: '0 12px 12px', display: 'flex', gap: 8 }}>
            <button className="btn-press" style={{
              flex: 1, height: 36, borderRadius: 100,
              border: `1px solid ${MT.hairline}`, background: MT.surface,
              fontSize: 13, fontWeight: 700, fontFamily: FF.text, color: MT.ink,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 2.5l2 0 1 3-1.5 1c0.6 1.7 2 3.2 3.8 3.8l1-1.5 3 1 0 2c0 0.5-0.4 1-1 1C5 12.8 1.2 9 1.2 4c0-0.5 0.4-1 0.9-1z" stroke={MT.ink} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Call vendor
            </button>
            <button className="btn-press" style={{
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

function InviteCard({ onAct }) {
  return (
    <div style={{ padding: '6px 14px', ...ENTER }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <ProAvatar />
        <div style={{ background: MT.surface, borderRadius: '4px 16px 16px 16px', flex: 1, padding: '14px 16px', border: `1px solid ${MT.divider}` }}>
          <div style={{ fontFamily: FF.display, fontSize: 15, fontWeight: 800, color: MT.ink, letterSpacing: '-0.2px' }}>Quick favor — would you rate us?</div>
          <div style={{ marginTop: 6, fontSize: 13, lineHeight: '20px', color: MT.inkLight, fontFamily: FF.text }}>If you were happy with the service, leave a review. If anything fell short, message me directly and I'll make it right.</div>
          <div style={{ marginTop: 12 }}><PrimaryBtn full onClick={onAct}>Rate this service</PrimaryBtn></div>
        </div>
      </div>
      <div style={{ marginLeft: 44, marginTop: 6 }}>
        <button style={{ background: 'transparent', border: 0, color: MT.muted, fontSize: 12, fontFamily: FF.text, padding: '4px 0', cursor: 'pointer' }}>Dismiss</button>
      </div>
    </div>
  );
}

// ─── Stage-aware service status strip ───────────────────────────────
function ServiceContextBar({ stage, scenario, vendor }) {
  let label, detail, dot, dotPulse = false;
  if (scenario === 'off-hours') {
    label = 'After hours'; detail = 'Replies pause until we reopen at 9 AM'; dot = MT.muted;
  } else if (stage === 1) {
    label = 'Smart assistant ready'; detail = 'Describe your issue to get a free diagnosis'; dot = MT.ink;
  } else if (stage === 2) {
    label = 'Specialist on the line'; detail = 'Mike Chen · Plumbing · 8 yrs · ★ 4.96'; dot = MT.green; dotPulse = true;
  } else if (stage === 3) {
    label = 'Repair order #4729'; detail = 'Drafting — confirm time and address'; dot = MT.ink; dotPulse = true;
  } else if (stage === 4) {
    if (vendor) {
      const v = VENDORS[vendor] || VENDORS.citrus;
      label = 'Booked · #4729-A'; detail = `${v.name} · Tracking arrival`; dot = MT.green; dotPulse = true;
    } else {
      label = 'Matching vendors'; detail = 'Polling nearby pros · quote window 5 min'; dot = MT.ink; dotPulse = true;
    }
  } else {
    return null;
  }
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 16px',
      background: MT.surfaceAlt,
      borderBottom: `1px solid ${MT.divider}`,
      cursor: 'default', flexShrink: 0,
    }}>
      <span style={{
        position: 'relative', width: 8, height: 8, borderRadius: 4, background: dot, flexShrink: 0,
      }}>
        {dotPulse && (
          <span style={{
            position: 'absolute', inset: -2, borderRadius: '50%',
            border: `1px solid ${dot}`, opacity: .4,
          }}/>
        )}
      </span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: MT.ink, fontFamily: FF.text, flexShrink: 0 }}>{label}</span>
        <span style={{ fontSize: 12, color: MT.muted, fontFamily: FF.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>· {detail}</span>
      </div>
    </div>
  );
}

// ─── Quick-reply chips above the composer ───────────────────────────
function QuickReplies({ stage, scenario }) {
  let chips;
  if (scenario === 'off-hours')        chips = ['Leave a note', 'Common issues', 'Pricing', 'Service area'];
  else if (scenario === 'return-visit') chips = ['Order details', 'Talk to a pro', 'Report an issue', 'Tip the pro'];
  else if (stage <= 2)                  chips = ['Common issues', 'Pricing', 'Service area', 'Talk to a pro'];
  else if (stage === 3)                 chips = ['Edit order', 'Reschedule', 'Talk to a pro', 'Cancel'];
  else                                  chips = ['Order status', 'Reschedule', 'Contact vendor', 'Talk to a pro'];
  return (
    <div className="scroll" style={{
      display: 'flex', gap: 6, padding: '10px 16px 8px',
      background: MT.surface, borderTop: `1px solid ${MT.divider}`,
      overflowX: 'auto', flexShrink: 0,
    }}>
      {chips.map(c => (
        <button key={c} className="btn-press" style={{
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
  return null;
}

function renderMessage(m, ctx, tight) {
  switch (m.type) {
    case 'bot': return <BotBubble key={m.id} tight={tight}>{m.text}</BotBubble>;
    case 'bot-q': return (
      <BotBubble key={m.id}>
        <div>{m.text}</div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {m.options.map((q, i) => <SuggestedQ key={i} onTap={() => ctx.onPick(m.id, q)}>{q}</SuggestedQ>)}
        </div>
      </BotBubble>
    );
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
    case 'order': return <RepairOrderCard key={m.id} pending={m.pending} onGetQuotes={() => ctx.onAction('get-quotes')} />;
    case 'quotes': return <div key={m.id} data-msg-type="quotes"><MerchantQuotesCard stale={m.stale} onView={(k) => ctx.onAction('view-vendor:' + k)} /></div>;
    case 'booking': return <BookingCard key={m.id} vendorKey={ctx.bookedVendor || m.vendor} orderNum={m.orderNum} />;
    case 'expert-intro': return <ExpertIntroCard key={m.id} />;
    case 'product': return <ProductCard key={m.id} onBuy={() => ctx.onAction('buy-product')} />;
    case 'quick-rating': return <QuickRating key={m.id} onPick={(k) => ctx.onAction('rate:' + k)} />;
    case 'invite': return <InviteCard key={m.id} onAct={() => ctx.onAction('open-review')} />;
    default: return null;
  }
}

const SCRIPTS = {
  default: [
    { delay: 0,    append: { type: 'intro', id: 'intro' } },
    { delay: 360,  append: { type: 'system', id: 's1', time: '5:33 PM', sub: 'Your privacy is protected — ask with confidence' } },
    { delay: 700,  append: { type: 'typing-bot', id: 't1' } },
    { delay: 900,  replace: 't1', append: { type: 'bot-q', id: 'q1', text: "What's the trouble? Tap a common issue or describe it in your own words.", options: ['Toilet smells', "Toilet won't refill", 'Toilet is clogged'] } },
    { wait: 'q1' },
    { delay: 600,  append: { type: 'me', id: 'm1', text: "Toilet smells. I can't tell where the odor is coming from." } },
    { delay: 900,  stage: 2, append: { type: 'handshake', id: 's2', time: '5:40 PM' } },
    { delay: 1500, append: { type: 'expert-intro', id: 'expert' } },
    { delay: 700, append: { type: 'typing-pro', id: 't2' } },
    { delay: 800, replace: 't2', append: { type: 'pro', id: 'p1', text: "I have a sense of what you're describing. Could you film a short clip of the toilet for me?" } },
    { delay: 900,  append: { type: 'me', id: 'm2', text: 'Sure thing' } },
    { delay: 600,  append: { type: 'me-video', id: 'm3' } },
    { delay: 800, append: { type: 'typing-pro', id: 't3' } },
    { delay: 800, replace: 't3', stage: 3, append: { type: 'pro', id: 'p2', text: "The wax ring between the toilet base and the floor flange has worn out — that's almost always the source. Replacing it should fix it." } },
    { delay: 900,  append: { type: 'typing-pro', id: 't4' } },
    { delay: 700,  replace: 't4', append: { type: 'pro', id: 'p3', text: "I've drafted your repair order below. Confirm the time and address and I'll collect quotes from nearby pros." } },
    { delay: 700,  append: { type: 'order', id: 'order' } },
    { wait: 'action:get-quotes' },
    { delay: 400,  stage: 4, append: { type: 'typing-bot', id: 't5' } },
    { delay: 500,  replace: 't5', append: { type: 'system', id: 's3', time: '5:44 PM' } },
    { delay: 300,  append: { type: 'bot', id: 'b2', text: 'Got it — reaching out to nearby certified pros now.' } },
    { delay: 600,  append: { type: 'quotes', id: 'quotes' } },
    { wait: 'action:book-vendor' },
    { delay: 400,  append: { type: 'system', id: 's4', time: '5:46 PM' } },
    { delay: 200,  append: { type: 'typing-bot', id: 't6' } },
    { delay: 700,  replace: 't6', append: { type: 'bot', id: 'b3', text: 'Booked. Your vendor is on the way — confirmed at the price you accepted.' } },
    { delay: 500,  append: { type: 'booking', id: 'booking', orderNum: '#4729-A' } },
  ],

  'cat-litter': [
    { delay: 0,    append: { type: 'intro', id: 'intro' } },
    { delay: 360,  append: { type: 'system', id: 's1', time: '5:33 PM', sub: 'Your privacy is protected — ask with confidence' } },
    { delay: 700,  append: { type: 'typing-bot', id: 't1' } },
    { delay: 900,  replace: 't1', append: { type: 'bot-q', id: 'q1', text: "Tell me what's going on and I'll work out the cause.", options: ['How do I deal with a clogged toilet?', 'How much does unclogging cost?'] } },
    { wait: 'q1' },
    { delay: 600,  append: { type: 'me', id: 'm1', text: "The toilet's clogged with cat litter" } },
    { delay: 900,  stage: 2, append: { type: 'handshake', id: 's2', time: '5:40 PM' } },
    { delay: 1500, append: { type: 'expert-intro', id: 'expert' } },
    { delay: 700, append: { type: 'typing-pro', id: 't2' } },
    { delay: 800, replace: 't2', append: { type: 'pro', id: 'p1', text: 'Quick question — is it tofu litter, clay, or a mix? A photo would help.' } },
    { delay: 800,  append: { type: 'me', id: 'm2', text: 'Tofu litter' } },
    { delay: 600,  append: { type: 'me-photo', id: 'm3' } },
    { delay: 800, append: { type: 'typing-pro', id: 't3' } },
    { delay: 800, replace: 't3', append: { type: 'pro', id: 'p2', text: "Tofu litter dissolves slowly. If you flushed a lot at once, give it ten minutes and try again. If it still won't clear, the bundle below sends a tech for a quick clear-out." } },
    { delay: 800,  append: { type: 'product', id: 'product' } },
    { wait: 'action:buy-product' },
    { delay: 400,  append: { type: 'system', id: 's3', time: '5:45 PM', sub: 'Order placed · arriving 6:15 PM' } },
    { delay: 800, append: { type: 'typing-pro', id: 't4' } },
    { delay: 900,  replace: 't4', append: { type: 'bot-q', id: 'q2', text: 'Did that clear it up?', options: ['Yes, it cleared', 'Still clogged — talk to a pro'] } },
    { wait: 'q2' },
    { delay: 700,  append: { type: 'typing-pro', id: 't5' } },
    { delay: 900,  replace: 't5', append: { type: 'pro', id: 'p3', text: "Great. I'll close the ticket — ping us anytime if it acts up again." } },
  ],

  'off-hours': [
    { delay: 0,   append: { type: 'intro', id: 'intro' } },
    { delay: 360, append: { type: 'system', id: 's1', time: '10:48 PM', sub: 'Your privacy is protected — ask with confidence' } },
    { delay: 700, append: { type: 'typing-bot', id: 't1' } },
    { delay: 900, replace: 't1', append: { type: 'bot', id: 'b1', text: "We're outside service hours right now. The team is on Mon–Sun, 9 AM – 10 PM. Leave a note and a specialist will be on the line the moment we reopen." } },
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
    { delay: 900,  replace: 't1', append: { type: 'pro', id: 'p1', text: "Your quote window has expired. Pick a new time and we'll re-collect quotes from vendors." } },
    { delay: 800,  append: { type: 'order', id: 'order', pending: true } },
  ],

  'return-visit': [
    { delay: 0,    stage: 4, append: { type: 'divider', id: 'd1', label: 'Earlier conversation' } },
    { delay: 400,  append: { type: 'typing-pro', id: 't1' } },
    { delay: 900,  replace: 't1', append: { type: 'bot-q', id: 'q1', text: 'Did the previous tech sort it out for you? Anything else I can help with?', options: ['The diagnosis was off', "The repair plan didn't hold up", 'The vendor charged more than the quote'] } },
    { wait: 'q1' },
    { delay: 600,  append: { type: 'me', id: 'm1', text: 'Nope, all good' } },
    { delay: 900,  append: { type: 'typing-pro', id: 't2' } },
    { delay: 800,  replace: 't2', append: { type: 'pro', id: 'p1', text: "Glad to hear it. One quick thing before I close out — how was it?" } },
    { delay: 500,  append: { type: 'quick-rating', id: 'rate' } },
    { wait: 'action:rate' },
    { delay: 600,  append: { type: 'pro', id: 'p2', text: "Appreciate that. If you want, leave a longer review below — totally optional." } },
    { delay: 600,  append: { type: 'invite', id: 'invite' } },
  ],
};

const STAGE_BY_SCENARIO = {
  default: 1, 'cat-litter': 1, 'off-hours': 1,
  'expired-modal': 4, 'expired-chat': 4, 'return-visit': 4,
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
    runFrom(0);
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

  function runFrom(idx) {
    const script = SCRIPTS[scenario];
    if (!script) return;
    let i = idx;
    const next = () => {
      if (cancelled.current) return;
      if (i >= script.length) { onSceneEnd && onSceneEnd(); return; }
      const step = script[i];
      if (step.wait) {
        setWaiting(step.wait);
        return;
      }
      setTimeout(() => {
        if (cancelled.current) return;
        applyStep(step);
        i++;
        stepIdx.current = i;
        next();
      }, __RM ? Math.min(step.delay || 0, 100) : (step.delay || 0));
    };
    next();
  }

  const ctx = {
    onPick: (qId, text) => {
      if (waiting === qId) {
        setMessages(prev => prev.map(m => m.id === qId ? { ...m, options: [] } : m));
        setMessages(prev => [...prev, { type: 'me', id: 'pick-' + Date.now(), text }]);
        setWaiting(null);
        if (/talk to a pro/i.test(text)) {
          onSceneEnd && onSceneEnd('default');
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
          <Header active={stage} proJoined={false} />
          <ServiceContextBar stage={stage} scenario={scenario} vendor={bookedVendor} />
          <div ref={scrollRef} className="scroll" style={{ flex: 1, overflow: 'auto', background: MT.bg, paddingBottom: 14, overscrollBehavior: 'contain' }}>
            {messages.map((m, __i) => {
              const __p = messages[__i - 1];
              const __sd = !!(__p && senderOf(__p.type) && senderOf(__p.type) === senderOf(m.type));
              return renderMessage(m, ctx, __sd);
            })}
          </div>
          <QuickReplies stage={stage} scenario={scenario} />
          <Composer
            leftLabel={scenario === 'return-visit' ? 'Rate this conversation' : null}
            placeholder={
              scenario === 'return-visit' ? 'How was it?' :
              scenario === 'off-hours' ? 'Leave a note for the team…' :
              stage < 2 ? 'Tell us what is going on…' :
              'Reply to Mike Chen…'
            }
          />
          <HomeIndicator />

          {modal === 'expired' && <ExpiredModal onAct={() => { setModal(null); onSceneEnd && onSceneEnd('expired-chat'); }} />}
          {modal === 'review'  && <ReviewSheet onClose={() => setModal(null)} />}
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
  const lineItems = [
    { k: 'Visit fee', v: '$0', sub: 'Waived on booking' },
    { k: 'Diagnostic', v: '$7' },
    { k: 'Wax ring + labor', v: '$38 – $53' },
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
              <span className="tnum" style={{ fontSize: 12, color: MT.muted, fontFamily: FF.text }}>· 0:12 ago · 3 pros invited</span>
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
                Respond within <span className="tnum">5:00</span>
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
                  <div style={{ fontSize: 12.5, color: MT.muted, fontFamily: FF.text, marginTop: 1 }}>You'll be notified if they pick you · valid 5 min</div>
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

function App() {
  const [scenario, setScenario] = React.useState(__initialScenario);
  const hideRail = __railHidden();
  const [nonce, setNonce] = React.useState(0);
  const replay = () => setNonce(n => n + 1);
  const onSceneEnd = (next) => { if (next) setScenario(next); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, padding: '0 24px' }}>
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
  );
}

module.exports = { App };
