import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/api';
import ReservationTab from '../components/myStore/ReservationTab';
import TableTab from '../components/myStore/TableTab';
import ScheduleTab from '../components/myStore/ScheduleTab';
import StoreInfoTab from '../components/myStore/StoreInfoTab';

const MyStore = () => {
  const mainColor = "#F0602A"; // 주황
  const skyPointColor = "#7DB3D3"; // 하늘

  // 탭 메뉴 설정
  const menuItems = [
    { key: 'reservations', label: '예약 현황' },
    { key: 'tables', label: '테이블 관리' },
    { key: 'schedules', label: '영업 시간' },
    { key: 'info', label: '매장 정보' }
  ];

  const location = useLocation();
  const passedStoreId = location.state?.storeId;
  const passedTab = location.state?.activeTab;

  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [activeTab, setActiveTab] = useState(passedTab || 'reservations');

  // 매장 목록 로드
  useEffect(() => {
    api.get(`/owners/stores`, { params: { page: 0, size: 100 } })
      .then(res => {
        const data = res.data.content || [];
        setStores(data);

        if (data.length > 0) {
          // Business 페이지에서 전달받은 ID가 있으면 해당 매장 선택, 없으면 첫 번째 매장
          const initialStore = passedStoreId
            ? data.find(s => s.id === parseInt(passedStoreId))
            : data[0];

          setSelectedStore(initialStore || data[0]);
        }
      })
      .catch(err => console.error("매장 목록 로드 실패:", err));
  }, [passedStoreId]);

  // 외부(Business 페이지 등)에서 탭 변경 요청이 올 경우 동기화
  useEffect(() => {
    if (passedTab) setActiveTab(passedTab);
  }, [passedTab]);

  /**
   * 자식 탭(StoreInfoTab)에서 매장 상태(영업중/준비중 등)를 변경했을 때
   * 부모의 상태를 업데이트하여 사이드바에 즉시 반영하는 함수
   */
  const handleStoreStatusUpdate = (storeId, newStatus) => {
    // 1. 전체 매장 리스트 업데이트 (셀렉트 박스 이모지 반영)
    setStores(prev => prev.map(s => s.id === storeId ? { ...s, status: newStatus } : s));

    // 2. 현재 선택된 매장 객체 업데이트 (하단 텍스트 반영)
    if (selectedStore && selectedStore.id === storeId) {
      setSelectedStore(prev => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <div style={pageWrapper}>
      {/* 왼쪽 사이드바: 매장 선택 및 메뉴 */}
      <aside style={sidebarStyle}>
        <div style={storeSummary}>
            <p style={{fontSize: '12px', color: '#999', marginBottom: '8px'}}>매장 선택</p>
            <select
              value={selectedStore?.id || ''}
              onChange={(e) => {
                // 1. 선택된 매장 변경
                setSelectedStore(stores.find(s => s.id === parseInt(e.target.value)));
                // 2. 매장을 바꿨으므로 첫 번째 탭인 '예약 현황'으로 강제 이동 ◀ 추가된 로직!
                setActiveTab('reservations');
              }}
              style={storeSelectBox}
            >
              {stores.map(s => (
                <option key={s.id} value={s.id}>
                  {s.status === 'OPEN' ? '🟢 ' : (s.status === 'READY' ? '🟠 ' : '🔴 ')}{s.name}
                </option>
              ))}
            </select>
            {selectedStore && (
              <div style={{marginTop: '10px', fontSize: '14px', color: mainColor, fontWeight: 'bold'}}>
                {/* 상태에 따른 텍스트 표시 */}
                {selectedStore.status === 'OPEN' ? '영업 중' :
                 selectedStore.status === 'READY' ? '준비 중' :
                 selectedStore.status === 'HIDDEN' ? '일시 중지' : '상태 정보 없음'}
              </div>
            )}
          </div>
        <nav style={menuList}>
          {menuItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              style={menuItemStyle(activeTab === item.key, mainColor)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* 오른쪽: 메인 콘텐츠 영역 */}
      <main style={contentAreaStyle}>
        <header style={contentHeader}>
          <h2 style={contentTitle}>
            {menuItems.find(i => i.key === activeTab)?.label}
          </h2>
          <div style={titleUnderline(mainColor)} />
        </header>
        <div style={tabContentWrapper}>
          {selectedStore && (
            <>
              {activeTab === 'reservations' && (
                <ReservationTab
                  storeId={selectedStore.id}
                  onPolicyViolation={() => setActiveTab('info')} // ◀ 4번째 탭(info)으로 바꾼 함수를 전달!
                />
              )}
              {activeTab === 'tables' && <TableTab storeId={selectedStore.id} />}
              {activeTab === 'schedules' && <ScheduleTab storeId={selectedStore.id} />}
              {activeTab === 'info' && (
                <StoreInfoTab
                  storeId={selectedStore.id}
                  onStoreStatusUpdate={handleStoreStatusUpdate}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

/* --- 스타일 정의 --- */
const pageWrapper = { display: 'flex', width: '96%', maxWidth: '1600px', margin: '40px auto', gap: '30px', alignItems: 'flex-start' };
const sidebarStyle = { width: '280px', background: '#fff', borderRadius: '24px', padding: '40px 20px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' };
const storeSummary = { textAlign: 'center', marginBottom: '30px', paddingBottom: '30px', borderBottom: '1px solid #f5f5f5' };
const storeSelectBox = { width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #eee', outline: 'none', fontWeight: 'bold', cursor: 'pointer' };
const menuList = { display: 'flex', flexDirection: 'column', gap: '10px' };
const menuItemStyle = (active, color) => ({ width: '100%', padding: '16px 22px', border: 'none', borderRadius: '16px', background: active ? '#FFF0EA' : 'transparent', color: active ? color : '#666', textAlign: 'left', fontSize: '16px', fontWeight: active ? '800' : '600', cursor: 'pointer', transition: 'all 0.2s ease' });
const contentAreaStyle = { flex: 1, background: '#fff', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' };
const contentHeader = { padding: '40px 50px 20px' };
const contentTitle = { fontSize: '28px', margin: 0, fontWeight: '900' };
const titleUnderline = (color) => ({ width: '40px', height: '5px', background: color, marginTop: '10px', borderRadius: '10px' });
const tabContentWrapper = { padding: '30px 50px 50px' };

export default MyStore;