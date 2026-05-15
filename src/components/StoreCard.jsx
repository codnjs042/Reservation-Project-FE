import React from 'react';

// 컬러 상수
const mainColor = "#F0602A";

export const categoryMap = {
  "KOREAN": "한식", "SNACK": "분식", "CHICKEN": "치킨",
  "ASIAN": "동양식", "WESTERN": "서양식", "FASTFOOD": "패스트푸드",
  "BUFFET": "뷔페", "FUSION": "퓨전"
};

export const StoreCard = ({ store, navigate }) => {
  const isReady = String(store.status) === 'READY';
  const isClickable = String(store.status) === 'OPEN';

  return (
    <div
      style={{
        ...cardWrapper,
        cursor: isClickable ? 'pointer' : 'not-allowed',
        opacity: isReady ? 0.8 : 1,
      }}
      onClick={() => isClickable && navigate(`/stores/${store.id}`)}
      className="store-card"
    >
      {/* 상단 이미지 및 배지 영역 */}
      <div style={imageSection}>
        {/* 카테고리 배지 */}
        <div style={categoryBadge}>
          {categoryMap[store.category] || store.category}
        </div>

        {/* 좋아요 수 */}
        <div style={favoriteBadge}>
          <span style={{ marginRight: '4px' }}>❤️</span>
          {store.favorites || 0}
        </div>

        {/* 준비중(READY)일 때 덮는 오버레이 */}
        {isReady && (
          <div style={readyOverlay}>
            <div style={readyStamp}>COMING SOON</div>
          </div>
        )}
      </div>

      {/* 하단 정보 영역 */}
      <div style={infoSection}>
        <div style={titleRow}>
          <h3 style={storeTitle}>{store.name}</h3>
          <span style={{
            ...statusDot,
            backgroundColor: isReady ? '#faad14' : '#52c41a'
          }} />
        </div>

        <p style={addressText}>{store.address}</p>

        <div style={cardFooter}>
          <span style={{
            color: isReady ? '#faad14' : mainColor,
            fontWeight: '700', fontSize: '0.85rem'
          }}>
            {isReady ? '재료 준비 중' : '지금 예약 가능'}
          </span>
          <span style={detailLink}>상세보기 ➔</span>
        </div>
      </div>
    </div>
  );
};

// --- StoreCard Styles ---
const cardWrapper = {
  background: '#fff',
  borderRadius: '16px',
  overflow: 'hidden',
  border: '1px solid #f0f0f0',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  display: 'flex',
  flexDirection: 'column',
};

const imageSection = {
  height: '200px',
  background: '#f8f8f8', // 실제 이미지가 들어오면 background-image로 변경
  position: 'relative',
  overflow: 'hidden',
};

const categoryBadge = {
  position: 'absolute',
  top: '12px',
  left: '12px',
  background: 'rgba(255, 255, 255, 0.9)',
  color: '#333',
  padding: '5px 12px',
  borderRadius: '8px',
  fontSize: '0.75rem',
  fontWeight: '800',
  zIndex: 2,
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
};

const favoriteBadge = {
  position: 'absolute',
  top: '12px',
  right: '12px',
  background: 'rgba(0, 0, 0, 0.5)',
  color: '#fff',
  padding: '5px 10px',
  borderRadius: '8px',
  fontSize: '0.8rem',
  fontWeight: '600',
  zIndex: 2,
};

const readyOverlay = {
  position: 'absolute',
  top: 0, left: 0, width: '100%', height: '100%',
  background: 'rgba(255,255,255,0.6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 3
};

const readyStamp = {
  border: '3px solid #faad14',
  color: '#faad14',
  padding: '8px 15px',
  fontSize: '1.2rem',
  fontWeight: '900',
  borderRadius: '8px',
  transform: 'rotate(-10deg)',
};

const infoSection = { padding: '20px' };
const titleRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' };
const storeTitle = { margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#222' };
const statusDot = { width: '8px', height: '8px', borderRadius: '50%' };
const addressText = { margin: '0 0 15px 0', fontSize: '0.9rem', color: '#777', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const cardFooter = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f9f9f9' };
const detailLink = { fontSize: '0.8rem', color: '#bbb', fontWeight: '600' };

export default StoreCard;