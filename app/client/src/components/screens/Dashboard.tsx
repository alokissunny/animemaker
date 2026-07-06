import type { Project } from '../../types';
import { fonts } from '../../theme';

export function Dashboard({
  projects,
  onStartNew,
  onOpenProject,
  onQuickResume,
}: {
  projects: Project[];
  onStartNew: () => void;
  onOpenProject: (id: string) => void;
  onQuickResume: (id: string) => void;
}) {
  const mostRecent = projects[0];
  return (
    <div data-screen-label="Dashboard" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 28, marginBottom: 4 }}>Welcome back, Maya</div>
          <div style={{ fontSize: 14, color: '#9C99B4' }}>Pick up a project or start a brand-new kids' show episode.</div>
        </div>
        <button
          onClick={onStartNew}
          style={{ border: 'none', cursor: 'pointer', padding: '14px 24px', borderRadius: 13, background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', color: '#fff', fontFamily: fonts.display, fontWeight: 700, fontSize: 14.5, boxShadow: '0 8px 26px rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span style={{ fontSize: 17, lineHeight: 1 }}>+</span> Create New Episode
        </button>
      </div>

      {mostRecent && (
        <div
          onClick={() => onQuickResume(mostRecent.id)}
          style={{
            cursor: 'pointer',
            marginBottom: 28,
            padding: '20px 22px',
            borderRadius: 18,
            background: 'linear-gradient(135deg,rgba(139,92,246,0.16),rgba(236,72,153,0.1))',
            border: '1px solid rgba(139,92,246,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 15.5, marginBottom: 4 }}>
              Resume "{mostRecent.title}"
            </div>
            <div style={{ fontSize: 12.5, color: '#C9C6DA' }}>
              {mostRecent.meta} · {mostRecent.statusLabel}
            </div>
          </div>
          <div
            style={{
              flexShrink: 0,
              padding: '10px 20px',
              borderRadius: 12,
              background: 'linear-gradient(135deg,#8B5CF6,#EC4899)',
              color: '#fff',
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Resume →
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
        {projects.map((p) => (
          <div
            key={p.id}
            onClick={() => onOpenProject(p.id)}
            style={{ cursor: 'pointer', background: 'linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden' }}
          >
            <div style={{ height: 150, background: p.thumbGradient, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 34, color: 'rgba(255,255,255,0.85)' }}>{p.initials}</div>
              <div style={{ position: 'absolute', top: 10, right: 10, padding: '5px 10px', borderRadius: 999, fontSize: 10.5, fontWeight: 700, fontFamily: fonts.display, background: 'rgba(255,255,255,0.14)', color: '#F5F4FA' }}>
                {p.statusLabel}
              </div>
            </div>
            <div style={{ padding: '16px 18px 18px' }}>
              <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{p.title}</div>
              <div style={{ fontSize: 12.5, color: '#9C99B4', marginBottom: 10 }}>{p.meta}</div>
              <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: p.progressPct, background: 'linear-gradient(90deg,#8B5CF6,#EC4899)', borderRadius: 3 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
