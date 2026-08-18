import apiClient from '../../services/apiClient';

export const enrollStudent = (courseId) => apiClient.post(`/enrollments/${courseId}`);
export const listStudentEnrollments = () => apiClient.get('/enrollments');
export const getStudentEnrollment = (enrollmentId) => apiClient.get(`/enrollments/${enrollmentId}`);
export const getCourseEnrollment = (courseId) => apiClient.get(`/enrollments/course/${courseId}`);
export const markLessonComplete = (courseId, lessonId) => apiClient.patch(`/enrollments/course/${courseId}/lessons/${lessonId}/progress`);
export const getCourseProgress = (courseId) => apiClient.get(`/enrollments/course/${courseId}/progress`);
