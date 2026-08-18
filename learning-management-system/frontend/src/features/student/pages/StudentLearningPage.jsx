import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../../services/apiClient';
import { getCourseLearning, markLessonComplete } from '../enrollments.api';
import '../styles/browse-courses.css';

const mediaUrl = (url) => url ? new URL(url, apiClient.defaults.baseURL.replace(/\/api\/?$/, '')).toString() : '';

const StudentLearningPage = () => {
  const { id } = useParams(); const navigate = useNavigate();
  const [learning, setLearning] = useState(null); const [selectedId, setSelectedId] = useState(null); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); setError(''); try { const response = await getCourseLearning(id); const data = response.data.data; setLearning(data); setSelectedId(data.enrollment.lastAccessedLesson ? String(data.enrollment.lastAccessedLesson) : data.lessons[0]?._id || null); } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to open this course.'); } finally { setLoading(false); } }, [id]);
  // Load the protected learning payload when the course changes.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);
  const selectedIndex = useMemo(() => learning?.lessons.findIndex((lesson) => lesson._id === selectedId) ?? -1, [learning, selectedId]);
  const selectedLesson = selectedIndex >= 0 ? learning.lessons[selectedIndex] : null;
  const completed = new Set((learning?.enrollment.completedLessons || []).map(String));
  const video = selectedLesson?.video?.url || selectedLesson?.videoUrl;
  const completeLesson = async () => { if (!selectedLesson || completed.has(String(selectedLesson._id))) return; setSaving(true); try { const response = await markLessonComplete(id, selectedLesson._id); setLearning((current) => ({ ...current, enrollment: response.data.data })); } catch (requestError) { if (requestError.response?.status === 409) { setLearning((current) => ({ ...current, lessons: current.lessons.filter((lesson) => lesson._id !== selectedLesson._id) })); setSelectedId(null); } setError(requestError.response?.data?.message || 'Unable to update progress.'); } finally { setSaving(false); } };
  if (loading) return <main className="course-details-page loading">Loading course…</main>;
  if (error || !learning) return <main className="course-details-page error"><p>{error || 'Course not found.'}</p><button className="outline-button" type="button" onClick={() => navigate(-1)}>Go Back</button></main>;
  return <main className="student-learning-page"><button className="back-link" type="button" onClick={() => navigate('/my-courses')}><ArrowLeft size={16} /> My Courses</button><header className="learning-header"><div><p className="eyebrow">Learning</p><h1>{learning.course.title}</h1><p>{learning.course.description}</p></div><strong>{learning.enrollment.progress}% complete</strong></header><div className="learning-layout"><aside className="learning-lessons"><h2>Course lessons</h2>{learning.lessons.length ? learning.lessons.map((lesson) => <button className={`learning-lesson ${lesson._id === selectedId ? 'active' : ''}`} type="button" key={lesson._id} onClick={() => setSelectedId(lesson._id)}><span>{completed.has(String(lesson._id)) ? <CheckCircle2 size={17} /> : <PlayCircle size={17} />}</span><span>{lesson.order}. {lesson.title}</span></button>) : <p>No video lessons are available yet.</p>}</aside><section className="learning-content">{selectedLesson ? <><div className="learning-video">{video ? <video controls src={mediaUrl(video)}>Your browser does not support video playback.</video> : <div className="learning-no-video"><PlayCircle size={32} /><p>No video is available for this lesson.</p></div>}</div><div className="learning-lesson-header"><div><p className="eyebrow">Lesson {selectedLesson.order}</p><h2>{selectedLesson.title}</h2></div>{completed.has(String(selectedLesson._id)) ? <span className="learning-complete"><CheckCircle2 size={16} /> Completed</span> : video ? <button className="primary-button" type="button" onClick={completeLesson} disabled={saving}>{saving ? 'Saving…' : 'Mark Complete'}</button> : <span className="learning-unavailable">Video unavailable</span>}</div><p className="learning-description">{selectedLesson.description || selectedLesson.content || 'No additional lesson details.'}</p><div className="learning-navigation"><button className="outline-button" type="button" disabled={selectedIndex <= 0} onClick={() => setSelectedId(learning.lessons[selectedIndex - 1]._id)}><ChevronLeft size={16} /> Previous</button><button className="outline-button" type="button" disabled={selectedIndex >= learning.lessons.length - 1} onClick={() => setSelectedId(learning.lessons[selectedIndex + 1]._id)}>Next <ChevronRight size={16} /></button></div></> : <p>Select a lesson to start learning.</p>}</section></div></main>;
};

export default StudentLearningPage;
