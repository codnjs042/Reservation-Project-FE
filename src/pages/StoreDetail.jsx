import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import Swal from 'sweetalert2';

const StoreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapContainer = useRef(null);

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  // 날짜 초기값 설정 (로컬 시간 기준)
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
        setFavCount(res.data.favorites || 0);
        setIsFavorite(res.data.isFavorite || false);
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
    .then(res => {
      // 데이터가 배열인지 확인 후 설정
      setTimeSlots(Array.isArray(res.data) ? res.data : []);
    })
    .catch(err => {
      console.error("타임슬롯 로드 실패", err);
      setTimeSlots([]); // 에러 시 빈 배열로 초기화하여 렌더링 에러 방지
    });
  }, [id, reservationDate, peopleCount]);

  // 3. 지도 로직
  useEffect(() => {
    if (!loading && store && mapContainer.current) {
      const { kakao } = window;
      if (!kakao || !kakao.maps) return;

      kakao.maps.load(() => {
        const container = mapContainer.current;
        const lat = Number(store.latitude);
        const lng = Number(store.longitude);
        if (isNaN(lat) || isNaN(lng)) return;

        const position = new kakao.maps.LatLng(lat, lng);
        const options = { center: position, level: 3 };
        const map = new kakao.maps.Map(container, options);
        new kakao.maps.Marker({ position: position, map: map });

        setTimeout(() => {
          map.relayout();
          map.setCenter(position);
        }, 100);
      });
    }
  }, [loading, store]);

  // 4. 시간 클릭 시 예약 페이지 이동
  const handleTimeClick = (slot) => {
    const role = localStorage.getItem("role");

    if (!role) {
      Swal.fire({
        icon: 'warning',
        title: '로그인 필요',
        text: '로그인 후 이용 가능합니다.',
        confirmButtonColor: '#1890ff'
      });
      navigate('/login');
      return;
    }

    const fullDateTime = slot.targetTime.includes('T')
        ? slot.targetTime
        : `${reservationDate}T${slot.targetTime}`;

      navigate(`/stores/${id}/reserve`, {
        state: {
          storeName: store.name,
          targetDateTime: fullDateTime, // 👈 날짜가 포함된 풀 포맷 전송
          headCount: peopleCount
        }
      });
  };

  // 5. 관심 등록 토글
  const handleFavoriteToggle = () => {
    const apiCall = isFavorite ? api.delete(`/favorites/${id}`) : api.post(`/favorites/${id}`);
      apiCall.then(() => {
        setFavCount(prev => isFavorite ? prev - 1 : prev + 1);
        setIsFavorite(!isFavorite);
      }).catch(err => console.error("관심등록 실패", err));
  };

  if (loading) return <div style={centerStyle}>가게 정보를 불러오는 중...</div>;
  if (!store) return <div style={centerStyle}>가게를 찾을 수 없습니다.</div>;

  return (
    <div style={containerStyle}>
      {/* 가게 기본 정보 */}
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

      {/* 예약 설정 (날짜/인원) */}
      <section style={reserveConfigSection}>
        <h3>📅 예약 설정</h3>
        <div style={{ display: 'flex', gap: '20px' }}>
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

      {/* 예약 가능 시간 (에러 방지 처리 완료) */}
      <section style={{ marginBottom: '40px' }}>
        <h3>⏰ 예약 가능 시간</h3>
        <div style={timeGridStyle}>
          {timeSlots.length > 0 ? timeSlots.map((slot, index) => {
            // targetTime 데이터 유무 확인
            if (!slot?.targetTime) return null;

            // 시간 표시 문자열 가공 (안전하게)
            const timePart = slot.targetTime.includes('T')
              ? slot.targetTime.split('T')[1].substring(0, 5)
              : slot.targetTime.substring(0, 5);

            return (
              <button
                key={index}
                disabled={!slot.isAvailable}
                style={timeBtnStyle(slot.isAvailable)}
                onClick={() => handleTimeClick(slot)}
              >
                {timePart}
                <div style={{ fontSize: '0.7rem', marginTop: '4px' }}>
                  {slot.isAvailable ? '예약가능' : '마감'}
                </div>
              </button>
            );
          }) : <p style={{ color: '#999' }}>해당 날짜에 예약 가능한 정보가 없습니다.</p>}
        </div>
      </section>

      {/* 위치 정보 */}
      <section style={{ marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '30px', paddingBottom: '50px' }}>
        <h3>📍 위치 안내</h3>
        <div ref={mapContainer} style={mapStyle}></div>
        <p style={{ color: '#666', marginTop: '15px', fontSize: '0.95rem' }}>
          <strong>도로명 주소:</strong> {store.address}
        </p>
      </section>
    </div>
  );
};

// --- 스타일 시트 ---
const containerStyle = { maxWidth: '750px', margin: '40px auto', padding: '0 25px', fontFamily: 'Pretendard, sans-serif', color: '#333' };
const infoSection = { marginBottom: '30px' };
const subTextStyle = { color: '#888', fontSize: '1.1rem', margin: '8px 0' };
const favoriteBadge = (isFavorite) => ({
  background: isFavorite ? '#ff4d4f' : '#fff', color: isFavorite ? '#fff' : '#ff4d4f',
  padding: '10px 22px', borderRadius: '30px', fontWeight: 'bold', border: '1px solid #ff4d4f',
  cursor: 'pointer', transition: '0.2s', borderStyle: 'solid'
});
const divider = { border: 'none', height: '1px', background: '#f0f0f0', margin: '30px 0' };
const reserveConfigSection = { background: '#f8f9fa', padding: '25px', borderRadius: '16px', marginBottom: '35px', border: '1px solid #eee' };
const labelStyle = { display: 'block', marginBottom: '10px', fontSize: '0.9rem', color: '#666', fontWeight: '600' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', boxSizing: 'border-box' };
const timeGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '15px' };
const timeBtnStyle = (available) => ({
  padding: '15px 10px', borderRadius: '12px',
  border: available ? '1px solid #1890ff' : '1px solid #e0e0e0',
  background: available ? '#fff' : '#fafafa',
  color: available ? '#1890ff' : '#ccc',
  cursor: available ? 'pointer' : 'not-allowed',
  fontWeight: 'bold', textAlign: 'center'
});
const mapStyle = { width: '100%', height: '350px', borderRadius: '15px', background: '#eee' };
const centerStyle = { textAlign: 'center', padding: '100px', color: '#999' };

export default StoreDetail;