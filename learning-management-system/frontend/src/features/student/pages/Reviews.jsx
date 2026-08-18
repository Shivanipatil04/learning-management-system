import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/apiClient';
import { Star, MessageSquare, Edit2, Trash2, CheckCircle } from 'lucide-react';
import '../styles/reviews.css';

const StarRating = ({ rating, setRating, readOnly = false }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={24}
          className={`star ${star <= rating ? 'filled' : ''} ${readOnly ? 'read-only' : 'interactive'}`}
          onClick={() => !readOnly && setRating(star)}
        />
      ))}
    </div>
  );
};

const Reviews = () => {
  const [activeTab, setActiveTab] = useState('course');
  const [reviewable, setReviewable] = useState({ courses: [], teachers: [] });
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [newReviewForms, setNewReviewForms] = useState({});
  const [editingFormData, setEditingFormData] = useState({ rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reviewableRes, mineRes] = await Promise.all([
        apiClient.get('/reviews/reviewable'),
        apiClient.get('/reviews/mine')
      ]);
      
      if (reviewableRes.data.success) setReviewable(reviewableRes.data.data);
      if (mineRes.data.success) setMyReviews(mineRes.data.data);
    } catch (error) {
      console.error('Error fetching review data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (type, targetId) => {
    const isEditing = !!editingId;
    const currentData = isEditing ? editingFormData : (newReviewForms[targetId] || { rating: 0, comment: '' });

    if (currentData.rating === 0) {
      alert("Please select a rating from 1 to 5 stars.");
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        reviewType: type,
        rating: currentData.rating,
        comment: currentData.comment
      };
      
      if (type === 'course') payload.courseId = targetId;
      if (type === 'teacher') payload.teacherId = targetId;
      
      if (isEditing) {
        await apiClient.put(`/reviews/${editingId}`, payload);
        setEditingFormData({ rating: 0, comment: '' });
        setEditingId(null);
      } else {
        await apiClient.post('/reviews', payload);
        setNewReviewForms(prev => {
          const newState = { ...prev };
          delete newState[targetId];
          return newState;
        });
      }
      
      fetchData(); // Refresh all data
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await apiClient.delete(`/reviews/${id}`);
        fetchData();
      } catch (error) {
        alert('Error deleting review');
      }
    }
  };

  const startEdit = (review) => {
    setEditingId(review._id);
    setEditingFormData({ rating: review.rating, comment: review.comment });
    setActiveTab(review.reviewType);
    // Scroll to top or handle UI state
  };

  // Calculate reviewed status dynamically from myReviews
  const reviewedCourses = {};
  const reviewedTeachers = {};

  myReviews.forEach(r => {
    if (r.reviewType === 'course' && r.courseId) {
      const id = typeof r.courseId === 'string' ? r.courseId : r.courseId._id;
      if (id) reviewedCourses[id.toString()] = true;
    }
    if (r.reviewType === 'teacher' && r.teacherId) {
      const id = typeof r.teacherId === 'string' ? r.teacherId : r.teacherId._id;
      if (id) reviewedTeachers[id.toString()] = true;
    }
  });

  const hasReviewed = (type, targetId) => {
    if (!targetId) return false;
    return type === 'course' ? !!reviewedCourses[targetId.toString()] : !!reviewedTeachers[targetId.toString()];
  };

  if (loading) return <div className="reviews-page">Loading reviews...</div>;

  return (
    <div className="reviews-page">
      <div className="page-header">
        <h1>Reviews</h1>
        <p>Share your feedback on courses and teachers to help others.</p>
      </div>

      <div className="reviews-tabs">
        <button className={activeTab === 'course' ? 'active' : ''} onClick={() => setActiveTab('course')}>Course Reviews</button>
        <button className={activeTab === 'teacher' ? 'active' : ''} onClick={() => setActiveTab('teacher')}>Teacher Reviews</button>
        <button className={activeTab === 'mine' ? 'active' : ''} onClick={() => setActiveTab('mine')}>My Reviews ({myReviews.length})</button>
      </div>

      <div className="tab-content">
        {/* COURSE REVIEWS */}
        {activeTab === 'course' && (
          <div className="review-list">
            {reviewable.courses.length === 0 ? (
              <div className="empty-state">You are not enrolled in any courses yet.</div>
            ) : (
              reviewable.courses.map(course => {
                const reviewed = hasReviewed('course', course._id);
                return (
                  <div key={course._id} className="review-card">
                    <div className="review-card-header">
                      {course.thumbnail && <img src={course.thumbnail} alt="thumbnail" className="thumb-small" />}
                      <div>
                        <h3>{course.title}</h3>
                        <p className="subtitle">Instructor: {course.teacher?.name}</p>
                      </div>
                    </div>
                    {reviewed ? (
                      <div className="reviewed-badge">
                        <CheckCircle size={16} /> You have already reviewed this course. Check 'My Reviews' to edit.
                      </div>
                    ) : (
                      <div className="review-form">
                        <StarRating 
                          rating={newReviewForms[course._id]?.rating || 0} 
                          setRating={(r) => setNewReviewForms(prev => ({...prev, [course._id]: {...(prev[course._id] || {comment: ''}), rating: r}}))} 
                        />
                        <textarea 
                          placeholder="Share your experience with this course..."
                          value={newReviewForms[course._id]?.comment || ''}
                          onChange={(e) => setNewReviewForms(prev => ({...prev, [course._id]: {...(prev[course._id] || {rating: 0}), comment: e.target.value}}))}
                        ></textarea>
                        <button className="primary-button" onClick={() => handleReviewSubmit('course', course._id)} disabled={submitting}>
                          {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* TEACHER REVIEWS */}
        {activeTab === 'teacher' && (
          <div className="review-list">
            {reviewable.teachers.length === 0 ? (
              <div className="empty-state">You have not taken courses with any teachers yet.</div>
            ) : (
              reviewable.teachers.map(teacher => {
                const reviewed = hasReviewed('teacher', teacher._id);
                return (
                  <div key={teacher._id} className="review-card">
                    <div className="review-card-header">
                      <div className="teacher-avatar">{teacher.name.charAt(0)}</div>
                      <div>
                        <h3>{teacher.name}</h3>
                        <p className="subtitle">Courses taught: {teacher.coursesTaught.join(', ')}</p>
                      </div>
                    </div>
                    {reviewed ? (
                      <div className="reviewed-badge">
                        <CheckCircle size={16} /> You have already reviewed this teacher. Check 'My Reviews' to edit.
                      </div>
                    ) : (
                      <div className="review-form">
                        <StarRating 
                          rating={newReviewForms[teacher._id]?.rating || 0} 
                          setRating={(r) => setNewReviewForms(prev => ({...prev, [teacher._id]: {...(prev[teacher._id] || {comment: ''}), rating: r}}))} 
                        />
                        <textarea 
                          placeholder="What was it like learning from this instructor?"
                          value={newReviewForms[teacher._id]?.comment || ''}
                          onChange={(e) => setNewReviewForms(prev => ({...prev, [teacher._id]: {...(prev[teacher._id] || {rating: 0}), comment: e.target.value}}))}
                        ></textarea>
                        <button className="primary-button" onClick={() => handleReviewSubmit('teacher', teacher._id)} disabled={submitting}>
                          {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* MY REVIEWS */}
        {activeTab === 'mine' && (
          <div className="my-reviews-list">
            {myReviews.length === 0 ? (
              <div className="empty-state">You haven't submitted any reviews yet.</div>
            ) : (
              myReviews.map(review => (
                <div key={review._id} className="my-review-card">
                  <div className="my-review-header">
                    <span className={`type-badge ${review.reviewType}`}>
                      {review.reviewType === 'course' ? 'Course Review' : 'Teacher Review'}
                    </span>
                    <span className="date">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3>
                    {review.reviewType === 'course' 
                      ? review.courseId?.title || 'Unknown Course' 
                      : review.teacherId?.name || 'Unknown Teacher'}
                  </h3>
                  
                  {editingId === review._id ? (
                    <div className="review-form inline-edit">
                      <StarRating rating={editingFormData.rating} setRating={(r) => setEditingFormData({...editingFormData, rating: r})} />
                      <textarea 
                        value={editingFormData.comment}
                        onChange={(e) => setEditingFormData({...editingFormData, comment: e.target.value})}
                      ></textarea>
                      <div className="edit-actions">
                        <button className="primary-button" onClick={() => handleReviewSubmit(review.reviewType, review.reviewType === 'course' ? review.courseId?._id : review.teacherId?._id)}>Save Changes</button>
                        <button className="text-button" onClick={() => { setEditingId(null); setEditingFormData({rating: 0, comment: ''}); }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="stars-display">
                        <StarRating rating={review.rating} readOnly={true} />
                      </div>
                      <p className="comment-text">{review.comment || <em>No written feedback provided.</em>}</p>
                      <div className="review-actions">
                        <button className="text-button" onClick={() => startEdit(review)}><Edit2 size={16} /> Edit</button>
                        <button className="text-button text-red" onClick={() => handleDelete(review._id)}><Trash2 size={16} /> Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
