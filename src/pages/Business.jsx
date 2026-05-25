import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import Swal from 'sweetalert2';
import { Store, MapPin, Heart, Settings, ChevronRight, PlusCircle } from 'lucide-react';

const Business = () => {
  const navigate = useNavigate();
  const mainColor = "#F0602A";
  const role = localStorage.getItem("role");
  const isAdmin = role === "ROLE_ADMIN";
  const isOwner = role === "ROLE_OWNER";
  const accessDashboard = isAdmin || isOwner;

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryMap = {
    "KOREAN": "한식", "SNACK": "분식", "CHICKEN": "치킨",
    "ASIAN": "동양식", "WESTERN": "서양식", "FASTFOOD": "패스트푸드",
    "BUFFET": "뷔페", "FUSION": "퓨전"
  };

  useEffect(() => {
    if (accessDashboard) fetchStores();
    else setLoading(false);
  }, [accessDashboard]);

  const fetchStores = async () => {
    try {
      const res = await api.get("/owners/stores");
      setStores(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("데이터 로드 실패:", err);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusUpdate = async (storeId, newStatus) => {
    try {
      await api.patch(`/owners/stores/${storeId}/status`, { status: newStatus });
      setStores(prev => prev.map(s => s.id === storeId ? { ...s, status: newStatus } : s));
      Swal.fire({
        title: '상태 변경 완료',
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err) {
    }
  };

  // 배지 및 관리 버튼 클릭 시 특정 매장과 특정 탭 정보를 가지고 이동하는 핸들러
  const handleNavigateToStore = (storeId, tabKey) => {
    navigate(`/business/my-store`, {
      state: { storeId, activeTab: tabKey }
    });
  };

  if (loading) return <div style={centerStyle}>비즈니스 광장으로 입장 중입니다...</div>;

  return (
    <div style={widePageWrapper}>
      <div style={mainContainer}>
        <main style={mainSection}>
          {(accessDashboard) ? (
            <>
              {/* 상단 헤더 */}
              <header style={headerFlex}>
                <div>
                  <h1 style={titleStyle}>Owner Dashboard</h1>
                  <p style={subTitle}>등록된 매장의 상세 정보와 운영 현황을 관리하세요.</p>
                </div>
                <button onClick={() => navigate("/business/new-store")} style={headerAddBtn(mainColor)}>
                  <PlusCircle size={18} /> 신규 매장 등록
                </button>
              </header>

              {/* 요약 통계 */}
              <div style={summaryRow}>
                <div style={summaryCard}>
                  <span style={summaryLabel}>총 관리 매장</span>
                  <strong style={summaryValue}>{stores.length}<span style={{fontSize: '16px', marginLeft: '4px'}}>개</span></strong>
                </div>
              </div>

              {/* 매장 리스트 테이블 */}
              <div style={tableWrapper}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={theadTr}>
                      <th style={thStyle}>매장/카테고리</th>
                      <th style={thStyle}>위치 정보</th>
                      <th style={thStyle}>관심수</th>
                      <th style={thStyle}>영업 상태</th>
                      <th style={thStyle}>설정 현황</th>
                      <th style={thStyle}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.length === 0 ? (
                      <tr><td colSpan="6" style={emptyTd}>등록된 매장이 없습니다. 매장을 등록해 보세요!</td></tr>
                    ) : (
                      stores.map(store => (
                        <tr key={store.id} style={tbodyTr}>
                          {/* 매장명 & 카테고리 */}
                          <td style={tdStyle}>
                            <div style={storeInfoMain}>
                              <div style={avatar(mainColor)}>{store.name[0]}</div>
                              <div>
                                <div style={sName}>{store.name}</div>
                                <span style={categoryBadge}>
                                  {categoryMap[store.category] || store.category}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 주소 상세 */}
                          <td style={tdStyle}>
                            <div style={addressBox}>
                              <div style={sAddr}>{store.address}</div>
                              <div style={sDetailAddr}>{store.detailAddress}</div>
                            </div>
                          </td>

                          {/* 관심수(Favorites) */}
                          <td style={tdStyle}>
                            <div style={favoriteBox}>
                              <Heart size={14} fill="#f43f5e" color="#f43f5e" />
                              <span style={favCount}>{store.favorites.toLocaleString()}</span>
                            </div>
                          </td>

                          {/* 영업 상태 변경 */}
                          <td style={tdStyle}>
                            <select
                              value={store.status}
                              onChange={(e) => handleQuickStatusUpdate(store.id, e.target.value)}
                              style={statusSelect(store.status)}
                            >
                              <option value="OPEN">영업중</option>
                              <option value="READY">준비중</option>
                              <option value="HIDDEN">일시중지</option>
                            </select>
                          </td>

                          {/* 설정 현황 배지 (클릭 시 해당 매장의 해당 탭으로 이동) */}
                          <td style={tdStyle}>
                            <div style={badgeRow}>
                              <span
                                onClick={() => handleNavigateToStore(store.id, 'schedules')}
                                style={store.hasSchedule ? okBadge : noBadge}
                                title="클릭 시 영업 시간 설정으로 이동"
                              >
                                스케줄
                              </span>
                              <span
                                onClick={() => handleNavigateToStore(store.id, 'tables')}
                                style={store.hasTable ? okBadge : noBadge}
                                title="클릭 시 테이블 관리로 이동"
                              >
                                테이블
                              </span>
                            </div>
                          </td>

                          {/* 관리 버튼 (클릭 시 해당 매장의 예약 현황 탭으로 이동) */}
                          <td style={tdStyle}>
                            <button
                              onClick={() => handleNavigateToStore(store.id, 'reservations')}
                              style={manageBtn}
                            >
                              관리 <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            /* 일반 유저용 화면 */
            <>
              <header style={{ marginBottom: '40px' }}>
                <h1 style={titleStyle}>Business Portal</h1>
                <p style={subTitle}>광장맛집과 함께 성장할 파트너를 기다립니다.</p>
              </header>

              <div style={heroBanner}>
                <div style={heroText}>
                  <span style={heroBadge}>PARTNER SHIP</span>
                  <h2 style={heroTitle}>광장맛집의 비즈니스 파트너가 되어보세요.</h2>
                  <p style={heroSub}>매장 홍보부터 운영 관리까지 스마트하게 해결됩니다.</p>
                  <button onClick={() => navigate("/business/new-store")} style={heroBtn(mainColor)}>
                    점주 권한 신청하기
                  </button>
                </div>
                <div style={heroImage}>🏢</div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

/* --- 스타일 정의 --- */
const widePageWrapper = { backgroundColor: '#f8fafb', minHeight: '100vh' };
const mainContainer = { maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' };
const mainSection = { width: '100%' };

const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' };
const titleStyle = { fontSize: '30px', fontWeight: '900', margin: 0, color: '#1e293b', letterSpacing: '-0.5px' };
const subTitle = { color: '#64748b', marginTop: '8px', fontSize: '15px' };

const summaryRow = { marginBottom: '25px' };
const summaryCard = { width: 'fit-content', padding: '20px 35px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #edf2f7', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
const summaryLabel = { fontSize: '13px', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' };
const summaryValue = { fontSize: '26px', fontWeight: '900', color: '#F0602A' };

const tableWrapper = { backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #edf2f7', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const theadTr = { backgroundColor: '#f8fafc', borderBottom: '1px solid #edf2f7' };
const thStyle = { padding: '15px 20px', color: '#475569', fontSize: '13px', textAlign: 'left', fontWeight: '800' };
const tbodyTr = { borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' };
const tdStyle = { padding: '18px 20px', verticalAlign: 'middle' };

const storeInfoMain = { display: 'flex', alignItems: 'center', gap: '12px' };
const avatar = (color) => ({ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: `${color}10`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px' });
const sName = { fontWeight: '800', color: '#1e293b', fontSize: '15px', marginBottom: '2px' };
const categoryBadge = { padding: '2px 8px', backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: '6px', fontSize: '11px', fontWeight: '700' };

const addressBox = { display: 'flex', flexDirection: 'column', gap: '2px' };
const sAddr = { fontSize: '13px', color: '#334155', fontWeight: '600' };
const sDetailAddr = { fontSize: '12px', color: '#94a3b8' };

const favoriteBox = { display: 'flex', alignItems: 'center', gap: '6px' };
const favCount = { fontSize: '14px', fontWeight: '800', color: '#334155' };

const statusSelect = (status) => ({
  padding: '6px 12px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  fontSize: '12px',
  fontWeight: '800',
  color: status === 'OPEN' ? '#059669' : '#64748b',
  backgroundColor: '#fff',
  cursor: 'pointer',
  outline: 'none'
});

/* 배지 공통 스타일에 cursor 및 호버 트랜지션 추가 */
const badgeRow = { display: 'flex', gap: '6px' };
const bBase = { padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.15s ease-in-out' };
const okBadge = { ...bBase, backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #dcfce7' };
const noBadge = { ...bBase, backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' };

const manageBtn = { display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' };
const headerAddBtn = (color) => ({ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: color, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '14px' });

const heroBanner = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: '30px', padding: '60px', border: '1px solid #edf2f7', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' };
const heroText = { flex: 1 };
const heroBadge = { backgroundColor: '#fff0eb', color: '#F0602A', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '800', marginBottom: '20px', display: 'inline-block' };
const heroTitle = { fontSize: '32px', fontWeight: '900', marginBottom: '16px', color: '#1e293b', letterSpacing: '-1px' };
const heroSub = { color: '#64748b', marginBottom: '35px', fontSize: '17px' };
const heroBtn = (color) => ({ padding: '16px 36px', backgroundColor: color, color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', fontSize: '16px' });
const heroImage = { fontSize: '100px', flex: 0.3, textAlign: 'right' };

const centerStyle = { textAlign: 'center', padding: '200px', color: '#64748b', fontSize: '18px', fontWeight: '700' };
const emptyTd = { padding: '100px', textAlign: 'center', color: '#94a3b8', fontSize: '15px' };

export default Business;