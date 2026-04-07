import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyPage = () => {
  const navigate = useNavigate();
  const filterPanelRef = useRef(null);
  const filterButtonRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile');
  const [userInfo, setUserInfo] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [reservations, setReservations] = useState([]);

  const [newNickname, setNewNickname] = useState('');
  const [isPwEditOpen, setIsPwEditOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPw: '', newPw: '', confirmPw: '' });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [appliedFilter, setAppliedFilter] = useState({
    startDate: null,
    endDate: null,
    status: []
  });
  const [tempFilter, setTempFilter] = useState({ ...appliedFilter });

  const categoryMap = {
    'KOREAN': '한식',
    'CHINESE': '중식',
    'JAPANESE': '일식',
    'WESTERN': '양식',
    'CAFE': '카페',
    'CHICKEN': '치킨'
  };

  const statusMap = {
    'CONFIRMED': { label: '확정', color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f' },
    'VISITED': { label: '방문완료', color: '#1890ff', bg: '#e6f7ff', border: '#91d5ff' },
    'CANCELED': { label: '취소', color: '#ff4d4f', bg: '#fff1f0', border: '#ffa39e' },
    'REJECTED': { label: '거절', color: '#722ed1', bg: '#f9f0ff', border: '#d3adf7' },
    'NO_SHOW': { label: '노쇼', color: '#fa8c16', bg: '#fff7e6', border: '#ffd591' }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target) &&
          filterButtonRef.current && !filterButtonRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { fetchUserData(); }, []);

  useEffect(() => {
    if (activeTab === 'history-fav') fetchFavorites();
    if (activeTab === 'history-res') fetchReservations();
  }, [activeTab, appliedFilter]);

  const fetchUserData = () => {
    axios.get("http://localhost:8081/users/me").then(res => {
      setUserInfo(res.data);
      setNewNickname(res.data.nickname);
    }).catch(() => navigate("/login"));
  };

  const fetchFavorites = () => {
    axios.get("http://localhost:8081/users/me/favorites")
      .then(res => setFavorites(res.data))
      .catch(err => console.error("관심 매장 로딩 실패", err));
  };

  const fetchReservations = () => {
    axios.get("http://localhost:8081/users/me/reservations", {
      params: {
        startDate: appliedFilter.startDate,
        endDate: appliedFilter.endDate,
        status: appliedFilter.status.length > 0 ? appliedFilter.status.join(',') : null
      }
    }).then(res => setReservations(res.data));
  };

  const handleQuickPeriod = (m) => {
    setSelectedPeriod(m);
    const start = new Date();
    start.setMonth(start.getMonth() - m);
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    setAppliedFilter(prev => ({
      ...prev,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    }));
  };

  const handleNicknameUpdate = () => {
    axios.patch(`http://localhost:8081/users/me/nickname?nickname=${newNickname}`)
      .then(() => { alert("닉네임 변경 완료"); fetchUserData(); });
  };

  const handlePasswordUpdate = () => {
    if (passwordData.newPw !== passwordData.confirmPw) return alert("새 비밀번호 불일치");
    axios.patch("http://localhost:8081/users/me/password", passwordData)
      .then(() => {
        alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
        localStorage.clear(); sessionStorage.clear();
        window.location.href = "/login";
      })
      .catch(() => alert("현재 비밀번호 불일치 또는 오류 발생"));
  };

  const handleCancelReservation = (id) => {
    if (!window.confirm("예약을 취소하시겠습니까?")) return;
    axios.patch(`http://localhost:8081/users/me/reservations/${id}/cancel`)
      .then(() => { alert("취소되었습니다."); fetchReservations(); });
  };

  const handleUnfavorite = (storeId) => { // 파라미터 이름을 명확히 storeId로!
    if (!window.confirm("관심 매장에서 해제하시겠습니까?")) return;

    // ✅ StoreDetail과 똑같은 주소(http://localhost:8081/favorites/{가게ID})를 호출해야 합니다.
    axios.patch(`http://localhost:8081/favorites/${storeId}`, {}, { withCredentials: true })
      .then(() => {
        alert("해제되었습니다.");
        fetchFavorites(); // 목록 새로고침
      })
      .catch(err => {
        console.error("해제 실패", err);
        alert("해제에 실패했습니다.");
      });
  };

  const handleDeleteAccount = () => {
    if (!window.confirm("정말 탈퇴하시겠습니까? 되돌릴 수 없습니다.")) return;
    axios.delete("http://localhost:8081/users/me").then(() => {
      alert("탈퇴 처리가 완료되었습니다.");
      window.location.href = "/";
    });
  };

  if (!userInfo) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', color: '#333' }}>
      <header style={{ marginBottom: '30px' }}><h2 style={{ fontSize: '26px', fontWeight: '900' }}>마이페이지</h2></header>

      <nav style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '1px solid #eee' }}>
        {['profile', 'history-res', 'history-fav', 'delete'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={navBtnStyle(activeTab === tab)}>
            {tab === 'profile' ? '내 정보' : tab === 'history-res' ? '예약 관리' : tab === 'history-fav' ? '관심 매장' : '계정 관리'}
          </button>
        ))}
      </nav>

      <main style={{ background: '#fff', borderRadius: '12px', minHeight: '400px' }}>

        {activeTab === 'profile' && (
          <div style={{ padding: '20px', maxWidth: '500px' }}>
            <h3 style={sectionTitle}>회원 정보</h3>
            <div style={infoRow}><span style={infoLabel}>권한</span> <span style={roleBadgeStyle(userInfo.role)}>{userInfo.role === 'OWNER' ? '점주' : userInfo.role === 'ADMIN' ? '관리자' : '일반 유저'}</span></div>
            <div style={infoRow}><span style={infoLabel}>가입 경로</span> <span>{userInfo.loginType === 'LOCAL' ? '이메일 직접 가입' : '소셜 간편 로그인'}</span></div>
            <div style={infoRow}><span style={infoLabel}>이메일</span> <span>{userInfo.email}</span></div>
            <div style={{ ...infoRow, alignItems: 'center' }}>
              <span style={infoLabel}>닉네임</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input style={inputStyle} value={newNickname} onChange={e => setNewNickname(e.target.value)} />
                <button style={smallBlackBtn} onClick={handleNicknameUpdate}>변경</button>
              </div>
            </div>
            <div style={{ marginTop: '30px', borderTop: '1px solid #f5f5f5', paddingTop: '20px' }}>
              <button style={outlineBtnStyle} onClick={() => setIsPwEditOpen(!isPwEditOpen)}>비밀번호 변경 {isPwEditOpen ? '▲' : '▼'}</button>
              {isPwEditOpen && (
                <div style={pwBoxStyle}>
                  <input type="password" style={pwInput} placeholder="현재 비밀번호" onChange={e => setPasswordData({...passwordData, currentPw: e.target.value})} />
                  <input type="password" style={pwInput} placeholder="새 비밀번호" onChange={e => setPasswordData({...passwordData, newPw: e.target.value})} />
                  <input type="password" style={pwInput} placeholder="새 비밀번호 확인" onChange={e => setPasswordData({...passwordData, confirmPw: e.target.value})} />
                  <button style={applyBtnStyle} onClick={handlePasswordUpdate}>변경 저장</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history-res' && (
          <div style={{ position: 'relative', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
              <div><h3 style={{ margin: '0 0 10px 0' }}>예약 내역 리스트</h3><div style={{ display: 'flex', gap: '5px' }}>{[1, 3, 6, 12].map(m => (<button key={m} onClick={() => handleQuickPeriod(m)} style={selectedPeriod === m ? activeQuickBtn : smallBtnStyle}>{m === 12 ? '1년' : `${m}개월`}</button>))}</div></div>
              <button ref={filterButtonRef} onClick={() => setIsFilterOpen(!isFilterOpen)} style={filterToggleBtnStyle}>상세 필터 🔍</button>
            </div>
            {isFilterOpen && (
              <div ref={filterPanelRef} style={filterLayerStyle}>
                <label style={labelStyle}>날짜 범위 설정</label><div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}><input type="date" value={tempFilter.startDate || ''} onChange={e => setTempFilter({...tempFilter, startDate: e.target.value})} style={inputStyle} /><input type="date" value={tempFilter.endDate || ''} onChange={e => setTempFilter({...tempFilter, endDate: e.target.value})} style={inputStyle} /></div>
                <label style={labelStyle}>상태 필터</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '20px' }}>{Object.entries(statusMap).map(([key, val]) => (<button key={key} onClick={() => setTempFilter(p => ({...p, status: p.status.includes(key) ? p.status.filter(s => s !== key) : [...p.status, key]}))} style={statusChipStyle(tempFilter.status.includes(key), val.color)}>{val.label}</button>))}</div>
                <button onClick={() => { setAppliedFilter({...tempFilter}); setIsFilterOpen(false); }} style={applyBtnStyle}>필터 적용</button>
              </div>
            )}
            <div style={tableContainer}><table style={tableStyle}><thead><tr style={thRowStyle}><th style={thStyle}>No.</th><th style={thStyle}>상호명</th><th style={thStyle}>일시</th><th style={thStyle}>인원</th><th style={thStyle}>상태</th><th style={thStyle}>관리</th></tr></thead><tbody>{reservations.length > 0 ? reservations.map(res => (<tr key={res.id} style={tdRowStyle}><td style={tdStyle}>{res.id}</td><td style={{ ...tdStyle, fontWeight: 'bold' }}>{res.storeName}</td><td style={tdStyle}>{res.targetDateTime.replace('T', ' ')}</td><td style={tdStyle}>{res.headCount}명</td><td style={tdStyle}><span style={statusBadgeStyle(statusMap[res.status] || {color:'#999', bg:'#f5f5f5'})}>{statusMap[res.status]?.label || res.status}</span></td><td style={tdStyle}>{res.status === 'CONFIRMED' && <button onClick={() => handleCancelReservation(res.id)} style={tableActionBtnStyle}>취소</button>}</td></tr>)) : <tr><td colSpan="6" style={noDataStyle}>예약 내역이 존재하지 않습니다.</td></tr>}</tbody></table></div>
          </div>
        )}

        {/* 3. 관심 매장 탭 */}
        {activeTab === 'history-fav' && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {favorites.length > 0 ? favorites.map(fav => {
              const store = fav.storeResponse || fav.store_response;
              if (!store) return null;

              return (
                <div key={fav.id} style={favListRow}>
                  <div
                    style={favInfoSection}
                    onClick={() => navigate(`/stores/${store.id}`)}
                  >
                    {/* 상단: 카테고리 / 이름 / 영업상태 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={catBadgeStyle}>
                        {categoryMap[store.category] || store.category}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a' }}>
                        {store.name}
                      </h4>
                      <span style={statusBadgeStyle(store.status === 'OPEN' ? {color:'#52c41a', bg:'#f6ffed'} : {color:'#fa8c16', bg:'#fff7e6'})}>
                        {store.status === 'OPEN' ? '영업중' : '준비중'}
                      </span>
                    </div>

                    {/* 하단: 주소와 관심수 (왼쪽에 정렬) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#666', fontSize: '14px' }}>
                      <span>{store.address}</span>
                      <span style={{ color: '#eee' }}>|</span>
                      <span style={{ color: '#ff4d4f', fontWeight: '600' }}>
                        ❤️ 관심 {store.favorites}
                      </span>
                    </div>
                  </div>

                  <button
                    style={favDelBtnRow}
                    onClick={(e) => {
                      e.stopPropagation();
                      // StoreDetail과 동일하게 store.id를 넘겨서 토글 방식으로 해제
                      handleUnfavorite(store.id);
                    }}
                  >
                    찜 해제 💔
                  </button>
                </div>
              );
            }) : <div style={noDataStyle}>찜한 매장이 없습니다.</div>}
          </div>
        )}

        {activeTab === 'delete' && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <h3 style={{ color: '#ff4d4f' }}>계정 삭제 안내</h3>
            <p style={{ color: '#888', marginBottom: '30px' }}>탈퇴 시 모든 예약 기록과 개인 정보가 영구 삭제됩니다.</p>
            <button style={deleteBtnStyle} onClick={handleDeleteAccount}>정말 탈퇴하겠습니다</button>
          </div>
        )}
      </main>
    </div>
  );
};

// --- 스타일링 ---
const navBtnStyle = (active) => ({ padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: active ? 'bold' : 'normal', color: active ? '#1890ff' : '#666', borderBottom: active ? '2px solid #1890ff' : 'none' });
const roleBadgeStyle = (role) => ({ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: '#f5f5f5', color: role === 'OWNER' ? '#fa8c16' : '#1890ff', border: '1px solid #ddd' });
const infoRow = { display: 'flex', marginBottom: '15px', fontSize: '14px' };
const infoLabel = { width: '100px', fontWeight: 'bold', color: '#888' };
const sectionTitle = { fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' };
const inputStyle = { padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' };
const smallBlackBtn = { padding: '8px 12px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const outlineBtnStyle = { padding: '8px 15px', border: '1px solid #ddd', background: '#fff', borderRadius: '6px', cursor: 'pointer' };
const pwBoxStyle = { marginTop: '15px', background: '#f9f9f9', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' };
const pwInput = { ...inputStyle, width: '100%', boxSizing: 'border-box' };
const applyBtnStyle = { padding: '12px', background: '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const filterToggleBtnStyle = { padding: '8px 16px', background: '#f0f2f5', border: '1px solid #d9d9d9', borderRadius: '6px', cursor: 'pointer' };
const filterLayerStyle = { position: 'absolute', top: '70px', right: '0', zIndex: 10, width: '280px', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #eee' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#888' };
const statusChipStyle = (active, color) => ({ padding: '4px 10px', borderRadius: '15px', border: `1px solid ${active ? color : '#eee'}`, background: active ? color : '#fff', color: active ? '#fff' : '#888', cursor: 'pointer', fontSize: '11px' });
const smallBtnStyle = { padding: '5px 12px', background: '#fff', border: '1px solid #ddd', borderRadius: '15px', fontSize: '12px', cursor: 'pointer' };
const activeQuickBtn = { ...smallBtnStyle, background: '#333', color: '#fff', border: '1px solid #333' };
const tableContainer = { overflowX: 'auto', border: '1px solid #eee', borderRadius: '8px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '13px' };
const thRowStyle = { background: '#fafafa', borderBottom: '2px solid #eee' };
const thStyle = { padding: '12px', color: '#888', textAlign: 'left' };
const tdRowStyle = { borderBottom: '1px solid #f0f0f0' };
const tdStyle = { padding: '12px' };
const statusBadgeStyle = (s) => ({ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', color: s.color, background: s.bg });
const tableActionBtnStyle = { padding: '4px 8px', background: '#fff', border: '1px solid #ff4d4f', color: '#ff4d4f', borderRadius: '4px', cursor: 'pointer' };
const deleteBtnStyle = { padding: '15px 40px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };
const noDataStyle = { padding: '60px', textAlign: 'center', color: '#999' };

const favListRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px',
  border: '1px solid #f0f0f0',
  borderRadius: '12px',
  background: '#fff',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
};

const favInfoSection = {
  flex: 1,
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start' // 모든 텍스트를 왼쪽으로 밀착
};

const favDelBtnRow = {
  padding: '10px 16px',
  background: '#fff',
  border: '1px solid #ff4d4f',
  color: '#ff4d4f',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '13px',
  marginLeft: '20px',
  whiteSpace: 'nowrap'
};

const catBadgeStyle = {
  fontSize: '11px',
  padding: '2px 8px',
  background: '#f5f5f5',
  borderRadius: '4px',
  color: '#888',
  fontWeight: '600',
  textTransform: 'uppercase'
};
export default MyPage;