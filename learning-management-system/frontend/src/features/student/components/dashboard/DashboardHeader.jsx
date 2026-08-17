import { Bell, User } from 'lucide-react';

const DashboardHeader = ({ userName }) => {
  return (
    <div className="student-dashboard-header">
      <div className="header-greeting">
        <h1>Good Afternoon, {userName} 👋</h1>
        <p>Continue your learning journey</p>
      </div>
      <div className="header-actions">
        <button className="icon-button" aria-label="Notifications">
          <Bell size={20} />
          <span className="notification-badge"></span>
        </button>
        <div className="header-profile">
          <div className="avatar-placeholder">
            <User size={24} color="white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
