import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const MyStore = () => {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [activeTab, setActiveTab] = useState('reservations');
  const [loading, setLoading] = useState(true);

  // --- [공통 데이터 상태] ---
  const [reservations, setReservations] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [groupedTables, setGroupedTables] = useState([]);
  const [storeDetail, setStoreDetail] = useState({ name: '', phone: '', address: '', status: 'READY' });

  // --- [탭 1: 예약 전용 상세 필터 상태] ---
  const filterPanelRef = useRef(null);
  const filterButtonRef = useRef(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState({
    type: 'name', // id or name
    keyword: '',
    startDate: '',
    endDate: '',
    status: []
  });
  const [tempFilter, setTempFilter] = useState({ ...appliedFilter });

  const statusMap = {
    'CONFIRMED': { label: '확정', color: '#52c41a' },
    'VISITED': { label: '방문완료', color: '#1890ff' },
    'PENDING': { label: '대기', color: '#faad14' },
    'REJECTED': { label: '거절', color: '#f5222d' },
    'NO_SHOW': { label: '노쇼', color: '#fa8c16' },
    'CANCELED': { label: '취소', color: '#999' }
  };

  const days = [
    { key: 'MONDAY', label: '월' }, { key: 'TUESDAY', label: '화' },
    { key: 'WEDNESDAY', label: '수' }, { key: 'THURSDAY', label: '목' },
    { key: 'FRIDAY', label: '금' }, { key: 'SATURDAY', label: '토' },
    { key: 'SUNDAY', label: '일' }
  ];

  const storeStatuses = [
    { key: 'READY', label: '준비중', color: '#faad14' },
    { key: 'OPEN', label: '영업중', color: '#52c41a' },
    { key: 'HIDDEN', label: '일시중지', color: '#ff4d4f' },
    { key: 'SHUTDOWN', label: '폐업', color: '#000000' }
  ];

  const [dayConfigs, setDayConfigs] = useState(
    days.reduce((acc, day) => ({
      ...acc,
      [day.key]: { openTime: '09:00', closeTime: '21:00', interval: 60, breaks: [], isClosed: false }
    }), {})
  );

  const apiBase = "http://localhost:8081";

  // 필터 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target) &&
          filterButtonRef.current && !filterButtonRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    axios.get(`${apiBase}/owners/stores`, { withCredentials: true })
      .then(res => {
        setStores(res.data);
        if (res.data && res.data.length > 0) setSelectedStore(res.data[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchData = useCallback(() => {
    if (!selectedStore) return;
    const storeId = selectedStore.id;

    if (activeTab === 'reservations') {
      axios.get(`${apiBase}/owners/stores/${storeId}/reservations`, {
          params: {
            type: appliedFilter.type,
            keyword: appliedFilter.keyword || null,
            startDate: appliedFilter.startDate || null,
            endDate: appliedFilter.endDate || null,
            status: appliedFilter.status.length > 0 ? appliedFilter.status.join(',') : null
          },
          withCredentials: true
        })
        .then(res => setReservations(res.data || []))
        .catch(err => console.error("예약 로드 실패:", err));

    } else if (activeTab === 'tables') {
      axios.get(`${apiBase}/stores/${storeId}/tables`)
        .then(res => {
          const groups = [];
          res.data.forEach(item => {
            const existing = groups.find(g => g.tableName === item.tableName);
            if (existing) existing.count += 1;
            else groups.push({ originName: item.tableName, tableName: item.tableName, minCapacity: item.minCapacity, maxCapacity: item.maxCapacity, count: 1 });
          });
          setGroupedTables(groups);
        });
    } else if (activeTab === 'info') {
      axios.get(`${apiBase}/owners/stores/${storeId}`, { withCredentials: true })
        .then(res => setStoreDetail(res.data));
    }
  }, [selectedStore, activeTab, appliedFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- [탭 1] 예약 전용 핸들러 ---
  const handleStatusChange = (status) => {
    if (selectedIds.length === 0) return alert("대상을 선택해주세요.");
    axios.patch(`${apiBase}/owners/stores/${selectedStore.id}/reservations`, { ids: selectedIds, status }, { withCredentials: true })
      .then(() => { alert(`상태 변경 완료`); fetchData(); setSelectedIds([]); })
      .catch(() => alert("변경 실패"));
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // --- [탭 2, 3, 4] 핸들러 (요청하신 대로 기존 코드 유지) ---
  const handleTableUpdate = (index, field, value) => {
    const updated = [...groupedTables];
    updated[index][field] = value;
    setGroupedTables(updated);
  };
  const saveTableChanges = (groupData) => {
    const dto = { oldTableName: groupData.originName || groupData.tableName, newTableName: groupData.tableName, minCapacity: Number(groupData.minCapacity), maxCapacity: Number(groupData.maxCapacity), count: parseInt(groupData.count) };
    axios.put(`${apiBase}/stores/${selectedStore.id}/tables`, dto, { withCredentials: true }).then(() => { alert("반영완료"); fetchData(); });
  };
  const handleConfigChange = (day, field, value) => setDayConfigs({ ...dayConfigs, [day]: { ...dayConfigs[day], [field]: value } });
  const addBreak = (day) => {
    const updated = { ...dayConfigs[day] };
    updated.breaks.push({ startTime: '', endTime: '' });
    setDayConfigs({ ...dayConfigs, [day]: updated });
  };
  const handleBreakChange = (day, index, field, value) => {
    const updated = { ...dayConfigs[day] };
    updated.breaks[index][field] = value;
    setDayConfigs({ ...dayConfigs, [day]: updated });
  };
  const saveSingleDaySchedule = (dayKey) => {
    const config = dayConfigs[dayKey];
    const upsertSchedules = config.isClosed ? [] : convertToUpsertRequest(config);
    axios.put(`${apiBase}/stores/${selectedStore.id}/schedules/${dayKey}`, { upsertSchedules }, { withCredentials: true }).then(() => alert(`${dayKey} 설정 저장 완료`));
  };
  const convertToUpsertRequest = (config) => {
    const { openTime, closeTime, interval, breaks } = config;
    const sortedBreaks = [...breaks].filter(b => b.startTime && b.endTime).sort((a, b) => a.startTime.localeCompare(b.startTime));
    const result = [];
    let currentStart = openTime;
    sortedBreaks.forEach(brk => {
      if (currentStart < brk.startTime) result.push({ startTime: `${currentStart}:00`, endTime: `${brk.startTime}:00`, intervalMinute: parseInt(interval) });
      currentStart = brk.endTime;
    });
    if (currentStart < closeTime) result.push({ startTime: `${currentStart}:00`, endTime: `${closeTime}:00`, intervalMinute: parseInt(interval) });
    return result;
  };
  const handleUpdateStoreStatus = (newStatus) => {
    axios.patch(`${apiBase}/owners/stores/${selectedStore.id}/status`, { status: newStatus }, { withCredentials: true }).then(() => {
        setStoreDetail({ ...storeDetail, status: newStatus });
        alert(`상태가 [${newStatus}]로 변경되었습니다.`);
    });
  };
  const handleUpdateStoreInfo = () => {
    axios.patch(`${apiBase}/owners/stores/${selectedStore.id}`, storeDetail, { withCredentials: true }).then(() => alert("정보가 수정되었습니다."));
  };

  if (loading) return <div style={centerMsgStyle}>로드 중...</div>;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>🏪 매장 관리 통합 시스템</h2>
        <select value={selectedStore?.id || ''} onChange={(e) => setSelectedStore(stores.find(s => s.id === parseInt(e.target.value)))} style={selectStyle}>
          {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div style={tabContainerStyle}>
        {['reservations', 'tables', 'schedules', 'info'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={tabBtnStyle(activeTab === t)}>
            {t === 'reservations' ? '📅 예약' : t === 'tables' ? '🪑 테이블' : t === 'schedules' ? '⏰ 영업시간' : 'ℹ️ 정보'}
          </button>
        ))}
      </div>

      <div style={contentBoxStyle}>
        {/* [탭 1] 예약 관리 - 요청하신 레이아웃 적용 */}
        {activeTab === 'reservations' && (
          <div style={{ position: 'relative' }}>
            <h3 style={{ margin: '0 0 20px 0' }}>실시간 예약 현황</h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <button ref={filterButtonRef} onClick={() => setIsFilterOpen(!isFilterOpen)} style={filterToggleBtnStyle}>상세 필터 🔍</button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleStatusChange('VISITED')} style={actionBtn('#52c41a')}>방문완료</button>
                <button onClick={() => handleStatusChange('NO_SHOW')} style={actionBtn('#fa8c16')}>노쇼</button>
                <button onClick={() => handleStatusChange('REJECTED')} style={actionBtn('#f5222d')}>거절</button>
              </div>
            </div>

            {/* 필터 레이어 */}
            {isFilterOpen && (
              <div ref={filterPanelRef} style={filterLayerStyle}>
                <label style={filterLabelStyle}>검색 조건</label>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                  <select style={{...compactInput, width: '90px'}} value={tempFilter.type} onChange={e => setTempFilter({...tempFilter, type: e.target.value})}>
                    <option value="name">예약자명</option>
                    <option value="id">번호(ID)</option>
                  </select>
                  <input style={compactInput} placeholder="검색어 입력" value={tempFilter.keyword} onChange={e => setTempFilter({...tempFilter, keyword: e.target.value})} />
                </div>

                <label style={filterLabelStyle}>날짜 범위</label>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                  <input type="date" style={compactInput} value={tempFilter.startDate} onChange={e => setTempFilter({...tempFilter, startDate: e.target.value})} />
                  <input type="date" style={compactInput} value={tempFilter.endDate} onChange={e => setTempFilter({...tempFilter, endDate: e.target.value})} />
                </div>

                <label style={filterLabelStyle}>상태 필터</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '20px' }}>
                  {Object.entries(statusMap).map(([key, val]) => (
                    <button key={key} onClick={() => setTempFilter(p => ({...p, status: p.status.includes(key) ? p.status.filter(s => s !== key) : [...p.status, key]}))}
                            style={statusChipStyle(tempFilter.status.includes(key), val.color)}>{val.label}</button>
                  ))}
                </div>
                <button onClick={() => { setAppliedFilter({...tempFilter}); setIsFilterOpen(false); }} style={applyFilterBtnStyle}>검색 적용</button>
              </div>
            )}

            <table style={tableStyle}>
              <thead style={{ background: '#f8f9fa' }}>
                <tr>
                  <th style={thStyle}><input type="checkbox" checked={selectedIds.length === reservations.length && reservations.length > 0} onChange={(e) => setSelectedIds(e.target.checked ? reservations.map(r => r.id) : [])} /></th>
                  <th style={thStyle}>No.</th>
                  <th style={thStyle}>예약자</th>
                  <th style={thStyle}>인원</th>
                  <th style={thStyle}>예약시간</th>
                  <th style={thStyle}>상태</th>
                </tr>
              </thead>
              <tbody>
                {reservations.length > 0 ? reservations.map(r => (
                  <tr key={r.id} style={trStyle}>
                    <td style={tdStyle}><input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => toggleSelect(r.id)} /></td>
                    <td style={tdStyle}>{r.id}</td>
                    <td style={tdStyle}><b>{r.name}</b></td>
                    <td style={tdStyle}>{r.headCount}명</td>
                    <td style={tdStyle}>{r.targetDateTime?.replace('T', ' ').substring(0, 16)}</td>
                    <td style={tdStyle}><span style={statusBadge(r.status)}>{statusMap[r.status]?.label || r.status}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" style={{...tdStyle, textAlign: 'center', padding: '40px', color: '#999'}}>조건에 맞는 예약 내역이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* [탭 2] 테이블 (기존 유지) */}
        {activeTab === 'tables' && (
          <div>
            <div style={sectionHeader}>
              <h3 style={{ margin: 0 }}>테이블 구성</h3>
              <button onClick={() => setGroupedTables([...groupedTables, { originName: null, tableName: '', minCapacity: 1, maxCapacity: 4, count: 1 }])} style={addBtnStyle}>+ 새 타입 추가</button>
            </div>
            {groupedTables.map((g, idx) => (
              <div key={idx} style={tableRowCard}>
                <input style={{ ...compactInput, flex: 2.5 }} value={g.tableName || ''} onChange={e => handleTableUpdate(idx, 'tableName', e.target.value)} />
                <input type="number" style={{ ...compactInput, flex: 1, textAlign: 'center' }} value={g.minCapacity} onChange={e => handleTableUpdate(idx, 'minCapacity', e.target.value)} />
                <input type="number" style={{ ...compactInput, flex: 1, textAlign: 'center' }} value={g.maxCapacity} onChange={e => handleTableUpdate(idx, 'maxCapacity', e.target.value)} />
                <input type="number" style={{ ...compactInput, flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#1890ff' }} value={g.count} onChange={e => handleTableUpdate(idx, 'count', e.target.value)} />
                <div style={{ width: '100px', display: 'flex', gap: '5px' }}>
                    <button onClick={() => saveTableChanges(g)} style={saveIconBtn}>저장</button>
                    <button onClick={() => { if(window.confirm('삭제?')) { const u = [...groupedTables]; u[idx].count = 0; saveTableChanges(u[idx]); }}} style={delIconBtn}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* [탭 3] 영업시간 (기존 유지) */}
        {activeTab === 'schedules' && (
          <div>
            <div style={sectionHeader}><h3>요일별 영업 설정</h3></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {days.map(day => {
                    const config = dayConfigs[day.key];
                    return (
                        <div key={day.key} style={{ ...tableRowCard, flexDirection: 'column', alignItems: 'stretch' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <b>{day.label}요일</b>
                                <div>
                                    <label style={{ fontSize: '0.8rem', marginRight: '10px' }}><input type="checkbox" checked={config.isClosed} onChange={e => handleConfigChange(day.key, 'isClosed', e.target.checked)} /> 휴무</label>
                                    <button onClick={() => saveSingleDaySchedule(day.key)} style={{ padding: '2px 8px', fontSize: '0.7rem', cursor: 'pointer' }}>저장</button>
                                </div>
                            </div>
                            {!config.isClosed && (
                                <div style={{ marginTop: '10px' }}>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <input type="time" style={compactInput} value={config.openTime} onChange={e => handleConfigChange(day.key, 'openTime', e.target.value)} />
                                        ~ <input type="time" style={compactInput} value={config.closeTime} onChange={e => handleConfigChange(day.key, 'closeTime', e.target.value)} />
                                    </div>
                                    {config.breaks.map((brk, bIdx) => (
                                        <div key={bIdx} style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                            <span style={{ fontSize: '0.7rem' }}>☕</span>
                                            <input type="time" style={compactInput} value={brk.startTime} onChange={e => handleBreakChange(day.key, bIdx, 'startTime', e.target.value)} />
                                            <input type="time" style={compactInput} value={brk.endTime} onChange={e => handleBreakChange(day.key, bIdx, 'endTime', e.target.value)} />
                                        </div>
                                    ))}
                                    <button onClick={() => addBreak(day.key)} style={{ border: 'none', background: 'none', color: '#1890ff', fontSize: '0.7rem', cursor: 'pointer', marginTop: '5px' }}>+ 브레이크 추가</button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
          </div>
        )}

        {/* [탭 4] 정보 (기존 유지) */}
        {activeTab === 'info' && (
          <div style={{ display: 'grid', gap: '20px' }}>
            <section>
                <h4 style={{ margin: '0 0 10px' }}>🏷️ 매장 운영 상태 (StoreStatus)</h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {storeStatuses.map(s => (
                        <button
                            key={s.key}
                            onClick={() => handleUpdateStoreStatus(s.key)}
                            style={actionBtn(storeDetail.status === s.key ? s.color : '#eee', storeDetail.status === s.key ? '#fff' : '#666')}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </section>
            <section style={{ display: 'grid', gap: '10px' }}>
                <h4 style={{ margin: '0' }}>📝 기본 정보 수정</h4>
                <div>
                    <label style={labelStyle}>매장 상호명</label>
                    <input style={compactInput} value={storeDetail.name || ''} onChange={e => setStoreDetail({...storeDetail, name: e.target.value})} />
                </div>
                <div>
                    <label style={labelStyle}>대표 연락처</label>
                    <input style={compactInput} value={storeDetail.phone || ''} onChange={e => setStoreDetail({...storeDetail, phone: e.target.value})} />
                </div>
                <div>
                    <label style={labelStyle}>매장 위치 주소</label>
                    <input style={compactInput} value={storeDetail.address || ''} onChange={e => setStoreDetail({...storeDetail, address: e.target.value})} />
                </div>
                <button onClick={handleUpdateStoreInfo} style={saveIconBtn}>기본 정보 업데이트</button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

// --- 스타일링 (통합) ---
const containerStyle = { maxWidth: '1000px', margin: '30px auto', padding: '0 20px', fontFamily: "'Pretendard', sans-serif" };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' };
const selectStyle = { padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', cursor: 'pointer' };
const tabContainerStyle = { display: 'flex', gap: '8px', marginBottom: '-1px' };
const tabBtnStyle = (active) => ({ padding: '12px 24px', cursor: 'pointer', border: '1px solid #eee', borderBottom: active ? '2px solid #1890ff' : '1px solid #eee', background: active ? '#fff' : '#f9f9f9', color: active ? '#1890ff' : '#666', fontWeight: active ? 'bold' : 'normal', borderRadius: '8px 8px 0 0', transition: '0.2s', outline: 'none' });
const contentBoxStyle = { background: '#fff', border: '1px solid #eee', padding: '25px', borderRadius: '0 12px 12px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
const sectionHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const tableRowCard = { display: 'flex', gap: '15px', padding: '12px 15px', background: '#fff', border: '1px solid #f0f0f0', borderRadius: '8px', marginBottom: '8px', alignItems: 'center' };
const compactInput = { padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none', fontSize: '0.9rem', width: '100%' };
const labelStyle = { display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '4px', fontWeight: '600' };
const addBtnStyle = { padding: '8px 16px', background: '#e6f7ff', color: '#1890ff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const saveIconBtn = { padding: '12px', background: '#1890ff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', width: '100%', fontWeight: 'bold' };
const delIconBtn = { padding: '8px 10px', background: '#fff', color: '#ff4d4f', border: '1px solid #ff4d4f', borderRadius: '6px', cursor: 'pointer' };
const actionBtn = (bgColor, textColor = '#fff') => ({ padding: '8px 16px', background: bgColor, color: textColor, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' });
const filterToggleBtnStyle = { padding: '8px 16px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' };
const filterLayerStyle = { position: 'absolute', top: '100px', left: '0', zIndex: 100, width: '280px', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', border: '1px solid #eee' };
const filterLabelStyle = { display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#888' };
const statusChipStyle = (active, color) => ({ padding: '4px 10px', borderRadius: '15px', border: `1px solid ${active ? color : '#eee'}`, background: active ? color : '#fff', color: active ? '#fff' : '#888', cursor: 'pointer', fontSize: '11px' });
const applyFilterBtnStyle = { width: '100%', padding: '10px', background: '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' };
const tableStyle = { width: '100%', borderCollapse: 'separate', borderSpacing: '0' };
const thStyle = { padding: '12px 15px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#666', borderBottom: '2px solid #f0f0f0' };
const tdStyle = { padding: '15px', borderBottom: '1px solid #f0f0f0', fontSize: '0.9rem' };
const trStyle = { transition: '0.2s' };
const statusBadge = (s) => {
  const colors = { VISITED: '#1890ff', NO_SHOW: '#fa8c16', REJECTED: '#f5222d', PENDING: '#faad14', CONFIRMED: '#52c41a', CANCELED: '#999' };
  const c = colors[s] || '#999';
  return { padding: '4px 10px', borderRadius: '20px', background: c + '15', color: c, fontSize: '0.75rem', fontWeight: 'bold' };
};
const centerMsgStyle = { textAlign: 'center', marginTop: '100px', color: '#999' };

export default MyStore;