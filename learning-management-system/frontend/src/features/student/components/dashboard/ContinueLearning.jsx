import { PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContinueLearning = ({ enrollment }) => {
  const navigate = useNavigate();
  const course = enrollment?.courseId;
  if (!enrollment || !course) return <div className="continue-learning-card"><div className="cl-content"><h2>Start learning</h2><p>Enroll in a course to continue learning.</p><button className="primary-button cl-button" onClick={() => navigate('/browse-courses')}>Browse Courses</button></div></div>;

  return (
    <div className="continue-learning-card">
      <div className="cl-image">
        {course.thumbnail ? <img src={course.thumbnail} alt={course.title} /> : <span />}
      </div>
      <div className="cl-content">
        <div className="cl-header">
          <h2>{course.title}</h2>
          <span className="cl-instructor">{enrollment.status}</span>
        </div>
        <div className="cl-details">
          <p><strong>Progress:</strong> {enrollment.progress}%</p>
        </div>
        <div className="cl-progress-wrapper">
          <div className="cl-progress-info">
            <span>Progress</span>
            <span>{enrollment.progress}%</span>
          </div>
          <div className="cl-progress-bar">
            <div className="cl-progress-fill" style={{ width: `${enrollment.progress}%` }}></div>
          </div>
        </div>
        <button className="primary-button cl-button" onClick={() => navigate(`/courses/${course._id}/learn`)}>
          <PlayCircle size={18} />
          <span>Continue Learning</span>
        </button>
      </div>
    </div>
  );
};

export default ContinueLearning;
