import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, BookOpen, User, CheckCircle, Globe, PlayCircle, Heart } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import { getCourse, normalizeCourse } from '../../courses/courses.api';
import '../styles/browse-courses.css'; 

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const fetchCourseDetails = useCallback(async () => {
    try {
      const response = await getCourse(id);
      if (response.data.success) {
        setCourse(normalizeCourse(response.data.data));
      }
    } catch (error) {
      console.error('Failed to fetch course details:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Fetching on mount synchronizes the page with the current course id.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const response = await apiClient.post(`/courses/${id}/enroll`);
      if (response.data.success) {
        // Redirect to My Courses
        navigate('/my-courses');
      }
    } catch (error) {
      console.error('Failed to enroll:', error);
      alert(error.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="course-details-page loading">Loading...</div>;
  if (!course) return <div className="course-details-page error">Course not found.</div>;

  return (
    <div className="course-details-page">
      <div className="course-hero">
        <div className="course-hero-content">
          <span className="course-category">{course.category}</span>
          <h1>{course.title}</h1>
          <p className="course-subtitle">{course.description}</p>
          
          <div className="course-hero-meta">
            <div className="meta-item">
              <Star size={18} className="text-yellow" />
              <strong>{course.rating.toFixed(1)}</strong>
              <span>({course.reviewCount} reviews)</span>
            </div>
            <div className="meta-item">
              <User size={18} />
              <span>Created by <strong>{course.teacher?.name || 'Instructor'}</strong></span>
            </div>
          </div>
          
          <div className="course-hero-meta-secondary">
            <div className="meta-item"><Globe size={16} /> {course.language}</div>
            <div className="meta-item"><Clock size={16} /> {course.duration}</div>
            <div className="meta-item"><BookOpen size={16} /> {course.level}</div>
          </div>
        </div>
      </div>

      <div className="course-body">
        <main className="course-main-content">
          <div className="content-section">
            <h2>What you'll learn</h2>
            <ul className="learning-objectives">
              <li><CheckCircle size={16} className="text-green" /> Build scalable applications from scratch</li>
              <li><CheckCircle size={16} className="text-green" /> Master advanced concepts and best practices</li>
              <li><CheckCircle size={16} className="text-green" /> Improve your problem-solving skills</li>
              <li><CheckCircle size={16} className="text-green" /> Prepare for technical interviews</li>
            </ul>
          </div>

          <div className="content-section">
            <h2>Course Curriculum</h2>
            <div className="curriculum-list">
              {course.curriculum && course.curriculum.map((section, idx) => (
                <div key={idx} className="curriculum-section">
                  <h3>{section.title}</h3>
                  <ul className="lesson-list">
                    {section.lessons.map((lesson, lIdx) => (
                      <li key={lIdx}>
                        <div className="lesson-title">
                          <PlayCircle size={16} />
                          <span>{lesson.title}</span>
                        </div>
                        <span className="lesson-duration">{lesson.duration}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </main>

        <aside className="course-sidebar-container">
          <div className="course-enroll-card">
            <img src={course.thumbnail || '/favicon.svg'} alt={course.title} className="enroll-card-img" />
            <div className="enroll-card-content">
              <div className="enroll-price">
                <h2>{course.price === 0 ? 'Free' : `₹${course.price}`}</h2>
              </div>
              
              <button 
                className="primary-button full-width enroll-btn"
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? 'Enrolling...' : (course.price === 0 ? 'Enroll Now' : 'Buy Now')}
              </button>
              
              <button className="outline-button full-width wishlist-btn-large">
                <Heart size={18} /> Add to Wishlist
              </button>

              <div className="enroll-features">
                <p>This course includes:</p>
                <ul>
                  <li><Clock size={16} /> {course.duration} on-demand video</li>
                  <li><BookOpen size={16} /> {course.totalLessons} lessons</li>
                  <li><Star size={16} /> Certificate of completion</li>
                </ul>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CourseDetails;
