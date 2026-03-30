import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios';

axios.defaults.withCredentials = true;

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "알 수 없는 에러가 발생했습니다.";

    // 1. 세션 만료 (로그인 튕기기)
    if (status === 401) {
      alert("로그인 세션이 만료되었습니다.");
      localStorage.removeItem("isLoggedIn");
      window.location.href = "/login";
    }

    // 2. 권한 부족 (접근 금지)
    else if (status === 403) {
      alert("이 페이지에 접근할 권한이 없습니다.");
      window.location.href = "/"; // 홈으로 보내버리기
    }

    // 3. 서버가 아예 응답을 못 할 때 (네트워크 에러 등)
    else if (!status) {
      alert("서버와 연결할 수 없습니다. 네트워크를 확인해주세요.");
    }

    // 나머지 에러(400, 500 등)는 각 컴포넌트의 .catch()에서
    // 상세하게 처리할 수 있도록 에러를 그대로 던져줍니다.
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
