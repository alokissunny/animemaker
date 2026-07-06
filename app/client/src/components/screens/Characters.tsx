import type { CharacterDraft, Character } from '../../types';
import { colors, fonts, inputStyle, labelStyle, selectStyle } from '../../theme';
import { dataUri } from '../../api';
import { ErrorBanner, PrimaryButton, SecondaryButton, ShimmerOverlay } from '../ui';

const ageGroupOptions = ['Toddler (2-4)', 'Preschool (3-5)', 'Kid (6-9)', 'Adult (parent/caregiver)'];
const genderOptions = ['Girl', 'Boy', 'Non-binary'];
const personalityOptions = ['Cheerful', 'Brave', 'Shy', 'Mischievous', 'Wise', 'Silly'];
const animeStyleOptions = ['Storybook 2D (Peppa Pig style)', 'Preschool 3D (Cocomelon style)', 'Claymation', 'Simple flat cartoon'];
const hairStyleOptions = ['Twin tails', 'Short bob', 'Long straight', 'Spiky', 'Ponytail'];
const outfitStyleOptions = ['Everyday casual', 'School uniform', 'Pajamas', 'Superhero suit', 'Traditional wear'];
const roleOptions = ['Main Character', 'Sibling', 'Friend', 'Parent', 'Teacher'];
const hairColorSwatches = ['#2B2B33', '#7B4B2A', '#E85D9E', '#F5D76E', '#4F8CFF', '#EEEEF0'];
const eyeColorSwatches = ['#4F8CFF', '#34D399', '#8B5CF6', '#7B4B2A', '#2B2B33', '#EC4899'];

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={selectStyle}>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function SwatchRow({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (hex: string) => void }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 4 }}>
        {options.map((hex) => (
          <div
            key={hex}
            onClick={() => onChange(hex)}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: hex,
              cursor: 'pointer',
              border: value === hex ? '2px solid #fff' : '2px solid transparent',
              boxShadow: value === hex ? '0 0 0 2px #8B5CF6' : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function Characters({
  charTab,
  setCharTab,
  draft,
  setDraftField,
  setDraftRole,
  charGenStatus,
  charGenError,
  charGenResult,
  generateCharacter,
  saveCharacter,
  characters,
  continueToEpisodeSetup,
}: {
  charTab: 'create' | 'gallery';
  setCharTab: (t: 'create' | 'gallery') => void;
  draft: CharacterDraft;
  setDraftField: (field: keyof CharacterDraft) => (v: string) => void;
  setDraftRole: (role: string) => void;
  charGenStatus: 'idle' | 'generating' | 'ready' | 'error';
  charGenError: string | null;
  charGenResult: { bio: string; imageBase64: string; mimeType: string } | null;
  generateCharacter: () => void;
  saveCharacter: () => void;
  characters: Character[];
  continueToEpisodeSetup: () => void;
}) {
  const hasPreview = charGenStatus === 'ready' && !!charGenResult;
  const isGenerating = charGenStatus === 'generating';
  const saveDisabled = !hasPreview || !draft.name.trim();
  const previewInitial = (draft.name || '?').trim().charAt(0).toUpperCase() || '?';

  return (
    <div data-screen-label="Character Creation" style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 32px 90px' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 26, marginBottom: 6 }}>Create your show's cast</div>
        <div style={{ fontSize: 14, color: colors.muted }}>Design each character, then finalize your cast before moving on.</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 26, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        <button onClick={() => setCharTab('create')} style={{ border: 'none', cursor: 'pointer', padding: '10px 20px', borderRadius: 9, fontFamily: fonts.display, fontWeight: 700, fontSize: 13.5, background: charTab === 'create' ? '#8B5CF6' : 'transparent', color: charTab === 'create' ? '#fff' : colors.muted }}>
          Create character
        </button>
        <button onClick={() => setCharTab('gallery')} style={{ border: 'none', cursor: 'pointer', padding: '10px 20px', borderRadius: 9, fontFamily: fonts.display, fontWeight: 700, fontSize: 13.5, background: charTab === 'gallery' ? '#8B5CF6' : 'transparent', color: charTab === 'gallery' ? '#fff' : colors.muted }}>
          My cast ({characters.length})
        </button>
      </div>

      {charTab === 'create' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 24, alignItems: 'start' }}>
          <div style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <div style={labelStyle}>Character name</div>
                <input value={draft.name} onChange={(e) => setDraftField('name')(e.target.value)} placeholder="e.g. Momo" style={inputStyle} />
              </div>
              <Select label="Age group" value={draft.ageGroup} onChange={setDraftField('ageGroup')} options={ageGroupOptions} />
              <Select label="Gender" value={draft.gender} onChange={setDraftField('gender')} options={genderOptions} />
              <Select label="Personality" value={draft.personality} onChange={setDraftField('personality')} options={personalityOptions} />
              <Select label="Character style" value={draft.animeStyle} onChange={setDraftField('animeStyle')} options={animeStyleOptions} />
              <Select label="Hair style" value={draft.hairStyle} onChange={setDraftField('hairStyle')} options={hairStyleOptions} />
              <SwatchRow label="Hair color" value={draft.hairColor} options={hairColorSwatches} onChange={setDraftField('hairColor')} />
              <SwatchRow label="Eye color" value={draft.eyeColor} options={eyeColorSwatches} onChange={setDraftField('eyeColor')} />
              <Select label="Outfit style" value={draft.outfitStyle} onChange={setDraftField('outfitStyle')} options={outfitStyleOptions} />

              <div style={{ gridColumn: '1/-1' }}>
                <div style={labelStyle}>Role in story</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {roleOptions.map((r) => (
                    <button
                      key={r}
                      onClick={() => setDraftRole(r)}
                      style={{
                        border: draft.role === r ? 'none' : '1px solid rgba(255,255,255,0.12)',
                        cursor: 'pointer',
                        padding: '9px 16px',
                        borderRadius: 999,
                        fontSize: 12.5,
                        fontWeight: 700,
                        fontFamily: fonts.display,
                        background: draft.role === r ? 'linear-gradient(135deg,#8B5CF6,#EC4899)' : 'rgba(255,255,255,0.05)',
                        color: draft.role === r ? '#fff' : colors.bodyText2,
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <div style={labelStyle}>Character description prompt</div>
                <textarea
                  value={draft.prompt}
                  onChange={(e) => setDraftField('prompt')(e.target.value)}
                  placeholder="A cheerful piglet who loves puddles and never stops giggling..."
                  rows={3}
                  style={{ ...inputStyle, fontSize: 13.5, resize: 'vertical' }}
                />
              </div>
            </div>

            {charGenStatus === 'error' && charGenError && (
              <div style={{ marginTop: 16 }}>
                <ErrorBanner message={charGenError} onRetry={generateCharacter} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
              <PrimaryButton onClick={generateCharacter} disabled={isGenerating || !draft.name.trim()} style={{ flex: 1, padding: 14 }}>
                {isGenerating ? 'Generating…' : hasPreview ? 'Regenerate character' : 'Generate character'}
              </PrimaryButton>
              {hasPreview && (
                <SecondaryButton onClick={generateCharacter} style={{ padding: '14px 20px' }}>
                  Regenerate
                </SecondaryButton>
              )}
            </div>
          </div>

          <div style={{ position: 'sticky', top: 96 }}>
            <div style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 22, textAlign: 'center' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: colors.muted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 14 }}>AI character preview</div>
              <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 16, background: 'linear-gradient(135deg,#8B5CF6CC,#4F8CFFCC)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {isGenerating && (
                  <>
                    <ShimmerOverlay />
                    <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 13, color: '#fff' }}>Generating character…</div>
                  </>
                )}
                {hasPreview && charGenResult && (
                  <img
                    src={dataUri(charGenResult.imageBase64, charGenResult.mimeType)}
                    alt={draft.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
                {!isGenerating && !hasPreview && (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', padding: '0 20px' }}>
                    {previewInitial === '?' ? 'Fill in the details and generate to preview your character' : `Fill in the details and generate to preview ${draft.name}`}
                  </div>
                )}
              </div>
              <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{draft.name}</div>
              <div style={{ fontSize: 12, color: colors.muted, marginBottom: 18 }}>
                {hasPreview && charGenResult ? charGenResult.bio : 'No preview yet'}
              </div>
              <PrimaryButton onClick={saveCharacter} disabled={saveDisabled} fullWidth style={{ padding: 13 }}>
                Save character
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {charTab === 'gallery' && (
        <>
          {characters.length > 0 ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 18, marginBottom: 32 }}>
                {characters.map((ch) => (
                  <div key={ch.id} style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden' }}>
                    <div style={{ height: 150, position: 'relative' }}>
                      <img src={dataUri(ch.imageBase64, ch.mimeType)} alt={ch.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: 9, right: 9, padding: '4px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700, fontFamily: fonts.display, background: 'rgba(52,211,153,0.2)', color: colors.greenText }}>
                        Finalized
                      </div>
                    </div>
                    <div style={{ padding: '14px 16px 16px' }}>
                      <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 14.5, marginBottom: 2 }}>{ch.name}</div>
                      <div style={{ fontSize: 11.5, color: colors.muted }}>{ch.role} · {ch.animeStyle}</div>
                    </div>
                  </div>
                ))}
              </div>
              <PrimaryButton onClick={continueToEpisodeSetup} style={{ padding: '15px 30px', fontSize: 15 }}>
                Continue to Episode Setup →
              </PrimaryButton>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '70px 20px', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 18 }}>
              <div style={{ fontSize: 15, color: colors.muted, marginBottom: 16 }}>No finalized characters yet.</div>
              <PrimaryButton onClick={() => setCharTab('create')} style={{ padding: '12px 22px', fontSize: 13.5 }}>
                Create your first character
              </PrimaryButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}
