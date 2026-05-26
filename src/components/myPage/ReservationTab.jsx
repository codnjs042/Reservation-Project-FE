import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import Swal from 'sweetalert2';
import ReservationFilter from '../ReservationFilter';
import StatusBadge from '../StatusBadge';

const ReservationTab = () => {
  const mainColor = "#F0602A"; // 브랜드 오렌지
  const skyPointColor = "#7DB3D3";

  const [reservations, setReservations] = useState([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0 });

  // 필터 상태 (ReservationFilter 규격)
  const [filter, setFilter] = useState({
    type: 'name',
    keyword: '',
    startDate: null,
    endDate: null,
    status: []
  });

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });

  const statusMap = {
    'CONFIRMED': { label: '예약 확정', color: '#52c41a', bg: '#f6ffed' },
    'VISITED': { label: '방문 완료', color: skyPointColor, bg: '#f0f7fb' },
    'CANCELED': { label: '취소됨', color: '#ff4d4f', bg: '#fff1f0' },
    'REJECTED': { label: '예약 거절', color: '#999', bg: '#f5f5f5' },
    'NO_SHOW': { label: '노쇼', color: '#fa8c16', bg: '#fff7e6' }
  };

  const fetchReservations = useCallback((currentPage = page) => {
    api.get("/users/me/reservations", {
      params: {
        startDate: filter.startDate,
        endDate: filter.endDate,
        status: filter.status.length > 0 ? filter.status.join(',') : null,
        page: currentPage,
        size
      }
    })
    .then(res => {
      setReservations(res.data.content);
      setPageInfo({ totalPages: res.data.totalPages, totalElements: res.data.totalElements });
    })
    .catch(err => console.error("로딩 실패", err));
  }, [filter, size]);

  useEffect(() => {
    fetchReservations(page);
  }, [page]);

  useEffect(() => {
    fetchReservations(0);
  }, [fetchReservations]);

  const handleSizeChange = (newSize) => {
    setSize(newSize);
    setPage(0);
  };

  const handleSearch = () => {
    setPage(0);
    fetchReservations(0);
  };

  const handleCancelReservation = async (id) => {
    const result = await Swal.fire({
      title: '예약을 취소하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff4d4f',
      confirmButtonText: '네, 취소할게요',
      cancelButtonText: '아니요',
      borderRadius: '15px'
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/users/me/reservations/${id}`);
        Toast.fire({ icon: 'success', title: '예약이 취소되었습니다.' });
        fetchReservations();
      } catch (err) {}
    }
  };

  return (
    <div style={containerStyle}>
      {/* 상단 헤더: 제목 + 점주 페이지 스타일의 필터 아이콘 버튼 */}
      <div style={headerSection}>
        <h3 style={tabTitle}>내 예약 관리</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={size}
            onChange={e => handleSizeChange(Number(e.target.value))}
            style={{ padding: '8px 12px', border: '1px solid #eee', borderRadius: '10px', fontSize: '13px', color: '#555' }}
          >
            <option value={5}>5건</option>
            <option value={10}>10건</option>
            <option value={50}>50건</option>
          </select>
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            style={filterToggleBtn(isFilterExpanded, mainColor)}
          >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
            <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="12" x2="23" y2="12" />
          </svg>
          필터
          </button>
        </div>
      </div>

      {/* 공통 필터 컴포넌트 (상단 검색바 숨김 모드) */}
      <ReservationFilter
        filter={filter}
        setFilter={setFilter}
        isExpanded={isFilterExpanded}
        setIsExpanded={setIsFilterExpanded}
        onSearch={handleSearch}
        statusMap={statusMap}
        mainColor={mainColor}
        showSearch={false}
      />

      {/* 예약 카드 리스트 */}
      <div style={listContainer}>
        {reservations.length > 0 ? reservations.map(res => (
          <div key={res.id} style={resCardStyle}>
            <div style={cardMainInfo}>
              <div style={resHeader}>
                <span style={resNo}>No. {res.id}</span>
                <StatusBadge status={res.status} statusMap={statusMap} />
              </div>
              <h4 style={resStoreName}>{res.storeName}</h4>
              <div style={resDetailRow}>
                <span>🗓️ {res.targetDateTime.replace('T', ' ').substring(0, 16)}</span>
                <span>👥 {res.headCount}명</span>
              </div>
            </div>

            <div style={cardActionSide}>
              {res.status === 'CONFIRMED' ? (
                <button onClick={() => handleCancelReservation(res.id)} style={cancelBtnStyle}>취소</button>
              ) : (
                <button style={detailBtnStyle(skyPointColor)} onClick={() => window.location.href = `/stores/${res.storeId}`}>매장</button>
              )}
            </div>
          </div>
        )) : (
          <div style={noDataStyle}>일치하는 예약 내역이 없습니다.</div>
        )}
      </div>

      {/* 페이지네이션 */}
      {pageInfo.totalPages > 0 && (() => {
        const blockSize = 10;
        const startPage = Math.floor(page / blockSize) * blockSize;
        const endPage = Math.min(startPage + blockSize, pageInfo.totalPages);
        const isFirst = page === 0;
        const isLast = page >= pageInfo.totalPages - 1;
        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '20px' }}>
            <button onClick={() => setPage(0)} disabled={isFirst} style={pageNavBtn(isFirst)}>처음</button>
            <button onClick={() => setPage(p => Math.max(0, p - 10))} disabled={isFirst} style={pageNavBtn(isFirst)}>이전</button>
            {Array.from({ length: endPage - startPage }, (_, i) => startPage + i).map(i => (
              <button
                key={i}
                onClick={() => setPage(i)}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  border: '1px solid #eee', cursor: 'pointer', fontSize: '13px',
                  background: page === i ? mainColor : '#fff',
                  color: page === i ? '#fff' : '#555',
                  fontWeight: page === i ? 'bold' : 'normal',
                }}
              >
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(pageInfo.totalPages - 1, p + 10))} disabled={isLast} style={pageNavBtn(isLast)}>다음</button>
            <button onClick={() => setPage(pageInfo.totalPages - 1)} disabled={isLast} style={pageNavBtn(isLast)}>끝</button>
          </div>
        );
      })()}
    </div>
  );
};

/* --- 스타일 정의 --- */
const containerStyle = { padding: '10px 20px', maxWidth: '600px', margin: '0 auto' };
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const tabTitle = { fontSize: '19px', fontWeight: '800', margin: 0, color: '#111' };

// 점주 페이지와 동일한 필터 아이콘 버튼 스타일
const filterToggleBtn = (isExpanded, color) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 14px',
  background: isExpanded ? `${color}10` : '#fff',
  border: `1px solid ${isExpanded ? color + '44' : '#eee'}`,
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '13px',
  color: isExpanded ? color : '#666',
  transition: '0.2s',
  outline: 'none'
});

const listContainer = { display: 'flex', flexDirection: 'column', gap: '10px' };
const resCardStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px', background: '#fff', borderRadius: '15px', border: '1px solid #f5f5f5', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' };
const cardMainInfo = { flex: 1 };
const resHeader = { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' };
const resNo = { fontSize: '10px', color: '#ddd', fontWeight: 'bold' };
const resStoreName = { fontSize: '16px', fontWeight: '800', margin: '0 0 6px 0', color: '#222' };
const resDetailRow = { display: 'flex', gap: '12px', fontSize: '12px', color: '#777' };

const cardActionSide = { paddingLeft: '15px', borderLeft: '1px solid #f9f9f9' };
const cancelBtnStyle = { padding: '8px 12px', borderRadius: '8px', border: 'none', background: '#fff1f0', color: '#ff4d4f', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' };
const detailBtnStyle = (color) => ({ padding: '8px 12px', borderRadius: '8px', border: 'none', background: '#f0f7fb', color: color, fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' });
const noDataStyle = { padding: '80px 0', textAlign: 'center', color: '#ccc', fontSize: '14px' };
const pageNavBtn = (disabled) => ({ padding: '6px 10px', borderRadius: '8px', border: '1px solid #eee', cursor: disabled ? 'not-allowed' : 'pointer', background: '#fff', color: disabled ? '#ccc' : '#555', fontSize: '13px' });

export default ReservationTab;