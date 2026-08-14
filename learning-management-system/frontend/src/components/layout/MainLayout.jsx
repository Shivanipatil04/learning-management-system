import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
  return (
    <div className="main-layout-shell">
      <Sidebar />
      <main className="main-layout-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
