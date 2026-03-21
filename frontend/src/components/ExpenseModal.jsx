import { useState, useEffect } from 'react';
import { CATEGORIES } from '../utils/format';
import { today } from '../utils/format';

export default function ExpenseModal({ open, onClose, onSave, editData }) {
  const [form, setForm] = useState({ date: today(), category: 'Food', description: '', amount: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        date: editData.date?.split('T')[0] || today(),
        category: editData.category || 'Food',
        description: editData.description || '',
        amount: editData.amount || '',
      });
    } else {
      setForm({ date: today(), category: 'Food', description: '', amount: '' });
    }
  }, [editData, open]);

  if (!open) return null;

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.date || !form.category || !form.description || !form.amount) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>{editData ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Category</label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                style={styles.input}
                required
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="What did you spend on?"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Amount (₹)</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              style={{ ...styles.input, fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 600 }}
              required
            />
          </div>

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={saving} style={styles.saveBtn}>
              {saving ? 'Saving...' : editData ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 16,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    padding: '28px 28px',
    width: '100%',
    maxWidth: 480,
    boxShadow: 'var(--shadow-lg)',
    animation: 'fadeIn 0.2s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  closeBtn: {
    background: 'var(--bg-input)',
    color: 'var(--text-secondary)',
    width: 32,
    height: 32,
    borderRadius: 8,
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: {
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    padding: '10px 14px',
    fontSize: 14,
    transition: 'border-color 0.2s',
    width: '100%',
    colorScheme: 'dark',
  },
  actions: { display: 'flex', gap: 10, marginTop: 8, justifyContent: 'flex-end' },
  cancelBtn: {
    padding: '10px 20px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-input)',
    color: 'var(--text-secondary)',
    fontSize: 14,
    fontWeight: 500,
  },
  saveBtn: {
    padding: '10px 24px',
    borderRadius: 'var(--radius-md)',
    background: 'linear-gradient(135deg, var(--accent), #5b21b6)',
    color: 'white',
    fontSize: 14,
    fontWeight: 600,
    boxShadow: 'var(--shadow-accent)',
  },
};
