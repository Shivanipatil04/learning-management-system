import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as icons from 'lucide-react';
import { getNavByRole } from '../../routes/navigation';
import { clearCredentials } from '../../store/authSlice';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const userType = user?.userType || 'student';
  const navItems = getNavByRole(userType);

  const handleLogout = () => {
    dispatch(clearCredentials());
  };

  return (
    <aside className="sidebar-shell">
      <div className="sidebar-brand">
        <div className="brand-badge small" aria-label="LearnHub logo">
          <span />
        </div>
        <div className="brand-wordmark small-wordmark">
          <span className="learn">Learn</span>
          <span className="hub">Hub</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Sidebar navigation">
        {navItems.map((item) => {
          const Icon = icons[item.icon] || icons.LayoutDashboard;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '20px' }}>
        <button 
          onClick={handleLogout} 
          className="sidebar-link" 
          style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: 'var(--color-charcoal)', fontWeight: '600' }}
        >
          <icons.LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
