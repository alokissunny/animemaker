import type { FinalConfig, Scene, SceneVideoState } from '../../types';
import { colors, fonts } from '../../theme';
import { videoFileUrl } from '../../api';

const musicOptions = ['Warm acoustic (default)', 'Playful pizzicato', 'Dreamy synth', 'None'];
const exportFormatList = ['YouTube Shorts', 'Instagram Reels', 'TikTok', 'Landscape video', 'Square video'];

export function Final({
  scenes,
  videos,
  story,
  finalConfig,
  toggleCaptions,
  setMusic,
  setExportFormat,
  activeSceneIndex,
  setActiveSceneIndex,
}: {
  scenes: Scene[];
  videos: Record<string, SceneVideoState>;
  story: { title: string } | null;
  finalConfig: FinalConfig;
  toggleCaptions: () => void;
  setMusic: (m: string) => void;
  setExportFormat: (f: string) => void;
  activeSceneIndex: number;
  setActiveSceneIndex: (i: number) => void;
}) {
  const activeScene = scenes[activeSceneIndex];
  const activeVideo = activeScene ? videos[activeScene.id] : undefined;

  return (
    <div data-screen-label="Final Episode Preview" style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 32px 90px' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 999, background: 'rgba(52,211,153,0.14)', border: '1px solid rgba(52,211,153,0.35)', fontSize: 12.5, fontWeight: 700, color: colors.greenText, marginBottom: 16 }}>
          ✓ Your episode is ready
        </div>
        <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 28 }}>{story?.title}</div>
      </div>

      <div style={{ background: '#000', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 22 }}>
        <div style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg,#3B2E6B,#6B3E7A,#2E4B6B)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {activeVideo?.videoId ? (
            <video key={activeVideo.videoId} src={videoFileUrl(activeVideo.videoId)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} controls autoPlay />
          ) : (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>No approved clip for this scene yet.</div>
          )}
          {finalConfig.captionsOn && activeScene && (
            <div style={{ position: 'absolute', bottom: 22, left: 0, right: 0, textAlign: 'center', fontSize: 13.5, fontWeight: 600, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.6)', padding: '0 20px', pointerEvents: 'none' }}>
              “{activeScene.caption}”
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 10, background: '#0A0A12' }}>
          {scenes.map((sc, i) => (
            <div
              key={sc.id}
              onClick={() => setActiveSceneIndex(i)}
              title={`Scene ${sc.number} · ${sc.title}`}
              style={{
                flex: 1,
                height: 34,
                borderRadius: 6,
                background: 'linear-gradient(135deg,#3B2E6B,#6B3E7A)',
                cursor: 'pointer',
                outline: i === activeSceneIndex ? '2px solid #8B5CF6' : 'none',
                outlineOffset: -2,
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 26 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Captions</div>
            <div style={{ fontSize: 12, color: colors.muted }}>Show dialogue burned into the video</div>
          </div>
          <div onClick={toggleCaptions} style={{ width: 44, height: 25, borderRadius: 999, background: finalConfig.captionsOn ? 'linear-gradient(135deg,#8B5CF6,#EC4899)' : 'rgba(255,255,255,0.12)', position: 'relative', cursor: 'pointer' }}>
            <div style={{ position: 'absolute', top: 2.5, left: finalConfig.captionsOn ? 22 : 2.5, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 18 }}>
          <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Background music</div>
          <select value={finalConfig.music} onChange={(e) => setMusic(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 9, background: colors.inputBg, border: '1px solid rgba(255,255,255,0.1)', color: colors.text, fontSize: 13, fontFamily: 'Manrope,sans-serif' }}>
            {musicOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 22 }}>
        <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Export settings</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 20 }}>
          {exportFormatList.map((f) => (
            <button
              key={f}
              onClick={() => setExportFormat(f)}
              style={{
                border: finalConfig.format === f ? 'none' : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                padding: '12px 8px',
                borderRadius: 12,
                fontSize: 11.5,
                fontWeight: 700,
                fontFamily: fonts.display,
                background: finalConfig.format === f ? 'linear-gradient(135deg,#8B5CF6,#EC4899)' : 'rgba(255,255,255,0.04)',
                color: finalConfig.format === f ? '#fff' : colors.bodyText2,
                textAlign: 'center',
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            title="Full multi-scene export/stitching isn't wired up in this MVP — download individual approved clips below."
            style={{ flex: 1, minWidth: 160, border: 'none', cursor: 'not-allowed', padding: 15, borderRadius: 13, background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', color: '#fff', fontFamily: fonts.display, fontWeight: 700, fontSize: 14.5, opacity: 0.6 }}
          >
            Export episode
          </button>
          <a
            href={activeVideo?.videoId ? videoFileUrl(activeVideo.videoId) : undefined}
            download={activeScene ? `scene-${activeScene.number}.mp4` : undefined}
            style={{
              flex: 1,
              minWidth: 160,
              border: '1px solid rgba(255,255,255,0.14)',
              cursor: activeVideo?.videoId ? 'pointer' : 'not-allowed',
              padding: 15,
              borderRadius: 13,
              background: 'rgba(255,255,255,0.05)',
              color: colors.text,
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: 14.5,
              textAlign: 'center',
              textDecoration: 'none',
              opacity: activeVideo?.videoId ? 1 : 0.5,
            }}
          >
            Download active clip
          </a>
          <button
            title="Sharing isn't wired up in this MVP."
            style={{ flex: 1, minWidth: 160, border: '1px solid rgba(255,255,255,0.14)', cursor: 'not-allowed', padding: 15, borderRadius: 13, background: 'rgba(255,255,255,0.05)', color: colors.text, fontFamily: fonts.display, fontWeight: 700, fontSize: 14.5, opacity: 0.6 }}
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
