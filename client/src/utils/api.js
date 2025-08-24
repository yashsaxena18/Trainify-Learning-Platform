// src/utils/api.js
export const BASE_URL = "https://trainify-learning-platform.onrender.com/api";

// You can also add other API-related constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register"
  },
  COURSES: {
    GET_ALL: "/courses",
    CREATE: "/courses/create",
    ENROLL: "/courses/:id/enroll"
  },
  USER: {
    PROFILE: "/users/profile",
    ME: "/users/me"
  }
};
