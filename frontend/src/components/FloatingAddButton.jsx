export default function FloatingAddButton({ onClick }) {
  return (
    <button onClick={onClick} style={styles.fab} title="Add Expense">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
        <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
      </svg>
    </button>
  );
}

const styles = {
  fab: {
    position: 'fixed',
    bottom: 32,
    right: 32,
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent), #5b21b6)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 24px rgba(124,106,247,0.5)',
    zIndex: 500,
    transition: 'transform 0.2s, box-shadow 0.2s',
    animation: 'pulse-ring 3s infinite',
  },
};
