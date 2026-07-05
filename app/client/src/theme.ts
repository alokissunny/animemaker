import type React from 'react';

export const colors = {
  bg: '#0A0A12',
  text: '#F5F4FA',
  muted: '#9C99B4',
  mutedDim: '#6B6880',
  bodyText: '#DAD8E8',
  bodyText2: '#C9C6DA',
  violet: '#8B5CF6',
  violetSoft: '#C4B5FD',
  pink: '#EC4899',
  blue: '#4F8CFF',
  blueSoft: '#93B8FF',
  green: '#34D399',
  greenDark: '#10B981',
  greenDeep: '#06251A',
  greenText: '#6EE7B7',
  yellow: '#FCD34D',
  inputBg: '#14131F',
} as const;

export const gradients = {
  accent: 'linear-gradient(135deg,#8B5CF6,#EC4899)',
  cardFill: 'linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))',
  cardFillSoft: 'linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))',
  approve: 'linear-gradient(135deg,#34D399,#10B981)',
};

export const fonts = {
  display: "'Sora', sans-serif",
  body: "'Manrope', sans-serif",
};

export const cardStyle: React.CSSProperties = {
  background: gradients.cardFill,
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 20,
};

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: colors.text,
  fontSize: 14,
  fontFamily: fonts.body,
};

export const selectStyle: React.CSSProperties = {
  ...inputStyle,
  background: colors.inputBg,
};

export const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: colors.muted,
  marginBottom: 6,
};
