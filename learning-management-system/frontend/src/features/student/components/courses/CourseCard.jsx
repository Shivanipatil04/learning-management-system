import { Star, Clock, BookOpen, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  return (
    <div className="course-card">
      <div className="course-card-image">
        <img src={course.thumbnail || '/favicon.svg'} alt={course.title} />
        <button className="wishlist-btn" aria-label="Add to wishlist">
          <Heart size={20} />
        </button>
      </div>
      <div className="course-card-content">
        <div className="course-card-header">
          <span className="course-level">{course.level}</span>
          <span className="course-price">{course.price === 0 ? 'Free' : `₹${course.price}`}</span>
        </div>
        <h3 className="course-title">{course.title}</h3>
        <p className="course-instructor">by {course.teacher?.name || 'Instructor'}</p>
        
        <div className="course-meta">
          <div className="meta-item">
            <Star size={16} className="text-yellow" />
            <span>{course.rating.toFixed(1)} ({course.reviewCount})</span>
          </div>
          <div className="meta-item">
            <Clock size={16} />
            <span>{course.duration}</span>
          </div>
          <div className="meta-item">
            <BookOpen size={16} />
            <span>{course.totalLessons} lessons</span>
          </div>
        </div>
        
        <button 
          className="primary-button full-width"
          onClick={() => navigate(`/courses/${course._id}`)}
        >
          View Course
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
