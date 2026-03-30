import React, { useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Reservation = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { storeName, targetDateTime, headCount } = location.state || {};

  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!location.state) {
    return <div style={centerStyle}>잘못된 접근입니다. 가게 페이지에서 시간을 선택해주세요.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim()) return alert("예약자 성함을 입력해주세요.");

    setIsSubmitting(true);
    try {
      // 1. 예약 API 호출
      await axios.post(
        `http://localhost:8081/stores/${id}/reservations`,
        {
          name: userName,
          headCount: headCount,
          targetDateTime: targetDateTime
        },
        { withCredentials: true } // 세션/쿠키 기반 인증 시 필요
      );

      alert(`${storeName} 예약이 완료되었습니다!`);

      // ⭐ 핵심: 마이페이지에 들어갔을 때 '예약 목록' 탭이 바로 뜨도록 설정
      localStorage.setItem('activeTab', 'history-res');
      navigate(`/my-page`);

    } catch (err) {
      console.error("예약 실패", err);
      alert(err.response?.data?.message || "예약에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayDate = targetDateTime.replace('T', ' ').substring(0, 16);

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>예약 확인 및 신청</h2>

      <div style={summaryBox}>
        <p><strong>가게명:</strong> {storeName}</p>
        <p><strong>예약 일시:</strong> {displayDate}</p>
        <p><strong>예약 인원:</strong> {headCount}명</p>
      </div>

      <form onSubmit={handleSubmit} style={formStyle}>
        <label style={labelStyle}>예약자 성함</label>
        <input
          type="text"
          placeholder="성함을 입력하세요"
          style={inputStyle}
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />

        <button type="submit" style={submitBtnStyle} disabled={isSubmitting}>
          {isSubmitting ? "처리 중..." : "최종 예약하기"}
        </button>
        <button type="button" onClick={() => navigate(-1)} style={cancelBtnStyle}>취소</button>
      </form>
    </div>
  );
};

// 스타일 시트 (Reservation 전용)
const containerStyle = { maxWidth: '500px', margin: '60px auto', padding: '20px', border: '1px solid #eee', borderRadius: '15px', fontFamily: 'sans-serif' };
const summaryBox = { background: '#f0f7ff', padding: '20px', borderRadius: '10px', marginBottom: '25px', lineHeight: '1.8' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const labelStyle = { fontWeight: 'bold', fontSize: '0.9rem', color: '#555' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' };
const submitBtnStyle = { padding: '15px', background: '#1890ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const cancelBtnStyle = { padding: '10px', background: 'transparent', color: '#999', border: 'none', cursor: 'pointer' };
const centerStyle = { textAlign: 'center', padding: '100px' };

export default Reservation;