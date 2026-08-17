import { PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContinueLearning = () => {
  const navigate = useNavigate();
  const course = {
    title: 'Advanced React Patterns',
    instructor: 'Sarah Drasner',
    currentLesson: 'Render Props vs Hooks',
    progress: 65,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
  };

  return (
    <div className="continue-learning-card">
      <div className="cl-image">
        <img src={course.thumbnail} alt={course.title} />
      </div>
      <div className="cl-content">
        <div className="cl-header">
          <h2>{course.title}</h2>
          <span className="cl-instructor">by {course.instructor}</span>
        </div>
        <div className="cl-details">
          <p><strong>Current Lesson:</strong> {course.currentLesson}</p>
        </div>
        <div className="cl-progress-wrapper">
          <div className="cl-progress-info">
            <span>Progress</span>
            <span>{course.progress}%</span>
          </div>
          <div className="cl-progress-bar">
            <div className="cl-progress-fill" style={{ width: `${course.progress}%` }}></div>
          </div>
        </div>
        <button className="primary-button cl-button" onClick={() => navigate('/my-courses')}>
          <PlayCircle size={18} />
          <span>Continue Learning</span>
        </button>
      </div>
    </div>
  );
};

export default ContinueLearning;
