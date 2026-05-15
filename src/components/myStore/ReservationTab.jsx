import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import Swal from 'sweetalert2';
import ReservationFilter from "../ReservationFilter";
import StatusBadge from "../StatusBadge";

const ReservationTab = ({ storeId }) => {
  const [reservations, setReservations] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [filter, setFilter] = useState({ type: 'name', keyword: '', startDate: '', endDate: '', status: [] });

  const statusMap = {
    'CONFIRMED': { label: '확정', color: '#52c41a', bg: '#f6ffed' },
    'VISITED': { label: '방문완료', color: '#1890ff', bg: '#e6f7ff' },
    'PENDING': { label: '대기', color: '#faad14', bg: '#fffbe6' },
    'REJECTED': { label: '거절', color: '#f5222d', bg: '#fff1f0' },
    'NO_SHOW': { label: '노쇼', color: '#fa8c16', bg: '#fff7e6' },
    'CANCELED': { label: '취소', color: '#8c8c8c', bg: '#f5f5f5' }
  };

  const fetchData = useCallback(async () => {
    if (!storeId) return;
    const params = {
      ...(filter.keyword.trim() && { type: filter.type, keyword: filter.keyword.trim() }),
      ...(filter.startDate && { startDate: filter.startDate }),
      ...(filter.endDate && { endDate: filter.endDate }),
      ...(filter.status.length > 0 && { status: filter.status.join(',') })
    };
    try {
      const res = await api.get(`/owners/stores/${storeId}/reservations`, { params });
      setReservations(Array.isArray(res.data) ? res.data : (res.data.content || []));
    } catch (err) { setReservations([]); }
  }, [storeId, filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = async (status) => {
    const result = await Swal.fire({
      title: '상태 업데이트',
      text: `${selectedIds.length}건의 상태를 변경하시겠습니까?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '변경 적용',
      confirmButtonColor: statusMap[status].color,
      borderRadius: '15px'
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/owners/stores/${storeId}/reservations`, { ids: selectedIds, status });
        fetchData();
        setSelectedIds([]);
      } catch (err) {}
    }
  };

  // 액션 버튼 스타일 (테두리 제거 버전)
  const actionBtnStyle = (status) => ({
    padding: '8px 16px',
    borderRadius: '10px',
    background: status.bg,
    color: status.color,
    border: 'none', // 테두리 제거
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.2s',
    outline: 'none'
  });

  return (
    <div style={dashboardWrapper}>
      <div style={titleArea}>
        <h2 style={pageTitle}>예약 내역 관리</h2>
        <span style={totalCount}>검색 결과 {reservations.length}건</span>
      </div>

      <ReservationFilter
        filter={filter} setFilter={setFilter}
        isExpanded={isFilterExpanded} setIsExpanded={setIsFilterExpanded}
        onSearch={fetchData} statusMap={statusMap}
      />

      {selectedIds.length > 0 && (
        <div style={actionBar}>
          <span style={selectionInfo}><b>{selectedIds.length}</b>개 선택됨</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => handleStatusChange('VISITED')} style={actionBtnStyle(statusMap.VISITED)}>방문완료</button>
            <button onClick={() => handleStatusChange('NO_SHOW')} style={actionBtnStyle(statusMap.NO_SHOW)}>노쇼</button>
            <button onClick={() => handleStatusChange('REJECTED')} style={actionBtnStyle(statusMap.REJECTED)}>예약거절</button>
            <div style={{ width: '1px', height: '16px', background: '#eee', margin: '0 5px' }} />
            <button onClick={() => setSelectedIds([])} style={closeIconBtn}>✕</button>
          </div>
        </div>
      )}

      <div style={tableContainer}>
        <table style={adminTable}>
          <thead>
            <tr>
              <th style={thStyle}><input type="checkbox" onChange={e => setSelectedIds(e.target.checked ? reservations.map(r => r.id) : [])} checked={selectedIds.length > 0 && selectedIds.length === reservations.length} /></th>
              <th style={thStyle}>No.</th>
              <th style={thStyle}>예약자</th>
              <th style={thStyle}>인원</th>
              <th style={thStyle}>예약 일시</th>
              <th style={{...thStyle, textAlign:'center'}}>상태</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length > 0 ? reservations.map(r => (
              <tr key={r.id} style={trStyle}>
                <td style={tdStyle}><input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => setSelectedIds(prev => prev.includes(r.id) ? prev.filter(i => i !== r.id) : [...prev, r.id])} /></td>
                <td style={{...tdStyle, color: '#999'}}>{r.id}</td>
                <td style={tdStyle}><b>{r.name}</b></td>
                <td style={tdStyle}>{r.headCount}명</td>
                <td style={tdStyle}>{r.targetDateTime?.replace('T', ' ').substring(0, 16)}</td>
                <td style={{...tdStyle, textAlign:'center'}}>
                  <StatusBadge status={r.status} statusMap={statusMap} />
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" style={emptyMessage}>일치하는 예약 내역이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Styles (기존 유지 및 최적화) ---
const dashboardWrapper = { display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px' };
const titleArea = { display: 'flex', alignItems: 'baseline', gap: '12px' };
const pageTitle = { fontSize: '22px', fontWeight: '800', margin: 0, color: '#111' };
const totalCount = { fontSize: '14px', color: '#666' };
const searchContainer = { display: 'flex', background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '2px', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };
const searchSelect = { border: 'none', background: '#f8f9fa', padding: '12px 15px', borderRadius: '10px 0 0 10px', fontSize: '13px', outline: 'none', borderRight: '1px solid #eee' };
const searchInput = { border: 'none', flex: 1, padding: '12px 16px', fontSize: '15px', outline: 'none' };
const filterIconBtn = (isExpanded) => ({ background: isExpanded ? '#f0f7ff' : 'transparent', color: isExpanded ? '#1890ff' : '#888', border: 'none', padding: '10px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', borderRadius: '10px' });
const filterPanel = { background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '20px', marginTop: '5px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };
const filterContent = { display: 'flex', gap: '40px' };
const filterSection = { display: 'flex', flexDirection: 'column', gap: '8px' };
const sectionLabel = { fontSize: '12px', fontWeight: '700', color: '#888' };
const inputGroup = { display: 'flex', alignItems: 'center', gap: '8px' };
const dateInput = { padding: '8px', border: '1px solid #eee', borderRadius: '8px', fontSize: '13px', outline: 'none' };
const checkGroup = { display: 'flex', gap: '15px', flexWrap: 'wrap' };
const checkLabel = { fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' };
const resetTextBtn = { background: 'none', border: 'none', color: '#999', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' };
const actionBar = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #eee', padding: '10px 20px', borderRadius: '15px', marginBottom: '5px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' };
const selectionInfo = { fontSize: '13px', color: '#666', fontWeight: '600' };
const closeIconBtn = { background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', color: '#bbb' };
const tableContainer = { background: '#fff', border: '1px solid #eee', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' };
const adminTable = { width: '100%', borderCollapse: 'collapse' };
const thStyle = { background: '#fafafa', padding: '16px 12px', textAlign: 'left', fontSize: '13px', color: '#888', borderBottom: '1px solid #eee', fontWeight: '600' };
const tdStyle = { padding: '16px 12px', borderBottom: '1px solid #fcfcfc', fontSize: '14px', color: '#333' };
const trStyle = { transition: '0.2s' };
const emptyMessage = { padding: '100px 0', textAlign: 'center', color: '#ccc', fontSize: '15px' };

export default ReservationTab;