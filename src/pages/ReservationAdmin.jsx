import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const RES_MAP = {
  status: {
    CONFIRMED: "수락",
    CANCELED: "취소",
    REJECTED: "거절",
    NO_SHOW: "노쇼",
    VISITED: "방문완료"
  }
};

function ReservationAdmin() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [filters, setFilters] = useState({ keyword: '', status: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {


    fetchRes();
    setLoading(false);
  }, [navigate]);

  // 예약 목록 가져오기
  const fetchRes = () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));

    api.get('/admin/reservations', { params })
      .then(res => {
        setReservations(res.data);
        if (res.data.length === 0) {
          Swal.fire({
            icon: 'info',
            title: '검색 결과 없음',
            text: '조건에 일치하는 예약 내역이 없습니다.',
            confirmButtonColor: '#673ab7'
          });
        }
      })
      .catch(err => {
        console.error("예약 데이터 로드 실패:", err);
      });
  };

  const tabStyle = (path) => ({
    padding: '15px 25px', cursor: 'pointer',
    borderBottom: window.location.pathname === path ? '3px solid #673ab7' : '3px solid transparent',
    color: window.location.pathname === path ? '#673ab7' : '#666', fontWeight: 'bold'
  });

  const getStatusStyle = (status) => {
    switch(status) {
      case 'VISITED': return { color: '#2e7d32', fontWeight: 'bold' };
      case 'CONFIRMED': return { color: '#1976d2', fontWeight: 'bold' };
      case 'CANCELED': case 'REJECTED': return { color: '#d32f2f', fontWeight: 'bold' };
      case 'NO_SHOW': return { color: '#757575', fontWeight: 'bold', textDecoration: 'line-through' };
      default: return { color: '#333' };
    }
  };

  // 4. 권한 확인 전까지는 흰 화면(null)만 보여줌
  if (loading) return null;

  return (
    <div style={{ padding: '30px', background: '#f8f9fa', minHeight: '100vh' }}>
      {/* 관리자 탭 메뉴 */}
      <div style={{ display: 'flex', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <div style={tabStyle('/admin')} onClick={() => navigate('/admin')}>유저 관리</div>
        <div style={tabStyle('/admin/stores')} onClick={() => navigate('/admin/stores')}>가게 관리</div>
        <div style={tabStyle('/admin/reservations')} onClick={() => navigate('/admin/reservations')}>예약 관리</div>
      </div>

      <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.03)' }}>
        <h3 style={{ marginTop: 0 }}>📅 예약 관리 (Admin 전용)</h3>

        {/* 필터 섹션 */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <input
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '250px' }}
            placeholder="번호/예약자명/가게명"
            onChange={e => setFilters({...filters, keyword: e.target.value})}
          />
          <select style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} onChange={e => setFilters({...filters, status: e.target.value})}>
            <option value="">예약상태(전체)</option>
            {Object.entries(RES_MAP.status).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button
            onClick={fetchRes}
            style={{ padding: '10px 20px', background: '#673ab7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            검색
          </button>
        </div>

        {/* 테이블 */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: '#888' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th>예약자</th>
                <th>가게명</th>
                <th>일시</th>
                <th>인원</th>
                <th>테이블번호</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length > 0 ? (
                reservations.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f2f2f2' }}>
                    <td style={{ padding: '15px' }}>{r.id}</td>
                    <td style={{ fontWeight: 'bold' }}>{r.name}</td>
                    <td>{r.storeName}</td>
                    <td style={{ fontSize: '13px' }}>{new Date(r.targetDateTime).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                    <td>{r.headCount}명</td>
                    <td>{r.storeTableId}</td>
                    <td style={getStatusStyle(r.status)}>
                      {RES_MAP.status[r.status] || r.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '50px', color: '#999' }}>예약 내역이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReservationAdmin;