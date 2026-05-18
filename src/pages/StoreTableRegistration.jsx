import React, { useState } from 'react';
import api from '../api/api';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { LayoutGrid, Trash2, Plus } from 'lucide-react';
import RegistrationGuide from '../components/RegistrationGuide';

const StoreTableRegistration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const storeId = location.state?.storeId;

  // 기본 채워지는 값도 빈 값 혹은 명확한 숫자로 변경
  const [tableConfigs, setTableConfigs] = useState([
    { id: Date.now(), tableName: '2인석', minCapacity: '1', maxCapacity: '2', count: '1' }
  ]);

  const renderPreviewRows = () => {
    let preview = [];
    tableConfigs.forEach(config => {
      const num = parseInt(config.count, 10);
      if (!num || num <= 0) return; // 수량이 제대로 입력 안 되면 미리보기 생성 안 함

      for (let i = 1; i <= num; i++) {
        preview.push({
          typeName: config.tableName,
          index: i,
          capacity: config.minCapacity && config.maxCapacity ? `${config.minCapacity}~${config.maxCapacity}인` : ''
        });
      }
    });
    return preview;
  };

  const handleConfigChange = (id, field, value) => {
    setTableConfigs(tableConfigs.map(c =>
      c.id === id ? { ...c, [field]: (field === 'tableName' ? value : value === '' ? '' : parseInt(value, 10)) } : c
    ));
  };

  const addConfig = () => {
    setTableConfigs([...tableConfigs, { id: Date.now(), tableName: '', minCapacity: '', maxCapacity: '', count: '' }]);
  };

  const removeConfig = (id) => {
    if (tableConfigs.length === 1) return;
    setTableConfigs(tableConfigs.filter(c => c.id !== id));
  };

  // 🔥 || 기본값 다 걷어내고 필수 입력 벨리데이션 추가
  const handleSubmit = async () => {
    if (!storeId) return Swal.fire({ icon: 'error', title: '오류', text: '매장 정보가 없습니다.' });

    // 1. 루프를 돌며 하나라도 빈 값이 있거나 숫자가 정상적이지 않으면 전면 차단
    for (let i = 0; i < tableConfigs.length; i++) {
      const config = tableConfigs[i];
      const rowNum = i + 1;

      if (!config.tableName || config.tableName.trim() === "") {
        return Swal.fire({ icon: 'warning', title: '입력 오류', text: `${rowNum}번째 테이블의 이름을 입력해 주세요.` });
      }
      if (!config.count || config.count <= 0) {
        return Swal.fire({ icon: 'warning', title: '입력 오류', text: `${rowNum}번째 테이블의 수량을 1개 이상 입력해 주세요.` });
      }
      if (!config.minCapacity || config.minCapacity <= 0) {
        return Swal.fire({ icon: 'warning', title: '입력 오류', text: `${rowNum}번째 테이블의 최소 인원을 입력해 주세요.` });
      }
      if (!config.maxCapacity || config.maxCapacity <= 0) {
        return Swal.fire({ icon: 'warning', title: '입력 오류', text: `${rowNum}번째 테이블의 최대 인원을 입력해 주세요.` });
      }
      if (config.minCapacity > config.maxCapacity) {
        return Swal.fire({ icon: 'warning', title: '입력 오류', text: `${rowNum}번째 테이블의 최소 인원이 최대 인원보다 클 수 없습니다.` });
      }
    }

    // 2. 완벽하게 통과했을 때만 로딩바 띄우고 요청 보냄
    Swal.fire({
      title: '테이블 생성 중...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      const promises = tableConfigs.map(config => {
        return api.post(`/stores/${storeId}/tables/register`, {
          tableName: config.tableName.trim(),
          minCapacity: config.minCapacity,
          maxCapacity: config.maxCapacity,
          count: config.count
        });
      });

      await Promise.all(promises);

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
      // 에러 메시지도 서버가 준게 없다면 가차없이 빈 칸 처리하거나 고정 문구 출력
      const msg = err.response?.data?.message || "서버 통신 실패";
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
      <RegistrationGuide step={3} />

      <div style={rightFormSide}>
        <div style={formCard}>
          <div style={headerText}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#334155', margin: '0 0 8px 0' }}>🪑 우리 가게 테이블 설정</h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>모든 항목을 정확하게 입력하셔야 등록이 완료됩니다.</p>
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
                <div style={{ flex: 1 }}><label style={labelStyle}>최소 인원</label><input type="number" min="1" value={config.minCapacity} onChange={(e) => handleConfigChange(config.id, 'minCapacity', e.target.value)} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>최대 인원</label><input type="number" min="1" value={config.maxCapacity} onChange={(e) => handleConfigChange(config.id, 'maxCapacity', e.target.value)} style={inputStyle} /></div>
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
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>{row.typeName || '이름 없음'}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>No.{row.index} {row.capacity && `| ${row.capacity}`}</div>
                </div>
              ))}
              {previewRows.length === 0 && <div style={emptyMsg}>테이블 수량을 설정하면 미리보기가 활성화됩니다.</div>}
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

/* --- 스타일은 기존과 동일 --- */
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