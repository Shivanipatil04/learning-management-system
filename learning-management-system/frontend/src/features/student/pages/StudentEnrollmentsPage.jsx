import { useCallback, useEffect, useState } from 'react';
import { BookOpen, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listStudentEnrollments } from '../enrollments.api';
import '../styles/browse-courses.css';

const StudentEnrollmentsPage = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await listStudentEnrollments();
      setEnrollments(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load your courses.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load the authenticated student's enrollments when the page mounts.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  if (loading) return <main className="browse-courses-page"><h1>My Courses</h1><p>Loading your courses…</p></main>;

  return (
    <main className="browse-courses-page">
      <header className="browse-header">
        <h1>My Courses</h1>
        <p>Continue learning from where you left off.</p>
      </header>

      {error && <div className="empty-state" role="alert"><p>{error}</p><button className="outline-button" type="button" onClick={load}>Try Again</button></div>}
      {!error && !enrollments.length && <div className="empty-state"><BookOpen size={30} /><p>You have not enrolled in any courses yet.</p><button className="outline-button" type="button" onClick={() => navigate('/browse-courses')}>Browse Courses</button></div>}
      {!error && enrollments.length > 0 && (
        <div className="courses-grid">
          {enrollments.map((enrollment) => {
            const course = enrollment.courseId;
            if (!course) return null;
            return (
              <article className="course-card" key={enrollment._id}>
                <div className="course-card-image">
                  {course.thumbnail ? <img src={course.thumbnail} alt={course.title} /> : <BookOpen size={34} />}
                </div>
                <div className="course-card-content">
                  <span className="course-level">{enrollment.status}</span>
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-instructor">{enrollment.progress}% complete</p>
                  <div className="course-progress-track" aria-label={`${enrollment.progress}% complete`}>
                    <span style={{ width: `${enrollment.progress}%` }} />
                  </div>
                  <button className="primary-button full-width" type="button" onClick={() => navigate(`/courses/${course._id}`)}>
                    <PlayCircle size={17} /> {enrollment.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default StudentEnrollmentsPage;
