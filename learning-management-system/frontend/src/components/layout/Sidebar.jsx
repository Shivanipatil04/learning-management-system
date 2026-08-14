import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import * as icons from 'lucide-react';
import { getNavByRole } from '../../routes/navigation';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const userType = user?.userType || 'student';
  const navItems = getNavByRole(userType);

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
    </aside>
  );
};

export default Sidebar;
