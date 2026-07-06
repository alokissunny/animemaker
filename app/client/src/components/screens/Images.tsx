import type { Scene, SceneImageState } from '../../types';
import { colors, fonts, inputStyle } from '../../theme';
import { dataUri } from '../../api';
import { ApproveButton, ErrorBanner, PrimaryButton, SecondaryButton, ShimmerOverlay } from '../ui';

export function Images({
  scenes,
  images,
  selectImageVariant,
  approveImage,
  regenerateImage,
  editingScenePromptId,
  setEditingScenePromptId,
  updateScenePrompt,
  goToVideos,
}: {
  scenes: Scene[];
  images: Record<string, SceneImageState>;
  selectImageVariant: (sceneId: string, variantId: number) => void;
  approveImage: (sceneId: string) => void;
  regenerateImage: (sceneId: string) => void;
  editingScenePromptId: string | null;
  setEditingScenePromptId: (id: string | null) => void;
  updateScenePrompt: (id: string, prompt: string) => void;
  goToVideos: () => void;
}) {
  const approvedCount = scenes.filter((s) => images[s.id]?.status === 'approved').length;
  const allApproved = scenes.length > 0 && approvedCount === scenes.length;

  return (
    <div data-screen-label="Scene Image Generation" style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 32px 90px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 26, marginBottom: 6 }}>Create scene images</div>
          <div style={{ fontSize: 14, color: colors.muted }}>Nano Banana renders each approved scene. Pick your favorite take.</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: colors.violetSoft, background: 'rgba(139,92,246,0.12)', padding: '8px 14px', borderRadius: 999 }}>
          {approvedCount} / {scenes.length} approved
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {scenes.map((sc) => {
          const im = images[sc.id] || { status: 'idle' as const, variants: [], selectedVariant: null };
          const approved = im.status === 'approved';
          const isEditingPrompt = editingScenePromptId === sc.id;
          return (
            <div key={sc.id} style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))', border: `1px solid ${approved ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 18, padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 15 }}>Scene {sc.number} · {sc.title}</div>
                <div style={{ padding: '5px 12px', borderRadius: 999, fontSize: 10.5, fontWeight: 700, fontFamily: fonts.display, background: approved ? 'rgba(52,211,153,0.18)' : im.status === 'generating' ? 'rgba(251,191,36,0.16)' : im.status === 'error' ? 'rgba(236,72,153,0.18)' : 'rgba(79,140,255,0.16)', color: approved ? colors.greenText : im.status === 'generating' ? colors.yellow : im.status === 'error' ? '#F5A8D0' : colors.blueSoft }}>
                  {approved ? 'Approved' : im.status === 'generating' ? 'Generating' : im.status === 'error' ? 'Failed' : im.status === 'ready' ? 'Ready' : 'Pending'}
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: '#8A87A0', marginBottom: 14 }}>
                Prompt: <span style={{ color: colors.bodyText2 }}>{sc.imagePrompt}</span> · Characters: {sc.charactersInvolved}
              </div>

              {isEditingPrompt && (
                <div style={{ marginBottom: 14 }}>
                  <textarea
                    value={sc.imagePrompt}
                    onChange={(e) => updateScenePrompt(sc.id, e.target.value)}
                    rows={2}
                    style={{ ...inputStyle, fontSize: 12.5, resize: 'vertical' }}
                  />
                </div>
              )}

              {im.status === 'error' ? (
                <div style={{ marginBottom: 16 }}>
                  <ErrorBanner message={im.error || 'Image generation failed.'} onRetry={() => regenerateImage(sc.id)} />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 16 }}>
                  {(im.variants.length ? im.variants : [0, 1].map((id) => ({ id, imageBase64: '', mimeType: '' }))).map((v) => (
                    <div
                      key={v.id}
                      onClick={() => v.imageBase64 && selectImageVariant(sc.id, v.id)}
                      style={{ cursor: v.imageBase64 ? 'pointer' : 'default', borderRadius: 12, overflow: 'hidden', border: im.selectedVariant === v.id ? '2px solid #8B5CF6' : '2px solid transparent', position: 'relative' }}
                    >
                      <div style={{ aspectRatio: '1', background: 'linear-gradient(135deg,#3B2E6B,#6B3E7A)', position: 'relative', overflow: 'hidden' }}>
                        {v.imageBase64 && (
                          <img src={dataUri(v.imageBase64, v.mimeType)} alt={`Variant ${v.id + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                        {im.status === 'generating' && <ShimmerOverlay />}
                        {im.selectedVariant === v.id && v.imageBase64 && (
                          <div style={{ position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: '50%', background: '#34D399', color: colors.greenDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                            ✓
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <ApproveButton approved={approved} label="Approve image" onClick={() => approveImage(sc.id)} disabled={im.status !== 'ready'} />
                <SecondaryButton onClick={() => regenerateImage(sc.id)} disabled={im.status === 'generating'} style={{ padding: '11px 16px', fontSize: 12.5 }}>
                  Regenerate
                </SecondaryButton>
                <SecondaryButton onClick={() => setEditingScenePromptId(isEditingPrompt ? null : sc.id)} style={{ padding: '11px 16px', fontSize: 12.5 }}>
                  {isEditingPrompt ? 'Done editing prompt' : 'Edit prompt'}
                </SecondaryButton>
              </div>
            </div>
          );
        })}
      </div>

      {allApproved && (
        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <PrimaryButton onClick={goToVideos} style={{ padding: '16px 32px', fontSize: 15.5, borderRadius: 14 }}>
            Turn images into anime video →
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
