import { useSelector } from 'react-redux';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="dashboard-shell">
      <div className="dashboard-card">
        <h1>Dashboard</h1>
        <p>Logged in as {user?.name || 'user'}.</p>
        <span className="status-chip">Active session</span>
      </div>
    </div>
  );
};

export default DashboardPage;
