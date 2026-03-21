export const CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Entertainment',
  'Health', 'Bills', 'Education', 'Travel', 'Other',
];

export const CATEGORY_COLORS = {
  Food: '#f87171',
  Transport: '#60a5fa',
  Shopping: '#a78bfa',
  Entertainment: '#fbbf24',
  Health: '#4ade80',
  Bills: '#f97316',
  Education: '#38bdf8',
  Travel: '#e879f9',
  Other: '#94a3b8',
};

export function formatCurrency(amount, currency = '₹') {
  return `${currency}${parseFloat(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function today() {
  return new Date().toISOString().split('T')[0];
}
