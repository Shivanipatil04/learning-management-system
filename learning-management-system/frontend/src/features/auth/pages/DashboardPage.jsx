import { useSelector } from 'react-redux';
import StudentDashboard from '../../student/pages/StudentDashboard';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  if (user?.userType === 'student' || !user?.userType) {
    // Treat undefined/null userType as student for default development viewing
    return <StudentDashboard />;
  }

  return (
    <div className="dashboard-shell">
      <div className="dashboard-card">
        <h1>Dashboard</h1>
        <p>Logged in as {user?.name || 'user'} ({user?.userType}).</p>
        <span className="status-chip">Active session</span>
      </div>
    </div>
  );
};

export default DashboardPage;
