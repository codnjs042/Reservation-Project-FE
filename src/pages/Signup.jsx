import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const navigate = useNavigate();

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    password: ''
  });

  // 이메일 중복 체크 여부
  const [isEmailChecked, setIsEmailChecked] = useState(false);

  // 입력값 변경 시 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'email') setIsEmailChecked(false);
  };

  // 1. 이메일 중복 체크 핸들러
  const handleCheckEmail = () => {
    if (!formData.email) return alert("이메일을 입력해주세요.");

    api.get(`/users/check-email?email=${formData.email}`)
      .then(res => {
        if (res.data === false) {
          alert("사용 가능한 이메일입니다.");
          setIsEmailChecked(true);
        } else {
          alert("이미 사용 중인 이메일입니다.");
          setIsEmailChecked(false);
        }
      });
      // .catch는 api.js 인터셉터가 처리함
  };

  // 2. 가입 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEmailChecked) return alert("이메일 중복 체크를 먼저 해주세요.");

    api.post("/users/signup", formData)
      .then(() => {
        alert("회원가입 완료! 🎉");
        navigate("/login");
      });
      // .catch는 api.js 인터셉터가 처리함
  };

  return (
    <div style={pageContainer}>
      <div style={signupCard}>
        <h2 style={titleStyle}>회원가입</h2>
        <p style={subTitleStyle}>함께해서 반가워요! 정보를 입력해주세요.</p>

        <form onSubmit={handleSubmit} style={formStyle}>
          {/* 이메일 입력 섹션 */}
          <div style={inputGroup}>
            <label style={labelStyle}>이메일</label>
            <div style={rowStyle}>
              <input
                name="email"
                placeholder="example@mail.com" // DTO의 @Email 참고
                onChange={handleChange}
                value={formData.email}
                style={inputWithBtnStyle}
              />
              <button
                type="button"
                onClick={handleCheckEmail}
                style={isEmailChecked ? checkedBtnStyle : checkBtnStyle}
              >
                {isEmailChecked ? '확인됨' : '중복확인'}
              </button>
            </div>
          </div>

          {/* 닉네임 입력 섹션 */}
          <div style={inputGroup}>
            <label style={labelStyle}>닉네임</label>
            <input
              name="nickname"
              placeholder="2~15자 (한글, 영문, 숫자)" // DTO의 @Pattern 참고
              onChange={handleChange}
              value={formData.nickname}
              style={inputStyle}
            />
          </div>

          {/* 비밀번호 입력 섹션 */}
          <div style={inputGroup}>
            <label style={labelStyle}>비밀번호</label>
            <input
              name="password"
              type="password"
              placeholder="8~15자 (영문, 숫자, 특수문자 조합)" // DTO의 @Pattern 참고
              onChange={handleChange}
              value={formData.password}
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={!isEmailChecked}
            style={!isEmailChecked ? disabledSubmitBtn : submitBtnStyle}
          >
            가입하기
          </button>
        </form>

        <div style={footerStyle}>
          이미 계정이 있으신가요? <span onClick={() => navigate('/login')} style={linkStyle}>로그인하기</span>
        </div>
      </div>
    </div>
  );
}

// --- Styles (동일하게 유지) ---
const mainColor = "#F0602A";
const skyPointColor = "#7DB3D3";

const pageContainer = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#f9f9f9', // 연한 그레이 배경으로 카드 부각
  padding: '20px'
};

const signupCard = {
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
  color: mainColor, // 메인 컬러로 강조
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

const rowStyle = {
  display: 'flex',
  gap: '10px'
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

const inputWithBtnStyle = { ...inputStyle, flex: 1 };

const checkBtnStyle = {
  padding: '0 20px',
  backgroundColor: 'transparent',
  border: `1.5px solid ${skyPointColor}`, // 스카이 포인트 컬러
  color: skyPointColor,
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: '600',
  whiteSpace: 'nowrap',
  transition: '0.3s'
};

const checkedBtnStyle = {
  ...checkBtnStyle,
  backgroundColor: skyPointColor,
  color: '#fff',
  cursor: 'default',
  border: `1.5px solid ${skyPointColor}`
};

const submitBtnStyle = {
  width: '100%',
  padding: '16px',
  backgroundColor: mainColor, // 메인 컬러
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '15px',
  boxShadow: `0 4px 14px rgba(240, 96, 42, 0.3)`, // 메인 컬러 그림자
  transition: 'transform 0.2s, background-color 0.2s'
};

const disabledSubmitBtn = {
  ...submitBtnStyle,
  backgroundColor: '#ccc',
  boxShadow: 'none',
  cursor: 'not-allowed'
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

export default Signup;