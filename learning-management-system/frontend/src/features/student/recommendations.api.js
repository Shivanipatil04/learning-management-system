import apiClient from '../../services/apiClient';

export const getRecommendations = () => apiClient.get('/courses/recommendations');
