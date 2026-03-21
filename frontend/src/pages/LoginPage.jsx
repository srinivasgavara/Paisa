import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const btnRef = useRef(null);

  useEffect(() => {
    if (!window.google) return;
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredential,
    });
    window.google.accounts.id.renderButton(btnRef.current, {
      theme: 'filled_black',
      size: 'large',
      shape: 'pill',
      text: 'signin_with',
      width: 280,
    });
  }, []);

  async function handleCredential(response) {
    try {
      const data = await api.googleLogin(response.credential);
      login(data.token, data.user);
      toast.success(`Welcome, ${data.user.name.split(' ')[0]}!`);
    } catch (err) {
      toast.error(err.message || 'Login failed');
    }
  }

  return (
    <div style={styles.page}>
      {/* Background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      <div style={styles.card}>
        <div style={styles.logo}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="12" fill="url(#grad)" />
            <path d="M12 20h16M20 12v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="40" y2="40">
                <stop stopColor="#7c6af7" />
                <stop offset="1" stopColor="#5b21b6" />
              </linearGradient>
            </defs>
          </svg>
          <span style={styles.brand}>Spendly</span>
        </div>

        <h1 style={styles.headline}>Track Every Rupee</h1>
        <p style={styles.sub}>
          Your personal finance dashboard — beautiful, private, and always in sync.
        </p>

        <div style={styles.features}>
          {['Smart analytics', 'Instant search', 'Excel export'].map((f) => (
            <div key={f} style={styles.feature}>
              <span style={styles.featureDot} />
              {f}
            </div>
          ))}
        </div>

        <div style={styles.divider} />

        <div ref={btnRef} style={styles.googleBtn} />
        <p style={styles.privacy}>Sign in with your Google account — no passwords, no friction.</p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-base)',
    position: 'relative',
    overflow: 'hidden',
    padding: '24px',
  },
  orb1: {
    position: 'absolute', top: '-20%', right: '-10%',
    width: 600, height: 600, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,106,247,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute', bottom: '-20%', left: '-10%',
    width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb3: {
    position: 'absolute', top: '40%', left: '30%',
    width: 300, height: 300, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(248,113,113,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    padding: '48px 40px',
    maxWidth: 400,
    width: '100%',
    position: 'relative',
    boxShadow: 'var(--shadow-lg)',
    animation: 'fadeIn 0.5s ease forwards',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  brand: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  headline: {
    fontFamily: 'var(--font-display)',
    fontSize: 32,
    fontWeight: 800,
    lineHeight: 1.2,
    color: 'var(--text-primary)',
    marginBottom: 12,
  },
  sub: {
    color: 'var(--text-secondary)',
    fontSize: 15,
    lineHeight: 1.6,
    marginBottom: 24,
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 28,
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    color: 'var(--text-secondary)',
    fontSize: 14,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--accent)',
    flexShrink: 0,
  },
  divider: {
    height: 1,
    background: 'var(--border)',
    marginBottom: 28,
  },
  googleBtn: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 16,
  },
  privacy: {
    textAlign: 'center',
    fontSize: 12,
    color: 'var(--text-muted)',
    lineHeight: 1.5,
  },
};
