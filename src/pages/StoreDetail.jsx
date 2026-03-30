import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StoreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reservationDate, setReservationDate] = useState(new Date().toISOString().split('T')[0]);
  const [peopleCount, setPeopleCount] = useState(2);
  const [timeSlots, setTimeSlots] = useState([]);

  // ✅ 초기값은 false와 0으로 설정 (fetch 후 업데이트됨)
  const [isFavorite, setIsFavorite] = useState(false);
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    fetchStoreData();
  }, [id]);

  const fetchStoreData = () => {
    // 세션 정보를 같이 보내야 하므로 withCredentials 설정 (필요시)
    axios.get(`http://localhost:8081/stores/${id}`, { withCredentials: true })
      .then(res => {
        setStore(res.data);
        // ✅ 서버에서 넘어온 DTO의 데이터를 상태에 반영
        setFavCount(res.data.favorites);
        setIsFavorite(res.data.isFavorite);
        setLoading(false);
      })
      .catch(err => {
        console.error("가게 정보 로드 실패", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!id) return;
    axios.get(`http://localhost:8081/stores/${id}/reservations/time-slot`, {
      params: {
        targetDate: reservationDate,
        headCount: peopleCount
      }
    })
    .then(res => setTimeSlots(res.data))
    .catch(err => console.error("타임슬롯 로드 실패", err));
  }, [id, reservationDate, peopleCount]);

  // ⭐ 하트 클릭 시 토글 로직 수정
  const handleFavoriteToggle = () => {
    axios.patch(`http://localhost:8081/favorites/${id}`, {}, { withCredentials: true })
      .then(res => {
        /*
           ✅ 백엔드 토글 API가 현재 상태를 반환하도록 설계했다면 (예: res.data.isFavorite)
           그 값을 직접 쓰는 것이 가장 정확합니다.
           만약 반환값이 없다면 아래처럼 로컬에서 반전시킵니다.
        */
        if (isFavorite) {
          setFavCount(prev => prev - 1);
        } else {
          setFavCount(prev => prev + 1);
        }
        setIsFavorite(!isFavorite);
      })
      .catch(err => {
        // 401 Unauthorized 에러 시 로그인 페이지로 이동
        if (err.response?.status === 401) {
          alert("로그인이 필요한 기능입니다.");
          navigate("/login", { state: { from: window.location.pathname } });
        } else {
          console.error("토글 실패", err);
        }
      });
  };

  const handleTimeClick = (slot) => {
    if (!slot.isAvailable) return;
    const fullDateTime = `${reservationDate}T${slot.targetTime}`;
    navigate(`/stores/${id}/reserve`, {
      state: {
        storeName: store.name,
        targetDateTime: fullDateTime,
        headCount: peopleCount
      }
    });
  };

  if (loading) return <div style={centerStyle}>가게 정보를 불러오는 중...</div>;
  if (!store) return <div style={centerStyle}>가게를 찾을 수 없습니다.</div>;

  return (
    <div style={containerStyle}>
      <section style={infoSection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>{store.name}</h1>

          {/* 하트 버튼 영역 */}
          <button
            onClick={handleFavoriteToggle}
            style={favoriteBadge(isFavorite)}
          >
            {isFavorite ? '❤️' : '🤍'} {favCount}
          </button>
        </div>
        <p style={subTextStyle}>{store.category} · {store.address}</p>
        <p style={{ color: '#555' }}>📞 {store.phone}</p>
      </section>

      <hr style={divider} />

      <section style={reserveConfigSection}>
        <h3>📅 예약 설정</h3>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>방문 날짜</label>
            <input
              type="date"
              style={inputStyle}
              value={reservationDate}
              onChange={(e) => setReservationDate(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>방문 인원</label>
            <input
              type="number"
              min="1"
              style={inputStyle}
              value={peopleCount}
              onChange={(e) => setPeopleCount(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section>
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
          )) : <p>해당 날짜에 운영 정보가 없습니다.</p>}
        </div>
      </section>
    </div>
  );
};

// --- 스타일 시트 ---
const containerStyle = { maxWidth: '700px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' };
const infoSection = { marginBottom: '30px' };
const subTextStyle = { color: '#888', fontSize: '1.1rem', margin: '10px 0' };

const favoriteBadge = (isFavorite) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  background: isFavorite ? '#ff4d4f' : '#fff',
  color: isFavorite ? '#fff' : '#ff4d4f',
  padding: '10px 20px',
  borderRadius: '30px',
  fontWeight: 'bold',
  border: '1px solid #ff4d4f',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontSize: '1rem',
  boxShadow: isFavorite ? '0 4px 10px rgba(255, 77, 79, 0.3)' : 'none'
});

const divider = { border: 'none', height: '1px', background: '#eee', margin: '30px 0' };
const reserveConfigSection = { background: '#f9f9f9', padding: '25px', borderRadius: '15px', marginBottom: '30px' };
const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#666', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '1rem' };
const timeGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' };
const timeBtnStyle = (available) => ({
  padding: '15px 10px',
  borderRadius: '10px',
  border: available ? '1px solid #1890ff' : '1px solid #ddd',
  background: available ? '#fff' : '#f5f5f5',
  color: available ? '#1890ff' : '#bfbfbf',
  cursor: available ? 'pointer' : 'not-allowed',
  fontWeight: 'bold',
  textAlign: 'center',
  transition: '0.2s'
});
const centerStyle = { textAlign: 'center', padding: '100px' };

export default StoreDetail;