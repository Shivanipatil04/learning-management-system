import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={`main-layout-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <div className="main-layout-content-wrapper">
        <TopHeader />
        <main className="main-layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
