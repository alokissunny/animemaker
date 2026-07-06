import { FLOW_SCREENS, type Screen } from '../types';
import { colors, fonts } from '../theme';

const STEP_DEFS: { key: Screen; label: string }[] = [
  { key: 'characters', label: 'Characters' },
  { key: 'episodeSetup', label: 'Episode Setup' },
  { key: 'story', label: 'Story' },
  { key: 'scenes', label: 'Scenes' },
  { key: 'videos', label: 'Videos' },
  { key: 'final', label: 'Export' },
];

export function TopNav({
  screen,
  onLogoClick,
  onStepClick,
  saveStatus,
}: {
  screen: Screen;
  onLogoClick: () => void;
  onStepClick: (screen: Screen) => void;
  saveStatus?: 'idle' | 'saving' | 'saved';
}) {
  const showStepper = FLOW_SCREENS.includes(screen);
  const isLoggedInNav = screen !== 'landing' && screen !== 'login';
  const currentIdx = FLOW_SCREENS.indexOf(screen);

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        backdropFilter: 'blur(16px)',
        background: 'rgba(10,10,18,0.72)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', flexShrink: 0 }} onClick={onLogoClick}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: 'linear-gradient(135deg,#8B5CF6,#EC4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: fonts.display,
              fontWeight: 800,
              fontSize: 14,
              boxShadow: '0 0 20px rgba(139,92,246,0.5)',
              flexShrink: 0,
            }}
          >
            N
          </div>
          <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 15, letterSpacing: 0.2, whiteSpace: 'nowrap' }}>Nova</div>
        </div>

        {showStepper && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center', minWidth: 0, overflowX: 'auto', padding: '2px 0' }}>
            {STEP_DEFS.map((d, i) => {
              const state = i < currentIdx ? 'done' : i === currentIdx ? 'active' : 'future';
              const bg = state === 'future' ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#8B5CF6,#EC4899)';
              const color = state === 'future' ? colors.mutedDim : '#fff';
              const border = state === 'active' ? '2px solid rgba(255,255,255,0.6)' : 'none';
              const glow = state === 'active' ? '0 0 14px rgba(139,92,246,0.7)' : 'none';
              const clickable = state !== 'future';
              return (
                <div
                  key={d.key}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: clickable ? 'pointer' : 'default', opacity: state === 'future' ? 0.55 : 1, flexShrink: 0 }}
                  onClick={clickable ? () => onStepClick(d.key) : undefined}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: fonts.display,
                      background: bg,
                      color,
                      border,
                      boxShadow: glow,
                      flexShrink: 0,
                    }}
                  >
                    {state === 'done' ? '✓' : i + 1}
                  </div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: state === 'future' ? colors.mutedDim : colors.text, whiteSpace: 'nowrap' }}>{d.label}</div>
                  {i < STEP_DEFS.length - 1 && (
                    <div style={{ width: 10, height: 1.5, background: state === 'done' ? colors.violet : 'rgba(255,255,255,0.1)', margin: '0 1px', flexShrink: 0 }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          {isLoggedInNav && saveStatus && saveStatus !== 'idle' && (
            <div style={{ fontSize: 11, color: colors.mutedDim, whiteSpace: 'nowrap' }}>
              {saveStatus === 'saving' ? 'Saving…' : 'Saved'}
            </div>
          )}
          {isLoggedInNav && (
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#4F8CFF,#8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                fontFamily: fonts.display,
                flexShrink: 0,
              }}
            >
              MT
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
