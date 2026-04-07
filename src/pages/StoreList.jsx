import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { styles, StoreCard } from '../components/StoreCard';

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(location.search);
    axios.get(`http://localhost:8081/stores`, { params: Object.fromEntries(params) })
      .then(res => setStores(res.data))
      .catch(err => console.error("목록 로드 실패", err))
      .finally(() => setLoading(false));
  }, [location.search]);

  return (
    <div style={{ ...styles.containerStyle, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '40px 20px', boxSizing: 'border-box' }}>

      <div style={styles.sectionHeader}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>🔎 가게 검색 결과</h2>
        <button style={styles.textBtn} onClick={() => navigate('/')}>홈으로</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.2rem', color: '#888' }}>
          가게들을 불러오고 있어요... 🏃‍♂️
        </div>
      ) : (
        /* 데이터 유무에 따라 스타일을 다르게 적용하여 레이아웃 붕괴 방지 */
        <div style={stores.length > 0 ? storeGrid3Col : emptyWrapperStyle}>
          {stores.length > 0 ? (
            stores.map(store => (
              <StoreCard key={store.id} store={store} navigate={navigate} />
            ))
          ) : (
            <div style={emptyContentStyle}>
              <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>😅</div>
              <p style={{ color: '#888', fontSize: '1.1rem', margin: '0 0 20px 0' }}>
                찾으시는 가게가 없어요. 다른 검색어를 입력해 보세요!
              </p>
              <button
                onClick={() => navigate('/')}
                style={backBtnStyle}
              >
                메인으로 돌아가기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- 스타일 수정 ---

const storeGrid3Col = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '30px',
  marginTop: '30px',
  width: '100%'
};

// [추가] 결과가 없을 때 전체 폭을 다 쓰도록 그리드 해제
const emptyWrapperStyle = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '50px'
};

// [추가] 내부 콘텐츠 중앙 집중
const emptyContentStyle = {
  textAlign: 'center',
  padding: '60px 20px',
  border: '1px dashed #ddd', // 영역 확인용 (원치 않으면 제거하세요)
  borderRadius: '20px',
  backgroundColor: '#fcfcfc',
  width: '100%',
  maxWidth: '600px' // 너무 퍼지지 않게 제한
};

const backBtnStyle = {
  padding: '12px 30px',
  borderRadius: '10px',
  border: '1px solid #1890ff',
  backgroundColor: '#fff',
  color: '#1890ff',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '1rem'
};

export default StoreList;