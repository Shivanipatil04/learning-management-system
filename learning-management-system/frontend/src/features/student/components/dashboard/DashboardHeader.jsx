const DashboardHeader = ({ userName }) => {
  return (
    <div className="student-dashboard-header">
      <div className="header-greeting">
        <h1>Good Afternoon, {userName} 👋</h1>
        <p>Continue your learning journey</p>
      </div>
    </div>
  );
};

export default DashboardHeader;
