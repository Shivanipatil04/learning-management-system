import { Flame, Clock, BookCheck } from 'lucide-react';

const LearningProgress = ({ completedLessons = 0 }) => {
  return (
    <div className="dashboard-section-card side-card">
      <div className="section-header">
        <h3>Learning Progress</h3>
      </div>
      <div className="progress-stats">
        <div className="progress-stat-item">
          <div className="progress-icon color-orange"><Flame size={20} /></div>
          <div className="progress-details">
          <span className="p-value">—</span>
            <span className="p-label">Learning Streak</span>
          </div>
        </div>
        <div className="progress-stat-item">
          <div className="progress-icon color-blue"><Clock size={20} /></div>
          <div className="progress-details">
          <span className="p-value">—</span>
            <span className="p-label">This Week</span>
          </div>
        </div>
        <div className="progress-stat-item">
          <div className="progress-icon color-green"><BookCheck size={20} /></div>
          <div className="progress-details">
          <span className="p-value">{completedLessons}</span>
            <span className="p-label">Lessons Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningProgress;
