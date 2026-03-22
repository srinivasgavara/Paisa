import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const googleBtnRef = useRef(null);
  const [popup, setPopup] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  useEffect(() => {
    if (!popup) return;
    const timer = setTimeout(() => {
      if (!window.google || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredential,
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text: popup === 'login' ? 'signin_with' : 'signup_with',
        width: 300,
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [popup]);

  async function handleCredential(response) {
    try {
      const data = await api.googleLogin(response.credential);
      login(data.token, data.user);
      toast.success(`Welcome, ${data.user.name.split(' ')[0]}!`);
    } catch (err) {
      toast.error(err.message || 'Login failed');
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    toast('Please use Google Sign-In to continue', { icon: 'ℹ️' });
  }

  const accent = '#fb923c';
  const navBorder = 'rgba(255,255,255,0.08)';
  const textMain = '#f5f5f0';
  const textSub = '#8888a0';
  const textMuted = '#444458';
  const cardBg = 'rgba(255,255,255,0.05)';
  const cardBorder = 'rgba(255,255,255,0.08)';
  const inputBg = 'rgba(255,255,255,0.06)';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 50%, #1a1a6e 0%, #0a0a1a 55%, #0d0d0d 100%)',
      fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
      color: textMain,
    }}>

      {/* ══ NAVBAR ══ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,26,0.85)',
        borderBottom: `1px solid ${navBorder}`,
        backdropFilter: 'blur(16px)',
        padding: '0 48px', height: 60,
        display: 'flex', alignItems: 'center',
      }}>
        {/* Logo */}
        <div style={{ flex: 1 }}>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800, fontSize: 24,
            color: '#ffffff', letterSpacing: '-0.03em',
          }}>Paisa</span>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setPopup('login')}
            style={{
              padding: '8px 22px', borderRadius: 10,
              border: `1.5px solid ${navBorder}`,
              background: 'transparent', color: textMain,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >Log In</button>

          <button
            onClick={() => setPopup('signup')}
            style={{
              padding: '8px 22px', borderRadius: 10,
              border: 'none', background: accent,
              color: 'white', fontSize: 14, fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 12px rgba(249,115,22,0.35)',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >Sign Up</button>
        </div>
      </nav>

      {/* ══ HERO SECTION ══ */}
      <section style={{ maxWidth: 1100, padding: '90px 48px 60px' }}>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 72, fontWeight: 800,
          lineHeight: 1.08, color: '#ffffff',
          marginBottom: 20, maxWidth: 700,
          letterSpacing: '-0.04em',
        }}>
          Track every<br />
          <span style={{ color: accent }}>rupee.</span>
        </h1>

        {/* Subtext */}
        <p style={{
          fontSize: 18, color: textSub,
          lineHeight: 1.7, maxWidth: 480, marginBottom: 36,
        }}>
        Paisa is a simple expense tracking tool that helps users monitor their spending and build better financial habits over time.
        </p>

        {/* CTA */}
        <div style={{ marginBottom: 64 }}>
          <button
            onClick={() => setPopup('signup')}
            style={{
              padding: '14px 36px', borderRadius: 12,
              background: accent, color: 'white',
              border: 'none', fontSize: 15, fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >Get Started Free →</button>
        </div>

        {/* ── DASHBOARD PREVIEW ── */}
        <div style={{
          borderRadius: 20, overflow: 'hidden',
          border: '1px solid rgba(99,99,255,0.2)',
          boxShadow: '0 24px 80px rgba(30,30,150,0.3), 0 0 0 1px rgba(99,99,255,0.1)',
          background: 'rgba(255,255,255,0.03)',
        }}>
          {/* Browser bar */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 6,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
<div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
  <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', lineHeight: 1 }}>─</span>
  </div>
  <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', lineHeight: 1 }}>□</span>
  </div>
  <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', lineHeight: 1 }}>✕</span>
  </div>
</div>
            <div style={{
              flex: 1, background: 'rgba(255,255,255,0.05)',
              borderRadius: 6, padding: '4px 12px',
              marginLeft: 8, fontSize: 11, color: textMuted,
            }}>paisa.app/dashboard</div>
          </div>

          {/* Dashboard mockup */}
          <div style={{ display: 'flex', height: 380 }}>
            {/* Sidebar */}
            <div style={{
              width: 180,
              background: 'rgba(0,0,0,0.4)',
              padding: '20px 14px',
              display: 'flex', flexDirection: 'column', gap: 4,
              borderRight: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
                <span style={{ color: 'white', fontWeight: 800, fontSize: 14, fontFamily: "'Space Grotesk', sans-serif" }}>Paisa</span>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16, margin: '0 auto 8px' }}>A</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600, textAlign: 'center', marginBottom: 16 }}>YOUR NAME</div>
              {['DASHBOARD', 'EXPENSES', 'ANALYTICS', 'REPORTS'].map((item, i) => (
                <div key={item} style={{ padding: '8px 10px', borderRadius: 8, background: i === 0 ? 'rgba(249,115,22,0.15)' : 'transparent', color: i === 0 ? accent : 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>{item}</div>
              ))}
              <div style={{ marginTop: 'auto', padding: '10px', borderRadius: 10, background: accent, color: 'white', fontSize: 11, fontWeight: 700, textAlign: 'center' }}>+ Add Expense</div>
            </div>

            {/* Main */}
            <div style={{ flex: 1, padding: '20px', background: 'rgba(10,10,26,0.6)', overflowY: 'hidden' }}>
              {/* Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
                {[
                  { label: "Today's Expense", value: '₹430', bg: accent, icon: '💸' },
                  { label: 'Monthly Total', value: '₹12,340', bg: 'rgba(30,30,100,0.8)', icon: '📅' },
                  { label: 'Daily Average', value: '₹824', bg: 'rgba(255,255,255,0.06)', icon: '📈' },
                ].map((card) => (
                  <div key={card.label} style={{ borderRadius: 12, padding: '14px', background: card.bg, color: 'white', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: 9, fontWeight: 600, opacity: 0.6, marginBottom: 4 }}>{card.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>{card.value}</div>
                    <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 22, opacity: 0.2 }}>{card.icon}</div>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: textMain, marginBottom: 10 }}>Recent Expenses</div>
                {[
                  { date: '21 Mar', cat: 'Food', desc: 'Lunch', amt: '₹200', color: '#f87171' },
                  { date: '21 Mar', cat: 'Transport', desc: 'Uber', amt: '₹150', color: '#60a5fa' },
                  { date: '20 Mar', cat: 'Shopping', desc: 'Amazon', amt: '₹1,299', color: '#a78bfa' },
                  { date: '20 Mar', cat: 'Bills', desc: 'Electricity', amt: '₹2,100', color: '#fb923c' },
                ].map((row) => (
                  <div key={row.desc} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 10, color: textMuted, width: 44 }}>{row.date}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: row.color, background: row.color + '18', padding: '2px 7px', borderRadius: 10, width: 64, textAlign: 'center' }}>{row.cat}</span>
                    <span style={{ fontSize: 10, color: textSub, flex: 1, paddingLeft: 10 }}>{row.desc}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: textMain }}>{row.amt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: textMuted, marginTop: 16 }}>↑ Live preview of your Paisa dashboard</p>
      </section>

      {/* ══ FEATURES SECTION ══ */}
      <section style={{ padding: '60px 48px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 800, color: '#ffffff', textAlign: 'center', marginBottom: 8, letterSpacing: '-0.03em' }}>Everything you need</h2>
          <p style={{ fontSize: 15, color: textSub, textAlign: 'center', marginBottom: 48 }}>Simple, powerful, and beautiful</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {[
              { icon: '📊', title: 'Smart Analytics', desc: 'Bar, line and pie charts show exactly where your money goes every month.' },
              { icon: '🔍', title: 'Instant Search', desc: 'Find any expense instantly by description, category, or date range.' },
              { icon: '📥', title: 'Excel Export', desc: 'Download all your expenses as a .xlsx file with one click.' },
              { icon: '🔒', title: 'Private & Secure', desc: 'Sign in with Google — your data is private and only visible to you.' },
            ].map((f) => (
              <div key={f.title} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '24px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 6, fontFamily: "'Space Grotesk', sans-serif" }}>{f.title}</div>
                <div style={{ fontSize: 13, color: textSub, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: 'rgba(0,0,0,0.5)', padding: '48px 48px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: 40, maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
          <div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 18, color: 'white' }}>Paisa</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.8, maxWidth: 240 }}>A simple tool that helps users track their expenses. Free and open to everyone.</p>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Product</div>
            {['Features', 'How It Works', 'Get Started', 'Changelog'].map((item) => (
              <div key={item} style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 12, cursor: 'pointer' }}>{item}</div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Legal</div>
            {['Terms of Service', 'Privacy Policy', 'Cookie Policy'].map((item) => (
              <div key={item} style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 12, cursor: 'pointer' }}>{item}</div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Contact</div>
            {[{ icon: '✉', text: 'support@paisa.app' }, { icon: '📍', text: 'India' }, { icon: '💬', text: 'Open to feedback' }].map((item) => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{item.icon}</div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 0', maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>© 2026 Paisa. Crafted with care.</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Terms', 'Privacy', 'Contact'].map((item) => (
              <span key={item} style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}>{item}</span>
            ))}
          </div>
        </div>
      </footer>

      {/* ══ POPUP MODAL ══ */}
      {popup && (
        <div
          onClick={(e) => e.target === e.currentTarget && setPopup(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
        >
          <div style={{ background: '#0f0f1f', borderRadius: 24, padding: '36px 32px', width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,30,0.8)', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>

            {/* Close */}
            <button onClick={() => setPopup(null)} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: textSub, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

            {/* Logo */}
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 18, color: 'white' }}>Paisa</span>
            </div>

            {/* Title */}
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 4, letterSpacing: '-0.02em' }}>
              {popup === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p style={{ fontSize: 13, color: textSub, marginBottom: 24 }}>
              {popup === 'login' ? 'Sign in to your Paisa account' : 'Join and start tracking your expenses'}
            </p>

            {/* Toggle */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4, marginBottom: 24 }}>
              {['login', 'signup'].map((t) => (
                <button key={t} onClick={() => setPopup(t)} style={{ flex: 1, padding: '9px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, background: popup === t ? 'rgba(255,255,255,0.1)' : 'transparent', color: popup === t ? 'white' : textSub, transition: 'all 0.2s', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {t === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {popup === 'signup' && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'white', display: 'block', marginBottom: 6 }}>Username</label>
                  <input type="text" placeholder="yourname" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: inputBg, color: 'white', fontSize: 14, outline: 'none', colorScheme: 'dark' }} />
                </div>
              )}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'white', display: 'block', marginBottom: 6 }}>Email</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: inputBg, color: 'white', fontSize: 14, outline: 'none', colorScheme: 'dark' }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'white', display: 'block', marginBottom: 6 }}>Password</label>
                <input type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: inputBg, color: 'white', fontSize: 14, outline: 'none', colorScheme: 'dark' }} />
              </div>
              <button type="submit" style={{ width: '100%', padding: '13px', borderRadius: 10, background: accent, color: 'white', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 4, boxShadow: '0 4px 16px rgba(249,115,22,0.35)', fontFamily: "'Space Grotesk', sans-serif" }}>
                {popup === 'login' ? 'Sign In →' : 'Create Account →'}
              </button>
            </form>

            {/* OR */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: 11, color: textSub, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Or continue with</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Google Button */}
            <div ref={googleBtnRef} style={{ display: 'flex', justifyContent: 'center' }} />

          </div>
        </div>
      )}

    </div>
  );
}
