import { useSelector } from 'react-redux';
import '../styles/dashboard.css';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SummaryCards from '../components/dashboard/SummaryCards';
import ContinueLearning from '../components/dashboard/ContinueLearning';
import UpcomingLiveClasses from '../components/dashboard/UpcomingLiveClasses';
import PendingQuizzes from '../components/dashboard/PendingQuizzes';
import RecentCertificates from '../components/dashboard/RecentCertificates';
import LearningProgress from '../components/dashboard/LearningProgress';

const StudentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  
  return (
    <div className="student-dashboard">
      <DashboardHeader userName={user?.name || 'Student'} />
      <SummaryCards />
      
      <div className="dashboard-grid">
        <div className="dashboard-main-column">
          <ContinueLearning />
          <UpcomingLiveClasses />
        </div>
        <div className="dashboard-side-column">
          <LearningProgress />
          <PendingQuizzes />
          <RecentCertificates />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
