import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { StoreCard } from '../components/StoreCard';
import { Search, MapPin, Target, X, ChevronRight } from 'lucide-react';

// --- [외부 상수 및 컴포넌트 분리] ---
const mainColor = "#F0602A";
const skyPointColor = "#7DB3D3";

const CATEGORY_LIST = [
  { id: 'KOREAN', name: '한식', emoji: '🍚' }, { id: 'SNACK', name: '분식', emoji: '🍢' },
  { id: 'CHICKEN', name: '치킨', emoji: '🍗' }, { id: 'ASIAN', name: '동양식', emoji: '🍜' },
  { id: 'WESTERN', name: '서양식', emoji: '🍝' }, { id: 'FASTFOOD', name: '패스트푸드', emoji: '🍔' },
  { id: 'BUFFET', name: '뷔페', emoji: '🍽️' }, { id: 'FUSION', name: '퓨전', emoji: '🍱' }
];

const CategoryItem = memo(({ cat, onClick }) => (
  <div style={webCategoryItem} onClick={() => onClick(cat.id)}>
    <div style={webCategoryIcon}>{cat.emoji}</div>
    <span style={webCategoryName}>{cat.name}</span>
  </div>
));

const Home = () => {
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const nearMarkersRef = useRef([]);

  const [keyword, setKeyword] = useState("");
  const [famousStores, setFamousStores] = useState([]);
  const [isDenied, setIsDenied] = useState(false);
  const [myLocation, setMyLocation] = useState({ lat: 37.5665, lng: 126.9780, address: "서울 중구 (기본 위치)" });
  const [locLoading, setLocLoading] = useState(false);

  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [sidoList, setSidoList] = useState([]);
  const [sigunguList, setSigunguList] = useState([]);
  const [selectedSido, setSelectedSido] = useState(null);
  const [selectedSigungu, setSelectedSigungu] = useState(null);

  // 1. 초기 데이터 로드
  useEffect(() => {
    api.get(`/stores/famous`)
      .then(res => setFamousStores(res.data.slice(0, 6)))
      .catch(err => console.error("트렌딩 로드 실패", err));

    api.get(`/area`)
      .then(res => { if (res.data) setSidoList(res.data); })
      .catch(err => console.error("시도 로드 실패", err));
  }, []);

  // 2. 지역 선택 로직
  const handleSidoClick = useCallback((sido) => {
    setSelectedSido(sido);
    setSelectedSigungu(null);
    api.get(`/area`, { params: { cd: sido.cd } })
      .then(res => { if (res.data) setSigunguList(res.data); })
      .catch(err => console.error("시군구 로드 실패", err));
  }, []);

  const handleCategoryClick = useCallback((id) => {
    navigate(`/stores?category=${id}`);
  }, [navigate]);

  // 3. 지도 초기화
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        const options = {
          center: new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng),
          level: 3
        };
        const map = new window.kakao.maps.Map(mapContainer.current, options);
        mapInstanceRef.current = map;
        refreshLocation();
      });
    }
  }, []);

  // 4. 주변 음식점 표시
  const displayNearbyStores = useCallback((lat, lng) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    nearMarkersRef.current.forEach(item => { if (item.setMap) item.setMap(null); });
    nearMarkersRef.current = [];

    api.get(`/stores/nearby`, { params: { latitude: lat, longitude: lng } })
      .then(res => {
        const imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
        const imageSize = new window.kakao.maps.Size(24, 35);
        const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);
        const newItems = [];
        res.data.forEach(store => {
          const pos = new window.kakao.maps.LatLng(store.latitude, store.longitude);
          const marker = new window.kakao.maps.Marker({ map, position: pos, image: markerImage });
          const overlay = new window.kakao.maps.CustomOverlay({
            position: pos, yAnchor: 0,
            content: `<div style="position:relative;top:5px;color:#000;font-size:14px;font-weight:900;text-align:center;text-shadow:-1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 1.5px 1.5px 0 #fff;white-space:nowrap;pointer-events:none;">${store.name}</div>`
          });
          overlay.setMap(map);
          window.kakao.maps.event.addListener(marker, 'click', () => navigate(`/stores/${store.id}`));
          newItems.push(marker, overlay);
        });
        nearMarkersRef.current = newItems;
      });
  }, [navigate]);

  // 5. 현 위치 갱신
  const refreshLocation = useCallback(() => {
    if (!window.kakao || !window.kakao.maps) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDenied(false);
        const { latitude: lat, longitude: lng } = pos.coords;
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(lng, lat, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            setMyLocation({ lat, lng, address: result[0].address.address_name });
            const newPos = new window.kakao.maps.LatLng(lat, lng);
            const map = mapInstanceRef.current;
            if (map) {
              map.setCenter(newPos);
              if (markerRef.current) markerRef.current.setMap(null);
              markerRef.current = new window.kakao.maps.Marker({ position: newPos, map });
              displayNearbyStores(lat, lng);
            }
          }
          setLocLoading(false);
        });
      },
      (err) => { setLocLoading(false); if (err.code === 1) setIsDenied(true); },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, [displayNearbyStores]);

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>

      {/* --- HERO SECTION --- */}
      <section style={webHeroSection}>
        <div style={innerContainer}>
          <div style={heroTextWrapper}>
            <h1 style={webHeroTitle}>
              어디서 무엇을 <br />
              <span style={{ color: mainColor }}>먹을지</span> 고민될 때
            </h1>
            <div style={{ marginBottom: '40px' }}>
              <img src="/images/logo2.png" alt="로고" style={webLogoStyle} />
            </div>

            <form onSubmit={(e) => { e.preventDefault(); navigate(`/stores?keyword=${keyword}`); }} style={webSearchBar}>
              <Search color="#999" size={20} style={{ marginRight: '15px' }} />
              <input
                type="text"
                placeholder="음식점, 메뉴, 지역을 검색해보세요"
                style={webSearchInput}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <button type="submit" style={{ ...webSearchBtn, background: mainColor }}>검색</button>
            </form>
          </div>
        </div>
      </section>

      <div style={innerContainer}>
        {/* --- 1. 카테고리 (와이드 그리드) --- */}
        <section style={webCategorySection}>
          <div style={webCategoryGrid}>
            {CATEGORY_LIST.map(cat => (
              <CategoryItem key={cat.id} cat={cat} onClick={handleCategoryClick} />
            ))}
          </div>
        </section>

        {/* --- 2. 지역별 탐색 (버튼 UI 업데이트) --- */}
        <section style={{ marginBottom: '80px' }}>
          {!isRegionOpen ? (
            <button onClick={() => setIsRegionOpen(true)} style={webRegionStartBtn}>
              <MapPin size={20} style={{marginRight: '10px', color: mainColor}} />
              전국 어디로 갈까요? <span style={{color: mainColor, marginLeft: '5px'}}>지역별 맛집 찾기</span>
            </button>
          ) : (
            <div style={webModernPanelStyle}>
              <div style={webRegionPanelHeader}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <span style={{ fontWeight: '900', fontSize: '1.3rem', color: '#333' }}>지역 선택</span>
                  {selectedSido && (
                    <span style={webSelectedBadge}>
                      {selectedSido.name} {selectedSigungu ? `> ${selectedSigungu.name}` : ''}
                    </span>
                  )}
                </div>
                <button onClick={() => { setIsRegionOpen(false); setSelectedSido(null); setSelectedSigungu(null); }} style={webCloseBtn}><X size={24} /></button>
              </div>

              <div style={webSelectorLayout}>
                <div style={webSideBar}>
                  {sidoList.map(sido => (
                    <div
                      key={sido.cd}
                      style={{
                        ...webSideItem,
                        color: selectedSido?.cd === sido.cd ? mainColor : '#666',
                        background: selectedSido?.cd === sido.cd ? '#FFF5F0' : 'transparent',
                      }}
                      onClick={() => handleSidoClick(sido)}
                    >
                      {sido.name}
                      {selectedSido?.cd === sido.cd && <div style={webActiveIndicator} />}
                    </div>
                  ))}
                </div>

                <div style={webMainContent}>
                  {selectedSido ? (
                    <div style={webGridContainer}>
                      <div
                        style={{
                          ...webGridItem,
                          backgroundColor: !selectedSigungu ? mainColor : '#f5f5f5',
                          color: !selectedSigungu ? '#fff' : '#444'
                        }}
                        onClick={() => setSelectedSigungu(null)}
                      >
                        전체
                      </div>
                      {sigunguList.map(sgg => (
                        <div
                          key={sgg.cd}
                          style={{
                            ...webGridItem,
                            backgroundColor: selectedSigungu?.cd === sgg.cd ? mainColor : '#f5f5f5',
                            color: selectedSigungu?.cd === sgg.cd ? '#fff' : '#444'
                          }}
                          onClick={() => setSelectedSigungu(sgg)}
                        >
                          {sgg.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={webEmptyMessage}>왼쪽 리스트에서 도시를 선택해주세요.</div>
                  )}
                </div>
              </div>

              {selectedSido && (
                <div style={webPanelFooter}>
                  <button
                    style={{ ...webConfirmBtn, background: mainColor }}
                    onClick={() => {
                        const finalCd = selectedSigungu ? selectedSigungu.cd : selectedSido.cd;
                        navigate(`/stores?cd=${finalCd}`);
                    }}
                  >
                    {selectedSigungu ? selectedSigungu.name : selectedSido.name} 맛집 보러가기
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* --- 3. 지도 섹션 (와이드 레이아웃) --- */}
        <section style={webMapWrapper}>
          <div style={webMapHeader}>
            <div style={webAddressBadge}><MapPin size={16} style={{marginRight:'5px', color: mainColor}} /> {locLoading ? "위치 탐색 중..." : myLocation.address}</div>
            <button onClick={refreshLocation} style={webMyLocBtn}><Target size={16} style={{marginRight:'5px'}} /> {locLoading ? "..." : "내 위치 갱신"}</button>
          </div>
          <div ref={mapContainer} style={{ width: '100%', height: '450px', background: '#eee' }}></div>
          {isDenied && (
            <div style={webMapOverlay}>
              <div style={webGuideBox}>
                <h4 style={{ margin: '0 0 10px 0' }}>위치 권한 차단됨</h4>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>브라우저 설정에서 권한 허용 후 새로고침 해주세요.</p>
                <button onClick={() => window.location.reload()} style={webRetryBtn}>새로고침</button>
              </div>
            </div>
          )}
          <div style={{padding: '20px', background: '#fff'}}>
            <button style={{...webLocationBtn, background: skyPointColor}} onClick={() => navigate(`/stores?lat=${myLocation.lat}&lng=${myLocation.lng}`)}>
              이 근처 맛집 전체 탐색하기 ➔
            </button>
          </div>
        </section>

        {/* --- 4. 트렌드 맛집 (3열 와이드 그리드) --- */}
        <section style={{ paddingBottom: '100px' }}>
          <div style={webFamousHeader}>
            <h2 style={webSectionTitle}>최근 급상승 <span style={{ color: mainColor }}>트렌드 맛집</span> 🔥</h2>
            <button style={webViewAllBtn} onClick={() => navigate('/stores')}>더보기 <ChevronRight size={18} /></button>
          </div>
          <div style={webStoreGrid}>
            {famousStores.length > 0 ? (
              famousStores.map(store => <StoreCard key={store.id} store={store} navigate={navigate} />)
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: '#bbb' }}>데이터 로딩 중...</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

// --- [Style Objects - 웹 전용 스타일] ---
const innerContainer = { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' };

const webHeroSection = {
  padding: '100px 0 80px',
  background: 'linear-gradient(135deg, #fdfbfb 0%, #f5f7f8 100%)',
  borderBottom: '1px solid #f0f0f0',
  marginBottom: '60px'
};

const heroTextWrapper = { textAlign: 'center', maxWidth: '800px', margin: '0 auto' };
const webHeroTitle = { fontSize: '3.2rem', fontWeight: '900', color: '#222', lineHeight: '1.2', marginBottom: '30px' };
const webLogoStyle = { width: '380px', height: 'auto', display: 'block', margin: '0 auto' };

const webSearchBar = {
  display: 'flex', alignItems: 'center', background: '#fff', padding: '10px 10px 10px 25px',
  borderRadius: '100px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '1px solid #eee',
  maxWidth: '700px', margin: '0 auto'
};

const webSearchInput = { flex: 1, border: 'none', outline: 'none', fontSize: '1.15rem', padding: '10px 0' };
const webSearchBtn = { color: '#fff', border: 'none', padding: '15px 40px', borderRadius: '100px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.05rem' };

const webCategorySection = { marginBottom: '80px' };
const webCategoryGrid = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' };
const webCategoryItem = {
  background: '#fff', border: '1px solid #f2f2f2', padding: '30px 10px', borderRadius: '24px',
  textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
};
const webCategoryIcon = { fontSize: '2.8rem', marginBottom: '12px' };
const webCategoryName = { fontWeight: '700', color: '#444', fontSize: '1.05rem' };

const webRegionStartBtn = {
  width: '100%', padding: '30px', borderRadius: '24px', border: '1px solid #eee', background: '#fff',
  color: '#333', fontWeight: '800', fontSize: '1.2rem', cursor: 'pointer',
  boxShadow: '0 10px 30px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const webModernPanelStyle = { background: '#fff', borderRadius: '30px', boxShadow: '0 30px 70px rgba(0,0,0,0.12)', overflow: 'hidden', border: '1px solid #eee' };
const webRegionPanelHeader = { padding: '30px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const webSelectorLayout = { display: 'flex', height: '450px' };
const webSideBar = { width: '220px', background: '#fafafa', overflowY: 'auto', borderRight: '1px solid #eee' };
const webSideItem = { padding: '20px 30px', cursor: 'pointer', fontSize: '1.05rem', fontWeight: '700', position: 'relative' };
const webActiveIndicator = { position: 'absolute', right: 0, top: '25%', height: '50%', width: '4px', background: mainColor, borderRadius: '4px 0 0 4px' };
const webMainContent = { flex: 1, overflowY: 'auto', padding: '35px' };
const webGridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px' };
const webGridItem = { padding: '15px', borderRadius: '15px', textAlign: 'center', fontWeight: '600', cursor: 'pointer' };
const webSelectedBadge = { marginLeft: '20px', padding: '6px 18px', background: '#FFF5F0', color: mainColor, borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' };
const webEmptyMessage = { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '1.1rem' };
const webPanelFooter = { padding: '25px 35px', borderTop: '1px solid #eee', background: '#fafafa' };
const webConfirmBtn = { width: '100%', color: '#fff', border: 'none', padding: '20px', borderRadius: '18px', fontWeight: '900', fontSize: '1.15rem', cursor: 'pointer' };
const webCloseBtn = { border: 'none', background: 'none', color: '#999', cursor: 'pointer' };

const webMapWrapper = { borderRadius: '30px', maxWidth: '900px', margin: '0 auto', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', marginBottom: '100px', border: '1px solid #eee', position: 'relative' };
const webMapHeader = { position: 'absolute', top: '25px', left: '25px', right: '25px', display: 'flex', justifyContent: 'space-between', zIndex: 10 };
const webAddressBadge = { background: 'rgba(255, 255, 255, 0.95)', padding: '12px 22px', borderRadius: '50px', fontWeight: '800', fontSize: '0.95rem', display: 'flex', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' };
const webMyLocBtn = { background: '#fff', border: 'none', padding: '12px 22px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', color: '#444' };
const webLocationBtn = { width: '100%', color: '#fff', border: 'none', padding: '20px', borderRadius: '18px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.15rem' };
const webMapOverlay = { position: 'absolute', top: 0, left: 0, width: '100%', height: '450px', background: 'rgba(0,0,0,0.4)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const webGuideBox = { background: 'white', padding: '30px', borderRadius: '25px', textAlign: 'center', width: '320px' };
const webRetryBtn = { background: mainColor, color: 'white', border: 'none', padding: '12px 25px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };

const webFamousHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' };
const webSectionTitle = { fontSize: '2.2rem', fontWeight: '900', color: '#222' };
const webViewAllBtn = { background: 'none', border: 'none', color: "#777", fontWeight: '700', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center' };
const webStoreGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' };

export default Home;