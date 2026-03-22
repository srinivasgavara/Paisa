import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import ExpenseModal from '../components/ExpenseModal';
import { DailyBarChart, TrendLineChart, CategoryPieChart } from '../components/Charts';
import { formatCurrency, formatDate, CATEGORY_COLORS } from '../utils/format';

const NAV_ITEMS = [
  { id: 'Dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'Expenses', label: 'Expenses', icon: '📋' },
  { id: 'Analytics', label: 'Analytics', icon: '📈' },
  { id: 'Reports', label: 'Reports', icon: '📊' },
];

export default function Dashboard() {
  const { token, user, logout } = useAuth();
  const [activePage, setActivePage] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [expLoading, setExpLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showBell, setShowBell] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calDate, setCalDate] = useState(new Date().toISOString().split('T')[0]);
  const [calExpenses, setCalExpenses] = useState([]);
  const [calLoading, setCalLoading] = useState(false);
  const bellRef = useRef(null);
  const calRef = useRef(null);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try { const data = await api.getDashboard(token); setStats(data); }
    catch { toast.error('Failed to load stats'); }
    finally { setStatsLoading(false); }
  }, [token]);

  const fetchExpenses = useCallback(async () => {
    setExpLoading(true);
    try {
      const data = await api.getExpenses(token, { search, filter, category, startDate, endDate, sortBy: 'date', sortOrder: 'DESC' });
      setExpenses(data);
    } catch { toast.error('Failed to load expenses'); }
    finally { setExpLoading(false); }
  }, [token, search, filter, category, startDate, endDate]);

  const fetchCalExpenses = useCallback(async (date) => {
    setCalLoading(true);
    try { const data = await api.getExpenses(token, { filter: 'custom', startDate: date, endDate: date }); setCalExpenses(data); }
    catch { setCalExpenses([]); }
    finally { setCalLoading(false); }
  }, [token]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { const t = setTimeout(fetchExpenses, search ? 300 : 0); return () => clearTimeout(t); }, [fetchExpenses, search]);
  useEffect(() => { if (showCalendar) fetchCalExpenses(calDate); }, [showCalendar, calDate, fetchCalExpenses]);

  useEffect(() => {
    function handleClick(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowBell(false);
      if (calRef.current && !calRef.current.contains(e.target)) setShowCalendar(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSearch(val) {
    setSearch(val);
    if (val) setActivePage('Expenses');
  }

  async function handleSave(formData) {
    try {
      if (editData) { await api.updateExpense(token, editData.id, formData); toast.success('Updated'); }
      else { await api.addExpense(token, formData); toast.success('Added'); }
      setModalOpen(false); setEditData(null);
      fetchExpenses(); fetchStats();
    } catch (err) { toast.error(err.message || 'Failed'); }
  }

  async function handleDelete(id) {
    try { await api.deleteExpense(token, id); toast.success('Deleted'); setDeleteId(null); fetchExpenses(); fetchStats(); }
    catch { toast.error('Failed to delete'); }
  }

  async function handleExport() {
    try {
      toast.loading('Preparing...');
      const blob = await api.exportExpenses(token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `paisa-${new Date().toISOString().split('T')[0]}.xlsx`; a.click();
      URL.revokeObjectURL(url); toast.dismiss(); toast.success('Downloaded!');
    } catch { toast.dismiss(); toast.error('Export failed'); }
  }

  const firstName = user?.name?.split(' ')[0] || 'User';
  const calTotal = calExpenses.reduce((a, e) => a + parseFloat(e.amount), 0);
  const notifications = stats?.today?.expenses?.slice(0, 5) || [];
  const searchTotal = expenses.reduce((a, e) => a + parseFloat(e.amount), 0);

  return (
    <div style={s.layout}>

      {/* ══ SIDEBAR ══ */}
      <aside style={s.sidebar}>
        <div style={s.logoWrap}>
          <span style={s.logoText}>Paisa</span>
        </div>
        <nav style={s.nav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActivePage(item.id); if (item.id !== 'Expenses') setSearch(''); }}
              style={{ ...s.navItem, ...(activePage === item.id ? s.navItemActive : {}) }}
            >
              <span style={s.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={s.navDivider} />

        <button onClick={logout} style={s.logoutBtn}>
          <span>↗</span><span>Log Out</span>
        </button>
      </aside>

      {/* ══ MAIN ══ */}
      <div style={s.mainWrap}>

        {/* ══ TOPBAR ══ */}
        <header style={s.topbar}>
          <div style={s.greeting}>Hi <span style={s.greetingName}>{firstName}</span></div>

          {/* Search */}
          <div style={s.searchWrap}>
            <span style={s.searchIcon}>🔍</span>
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search expenses..."
              style={s.searchInput}
            />
            {search && (
              <button
                onClick={() => { setSearch(''); }}
                style={s.searchClear}
              >✕</button>
            )}
          </div>

          <div style={s.topRight}>
            {/* Bell */}
            <div ref={bellRef} style={{ position: 'relative' }}>
              <button onClick={() => { setShowBell(!showBell); setShowCalendar(false); }} style={s.iconBtn}>
                🔔
                {notifications.length > 0 && <div style={s.notifBadge}>{notifications.length}</div>}
              </button>
              {showBell && (
                <div style={s.popup}>
                  <div style={s.popupHeader}>
                    <span style={s.popupTitle}>Today's Activity</span>
                    <span style={s.popupSub}>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</span>
                  </div>
                  {notifications.length === 0
                    ? <div style={s.popupEmpty}>No expenses today 🎉</div>
                    : <>
                        {notifications.map((exp) => (
                          <div key={exp.id} style={s.notifRow}>
                            <div style={{ ...s.notifDot, background: CATEGORY_COLORS[exp.category] || '#94a3b8' }} />
                            <div style={{ flex: 1 }}>
                              <div style={s.notifDesc}>{exp.description}</div>
                              <div style={s.notifCat}>{exp.category}</div>
                            </div>
                            <div style={s.notifAmt}>{formatCurrency(exp.amount)}</div>
                          </div>
                        ))}
                        <div style={s.popupFooter}>
                          Total today: <span style={{ color: '#06b6d4', fontWeight: 700 }}>{formatCurrency(stats?.today?.total)}</span>
                        </div>
                      </>
                  }
                </div>
              )}
            </div>

            {/* Calendar */}
            <div ref={calRef} style={{ position: 'relative' }}>
              <button onClick={() => { setShowCalendar(!showCalendar); setShowBell(false); }} style={s.iconBtn}>📅</button>
              {showCalendar && (
                <div style={{ ...s.popup, width: 300 }}>
                  <div style={s.popupHeader}>
                    <span style={s.popupTitle}>Expense Lookup</span>
                    <span style={s.popupSub}>Pick any date</span>
                  </div>
                  <div style={{ padding: '12px 16px 0' }}>
                    <input type="date" value={calDate} onChange={(e) => setCalDate(e.target.value)} style={s.datePicker} />
                  </div>
                  <div style={{ padding: '12px 16px' }}>
                    {calLoading ? (
                      <div style={s.popupEmpty}>Loading...</div>
                    ) : calExpenses.length === 0 ? (
                      <div style={s.popupEmpty}>No expenses on this date 😊</div>
                    ) : (
                      <>
                        <div style={{ fontSize: 11, color: '#8888aa', marginBottom: 8 }}>
                          {calExpenses.length} expense{calExpenses.length !== 1 ? 's' : ''} on {new Date(calDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                          {calExpenses.map((exp) => (
                            <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1a1a2a' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[exp.category] || '#94a3b8', flexShrink: 0 }} />
                                <div>
                                  <div style={s.notifDesc}>{exp.description}</div>
                                  <div style={s.notifCat}>{exp.category}</div>
                                </div>
                              </div>
                              <div style={s.notifAmt}>{formatCurrency(exp.amount)}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ ...s.popupFooter, marginTop: 8 }}>
                          Total: <span style={{ color: '#06b6d4', fontWeight: 700 }}>{formatCurrency(calTotal)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {user?.avatar
              ? <img src={user.avatar} alt={user.name} style={s.avatar} referrerPolicy="no-referrer" />
              : <div style={s.avatarFallback}>{user?.name?.[0]}</div>
            }
          </div>
        </header>

        {/* ══ PAGES ══ */}
        <main style={s.main}>

          {/* ── DASHBOARD PAGE ── */}
          {activePage === 'Dashboard' && (
            <div style={s.page}>
              <div style={s.pageHeader}>
                <h2 style={s.pageTitle}>Dashboard</h2>
                <span style={s.pageDate}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div style={s.statsRow}>
                {[
                  { label: "Today's Expenses", value: statsLoading ? '...' : formatCurrency(stats?.today?.total), sub: `${stats?.today?.count ?? 0} transactions`, gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' },
                  { label: 'Monthly Total', value: statsLoading ? '...' : formatCurrency(stats?.month?.total), sub: `${stats?.month?.count ?? 0} expenses`, gradient: 'linear-gradient(135deg, #d946ef, #a855f7)' },
                  { label: 'Daily Average', value: statsLoading ? '...' : formatCurrency(stats?.month?.avgDaily), sub: 'this month', gradient: 'linear-gradient(135deg, #f97316, #fb923c)' },
                  { label: 'Total Records', value: statsLoading ? '...' : expenses.length, sub: 'all time', gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
                ].map((card) => (
                  <div key={card.label} style={s.statCard}>
                    <div style={{ ...s.statCardBar, background: card.gradient }} />
                    <div style={s.statLabel}>{card.label}</div>
                    <div style={s.statValue}>{card.value}</div>
                    <div style={s.statSub}>{card.sub}</div>
                  </div>
                ))}
              </div>
              <div style={s.midRow}>
                <div style={s.chartCard}>
                  <div style={s.chartHeader}>
                    <div>
                      <div style={s.cardTitle}>Spending Overview</div>
                      <div style={s.cardSub}>Daily spending this month</div>
                    </div>
                  </div>
                  <div style={{ height: 220, position: 'relative' }}>
                    <DailyBarChart data={stats?.charts?.daily} />
                  </div>
                </div>
                <div style={s.recentCard}>
                  <div style={s.recentHeader}>
                    <div style={s.cardTitle}>Recent Expenses</div>
                    <button style={s.showMoreBtn} onClick={() => setActivePage('Expenses')}>Show all</button>
                  </div>
                  <div style={s.recentList}>
                    {statsLoading
                      ? <div style={{ color: '#555570', fontSize: 13, textAlign: 'center', padding: 16 }}>Loading...</div>
                      : expenses.slice(0, 6).map((exp) => (
                          <div key={exp.id} style={s.recentRow}>
                            <div style={s.recentLeft}>
                              <div style={{ ...s.recentDot, background: CATEGORY_COLORS[exp.category] || '#94a3b8' }} />
                              <div>
                                <div style={s.recentDesc}>{exp.description}</div>
                                <div style={s.recentCat}>{exp.category} · {formatDate(exp.date)}</div>
                              </div>
                            </div>
                            <div style={s.recentAmt}>{formatCurrency(exp.amount)}</div>
                          </div>
                        ))
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── EXPENSES PAGE ── */}
          {activePage === 'Expenses' && (
            <div style={s.page}>
              <div style={s.pageHeader}>
                <h2 style={s.pageTitle}>Expenses</h2>
                <button onClick={() => { setEditData(null); setModalOpen(true); }} style={s.addExpBtn}>+ Add Expense</button>
              </div>

              {/* Search results banner */}
              {search && (
                <div style={s.searchBanner}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16 }}>🔍</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f8' }}>
                        Results for <span style={{ color: '#06b6d4' }}>"{search}"</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#8888aa', marginTop: 2 }}>
                        Found <strong style={{ color: '#f0f0f8' }}>{expenses.length}</strong> expense{expenses.length !== 1 ? 's' : ''}
                        {expenses.length > 0 && <> · Spent on <strong style={{ color: '#d946ef' }}>{expenses.length}</strong> occasion{expenses.length !== 1 ? 's' : ''}</>}
                      </div>
                    </div>
                  </div>
                  {expenses.length > 0 && (
                    <div style={s.searchTotalBox}>
                      <div style={{ fontSize: 11, color: '#8888aa', marginBottom: 2 }}>TOTAL SPENT</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#06b6d4', fontFamily: "'Space Grotesk', sans-serif" }}>{formatCurrency(searchTotal)}</div>
                    </div>
                  )}
                </div>
              )}

              <div style={s.filterRow}>
                <div style={s.filterBtns}>
                  {[['', 'All'], ['today', 'Today'], ['week', 'This Week'], ['month', 'This Month']].map(([val, label]) => (
                    <button key={val} onClick={() => setFilter(val)} style={{ ...s.filterBtn, ...(filter === val ? s.filterBtnActive : {}) }}>{label}</button>
                  ))}
                </div>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={s.catSelect}>
                  <option value="">All Categories</option>
                  {['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Education', 'Travel', 'Other'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['#', 'Date', 'Category', 'Description', 'Amount', 'Actions'].map((h) => (
                        <th key={h} style={{ ...s.th, ...(h === 'Amount' ? { textAlign: 'right' } : {}), ...(h === 'Actions' ? { textAlign: 'center' } : {}) }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {expLoading
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (<td key={j} style={s.td}><div style={{ height: 14, background: '#1e1e2a', borderRadius: 4, width: j === 3 ? 160 : 80 }} /></td>))}</tr>
                        ))
                      : expenses.length === 0
                        ? <tr><td colSpan={6} style={{ ...s.td, textAlign: 'center', padding: 48, color: '#555570' }}>
                            {search ? `No results for "${search}" 🔍` : 'No expenses found 💸'}
                          </td></tr>
                        : expenses.map((exp, idx) => (
                            <tr key={exp.id} style={s.tr}>
                              <td style={{ ...s.td, color: '#555570' }}>{idx + 1}</td>
                              <td style={s.td}>{formatDate(exp.date)}</td>
                              <td style={s.td}>
                                <span style={{ ...s.catBadge, background: (CATEGORY_COLORS[exp.category] || '#94a3b8') + '20', color: CATEGORY_COLORS[exp.category] || '#94a3b8' }}>
                                  {exp.category}
                                </span>
                              </td>
                              <td style={{ ...s.td, maxWidth: 200 }}>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{exp.description}</span>
                              </td>
                              <td style={{ ...s.td, textAlign: 'right', fontWeight: 700, color: '#06b6d4' }}>{formatCurrency(exp.amount)}</td>
                              <td style={{ ...s.td, textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                  <button onClick={() => { setEditData(exp); setModalOpen(true); }} style={s.editBtn}>Edit</button>
                                  <button onClick={() => setDeleteId(exp.id)} style={s.delBtn}>Del</button>
                                </div>
                              </td>
                            </tr>
                          ))
                    }
                  </tbody>
                </table>
              </div>

              {!expLoading && expenses.length > 0 && !search && (
                <div style={{ textAlign: 'right', fontSize: 12, color: '#555570', marginTop: 8 }}>
                  {expenses.length} expenses · Total: <span style={{ color: '#06b6d4', fontWeight: 700 }}>{formatCurrency(searchTotal)}</span>
                </div>
              )}
            </div>
          )}

          {/* ── ANALYTICS PAGE ── */}
          {activePage === 'Analytics' && (
            <div style={s.page}>
              <div style={s.pageHeader}><h2 style={s.pageTitle}>Analytics</h2></div>
              <div style={s.statsRow}>
                {[
                  { label: 'Monthly Total', value: statsLoading ? '...' : formatCurrency(stats?.month?.total), sub: `${stats?.month?.count ?? 0} expenses`, gradient: 'linear-gradient(135deg, #d946ef, #a855f7)' },
                  { label: 'Daily Average', value: statsLoading ? '...' : formatCurrency(stats?.month?.avgDaily), sub: 'this month', gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9)' },
                  { label: "Today's Total", value: statsLoading ? '...' : formatCurrency(stats?.today?.total), sub: `${stats?.today?.count ?? 0} today`, gradient: 'linear-gradient(135deg, #f97316, #fb923c)' },
                ].map((card) => (
                  <div key={card.label} style={s.statCard}>
                    <div style={{ ...s.statCardBar, background: card.gradient }} />
                    <div style={s.statLabel}>{card.label}</div>
                    <div style={s.statValue}>{card.value}</div>
                    <div style={s.statSub}>{card.sub}</div>
                  </div>
                ))}
              </div>
              <div style={s.chartsGrid}>
                <div style={s.chartCard}>
                  <div style={s.cardTitle}>Daily Spending</div>
                  <div style={s.cardSub}>This month's breakdown</div>
                  <div style={{ height: 240, position: 'relative', marginTop: 16 }}><DailyBarChart data={stats?.charts?.daily} /></div>
                </div>
                <div style={s.chartCard}>
                  <div style={s.cardTitle}>Monthly Trend</div>
                  <div style={s.cardSub}>Last 6 months</div>
                  <div style={{ height: 240, position: 'relative', marginTop: 16 }}><TrendLineChart data={stats?.charts?.trend} /></div>
                </div>
                <div style={{ ...s.chartCard, gridColumn: '1 / -1' }}>
                  <div style={s.cardTitle}>Spending by Category</div>
                  <div style={s.cardSub}>This month's distribution</div>
                  <div style={{ height: 280, position: 'relative', marginTop: 16 }}><CategoryPieChart data={stats?.charts?.categories} /></div>
                </div>
              </div>
            </div>
          )}

          {/* ── REPORTS PAGE ── */}
          {activePage === 'Reports' && (
            <div style={s.page}>
              <div style={s.pageHeader}><h2 style={s.pageTitle}>Reports</h2></div>
              <div style={s.exportCard}>
                <div style={s.exportIcon}>📊</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f8', marginBottom: 4 }}>Export to Excel</div>
                  <div style={{ fontSize: 13, color: '#555570' }}>Download all your expenses as a .xlsx file — Date, Category, Description, Amount</div>
                </div>
                <button onClick={handleExport} style={s.exportBtn}>Download Excel</button>
              </div>
              <div style={s.statsRow}>
                {[
                  { label: 'Total Expenses', value: expenses.length, sub: 'all time records', gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9)' },
                  { label: 'Total Spent', value: formatCurrency(expenses.reduce((a, e) => a + parseFloat(e.amount), 0)), sub: 'all time', gradient: 'linear-gradient(135deg, #d946ef, #a855f7)' },
                  { label: 'This Month', value: formatCurrency(stats?.month?.total), sub: `${stats?.month?.count ?? 0} expenses`, gradient: 'linear-gradient(135deg, #f97316, #fb923c)' },
                  { label: 'Daily Average', value: formatCurrency(stats?.month?.avgDaily), sub: 'this month', gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
                ].map((card) => (
                  <div key={card.label} style={s.statCard}>
                    <div style={{ ...s.statCardBar, background: card.gradient }} />
                    <div style={s.statLabel}>{card.label}</div>
                    <div style={s.statValue}>{card.value}</div>
                    <div style={s.statSub}>{card.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Modals */}
      <ExpenseModal open={modalOpen} onClose={() => { setModalOpen(false); setEditData(null); }} onSave={handleSave} editData={editData} />

      {deleteId && (
        <div onClick={() => setDeleteId(null)} style={s.overlay}>
          <div onClick={(e) => e.stopPropagation()} style={s.confirmBox}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗑️</div>
            <div style={{ fontWeight: 700, color: '#f0f0f8', marginBottom: 8 }}>Delete this expense?</div>
            <div style={{ color: '#555570', fontSize: 13, marginBottom: 24 }}>This cannot be undone.</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setDeleteId(null)} style={s.cancelBtn}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={s.confirmDelBtn}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => { setEditData(null); setModalOpen(true); }} style={s.fab}>+</button>
    </div>
  );
}

const s = {
  layout: { display: 'flex', minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Space Grotesk', 'DM Sans', sans-serif" },
  sidebar: { width: 220, background: '#0d0d14', borderRight: '1px solid #1a1a2a', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'sticky', top: 0, height: '100vh', flexShrink: 0 },
  logoWrap: { marginBottom: 36, paddingLeft: 8 },
  logoText: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 22, background: 'linear-gradient(135deg, #06b6d4, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  nav: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'transparent', color: '#555570', fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s' },
  navItemActive: { background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(217,70,239,0.15))', color: '#06b6d4', borderLeft: '2px solid #06b6d4' },
  navIcon: { fontSize: 16, width: 20, textAlign: 'center' },
  navDivider: { height: 1, background: '#1a1a2a', margin: '16px 0' },
  addBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: 'linear-gradient(135deg, #06b6d4, #d946ef)', color: 'white', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', width: '100%', marginBottom: 8 },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: 'transparent', color: '#555570', fontSize: 13, fontWeight: 500, border: '1px solid #1a1a2a', cursor: 'pointer', width: '100%' },
  mainWrap: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  topbar: { display: 'flex', alignItems: 'center', gap: 16, padding: '0 28px', height: 64, background: '#0d0d14', borderBottom: '1px solid #1a1a2a', position: 'sticky', top: 0, zIndex: 50, flexShrink: 0 },
  greeting: { fontSize: 20, fontWeight: 700, color: '#8888aa', whiteSpace: 'nowrap' },
  greetingName: { color: '#f0f0f8', fontWeight: 800 },
  searchWrap: { flex: 1, position: 'relative', maxWidth: 400 },
  searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none' },
  searchInput: { width: '100%', padding: '9px 36px 9px 36px', background: '#1a1a2a', border: '1px solid #2a2a3a', borderRadius: 10, color: '#f0f0f8', fontSize: 14, outline: 'none', colorScheme: 'dark' },
  searchClear: { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#555570', cursor: 'pointer', fontSize: 13 },
  topRight: { display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' },
  iconBtn: { width: 38, height: 38, borderRadius: 10, background: '#1a1a2a', border: '1px solid #2a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, cursor: 'pointer', position: 'relative' },
  notifBadge: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#d946ef', color: 'white', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  popup: { position: 'absolute', top: 46, right: 0, width: 280, background: '#0d0d14', border: '1px solid #2a2a3a', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 200 },
  popupHeader: { padding: '16px 16px 12px', borderBottom: '1px solid #1a1a2a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  popupTitle: { fontSize: 14, fontWeight: 700, color: '#f0f0f8' },
  popupSub: { fontSize: 11, color: '#555570' },
  popupEmpty: { padding: '20px 16px', textAlign: 'center', fontSize: 13, color: '#555570' },
  popupFooter: { padding: '12px 16px', borderTop: '1px solid #1a1a2a', fontSize: 13, color: '#8888aa', textAlign: 'right' },
  notifRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid #1a1a2a' },
  notifDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  notifDesc: { fontSize: 13, fontWeight: 500, color: '#f0f0f8' },
  notifCat: { fontSize: 11, color: '#555570' },
  notifAmt: { fontSize: 13, fontWeight: 700, color: '#06b6d4', whiteSpace: 'nowrap' },
  datePicker: { width: '100%', padding: '10px 12px', background: '#1a1a2a', border: '1px solid #2a2a3a', borderRadius: 10, color: '#f0f0f8', fontSize: 14, outline: 'none', colorScheme: 'dark' },
  main: { flex: 1, overflowY: 'auto', background: '#0a0a0f' },
  page: { padding: '28px', display: 'flex', flexDirection: 'column', gap: 20 },
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  pageTitle: { fontSize: 24, fontWeight: 800, color: '#f0f0f8', fontFamily: "'Space Grotesk', sans-serif" },
  pageDate: { fontSize: 13, color: '#555570' },

  // Search banner
  searchBanner: { background: '#0d0d14', border: '1px solid #2a2a3a', borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  searchTotalBox: { textAlign: 'right', padding: '8px 16px', background: 'rgba(6,182,212,0.08)', borderRadius: 10, border: '1px solid rgba(6,182,212,0.2)' },

  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  statCard: { background: '#0d0d14', border: '1px solid #1a1a2a', borderRadius: 16, padding: '20px', position: 'relative', overflow: 'hidden' },
  statCardBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  statLabel: { fontSize: 11, color: '#555570', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, marginTop: 8 },
  statValue: { fontSize: 22, fontWeight: 800, color: '#f0f0f8', fontFamily: "'Space Grotesk', sans-serif", marginBottom: 4 },
  statSub: { fontSize: 12, color: '#555570' },
  midRow: { display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 },
  chartCard: { background: '#0d0d14', border: '1px solid #1a1a2a', borderRadius: 16, padding: '20px' },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#f0f0f8' },
  cardSub: { fontSize: 12, color: '#555570', marginTop: 2 },
  recentCard: { background: '#0d0d14', border: '1px solid #1a1a2a', borderRadius: 16, padding: '20px' },
  recentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  showMoreBtn: { fontSize: 12, color: '#06b6d4', background: 'transparent', border: 'none', cursor: 'pointer' },
  recentList: { display: 'flex', flexDirection: 'column', gap: 12 },
  recentRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  recentLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  recentDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  recentDesc: { fontSize: 13, fontWeight: 500, color: '#f0f0f8' },
  recentCat: { fontSize: 11, color: '#555570' },
  recentAmt: { fontSize: 13, fontWeight: 700, color: '#06b6d4' },
  filterRow: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  filterBtns: { display: 'flex', gap: 4 },
  filterBtn: { padding: '7px 14px', borderRadius: 8, background: '#1a1a2a', border: '1px solid #2a2a3a', color: '#555570', fontSize: 13, cursor: 'pointer' },
  filterBtnActive: { background: 'rgba(6,182,212,0.15)', borderColor: '#06b6d4', color: '#06b6d4' },
  catSelect: { padding: '7px 12px', borderRadius: 8, background: '#1a1a2a', border: '1px solid #2a2a3a', color: '#8888aa', fontSize: 13, colorScheme: 'dark' },
  tableWrap: { borderRadius: 16, overflow: 'hidden', border: '1px solid #1a1a2a' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#555570', background: '#0d0d14', borderBottom: '1px solid #1a1a2a' },
  td: { padding: '13px 16px', fontSize: 13, color: '#8888aa', borderBottom: '1px solid #1a1a2a', verticalAlign: 'middle' },
  tr: { transition: 'background 0.15s' },
  catBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
  editBtn: { background: 'rgba(6,182,212,0.12)', color: '#06b6d4', padding: '5px 10px', borderRadius: 6, fontSize: 12, border: 'none', cursor: 'pointer' },
  delBtn: { background: 'rgba(248,113,113,0.12)', color: '#f87171', padding: '5px 10px', borderRadius: 6, fontSize: 12, border: 'none', cursor: 'pointer' },
  addExpBtn: { padding: '9px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #06b6d4, #d946ef)', color: 'white', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  chartsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  exportCard: { background: '#0d0d14', border: '1px solid #1a1a2a', borderRadius: 16, padding: '24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' },
  exportIcon: { width: 56, height: 56, borderRadius: 14, background: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 },
  exportBtn: { padding: '11px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #06b6d4, #d946ef)', color: 'white', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  confirmBox: { background: '#0d0d14', border: '1px solid #1a1a2a', borderRadius: 20, padding: '32px 28px', textAlign: 'center', maxWidth: 320, width: '100%' },
  cancelBtn: { padding: '9px 20px', borderRadius: 10, background: '#1a1a2a', color: '#8888aa', fontSize: 14, border: 'none', cursor: 'pointer' },
  confirmDelBtn: { padding: '9px 20px', borderRadius: 10, background: '#f87171', color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' },
  fab: { position: 'fixed', bottom: 32, right: 32, width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #d946ef)', color: 'white', border: 'none', fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px rgba(6,182,212,0.4)', zIndex: 500 },
  avatar: { width: 36, height: 36, borderRadius: '50%', border: '2px solid #06b6d4' },
  avatarFallback: { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #d946ef)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 },
};
