import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: '⬡' },
  { id: 'expenses', label: 'Expenses', icon: '⊞' },
  { id: 'analytics', label: 'Analytics', icon: '◈' },
  { id: 'export', label: 'Export', icon: '↗' },
];

export default function Sidebar({ activeSection }) {
  const { user, logout } = useAuth();

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12M10 4v12" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <span style={styles.brandName}>Paisa</span>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              style={{ ...styles.navItem, ...(active ? styles.navItemActive : {}) }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
              {active && <div style={styles.activePill} />}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div style={styles.userSection}>
        <div style={styles.userInfo}>
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} style={styles.avatar} referrerPolicy="no-referrer" />
          ) : (
            <div style={styles.avatarFallback}>{user?.name?.[0]}</div>
          )}
          <div style={styles.userText}>
            <div style={styles.userName}>{user?.name?.split(' ')[0]}</div>
            <div style={styles.userEmail}>{user?.email}</div>
          </div>
        </div>
        <button onClick={logout} style={styles.logoutBtn} title="Sign out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 220,
    minWidth: 220,
    background: 'var(--bg-surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 36,
    paddingLeft: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    background: 'linear-gradient(135deg, var(--accent), #5b21b6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-accent)',
  },
  brandName: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 18,
    color: 'var(--text-primary)',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 'var(--radius-md)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.2s ease',
    position: 'relative',
    textAlign: 'left',
    width: '100%',
  },
  navItemActive: {
    background: 'var(--accent-dim)',
    color: 'var(--accent-bright)',
  },
  navIcon: {
    fontSize: 16,
    width: 20,
    textAlign: 'center',
  },
  activePill: {
    position: 'absolute',
    right: 10,
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--accent)',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 8px',
    borderTop: '1px solid var(--border)',
    marginTop: 16,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    flexShrink: 0,
  },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'var(--accent-dim)',
    color: 'var(--accent-bright)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 600,
    flexShrink: 0,
  },
  userText: {
    minWidth: 0,
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userEmail: {
    fontSize: 11,
    color: 'var(--text-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoutBtn: {
    background: 'transparent',
    color: 'var(--text-muted)',
    padding: 6,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s',
    flexShrink: 0,
  },
};
