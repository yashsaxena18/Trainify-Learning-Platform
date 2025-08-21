// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('trainify_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('trainify_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Add to your existing API service
export const trackCourseView = async (courseId) => {
  try {
    const response = await API.post(`/courses/${courseId}/view`);
    return response.data;
  } catch (error) {
    console.error('Failed to track course view:', error);
    throw error;
  }
};

export const trackCoursePageView = async (courseId) => {
  try {
    const response = await API.post(`/courses/${courseId}/page-view`);
    return response.data;
  } catch (error) {
    console.error('Failed to track page view:', error);
    throw error;
  }
};

export const trackLectureView = async (courseId, lectureId) => {
  try {
    const response = await API.post(`/courses/${courseId}/lectures/${lectureId}/view`);
    return response.data;
  } catch (error) {
    console.error('Failed to track lecture view:', error);
    throw error;
  }
};


// ✅ Default export
export default API;
