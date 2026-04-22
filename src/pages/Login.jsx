import React, { useState } from 'react';
import api from '../api/api'; // axios 대신 인터셉터가 적용된 api 사용
import { useNavigate } from 'react-router-dom';

const mainColor = "#F0602A";

function Login() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const handleLogin = (e) => {
    e.preventDefault();

    // 인터셉터가 적용된 api.post 사용
    api.post("/users/login", loginData)
      .then(res => {
        alert("로그인 성공! 환영합니다. 🎉");
        localStorage.setItem("user", JSON.stringify(res.data));
        localStorage.setItem("isLoggedIn", "true");
        navigate("/");
        window.location.reload();
      });
      // .catch는 api.js 인터셉터가 공통 에러 메시지(400, 401 등)를 alert로 띄워줌!
  };

  return (
    <div style={pageContainer}>
      <div style={loginCard}>
        <h2 style={titleStyle}>로그인</h2>
        <p style={subTitleStyle}>서비스 이용을 위해 로그인이 필요합니다.</p>

        <form onSubmit={handleLogin} style={formStyle}>
          {/* 이메일 입력 섹션 */}
          <div style={inputGroup}>
            <label style={labelStyle}>이메일</label>
            <input
              name="email"
              placeholder="example@mail.com"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              style={inputStyle}
              required
            />
          </div>

          {/* 비밀번호 입력 섹션 */}
          <div style={inputGroup}>
            <label style={labelStyle}>비밀번호</label>
            <input
              name="password"
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              style={inputStyle}
              required
            />
          </div>

          <button type="submit" style={submitBtnStyle}>
            로그인
          </button>
        </form>

        <div style={footerStyle}>
          아직 계정이 없으신가요? <span onClick={() => navigate('/signup')} style={linkStyle}>회원가입</span>
        </div>
      </div>
    </div>
  );
}

// --- 🎨 Styles (Signup 페이지와 통일된 mainColor 테마) ---

const pageContainer = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#f9f9f9',
  padding: '20px'
};

const loginCard = {
  width: '100%',
  maxWidth: '420px',
  backgroundColor: '#fff',
  padding: '40px',
  borderRadius: '20px',
  boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
  textAlign: 'center'
};

const titleStyle = {
  margin: '0 0 10px 0',
  fontSize: '2rem',
  color: mainColor,
  fontWeight: '800'
};

const subTitleStyle = {
  margin: '0 0 30px 0',
  fontSize: '0.95rem',
  color: '#777'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '22px'
};

const inputGroup = {
  textAlign: 'left'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  color: '#333',
  fontWeight: '700',
  marginBottom: '8px',
  paddingLeft: '4px'
};

const inputStyle = {
  width: '100%',
  padding: '14px 18px',
  borderRadius: '10px',
  border: '1.5px solid #eee',
  fontSize: '1rem',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'all 0.3s ease',
};

const submitBtnStyle = {
  width: '100%',
  padding: '16px',
  backgroundColor: mainColor,
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '15px',
  boxShadow: `0 4px 14px rgba(240, 96, 42, 0.3)`,
  transition: 'all 0.2s'
};

const footerStyle = {
  marginTop: '30px',
  fontSize: '0.9rem',
  color: '#999'
};

const linkStyle = {
  color: mainColor,
  cursor: 'pointer',
  fontWeight: '700',
  marginLeft: '8px',
  textDecoration: 'none'
};

export default Login;