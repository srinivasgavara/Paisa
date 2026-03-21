import { formatCurrency } from '../utils/format';

export default function StatCards({ stats, loading }) {
  const cards = [
    {
      label: "Today's Expenses",
      value: loading ? null : formatCurrency(stats?.today?.total),
      sub: loading ? null : `${stats?.today?.count ?? 0} transactions`,
      color: 'var(--blue)',
      bg: 'var(--blue-dim)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: 'Monthly Total',
      value: loading ? null : formatCurrency(stats?.month?.total),
      sub: loading ? null : `${stats?.month?.count ?? 0} expenses`,
      color: 'var(--accent-bright)',
      bg: 'var(--accent-dim)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="18" rx="3" /><path d="M8 12h8M8 16h5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: 'Daily Average',
      value: loading ? null : formatCurrency(stats?.month?.avgDaily),
      sub: 'this month',
      color: 'var(--green)',
      bg: 'var(--green-dim)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <div style={styles.grid}>
      {cards.map((card, i) => (
        <div key={i} style={{ ...styles.card, animationDelay: `${i * 0.1}s` }} className="fade-in">
          <div style={{ ...styles.iconWrap, background: card.bg, color: card.color }}>
            {card.icon}
          </div>
          <div style={styles.cardBody}>
            <div style={styles.cardLabel}>{card.label}</div>
            {loading ? (
              <div className="skeleton" style={{ height: 28, width: 120, marginTop: 6 }} />
            ) : (
              <div style={{ ...styles.cardValue, color: card.color }}>{card.value}</div>
            )}
            <div style={styles.cardSub}>{loading ? '' : card.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    transition: 'border-color 0.2s, transform 0.2s',
    boxShadow: 'var(--shadow-sm)',
    opacity: 0,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardLabel: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' },
  cardValue: { fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 700, marginTop: 4 },
  cardSub: { fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 },
};
