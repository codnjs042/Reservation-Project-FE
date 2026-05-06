import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreCard } from '../components/StoreCard';
import { List, ChevronRight, MapPin, Target, X } from 'lucide-react';

// ⭐ 캐릭터 아이콘 컴포넌트 (기존 코드 유지)
const FoodCharacterIcon = ({ type }) => {
  const commonAttrs = { stroke: "#333", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
  const cheekAttrs = { cx: "26", cy: "30", r: "1.5", fill: "#FFBABA", opacity: "0.8" };
  const iconData = {
    KOREAN: (
      <svg viewBox="0 0 64 64" fill="none" style={{ width: '100%', height: '100%', transform: 'scale(0.85)' }}>
        <path d="M12 28C12 28 15 20 32 20C49 20 52 28 52 28C52 38.5 44 48 32 48C20 48 12 38.5 12 28Z" fill="#F0EFE9" {...commonAttrs} />
        <path d="M12 28H52" {...commonAttrs} strokeWidth="1.5" />
        <ellipse cx="32" cy="18" rx="14" ry="10" fill="white" {...commonAttrs} />
        <circle cx="32" cy="18" r="4.5" fill="#FFC107" {...commonAttrs} />
        <circle cx="28" cy="35" r="1.5" fill="#333" /><circle cx="36" cy="35" r="1.5" fill="#333" />
        <circle {...cheekAttrs} cx="26" cy="35" /><circle {...cheekAttrs} cx="38" cy="35" />
      </svg>
    ),
    JAPANESE: (
      <svg viewBox="0 0 64 64" fill="none" style={{ width: '100%', height: '100%', transform: 'scale(0.85)' }}>
        <rect x="14" y="24" width="36" height="24" rx="12" fill="white" {...commonAttrs} />
        <path d="M14 28C14 28 20 18 32 18C44 18 50 28 50 28H14Z" fill="#FF8D6D" {...commonAttrs} />
        <circle cx="28" cy="36" r="1.5" fill="#333" /><circle cx="36" cy="36" r="1.5" fill="#333" />
        <circle {...cheekAttrs} cx="26" cy="36" /><circle {...cheekAttrs} cx="38" cy="36" />
      </svg>
    ),
    CHINESE: (
      <svg viewBox="0 0 64 64" fill="none" style={{ width: '100%', height: '100%', transform: 'scale(0.85)' }}>
        <ellipse cx="32" cy="40" rx="20" ry="12" fill="#EAEAEA" {...commonAttrs} />
        <path d="M16 32C16 32 20 20 32 20C44 20 48 32 16 32Z" fill="#4B3621" {...commonAttrs} />
        <circle cx="28" cy="40" r="1.5" fill="#FBFBFB" /><circle cx="36" cy="40" r="1.5" fill="#FBFBFB" />
      </svg>
    ),
    WESTERN: (
      <svg viewBox="0 0 64 64" fill="none" style={{ width: '100%', height: '100%', transform: 'scale(0.85)' }}>
        <rect x="12" y="16" width="40" height="36" rx="18" fill="#AF4C24" {...commonAttrs} />
        <circle cx="28" cy="33" r="1.5" fill="#333" /><circle cx="36" cy="33" r="1.5" fill="#333" />
        <circle {...cheekAttrs} cx="26" cy="33" /><circle {...cheekAttrs} cx="38" cy="33" />
      </svg>
    ),
    ASIAN: (
      <svg viewBox="0 0 64 64" fill="none" style={{ width: '100%', height: '100%', transform: 'scale(0.85)' }}>
        <path d="M12 28C12 28 15 20 32 20C49 20 52 28 52 28C52 38.5 44 48 32 48C20 48 12 38.5 12 28Z" fill="#F8F4E6" {...commonAttrs} />
        <circle cx="28" cy="35" r="1.5" fill="#333" /><circle cx="36" cy="35" r="1.5" fill="#333" />
        <circle {...cheekAttrs} cx="26" cy="35" /><circle {...cheekAttrs} cx="38" cy="35" />
      </svg>
    ),
  };
  return <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{iconData[type] || '🍴'}</div>;
};

const Home = () => {
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const markerRef = useRef(null);
  const nearMarkersRef = useRef([]);
  const [mapInstance, setMapInstance] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [famousStores, setFamousStores] = useState([]);
  const [isDenied, setIsDenied] = useState(false);
  const [myLocation, setMyLocation] = useState({ lat: 37.5665, lng: 126.9780, address: "서울 중구 (기본 위치)" });
  const [locLoading, setLocLoading] = useState(false);

  const mainColor = "#F0602A";
  const skyPointColor = "#7DB3D3";
// 📍 지역 선택용 상태 (백엔드 규격: cd, name)
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [sidoList, setSidoList] = useState([]);
  const [sigunguList, setSigunguList] = useState([]);
  const [selectedSido, setSelectedSido] = useState(null); // {cd, name} 객체 저장
  const [selectedSigungu, setSelectedSigungu] = useState(null); // {cd, name} 객체 저장

  // 1. 초기 로드: 시/도 목록 (cd 없이 호출하여 전체 시도 가져오기)
  useEffect(() => {
    axios.get(`http://localhost:8081/stores/famous`)
      .then(res => setFamousStores(res.data.slice(0, 6)))
      .catch(err => console.error("트렌딩 로드 실패", err));

    // 백엔드: cd가 없으면 시도(SIDO) 목록 반환
    axios.get(`http://localhost:8081/area`)
      .then(res => {
        if (res.data) setSidoList(res.data); // [ {cd: "11", name: "서울특별시"}, ... ]
      })
      .catch(err => console.error("시도 로드 실패", err));
  }, []);

  // 2. 시/도 클릭 시 시군구 호출
  const handleSidoClick = (sido) => {
    setSelectedSido(sido);
    setSelectedSigungu(null);

    // 백엔드: cd를 보내면 해당 지역의 시군구(SIGG) 목록 반환
    axios.get(`http://localhost:8081/area`, { params: { cd: sido.cd } })
      .then(res => {
        if (res.data) setSigunguList(res.data);
      })
      .catch(err => console.error("시군구 로드 실패", err));
  };

  // 3. 지도 초기화 및 위치 관련 함수들 (기본 로직 유지)
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        const options = { center: new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng), level: 2 };
        const map = new window.kakao.maps.Map(mapContainer.current, options);
        setMapInstance(map);
      });
    }
  }, []);

  const refreshLocation = () => {
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
            if (mapInstance) {
              mapInstance.setCenter(newPos);
              if (markerRef.current) markerRef.current.setMap(null);
              markerRef.current = new window.kakao.maps.Marker({ position: newPos, map: mapInstance });
              displayNearbyStores(lat, lng);
            }
          }
          setLocLoading(false);
        });
      },
      (err) => { setLocLoading(false); if (err.code === 1) setIsDenied(true); },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  useEffect(() => { if (mapInstance) refreshLocation(); }, [mapInstance]);

  const displayNearbyStores = (lat, lng) => {
    if (!mapInstance) return;
    nearMarkersRef.current.forEach(item => { if (item.setMap) item.setMap(null); });
    nearMarkersRef.current = [];
    axios.get(`http://localhost:8081/stores/nearby`, { params: { latitude: lat, longitude: lng } })
      .then(res => {
        const imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
        const imageSize = new window.kakao.maps.Size(24, 35);
        const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);
        const newItems = [];
        res.data.forEach(store => {
          const pos = new window.kakao.maps.LatLng(store.latitude, store.longitude);
          const marker = new window.kakao.maps.Marker({ map: mapInstance, position: pos, image: markerImage });
          const overlay = new window.kakao.maps.CustomOverlay({
            position: pos, yAnchor: 0,
            content: `<div style="position:relative;top:5px;color:#000;font-size:15px;font-weight:900;text-align:center;text-shadow:-1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 1.5px 1.5px 0 #fff;white-space:nowrap;pointer-events:none;">${store.name}</div>`
          });
          overlay.setMap(mapInstance);
          window.kakao.maps.event.addListener(marker, 'click', () => navigate(`/stores/${store.id}`));
          newItems.push(marker, overlay);
        });
        nearMarkersRef.current = newItems;
      });
  };

  const categoryList = [{ id: 'KOREAN', name: '한식' }, { id: 'JAPANESE', name: '일식' }, { id: 'CHINESE', name: '중식' }, { id: 'WESTERN', name: '양식' }, { id: 'ASIAN', name: '아시안' }];

  return (
    <div style={{ background: '#F9F8F6', minHeight: '100vh', paddingBottom: '100px' }}>
      <section style={heroSection}>
        <div style={innerContainer}>
          <div style={{ textAlign: 'center', marginBottom: '45px' }}>
            <h1 style={heroTitle}>어디서 무엇을 <br /><span style={{ color: skyPointColor }}>먹을지</span> 고민될 때</h1>
            <div style={{ marginBottom: '35px' }}>
              <img src="/images/logo2.png" alt="로고" style={{ width: '350px', height: 'auto', display: 'block', margin: '0 auto' }} />
            </div>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); navigate(`/stores?keyword=${keyword}`); }} style={searchBarWrapper}>
            <input type="text" placeholder="음식점, 메뉴, 지역 검색" style={searchField} value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            <button type="submit" style={{ ...searchBtn, background: mainColor }}>검색</button>
          </form>
        </div>
      </section>

      <div style={innerContainer}>
        {/* 1. 카테고리 섹션 */}
        <section style={categoryGridStyle}>
          {categoryList.map(cat => (
            <div key={cat.id} style={categoryItemStyle} onClick={() => navigate(`/stores?category=${cat.id}`)}>
              <div style={categoryIconStyle}><FoodCharacterIcon type={cat.id} /></div>
              <span style={categoryNameStyle}>{cat.name}</span>
            </div>
          ))}
        </section>

{/* 📍 2. 개선된 지역별 탐색 섹션 */}
        <section style={{ marginBottom: '60px' }}>
          {!isRegionOpen ? (
            <button onClick={() => setIsRegionOpen(true)} style={regionStartBtn}>
              <MapPin size={18} style={{marginRight: '8px'}} /> 어디로 갈까요? 지역별 맛집 찾기
            </button>
          ) : (
            <div style={modernPanelStyle}>
              <div style={regionPanelHeader}>
                <div>
                  <span style={{ fontWeight: '900', fontSize: '1.2rem', color: '#333' }}>지역 선택</span>
                  {selectedSido && (
                    <span style={selectedBadge}>
                      {selectedSido.name} {selectedSigungu ? `> ${selectedSigungu.name}` : ''}
                    </span>
                  )}
                </div>
                <button onClick={() => { setIsRegionOpen(false); setSelectedSido(null); setSelectedSigungu(null); }} style={closeBtn}><X size={24} /></button>
              </div>

              <div style={selectorLayout}>
                {/* 왼쪽: 시/도 리스트 */}
                <div style={sideBar}>
                  {sidoList.map(sido => (
                    <div
                      key={sido.cd}
                      style={{
                        ...sideItem,
                        color: selectedSido?.cd === sido.cd ? mainColor : '#666',
                        background: selectedSido?.cd === sido.cd ? '#FFF0EB' : 'transparent',
                        fontWeight: selectedSido?.cd === sido.cd ? '800' : '500'
                      }}
                      onClick={() => handleSidoClick(sido)}
                    >
                      {sido.name}
                      {selectedSido?.cd === sido.cd && <div style={activeIndicator} />}
                    </div>
                  ))}
                </div>

                {/* 오른쪽: 시/군/구 그리드 */}
                <div style={mainContent}>
                  {selectedSido ? (
                    <div style={gridContainer}>
                      {/* '전체' 버튼 */}
                      <div
                        style={{
                          ...gridItem,
                          backgroundColor: !selectedSigungu ? mainColor : '#f8f8f8',
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
                            ...gridItem,
                            backgroundColor: selectedSigungu?.cd === sgg.cd ? mainColor : '#f8f8f8',
                            color: selectedSigungu?.cd === sgg.cd ? '#fff' : '#444'
                          }}
                          onClick={() => setSelectedSigungu(sgg)}
                        >
                          {sgg.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={emptyMessage}>먼저 왼쪽에서 도시를 선택해주세요.</div>
                  )}
                </div>
              </div>

              {selectedSido && (
                <div style={panelFooter}>
                  <button
                    style={{ ...confirmBtn, background: mainColor }}
                    onClick={() => {
                        // cd가 2자리(시도) 혹은 5자리(시군구)로 백엔드에 넘어감
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

        {/* 3. 지도 섹션 */}
        <section style={mapWrapperStyle}>
          <div style={mapHeaderOverlay}>
            <div style={addressBadge}><MapPin size={16} style={{marginRight:'5px'}} /> {locLoading ? "위치 탐색 중..." : myLocation.address}</div>
            <button onClick={refreshLocation} style={myLocBtn}><Target size={16} style={{marginRight:'5px'}} /> {locLoading ? "..." : "내 위치"}</button>
          </div>
          <div ref={mapContainer} style={{ width: '100%', height: '350px', background: '#eee' }}></div>
          {isDenied && (
            <div style={mapOverlayStyle}>
              <div style={guideBoxStyle}>
                <h4 style={{ margin: '0 0 10px 0' }}>위치 권한 차단됨</h4>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>권한 허용 후 새로고침 해주세요.</p>
                <button onClick={() => window.location.reload()} style={retryBtnStyle}>새로고침</button>
              </div>
            </div>
          )}
          <div style={{padding: '15px'}}>
            <button style={locationBtnStyle} onClick={() => navigate(`/stores?lat=${myLocation.lat}&lng=${myLocation.lng}`)}>
              이 근처 맛집 탐색하기 ➔
            </button>
          </div>
        </section>

        {/* 4. 트렌드 맛집 섹션 */}
        <section style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={famousHeader}>
            <h2 style={{ fontSize: '1.9rem', fontWeight: '900' }}>지금 가장 뜨거운 <span style={{ color: mainColor }}>트렌드 맛집</span> 🔥</h2>
            <button style={viewAllBtn} onClick={() => navigate('/stores')}>더보기 ➔</button>
          </div>
          <div style={storeGridWide}>
            {famousStores.length > 0 ? (
              famousStores.map(store => <StoreCard key={store.id} store={store} navigate={navigate} />)
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: '#bbb' }}>데이터 로딩 중...</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

// --- [Home 컴포넌트용 전체 스타일 가이드] ---

// 1. 기존 레이아웃 스타일
const innerContainer = { maxWidth: '1000px', margin: '0 auto', padding: '0 20px' };
const heroSection = { padding: '80px 0 70px', background: 'linear-gradient(to bottom, #EFEEEC 0%, #F9F8F6 100%)' };
const heroTitle = { fontSize: '2.6rem', fontWeight: '900', textAlign: 'center', marginBottom: '25px', lineHeight: '1.2' };
const searchBarWrapper = { display: 'flex', background: '#fff', borderRadius: '50px', padding: '8px 8px 8px 25px', boxShadow: '0 15px 45px rgba(0,0,0,0.07)', maxWidth: '680px', margin: '0 auto' };
const searchField = { flex: 1, border: 'none', padding: '15px 0', fontSize: '1.1rem', outline: 'none' };
const searchBtn = { color: 'white', border: 'none', padding: '0 30px', borderRadius: '40px', fontWeight: 'bold', cursor: 'pointer' };
const categoryGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '60px', marginTop: '40px' };
const categoryItemStyle = { textAlign: 'center', cursor: 'pointer' };
const categoryIconStyle = { background: '#fff', height: '90px', width: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '24px', margin: '0 auto 15px', boxShadow: '0 6px 15px rgba(0,0,0,0.04)', border: '1px solid #eee' };
const categoryNameStyle = { fontWeight: '700', color: '#444' };
const famousHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' };
const viewAllBtn = { background: 'none', border: 'none', color: "#7DB3D3", fontWeight: '800', cursor: 'pointer', fontSize: '1.15rem' };
const storeGridWide = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' };
const mapWrapperStyle = { position: 'relative', background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.1)', marginBottom: '80px', border: '1px solid #eee' };
const mapHeaderOverlay = { position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 10 };
const addressBadge = { background: 'rgba(255, 255, 255, 0.95)', padding: '10px 18px', borderRadius: '30px', fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const myLocBtn = { background: '#fff', border: 'none', padding: '10px 18px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#F0602A' };
const locationBtnStyle = { width: '100%', background: '#F0602A', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' };

// 2. 지역 탐색 모던 패널 스타일 (에러 방지용 필수 포함)
const modernPanelStyle = { background: '#fff', borderRadius: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden', border: '1px solid #eee' };
const regionPanelHeader = { padding: '25px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const selectorLayout = { display: 'flex', height: '400px' };
const sideBar = { width: '160px', background: '#F9F9F9', overflowY: 'auto', borderRight: '1px solid #eee', padding: '10px 0' };
const sideItem = { padding: '18px 25px', cursor: 'pointer', fontSize: '1rem', position: 'relative', transition: '0.2s all' };
const activeIndicator = { position: 'absolute', right: 0, top: '20%', height: '60%', width: '4px', background: '#F0602A', borderRadius: '4px 0 0 4px' };
const mainContent = { flex: 1, overflowY: 'auto', padding: '25px' };
const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px' };
const gridItem = { padding: '12px 8px', borderRadius: '12px', textAlign: 'center', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '600', transition: '0.2s' };
const selectedBadge = { marginLeft: '15px', padding: '5px 15px', background: '#FFF0EB', color: '#F0602A', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' };
const emptyMessage = { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '1.1rem' };
const panelFooter = { padding: '20px', borderTop: '1px solid #eee' };
const confirmBtn = { width: '100%', color: '#fff', border: 'none', padding: '18px', borderRadius: '15px', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(240, 96, 42, 0.3)' };

// 3. 버튼 및 특수 효과
const regionStartBtn = {
  width: '100%', padding: '22px', borderRadius: '20px', border: 'none', background: '#fff',
  color: '#444', fontWeight: '800', fontSize: '1.15rem', cursor: 'pointer',
  boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s'
};
const closeBtn = { border: 'none', background: 'none', color: '#999', cursor: 'pointer' };
const mapOverlayStyle = { position: 'absolute', top: 0, left: 0, width: '100%', height: '350px', background: 'rgba(0,0,0,0.5)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const guideBoxStyle = { background: 'white', padding: '25px', borderRadius: '20px', textAlign: 'center', width: '80%', maxWidth: '300px' };
const retryBtnStyle = { background: '#F0602A', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold' };
export default Home;