import apiClient from '../../services/apiClient';

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
