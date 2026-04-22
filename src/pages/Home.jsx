import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreCard } from '../components/StoreCard';

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

  // 📍 추가: 권한 거부 상태 관리
  const [isDenied, setIsDenied] = useState(false);

  // 📍 초기값: 서울 중구
  const [myLocation, setMyLocation] = useState({
    lat: 37.5665,
    lng: 126.9780,
    address: "서울 중구 (기본 위치)"
  });
  const [locLoading, setLocLoading] = useState(false);

  const mainColor = "#F0602A";
  const skyPointColor = "#7DB3D3";

  useEffect(() => {
    axios.get(`http://localhost:8081/stores/famous`)
      .then(res => setFamousStores(res.data.slice(0, 6)))
      .catch(err => console.error("트렌딩 로드 실패", err));
  }, []);

  useEffect(() => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          const options = {
            center: new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng),
            level: 2 // 주변 가게를 보기 위해 레벨을 약간 조정 (3->4)
          };
          const map = new window.kakao.maps.Map(mapContainer.current, options);
          setMapInstance(map);
        });
      }
    }, []);

    // 3. 주변 가게들을 지도에 표시하는 함수
    const displayNearbyStores = (lat, lng) => {
      if (!mapInstance) return;

      // 1. 기존 마커 및 이름표(오버레이) 제거를 위해 배열 관리 수정
      // nearMarkersRef에 마커와 오버레이를 같이 담아둘 예정입니다.
      nearMarkersRef.current.forEach(item => {
        if (item.setMap) item.setMap(null); // 마커 또는 오버레이 제거
      });
      nearMarkersRef.current = [];

      axios.get(`http://localhost:8081/stores/nearby`, {
        params: { latitude: lat, longitude: lng }
      })
      .then(res => {
        const stores = res.data;
        const imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
        const imageSize = new window.kakao.maps.Size(24, 35);
        const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);

        const newItems = [];

        stores.forEach(store => {
          const position = new window.kakao.maps.LatLng(store.latitude, store.longitude);

          // 1. 마커 생성 (기존과 동일)
          const marker = new window.kakao.maps.Marker({
            map: mapInstance,
            position: position,
            image: markerImage
          });

          // 2. 이름표(커스텀 오버레이) 생성 - 텍스트만 깔끔하게
          const labelContent = `
            <div style="
              position: relative;
              top: 5px;
              color: #000;
              font-size: 15px;
              font-weight: 900;
              text-align: center;
              /* 글자가 지도 배경에 묻히지 않도록 흰색 외곽선만 살짝 (강조용) */
              text-shadow: -1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 1.5px 1.5px 0 #fff;
              white-space: nowrap;
              pointer-events: none;
              letter-spacing: -0.8px;
            ">
              ${store.name}
            </div>
          `;

          const customOverlay = new window.kakao.maps.CustomOverlay({
            position: position,
            content: labelContent,
            yAnchor: 0
          });

          customOverlay.setMap(mapInstance);

          // 마커 클릭 이벤트
          window.kakao.maps.event.addListener(marker, 'click', () => {
            navigate(`/stores/${store.id}`);
          });

          newItems.push(marker);
          newItems.push(customOverlay);
        });

        nearMarkersRef.current = newItems;
      })
      .catch(err => console.error("주변 가게 로드 실패", err));
    };

    // 4. 내 위치 갱신 및 주변 가게 탐색
    const refreshLocation = () => {
      if (!window.kakao || !window.kakao.maps) return;

      setLocLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsDenied(false);
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          const geocoder = new window.kakao.maps.services.Geocoder();
          geocoder.coord2Address(lng, lat, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const addr = result[0].address.address_name;
              setMyLocation({ lat, lng, address: addr });

              const newPos = new window.kakao.maps.LatLng(lat, lng);

              if (mapInstance) {
                mapInstance.setCenter(newPos);

                // 내 위치 마커 (기본 빨간색 유지)
                if (markerRef.current) markerRef.current.setMap(null);
                markerRef.current = new window.kakao.maps.Marker({
                  position: newPos,
                  map: mapInstance,
                });

                // ⭐️ 주변 가게 가져와서 뿌리기 실행
                displayNearbyStores(lat, lng);
              }
            }
            setLocLoading(false);
          });
        },
        (err) => {
          setLocLoading(false);
          if (err.code === 1) setIsDenied(true);
          console.error("위치 획득 실패:", err);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    };

    useEffect(() => {
      if (mapInstance) {
        refreshLocation();
      }
    }, [mapInstance]);

  const categoryList = [
    { id: 'KOREAN', name: '한식' }, { id: 'JAPANESE', name: '일식' },
    { id: 'CHINESE', name: '중식' }, { id: 'WESTERN', name: '양식' },
    { id: 'ASIAN', name: '아시안' },
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
        <section style={categoryGridStyle}>
          {categoryList.map(cat => (
            <div key={cat.id} style={categoryItemStyle} onClick={() => navigate(`/stores?category=${cat.id}`)}>
              <div style={categoryIconStyle}><FoodCharacterIcon type={cat.id} /></div>
              <span style={categoryNameStyle}>{cat.name}</span>
            </div>
          ))}
        </section>

        {/* 📍 지도 섹션 (기존 스타일 유지 + 안내 레이어 추가) */}
        <section style={mapWrapperStyle}>
          <div style={mapHeaderOverlay}>
            <div style={addressBadge}>
              <span style={{marginRight:'5px'}}>📍</span>
              {locLoading ? "위치 탐색 중..." : myLocation.address}
            </div>
            <button onClick={refreshLocation} style={myLocBtn}>
              {locLoading ? "..." : "🎯 내 위치"}
            </button>
          </div>

          <div ref={mapContainer} style={{ width: '100%', height: '350px', background: '#eee' }}></div>

          {/* ★ 추가: 위치 권한 거부 시 나타나는 오버레이 ★ */}
          {isDenied && (
            <div style={mapOverlayStyle}>
              <div style={guideBoxStyle}>
                <h4 style={{ margin: '0 0 10px 0', color: '#222' }}>위치 권한이 차단되었습니다!</h4>
                <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.5', margin: '0 0 15px 0' }}>
                  브라우저 주소창 왼쪽의 <b>자물쇠 아이콘</b>을 눌러<br/>
                  [위치] 권한을 <b>허용</b>으로 바꾼 뒤 새로고침 해주세요.
                </p>
                <button onClick={() => window.location.reload()} style={retryBtnStyle}>
                  설정 변경 후 새로고침
                </button>
                <button onClick={() => setIsDenied(false)} style={{...retryBtnStyle, background:'#ddd', color:'#333', marginLeft:'10px'}}>
                  닫기
                </button>
              </div>
            </div>
          )}

          <div style={{padding: '15px'}}>
             <button
                style={locationBtnStyle}
                onClick={() => navigate(`/stores?lat=${myLocation.lat}&lng=${myLocation.lng}`)}
              >
                이 근처 맛집 탐색하기 ➔
              </button>
          </div>
        </section>

        <section style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={famousHeader}>
            <h2 style={{ fontSize: '1.9rem', fontWeight: '900', letterSpacing: '-1px' }}>
              지금 가장 뜨거운 <span style={{ color: mainColor }}>트렌드 맛집</span> 🔥
            </h2>
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

// --- 스타일 (기존 유지 + 새 스타일 추가) ---
const mapWrapperStyle = { position: 'relative', background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.1)', marginBottom: '80px', border: '1px solid #eee' };
const mapHeaderOverlay = { position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 10, pointerEvents: 'none' };
const addressBadge = { background: 'rgba(255, 255, 255, 0.95)', padding: '10px 20px', borderRadius: '30px', fontWeight: '800', fontSize: '0.95rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', color: '#333', pointerEvents: 'auto' };
const myLocBtn = { background: '#fff', border: 'none', padding: '10px 15px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', color: '#F0602A', pointerEvents: 'auto' };
const locationBtnStyle = { width: '100%', background: '#F0602A', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' };
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
const viewAllBtn = { background: 'none', border: 'none', color: "#7DB3D3", fontWeight: '800', cursor: 'pointer', fontSize: '1.15rem', letterSpacing: '-0.5px', padding: '5px 0' };
const storeGridWide = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' };

// 새 안내창 스타일 (지도 영역에만 덮음)
const mapOverlayStyle = { position: 'absolute', top: 0, left: 0, width: '100%', height: '350px', background: 'rgba(0,0,0,0.5)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const guideBoxStyle = { background: 'white', padding: '25px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', width: '85%', maxWidth: '320px' };
const retryBtnStyle = { background: '#F0602A', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };

export default Home;