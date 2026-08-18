import apiClient from '../../services/apiClient';

// The backend returns course documents directly. Defaults here bridge older
// documents that predate the current Course schema without changing the model.
export const normalizeCourse = (course) => ({
  ...course,
  thumbnail: course.thumbnail || '',
  price: course.price == null ? 0 : course.price,
  rating: course.rating == null ? 0 : course.rating,
  reviewCount: course.reviewCount == null ? 0 : course.reviewCount,
  duration: course.duration || '0 hours',
  totalLessons: course.totalLessons == null ? 0 : course.totalLessons,
  level: course.level || 'Beginner',
  language: course.language || 'English',
  category: course.category || 'Other',
});

export const listCourses = (params = {}) => apiClient.get('/courses', { params });
export const getCourseDashboard = () => apiClient.get('/courses/dashboard');
export const getCourse = (id) => apiClient.get(`/courses/${id}`);
export const createCourse = (payload) => apiClient.post('/courses', payload);
export const updateCourse = (id, payload) => apiClient.patch(`/courses/${id}`, payload);
export const deleteCourse = (id) => apiClient.delete(`/courses/${id}`);
export const publishCourse = (id) => apiClient.patch(`/courses/${id}/publish`);
export const listLessons = (courseId) => apiClient.get(`/courses/${courseId}/lessons`);
export const createLesson = (courseId, payload) => apiClient.post(`/courses/${courseId}/lessons`, payload);
export const updateLesson = (courseId, lessonId, payload) => apiClient.patch(`/courses/${courseId}/lessons/${lessonId}`, payload);
export const deleteLesson = (courseId, lessonId) => apiClient.delete(`/courses/${courseId}/lessons/${lessonId}`);
export const uploadLessonVideo = (courseId, lessonId, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('video', file);
  return apiClient.post(`/courses/${courseId}/lessons/${lessonId}/video`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
};
