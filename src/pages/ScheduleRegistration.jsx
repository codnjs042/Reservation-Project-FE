import React, { useState } from 'react';
import api from '../api/api';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Clock, Coffee, CalendarOff } from 'lucide-react';
import RegistrationGuide from '../components/RegistrationGuide'; // 공통 가이드 컴포넌트

const ScheduleRegistration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const storeId = location.state?.storeId;
  const hasTable = location.state?.hasTable;

  const days = [
    { key: 'MONDAY', label: '월' }, { key: 'TUESDAY', label: '화' },
    { key: 'WEDNESDAY', label: '수' }, { key: 'THURSDAY', label: '목' },
    { key: 'FRIDAY', label: '금' }, { key: 'SATURDAY', label: '토' },
    { key: 'SUNDAY', label: '일' }
  ];

  const [dayConfigs, setDayConfigs] = useState(
    days.reduce((acc, day) => ({
      ...acc,
      [day.key]: {
        openTime: '09:00', closeTime: '21:00', interval: 60, breaks: [], isClosed: false
      }
    }), {})
  );

  const addBreak = (day) => {
    const updated = { ...dayConfigs[day] };
    updated.breaks.push({ startTime: '', endTime: '' });
    setDayConfigs({ ...dayConfigs, [day]: updated });
  };

  const removeBreak = (day, index) => {
    const updated = { ...dayConfigs[day] };
    updated.breaks.splice(index, 1);
    setDayConfigs({ ...dayConfigs, [day]: updated });
  };

  const handleConfigChange = (day, field, value) => {
    setDayConfigs({ ...dayConfigs, [day]: { ...dayConfigs[day], [field]: value } });
  };

  const handleBreakChange = (day, index, field, value) => {
    const updated = { ...dayConfigs[day] };
    updated.breaks[index][field] = value;
    setDayConfigs({ ...dayConfigs, [day]: updated });
  };

  const handleNextStep = async () => {
    if (!storeId) return Swal.fire({ icon: 'error', title: '오류', text: '매장 정보가 누락되었습니다.' });

    Swal.fire({
      title: '영업 정책 저장 중...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const promises = Object.entries(dayConfigs)
        .filter(([_, config]) => !config.isClosed)
        .map(([day, config]) => {
          const upsertSchedules = convertToUpsertRequest(config);
          return api.put(`/stores/${storeId}/schedules/${day}`, { upsertSchedules });
        });

      if (promises.length > 0) await Promise.all(promises);

      Swal.fire({
        icon: 'success', title: '영업 시간 저장 완료!',
        toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, timerProgressBar: true
      });

      handleGoToNext();
    } catch (err) {
      const msg = err.response?.data?.message || "영업시간 저장 중 오류가 발생했습니다.";
      Swal.fire({ icon: 'error', title: '저장 실패', text: msg, confirmButtonColor: '#F0602A' });
    }
  };

  const handleGoToNext = () => {
    if (hasTable) navigate("/business");
    else navigate("/business/new-store/tables", { state: { storeId, hasSchedule: true } });
  };

  const convertToUpsertRequest = (config) => {
    const { openTime, closeTime, interval, breaks } = config;
    const sortedBreaks = [...breaks].filter(b => b.startTime && b.endTime).sort((a, b) => a.startTime.localeCompare(b.startTime));
    const result = [];
    let currentStart = openTime;
    sortedBreaks.forEach(brk => {
      if (currentStart < brk.startTime) {
        result.push({ startTime: `${currentStart}:00`, endTime: `${brk.startTime}:00`, intervalMinute: parseInt(interval) });
      }
      currentStart = brk.endTime;
    });
    if (currentStart < closeTime) result.push({ startTime: `${currentStart}:00`, endTime: `${closeTime}:00`, intervalMinute: parseInt(interval) });
    return result;
  };

  const mainColor = "#F0602A";

  return (
    <div style={splitPageWrapper}>
      <RegistrationGuide step={2} /> {/* 분리된 가이드 적용 */}

      <div style={rightFormSide}>
        <div style={formCard}>
          <div style={headerText}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#334155', margin: '0 0 8px 0' }}>⏳ 영업 시간 상세 설정</h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>매장 상황에 맞춰 요일별 스케줄을 조정하세요.</p>
          </div>

          {days.map(day => {
            const isClosed = dayConfigs[day.key].isClosed;
            return (
              <div key={day.key} style={{...dayCardStyle, borderLeft: isClosed ? '4px solid #cbd5e1' : `4px solid ${mainColor}`}}>
                <div style={cardHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={dayLabel(isClosed)}>{day.label}</span>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: isClosed ? '#94a3b8' : '#334155' }}>요일</span>
                  </div>
                  <label style={checkboxLabel}>
                    <input type="checkbox" checked={isClosed} onChange={(e) => handleConfigChange(day.key, 'isClosed', e.target.checked)} style={{ cursor: 'pointer' }} />
                    <span>정기휴무</span>
                  </label>
                </div>

                {!isClosed ? (
                  <div style={cardBody}>
                    <div style={timeRow}>
                      <Clock size={16} color="#64748b" />
                      <input type="time" value={dayConfigs[day.key].openTime} onChange={(e) => handleConfigChange(day.key, 'openTime', e.target.value)} style={smallTimeInput} />
                      <span style={{color: '#cbd5e1'}}>~</span>
                      <input type="time" value={dayConfigs[day.key].closeTime} onChange={(e) => handleConfigChange(day.key, 'closeTime', e.target.value)} style={smallTimeInput} />
                      <div style={intervalBox}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>간격</span>
                        <input type="number" value={dayConfigs[day.key].interval} onChange={(e) => handleConfigChange(day.key, 'interval', e.target.value)} style={intervalInput} />
                        <span style={{ fontSize: '12px', color: '#64748b' }}>분</span>
                      </div>
                    </div>
                    {dayConfigs[day.key].breaks.map((brk, idx) => (
                      <div key={idx} style={breakRow}>
                        <div style={breakBadge}><Coffee size={12} /> 브레이크</div>
                        <input type="time" value={brk.startTime} onChange={(e) => handleBreakChange(day.key, idx, 'startTime', e.target.value)} style={smallTimeInput} />
                        <span style={{color: '#cbd5e1'}}>~</span>
                        <input type="time" value={brk.endTime} onChange={(e) => handleBreakChange(day.key, idx, 'endTime', e.target.value)} style={smallTimeInput} />
                        <button onClick={() => removeBreak(day.key, idx)} style={removeBreakBtn}>×</button>
                      </div>
                    ))}
                    <button onClick={() => addBreak(day.key)} style={addBreakBtn}>+ 브레이크 추가</button>
                  </div>
                ) : (
                  <div style={closedMsg}><CalendarOff size={16} /> 해당 요일은 휴무입니다.</div>
                )}
              </div>
            );
          })}

          <div style={btnGroup}>
            <button onClick={handleGoToNext} style={cancelBtn}>나중에 설정</button>
            <button onClick={handleNextStep} style={submitBtn(mainColor)}>등록 완료</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- 스타일 정의 --- */
const splitPageWrapper = { display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: '#f8fafc' };
const rightFormSide = { flex: 1, backgroundColor: '#f8fafc', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const formCard = { width: '100%', maxWidth: '580px', boxSizing: 'border-box', paddingBottom: '60px' };
const headerText = { marginBottom: '25px', textAlign: 'left', width: '100%' };
const dayCardStyle = { backgroundColor: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginBottom: '16px' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const dayLabel = (isClosed) => ({ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: isClosed ? '#f1f5f9' : '#fff5f0', color: isClosed ? '#94a3b8' : '#F0602A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800', border: isClosed ? '1px solid #e2e8f0' : '1px solid #ffdecb' });
const checkboxLabel = { fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', cursor: 'pointer' };
const cardBody = { display: 'flex', flexDirection: 'column', gap: '12px' };
const timeRow = { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px' };
const smallTimeInput = { border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 8px', fontSize: '14px', outline: 'none', color: '#334155' };
const intervalBox = { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', borderLeft: '1px solid #e2e8f0', paddingLeft: '12px' };
const intervalInput = { width: '40px', border: 'none', background: 'none', borderBottom: '1px solid #cbd5e1', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#F0602A', outline: 'none' };
const breakRow = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '1px dashed #7DB3D3', borderRadius: '10px', backgroundColor: '#f0f9ff' };
const breakBadge = { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '800', color: '#7DB3D3' };
const removeBreakBtn = { border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' };
const addBreakBtn = { border: '1px dashed #cbd5e1', background: '#fff', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: '700', color: '#64748b', cursor: 'pointer' };
const closedMsg = { padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
const btnGroup = { display: 'flex', gap: '12px', marginTop: '40px' };
const cancelBtn = { flex: 1, padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: '#e2e8f0', color: '#64748b', fontWeight: '700', cursor: 'pointer' };
const submitBtn = (color) => ({ flex: 2, padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: color, color: '#fff', fontWeight: '800', fontSize: '15px', cursor: 'pointer' });

export default ScheduleRegistration;