import type { EpisodeConfig } from '../../types';
import { colors, fonts, inputStyle, selectStyle } from '../../theme';
import { PrimaryButton } from '../ui';

const themeList = ['Adventure', 'Friendship', 'Fantasy', 'School life', 'Mystery', 'Comedy', 'Superhero', 'Emotional drama', 'Sci-fi', 'Magical world'];
const durationList = ['30 seconds', '1 minute', '2 minutes', '3 minutes', '5 minutes'];
const audienceOptions = ['Kids (5-9)', 'Tweens (10-13)', 'Teens', 'All ages'];
const moodOptions = ['Wholesome', 'Adventurous', 'Suspenseful', 'Funny', 'Bittersweet'];
const visualStyleOptions = ['Soft pastel anime', 'Vivid shonen', 'Dreamy shojo', 'Retro cel-shaded'];
const languageOptions = ['English', 'Japanese (subtitled)', 'Spanish', 'Hindi', 'French'];

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: active ? 'none' : '1px solid rgba(255,255,255,0.1)',
        cursor: 'pointer',
        padding: '10px 16px',
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 700,
        fontFamily: fonts.display,
        background: active ? 'linear-gradient(135deg,#8B5CF6,#EC4899)' : 'rgba(255,255,255,0.04)',
        color: active ? '#fff' : colors.bodyText2,
      }}
    >
      {label}
    </button>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, marginBottom: 8 }}>{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={selectStyle}>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

export function EpisodeSetup({
  episodeConfig,
  setEpisodeField,
  generateStory,
}: {
  episodeConfig: EpisodeConfig;
  setEpisodeField: <K extends keyof EpisodeConfig>(field: K) => (v: EpisodeConfig[K]) => void;
  generateStory: () => void;
}) {
  return (
    <div data-screen-label="Episode Setup" style={{ maxWidth: 920, margin: '0 auto', padding: '32px 32px 90px' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 26, marginBottom: 6 }}>Choose your episode theme</div>
        <div style={{ fontSize: 14, color: colors.muted }}>Set the shape of your episode before the AI writes the story.</div>
      </div>

      <div style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, marginBottom: 10 }}>Episode theme</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {themeList.map((t) => (
              <Pill key={t} label={t} active={episodeConfig.theme === t} onClick={() => setEpisodeField('theme')(t)} />
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, marginBottom: 10 }}>Episode duration</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {durationList.map((d) => (
              <Pill key={d} label={d} active={episodeConfig.duration === d} onClick={() => setEpisodeField('duration')(d)} />
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Select label="Target audience" value={episodeConfig.audience} onChange={setEpisodeField('audience')} options={audienceOptions} />
          <Select label="Story mood" value={episodeConfig.mood} onChange={setEpisodeField('mood')} options={moodOptions} />
          <Select label="Visual style" value={episodeConfig.visualStyle} onChange={setEpisodeField('visualStyle')} options={visualStyleOptions} />
          <Select label="Language" value={episodeConfig.language} onChange={setEpisodeField('language')} options={languageOptions} />
        </div>

        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, marginBottom: 10 }}>Number of scenes: {episodeConfig.numScenes}</div>
          <input
            type="range"
            min={3}
            max={8}
            value={episodeConfig.numScenes}
            onChange={(e) => setEpisodeField('numScenes')(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#8B5CF6' }}
          />
        </div>

        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.muted, marginBottom: 8 }}>Describe your episode idea</div>
          <textarea
            value={episodeConfig.idea}
            onChange={(e) => setEpisodeField('idea')(e.target.value)}
            rows={3}
            placeholder="Momo gets caught in the rain on the way home and discovers something magical in a puddle..."
            style={{ ...inputStyle, fontSize: 13.5, resize: 'vertical' }}
          />
        </div>

        <PrimaryButton onClick={generateStory} style={{ padding: 15, fontSize: 15, borderRadius: 13 }}>
          Generate story →
        </PrimaryButton>
      </div>
    </div>
  );
}
