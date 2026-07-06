import type { Scene, SceneVideoState } from '../../types';
import { colors, fonts, inputStyle } from '../../theme';
import { videoFileUrl } from '../../api';
import { ApproveButton, ErrorBanner, Modal, PrimaryButton, SecondaryButton, ShimmerOverlay, Spinner } from '../ui';

export function Videos({
  scenes,
  videos,
  approveVideo,
  regenerateVideo,
  editingMotionPromptId,
  setEditingMotionPromptId,
  updateSceneMotionPrompt,
  previewSceneId,
  setPreviewSceneId,
  goToFinal,
}: {
  scenes: Scene[];
  videos: Record<string, SceneVideoState>;
  approveVideo: (sceneId: string) => void;
  regenerateVideo: (sceneId: string) => void;
  editingMotionPromptId: string | null;
  setEditingMotionPromptId: (id: string | null) => void;
  updateSceneMotionPrompt: (id: string, prompt: string) => void;
  previewSceneId: string | null;
  setPreviewSceneId: (id: string | null) => void;
  goToFinal: () => void;
}) {
  const approvedCount = scenes.filter((s) => videos[s.id]?.status === 'approved').length;
  const allApproved = scenes.length > 0 && approvedCount === scenes.length;
  const previewScene = scenes.find((s) => s.id === previewSceneId);
  const previewVideo = previewSceneId ? videos[previewSceneId] : undefined;

  return (
    <div data-screen-label="Scene Video Generation" style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 32px 90px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 26, marginBottom: 6 }}>Generate scene videos</div>
          <div style={{ fontSize: 14, color: colors.muted }}>Veo animates each approved image into a short motion clip.</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: colors.violetSoft, background: 'rgba(139,92,246,0.12)', padding: '8px 14px', borderRadius: 999 }}>
          {approvedCount} / {scenes.length} approved
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {scenes.map((sc) => {
          const vd = videos[sc.id] || { status: 'idle' as const };
          const approved = vd.status === 'approved';
          const ready = vd.status === 'ready' || approved;
          const isEditingPrompt = editingMotionPromptId === sc.id;
          return (
            <div key={sc.id} style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))', border: `1px solid ${approved ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 18, padding: 20, display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>
              <div style={{ aspectRatio: '1', borderRadius: 14, background: 'linear-gradient(135deg,#3B2E6B,#6B3E7A)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {ready && vd.videoId ? (
                  <video src={videoFileUrl(vd.videoId)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted loop autoPlay playsInline />
                ) : vd.status === 'error' ? (
                  <div style={{ fontSize: 11, color: '#F5A8D0', padding: 10, textAlign: 'center' }}>Generation failed</div>
                ) : (
                  <>
                    <ShimmerOverlay />
                    <Spinner size={34} />
                  </>
                )}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                  <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 15, lineHeight: 1.35 }}>Scene {sc.number} · {sc.title}</div>
                  <div style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 999, fontSize: 10.5, fontWeight: 700, fontFamily: fonts.display, background: approved ? 'rgba(52,211,153,0.18)' : vd.status === 'generating' ? 'rgba(251,191,36,0.16)' : vd.status === 'error' ? 'rgba(236,72,153,0.18)' : ready ? 'rgba(79,140,255,0.16)' : 'rgba(79,140,255,0.16)', color: approved ? colors.greenText : vd.status === 'generating' ? colors.yellow : vd.status === 'error' ? '#F5A8D0' : colors.blueSoft }}>
                    {approved ? 'Approved' : vd.status === 'generating' ? 'Generating' : vd.status === 'error' ? 'Failed' : ready ? 'Ready' : 'Queued'}
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: '#8A87A0', marginBottom: 8, lineHeight: 1.5 }}>
                  Motion prompt: <span style={{ color: colors.bodyText2 }}>{sc.videoPrompt}</span>
                </div>
                <div style={{ fontSize: 12.5, color: colors.bodyText, fontStyle: 'italic', marginBottom: 14 }}>“{sc.caption}”</div>

                {vd.status === 'error' && (
                  <div style={{ marginBottom: 12 }}>
                    <ErrorBanner message={vd.error || 'Video generation failed.'} onRetry={() => regenerateVideo(sc.id)} />
                  </div>
                )}

                {isEditingPrompt && (
                  <div style={{ marginBottom: 12 }}>
                    <textarea
                      value={sc.videoPrompt}
                      onChange={(e) => updateSceneMotionPrompt(sc.id, e.target.value)}
                      rows={2}
                      style={{ ...inputStyle, fontSize: 12.5, resize: 'vertical' }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <ApproveButton approved={approved} label="Approve video" onClick={() => approveVideo(sc.id)} disabled={!ready} />
                  <SecondaryButton onClick={() => regenerateVideo(sc.id)} disabled={vd.status === 'generating'} style={{ padding: '10px 14px', fontSize: 12 }}>
                    Regenerate video
                  </SecondaryButton>
                  <SecondaryButton onClick={() => setEditingMotionPromptId(isEditingPrompt ? null : sc.id)} style={{ padding: '10px 14px', fontSize: 12 }}>
                    {isEditingPrompt ? 'Done editing prompt' : 'Edit motion prompt'}
                  </SecondaryButton>
                  {ready && (
                    <SecondaryButton onClick={() => setPreviewSceneId(sc.id)} style={{ padding: '10px 14px', fontSize: 12 }}>
                      Preview scene
                    </SecondaryButton>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {allApproved && (
        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <PrimaryButton onClick={goToFinal} style={{ padding: '16px 32px', fontSize: 15.5, borderRadius: 14 }}>
            Create Final Episode →
          </PrimaryButton>
        </div>
      )}

      {previewScene && previewVideo?.videoId && (
        <Modal onClose={() => setPreviewSceneId(null)}>
          <div style={{ background: '#000', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <video src={videoFileUrl(previewVideo.videoId)} style={{ width: '100%', display: 'block' }} controls autoPlay />
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: colors.muted, textAlign: 'center' }}>Scene {previewScene.number} · {previewScene.title}</div>
        </Modal>
      )}
    </div>
  );
}
