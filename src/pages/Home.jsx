import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  const categoryMap = { "한식": "KOREAN", "일식": "JAPANESE", "중식": "CHINESE", "양식": "WESTERN", "아시안": "ASIAN" };

  const fetchStores = (searchKeyword = "") => {
    setLoading(true);
    const finalKeyword = categoryMap[searchKeyword] || searchKeyword;
    axios.get(`http://localhost:8081/stores`, { params: { keyword: finalKeyword } })
    .then(res => {
      console.log("데이터 확인:", res.data); // 브라우저 콘솔에서 확인용
      setStores(res.data);
    })
    .catch(err => console.error("가게 로드 실패", err))
    .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStores(); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchStores(keyword); };

  const categoryList = [
    { id: 'KOREAN', name: '한식', icon: '🍚' },
    { id: 'JAPANESE', name: '일식', icon: '🍣' },
    { id: 'CHINESE', name: '중식', icon: '🥡' },
    { id: 'WESTERN', name: '양식', icon: '🍝' },
    { id: 'ASIAN', name: '아시안', icon: '🍜' },
  ];

  return (
    <div style={containerStyle}>
      <section style={searchSection}>
        <form onSubmit={handleSearch} style={searchBarWrapper}>
          <input type="text" placeholder="식당명, 지역, 혹은 '한식' 등을 입력하세요" style={searchField} value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          <button type="submit" style={searchBtn}>검색</button>
        </form>
      </section>

      <section style={categoryGrid}>
        {categoryList.map(cat => (
          <div key={cat.id} style={categoryItem} onClick={() => { setKeyword(cat.name); fetchStores(cat.name); }}>
            <div style={categoryIcon}>{cat.icon}</div>
            <span style={categoryLabel}>{cat.name}</span>
          </div>
        ))}
      </section>

      <section>
        <div style={sectionHeader}>
          <h2 style={{ fontSize: '1.4rem' }}>오늘의 맛집 추천 ✨</h2>
          <button style={textBtn} onClick={() => { setKeyword(""); fetchStores(""); }}>전체보기</button>
        </div>

        <div style={storeGrid}>
          {stores.length > 0 ? stores.map(store => {
            // ✅ 수정: Enum은 대문자 문자열로 들어오므로 확실하게 비교
            const isClosed = String(store.status) !== 'OPEN';

            return (
              <div
                key={store.id}
                style={{
                  ...storeCard,
                  filter: isClosed ? 'grayscale(0.8)' : 'none',
                  opacity: isClosed ? 0.8 : 1,
                  position: 'relative'
                }}
                onClick={() => !isClosed && navigate(`/stores/${store.id}`)}
              >
                {isClosed && (
                  <div style={readyStampStyle}>준비중</div>
                )}

                <div style={imageBox}>
                  <span style={{ color: '#aaa', fontWeight: 'bold' }}>
                      {/* ✅ 수정: store.status가 아니라 store.category로 찾아야 함 */}
                      {Object.keys(categoryMap).find(key => categoryMap[key] === String(store.category)) || store.category}
                  </span>
                </div>

                <div style={cardInfo}>
                  <h3 style={storeTitle}>{store.name}</h3>
                  <p style={addressText}>{store.address}</p>

                  <div style={badgeWrapper}>
                    <span style={{
                      ...statusBadge,
                      background: isClosed ? '#f0f0f0' : '#e6f7ff',
                      color: isClosed ? '#999' : '#1890ff'
                    }}>
                      {isClosed ? '예약 불가' : '예약 가능'}
                    </span>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div style={emptyMessage}>원하시는 가게를 찾지 못했어요. 😅</div>
          )}
        </div>
      </section>
    </div>
  );
};

// --- 스타일 디자인 유지 ---
const containerStyle = { maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' };
const searchSection = { marginBottom: '40px' };
const searchBarWrapper = { display: 'flex', background: '#fff', borderRadius: '15px', padding: '5px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #eee' };
const searchField = { flex: 1, border: 'none', padding: '15px 20px', fontSize: '1rem', outline: 'none' };
const searchBtn = { background: '#1890ff', color: 'white', border: 'none', padding: '0 30px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const categoryGrid = { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '50px' };
const categoryItem = { textAlign: 'center', cursor: 'pointer' };
const categoryIcon = { fontSize: '2rem', background: '#f9f9f9', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px', marginBottom: '8px', border: '1px solid #f0f0f0' };
const categoryLabel = { fontSize: '0.9rem', fontWeight: '600' };
const sectionHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' };
const textBtn = { background: 'none', border: 'none', color: '#1890ff', cursor: 'pointer' };
const storeGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' };
const storeCard = { background: '#fff', borderRadius: '20px', overflow: 'hidden', border: '1px solid #f0f0f0', cursor: 'pointer', transition: 'all 0.3s ease' };
const readyStampStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-15deg)', zIndex: 10, border: '5px solid #adff2f', color: '#adff2f', fontSize: '2rem', fontWeight: '900', padding: '10px 20px', borderRadius: '15px', textTransform: 'uppercase', letterSpacing: '2px', pointerEvents: 'none', backgroundColor: 'rgba(255, 255, 255, 0.1)', boxShadow: '0 0 15px rgba(173, 255, 47, 0.3)' };
const imageBox = { height: '180px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const cardInfo = { padding: '20px' };
const storeTitle = { margin: 0, fontSize: '1.1rem', fontWeight: 'bold' };
const addressText = { fontSize: '0.85rem', color: '#888', margin: '8px 0' };
const badgeWrapper = { marginTop: '10px' };
const statusBadge = { fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold' };
const emptyMessage = { gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: '#bfbfbf' };

export default Home;