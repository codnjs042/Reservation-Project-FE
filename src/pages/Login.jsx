import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const handleLogin = (e) => {
    e.preventDefault();

    axios.post("http://localhost:8081/users/login", loginData)
      .then(res => {
        alert("로그인 성공! 환영합니다. 🎉");
        localStorage.setItem("user", JSON.stringify(res.data));
        localStorage.setItem("isLoggedIn", "true");
        navigate("/");
        window.location.reload();
      })
      .catch(err => {
        alert("로그인 실패: " + (err.response?.data || "이메일 또는 비밀번호를 확인하세요."));
      });
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
              placeholder="이메일을 입력해주세요"
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

// --- ✨ Styles (회원가입 페이지와 통일된 테마) ---

const pageContainer = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#f8f9fa', // 연한 회색 배경
  padding: '20px'
};

const loginCard = {
  width: '100%',
  maxWidth: '400px',
  backgroundColor: '#fff',
  padding: '40px',
  borderRadius: '16px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
  textAlign: 'center'
};

const titleStyle = {
  margin: '0 0 10px 0',
  fontSize: '1.8rem',
  color: '#1a1a1a',
  fontWeight: 'bold'
};

const subTitleStyle = {
  margin: '0 0 30px 0',
  fontSize: '0.9rem',
  color: '#666'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const inputGroup = {
  textAlign: 'left'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  color: '#444',
  fontWeight: '600',
  marginBottom: '8px'
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '1rem',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const submitBtnStyle = {
  width: '100%',
  padding: '14px',
  backgroundColor: '#1890ff', // 회원가입과 동일한 포인트 컬러
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '10px',
  transition: '0.3s'
};

const footerStyle = {
  marginTop: '25px',
  fontSize: '0.9rem',
  color: '#888'
};

const linkStyle = {
  color: '#1890ff',
  cursor: 'pointer',
  fontWeight: 'bold',
  textDecoration: 'underline'
};

export default Login;