import type { Project } from '../../types';
import { fonts } from '../../theme';

export function ProjectDetail({
  project,
  onBack,
  onResume,
}: {
  project: Project;
  onBack: () => void;
  onResume: () => void;
}) {
  return (
    <div data-screen-label="Project Detail" style={{ maxWidth: 800, margin: '0 auto', padding: '60px 32px 80px' }}>
      <button onClick={onBack} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9C99B4', fontSize: 13, fontWeight: 600, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Manrope,sans-serif' }}>
        ← Back to dashboard
      </button>
      <div style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 22, padding: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: project.thumbGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.display, fontWeight: 800, fontSize: 22 }}>
            {project.initials}
          </div>
          <div>
            <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 22 }}>{project.title}</div>
            <div style={{ fontSize: 13, color: '#9C99B4' }}>{project.meta}</div>
          </div>
        </div>
        <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', fontSize: 13.5, color: '#C4B5FD', marginBottom: 24 }}>
          Status: {project.statusLabel} — pick up right where you left off.
        </div>
        <button onClick={onResume} style={{ border: 'none', cursor: 'pointer', padding: '14px 26px', borderRadius: 13, background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', color: '#fff', fontFamily: fonts.display, fontWeight: 700, fontSize: 14.5 }}>
          Resume project →
        </button>
      </div>
    </div>
  );
}
