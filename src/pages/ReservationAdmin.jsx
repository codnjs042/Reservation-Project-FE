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
  },
  dayOfWeek: {
    MONDAY: "월요일", TUESDAY: "화요일", WEDNESDAY: "수요일",
    THURSDAY: "목요일", FRIDAY: "금요일", SATURDAY: "토요일", SUNDAY: "일요일"
  }
};

function ReservationAdmin() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [filters, setFilters] = useState({ keyword: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0 });
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchRes(page, size);
    setLoading(false);
  }, [page]);

  useEffect(() => {
    document.body.style.overflow = (selectedReservation || modalLoading) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedReservation, modalLoading]);

  const fetchRes = (currentPage = page, currentSize = size) => {
    const params = {
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
      page: currentPage,
      size: currentSize,
    };

    api.get('/admin/reservations', { params })
      .then(res => {
        setReservations(res.data.content);
        setPageInfo({ totalPages: res.data.totalPages, totalElements: res.data.totalElements });
        if (res.data.content.length === 0) {
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

  const fetchReservationDetail = (id) => {
    setModalLoading(true);
    api.get(`/admin/reservations/${id}`)
      .then(res => {
        setSelectedReservation(res.data);
      })
      .catch(err => {
        console.error("예약 상세 로드 실패:", err);
        Swal.fire({ icon: 'error', title: '오류', text: '예약 상세 정보를 불러오지 못했습니다.', confirmButtonColor: '#673ab7' });
      })
      .finally(() => setModalLoading(false));
  };

  const handleSearch = () => {
    setPage(0);
    fetchRes(0, size);
  };

  const handleSizeChange = (newSize) => {
    setSize(newSize);
    setPage(0);
    fetchRes(0, newSize);
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' });
  };

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
        <h3 style={{ marginTop: 0 }}>예약 관리 (Admin 전용)</h3>

        {/* 필터 섹션 */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '250px' }}
            placeholder="번호/아이디/예약자명/가게명"
            onChange={e => setFilters({...filters, keyword: e.target.value})}
          />
          <select style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} onChange={e => setFilters({...filters, status: e.target.value})}>
            <option value="">예약상태(전체)</option>
            {Object.entries(RES_MAP.status).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button
            onClick={handleSearch}
            style={{ padding: '10px 20px', background: '#673ab7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            검색
          </button>
          <select
            value={size}
            onChange={e => handleSizeChange(Number(e.target.value))}
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', marginLeft: 'auto' }}
          >
            <option value={10}>10건</option>
            <option value={50}>50건</option>
            <option value={100}>100건</option>
          </select>
        </div>

        {/* 테이블 */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: '#888' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th>아이디</th>
                <th>예약자</th>
                <th>가게명</th>
                <th>일시</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length > 0 ? (
                reservations.map(r => (
                  <tr
                    key={r.id}
                    onClick={() => fetchReservationDetail(r.id)}
                    style={{ borderBottom: '1px solid #f2f2f2', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f3f0fa'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ padding: '15px' }}>{r.id}</td>
                    <td>{r.username}</td>
                    <td style={{ fontWeight: 'bold' }}>{r.name}</td>
                    <td>{r.storeName}</td>
                    <td style={{ fontSize: '13px' }}>{formatDate(r.targetDateTime)}</td>
                    <td style={getStatusStyle(r.status)}>
                      {RES_MAP.status[r.status] || r.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '50px', color: '#999' }}>예약 내역이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {pageInfo.totalPages > 0 && (() => {
          const blockSize = 10;
          const startPage = Math.floor(page / blockSize) * blockSize;
          const endPage = Math.min(startPage + blockSize, pageInfo.totalPages);
          const isFirst = page === 0;
          const isLast = page >= pageInfo.totalPages - 1;
          const navBtn = (disabled) => ({
            padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px',
            cursor: disabled ? 'not-allowed' : 'pointer', background: '#fff', color: disabled ? '#ccc' : '#333'
          });
          return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
              <button onClick={() => setPage(0)} disabled={isFirst} style={navBtn(isFirst)}>처음</button>
              <button onClick={() => setPage(p => Math.max(0, p - 10))} disabled={isFirst} style={navBtn(isFirst)}>이전</button>
              {Array.from({ length: endPage - startPage }, (_, i) => startPage + i).map(i => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  style={{
                    padding: '6px 12px',
                    background: page === i ? '#673ab7' : '#fff',
                    color: page === i ? '#fff' : '#333',
                    border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer',
                    fontWeight: page === i ? 'bold' : 'normal',
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(pageInfo.totalPages - 1, p + 10))} disabled={isLast} style={navBtn(isLast)}>다음</button>
              <button onClick={() => setPage(pageInfo.totalPages - 1)} disabled={isLast} style={navBtn(isLast)}>끝</button>
            </div>
          );
        })()}
      </div>

      {/* 상세 모달 */}
      {(selectedReservation || modalLoading) && (
        <div
          onClick={() => setSelectedReservation(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '12px', padding: '32px',
              width: '480px', maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto',
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
            }}
          >
            {modalLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>불러오는 중...</div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, color: '#333' }}>예약 상세 정보</h3>
                  <button
                    onClick={() => setSelectedReservation(null)}
                    style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}
                  >
                    ✕
                  </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {[
                      ['ID', selectedReservation.id],
                      ['아이디', selectedReservation.userName],
                      ['예약자명', selectedReservation.name],
                      ['가게명', selectedReservation.storeName],
                      ['예약 일시', formatDate(selectedReservation.targetDateTime)],
                      ['요일', RES_MAP.dayOfWeek[selectedReservation.dayOfWeek] || selectedReservation.dayOfWeek],
                      ['인원', `${selectedReservation.headCount}명`],
                      ['테이블 ID', selectedReservation.storeTableId],
                      ['상태', RES_MAP.status[selectedReservation.status] || selectedReservation.status],
                      ['예약일', formatDate(selectedReservation.createdAt)],
                      ['수정일', formatDate(selectedReservation.updatedAt)],
                    ].map(([label, value]) => (
                      <tr key={label} style={{ borderBottom: '1px solid #f2f2f2' }}>
                        <td style={{ padding: '10px 8px', color: '#888', fontWeight: 'bold', width: '100px', fontSize: '13px' }}>{label}</td>
                        <td style={{ padding: '10px 8px', color: '#333', ...getStatusStyle(label === '상태' ? selectedReservation.status : '') }}>
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReservationAdmin;