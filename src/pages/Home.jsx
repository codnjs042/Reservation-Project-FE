import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreCard } from '../components/StoreCard';

// ⭐ 캐릭터 아이콘 컴포넌트
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
  const [keyword, setKeyword] = useState("");
  const [famousStores, setFamousStores] = useState([]);
  const scrollRef = useRef(null);
  const scrollInterval = useRef(null);

  const mainColor = "#F0602A";
  const skyPointColor = "#7DB3D3";

  // 트렌드 맛집 로드
  useEffect(() => {
    axios.get(`http://localhost:8081/stores/famous`)
      .then(res => setFamousStores(res.data.slice(0, 6)))
      .catch(err => console.error("트렌딩 로드 실패", err));
  }, []);

  // 테마 데이터
  const originalThemes = [
    { t: '비오는 날 파전', img: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=400', tag: 'KOREAN' },
    { t: '두툼한 정통 스테이크', img: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?q=80&w=400', tag: 'WESTERN' },
    { t: '신선한 연어 초밥', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=400', tag: 'JAPANESE' },
    { t: '매콤한 마라탕의 유혹', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=400', tag: 'CHINESE' },
    { t: '육수 깊은 쌀국수', img: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=400', tag: 'ASIAN' },
  ];
  const themes = [...originalThemes, ...originalThemes, ...originalThemes];

  useEffect(() => {
    if (scrollRef.current) {
      const singleSetWidth = originalThemes.length * 340;
      scrollRef.current.scrollLeft = singleSetWidth;
    }
  }, []);

  const handleInfiniteScroll = () => {
    const { current } = scrollRef;
    if (!current) return;
    const singleSetWidth = originalThemes.length * 340;
    if (current.scrollLeft >= singleSetWidth * 2) current.scrollLeft = singleSetWidth;
    if (current.scrollLeft <= 0) current.scrollLeft = singleSetWidth;
  };

  // ⭐ 스크롤 속도 낮춤 (2px씩 이동하여 부드럽고 천천히)
  const startScrolling = (direction) => {
    if (scrollInterval.current) return;
    scrollInterval.current = setInterval(() => {
      if (scrollRef.current) {
        const scrollSpeed = direction === 'left' ? -4 : 4;
        scrollRef.current.scrollLeft += scrollSpeed;
        handleInfiniteScroll();
      }
    }, 15); // 부드러운 프레임 유지
  };

  const stopScrolling = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
  };

  const categoryList = [
    { id: 'KOREAN', name: '한식' }, { id: 'JAPANESE', name: '일식' },
    { id: 'CHINESE', name: '중식' }, { id: 'WESTERN', name: '양식' },
    { id: 'ASIAN', name: '아시안' },
  ];

  return (
    <div style={{ background: '#F9F8F6', minHeight: '100vh', paddingBottom: '100px' }}>

      {/* 1. 히어로 섹션 */}
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
        {/* 2. 카테고리 영역 */}
        <section style={categoryGridStyle}>
          {categoryList.map(cat => (
            <div key={cat.id} style={categoryItemStyle} onClick={() => navigate(`/stores?category=${cat.id}`)}>
              <div style={categoryIconStyle}><FoodCharacterIcon type={cat.id} /></div>
              <span style={categoryNameStyle}>{cat.name}</span>
            </div>
          ))}
        </section>

        {/* 3. 무한 슬라이더 테마 영역 */}
        <section style={{ marginBottom: '100px', position: 'relative' }}>
          <h3 style={sectionTitle}>✨ 이런 테마는 어때요?</h3>
          <div style={sliderContainer}>
            <div style={{ ...hoverZone, left: 0 }} onMouseEnter={() => startScrolling('left')} onMouseLeave={stopScrolling}>
              <div style={arrowCircle}>&lt;</div>
            </div>
            <div style={{ ...hoverZone, right: 0 }} onMouseEnter={() => startScrolling('right')} onMouseLeave={stopScrolling}>
              <div style={arrowCircle}>&gt;</div>
            </div>
            <div style={sliderWrapper} ref={scrollRef} onScroll={handleInfiniteScroll}>
              {themes.map((item, idx) => (
                <div key={idx} style={sliderCard} onClick={() => navigate(`/stores?category=${item.tag}`)}>
                  <div style={{ ...cardImg, backgroundImage: `url(${item.img})` }}>
                     <div style={cardOverlay}>{item.t}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. 트렌드 맛집 섹션 */}
        <section style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={famousHeader}>
            <h2 style={{ fontSize: '1.9rem', fontWeight: '900', letterSpacing: '-1px' }}>
              지금 가장 뜨거운 <span style={{ color: mainColor }}>트렌드 맛집</span> 🔥
            </h2>
            <button style={viewAllBtn} onClick={() => navigate('/stores')}>
              더보기 ➔
            </button>
          </div>
          <div style={storeGridWide}>
            {famousStores.length > 0 ? (
              famousStores.map(store => (
                <StoreCard key={store.id} store={store} navigate={navigate} />
              ))
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: '#bbb' }}>데이터를 불러오는 중입니다...</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

// --- 스타일 정의 ---
const innerContainer = { maxWidth: '1000px', margin: '0 auto', padding: '0 20px' };
const heroSection = { padding: '80px 0 70px', background: 'linear-gradient(to bottom, #EFEEEC 0%, #F9F8F6 100%)' };
const heroTitle = { fontSize: '2.6rem', fontWeight: '900', textAlign: 'center', marginBottom: '25px', lineHeight: '1.2' };
const searchBarWrapper = { display: 'flex', background: '#fff', borderRadius: '50px', padding: '8px 8px 8px 25px', boxShadow: '0 15px 45px rgba(0,0,0,0.07)', maxWidth: '680px', margin: '0 auto' };
const searchField = { flex: 1, border: 'none', padding: '15px 0', fontSize: '1.1rem', outline: 'none' };
const searchBtn = { color: 'white', border: 'none', padding: '0 30px', borderRadius: '40px', fontWeight: 'bold', cursor: 'pointer' };
const categoryGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '80px', marginTop: '40px' };
const categoryItemStyle = { textAlign: 'center', cursor: 'pointer' };
const categoryIconStyle = { background: '#fff', height: '90px', width: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '24px', margin: '0 auto 15px', boxShadow: '0 6px 15px rgba(0,0,0,0.04)', border: '1px solid #eee' };
const categoryNameStyle = { fontWeight: '700', color: '#444' };
const sectionTitle = { fontSize: '1.7rem', fontWeight: '900', marginBottom: '25px', color: '#222' };

const sliderContainer = { position: 'relative', width: '100%', overflow: 'hidden', borderRadius: '20px' };
const hoverZone = { position: 'absolute', top: 0, bottom: 0, width: '100px', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const arrowCircle = { width: '45px', height: '45px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F0602A', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
const sliderWrapper = { display: 'flex', gap: '20px', overflowX: 'hidden', padding: '10px 0' };
const sliderCard = { minWidth: '320px', height: '400px', borderRadius: '24px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' };
const cardImg = { width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'flex-end' };
const cardOverlay = { width: '100%', padding: '30px 20px', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)', color: '#fff', fontSize: '1.2rem', fontWeight: '800' };

const famousHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' };
const viewAllBtn = {
  background: 'none',
  border: 'none',
  color: "#7DB3D3",
  fontWeight: '800',
  cursor: 'pointer',
  fontSize: '1.15rem',
  letterSpacing: '-0.5px',
  padding: '5px 0'
};
const storeGridWide = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' };

export default Home;