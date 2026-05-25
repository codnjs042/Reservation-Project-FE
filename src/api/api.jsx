import axios from 'axios';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
  baseURL: 'http://localhost:8081',
  withCredentials: true,
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); // 로컬스토리지에서 토큰 꺼내기
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 헤더 부착
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || "";
    const isAdminRequest = url.includes('/admin');

    // 1. 401 Unauthorized 처리
    if (status === 401) {
      const hasToken = !!localStorage.getItem("accessToken");

      // 토큰이 없거나 이미 재시도를 했던 요청이라면 (더 이상 시도 불가)
      if (!hasToken || originalRequest._retry) {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      // 토큰 갱신 시도
      originalRequest._retry = true;
      try {
        const res = await axios.post('http://localhost:8081/auth/refresh', null, { withCredentials: true });
        const accessToken = res.data.accessToken;
        const decoded = jwtDecode(accessToken);

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("role", decoded.role);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest); // 재요청
      } catch (refreshError) {
        localStorage.clear();
        await Swal.fire({ icon: 'warning', title: '세션 만료', text: '다시 로그인해주세요.' });
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 2. 403 Forbidden 처리
    if (status === 403) {
        await Swal.fire({ icon: 'warning', title: '권한 부족', text: '권한이 없습니다.' });
        window.history.back();
        return Promise.reject(error);
    }

    const errorMessage = error.response?.data?.message || "서버와 통신 중 오류가 발생했습니다.";
    Swal.fire({ icon: 'error', title: '오류 발생', text: errorMessage });

    return Promise.reject(error);
  }
);

export default api;