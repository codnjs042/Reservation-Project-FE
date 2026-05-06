import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';   // 인터셉터가 적용된 커스텀 api 인스턴스 임포트
import { StoreCard } from '../components/StoreCard';
import { List, ChevronRight, MapPin, Target, X } from 'lucide-react';

const FoodCharacterIcon = ({ type }) => {
  const iconData = {
    KOREAN: '🍚',
    SNACK: '🍢',
    CHICKEN: '🍗',
    JAPANESE: '🍣',
    CHINESE: '🥡',
    WESTERN: '🍝',
    ASIAN: '🍜',
    FASTFOOD: '🍔',
    BUFFET: '🍽️',
    FUSION: '🍱'
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px'
    }}>
      {iconData[type] || '🍴'}
    </div>
  );
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

  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [sidoList, setSidoList] = useState([]);
  const [sigunguList, setSigunguList] = useState([]);
  const [selectedSido, setSelectedSido] = useState(null);
  const [selectedSigungu, setSelectedSigungu] = useState(null);

  // 0. 구글 로그인 후 처리 (수정된 로직)
  useEffect(() => {
    // 이미 로그인된 상태면 더 이상 검사 안 함
    if (localStorage.getItem("isLoggedIn") === "true") return;

    // URL에서 ?login=process 가 있는지 확인
    const params = new URLSearchParams(window.location.search);
    const isProcessingLogin = params.get("login") === "process";

    // 로그인 프로세스 중일 때만 /users/me 를 호출!
    if (isProcessingLogin) {
      api.get("/users/me")
        .then(res => {
          alert("구글 로그인 성공! 🎉");
          localStorage.setItem("user", JSON.stringify(res.data));
          localStorage.setItem("isLoggedIn", "true");

          // 성공 후에는 URL에서 ?login=process를 지워주고 홈으로 이동
          navigate("/", { replace: true });
        })
        .catch((err) => {
          console.error("인증 실패", err);
        });
    }
    // isProcessingLogin이 아니면(그냥 방문자면) 아무것도 하지 않음 -> 에러 팝업 안 뜸!
  }, [navigate]);

  // 1. 초기 로드: 유명 맛집 및 시/도 목록 (api 인스턴스 사용)
  useEffect(() => {
    api.get(`/stores/famous`)
      .then(res => setFamousStores(res.data.slice(0, 6)))
      .catch(err => console.error("트렌딩 로드 실패", err));

    api.get(`/area`)
      .then(res => {
        if (res.data) setSidoList(res.data);
      })
      .catch(err => console.error("시도 로드 실패", err));
  }, []);

  // 2. 시/도 클릭 시 시군구 호출 (api 인스턴스 사용)
  const handleSidoClick = (sido) => {
    setSelectedSido(sido);
    setSelectedSigungu(null);

    api.get(`/area`, { params: { cd: sido.cd } })
      .then(res => {
        if (res.data) setSigunguList(res.data);
      })
      .catch(err => console.error("시군구 로드 실패", err));
  };

  // 3. 지도 초기화
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

  // 4. 주변 음식점 표시 (api 인스턴스 사용)
  const displayNearbyStores = (lat, lng) => {
    if (!mapInstance) return;
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

  const categoryList = [
    { id: 'KOREAN', name: '한식' }, { id: 'SNACK', name: '분식' },
    { id: 'CHICKEN', name: '치킨' }, { id: 'ASIAN', name: '동양식' },
    { id: 'WESTERN', name: '서양식' }, { id: 'CHINESE', name: '중식' },
    { id: 'JAPANESE', name: '일식' }, { id: 'FASTFOOD', name: '패스트푸드' },
    { id: 'BUFFET', name: '뷔페' }, { id: 'FUSION', name: '퓨전' }
  ];

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

        {/* 2. 지역별 탐색 섹션 */}
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

                <div style={mainContent}>
                  {selectedSido ? (
                    <div style={gridContainer}>
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
            <h2 style={{ fontSize: '1.9rem', fontWeight: '900' }}>최근 급상승 <span style={{ color: mainColor }}>트렌드 맛집</span> 🔥</h2>
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

// --- [Style Guide] ---
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