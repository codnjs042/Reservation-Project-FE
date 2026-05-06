import React from 'react';
import Swal from 'sweetalert2';

function Footer() {
  const mainColor = "#F0602A";
  const skyPointColor = "#7DB3D3";

  // --- 실제 약관 및 방침 데이터 ---
  const contents = {
    terms: `
      <div style="text-align: left; font-size: 13px; max-height: 400px; overflow-y: auto;">
        <h4 style="color: ${skyPointColor}">제1조 (목적)</h4>
        <p>본 약관은 'Reservation Project'(이하 "서비스")가 제공하는 예약 및 관련 서비스의 이용과 관련하여 서비스와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>

        <h4 style="color: ${skyPointColor}">제2조 (용어의 정의)</h4>
        <p>1. "서비스"란 이용자가 식당 등을 예약할 수 있도록 제공하는 플랫폼을 의미합니다.<br>
        2. "이용자"란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</p>

        <h4 style="color: ${skyPointColor}">제3조 (예약 및 승인)</h4>
        <p>1. 이용자는 서비스가 정한 절차에 따라 예약 정보를 입력해야 합니다.<br>
        2. 예약은 관리자의 승인 또는 시스템의 자동 확정 메시지가 발송된 시점에 성립합니다.</p>

        <h4 style="color: ${skyPointColor}">제4조 (노쇼 및 취소 정책)</h4>
        <p>1. 이용자는 예약 시간을 엄수해야 하며, 변경 사항 발생 시 즉시 취소해야 합니다.<br>
        2. 사전 연락 없는 '노쇼(No-Show)' 발생 시 향후 서비스 이용에 제한이 있을 수 있습니다.</p>
      </div>
    `,
    privacy: `
      <div style="text-align: left; font-size: 13px; max-height: 400px; overflow-y: auto;">
        <h4 style="color: ${mainColor}">1. 개인정보 수집항목</h4>
        <p>- 필수항목: 성명, 휴대전화번호, 예약 일시, 인원<br>
        - 자동수집항목: 접속 로그, 쿠키, 접속 IP 정보</p>

        <h4 style="color: ${mainColor}">2. 수집 및 이용 목적</h4>
        <p>- 예약 서비스 제공 및 본인 확인<br>
        - 예약 확정/취소 관련 안내 메시지 발송<br>
        - 서비스 이용 기록 분석 및 품질 개선</p>

        <h4 style="color: ${mainColor}">3. 개인정보의 보유 및 이용기간</h4>
        <p>이용자의 개인정보는 원칙적으로 <b>서비스 탈퇴 시 혹은 목적 달성 후 즉시 파기</b>합니다. 단, 관계 법령(전자상거래법 등)에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.</p>

        <h4 style="color: ${mainColor}">4. 동의 거부 권리</h4>
        <p>이용자는 개인정보 수집에 대한 동의를 거부할 권리가 있으나, 거부 시 예약 서비스 이용이 불가능할 수 있습니다.</p>
      </div>
    `,
    cs: `
      <div style="text-align: center;">
        <h3 style="color: ${skyPointColor}">고객센터</h3>
        <p style="font-size: 16px; margin: 20px 0;">이메일: <b>test@test.com</b></p>
        <p style="color: #bbb;">운영시간: 평일 09:00 - 18:00<br>(점심시간 12:00 - 13:00 제외)</p>
      </div>
    `
  };

  const handleAlert = (menu, type) => {
    Swal.fire({
      title: `<span style="color: ${type === 'privacy' ? mainColor : skyPointColor}">${menu}</span>`,
      html: contents[type],
      confirmButtonText: '닫기',
      confirmButtonColor: type === 'privacy' ? mainColor : skyPointColor,
      background: '#1a1a1a',
      color: '#ffffff',
      width: '600px',
      scrollbarPadding: false
    });
  };

  const linkStyle = { cursor: 'pointer', transition: '0.3s ease', fontSize: '14px' };

  return (
    <footer style={{ background: '#000000', color: '#ffffff', padding: '50px 20px', borderTop: '1px solid #333', marginTop: 'auto', textAlign: 'center' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ color: skyPointColor, fontSize: '20px', letterSpacing: '1px', margin: 0 }}>RESERVATION PROJECT</h2>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '30px' }}>
          <span style={linkStyle} onClick={() => handleAlert('이용약관', 'terms')} onMouseOver={(e) => e.target.style.color = mainColor} onMouseOut={(e) => e.target.style.color = '#ffffff'}>이용약관</span>
          <span style={{ ...linkStyle, color: mainColor, fontWeight: 'bold' }} onClick={() => handleAlert('개인정보처리방침', 'privacy')}>개인정보처리방침</span>
          <span style={linkStyle} onClick={() => handleAlert('고객센터', 'cs')} onMouseOver={(e) => e.target.style.color = skyPointColor} onMouseOut={(e) => e.target.style.color = '#ffffff'}>고객센터</span>
        </div>

        <div style={{ borderTop: '1px solid #222', paddingTop: '20px' }}>
          <p style={{ color: '#666', fontSize: '12px', lineHeight: '1.8' }}>
            © 2026 Reservation Project. All rights reserved.<br />
            Backend: <span style={{ color: skyPointColor }}>Spring Boot</span> | Frontend: <span style={{ color: mainColor }}>React & Vite</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;