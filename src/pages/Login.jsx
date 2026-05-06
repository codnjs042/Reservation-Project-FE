import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

const mainColor = "#F0602A";

function Login() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    api.post("/users/login", loginData)
      .then(res => {
        alert("로그인 성공! 🎉");
        localStorage.setItem("user", JSON.stringify(res.data));
        localStorage.setItem("isLoggedIn", "true");
        navigate("/");
        window.location.reload();
      })
      .catch(err => {
        alert("로그인에 실패했습니다. 정보를 확인해주세요.");
        console.error(err);
      });
  };

  return (
    <div style={pageContainer}>
      <div style={loginCard}>
        <h2 style={titleStyle}>로그인</h2>
        <p style={subTitleStyle}>서비스 이용을 위해 로그인이 필요합니다.</p>

        <form onSubmit={handleLogin} style={formStyle}>
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

          <button type="submit" style={submitBtnStyle}>로그인</button>
        </form>

        <div style={footerStyle}>
          아직 계정이 없으신가요? <span onClick={() => navigate('/signup')} style={linkStyle}>회원가입</span>
        </div>

        <div style={socialSectionStyle}>
          <div style={dividerContainer}>
            <div style={dividerLine}></div>
            <span style={dividerText}>또는 간편 로그인</span>
            <div style={dividerLine}></div>
          </div>

          <div style={socialBtnContainer}>
            {/* 1. 구글 로그인 버튼 */}
            <a href="http://localhost:8081/oauth2/authorization/google" style={googleBaseStyle}>
              <div style={googleContentWrapper}>
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block', width: '18px', height: '18px', marginRight: '10px' }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span style={googleTextStyle}>구글 로그인</span>
              </div>
            </a>

            {/* 2. 카카오 로그인 버튼 */}
            <div onClick={() => alert('서비스 준비 중입니다.')} style={imageBtnWrapper}>
              <img src="/images/kakao_login.png" alt="카카오 로그인" style={fullImageStyle} />
            </div>

            {/* 3. 네이버 로그인 버튼 */}
            <div onClick={() => alert('서비스 준비 중입니다.')} style={imageBtnWrapper}>
              <img src="/images/naver_login.png" alt="네이버 로그인" style={fullImageStyle} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 🎨 Styles ---
const pageContainer = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f9f9f9', padding: '20px' };
const loginCard = { width: '100%', maxWidth: '420px', backgroundColor: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', textAlign: 'center' };
const titleStyle = { margin: '0 0 10px 0', fontSize: '2.2rem', color: mainColor, fontWeight: '900' };
const subTitleStyle = { margin: '0 0 35px 0', fontSize: '0.95rem', color: '#888' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '18px' };
const inputGroup = { textAlign: 'left' };
const labelStyle = { display: 'block', fontSize: '0.85rem', color: '#444', fontWeight: '800', marginBottom: '8px', paddingLeft: '4px' };
const inputStyle = { width: '100%', padding: '16px 20px', borderRadius: '12px', border: '1.5px solid #eee', fontSize: '1rem', boxSizing: 'border-box' };
const submitBtnStyle = { width: '100%', padding: '18px', backgroundColor: mainColor, color: '#fff', border: 'none', borderRadius: '14px', fontSize: '1.1rem', fontWeight: '900', cursor: 'pointer', marginTop: '10px' };
const footerStyle = { marginTop: '30px', fontSize: '0.9rem', color: '#999' };
const linkStyle = { color: mainColor, cursor: 'pointer', fontWeight: '800', marginLeft: '8px' };
const socialSectionStyle = { marginTop: '40px' };
const dividerContainer = { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' };
const dividerLine = { flex: 1, height: '1px', backgroundColor: '#f0f0f0' };
const dividerText = { margin: '0 15px', fontSize: '0.8rem', color: '#bbb', fontWeight: '600' };

// 📍 소셜 버튼 컨테이너 (중앙 정렬 및 간격)
const socialBtnContainer = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px'
};

// 📍 구글 버튼 스타일 (이미지 버튼과 크기 맞춤)
const googleBaseStyle = {
  width: '300px',
  height: '45px',
  border: '1px solid #dadce0',
  borderRadius: '6px',
  backgroundColor: '#fff',
  textDecoration: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box'
};

const googleContentWrapper = { display: 'flex', alignItems: 'center', justifyContent: 'center' };
const googleTextStyle = { fontSize: '14px', fontWeight: '500', color: '#3c4043', fontFamily: 'Roboto, arial, sans-serif' };

// 📍 카카오/네이버 이미지 버튼용 래퍼 (크기 고정)
const imageBtnWrapper = {
  width: '300px',
  height: '45px',
  cursor: 'pointer',
  borderRadius: '6px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const fullImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'contain', // 이미지 비율 유지하며 꽉 차게
  display: 'block'
};

export default Login;