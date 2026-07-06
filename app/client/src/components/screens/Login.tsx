import { useState } from 'react';
import { fonts } from '../../theme';
import { ApiRequestError, loginApi } from '../../api';

export function Login({
  authTab,
  setAuthTab,
  onSubmit,
}: {
  authTab: 'login' | 'signup';
  setAuthTab: (tab: 'login' | 'signup') => void;
  onSubmit: () => void;
}) {
  const isLogin = authTab === 'login';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isLogin) {
      onSubmit();
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await loginApi(email, password);
      onSubmit();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Log in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-screen-label="Login" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 400, background: 'linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 22, padding: 36 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4 }}>
          <button
            onClick={() => setAuthTab('login')}
            style={{ flex: 1, border: 'none', cursor: 'pointer', padding: 10, borderRadius: 9, fontFamily: fonts.display, fontWeight: 700, fontSize: 13.5, background: isLogin ? '#8B5CF6' : 'transparent', color: isLogin ? '#fff' : '#9C99B4' }}
          >
            Log in
          </button>
          <button
            onClick={() => setAuthTab('signup')}
            style={{ flex: 1, border: 'none', cursor: 'pointer', padding: 10, borderRadius: 9, fontFamily: fonts.display, fontWeight: 700, fontSize: 13.5, background: !isLogin ? '#8B5CF6' : 'transparent', color: !isLogin ? '#fff' : '#9C99B4' }}
          >
            Sign up
          </button>
        </div>
        <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 20, marginBottom: 6 }}>{isLogin ? 'Welcome back' : 'Start your studio'}</div>
        <div style={{ fontSize: 13, color: '#9C99B4', marginBottom: 24 }}>
          {isLogin ? 'Log in to keep working on your episodes.' : 'Create an account to start your first anime episode.'}
        </div>
        {isLogin && (
          <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', fontSize: 12, color: '#C4B5FD', marginBottom: 18 }}>
            Test credential: <strong>demo@nova.app</strong> / <strong>anime123</strong>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#9C99B4', marginBottom: 6 }}>Email</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@studio.com"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F4FA', fontSize: 14, fontFamily: 'Manrope,sans-serif' }}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#9C99B4', marginBottom: 6 }}>Password</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F4FA', fontSize: 14, fontFamily: 'Manrope,sans-serif' }}
            />
          </div>
          {error && (
            <div style={{ fontSize: 12.5, color: '#F5A8D0', background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: 10, padding: '10px 12px' }}>
              {error}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ marginTop: 6, border: 'none', cursor: isSubmitting ? 'default' : 'pointer', padding: 13, borderRadius: 11, background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', color: '#fff', fontFamily: fonts.display, fontWeight: 700, fontSize: 14.5, boxShadow: '0 8px 24px rgba(139,92,246,0.35)', opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? 'Logging in…' : isLogin ? 'Log in' : 'Create account'}
          </button>
        </div>
      </div>
    </div>
  );
}
