const AGE_GROUP_PHRASES: Record<string, string> = {
  'Toddler (2-4)': 'a toddler, about 2-4 years old, with a round chubby-cheeked face and a stubby, small-proportioned body',
  'Preschool (3-5)': 'a preschooler, about 3-5 years old, short and small-proportioned with a rounded youthful face',
  'Kid (6-9)': 'a young child, about 6-9 years old, with a youthful but slightly less childlike build than a preschooler',
  'Adult (parent/caregiver)': 'a grown adult (parent, teacher, or caregiver figure), with a fully mature adult build',
};

const GENDER_PHRASES: Record<string, string> = {
  Girl: 'a girl',
  Boy: 'a boy',
  'Non-binary': 'an androgynous, non-binary presenting person',
};

const COLOR_NAMES: Record<string, string> = {
  '#2B2B33': 'black',
  '#7B4B2A': 'brown',
  '#E85D9E': 'bubblegum pink',
  '#F5D76E': 'golden blonde',
  '#4F8CFF': 'sky blue',
  '#EEEEF0': 'silvery white',
  '#34D399': 'emerald green',
  '#8B5CF6': 'violet',
  '#EC4899': 'magenta pink',
};

export function ageGroupPhrase(ageGroup: string): string {
  return AGE_GROUP_PHRASES[ageGroup] || ageGroup;
}

export function genderPhrase(gender: string): string {
  return GENDER_PHRASES[gender] || gender;
}

export function colorName(hex: string): string {
  return COLOR_NAMES[hex.toUpperCase()] || COLOR_NAMES[hex] || hex;
}

export interface CharacterVisualFields {
  name: string;
  ageGroup: string;
  gender: string;
  animeStyle?: string;
  hairStyle?: string;
  hairColor?: string;
  eyeColor?: string;
  outfitStyle?: string;
  role?: string;
}

/**
 * A deterministic, non-negotiable visual descriptor built directly from the
 * structured form fields — used to anchor age/gender/appearance in image
 * prompts regardless of how the LLM chooses to phrase things.
 */
export function buildCharacterDescriptor(c: CharacterVisualFields): string {
  const parts = [
    `${c.name} is ${genderPhrase(c.gender)} who is ${ageGroupPhrase(c.ageGroup)}.`,
    `Draw ${c.name} at exactly this age and body proportions — do not depict them as older or more adult than specified.`,
  ];
  if (c.animeStyle) parts.push(`Art style: ${c.animeStyle}, in the visual style of a kids' animated YouTube show — simple shapes, bright flat colors, friendly rounded designs, no violence or scary elements.`);
  if (c.hairStyle || c.hairColor) {
    parts.push(`Hair: ${c.hairStyle || 'styled'}${c.hairColor ? `, ${colorName(c.hairColor)} colored` : ''}.`);
  }
  if (c.eyeColor) parts.push(`Eyes: ${colorName(c.eyeColor)}.`);
  if (c.outfitStyle) parts.push(`Outfit: ${c.outfitStyle}.`);
  if (c.role) parts.push(`Story role: ${c.role}.`);
  return parts.join(' ');
}
