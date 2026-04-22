import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';

const StoreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapContainer = useRef(null);

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reservationDate, setReservationDate] = useState(
    new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0]
  );
  const [peopleCount, setPeopleCount] = useState(2);
  const [timeSlots, setTimeSlots] = useState([]);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favCount, setFavCount] = useState(0);

  // 1. 가게 데이터 로드
  useEffect(() => {
    fetchStoreData();
  }, [id]);

  const fetchStoreData = () => {
    api.get(`/stores/${id}`)
      .then(res => {
        setStore(res.data);
        setFavCount(res.data.favorites);
        setIsFavorite(res.data.isFavorite);
        setLoading(false);
      })
      .catch(err => {
        console.error("가게 정보 로드 실패", err);
        setLoading(false);
      });
  };

  // 2. 예약 가능 시간 로드
  useEffect(() => {
    if (!id) return;
    api.get(`/stores/${id}/reservations/time-slot`, {
      params: { targetDate: reservationDate, headCount: peopleCount }
    })
    .then(res => setTimeSlots(res.data))
    .catch(err => console.error("타임슬롯 로드 실패", err));
  }, [id, reservationDate, peopleCount]);

  // 3. ✅ 지도 및 인터랙션 로직 (커스텀 오버레이 추가)
  useEffect(() => {
    if (!loading && store && mapContainer.current) {
      const { kakao } = window;
      if (!kakao || !kakao.maps) return;

      kakao.maps.load(() => {
        const container = mapContainer.current;
        const lat = Number(store.latitude);
        const lng = Number(store.longitude);
        const position = new kakao.maps.LatLng(lat, lng);

        const options = {
          center: position,
          level: 2, // 오버레이와 함께 보기 적당한 레벨
        };

        const map = new kakao.maps.Map(container, options);

        // 줌 컨트롤러 추가
        const zoomControl = new kakao.maps.ZoomControl();
        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

        // 마커 생성
        const marker = new kakao.maps.Marker({
          position: position,
          map: map
        });

        // 💡 추가 기능: 커스텀 오버레이 구성 (디자인 및 링크)
        const content = `
          <div style="
            margin-bottom: 95px;
            padding: 12px 18px;
            background: white;
            border-radius: 12px;
            border: 1px solid #1890ff;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
            font-family: sans-serif;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 150px;
          ">
            <span style="font-weight: bold; font-size: 14px; color: #333; margin-bottom: 6px;">${store.name}</span>
            <a href="https://map.kakao.com/link/to/${store.name},${lat},${lng}"
               target="_blank"
               style="
                display: inline-block;
                padding: 4px 10px;
                background: #1890ff;
                color: white;
                border-radius: 4px;
                text-decoration: none;
                font-size: 12px;
                font-weight: bold;
               ">길찾기 →</a>
            <div style="
              position: absolute;
              bottom: -10px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-top: 10px solid #1890ff;
              border-left: 8px solid transparent;
              border-right: 8px solid transparent;
            "></div>
          </div>
        `;

        const overlay = new kakao.maps.CustomOverlay({
          content: content,
          position: position,
          map: null // 초기에는 숨김
        });

        // 마커 클릭 시 토글 로직
        kakao.maps.event.addListener(marker, 'click', () => {
          if (overlay.getMap()) {
            overlay.setMap(null);
          } else {
            overlay.setMap(map);
            map.panTo(position); // 부드럽게 중심 이동
            map.setLevel(2, { animate: true }); // 확대 레벨 보정
          }
        });

        setTimeout(() => {
          map.relayout();
          map.setCenter(position);
        }, 100);
      });
    }
  }, [loading, store]);

  const handleFavoriteToggle = () => {
    api.post(`/favorites/${id}`, {})
      .then(() => {
        setFavCount(prev => isFavorite ? prev - 1 : prev + 1);
        setIsFavorite(!isFavorite);
      })
      .catch(err => {
        if (err.response?.status === 401) {
          alert("로그인이 필요한 기능입니다.");
          navigate("/login", { state: { from: window.location.pathname } });
        }
      });
  };

  const handleTimeClick = (slot) => {
    if (!slot.isAvailable) return;
    const fullDateTime = `${reservationDate}T${slot.targetTime}`;
    navigate(`/stores/${id}/reserve`, {
      state: { storeName: store.name, targetDateTime: fullDateTime, headCount: peopleCount }
    });
  };

  if (loading) return <div style={centerStyle}>가게 정보를 불러오는 중...</div>;
  if (!store) return <div style={centerStyle}>가게를 찾을 수 없습니다.</div>;

  return (
    <div style={containerStyle}>
      <section style={infoSection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem' }}>{store.name}</h1>
            <p style={subTextStyle}>{store.category} · {store.address}</p>
          </div>
          <button onClick={handleFavoriteToggle} style={favoriteBadge(isFavorite)}>
            {isFavorite ? '❤️' : '🤍'} {favCount}
          </button>
        </div>
        <p style={{ color: '#555' }}>📞 {store.phone}</p>
      </section>

      <hr style={divider} />

      <section style={reserveConfigSection}>
        <h3>📅 예약 설정</h3>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>방문 날짜</label>
            <input type="date" style={inputStyle} value={reservationDate} onChange={(e) => setReservationDate(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>방문 인원</label>
            <input type="number" min="1" style={inputStyle} value={peopleCount} onChange={(e) => setPeopleCount(e.target.value)} />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h3>⏰ 예약 가능 시간</h3>
        <div style={timeGridStyle}>
          {timeSlots.length > 0 ? timeSlots.map((slot, index) => (
            <button
              key={index}
              disabled={!slot.isAvailable}
              style={timeBtnStyle(slot.isAvailable)}
              onClick={() => handleTimeClick(slot)}
            >
              {slot.targetTime.substring(0, 5)}
              <div style={{ fontSize: '0.7rem', marginTop: '4px' }}>
                {slot.isAvailable ? '예약가능' : '마감'}
              </div>
            </button>
          )) : <p style={{ color: '#999' }}>해당 날짜에 운영 정보가 없습니다.</p>}
        </div>
      </section>

      <section style={{ marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '30px', paddingBottom: '50px' }}>
        <h3 style={{ marginBottom: '20px' }}>📍 위치 안내</h3>
        <div
          ref={mapContainer}
          style={{
            width: '100%',
            height: '350px',
            borderRadius: '15px',
            background: '#f8f9fa',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
          }}
        ></div>
        <p style={{ color: '#666', marginTop: '15px', fontSize: '0.95rem', lineHeight: '1.6' }}>
          <strong>도로명 주소:</strong> {store.address}<br />
          <strong>상세 위치:</strong> {store.detailAddress || '정보 없음'}
        </p>
      </section>
    </div>
  );
};

// --- 스타일 시트 (기존 유지) ---
const containerStyle = { maxWidth: '750px', margin: '40px auto', padding: '0 25px', fontFamily: 'Pretendard, -apple-system, sans-serif', color: '#333' };
const infoSection = { marginBottom: '30px' };
const subTextStyle = { color: '#888', fontSize: '1.1rem', margin: '8px 0' };
const favoriteBadge = (isFavorite) => ({
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  background: isFavorite ? '#ff4d4f' : '#fff', color: isFavorite ? '#fff' : '#ff4d4f',
  padding: '10px 22px', borderRadius: '30px', fontWeight: 'bold', border: '1px solid #ff4d4f',
  cursor: 'pointer', transition: '0.2s', fontSize: '1rem',
  boxShadow: isFavorite ? '0 4px 12px rgba(255, 77, 79, 0.25)' : 'none'
});
const divider = { border: 'none', height: '1px', background: '#f0f0f0', margin: '30px 0' };
const reserveConfigSection = { background: '#f8f9fa', padding: '25px', borderRadius: '16px', marginBottom: '35px', border: '1px solid #eee' };
const labelStyle = { display: 'block', marginBottom: '10px', fontSize: '0.9rem', color: '#666', fontWeight: '600' };
const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '1rem', background: '#fff' };
const timeGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '15px' };
const timeBtnStyle = (available) => ({
  padding: '15px 10px', borderRadius: '12px',
  border: available ? '1px solid #1890ff' : '1px solid #e0e0e0',
  background: available ? '#fff' : '#fafafa',
  color: available ? '#1890ff' : '#ccc',
  cursor: available ? 'pointer' : 'not-allowed',
  fontWeight: 'bold', textAlign: 'center', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
});
const centerStyle = { textAlign: 'center', padding: '100px', fontSize: '1.2rem', color: '#999' };

export default StoreDetail;