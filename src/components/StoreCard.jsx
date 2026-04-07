import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- 1. 공유 스타일 및 카테고리 맵 ---
export const styles = {
  containerStyle: { maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  storeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' },
  textBtn: { background: 'none', border: 'none', color: '#1890ff', cursor: 'pointer', fontSize: '0.9rem' },

  // 카드 전용 스타일
  storeCardStyle: {
    background: '#fff',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid #f0f0f0',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    position: 'relative'
  },
  imageBoxStyle: {
    height: '180px',
    background: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  // [수정] 왼쪽 상단 카테고리 배지 스타일 추가
  categoryBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: 'rgba(0, 0, 0, 0.6)',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    zIndex: 6
  },
  heartBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    color: '#ff4d4f',
    zIndex: 5
  },
  cardInfoStyle: { padding: '20px' },
  storeTitleStyle: { margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 'bold' },
  addressTextStyle: { margin: '0 0 10px 0', fontSize: '0.85rem', color: '#888' },
};

export const categoryMap = {
  "KOREAN": "한식", "JAPANESE": "일식", "CHINESE": "중식", "WESTERN": "양식", "ASIAN": "아시안"
};

// --- 2. StoreCard 컴포넌트 ---
export const StoreCard = ({ store, navigate }) => {
  const isReady = String(store.status) === 'READY';
  const isClickable = String(store.status) === 'OPEN';

  const stampStyle = {
    position: 'absolute',
    border: '5px solid rgba(82, 196, 26, 0.7)',
    color: 'rgba(82, 196, 26, 0.7)',
    padding: '10px 25px',
    fontSize: '1.8rem',
    fontWeight: '900',
    borderRadius: '12px',
    transform: 'rotate(-20deg)',
    boxShadow: '0 0 15px rgba(82, 196, 26, 0.2)',
    zIndex: 10,
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    filter: 'none'
  };

  return (
    <div
      style={{
        ...styles.storeCardStyle,
        cursor: isClickable ? 'pointer' : 'not-allowed',
        filter: isReady ? 'grayscale(0.8)' : 'none',
        opacity: isReady ? 0.75 : 1,
        transition: 'transform 0.2s, box-shadow 0.2s, filter 0.2s, opacity 0.2s'
      }}
      onClick={() => isClickable && navigate(`/stores/${store.id}`)}
      onMouseEnter={(e) => isClickable && (e.currentTarget.style.transform = 'translateY(-5px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <div style={styles.imageBoxStyle}>
        {/* [수정] 카테고리 텍스트를 왼쪽 상단 배지로 변경 */}
        <div style={styles.categoryBadge}>
          {categoryMap[store.category] || store.category}
        </div>

        <div style={styles.heartBadge}>❤️ {store.favorites || 0}</div>

        {isReady && (
          <div style={stampStyle}>
            준비중
          </div>
        )}
      </div>

      <div style={styles.cardInfoStyle}>
        <h3 style={styles.storeTitleStyle}>{store.name}</h3>
        <p style={styles.addressTextStyle}>{store.address}</p>

        <span style={{
          fontSize: '0.85rem',
          color: isReady ? 'rgba(82, 196, 26, 0.8)' : '#1890ff',
          fontWeight: 'bold'
        }}>
          {isReady ? '● 준비중' : '● 예약가능'}
        </span>
      </div>
    </div>
  );
};

// --- 3. Home 메인 컴포넌트 ---
const Home = () => {
  const navigate = useNavigate();
  const [trendingStores, setTrendingStores] = useState([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:8081/stores/trending`)
      .then(res => setTrendingStores(res.data))
      .catch(err => console.error("트렌딩 로드 실패", err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    navigate(`/stores?keyword=${keyword}`);
  };

  const categoryList = [
    { id: 'KOREAN', name: '한식', icon: '🍚' },
    { id: 'JAPANESE', name: '일식', icon: '🍣' },
    { id: 'CHINESE', name: '중식', icon: '🥡' },
    { id: 'WESTERN', name: '양식', icon: '🍝' },
    { id: 'ASIAN', name: '아시안', icon: '🍜' },
  ];

  return (
    <div style={styles.containerStyle}>
      {/* 검색 바 */}
      <section style={{ marginBottom: '40px' }}>
        <form onSubmit={handleSearch} style={searchBarWrapper}>
          <input type="text" placeholder="어떤 맛집을 찾으시나요?" style={searchField} value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          <button type="submit" style={searchBtn}>검색</button>
        </form>
      </section>

      {/* 카테고리 그리드 */}
      <section style={categoryGridStyle}>
        {categoryList.map(cat => (
          <div key={cat.id} style={categoryItemStyle} onClick={() => navigate(`/stores?category=${cat.id}`)}>
            <div style={categoryIconStyle}>{cat.icon}</div>
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{cat.name}</span>
          </div>
        ))}
      </section>

      {/* 트렌딩 목록 */}
      <section>
        <div style={styles.sectionHeader}>
          <h2 style={{ fontSize: '1.4rem' }}>지금 가장 핫한 맛집 🔥</h2>
          <button style={styles.textBtn} onClick={() => navigate('/stores')}>전체보기</button>
        </div>

        {/* [수정] 2행 3열(6개) 배열을 위한 그리드 스타일 적용 */}
        <div style={homeStoreGridStyle}>
          {trendingStores.length > 0 ? (
            trendingStores.map(store => <StoreCard key={store.id} store={store} navigate={navigate} />)
          ) : (
            <div style={{ padding: '50px', textAlign: 'center', gridColumn: '1/-1', color: '#888' }}>핫한 맛집을 찾는 중입니다...</div>
          )}
        </div>
      </section>
    </div>
  );
};

// Home 전용 로컬 스타일
const searchBarWrapper = { display: 'flex', background: '#fff', borderRadius: '15px', padding: '5px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #eee' };
const searchField = { flex: 1, border: 'none', padding: '15px 20px', fontSize: '1rem', outline: 'none' };
const searchBtn = { background: '#1890ff', color: 'white', border: 'none', padding: '0 30px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const categoryGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '50px' };
const categoryItemStyle = { textAlign: 'center', cursor: 'pointer' };
const categoryIconStyle = { fontSize: '2rem', background: '#f9f9f9', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px', marginBottom: '8px', border: '1px solid #f0f0f0' };

// [추가] 홈화면 전용 2행 3열 그리드 스타일
const homeStoreGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '25px',
  marginBottom: '50px'
};

export default Home;