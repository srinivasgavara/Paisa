import { useState } from 'react';
import { formatCurrency, formatDate, CATEGORIES, CATEGORY_COLORS } from '../utils/format';

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Custom', value: 'custom' },
];

export default function ExpenseTable({
  expenses, loading, onEdit, onDelete,
  filter, setFilter, search, setSearch,
  category, setCategory,
  startDate, setStartDate, endDate, setEndDate,
}) {
  const [deleteId, setDeleteId] = useState(null);

  function confirmDelete(id) {
    setDeleteId(id);
  }

  function doDelete() {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  }

  return (
    <div style={styles.wrap}>
      {/* Filters Row */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrap}>
          <svg style={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses..."
            style={styles.searchInput}
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={styles.select}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <div style={styles.filterBtns}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{ ...styles.filterBtn, ...(filter === f.value ? styles.filterBtnActive : {}) }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date range */}
      {filter === 'custom' && (
        <div style={styles.dateRange}>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={styles.dateInput} />
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>to</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={styles.dateInput} />
        </div>
      )}

      {/* Table */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {['Date', 'Category', 'Description', 'Amount', 'Actions'].map((h) => (
                <th key={h} style={{ ...styles.th, ...(h === 'Amount' ? { textAlign: 'right' } : {}), ...(h === 'Actions' ? { textAlign: 'center' } : {}) }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} style={styles.td}>
                      <div className="skeleton" style={{ height: 16, width: j === 2 ? 180 : 80 }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan={5} style={styles.empty}>
                  <div style={styles.emptyContent}>
                    <span style={{ fontSize: 32 }}>💸</span>
                    <div style={{ color: 'var(--text-secondary)' }}>No expenses found</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Add your first expense using the + button</div>
                  </div>
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.id} style={styles.tr}>
                  <td style={styles.td}>{formatDate(exp.date)}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.catBadge,
                      background: `${CATEGORY_COLORS[exp.category] || '#94a3b8'}18`,
                      color: CATEGORY_COLORS[exp.category] || '#94a3b8',
                    }}>
                      {exp.category}
                    </span>
                  </td>
                  <td style={{ ...styles.td, maxWidth: 240 }}>
                    <span style={styles.desc}>{exp.description}</span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formatCurrency(exp.amount)}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <div style={styles.actionBtns}>
                      <button onClick={() => onEdit(exp)} style={styles.editBtn} title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" />
                        </svg>
                      </button>
                      <button onClick={() => confirmDelete(exp.id)} style={styles.deleteBtn} title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" strokeLinecap="round" />
                          <path d="M10 11v6M14 11v6M9 6V4h6v2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && expenses.length > 0 && (
        <div style={styles.footer}>
          {expenses.length} expense{expenses.length !== 1 ? 's' : ''} &nbsp;·&nbsp;
          Total: <strong style={{ color: 'var(--accent-bright)' }}>{formatCurrency(expenses.reduce((s, e) => s + parseFloat(e.amount), 0))}</strong>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div style={styles.confirmOverlay} onClick={() => setDeleteId(null)}>
          <div style={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🗑️</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Delete this expense?</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>This action cannot be undone.</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setDeleteId(null)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={doDelete} style={styles.confirmDeleteBtn}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 16 },
  filterBar: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  searchWrap: {
    position: 'relative',
    flex: '1 1 200px',
    minWidth: 200,
  },
  searchIcon: {
    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
    color: 'var(--text-muted)', pointerEvents: 'none',
  },
  searchInput: {
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
    padding: '9px 12px 9px 38px', fontSize: 14, width: '100%',
    colorScheme: 'dark',
  },
  select: {
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)',
    padding: '9px 14px', fontSize: 14, colorScheme: 'dark',
  },
  filterBtns: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  filterBtn: {
    padding: '8px 14px', borderRadius: 'var(--radius-md)',
    background: 'var(--bg-input)', color: 'var(--text-muted)',
    fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
  },
  filterBtnActive: {
    background: 'var(--accent-dim)', color: 'var(--accent-bright)',
    border: '1px solid var(--accent)',
  },
  dateRange: { display: 'flex', alignItems: 'center', gap: 10 },
  dateInput: {
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
    padding: '8px 12px', fontSize: 13, colorScheme: 'dark',
  },
  tableWrap: { overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 600 },
  th: {
    padding: '12px 16px', textAlign: 'left',
    fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em',
    color: 'var(--text-muted)', background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border)',
  },
  td: {
    padding: '13px 16px', fontSize: 14, color: 'var(--text-secondary)',
    borderBottom: '1px solid var(--border)',
    verticalAlign: 'middle',
  },
  tr: { transition: 'background 0.15s', cursor: 'default' },
  catBadge: {
    display: 'inline-block', padding: '3px 10px', borderRadius: 20,
    fontSize: 12, fontWeight: 600,
  },
  desc: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: 240 },
  actionBtns: { display: 'flex', gap: 6, justifyContent: 'center' },
  editBtn: {
    background: 'var(--blue-dim)', color: 'var(--blue)',
    padding: '6px 8px', borderRadius: 8,
    display: 'flex', alignItems: 'center',
  },
  deleteBtn: {
    background: 'var(--red-dim)', color: 'var(--red)',
    padding: '6px 8px', borderRadius: 8,
    display: 'flex', alignItems: 'center',
  },
  empty: { padding: '48px 16px', textAlign: 'center' },
  emptyContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  footer: { fontSize: 13, color: 'var(--text-muted)', textAlign: 'right', paddingRight: 4 },
  confirmOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
    backdropFilter: 'blur(4px)',
  },
  confirmBox: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)', padding: '32px 28px',
    textAlign: 'center', maxWidth: 320, width: '100%',
    boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.2s ease',
  },
  cancelBtn: {
    padding: '9px 20px', borderRadius: 'var(--radius-md)',
    background: 'var(--bg-input)', color: 'var(--text-secondary)', fontSize: 14,
  },
  confirmDeleteBtn: {
    padding: '9px 20px', borderRadius: 'var(--radius-md)',
    background: 'var(--red)', color: 'white', fontSize: 14, fontWeight: 600,
  },
};
