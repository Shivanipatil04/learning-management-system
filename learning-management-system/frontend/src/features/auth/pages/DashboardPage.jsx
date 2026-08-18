import { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, BookOpen, CheckCircle2, FilePlus2, UploadCloud } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCourseDashboard } from '../../courses/courses.api';
import StudentDashboard from '../../student/pages/StudentDashboard';

const DashboardSkeleton = () => <div className="teacher-dashboard-skeleton"><div /><div /><div /></div>;

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [summary, setSummary] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const isStudent = user?.userType === 'student';
  const isManagementRole = ['teacher', 'coachingClassAdmin', 'superAdmin'].includes(user?.userType);
  const load = useCallback(async () => { setLoading(true); setError(''); try { const response = await getCourseDashboard(); setSummary(response.data.data); } catch (err) { setError(err.response?.status === 403 ? 'You do not have permission to view this dashboard.' : 'Something went wrong while loading your dashboard.'); } finally { setLoading(false); } }, []);
  // Fetch the real teacher summary when this dashboard is active.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (isManagementRole) load(); }, [isManagementRole, load]);

  if (isStudent) return <StudentDashboard />;
  if (!isManagementRole) return <div className="dashboard-shell"><div className="dashboard-card"><h1>Welcome to LearnHub</h1><p>Your learning dashboard will show enrolled courses and progress when that data is available.</p></div></div>;
  return <main className="teacher-dashboard"><header className="teacher-dashboard-header"><div><p className="eyebrow">Your workspace</p><h1>Good morning, {user?.name || 'there'} <span aria-hidden="true">👋</span></h1><p>Here’s an overview of your teaching activity.</p></div><Link className="primary-button dashboard-create-button" to="/course-management"><FilePlus2 size={18} /> Create Course</Link></header>
    {loading ? <DashboardSkeleton /> : error ? <div className="dashboard-error" role="alert"><div><strong>Unable to load your dashboard</strong><p>{error}</p></div><button type="button" onClick={load}>Try Again</button></div> : !summary?.totalCourses ? <section className="dashboard-empty"><span><BookOpen size={29} /></span><h2>Welcome to LearnHub</h2><p>You haven’t created any courses yet.</p><Link className="primary-button" to="/course-management">Create Your First Course</Link></section> : <><section className="dashboard-stat-grid" aria-label="Teaching summary"><div className="dashboard-stat"><span><BookOpen size={18} /></span><div><strong>{summary.totalCourses}</strong><small>Total Courses</small></div></div><div className="dashboard-stat"><span><CheckCircle2 size={18} /></span><div><strong>{summary.publishedCourses}</strong><small>Published Courses</small></div></div><div className="dashboard-stat"><span><FilePlus2 size={18} /></span><div><strong>{summary.draftCourses}</strong><small>Draft Courses</small></div></div><div className="dashboard-stat"><span><UploadCloud size={18} /></span><div><strong>{summary.videosUploaded}</strong><small>Videos Uploaded</small></div></div></section><section className="dashboard-progress-card"><div className="dashboard-section-title"><div><p className="eyebrow">Content health</p><h2>Overall Content Progress</h2></div><strong>{summary.contentProgress}%</strong></div><div className="dashboard-progress-track"><span style={{ width: `${summary.contentProgress}%` }} /></div><p>{summary.lessonsWithVideo} of {summary.totalLessons} lessons have videos uploaded</p></section><div className="dashboard-lower-grid"><section className="recent-courses-card"><div className="dashboard-section-title"><h2>Recent Courses</h2><Link to="/course-management">View all <ArrowUpRight size={15} /></Link></div><div className="recent-course-list">{summary.recentCourses.map((course) => <Link className="recent-course" to={`/courses/${course._id}`} key={course._id}><span className="recent-course-icon"><BookOpen size={18} /></span><div><strong>{course.title}</strong><small>{course.status === 'PUBLISHED' ? 'Published' : 'Draft'} · ₹{course.price}</small></div><ArrowUpRight size={16} /></Link>)}</div></section><section className="quick-actions-card"><div className="dashboard-section-title"><h2>Quick Actions</h2></div><Link to="/course-management"><FilePlus2 size={17} /><span><strong>Create Course</strong><small>Start a new learning path</small></span><ArrowUpRight size={15} /></Link><Link to="/upload-video"><UploadCloud size={17} /><span><strong>Upload Video</strong><small>Add content to a lesson</small></span><ArrowUpRight size={15} /></Link><Link to="/course-management"><BookOpen size={17} /><span><strong>Manage Content</strong><small>Edit courses and lessons</small></span><ArrowUpRight size={15} /></Link></section></div></>}
  </main>;
};

export default DashboardPage;
