import type { CSSProperties, ReactNode } from 'react';
import { colors, fonts, gradients } from '../theme';

export function PrimaryButton({
  children,
  onClick,
  disabled,
  style,
  fullWidth,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
  fullWidth?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        padding: '14px 24px',
        borderRadius: 12,
        background: disabled ? 'rgba(255,255,255,0.06)' : gradients.accent,
        color: disabled ? colors.mutedDim : '#fff',
        fontFamily: fonts.display,
        fontWeight: 700,
        fontSize: 14.5,
        boxShadow: disabled ? 'none' : '0 8px 24px rgba(139,92,246,0.35)',
        width: fullWidth ? '100%' : undefined,
        opacity: disabled ? 0.7 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  disabled,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        border: '1px solid rgba(255,255,255,0.14)',
        cursor: disabled ? 'default' : 'pointer',
        padding: '14px 22px',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.05)',
        color: colors.text,
        fontFamily: fonts.display,
        fontWeight: 700,
        fontSize: 14,
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function ApproveButton({
  approved,
  approvedLabel = '✓ Approved',
  label = 'Approve',
  onClick,
  disabled,
}: {
  approved: boolean;
  approvedLabel?: string;
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        padding: '11px 18px',
        borderRadius: 10,
        background: approved ? 'rgba(52,211,153,0.2)' : gradients.approve,
        color: approved ? colors.greenText : colors.greenDeep,
        fontFamily: fonts.display,
        fontWeight: 700,
        fontSize: 12.5,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {approved ? approvedLabel : label}
    </button>
  );
}

const STATUS_TONES: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'rgba(79,140,255,0.16)', color: colors.blueSoft },
  queued: { bg: 'rgba(79,140,255,0.16)', color: colors.blueSoft },
  generating: { bg: 'rgba(251,191,36,0.16)', color: colors.yellow },
  ready: { bg: 'rgba(79,140,255,0.16)', color: colors.blueSoft },
  approved: { bg: 'rgba(52,211,153,0.18)', color: colors.greenText },
  error: { bg: 'rgba(236,72,153,0.18)', color: '#F5A8D0' },
};

export function StatusBadge({ label, tone }: { label: string; tone: keyof typeof STATUS_TONES }) {
  const t = STATUS_TONES[tone] || STATUS_TONES.pending;
  return (
    <div
      style={{
        padding: '5px 12px',
        borderRadius: 999,
        fontSize: 10.5,
        fontWeight: 700,
        fontFamily: fonts.display,
        background: t.bg,
        color: t.color,
        flexShrink: 0,
      }}
    >
      {label}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      style={{
        background: 'rgba(236,72,153,0.1)',
        border: '1px solid rgba(236,72,153,0.35)',
        borderRadius: 12,
        padding: '14px 16px',
        fontSize: 13,
        color: '#F5A8D0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            border: '1px solid rgba(245,168,208,0.4)',
            background: 'transparent',
            color: '#F5A8D0',
            borderRadius: 8,
            padding: '7px 14px',
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: 12,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function ShimmerOverlay() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'linear-gradient(100deg,transparent 30%,rgba(255,255,255,0.18) 50%,transparent 70%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
      }}
    />
  );
}

export function Spinner({ size = 48 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '3px solid rgba(139,92,246,0.25)',
        borderTopColor: colors.violet,
        margin: '0 auto',
        animation: 'spin 0.9s linear infinite',
      }}
    />
  );
}

export function Modal({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(5,5,10,0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 640 }}>
        {children}
      </div>
    </div>
  );
}
