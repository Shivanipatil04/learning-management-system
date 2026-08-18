import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, CheckCircle2, Clock3, MoreHorizontal, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { coursesFailed, coursesLoaded, coursesRequested } from '../../../store/courseSlice';
import { createCourse, deleteCourse, listCourses, publishCourse, updateCourse } from '../courses.api';

const blankForm = { title: '', description: '', price: '', thumbnail: '' };

const CourseSkeleton = () => <div className="course-card course-skeleton" aria-hidden="true"><div className="skeleton-block" /><div className="skeleton-line wide" /><div className="skeleton-line" /></div>;

const CoursesPage = ({ manage = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state) => state.courses);
  const [form, setForm] = useState(blankForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const load = useCallback(async () => {
    dispatch(coursesRequested());
    try {
      const response = await listCourses(manage ? { manage: 'true' } : {});
      dispatch(coursesLoaded(response.data.data || []));
    } catch (err) {
      const status = err.response?.status;
      dispatch(coursesFailed(status === 403 ? 'You do not have permission to manage courses.' : 'We could not load courses right now.'));
    }
  }, [dispatch, manage]);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => ({ total: items.length, drafts: items.filter((course) => course.status === 'DRAFT').length, published: items.filter((course) => course.status === 'PUBLISHED').length }), [items]);
  const openCreate = () => { setEditingCourse(null); setForm(blankForm); setFeedback(null); setModalOpen(true); };
  const openEdit = (course) => { setEditingCourse(course); setForm({ title: course.title, description: course.description || '', price: String(course.price), thumbnail: course.thumbnail || '' }); setFeedback(null); setModalOpen(true); };
  const closeModal = () => { if (!busyId) setModalOpen(false); };

  const submit = async (event) => {
    event.preventDefault();
    setBusyId('form'); setFeedback(null);
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editingCourse) await updateCourse(editingCourse._id, payload);
      else await createCourse(payload);
      setModalOpen(false); setForm(blankForm); setFeedback({ type: 'success', text: editingCourse ? 'Course updated successfully.' : 'Course created as a draft.' }); await load();
    } catch (err) { setFeedback({ type: 'error', text: err.response?.status === 403 ? 'You do not have permission to perform this action.' : 'We could not save this course. Please try again.' }); }
    finally { setBusyId(null); }
  };

  const runAction = async (course, action, success) => {
    setBusyId(course._id); setFeedback(null);
    try { await action(); setFeedback({ type: 'success', text: success }); await load(); }
    catch (err) { setFeedback({ type: 'error', text: err.response?.status === 403 ? 'You do not have permission to perform this action.' : 'The action could not be completed.' }); }
    finally { setBusyId(null); setConfirmingDelete(null); }
  };

  return <main className="course-management-page">
    <header className="course-page-header">
      <div><p className="eyebrow">{manage ? 'Workspace' : 'Learning library'}</p><h1>{manage ? 'Course Management' : 'Courses'}</h1><p className="page-description">{manage ? 'Manage your courses, lessons, and publishing status.' : 'Explore courses built for your learning journey.'}</p></div>
      {manage && <button className="primary-button create-course-button" type="button" onClick={openCreate}><Plus size={18} /> Create Course</button>}
    </header>

    {manage && <section className="course-stats" aria-label="Course statistics"><div className="stat-card"><span className="stat-icon"><BookOpen size={18} /></span><div><strong>{stats.total}</strong><span>Total Courses</span></div></div><div className="stat-card"><span className="stat-icon"><Clock3 size={18} /></span><div><strong>{stats.drafts}</strong><span>Drafts</span></div></div><div className="stat-card"><span className="stat-icon"><CheckCircle2 size={18} /></span><div><strong>{stats.published}</strong><span>Published</span></div></div></section>}

    {feedback && !modalOpen && <div className={`course-feedback ${feedback.type}`} role="status">{feedback.text}<button type="button" aria-label="Dismiss message" onClick={() => setFeedback(null)}><X size={16} /></button></div>}
    {error && <div className="course-error" role="alert"><div><strong>{error.includes('permission') ? 'Unable to load courses' : 'Something went wrong'}</strong><p>{error}</p></div><button type="button" onClick={load}>Try Again</button></div>}

    {loading ? <section className="course-grid" aria-label="Loading courses"><CourseSkeleton /><CourseSkeleton /><CourseSkeleton /></section> : !error && !items.length ? <section className="course-empty"><span className="empty-icon"><BookOpen size={28} /></span><h2>No courses yet</h2><p>{manage ? 'Create your first course and start building your learning content.' : 'Published courses will appear here when they are ready.'}</p>{manage && <button className="primary-button" type="button" onClick={openCreate}><Plus size={18} /> Create Course</button>}</section> : <section className="course-grid">{items.map((course) => <article className="course-card" key={course._id}>
      <div className="course-thumbnail">{course.thumbnail ? <img src={course.thumbnail} alt="" /> : <BookOpen size={34} />}<span className={`course-status ${course.status.toLowerCase()}`}>{course.status === 'PUBLISHED' ? 'Published' : 'Draft'}</span></div>
      <div className="course-card-body"><div className="course-card-title"><div><h2>{course.title}</h2><p>{course.description || 'No description added yet.'}</p><p className="course-instructor">Created by: {course.teacherId?.name || 'Course team'}</p></div>{manage && <button className="icon-button" type="button" aria-label={`Actions for ${course.title}`}><MoreHorizontal size={19} /></button>}</div><div className="course-meta"><span>₹{course.price}</span><span><CalendarDays size={14} /> {new Date(course.createdAt).toLocaleDateString()}</span></div>
        <div className="course-actions"><button type="button" onClick={() => navigate(`/courses/${course._id}`)}>View</button>{manage && <><button type="button" onClick={() => openEdit(course)}><Pencil size={14} /> Edit</button><button type="button" onClick={() => navigate(`/courses/${course._id}`)}>Lessons</button>{course.status === 'DRAFT' && <button type="button" disabled={busyId === course._id} onClick={() => runAction(course, () => publishCourse(course._id), 'Course published successfully.')}><CheckCircle2 size={14} /> Publish</button>}<button className="danger-action" type="button" onClick={() => setConfirmingDelete(course)}><Trash2 size={14} /> Delete</button></>}</div>
      </div>
    </article>)}</section>}

    {modalOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}><section className="course-modal" role="dialog" aria-modal="true" aria-labelledby="course-modal-title"><div className="modal-header"><div><p className="eyebrow">Course details</p><h2 id="course-modal-title">{editingCourse ? 'Edit course' : 'Create a new course'}</h2></div><button className="icon-button" type="button" aria-label="Close" onClick={closeModal}><X size={20} /></button></div><form className="course-form" onSubmit={submit}><label>Course title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} minLength="2" maxLength="160" required /></label><label>Description<span className="helper-text">Give learners a clear overview of what they will learn.</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength="5000" rows="4" /></label><div className="form-row"><label>Price<input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required /></label><label>Thumbnail URL<span className="helper-text">Optional</span><input type="url" value={form.thumbnail} onChange={(event) => setForm({ ...form, thumbnail: event.target.value })} /></label></div>{feedback && <div className={`inline-feedback ${feedback.type}`} role="alert">{feedback.text}</div>}<div className="modal-actions"><button className="secondary-button" type="button" onClick={closeModal}>Cancel</button><button className="primary-button" type="submit" disabled={busyId === 'form'}>{busyId === 'form' ? 'Saving…' : editingCourse ? 'Save changes' : 'Create draft'}</button></div></form></section></div>}
    {confirmingDelete && <div className="modal-backdrop"><section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title"><span className="delete-icon"><Trash2 size={20} /></span><h2 id="delete-title">Delete course?</h2><p>This will permanently delete <strong>{confirmingDelete.title}</strong> and its lessons. This action cannot be undone.</p><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setConfirmingDelete(null)}>Cancel</button><button className="danger-button" type="button" disabled={busyId === confirmingDelete._id} onClick={() => runAction(confirmingDelete, () => deleteCourse(confirmingDelete._id), 'Course deleted successfully.')}>{busyId === confirmingDelete._id ? 'Deleting…' : 'Delete Course'}</button></div></section></div>}
  </main>;
};

export default CoursesPage;
