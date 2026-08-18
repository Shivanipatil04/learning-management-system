import apiClient from '../../services/apiClient';

export const listNotifications = () => apiClient.get('/notifications');
export const markNotificationRead = (id) => apiClient.patch(`/notifications/${id}/read`);
export const ignoreNotification = (id) => apiClient.patch(`/notifications/${id}/ignore`);
export const markAllNotificationsRead = () => apiClient.patch('/notifications/read-all');
