import React, { useState } from 'react';
import api from '../api/api'; // ✅ 인터셉터가 적용된 api 인스턴스 임포트
import { useLocation, useNavigate } from 'react-router-dom';

const StoreTableRegistration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const storeId = location.state?.storeId;

  // 💡 테이블만 하러 왔는지 여부 (텍스트 분기용)
  const isUpdateMode = location.state?.hasSchedule === true;

  const [tableConfigs, setTableConfigs] = useState([
    { id: Date.now(), tableName: '4인석', minCapacity: 2, maxCapacity: 4, count: 1 }
  ]);

  const renderPreviewRows = () => {
    let preview = [];
    tableConfigs.forEach(config => {
      const num = parseInt(config.count) || 0;
      for (let i = 1; i <= num; i++) {
        preview.push({
          typeName: config.tableName || '미정',
          index: i,
          capacity: `${config.minCapacity}~${config.maxCapacity}인`
        });
      }
    });
    return preview;
  };

  const handleConfigChange = (id, field, value) => {
    setTableConfigs(tableConfigs.map(c =>
      c.id === id ? { ...c, [field]: (field === 'tableName' ? value : parseInt(value) || 0) } : c
    ));
  };

  const addConfig = () => {
    setTableConfigs([...tableConfigs, { id: Date.now(), tableName: '', minCapacity: 1, maxCapacity: 2, count: 1 }]);
  };

  const removeConfig = (id) => {
    if (tableConfigs.length === 1) return;
    setTableConfigs(tableConfigs.filter(c => c.id !== id));
  };

  const handleSubmit = async () => {
    if (!storeId) return alert("매장 정보가 없습니다.");

    try {
      // ✅ axios.post 대신 api.post 사용
      const promises = tableConfigs.map(config => {
        const requestData = {
          tableName: config.tableName || "기본 테이블",
          minCapacity: parseInt(config.minCapacity, 10) || 1,
          maxCapacity: parseInt(config.maxCapacity, 10) || 2,
          count: parseInt(config.count, 10) || 1
        };
        return api.post(`http://localhost:8081/stores/${storeId}/tables/register`, requestData);
      });

      await Promise.all(promises);
      alert("🎉 테이블 등록이 완료되었습니다!");
      navigate("/business");

    } catch (err) {
      // 상세 에러 알럿은 인터셉터(api.js)에서 처리하므로 흐름만 제어
      console.error("등록 중 오류 발생", err);
    }
  };

  const previewRows = renderPreviewRows();

  return (
    <div style={containerStyle}>
      <div style={stepIndicator}>{isUpdateMode ? "매장 관리" : "Step 3: 테이블 구성"}</div>
      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>🪑 우리 가게 테이블 설정</h2>
      <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem', marginBottom: '30px' }}>
        종류별 수량을 입력하면 시스템이 자동으로 테이블을 생성합니다.
      </p>

      {/* 테이블 입력 카드들 */}
      <div style={{ marginBottom: '40px' }}>
        {tableConfigs.map((config) => (
          <div key={config.id} style={configCardStyle}>
            <div style={inputRow}>
              <div style={{flex: 2}}>
                <label style={labelStyle}>테이블 종류</label>
                <input
                  placeholder="예: 창가 2인석"
                  value={config.tableName}
                  onChange={(e) => handleConfigChange(config.id, 'tableName', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{flex: 1}}>
                <label style={labelStyle}>수량</label>
                <input
                  type="number" min="1"
                  value={config.count}
                  onChange={(e) => handleConfigChange(config.id, 'count', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <button onClick={() => removeConfig(config.id)} style={delBtnStyle}>삭제</button>
            </div>
            <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
              <div style={{flex: 1}}>
                <label style={labelStyle}>최소 인원</label>
                <input type="number" value={config.minCapacity} onChange={(e) => handleConfigChange(config.id, 'minCapacity', e.target.value)} style={inputStyle} />
              </div>
              <div style={{flex: 1}}>
                <label style={labelStyle}>최대 인원</label>
                <input type="number" value={config.maxCapacity} onChange={(e) => handleConfigChange(config.id, 'maxCapacity', e.target.value)} style={inputStyle} />
              </div>
            </div>
          </div>
        ))}
        <button onClick={addConfig} style={addBtnStyle}>+ 테이블 종류 추가</button>
      </div>

      {/* 프리뷰 박스 */}
      <div style={previewBoxStyle}>
        <h4 style={{ margin: '0 0 15px 0', display: 'flex', justifyContent: 'space-between' }}>
          <span>📋 생성될 테이블 목록</span>
          <span style={{ color: '#1890ff' }}>총 {previewRows.length}개</span>
        </h4>
        <div style={tableGrid}>
          {previewRows.map((row, idx) => (
            <div key={idx} style={tableItemStyle}>
              <div style={{ fontWeight: 'bold' }}>{row.typeName}</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>No.{row.index} | {row.capacity}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '40px', display: 'flex', gap: '15px' }}>
        <button
          onClick={() => navigate("/business")}
          style={backBtnStyle}
        >
          나중에 하기
        </button>

        <button onClick={handleSubmit} style={submitBtnStyle}>
          {isUpdateMode ? "설정 저장하기" : "등록 완료 및 오픈"}
        </button>
      </div>
    </div>
  );
};

// --- 스타일 (동일하게 유지) ---
const containerStyle = { maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' };
const stepIndicator = { color: '#1890ff', fontWeight: 'bold', textAlign: 'center', fontSize: '0.9rem' };
const configCardStyle = { background: '#fff', padding: '25px', borderRadius: '15px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' };
const inputRow = { display: 'flex', gap: '15px', alignItems: 'flex-end' };
const labelStyle = { display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '5px', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' };
const delBtnStyle = { background: '#fff1f0', color: '#ff4d4f', border: '1px solid #ffccc7', borderRadius: '8px', padding: '10px 15px', cursor: 'pointer' };
const addBtnStyle = { width: '100%', padding: '12px', background: '#f0f7ff', border: '1px dashed #1890ff', color: '#1890ff', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };
const previewBoxStyle = { background: '#fafafa', padding: '20px', borderRadius: '15px', border: '1px solid #eee' };
const tableGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' };
const tableItemStyle = { background: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #e8e8e8', textAlign: 'center' };
const submitBtnStyle = { flex: 2, padding: '18px', background: '#1890ff', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' };
const backBtnStyle = { flex: 1, padding: '18px', background: '#f5f5f5', color: '#666', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };

export default StoreTableRegistration;