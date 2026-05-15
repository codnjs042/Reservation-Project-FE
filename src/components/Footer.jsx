import React from 'react';
import Swal from 'sweetalert2';

function Footer() {
  const mainColor = "#F0602A";
  const skyPointColor = "#7DB3D3";

  const contents = {
    terms: `
      <div style="text-align: left; font-size: 13px; max-height: 300px; overflow-y: auto; padding: 10px;">
        <h4 style="color: ${skyPointColor}">제1조 (목적)</h4>
        <p>본 약관은 'Reservation Project'가 제공하는 예약 및 관련 서비스의 이용과 관련하여 규정함을 목적으로 합니다.</p>
        <h4 style="color: ${skyPointColor}">제2조 (용어의 정의)</h4>
        <p>1. "서비스"란 이용자가 식당 등을 예약할 수 있도록 제공하는 플랫폼을 의미합니다.</p>
        <h4 style="color: ${skyPointColor}">제3조 (노쇼 정책)</h4>
        <p>사전 연락 없는 '노쇼' 발생 시 향후 서비스 이용에 제한이 있을 수 있습니다.</p>
      </div>
    `,
    privacy: `
      <div style="text-align: left; font-size: 13px; max-height: 300px; overflow-y: auto; padding: 10px;">
        <h4 style="color: ${mainColor}">1. 개인정보 수집항목</h4>
        <p>- 필수항목: 성명, 휴대전화번호, 예약 일시</p>
        <h4 style="color: ${mainColor}">2. 보유 및 이용기간</h4>
        <p>이용자의 개인정보는 원칙적으로 <b>서비스 탈퇴 시 혹은 목적 달성 후 즉시 파기</b>합니다.</p>
      </div>
    `,
    cs: `
      <div style="text-align: center; padding: 20px;">
        <h3 style="color: ${skyPointColor}">고객센터</h3>
        <p style="font-size: 16px;">이메일: <b>test@test.com</b></p>
        <p style="color: #bbb; font-size: 13px;">운영시간: 평일 09:00 - 18:00</p>
      </div>
    `
  };

  const handleAlert = (menu, type) => {
    Swal.fire({
      title: `<span style="font-size: 18px; color: ${type === 'privacy' ? mainColor : skyPointColor}">${menu}</span>`,
      html: contents[type],
      confirmButtonText: '닫기',
      confirmButtonColor: type === 'privacy' ? mainColor : skyPointColor,
      background: '#1a1a1a',
      color: '#ffffff',
      width: '500px',
    });
  };

  const linkStyle = { cursor: 'pointer', transition: '0.2s ease', fontSize: '13px' };

  return (
    <footer style={footerWrapper}>
      <div style={contentContainer}>

        {/* 상단 섹션: 로고와 메뉴를 한 줄에 가깝게 배치 */}
        <div style={topRow}>
          <h2 style={logoStyle}><span style={{ color: skyPointColor }}>RESERVATION PROJECT</span></h2>

          <div style={menuGroup}>
            <span style={{ ...linkStyle, color: mainColor, fontWeight: 'bold' }} onClick={() => handleAlert('이용약관', 'terms')} onMouseOver={(e) => e.target.style.color = skyPointColor} onMouseOut={(e) => e.target.style.color = '#ffffff'}>이용약관</span>
            <span style={{ ...linkStyle, color: mainColor, fontWeight: 'bold' }} onClick={() => handleAlert('개인정보처리방침', 'privacy')}>개인정보처리방침</span>
            <span style={{ ...linkStyle, color: mainColor, fontWeight: 'bold' }} onClick={() => handleAlert('고객센터', 'cs')} onMouseOver={(e) => e.target.style.color = skyPointColor} onMouseOut={(e) => e.target.style.color = '#ffffff'}>고객센터</span>
          </div>
        </div>

        {/* 하단 섹션: 카피라이트 (여백 최소화) */}
        <div style={bottomRow}>
          <p style={copyStyle}>
            © 2026 Reservation Project. | <span style={{ color: skyPointColor }}>Spring Boot</span> & <span style={{ color: mainColor }}>React</span>
          </p>
        </div>

      </div>
    </footer>
  );
}

/* --- Slim Styles --- */
const footerWrapper = {
  background: '#000000',
  color: '#ffffff',
  padding: '25px 20px',    // 💡 50px에서 25px로 대폭 축소
  borderTop: '1px solid #222',
  marginTop: '0',           // 💡 흰 줄 방지
  width: '100%',
  boxSizing: 'border-box'
};

const contentContainer = {
  maxWidth: '1000px',
  margin: '0 auto',
};

const topRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px',    // 💡 아래 줄과의 간격 축소
  flexWrap: 'wrap',
  gap: '15px'
};

const logoStyle = {
  fontSize: '16px',        // 💡 로고 크기 축소
  letterSpacing: '1px',
  margin: 0,
  fontWeight: '800'
};

const menuGroup = {
  display: 'flex',
  gap: '25px',             // 💡 메뉴 간격 조절
};

const bottomRow = {
  borderTop: '1px solid #111',
  paddingTop: '15px'
};

const copyStyle = {
  color: '#555',
  fontSize: '11px',
  margin: 0,
  letterSpacing: '0.5px'
};

export default Footer;