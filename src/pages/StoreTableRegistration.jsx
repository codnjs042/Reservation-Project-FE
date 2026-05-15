import React, { useState } from 'react';
import api from '../api/api';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { LayoutGrid, Trash2, Plus } from 'lucide-react';
import RegistrationGuide from '../components/RegistrationGuide'; // 공통 가이드 컴포넌트

const StoreTableRegistration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const storeId = location.state?.storeId;

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
      if (!storeId) return Swal.fire({ icon: 'error', title: '오류', text: '매장 정보가 없습니다.' });

      // 1. 물어보지 않고 바로 로딩 시작
      Swal.fire({
        title: '테이블 생성 중...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const promises = tableConfigs.map(config => {
          return api.post(`/stores/${storeId}/tables/register`, {
            tableName: config.tableName || "기본 테이블",
            minCapacity: parseInt(config.minCapacity, 10) || 1,
            maxCapacity: parseInt(config.maxCapacity, 10) || 2,
            count: parseInt(config.count, 10) || 1
          });
        });

        await Promise.all(promises);

        // 2. 성공 시 가벼운 Toast 알림만 띄우고 바로 이동
        Swal.fire({
          icon: 'success',
          title: '테이블 등록 완료!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true
        });

        navigate("/business");

      } catch (err) {
        console.error("등록 중 오류 발생", err);
        const msg = err.response?.data?.message || "서버 통신 중 오류가 발생했습니다.";
        // 실패 시에만 팝업으로 알려줌
        Swal.fire({
          icon: 'error',
          title: '등록 실패',
          text: msg,
          confirmButtonColor: '#F0602A'
        });
      }
    };

  const previewRows = renderPreviewRows();
  const mainColor = "#F0602A";

  return (
    <div style={splitPageWrapper}>
      <RegistrationGuide step={3} /> {/* 공통 가이드 3단계 적용 */}

      <div style={rightFormSide}>
        <div style={formCard}>
          <div style={headerText}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#334155', margin: '0 0 8px 0' }}>🪑 우리 가게 테이블 설정</h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>종류별 수량을 입력하면 시스템이 테이블 목록을 자동 생성합니다.</p>
          </div>

          {tableConfigs.map((config) => (
            <div key={config.id} style={configCardStyle}>
              <div style={inputRow}>
                <div style={{ flex: 3 }}>
                  <label style={labelStyle}>테이블 종류</label>
                  <input placeholder="예: 창가 2인석" value={config.tableName} onChange={(e) => handleConfigChange(config.id, 'tableName', e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: 1.5 }}>
                  <label style={labelStyle}>수량(개)</label>
                  <input type="number" min="1" value={config.count} onChange={(e) => handleConfigChange(config.id, 'count', e.target.value)} style={inputStyle} />
                </div>
                <button onClick={() => removeConfig(config.id)} style={delBtnStyle} title="삭제"><Trash2 size={16} /></button>
              </div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>최소 인원</label><input type="number" value={config.minCapacity} onChange={(e) => handleConfigChange(config.id, 'minCapacity', e.target.value)} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>최대 인원</label><input type="number" value={config.maxCapacity} onChange={(e) => handleConfigChange(config.id, 'maxCapacity', e.target.value)} style={inputStyle} /></div>
              </div>
            </div>
          ))}

          <button onClick={addConfig} style={addBtnStyle}><Plus size={16} /> 테이블 종류 추가하기</button>

          <div style={previewBoxStyle}>
            <div style={previewHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><LayoutGrid size={16} color={mainColor} /><span style={{ fontWeight: '800', color: '#334155' }}>생성 리스트 미리보기</span></div>
              <span style={countBadge}>총 {previewRows.length}개</span>
            </div>
            <div style={tableGrid}>
              {previewRows.map((row, idx) => (
                <div key={idx} style={tableItemStyle}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>{row.typeName}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>No.{row.index} | {row.capacity}</div>
                </div>
              ))}
              {previewRows.length === 0 && <div style={emptyMsg}>테이블을 구성해 주세요.</div>}
            </div>
          </div>

          <div style={btnGroup}>
            <button onClick={() => navigate("/business")} style={cancelBtn}>나중에 하기</button>
            <button onClick={handleSubmit} style={submitBtn(mainColor)}>등록 완료</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- Styles --- */
const splitPageWrapper = { display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: '#f8fafc' };
const rightFormSide = { flex: 1, backgroundColor: '#f8fafc', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const formCard = { width: '100%', maxWidth: '580px', boxSizing: 'border-box', paddingBottom: '60px' };
const headerText = { marginBottom: '25px', textAlign: 'left' };
const configCardStyle = { backgroundColor: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginBottom: '16px' };
const inputRow = { display: 'flex', gap: '12px', alignItems: 'flex-end' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px' };
const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
const delBtnStyle = { backgroundColor: '#fff1f0', color: '#ff4d4f', border: '1px solid #ffccc7', borderRadius: '10px', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const addBtnStyle = { width: '100%', padding: '14px', background: '#fff', border: '2px dashed #e2e8f0', color: '#64748b', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '30px' };
const previewBoxStyle = { backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #eef2f6' };
const previewHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const countBadge = { backgroundColor: '#f0f9ff', color: '#0091ff', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' };
const tableGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' };
const tableItemStyle = { background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' };
const emptyMsg = { gridColumn: '1/-1', textAlign: 'center', color: '#cbd5e1', padding: '20px', fontSize: '13px' };
const btnGroup = { display: 'flex', gap: '12px', marginTop: '40px' };
const cancelBtn = { flex: 1, padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: '#e2e8f0', color: '#64748b', fontWeight: '700', cursor: 'pointer' };
const submitBtn = (color) => ({ flex: 2, padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: color, color: '#fff', fontWeight: '800', fontSize: '15px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(240, 96, 42, 0.2)' });

export default StoreTableRegistration;