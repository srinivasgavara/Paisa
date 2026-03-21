import { formatCurrency, formatDate, CATEGORY_COLORS } from '../utils/format';

export default function TodayPanel({ data, loading }) {
  const expenses = data?.expenses || [];

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <div style={styles.cardLabel}>Today</div>
          <div style={styles.dateStr}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        {loading ? (
          <div className="skeleton" style={{ height: 32, width: 100 }} />
        ) : (
          <div style={styles.total}>{formatCurrency(data?.total)}</div>
        )}
      </div>

      <div style={styles.list}>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={styles.row}>
              <div className="skeleton" style={{ height: 14, flex: 1 }} />
              <div className="skeleton" style={{ height: 14, width: 70 }} />
            </div>
          ))
        ) : expenses.length === 0 ? (
          <div style={styles.empty}>No expenses today — great job! 🎉</div>
        ) : (
          expenses.map((exp) => (
            <div key={exp.id} style={styles.row}>
              <div style={styles.rowLeft}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: CATEGORY_COLORS[exp.category] || '#94a3b8',
                  display: 'inline-block',
                }} />
                <span style={styles.rowDesc}>{exp.description}</span>
                <span style={styles.rowCat}>{exp.category}</span>
              </div>
              <span style={styles.rowAmount}>{formatCurrency(exp.amount)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    boxShadow: 'var(--shadow-sm)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardLabel: { fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 },
  dateStr: { fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 },
  total: { fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--accent-bright)' },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  row: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 12px', borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-surface)',
  },
  rowLeft: { display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 },
  rowDesc: { fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 },
  rowCat: { fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 },
  rowAmount: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0, marginLeft: 12 },
  empty: { fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' },
};
