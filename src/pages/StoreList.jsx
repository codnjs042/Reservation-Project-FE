import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { StoreCard } from '../components/StoreCard';
import { Search, Home as HomeIcon, Filter, RefreshCcw } from 'lucide-react';

const mainColor = "#F0602A";
const skyPointColor = "#7DB3D3";

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // 현재 검색 조건을 텍스트로 추출 (UI 표시용)
  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get('keyword') || queryParams.get('category') || "전체";

  useEffect(() => {
    setLoading(true);
    api.get(`/stores`, { params: Object.fromEntries(queryParams) })
      .then(res => setStores(res.data))
      .catch(err => console.error("목록 로드 실패", err))
      .finally(() => setLoading(false));
  }, [location.search]);

  return (
    <div style={pageBackground}>
      {/* 1. 상단 요약 헤더 (Breadcrumb & Title) */}
      <div style={headerSection}>
        <div style={webInnerContainer}>
          <div style={breadcrumb}>
            <span onClick={() => navigate('/')} style={pointer}><HomeIcon size={14} /> 홈</span>
            <span style={separator}>/</span>
            <span style={currentPath}>가게 검색</span>
          </div>

          <div style={titleWrapper}>
            <h2 style={webTitle}>
              <span style={{ color: mainColor }}>'{keyword}'</span> 검색 결과
              <span style={countBadge}>{stores.length}</span>
            </h2>
            <button style={resetBtn} onClick={() => navigate('/stores')}>
              <RefreshCcw size={16} style={{marginRight: '6px'}} /> 초기화
            </button>
          </div>
        </div>
      </div>

      <div style={{ ...webInnerContainer, ...contentLayout }}>

        {/* 2. 좌측 사이드바 필터 (웹스러운 구조의 핵심) */}
        <aside style={sideFilter}>
          <div style={filterGroup}>
            <h4 style={filterTitle}><Filter size={16} /> 정렬 기준</h4>
            <div style={filterList}>
              <label style={filterItem}><input type="radio" name="sort" defaultChecked /> 기본순</label>
              <label style={filterItem}><input type="radio" name="sort" /> 별점 높은순</label>
              <label style={filterItem}><input type="radio" name="sort" /> 리뷰 많은순</label>
            </div>
          </div>

          <div style={filterGroup}>
            <h4 style={filterTitle}>편의 시설</h4>
            <div style={filterList}>
              <label style={filterItem}><input type="checkbox" /> 주차 가능</label>
              <label style={filterItem}><input type="checkbox" /> 배달 가능</label>
              <label style={filterItem}><input type="checkbox" /> 예약 가능</label>
            </div>
          </div>

          <div style={adBox}>
            <p style={{fontSize: '0.8rem', color: '#999'}}>추천 맛집이<br/>궁금하신가요?</p>
            <button style={adBtn}>랜덤 추천 ✨</button>
          </div>
        </aside>

        {/* 3. 메인 리스트 영역 */}
        <main style={mainContent}>
          {loading ? (
            <div style={loadingWrapper}>
              <div className="spinner"></div>
              <p>맛있는 가게들을 찾고 있습니다...</p>
            </div>
          ) : (
            <>
              {stores.length > 0 ? (
                <div style={webStoreGrid}>
                  {stores.map(store => (
                    <StoreCard key={store.id} store={store} navigate={navigate} />
                  ))}
                </div>
              ) : (
                <div style={webEmptyWrapper}>
                  <div style={emptyIcon}>🔎</div>
                  <h3 style={emptyTitle}>검색 결과가 없습니다</h3>
                  <p style={emptyText}>다른 검색어나 카테고리를 선택해보세요.</p>
                  <button onClick={() => navigate('/')} style={webBackBtn}>
                    메인으로 돌아가기
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

// --- [Web Styled Objects] ---

const pageBackground = { background: '#fcfcfc', minHeight: '100vh', paddingBottom: '100px' };
const webInnerContainer = { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' };

const headerSection = { background: '#fff', borderBottom: '1px solid #eee', padding: '30px 0' };
const breadcrumb = { display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontSize: '0.85rem', marginBottom: '15px' };
const pointer = { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' };
const separator = { color: '#ddd' };
const currentPath = { color: '#333', fontWeight: '600' };

const titleWrapper = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const webTitle = { fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' };
const countBadge = { background: '#f0f0f0', color: '#666', fontSize: '1rem', padding: '4px 12px', borderRadius: '20px', fontWeight: '600' };
const resetBtn = { background: 'none', border: '1px solid #ddd', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#666', fontSize: '0.9rem' };

const contentLayout = { display: 'flex', gap: '40px', marginTop: '40px' };

// 좌측 필터바 스타일
const sideFilter = { width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '30px' };
const filterGroup = { background: '#fff', border: '1px solid #eee', padding: '20px', borderRadius: '16px' };
const filterTitle = { fontSize: '1rem', fontWeight: '700', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' };
const filterList = { display: 'flex', flexDirection: 'column', gap: '12px' };
const filterItem = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: '#555', cursor: 'pointer' };

const adBox = { background: '#fff0eb', padding: '20px', borderRadius: '16px', textAlign: 'center', border: '1px dashed #F0602A' };
const adBtn = { marginTop: '10px', width: '100%', background: mainColor, color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };

// 메인 영역 스타일
const mainContent = { flex: 1 };
const webStoreGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', // 웹 환경에 따라 자동으로 카드 개수 조절
  gap: '25px'
};

const loadingWrapper = { textAlign: 'center', padding: '100px 0', color: '#999' };

const webEmptyWrapper = {
  background: '#fff', border: '1px solid #eee', padding: '80px 0', borderRadius: '24px',
  textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
};
const emptyIcon = { fontSize: '4rem', marginBottom: '20px' };
const emptyTitle = { fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px' };
const emptyText = { color: '#888', marginBottom: '30px' };
const webBackBtn = {
  background: mainColor, color: '#fff', border: 'none', padding: '15px 40px',
  borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s'
};

export default StoreList;