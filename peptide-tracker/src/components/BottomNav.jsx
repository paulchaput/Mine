export default function BottomNav({ currentPage, onNavigate }) {
  const navItems = [
    { id: 'library', label: 'Library', icon: '📚' },
    { id: 'calculator', label: 'Calculator', icon: '🧮' },
    { id: 'tracker', label: 'Tracker', icon: '📊' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'history', label: 'History', icon: '📖' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <div
          key={item.id}
          className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          <div className="nav-icon">{item.icon}</div>
          <div>{item.label}</div>
        </div>
      ))}
    </nav>
  );
}
