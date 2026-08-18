import { useCallback, useEffect, useState } from 'react';
import { BookOpen, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStudentProgress } from '../enrollments.api';
import '../styles/browse-courses.css';

const StudentProgressPage = () => {
  const navigate = useNavigate(); const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); try { const response = await getStudentProgress(); setItems(response.data.data || []); } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load progress.'); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  if (loading) return <main className="browse-courses-page"><h1>My Progress</h1><p>Loading progress…</p></main>;
  return <main className="browse-courses-page"><header className="browse-header"><h1>My Progress</h1><p>Track your learning across enrolled courses.</p></header>{error ? <div className="empty-state"><p>{error}</p></div> : !items.length ? <div className="empty-state"><BookOpen size={30} /><p>Enroll in a course to see your progress.</p></div> : <div className="courses-grid">{items.map((item) => <article className="course-card" key={item._id}><div className="course-card-image">{item.courseId?.thumbnail ? <img src={item.courseId.thumbnail} alt={item.courseId.title} /> : <BookOpen size={34} />}</div><div className="course-card-content"><span className="course-level">{item.status}</span><h3 className="course-title">{item.courseId?.title}</h3><p className="course-instructor">{item.progress}% complete · {item.completedLessons?.length || 0} lessons completed</p><div className="course-progress-track"><span style={{ width: `${item.progress}%` }} /></div><button className="primary-button full-width" type="button" onClick={() => navigate(`/courses/${item.courseId?._id}/learn`)}><PlayCircle size={17} /> Continue Learning</button></div></article>)}</div>}</main>;
};

export default StudentProgressPage;
