import apiClient from '../../services/apiClient';

export const getMyProfile = () => apiClient.get('/users/me');
export const updateMyProfile = (payload) => apiClient.patch('/users/me', payload);
