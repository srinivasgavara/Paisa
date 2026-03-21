import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

import Sidebar from '../components/Sidebar';
import StatCards from '../components/StatCards';
import TodayPanel from '../components/TodayPanel';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseModal from '../components/ExpenseModal';
import FloatingAddButton from '../components/FloatingAddButton';
import { DailyBarChart, TrendLineChart, CategoryPieChart } from '../components/Charts';

export default function Dashboard() {
  const { token } = useAuth();

  // Data states
  const [stats, setStats] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [expLoading, setExpLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy] = useState('date');
  const [sortOrder] = useState('DESC');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Active section for sidebar
  const [activeSection, setActiveSection] = useState('overview');

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await api.getDashboard(token);
      setStats(data);
    } catch (err) {
      toast.error('Failed to load stats');
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  // Fetch expenses with filters
  const fetchExpenses = useCallback(async () => {
    setExpLoading(true);
    try {
      const params = { search, filter, category, startDate, endDate, sortBy, sortOrder };
      const data = await api.getExpenses(token, params);
      setExpenses(data);
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setExpLoading(false);
    }
  }, [token, search, filter, category, startDate, endDate, sortBy, sortOrder]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => {
    const t = setTimeout(fetchExpenses, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchExpenses, search]);

  // Scroll spy
  useEffect(() => {
    const sections = ['overview', 'expenses', 'analytics', 'export'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -50% 0px' }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  async function handleSave(formData) {
    try {
      if (editData) {
        await api.updateExpense(token, editData.id, formData);
        toast.success('Expense updated');
      } else {
        await api.addExpense(token, formData);
        toast.success('Expense added');
      }
      setModalOpen(false);
      setEditData(null);
      fetchExpenses();
      fetchStats();
    } catch (err) {
      toast.error(err.message || 'Failed to save expense');
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteExpense(token, id);
      toast.success('Expense deleted');
      fetchExpenses();
      fetchStats();
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  }

  function handleEdit(exp) {
    setEditData(exp);
    setModalOpen(true);
  }

  async function handleExport() {
    try {
      toast.loading('Preparing Excel file...');
      const blob = await api.exportExpenses(token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success('Excel file downloaded!');
    } catch (err) {
      toast.dismiss();
      toast.error('Export failed');
    }
  }

  return (
    <div style={styles.layout}>
      <Sidebar activeSection={activeSection} />

      <main style={styles.main}>
        {/* ── OVERVIEW ─────────────────────────────────── */}
        <section id="overview" style={styles.section}>
          <SectionHeader label="Overview" sub={`${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`} />
          <StatCards stats={stats} loading={statsLoading} />
          <TodayPanel data={stats?.today} loading={statsLoading} />
        </section>

        <Divider />

        {/* ── EXPENSES ─────────────────────────────────── */}
        <section id="expenses" style={styles.section}>
          <SectionHeader label="Expenses" sub="All your transactions" />
          <ExpenseTable
            expenses={expenses}
            loading={expLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            filter={filter} setFilter={setFilter}
            search={search} setSearch={setSearch}
            category={category} setCategory={setCategory}
            startDate={startDate} setStartDate={setStartDate}
            endDate={endDate} setEndDate={setEndDate}
          />
        </section>

        <Divider />

        {/* ── ANALYTICS ────────────────────────────────── */}
        <section id="analytics" style={styles.section}>
          <SectionHeader label="Analytics" sub="Spending insights" />
          <div style={styles.chartsGrid}>
            <ChartCard title="Daily Spending" sub="This month's daily breakdown">
              <DailyBarChart data={stats?.charts?.daily} />
            </ChartCard>
            <ChartCard title="Monthly Trend" sub="Last 6 months">
              <TrendLineChart data={stats?.charts?.trend} />
            </ChartCard>
            <ChartCard title="By Category" sub="Spending distribution this month" wide>
              <CategoryPieChart data={stats?.charts?.categories} />
            </ChartCard>
          </div>
        </section>

        <Divider />

        {/* ── EXPORT ───────────────────────────────────── */}
        <section id="export" style={styles.section}>
          <SectionHeader label="Export" sub="Download your data" />
          <div style={styles.exportCard}>
            <div style={styles.exportIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" />
                <polyline points="14 2 14 8 20 8" strokeLinecap="round" />
                <line x1="12" y1="11" x2="12" y2="17" strokeLinecap="round" />
                <polyline points="9 14 12 17 15 14" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div style={styles.exportTitle}>Export to Excel</div>
              <div style={styles.exportSub}>Download all your expenses as a .xlsx file with columns: Date, Category, Description, Amount.</div>
            </div>
            <button onClick={handleExport} style={styles.exportBtn}>
              Download Excel
            </button>
          </div>
        </section>

        <div style={{ height: 80 }} />
      </main>

      <FloatingAddButton onClick={() => { setEditData(null); setModalOpen(true); }} />

      <ExpenseModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={handleSave}
        editData={editData}
      />
    </div>
  );
}

function SectionHeader({ label, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</h2>
      {sub && <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{sub}</p>}
    </div>
  );
}

function ChartCard({ title, sub, children, wide }) {
  return (
    <div style={{ ...chartCardStyles.card, ...(wide ? chartCardStyles.wide : {}) }}>
      <div style={chartCardStyles.header}>
        <div style={chartCardStyles.title}>{title}</div>
        {sub && <div style={chartCardStyles.sub}>{sub}</div>}
      </div>
      <div style={{ height: 260, position: 'relative' }}>{children}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />;
}

const chartCardStyles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    boxShadow: 'var(--shadow-sm)',
  },
  wide: { gridColumn: '1 / -1' },
  header: { marginBottom: 16 },
  title: { fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' },
  sub: { fontSize: 12, color: 'var(--text-muted)', marginTop: 2 },
};

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
  },
  main: {
    flex: 1,
    padding: '32px 28px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 32,
    minWidth: 0,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 16,
  },
  exportCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
    boxShadow: 'var(--shadow-sm)',
  },
  exportIcon: {
    width: 56,
    height: 56,
    borderRadius: 'var(--radius-md)',
    background: 'var(--green-dim)',
    color: 'var(--green)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  exportTitle: { fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' },
  exportSub: { fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, maxWidth: 400 },
  exportBtn: {
    marginLeft: 'auto',
    padding: '11px 24px',
    borderRadius: 'var(--radius-md)',
    background: 'linear-gradient(135deg, var(--green), #16a34a)',
    color: 'white',
    fontSize: 14,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 16px rgba(74,222,128,0.2)',
  },
};
