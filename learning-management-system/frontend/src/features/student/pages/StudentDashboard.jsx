import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getStudentProgress } from '../enrollments.api';
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
  const [progress, setProgress] = useState([]);
  const load = useCallback(async () => { try { const response = await getStudentProgress(); setProgress(response.data.data || []); } catch (error) { console.error('Unable to load student dashboard:', error); } }, []);
  useEffect(() => { load(); }, [load]);
  const completedCourses = progress.filter((item) => item.status === 'COMPLETED').length;
  const completedLessons = progress.reduce((total, item) => total + (item.completedLessons?.length || 0), 0);
  const current = progress.find((item) => item.status === 'IN_PROGRESS') || progress.find((item) => item.status === 'ENROLLED');
  
  return (
    <div className="student-dashboard">
      <DashboardHeader userName={user?.name || 'Student'} />
      <SummaryCards enrolledCount={progress.length} completedCourses={completedCourses} completedLessons={completedLessons} />
      
      <div className="dashboard-grid">
        <div className="dashboard-main-column">
          <ContinueLearning enrollment={current} />
          <UpcomingLiveClasses />
        </div>
        <div className="dashboard-side-column">
          <LearningProgress completedLessons={completedLessons} />
          <PendingQuizzes />
          <RecentCertificates />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
