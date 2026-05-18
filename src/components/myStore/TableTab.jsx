import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import Swal from 'sweetalert2';

const TableTab = ({ storeId }) => {
  const [tableGroups, setTableGroups] = useState([]);
  const mainColor = "#F0602A"; // 주황
  const skyPointColor = "#7DB3D3"; // 하늘

  // 공통 Toast 설정
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });

  const fetchAndGroupTables = () => {
    if (!storeId) return;
    api.get(`/stores/${storeId}/tables`)
      .then(res => {
        const rawData = res.data;
        const groups = rawData.reduce((acc, curr) => {
          const existing = acc.find(g => g.tableName === curr.tableName);
          if (existing) {
            existing.count += 1;
          } else {
            acc.push({
              ...curr,
              count: 1,
              originalName: curr.tableName,
              tempId: Math.random(),
              isNew: false // 기존에 저장되어 있던 카드 표시
            });
          }
          return acc;
        }, []);
        setTableGroups(groups);
      })
      .catch(err => console.error("조회 실패", err));
  };

  useEffect(() => { fetchAndGroupTables(); }, [storeId]);

  const addNewTypeCard = () => {
    setTableGroups([...tableGroups, {
      tempId: Math.random(),
      tableName: '',
      minCapacity: 1,
      maxCapacity: 2,
      count: 1,
      originalName: '',
      isNew: true // 새로 생성되어 저장 전인 카드 표시
    }]);
  };

  // 삭제 시 확인창 처리 수정
  const removeCard = async (tempId, tableName, isNew) => {
    const result = await Swal.fire({
      title: '삭제하시겠습니까?',
      text: tableName ? `[${tableName}] 설정을 목록에서 제거합니다.` : "입력 중인 설정을 제거합니다.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    });

    if (result.isConfirmed) {
      if (isNew) {
        // DB에 저장된 적 없는 새 양식 카드는 바로 배열에서 제거
        setTableGroups(tableGroups.filter(g => g.tempId !== tempId));
      } else {
        // 기존에 있던 카드는 백엔드에 count=0을 전달하기 위해 데이터는 남기고 count만 0으로 업데이트
        setTableGroups(prev => prev.map(g => g.tempId === tempId ? { ...g, count: 0 } : g));
      }
      Toast.fire({ icon: 'success', title: '제거되었습니다.' });
    }
  };

  const handleFieldChange = (tempId, field, value) => {
    setTableGroups(prev => prev.map(g => g.tempId === tempId ? { ...g, [field]: value } : g));
  };

  const saveAllChanges = async () => {
    // 유효성 검사 수정: 현재 숨겨지지 않은(삭제되지 않은, count > 0) 카드들만 이름이 비어있는지 검사
    const hasEmptyName = tableGroups
      .filter(g => g.count > 0)
      .some(g => !g.tableName.trim());

    if (hasEmptyName) {
      return Swal.fire({
        icon: 'error',
        title: '입력 오류',
        text: '테이블 타입명을 모두 입력해주세요.',
        confirmButtonColor: mainColor
      });
    }

    // 저장 시작 (로딩)
    Swal.fire({
      title: '설정 반영 중',
      text: '잠시만 기다려주세요...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      // count가 0으로 세팅된 삭제 대상 카드들까지 모두 포함하여 DTO를 생성해 요청을 보냅니다.
      const promises = tableGroups.map(group => {
        const dto = {
          oldTableName: group.originalName,
          newTableName: group.tableName,
          minCapacity: parseInt(group.minCapacity),
          maxCapacity: parseInt(group.maxCapacity),
          count: parseInt(group.count)
        };
        return api.put(`/stores/${storeId}/tables`, dto);
      });

      await Promise.all(promises);

      Swal.close(); // 로딩 닫기
      await Swal.fire({
        icon: 'success',
        title: '저장 완료',
        text: '모든 테이블 설정이 성공적으로 반영되었습니다.',
        confirmButtonColor: mainColor
      });

      fetchAndGroupTables(); // 저장 후 클린한 최신 상태로 재조회
    } catch (err) {
      Swal.close();
      const msg = err.response?.data?.message || "저장 중 오류가 발생했습니다.";
      Swal.fire({ icon: 'error', title: '저장 실패', text: msg });
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerSection}>
        <div>
          <h3 style={sectionTitle}>테이블 설정</h3>
          <p style={sectionDesc}>변경 후 우측 상단의 저장 버튼을 눌러주세요.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={addNewTypeCard} style={addBtnStyle(skyPointColor)}>+ 양식 추가</button>
          <button onClick={saveAllChanges} style={saveAllBtnStyle(mainColor)}>설정 저장하기</button>
        </div>
      </div>

      <div style={gridWrapper}>
        {tableGroups.map((group) => {
          // 중요: 사용자가 X 버튼을 눌러 count가 0이 된 기존 카드는 화면에 그리지 않습니다.
          if (group.count === 0) return null;

          return (
            <div key={group.tempId} style={tableCard}>
              {/* X버튼 클릭 시 해당 카드의 고유 식별 정보와 함께 신규 등록 카드 여부(group.isNew)를 인자로 넘깁니다. */}
              <button onClick={() => removeCard(group.tempId, group.tableName, group.isNew)} style={closeBtnStyle}>&times;</button>

              <div style={inputGroup}>
                <label style={miniLabel}>테이블 타입명</label>
                <input
                  value={group.tableName}
                  onChange={(e) => handleFieldChange(group.tempId, 'tableName', e.target.value)}
                  style={textInputStyle} placeholder="예: 2인석"
                />
              </div>

              <div style={capacityRow}>
                <div style={compactInputGroup}>
                  <label style={miniLabel}>최소</label>
                  <input type="number" value={group.minCapacity} onChange={(e) => handleFieldChange(group.tempId, 'minCapacity', e.target.value)} style={numInputStyle} />
                </div>
                <span style={{ marginTop: '22px', color: '#ccc' }}>~</span>
                <div style={compactInputGroup}>
                  <label style={miniLabel}>최대</label>
                  <input type="number" value={group.maxCapacity} onChange={(e) => handleFieldChange(group.tempId, 'maxCapacity', e.target.value)} style={numInputStyle} />
                </div>
                <div style={{ flex: 1.5, marginLeft: '10px' }}>
                  <label style={miniLabel}>수량</label>
                  <div style={counterWrapper}>
                    <button onClick={() => handleFieldChange(group.tempId, 'count', Math.max(0, group.count - 1))} style={countBtn}>-</button>
                    <span style={countDisplay}>{group.count}</span>
                    <button onClick={() => handleFieldChange(group.tempId, 'count', group.count + 1)} style={countBtn}>+</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- 스타일링 ---
const containerStyle = { animation: 'fadeIn 0.5s ease' };
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const sectionTitle = { fontSize: '22px', fontWeight: '800', color: '#333', margin: 0 };
const sectionDesc = { fontSize: '13px', color: '#999', margin: '5px 0 0' };
const addBtnStyle = (color) => ({ padding: '12px 20px', background: '#fff', color: color, border: `1.5px solid ${color}`, borderRadius: '14px', fontWeight: '700', cursor: 'pointer' });
const saveAllBtnStyle = (color) => ({ padding: '12px 24px', background: color, color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: `0 4px 15px ${color}40` });
const gridWrapper = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' };
const tableCard = { position: 'relative', background: '#fff', borderRadius: '24px', padding: '30px 25px 25px', border: '1px solid #f0f0f0', boxShadow: '0 8px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '15px' };
const closeBtnStyle = { position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', color: '#ccc', cursor: 'pointer', lineHeight: '1' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '5px' };
const compactInputGroup = { display: 'flex', flexDirection: 'column', gap: '5px', width: '60px' };
const miniLabel = { fontSize: '11px', color: '#aaa', fontWeight: '600', marginLeft: '5px' };
const textInputStyle = { padding: '12px', borderRadius: '12px', border: '1px solid #eee', fontSize: '14px', fontWeight: '700', outline: 'none', background: '#fcfcfc' };
const numInputStyle = { ...textInputStyle, textAlign: 'center', padding: '12px 5px' };
const capacityRow = { display: 'flex', alignItems: 'center', gap: '10px' };
const counterWrapper = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9f9f9', padding: '8px 12px', borderRadius: '12px' };
const countBtn = { width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: '#fff', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const countDisplay = { fontSize: '16px', fontWeight: '800' };

export default TableTab;