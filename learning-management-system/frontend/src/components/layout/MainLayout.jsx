import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

const MainLayout = () => {
  return (
    <div className="main-layout-shell">
      <Sidebar />
      <div className="main-layout-content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopHeader />
        <main className="main-layout-content" style={{ overflowY: 'auto', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
