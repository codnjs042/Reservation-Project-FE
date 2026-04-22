import React from 'react';

const BusinessStoreCard = ({ store, navigate, onUpdateStatus }) => {
  // 백엔드 DTO의 필드명을 기반으로 판별
  const canOpen = store.hasSchedule && store.hasTable;
  const isHidden = store.status === 'HIDDEN';
  const isOpen = store.status === 'OPEN';

  const handleToggleOpen = () => {
    if (isHidden) return alert("숨김 상태에서는 영업을 시작할 수 없습니다.");
    if (!canOpen && !isOpen) {
      alert("영업시간과 테이블 설정을 완료해주세요.");
      return;
    }
    // 현재 OPEN이면 READY로, READY이면 OPEN으로 변경
    onUpdateStatus(store.id, isOpen ? 'READY' : 'OPEN');
  };

  return (
    <div style={{ ...cardStyle, background: isHidden ? '#f9f9f9' : '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#333', display: 'flex', alignItems: 'center' }}>
            {store.name}
            {isHidden && <span style={tagStyle}>숨김중</span>}
            {!canOpen && <span style={warningTagStyle}>설정 미완료</span>}
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#666', margin: 0, display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#ff4d4f', marginRight: '4px' }}>♥</span>
            찜 {store.favorites || 0}
          </p>
        </div>

        <div style={{ textAlign: 'center', marginLeft: '15px' }}>
          <div
            onClick={handleToggleOpen}
            style={{
              ...toggleBase(isOpen && !isHidden),
              opacity: (!canOpen && !isOpen) ? 0.4 : 1,
              cursor: (!canOpen && !isOpen) ? 'not-allowed' : 'pointer'
            }}
          >
            <div style={toggleCircle(isOpen && !isHidden)} />
          </div>
          <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: isOpen && !isHidden ? '#52c41a' : '#bfbfbf' }}>
            {isOpen && !isHidden ? '영업 중' : '준비 중'}
          </span>
        </div>
      </div>

      <div style={divider}></div>

      {!canOpen ? (
        <button onClick={() => {
          if (!store.hasSchedule) navigate("/business/new-store/schedules", { state: { storeId: store.id, hasTable: store.hasTable } });
          else navigate("/business/new-store/tables", { state: { storeId: store.id, hasSchedule: true } });
        }} style={actionBtnStyle('#faad14')}>필수 설정 완료하기</button>
      ) : (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate("/business/my-store", { state: { storeId: store.id } })}
            style={actionBtnStyle('#1890ff')}
          >
            관리·예약
          </button>
          <button
            onClick={() => {
              if(window.confirm(isHidden ? "매장을 노출하시겠습니까?" : "매장을 숨기시겠습니까?")) {
                onUpdateStatus(store.id, isHidden ? 'READY' : 'HIDDEN');
              }
            }}
            style={actionBtnStyle(isHidden ? '#1890ff' : '#ff4d4f', true)}
          >
            {isHidden ? '노출 재개' : '숨김'}
          </button>
        </div>
      )}
    </div>
  );
};

// 스타일 정의 (BusinessStoreCard 전용)
const cardStyle = { padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' };
const divider = { height: '1px', background: '#eee', margin: '20px 0' };
const tagStyle = { fontSize: '0.7rem', background: '#eee', color: '#888', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' };
const warningTagStyle = { fontSize: '0.7rem', background: '#fff2e8', color: '#fa8c16', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', border: '1px solid #ffbb96' };
const toggleBase = (active) => ({ width: '40px', height: '20px', backgroundColor: active ? '#52c41a' : '#bfbfbf', borderRadius: '20px', padding: '2px', transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: active ? 'flex-end' : 'flex-start', marginBottom: '4px' });
const toggleCircle = () => ({ width: '16px', height: '16px', backgroundColor: '#fff', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' });
const actionBtnStyle = (color, outline = false) => ({ flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', background: outline ? '#fff' : color, color: outline ? color : '#fff', border: `1px solid ${color}`, transition: '0.2s' });

export default BusinessStoreCard;