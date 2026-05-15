import React, { useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import Swal from 'sweetalert2';

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
    if (!userName.trim()) return Swal.fire('알림', '예약자 성함을 입력해주세요.', 'info');

    setIsSubmitting(true);
    try {
      // 1. 서버 DTO 형식에 맞춰 데이터 가공
      const requestBody = {
        name: userName,
        headCount: parseInt(headCount, 10), // 정수 변환
        targetDateTime: targetDateTime // yyyy-MM-ddTHH:mm:ss 형식
      };

      // 2. 예약 요청
      await api.post(`/stores/${id}/reservations`, requestBody);

      await Swal.fire({
        icon: 'success',
        title: '예약 완료',
        text: `${storeName} 예약이 성공적으로 완료되었습니다.`,
        confirmButtonColor: '#1890ff'
      });

      // ⭐ 마이페이지 이동 시 '예약 내역' 탭이 뜨도록 신호 저장
      localStorage.setItem('myPageTab', 'history-res');
      navigate(`/my-page`);

    } catch (err) {
      console.error("예약 실패:", err.response?.data);
      const errorMessage = err.response?.data?.message || "예약 처리 중 서버 오류가 발생했습니다.";
      Swal.fire('예약 실패', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayDate = targetDateTime ? targetDateTime.replace('T', ' ').substring(0, 16) : "";

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>예약 확인 및 신청</h2>
      <div style={summaryBox}>
        <p><strong>가게명:</strong> {storeName}</p>
        <p><strong>예약 일시:</strong> {displayDate}</p>
        <p><strong>예약 인원:</strong> {headCount}명</p>
      </div>
      <form onSubmit={handleSubmit} style={formStyle}>
        <label style={labelStyle}>예약자 성함 (실명)</label>
        <input
          type="text"
          placeholder="김둘리"
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

const containerStyle = { maxWidth: '500px', margin: '60px auto', padding: '20px', border: '1px solid #eee', borderRadius: '15px', fontFamily: 'Pretendard, sans-serif' };
const summaryBox = { background: '#f0f7ff', padding: '20px', borderRadius: '10px', marginBottom: '25px', lineHeight: '1.8' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const labelStyle = { fontWeight: 'bold', fontSize: '0.9rem', color: '#555' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' };
const submitBtnStyle = { padding: '15px', background: '#1890ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const cancelBtnStyle = { padding: '10px', background: 'transparent', color: '#999', border: 'none', cursor: 'pointer' };
const centerStyle = { textAlign: 'center', padding: '100px' };

export default Reservation;