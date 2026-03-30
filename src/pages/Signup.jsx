import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    password: ''
  });

  const [isEmailChecked, setIsEmailChecked] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'email') setIsEmailChecked(false);
  };

  const handleCheckEmail = () => {
    if (!formData.email) return alert("이메일을 입력해주세요.");

    axios.get(`http://localhost:8081/users/check-email?email=${formData.email}`)
      .then(res => {
        if (res.data === false) {
          alert("사용 가능한 이메일입니다.");
          setIsEmailChecked(true);
        } else {
          alert("이미 사용 중인 이메일입니다.");
          setIsEmailChecked(false);
        }
      })
      .catch(() => alert("중복 체크 중 오류가 발생했습니다."));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEmailChecked) return alert("이메일 중복 체크를 먼저 해주세요.");

    axios.post("http://localhost:8081/users/signup", formData)
      .then(() => {
        alert("회원가입 완료! 🎉");
        navigate("/login");
      })
      .catch(err => alert("가입 실패: " + err.response?.data));
  };

  return (
    <div style={pageContainer}>
      <div style={signupCard}>
        <h2 style={titleStyle}>회원가입</h2>
        <p style={subTitleStyle}>함께해서 반가워요! 정보를 입력해주세요.</p>

        <form onSubmit={handleSubmit} style={formStyle}>
          {/* 이메일 섹션 */}
          <div style={inputGroup}>
            <label style={labelStyle}>이메일</label>
            <div style={rowStyle}>
              <input
                name="email"
                placeholder="example@mail.com"
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

          {/* 닉네임 섹션 */}
          <div style={inputGroup}>
            <label style={labelStyle}>닉네임</label>
            <input
              name="nickname"
              placeholder="닉네임"
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* 비밀번호 섹션 */}
          <div style={inputGroup}>
            <label style={labelStyle}>비밀번호</label>
            <input
              name="password"
              type="password"
              placeholder="8자 이상 입력해주세요"
              onChange={handleChange}
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

// --- ✨ Styles (화면을 확 살려주는 스타일 정의) ---

const pageContainer = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#f8f9fa',
  padding: '20px'
};

const signupCard = {
  width: '100%',
  maxWidth: '400px',
  backgroundColor: '#fff',
  padding: '40px',
  borderRadius: '16px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
  textAlign: 'center'
};

const titleStyle = { margin: '0 0 10px 0', fontSize: '1.8rem', color: '#1a1a1a', fontWeight: 'bold' };
const subTitleStyle = { margin: '0 0 30px 0', fontSize: '0.9rem', color: '#666' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputGroup = { textAlign: 'left' };
const labelStyle = { display: 'block', fontSize: '0.85rem', color: '#444', fontWeight: '600', marginBottom: '8px' };

const rowStyle = { display: 'flex', gap: '8px' };

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

const inputWithBtnStyle = { ...inputStyle, flex: 1 };

const checkBtnStyle = {
  padding: '0 15px',
  backgroundColor: '#fff',
  border: '1px solid #1890ff',
  color: '#1890ff',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontWeight: 'bold',
  whiteSpace: 'nowrap'
};

const checkedBtnStyle = { ...checkBtnStyle, backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', color: '#40a9ff', cursor: 'default' };

const submitBtnStyle = {
  width: '100%',
  padding: '14px',
  backgroundColor: '#1890ff',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '10px',
  transition: '0.3s'
};

const disabledSubmitBtn = { ...submitBtnStyle, backgroundColor: '#bae7ff', cursor: 'not-allowed' };

const footerStyle = { marginTop: '25px', fontSize: '0.9rem', color: '#888' };
const linkStyle = { color: '#1890ff', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' };

export default Signup;