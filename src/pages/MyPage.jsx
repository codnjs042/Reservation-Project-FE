import React, { useState, useEffect } from 'react';
import api from '../api/api';
import ProfileTab from '../components/myPage/ProfileTab';
import ReservationTab from '../components/myPage/ReservationTab';
import FavoriteTab from '../components/myPage/FavoriteTab';
import AccountTab from '../components/myPage/AccountTab';

const MyPage = () => {
  const mainColor = "#F0602A";
  const skyPointColor = "#7DB3D3";

  // ⭐ 초기값 설정 시 localStorage 확인
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('myPageTab');
    return savedTab || 'profile'; // 저장된 게 있으면 예약내역, 없으면 프로필
  });

  const [userInfo, setUserInfo] = useState(null);

  const fetchUserInfo = () => {
    api.get("/users/me")
      .then(res => setUserInfo(res.data))
      .catch(err => console.error("유저 정보 로드 실패", err));
  };

  useEffect(() => {
    fetchUserInfo();

    // ⭐ 탭 설정에 사용했으니 다음번 접속을 위해 지워줌
    localStorage.removeItem('myPageTab');
  }, []);

  if (!userInfo) return null;

  return (
    <div style={pageWrapper}>
      <aside style={sidebarStyle}>
        <div style={profileSummary}>
          <div style={avatarStyle(skyPointColor)}>{userInfo.nickname[0]}</div>
          <h3 style={userName}>{userInfo.nickname}님</h3>
          <p style={userEmail}>{userInfo.email}</p>
        </div>

        <nav style={menuList}>
          {[
            { id: 'profile', label: '내 정보 관리', icon: '👤' },
            { id: 'history-res', label: '예약 내역', icon: '📅' },
            { id: 'history-fav', label: '관심 매장', icon: '❤️' },
            { id: 'delete', label: '계정 설정', icon: '⚙️' }
          ].map(menu => (
            <button
              key={menu.id}
              onClick={() => setActiveTab(menu.id)}
              style={menuItemStyle(activeTab === menu.id, mainColor)}
            >
              <span style={{ marginRight: '12px', fontSize: '18px' }}>{menu.icon}</span>
              {menu.label}
            </button>
          ))}
        </nav>
      </aside>

      <main style={contentAreaStyle}>
        <header style={contentHeader}>
          <h2 style={contentTitle}>
            {activeTab === 'profile' ? '내 정보 관리' :
             activeTab === 'history-res' ? '예약 내역' :
             activeTab === 'history-fav' ? '관심 매장' : '계정 설정'}
          </h2>
          <div style={titleUnderline(mainColor)} />
        </header>

        <div style={tabContentWrapper}>
          {activeTab === 'profile' && <ProfileTab userInfo={userInfo} onUpdate={fetchUserInfo} />}
          {activeTab === 'history-res' && <ReservationTab />}
          {activeTab === 'history-fav' && <FavoriteTab />}
          {activeTab === 'delete' && <AccountTab />}
        </div>
      </main>
    </div>
  );
};

/* --- 스타일 정의 (기존과 동일) --- */
const pageWrapper = { display: 'flex', width: '96%', maxWidth: '1600px', margin: '40px auto', gap: '30px', minHeight: '800px', alignItems: 'flex-start' };
const sidebarStyle = { width: '280px', flexShrink: 0, background: '#fff', borderRadius: '24px', padding: '40px 20px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', position: 'sticky', top: '40px' };
const profileSummary = { textAlign: 'center', marginBottom: '30px', paddingBottom: '30px', borderBottom: '1px solid #f5f5f5' };
const avatarStyle = (color) => ({ width: '80px', height: '80px', borderRadius: '30px', background: color, color: '#fff', fontSize: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', fontWeight: 'bold', boxShadow: `0 8px 20px rgba(125, 179, 211, 0.3)` });
const userName = { fontSize: '20px', fontWeight: '800', margin: '0 0 5px 0', color: '#1a1a1a' };
const userEmail = { fontSize: '14px', color: '#bbb', margin: 0 };
const menuList = { display: 'flex', flexDirection: 'column', gap: '10px' };
const menuItemStyle = (active, color) => ({ width: '100%', padding: '16px 22px', border: 'none', borderRadius: '16px', background: active ? '#FFF0EA' : 'transparent', color: active ? color : '#666', textAlign: 'left', fontSize: '16px', fontWeight: active ? '800' : '600', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center' });
const contentAreaStyle = { flex: 1, minWidth: '900px', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' };
const contentHeader = { padding: '40px 50px 20px 50px' };
const contentTitle = { fontSize: '28px', margin: 0, fontWeight: '900', color: '#1a1a1a' };
const titleUnderline = (color) => ({ width: '40px', height: '5px', background: color, marginTop: '10px', borderRadius: '10px' });
const tabContentWrapper = { padding: '30px 50px 50px 50px', minHeight: '600px' };

export default MyPage;