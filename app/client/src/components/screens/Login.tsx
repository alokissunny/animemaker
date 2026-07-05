import { fonts } from '../../theme';

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#9C99B4', marginBottom: 6 }}>Email</div>
            <input type="email" placeholder="you@studio.com" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F4FA', fontSize: 14, fontFamily: 'Manrope,sans-serif' }} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#9C99B4', marginBottom: 6 }}>Password</div>
            <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F4FA', fontSize: 14, fontFamily: 'Manrope,sans-serif' }} />
          </div>
          <button
            onClick={onSubmit}
            style={{ marginTop: 6, border: 'none', cursor: 'pointer', padding: 13, borderRadius: 11, background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', color: '#fff', fontFamily: fonts.display, fontWeight: 700, fontSize: 14.5, boxShadow: '0 8px 24px rgba(139,92,246,0.35)' }}
          >
            {isLogin ? 'Log in' : 'Create account'}
          </button>
        </div>
      </div>
    </div>
  );
}
