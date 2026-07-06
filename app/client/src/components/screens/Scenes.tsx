import type { Scene } from '../../types';
import { colors, fonts } from '../../theme';
import { ApproveButton, ErrorBanner, PrimaryButton, SecondaryButton, Spinner } from '../ui';

export function Scenes({
  scenes,
  scenesGenStatus,
  scenesGenError,
  regeneratingSceneIds,
  approveScene,
  regenerateScene,
  goToVideos,
}: {
  scenes: Scene[];
  scenesGenStatus: 'idle' | 'generating' | 'ready' | 'error';
  scenesGenError: string | null;
  regeneratingSceneIds: Record<string, boolean>;
  approveScene: (id: string) => void;
  regenerateScene: (id: string) => void;
  goToVideos: () => void;
}) {
  const approvedCount = scenes.filter((s) => s.approved).length;
  const allApproved = scenes.length > 0 && approvedCount === scenes.length;

  return (
    <div data-screen-label="Scene Breakdown" style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 32px 90px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 26, marginBottom: 6 }}>Scene-by-scene breakdown</div>
          <div style={{ fontSize: 14, color: colors.muted }}>Approve each scene — the scene breakdown model builds motion direction, captions, and camera direction.</div>
        </div>
        {scenes.length > 0 && (
          <div style={{ fontSize: 13, fontWeight: 700, color: colors.violetSoft, background: 'rgba(139,92,246,0.12)', padding: '8px 14px', borderRadius: 999 }}>
            {approvedCount} / {scenes.length} approved
          </div>
        )}
      </div>

      {scenesGenStatus === 'generating' && (
        <div style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '60px 28px', textAlign: 'center' }}>
          <div style={{ marginBottom: 20 }}><Spinner /></div>
          <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 15 }}>Breaking your story into scenes…</div>
        </div>
      )}

      {scenesGenStatus === 'error' && (
        <ErrorBanner message={scenesGenError || 'Scene breakdown failed.'} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {scenes.map((sc) => {
          const isRegenerating = !!regeneratingSceneIds[sc.id];
          return (
            <div key={sc.id} style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))', border: `1px solid ${sc.approved ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 18, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(139,92,246,0.18)', color: colors.violetSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.display, fontWeight: 800, fontSize: 14 }}>
                    {sc.number}
                  </div>
                  <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 16 }}>{sc.title}</div>
                </div>
                <div style={{ padding: '5px 12px', borderRadius: 999, fontSize: 10.5, fontWeight: 700, fontFamily: fonts.display, background: sc.approved ? 'rgba(52,211,153,0.18)' : 'rgba(251,191,36,0.16)', color: sc.approved ? colors.greenText : colors.yellow }}>
                  {sc.approved ? 'Approved' : 'Ready for review'}
                </div>
              </div>

              <div style={{ fontSize: 13.5, color: colors.bodyText, lineHeight: 1.6, marginBottom: 16 }}>{sc.description}</div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  ['CHARACTERS', sc.charactersInvolved],
                  ['LOCATION', sc.location],
                  ['CAMERA ANGLE', sc.camera],
                  ['MOOD', sc.mood],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: colors.mutedDim, marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 12, color: colors.bodyText2 }}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: colors.mutedDim, marginBottom: 4 }}>ACTION</div>
                <div style={{ fontSize: 12.5, color: colors.bodyText2, lineHeight: 1.5 }}>{sc.action}</div>
              </div>
              <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: colors.violetSoft, marginBottom: 4 }}>CAPTION / DIALOGUE</div>
                <div style={{ fontSize: 13, color: '#F0EEFA', fontStyle: 'italic', lineHeight: 1.5 }}>“{sc.caption}”</div>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <ApproveButton approved={sc.approved} label="Approve scene" onClick={() => approveScene(sc.id)} />
                <SecondaryButton onClick={() => regenerateScene(sc.id)} disabled={isRegenerating} style={{ padding: '11px 16px', fontSize: 12.5 }}>
                  {isRegenerating ? 'Regenerating…' : 'Regenerate scene'}
                </SecondaryButton>
              </div>
            </div>
          );
        })}
      </div>

      {allApproved && (
        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <PrimaryButton onClick={goToVideos} style={{ padding: '16px 32px', fontSize: 15.5, borderRadius: 14 }}>
            Generate Scene Videos →
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
