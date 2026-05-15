import React from 'react';

const ReservationFilter = ({
  filter, setFilter, isExpanded, setIsExpanded,
  onSearch, statusMap, mainColor = "#1890ff",
  showSearch = true // 기본값은 true (점주용), false로 넘기면 유저용
}) => {
  return (
    <div style={{ width: '100%', marginBottom: '10px' }}>
      {/* 1. 검색바 (점주 페이지에서만 표시) */}
      {showSearch && (
        <div style={searchContainer}>
          <select style={searchSelect} value={filter.type} onChange={e => setFilter({...filter, type: e.target.value})}>
            <option value="name">예약자 성함</option>
            <option value="id">예약 ID 번호</option>
          </select>
          <input
            style={searchInput}
            placeholder="검색어를 입력하세요"
            value={filter.keyword}
            onChange={e => setFilter({...filter, keyword: e.target.value})}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
          <button onClick={() => setIsExpanded(!isExpanded)} style={filterIconBtn(isExpanded, mainColor)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="12" x2="23" y2="12" />
            </svg>
          </button>
        </div>
      )}

      {/* 검색창이 없을 때(유저용) 보여줄 토글 버튼 */}
      {!showSearch && (
        <button onClick={() => setIsExpanded(!isExpanded)} style={userToggleBtn(isExpanded, mainColor)}>
           <span style={{fontSize: '13px', fontWeight: '700'}}>상세 필터 설정</span>
           <span style={{fontSize: '11px', opacity: 0.5}}>{isExpanded ? '닫기 ▲' : '열기 ▼'}</span>
        </button>
      )}

      {/* 2. 확장 필터 패널 (공통 사용) */}
      {isExpanded && (
        <div style={filterPanel}>
          <div style={filterContent}>
            <div style={filterSection}>
              <span style={sectionLabel}>조회 기간</span>
              <div style={inputGroup}>
                <input type="date" style={dateInput} value={filter.startDate || ''} onChange={e => setFilter({...filter, startDate: e.target.value})} />
                <span style={{color: '#ccc'}}>~</span>
                <input type="date" style={dateInput} value={filter.endDate || ''} onChange={e => setFilter({...filter, endDate: e.target.value})} />
              </div>
            </div>
            <div style={filterSection}>
              <span style={sectionLabel}>예약 상태</span>
              <div style={checkGroup}>
                {Object.entries(statusMap).map(([key, val]) => (
                  <label key={key} style={checkLabel}>
                    <input
                      type="checkbox"
                      checked={filter.status.includes(key)}
                      onChange={() => setFilter(prev => ({
                        ...prev,
                        status: prev.status.includes(key) ? prev.status.filter(s => s !== key) : [...prev.status, key]
                      }))}
                    /> {val.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div style={filterFooter}>
            <button style={resetTextBtn} onClick={() => setFilter({type:'name', keyword:'', startDate:'', endDate:'', status:[]})}>초기화</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 스타일 (재사용 가능하도록 정의) ---
const searchContainer = { display: 'flex', background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '2px', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };
const searchSelect = { border: 'none', background: '#f8f9fa', padding: '12px 15px', borderRadius: '10px 0 0 10px', fontSize: '13px', outline: 'none', borderRight: '1px solid #eee' };
const searchInput = { border: 'none', flex: 1, padding: '12px 16px', fontSize: '15px', outline: 'none' };
const filterIconBtn = (isExpanded, color) => ({ background: isExpanded ? `${color}10` : 'transparent', color: isExpanded ? color : '#888', border: 'none', padding: '10px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', borderRadius: '10px' });
const userToggleBtn = (isExpanded, color) => ({ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: '#fff', border: `1px solid ${isExpanded ? color+'33' : '#eee'}`, borderRadius: '12px', cursor: 'pointer', color: isExpanded ? color : '#666' });
const filterPanel = { background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '20px', marginTop: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };
const filterContent = { display: 'flex', flexDirection: 'column', gap: '20px' };
const filterSection = { display: 'flex', flexDirection: 'column', gap: '8px' };
const sectionLabel = { fontSize: '12px', fontWeight: '700', color: '#bbb', textTransform: 'uppercase' };
const inputGroup = { display: 'flex', alignItems: 'center', gap: '8px' };
const dateInput = { flex: 1, padding: '10px', border: '1px solid #eee', borderRadius: '8px', fontSize: '13px', outline: 'none' };
const checkGroup = { display: 'flex', gap: '15px', flexWrap: 'wrap' };
const checkLabel = { fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#555' };
const filterFooter = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f9f9f9' };
const resetTextBtn = { background: 'none', border: 'none', color: '#999', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' };
const applyBtn = (color) => ({ padding: '8px 20px', background: color, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' });

export default ReservationFilter;