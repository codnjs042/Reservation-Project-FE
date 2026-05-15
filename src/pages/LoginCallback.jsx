import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const LoginCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/users/me")
      .then(res => {
        if (res.data) {
          localStorage.setItem("user", JSON.stringify(res.data));
        }
        navigate("/", { replace: true });
      })
      .catch((err) => {
        console.error("소셜 로그인 인증 실패", err);
        localStorage.clear();
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>로그인 처리 중입니다. 잠시만 기다려주세요...</p>
    </div>
  );
};

export default LoginCallback;