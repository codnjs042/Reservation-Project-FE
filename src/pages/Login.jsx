import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // 👈 SweetAlert2 임포트
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const navigate = useNavigate();
  const mainColor = "#F0602A"; // 서비스 메인 컬러 (주황)

  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    api.post("/auth/login", loginData)
      .then(async (res) => {
        const accessToken = res.data.accessToken;
        const decoded = jwtDecode(accessToken);

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("role", decoded.role);
        console.log(localStorage.getItem("accessToken"));
        console.log(localStorage.getItem("role"));
        navigate("/");
      })
      .catch(err => {
      });
  };

  // 준비 중인 서비스 전용 알림
  const handleReadyService = (serviceName) => {
    Swal.fire({
      icon: 'info',
      title: '준비 중입니다',
      text: `${serviceName} 로그인 기능은 현재 점검 중입니다. 잠시만 기다려주세요!`,
      confirmButtonColor: '#7DB3D3',
    });
  };

  return (
    <div style={pageContainer}>
      <div style={loginCard}>

        {/* 🎨 로고 섹션 */}
        <div style={logoContainer} onClick={() => navigate('/')}>
          <img
            src="/images/logo2.png"
            alt="로고"
            style={logoImageStyle}
          />
        </div>

        <header style={headerStyle}>
          <h2 style={titleStyle}>로그인</h2>
          <p style={subTitleStyle}>서비스 이용을 위해 로그인이 필요합니다.</p>
        </header>

        <form onSubmit={handleLogin} style={formStyle}>
          <div style={inputGroup}>
            <label style={labelStyle}>이메일 주소</label>
            <input
              name="email"
              type="email"
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
              placeholder="비밀번호를 입력하세요"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              style={inputStyle}
              required
            />
          </div>

          <button type="submit" style={submitBtnStyle(mainColor)}>
            로그인
          </button>
        </form>

        <div style={footerStyle}>
          아직 계정이 없으신가요?
          <span onClick={() => navigate('/signup')} style={linkStyle(mainColor)}>회원가입 하기</span>
        </div>

        {/* --- 소셜 로그인 영역 --- */}
        <div style={socialSectionStyle}>
          <div style={dividerContainer}>
            <div style={dividerLine}></div>
            <span style={dividerText}>간편 로그인</span>
            <div style={dividerLine}></div>
          </div>

          <div style={socialBtnContainer}>
            {/* 구글 로그인 */}
            <a href="http://localhost:8081/oauth2/authorization/google" style={socialBtnBase}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" style={socialIcon} />
              구글로 계속하기
            </a>

            {/* 카카오 로그인 */}
            <button type="button" onClick={() => handleReadyService('카카오')} style={{ ...socialBtnBase, background: '#FEE500', border: 'none', color: '#3C1E1E' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo.svg" alt="Kakao" style={socialIcon} />
              카카오로 계속하기
            </button>

            {/* 네이버 로그인 */}
            <button type="button" onClick={() => handleReadyService('네이버')} style={{ ...socialBtnBase, background: '#03C75A', border: 'none', color: '#fff' }}>
              <span style={{ fontWeight: '900', marginRight: '12px', fontSize: '18px', fontFamily: 'serif' }}>N</span>
              네이버로 계속하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- 🎨 스타일 상수는 동일 (유지) --- */
const pageContainer = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px' };
const loginCard = { width: '100%', maxWidth: '480px', backgroundColor: '#fff', padding: '50px 40px', borderRadius: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.06)', textAlign: 'center' };
const logoContainer = { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px', cursor: 'pointer' };
const logoImageStyle = { height: '150px', width: 'auto', objectFit: 'contain' };
const headerStyle = { marginBottom: '35px' };
const titleStyle = { fontSize: '28px', fontWeight: '800', color: '#111', margin: '0 0 8px 0' };
const subTitleStyle = { fontSize: '15px', color: '#888', margin: 0 };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputGroup = { textAlign: 'left' };
const labelStyle = { display: 'block', fontSize: '14px', color: '#555', fontWeight: '700', marginBottom: '8px', paddingLeft: '4px' };
const inputStyle = { width: '100%', padding: '16px 18px', borderRadius: '14px', border: '2.5px solid #f1f3f5', fontSize: '15px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' };
const submitBtnStyle = (color) => ({ width: '100%', padding: '18px', backgroundColor: color, color: '#fff', border: 'none', borderRadius: '16px', fontSize: '17px', fontWeight: '800', cursor: 'pointer', marginTop: '10px', boxShadow: `0 8px 20px rgba(240, 96, 42, 0.2)` });
const footerStyle = { marginTop: '30px', fontSize: '14px', color: '#999' };
const linkStyle = (color) => ({ color: color, cursor: 'pointer', fontWeight: '800', marginLeft: '8px', textDecoration: 'underline' });
const socialSectionStyle = { marginTop: '45px' };
const dividerContainer = { display: 'flex', alignItems: 'center', marginBottom: '25px' };
const dividerLine = { flex: 1, height: '1.5px', backgroundColor: '#f1f3f5' };
const dividerText = { margin: '0 15px', fontSize: '13px', color: '#bbb', fontWeight: '600' };
const socialBtnContainer = { display: 'flex', flexDirection: 'column', gap: '12px' };
const socialBtnBase = { width: '100%', height: '54px', borderRadius: '14px', border: '1px solid #e9ecef', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '700', color: '#495057', textDecoration: 'none', cursor: 'pointer', transition: 'background 0.2s' };
const socialIcon = { width: '20px', height: '20px', marginRight: '12px' };

export default Login;