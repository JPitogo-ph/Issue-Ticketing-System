import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const api = axios.create({
  baseURL: import.meta.env.BASE_URL,
  withCredentials: true,
});

//401 Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().setUser(null);
    }
    return Promise.reject(error);
  },
);
