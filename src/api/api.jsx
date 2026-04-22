import axios from 'axios';

axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: 'http://localhost:8081', // 백엔드 주소
});

// 응답 가로채기 (Response Interceptor)
api.interceptors.response.use(
  (response) => response, // 성공하면 그냥 통과
  (error) => {
    // 에러가 났을 때 공통 로직 실행
    const errorMessage = error.response?.data?.message || "알 수 없는 에러가 발생했습니다.";

    alert(errorMessage); // 여기서 한 방에 처리!

    return Promise.reject(error); // 필요하면 컴포넌트 쪽 catch에서도 잡을 수 있게 전달
  }
);

export default api;