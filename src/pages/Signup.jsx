import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // 👈 SweetAlert2 임포트

const Signup = () => {
  const navigate = useNavigate();
  const mainColor = "#F0602A"; // 주황
  const skyPointColor = "#7DB3D3"; // 하늘

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

  // 이메일 중복 확인 (Swal 적용)
  const handleCheckEmail = () => {
    if (!formData.email) {
      return Swal.fire({
        icon: 'warning',
        title: '이메일 입력',
        text: '중복 확인을 위해 이메일을 먼저 입력해주세요.',
        confirmButtonColor: skyPointColor
      });
    }

    api.get(`/users/check-email?email=${formData.email}`)
      .then(res => {
        if (res.data === false) {
          Swal.fire({
            icon: 'success',
            title: '사용 가능',
            text: '사용 가능한 이메일입니다.',
            confirmButtonColor: skyPointColor
          });
          setIsEmailChecked(true);
        } else {
          setIsEmailChecked(false);
        }
      })
      .catch(() => {
      });
  };

  // 회원가입 제출 (Swal 적용)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isEmailChecked) {
      return Swal.fire({
        icon: 'warning',
        title: '중복 확인 필수',
        text: '이메일 중복 체크를 먼저 진행해주세요.',
        confirmButtonColor: mainColor
      });
    }

    api.post("/users/signup", formData)
      .then(async () => {
        await Swal.fire({
          icon: 'success',
          title: '가입을 환영합니다! 🎉',
          text: '회원가입이 완료되었습니다. 로그인을 진행해주세요.',
          confirmButtonColor: mainColor,
          allowOutsideClick: false
        });
        navigate("/login");
      })
      .catch(err => {
        // 인터셉터에서 이미 에러를 띄우겠지만, 추가적인 비즈니스 로직 필요 시 작성
        console.error(err);
      });
  };

  return (
    <div style={pageContainer}>
      <div style={signupCard}>

        {/* 🎨 로고 섹션 */}
        <div style={logoContainer} onClick={() => navigate('/')}>
          <img
            src="/images/logo2.png"
            alt="로고"
            style={logoImageStyle}
          />
        </div>

        <header style={headerStyle}>
          <h2 style={titleStyle}>회원가입</h2>
          <p style={subTitleStyle}>서비스 이용을 위해 회원가입이 필요합니다.</p>
        </header>

        <form onSubmit={handleSubmit} style={formStyle}>
          {/* 이메일 섹션 */}
          <div style={inputGroup}>
            <label style={labelStyle}>이메일 주소</label>
            <div style={rowStyle}>
              <input
                name="email"
                type="email"
                placeholder="example@mail.com"
                onChange={handleChange}
                value={formData.email}
                style={inputWithBtnStyle}
                required
              />
              <button
                type="button"
                onClick={handleCheckEmail}
                style={isEmailChecked ? checkedBtnStyle(skyPointColor) : checkBtnStyle(skyPointColor)}
              >
                {isEmailChecked ? '확인 완료' : '중복 확인'}
              </button>
            </div>
          </div>

          {/* 닉네임 섹션 */}
          <div style={inputGroup}>
            <label style={labelStyle}>닉네임</label>
            <input
              name="nickname"
              placeholder="2~15자 (한글, 영문, 숫자)"
              onChange={handleChange}
              value={formData.nickname}
              style={inputStyle}
              required
            />
          </div>

          {/* 비밀번호 섹션 */}
          <div style={inputGroup}>
            <label style={labelStyle}>비밀번호</label>
            <input
              name="password"
              type="password"
              placeholder="8~15자 (영문, 숫자, 특수문자 조합)"
              onChange={handleChange}
              value={formData.password}
              style={inputStyle}
              required
            />
          </div>

          <button
            type="submit"
            disabled={!isEmailChecked}
            style={isEmailChecked ? submitBtnStyle(mainColor) : disabledSubmitBtn}
          >
            가입하기
          </button>
        </form>

        <div style={footerStyle}>
          이미 계정이 있으신가요?
          <span onClick={() => navigate('/login')} style={linkStyle(mainColor)}>로그인하러 가기</span>
        </div>
      </div>
    </div>
  );
};

/* --- 🎨 웹 고도화 스타일 상수 (기존 유지) --- */
const pageContainer = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px' };
const signupCard = { width: '100%', maxWidth: '480px', backgroundColor: '#fff', padding: '50px 45px', borderRadius: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.06)', textAlign: 'center' };
const logoContainer = { display: 'flex', justifyContent: 'center', marginBottom: '25px', cursor: 'pointer' };
const logoImageStyle = { height: '150px', width: 'auto', objectFit: 'contain' };
const headerStyle = { marginBottom: '35px' };
const titleStyle = { fontSize: '28px', fontWeight: '800', color: '#111', margin: '0 0 8px 0' };
const subTitleStyle = { fontSize: '15px', color: '#999', margin: 0 };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '22px' };
const inputGroup = { textAlign: 'left' };
const labelStyle = { display: 'block', fontSize: '14px', color: '#555', fontWeight: '700', marginBottom: '8px', paddingLeft: '4px' };
const rowStyle = { display: 'flex', gap: '10px', alignItems: 'center' };
const inputStyle = { width: '100%', padding: '16px 18px', borderRadius: '16px', border: '2px solid #f1f3f5', fontSize: '15px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' };
const inputWithBtnStyle = { ...inputStyle, flex: 1 };
const checkBtnStyle = (color) => ({ padding: '0 18px', height: '54px', backgroundColor: '#fff', border: `2px solid ${color}`, color: color, borderRadius: '16px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap', transition: 'all 0.2s ease' });
const checkedBtnStyle = (color) => ({ ...checkBtnStyle(color), backgroundColor: color, color: '#fff', cursor: 'default' });
const submitBtnStyle = (color) => ({ width: '100%', padding: '18px', backgroundColor: color, color: '#fff', border: 'none', borderRadius: '18px', fontSize: '17px', fontWeight: '800', cursor: 'pointer', marginTop: '15px', boxShadow: `0 8px 20px rgba(240, 96, 42, 0.2)`, transition: 'transform 0.2s' });
const disabledSubmitBtn = { width: '100%', padding: '18px', backgroundColor: '#e9ecef', color: '#adb5bd', border: 'none', borderRadius: '18px', fontSize: '17px', fontWeight: '800', cursor: 'not-allowed', marginTop: '15px' };
const footerStyle = { marginTop: '35px', fontSize: '14px', color: '#999' };
const linkStyle = (color) => ({ color: color, cursor: 'pointer', fontWeight: '800', marginLeft: '8px', textDecoration: 'underline' });

export default Signup;