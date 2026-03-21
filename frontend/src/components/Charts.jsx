import { useEffect, useRef } from 'react';
import { CATEGORY_COLORS } from '../utils/format';
import {
  Chart,
  BarController, BarElement,
  LineController, LineElement, PointElement,
  DoughnutController, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler,
} from 'chart.js';

Chart.register(
  BarController, BarElement,
  LineController, LineElement, PointElement,
  DoughnutController, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler
);

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#8888aa', font: { family: 'DM Sans', size: 12 }, boxWidth: 12, padding: 16 },
    },
    tooltip: {
      backgroundColor: '#16161f',
      borderColor: '#2a2a3a',
      borderWidth: 1,
      titleColor: '#f0f0f8',
      bodyColor: '#8888aa',
      padding: 12,
      callbacks: {
        label: (ctx) => ` ₹${parseFloat(ctx.raw || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: '#1e1e2a' },
      ticks: { color: '#555570', font: { family: 'DM Sans', size: 11 } },
    },
    y: {
      grid: { color: '#1e1e2a' },
      ticks: {
        color: '#555570', font: { family: 'DM Sans', size: 11 },
        callback: (v) => '₹' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v),
      },
      beginAtZero: true,
    },
  },
};

// ── Bar Chart ────────────────────────────────────────────────────────────────
export function DailyBarChart({ data }) {
  const ref = useRef();
  const chartRef = useRef();

  useEffect(() => {
    if (!data?.length) return;
    chartRef.current?.destroy();

    const labels = data.map((d) => {
      const dt = new Date(d.date);
      return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    });
    const values = data.map((d) => parseFloat(d.total));

    chartRef.current = new Chart(ref.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Daily Spending',
          data: values,
          backgroundColor: 'rgba(124,106,247,0.7)',
          borderRadius: 6,
          borderSkipped: false,
          hoverBackgroundColor: 'rgba(157,143,255,0.9)',
        }],
      },
      options: {
        ...CHART_DEFAULTS,
        plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
      },
    });
    return () => chartRef.current?.destroy();
  }, [data]);

  if (!data?.length) return <EmptyChart label="No data for this month yet" />;
  return <canvas ref={ref} style={{ maxHeight: 240 }} />;
}

// ── Line Chart ────────────────────────────────────────────────────────────────
export function TrendLineChart({ data }) {
  const ref = useRef();
  const chartRef = useRef();

  useEffect(() => {
    if (!data?.length) return;
    chartRef.current?.destroy();

    chartRef.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels: data.map((d) => d.month),
        datasets: [{
          label: 'Monthly Spending',
          data: data.map((d) => parseFloat(d.total)),
          borderColor: '#7c6af7',
          backgroundColor: 'rgba(124,106,247,0.08)',
          borderWidth: 2,
          pointBackgroundColor: '#7c6af7',
          pointRadius: 4,
          fill: true,
          tension: 0.4,
        }],
      },
      options: {
        ...CHART_DEFAULTS,
        plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
      },
    });
    return () => chartRef.current?.destroy();
  }, [data]);

  if (!data?.length) return <EmptyChart label="Need more months of data" />;
  return <canvas ref={ref} style={{ maxHeight: 240 }} />;
}

// ── Pie Chart ────────────────────────────────────────────────────────────────
export function CategoryPieChart({ data }) {
  const ref = useRef();
  const chartRef = useRef();

  useEffect(() => {
    if (!data?.length) return;
    chartRef.current?.destroy();

    const colors = data.map((d) => CATEGORY_COLORS[d.category] || '#94a3b8');

    chartRef.current = new Chart(ref.current, {
      type: 'doughnut',
      data: {
        labels: data.map((d) => d.category),
        datasets: [{
          data: data.map((d) => parseFloat(d.total)),
          backgroundColor: colors.map((c) => c + 'cc'),
          borderColor: colors,
          borderWidth: 2,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#8888aa', font: { family: 'DM Sans', size: 12 },
              boxWidth: 12, padding: 12,
            },
          },
          tooltip: {
            backgroundColor: '#16161f',
            borderColor: '#2a2a3a',
            borderWidth: 1,
            titleColor: '#f0f0f8',
            bodyColor: '#8888aa',
            callbacks: {
              label: (ctx) => ` ₹${parseFloat(ctx.raw).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            },
          },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [data]);

  if (!data?.length) return <EmptyChart label="No category data this month" />;
  return <canvas ref={ref} style={{ maxHeight: 260 }} />;
}

function EmptyChart({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-muted)', fontSize: 14 }}>
      {label}
    </div>
  );
}
