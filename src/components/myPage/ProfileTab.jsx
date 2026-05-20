import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import Swal from 'sweetalert2'; // 👈 SweetAlert2 임포트

const ProfileTab = ({ userInfo, onUpdate }) => {
  const mainColor = "#F0602A"; // 주황 포인트
  const skyPointColor = "#7DB3D3"; // 하늘 포인트

  const [newNickname, setNewNickname] = useState(userInfo.nickname);
  const [newEmail, setNewEmail] = useState(userInfo.email);
  const [isPwEditOpen, setIsPwEditOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPw: '', newPw: '', confirmPw: '' });

  // 공통 Toast 설정
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });

  useEffect(() => {
    setNewNickname(userInfo.nickname);
    setNewEmail(userInfo.email);
  }, [userInfo.nickname, userInfo.email]);

  // 닉네임 변경 로직
  const handleNicknameUpdate = async () => {
    try {
      const response = await api.patch(`/users/me/nickname`, { nickname: newNickname });
        Toast.fire({ icon: 'success', title: '닉네임이 변경되었습니다.' });
        if (onUpdate) onUpdate();
    } catch (err) {
    }
  };

  // 이메일 변경 로직
  const handleEmailUpdate = async () => {
    try {
      const response = await api.patch(`/users/me/email`, { email: newEmail });
        Toast.fire({ icon: 'success', title: '이메일이 변경되었습니다.' });
        if (onUpdate) onUpdate();
    } catch (err) {
    }
  };

  // 비밀번호 변경 로직
  const handlePasswordUpdate = async () => {
    try {
      await api.patch("/users/me/password", passwordData);

      await Swal.fire({
        icon: 'success',
        title: '비밀번호 변경 완료',
        text: '다시 로그인해주세요.',
        confirmButtonColor: mainColor,
        allowOutsideClick: false
      });

      localStorage.clear();
      window.location.href = "/login";
    } catch (err) {
    }
  };

  const renderLoginType = (type) => {
    switch (type) {
      case 'KAKAO': return { label: '카카오 로그인', color: '#FEE500', textColor: '#3C1E1E' };
      case 'NAVER': return { label: '네이버 로그인', color: '#03C75A', textColor: '#fff' };
      case 'GOOGLE': return { label: '구글 로그인', color: '#fff', border: '#eee', textColor: '#757575' };
      default: return { label: '일반 로그인', color: '#f4f4f4', textColor: '#666' };
    }
  };

  const loginInfo = renderLoginType(userInfo.loginType);
  const isSocialUser = userInfo.loginType !== 'LOCAL';

  return (
    <div style={containerStyle}>
      <div style={formWrapper}>
        <h3 style={sectionTitle(mainColor)}>내 정보 설정</h3>

        <div style={infoCard}>
          <div style={infoRow}>
            <span style={infoLabel}>회원 등급</span>
            <span style={roleBadgeStyle(userInfo.role, skyPointColor)}>
              {userInfo.role === 'ADMIN' ? 'Master 관리자' :
               userInfo.role === 'OWNER' ? 'Partner 점주' : 'Family 일반'}
            </span>
          </div>

          <div style={infoRow}>
            <span style={infoLabel}>가입 경로</span>
            <span style={loginTypeBadge(loginInfo)}>
              {loginInfo.label}
            </span>
          </div>

          <div style={infoRow}>
            <span style={infoLabel}>아이디</span>
            <span style={staticTextStyle}>{userInfo.username}</span>
          </div>

          <div style={infoRow}>
            <span style={infoLabel}>닉네임</span>
            <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
              <input
                style={inputStyle}
                value={newNickname}
                onChange={e => setNewNickname(e.target.value)}
              />
              <button style={pointBtnStyle(mainColor)} onClick={handleNicknameUpdate}>변경</button>
            </div>
          </div>

          <div style={infoRow}>
            <span style={infoLabel}>이메일</span>
            <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
              <input
                style={inputStyle}
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
              />
              <button style={pointBtnStyle(mainColor)} onClick={handleEmailUpdate}>변경</button>
            </div>
          </div>
        </div>

        <div style={pwSectionContainer}>
          <div style={pwHeader}>
            <div>
              <h4 style={{ margin: 0, fontSize: '16px', color: '#333' }}>비밀번호 보안</h4>
              <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#999' }}>
                {isSocialUser ? "소셜 로그인은 해당 서비스에서 비밀번호를 관리합니다." : "주기적인 변경으로 개인정보를 보호하세요."}
              </p>
            </div>
            {!isSocialUser && (
              <button style={pwToggleBtn(isPwEditOpen)} onClick={() => setIsPwEditOpen(!isPwEditOpen)}>
                {isPwEditOpen ? '닫기' : '수정하기'}
              </button>
            )}
          </div>

          {!isSocialUser && isPwEditOpen && (
            <div style={pwEditBox}>
              <div style={fieldGroup}>
                <label style={fieldLabel}>현재 비밀번호</label>
                <input type="password" style={pwInput} placeholder="현재 비밀번호 입력" onChange={e => setPasswordData({...passwordData, currentPw: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={fieldGroup}>
                  <label style={fieldLabel}>새 비밀번호</label>
                  <input type="password" style={pwInput} placeholder="8자 이상" onChange={e => setPasswordData({...passwordData, newPw: e.target.value})} />
                </div>
                <div style={fieldGroup}>
                  <label style={fieldLabel}>새 비밀번호 확인</label>
                  <input type="password" style={pwInput} placeholder="다시 입력" onChange={e => setPasswordData({...passwordData, confirmPw: e.target.value})} />
                </div>
              </div>
              <button style={applyBtnStyle(mainColor)} onClick={handlePasswordUpdate}>비밀번호 변경 완료</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* --- 스타일 정의 (기존 유지) --- */
const containerStyle = { width: '100%', display: 'flex', justifyContent: 'center', padding: '10px 0' };
const formWrapper = { width: '100%', maxWidth: '850px', padding: '0 20px' };
const sectionTitle = (color) => ({ fontSize: '24px', fontWeight: '900', marginBottom: '30px', color: '#1a1a1a', borderLeft: `6px solid ${color}`, paddingLeft: '15px' });
const infoCard = { background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', marginBottom: '40px' };
const infoRow = { display: 'flex', alignItems: 'center', marginBottom: '25px' };
const infoLabel = { width: '150px', fontWeight: '700', color: '#666', fontSize: '15px' };
const staticTextStyle = { color: '#1a1a1a', fontWeight: '600', fontSize: '15px' };
const inputStyle = { flex: 1, padding: '12px 16px', border: '2px solid #eee', borderRadius: '12px', fontSize: '15px', outline: 'none' };
const pointBtnStyle = (color) => ({ padding: '0 25px', background: color, color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' });
const roleBadgeStyle = (role, sky) => {
  let config = { bg: '#F0F7FB', color: sky }; // 기본 (USER)

  if (role === 'ADMIN') {
    config = { bg: '#F3E5F5', color: '#7B1FA2' }; // 관리자 (보라색 계열)
  } else if (role === 'OWNER') {
    config = { bg: '#FFF0EA', color: '#F0602A' }; // 점주 (주황색 계열)
  }

  return {
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    background: config.bg,
    color: config.color,
    border: `1px solid ${config.color}`
  };
};
const loginTypeBadge = (info) => ({ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', background: info.color, color: info.textColor, border: info.border ? `1px solid ${info.border}` : 'none' });
const pwSectionContainer = { background: '#fff', border: '1px solid #eee', borderRadius: '24px', overflow: 'hidden' };
const pwHeader = { padding: '25px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAFA' };
const pwToggleBtn = (isOpen) => ({ padding: '8px 18px', borderRadius: '10px', border: '1px solid #ddd', background: isOpen ? '#333' : '#fff', color: isOpen ? '#fff' : '#333', cursor: 'pointer', fontWeight: 'bold' });
const pwEditBox = { padding: '30px', borderTop: '1px solid #eee', background: '#fff' };
const fieldGroup = { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' };
const fieldLabel = { fontSize: '13px', fontWeight: 'bold', color: '#888' };
const pwInput = { ...inputStyle, width: '100%', boxSizing: 'border-box' };
const applyBtnStyle = (color) => ({ width: '100%', marginTop: '10px', padding: '15px', background: color, color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' });

export default ProfileTab;