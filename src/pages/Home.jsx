import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { styles, StoreCard } from '../components/StoreCard';

const Home = () => {
  const navigate = useNavigate();
  const [famousStores, setFamousStores] = useState([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:8081/stores/famous`)
      .then(res => setFamousStores(res.data.slice(0, 6)))
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
    // styles.containerStyle의 너비 제한을 무시하기 위해 100%로 설정
    <div style={{ ...styles.containerStyle, maxWidth: 'none', width: '100%', padding: '40px 0' }}>

      {/* 1. 상단 섹션 (검색창 & 카테고리) - 여전히 중앙 정렬 유지 */}
      <div style={innerContainer}>
        <section style={{ marginBottom: '40px' }}>
          <form onSubmit={handleSearch} style={searchBarWrapper}>
            <input
              type="text"
              placeholder="어떤 맛집을 찾으시나요?"
              style={searchField}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit" style={searchBtn}>검색</button>
          </form>
        </section>

        <section style={categoryGridStyle}>
          {categoryList.map(cat => (
            <div key={cat.id} style={categoryItemStyle} onClick={() => navigate(`/stores?category=${cat.id}`)}>
              <div style={categoryIconStyle}>{cat.icon}</div>
              <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{cat.name}</span>
            </div>
          ))}
        </section>
      </div>

      {/* 2. 트렌딩 섹션 - 가로를 훨씬 더 넓게(1400px) 사용 */}
      <section style={famousSectionFull}>
        <div style={famousHeader}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>ㅎㅏㅅㅍㅡㄹ 🔥</h2>
          <button style={styles.textBtn} onClick={() => navigate('/stores')}>전체보기</button>
        </div>

        <div style={storeGridWide}>
          {famousStores.length > 0 ? (
            famousStores.map(store => (
              <StoreCard key={store.id} store={store} navigate={navigate} />
            ))
          ) : (
            <div style={{ padding: '50px', textAlign: 'center', gridColumn: '1/-1', color: '#888' }}>
              핫한 맛집을 찾는 중입니다...
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// --- 스타일 수정 ---

// 검색/카테고리를 담는 컨테이너 (적당한 너비)
const innerContainer = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '0 20px'
};

// 맛집 목록 섹션 (가장 넓게 확보)
const famousSectionFull = {
  maxWidth: '1400px', // 여기가 핵심! 이 숫자를 키울수록 카드가 가로로 더 뻗어 나갑니다.
  margin: '60px auto 0',
  padding: '0 30px'
};

const famousHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  padding: '0 10px'
};

const storeGridWide = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)', // 무조건 3열
  gap: '40px', // 카드 사이를 더 시원하게 벌림
};

const searchBarWrapper = { display: 'flex', background: '#fff', borderRadius: '15px', padding: '5px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #eee' };
const searchField = { flex: 1, border: 'none', padding: '15px 20px', fontSize: '1rem', outline: 'none' };
const searchBtn = { background: '#1890ff', color: 'white', border: 'none', padding: '0 30px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const categoryGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '50px' };
const categoryItemStyle = { textAlign: 'center', cursor: 'pointer' };
const categoryIconStyle = { fontSize: '2rem', background: '#f9f9f9', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px', marginBottom: '8px', border: '1px solid #f0f0f0' };

export default Home;