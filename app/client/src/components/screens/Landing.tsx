import { fonts } from '../../theme';

const FEATURES = [
  { icon: '✨', bg: 'rgba(139,92,246,0.15)', title: 'Design your cast', desc: 'Build named characters with a friendly style, personality, and role in the story.' },
  { icon: '📚', bg: 'rgba(236,72,153,0.15)', title: 'AI writes the episode', desc: 'Pick a theme and duration — get a full script broken into shootable scenes.' },
  { icon: '🎬', bg: 'rgba(79,140,255,0.15)', title: 'Approve, then render', desc: 'Review every scene and clip before it becomes your final episode.' },
];

export function Landing({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div data-screen-label="Landing">
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '96px 32px 64px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 16px',
            borderRadius: 999,
            background: 'rgba(139,92,246,0.12)',
            border: '1px solid rgba(139,92,246,0.35)',
            fontSize: 12.5,
            fontWeight: 600,
            color: '#C4B5FD',
            marginBottom: 28,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6', animation: 'pulseGlow 2s infinite' }} />
          AI-powered kids' show production, end to end
        </div>
        <h1
          style={{
            fontFamily: fonts.display,
            fontWeight: 800,
            fontSize: 60,
            lineHeight: 1.08,
            margin: '0 0 22px',
            letterSpacing: -1.5,
            background: 'linear-gradient(135deg,#F5F4FA 40%,#C4B5FD 70%,#F5A8D0 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Bring your characters
          <br />
          to life in a kids' show.
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: '#9C99B4', maxWidth: 600, margin: '0 auto 40px' }}>
          Design your cast, spin up a story, and render a finished kids' show episode — no animation skills required.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={onGetStarted}
            style={{
              border: 'none',
              cursor: 'pointer',
              padding: '16px 32px',
              borderRadius: 14,
              background: 'linear-gradient(135deg,#8B5CF6,#EC4899)',
              color: '#fff',
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: 15.5,
              boxShadow: '0 8px 30px rgba(139,92,246,0.4)',
            }}
          >
            Create your show's cast →
          </button>
          <button
            onClick={onGetStarted}
            style={{
              cursor: 'pointer',
              padding: '16px 28px',
              borderRadius: 14,
              background: 'rgba(255,255,255,0.05)',
              color: '#F5F4FA',
              fontFamily: fonts.display,
              fontWeight: 600,
              fontSize: 15.5,
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            See how it works
          </button>
        </div>
      </div>
      <div style={{ maxWidth: 1120, margin: '0 auto 100px', padding: '0 32px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        {FEATURES.map((f) => (
          <div
            key={f.title}
            style={{
              background: 'linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20,
              padding: 26,
            }}
          >
            <div style={{ width: 42, height: 42, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, marginBottom: 16 }}>
              {f.icon}
            </div>
            <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
            <div style={{ fontSize: 13.5, color: '#9C99B4', lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
