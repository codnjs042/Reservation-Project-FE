import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import Swal from 'sweetalert2'; // 👈 SweetAlert2 임포트

const ScheduleTab = ({ storeId }) => {
  const [dayConfigs, setDayConfigs] = useState({});
  const mainColor = "#F0602A";
  const skyPointColor = "#7DB3D3";

  const dayMap = {
    'MONDAY': '월', 'TUESDAY': '화', 'WEDNESDAY': '수',
    'THURSDAY': '목', 'FRIDAY': '금', 'SATURDAY': '토', 'SUNDAY': '일'
  };
  const reverseDayMap = Object.fromEntries(Object.entries(dayMap).map(([k, v]) => [v, k]));
  const days = ['월', '화', '수', '목', '금', '토', '일'];

  // 성공 알림용 토스트 설정
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });

  useEffect(() => {
    if (!storeId) return;
    api.get(`/stores/${storeId}/schedules`)
      .then(res => {
        const rawData = res.data;
        const initialConfigs = {};
        days.forEach(d => {
          const dayEng = reverseDayMap[d];
          const daySchedules = rawData.filter(s => s.dayOfWeek === dayEng).sort((a, b) => a.startTime.localeCompare(b.startTime));
          if (daySchedules.length > 0) {
            const breaks = [];
            for (let i = 0; i < daySchedules.length - 1; i++) {
              breaks.push({ startTime: daySchedules[i].endTime.substring(0, 5), endTime: daySchedules[i + 1].startTime.substring(0, 5) });
            }
            initialConfigs[dayEng] = {
              openTime: daySchedules[0].startTime.substring(0, 5),
              closeTime: daySchedules[daySchedules.length - 1].endTime.substring(0, 5),
              interval: daySchedules[0].intervalMinute,
              breaks: breaks,
              isClosed: false
            };
          } else {
            initialConfigs[dayEng] = { openTime: '09:00', closeTime: '21:00', interval: 60, breaks: [], isClosed: true };
          }
        });
        setDayConfigs(initialConfigs);
      });
  }, [storeId]);

  const handleTimeChange = (dayEng, field, value, e) => {
    handleConfigChange(dayEng, field, value);
    if (e.target) e.target.blur();
  };

  const handleBreakTimeChange = (dayEng, idx, field, value, e) => {
    handleBreakChange(dayEng, idx, field, value);
    if (e.target) e.target.blur();
  };

  const handleConfigChange = (dayEng, field, value) => {
    setDayConfigs(prev => ({ ...prev, [dayEng]: { ...prev[dayEng], [field]: value } }));
  };

  const toggleCloseDay = async (dayEng) => {
    if (!dayConfigs[dayEng].isClosed) {
      // 1. 휴무 설정 확인창 (Swal 적용)
      const result = await Swal.fire({
        title: '휴무 설정',
        text: `${dayMap[dayEng]}요일을 정기 휴무로 설정하시겠습니까?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: mainColor,
        cancelButtonColor: '#aaa',
        confirmButtonText: '휴무 설정',
        cancelButtonText: '취소'
      });

      if (result.isConfirmed) {
        api.put(`/stores/${storeId}/schedules/${dayEng}`, { upsertSchedules: [] })
          .then(() => {
            handleConfigChange(dayEng, 'isClosed', true);
            Toast.fire({ icon: 'success', title: '휴무 설정 완료' });
          });
      }
    } else {
      handleConfigChange(dayEng, 'isClosed', false);
    }
  };

  const addBreak = (dayEng) => {
    const updated = { ...dayConfigs[dayEng] };
    updated.breaks.push({ startTime: '', endTime: '' });
    setDayConfigs({ ...dayConfigs, [dayEng]: updated });
  };

  const handleBreakChange = (dayEng, idx, field, value) => {
    const updated = { ...dayConfigs[dayEng] };
    updated.breaks[idx][field] = value;
    setDayConfigs({ ...dayConfigs, [dayEng]: updated });
  };

  const removeBreak = (dayEng, idx) => {
    const updated = { ...dayConfigs[dayEng] };
    updated.breaks.splice(idx, 1);
    setDayConfigs({ ...dayConfigs, [dayEng]: updated });
  };

  const saveDaySchedule = (dayEng) => {
    const config = dayConfigs[dayEng];
    let upsertSchedules = [];
    const sortedBreaks = [...config.breaks].filter(b => b.startTime && b.endTime).sort((a, b) => a.startTime.localeCompare(b.startTime));
    let currentStart = config.openTime;
    sortedBreaks.forEach(brk => {
      if (currentStart < brk.startTime) {
        upsertSchedules.push({ startTime: `${currentStart}:00`, endTime: `${brk.startTime}:00`, intervalMinute: parseInt(config.interval) });
      }
      currentStart = brk.endTime;
    });
    if (currentStart < config.closeTime) {
      upsertSchedules.push({ startTime: `${currentStart}:00`, endTime: `${config.closeTime}:00`, intervalMinute: parseInt(config.interval) });
    }

    api.put(`/stores/${storeId}/schedules/${dayEng}`, { upsertSchedules })
      .then(() => {
        Toast.fire({ icon: 'success', title: `${dayMap[dayEng]}요일 저장 완료` });
      })
      .catch(err => {
        // api.js 인터셉터에서 이미 에러를 처리하므로 추가 alert 생략
      });
  };

  return (
    <div style={containerStyle}>
      <div style={headerSection}>
        <h3 style={sectionTitle}>영업 및 휴무 설정</h3>
      </div>
      <div style={cardWrapper}>
        {days.map((dayName) => {
          const dayEng = reverseDayMap[dayName];
          const config = dayConfigs[dayEng] || { isClosed: true, breaks: [] };
          return (
            <div key={dayEng} style={dayRow(config.isClosed)}>
              <div style={dayHeader}>
                <div style={dayInfo}>
                  <div style={dayCircle(!config.isClosed, mainColor)}>{dayName}</div>
                  <span style={statusText(config.isClosed)}>{config.isClosed ? '정기 휴무일' : '영업 중'}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => toggleCloseDay(dayEng)} style={toggleBtn(config.isClosed, skyPointColor)}>
                    {config.isClosed ? '영업일로 변경' : '휴무로 설정'}
                  </button>
                  {!config.isClosed && <button onClick={() => saveDaySchedule(dayEng)} style={saveBtn(mainColor)}>저장</button>}
                </div>
              </div>

              {!config.isClosed && (
                <div style={detailSettings}>
                  <div style={timeRow}>
                    <div style={inputGroup}>
                      <span style={inputLabel}>영업 시간</span>
                      <input
                        type="time"
                        value={config.openTime}
                        onChange={(e) => handleTimeChange(dayEng, 'openTime', e.target.value, e)}
                        onClick={(e) => e.target.showPicker?.()}
                        style={timeInput}
                      />
                      <span style={divider}>~</span>
                      <input
                        type="time"
                        value={config.closeTime}
                        onChange={(e) => handleTimeChange(dayEng, 'closeTime', e.target.value, e)}
                        onClick={(e) => e.target.showPicker?.()}
                        style={timeInput}
                      />
                    </div>
                    <div style={intervalGroup}>
                      <span style={miniLabel}>예약 간격</span>
                      <input type="number" value={config.interval} onChange={(e) => handleConfigChange(dayEng, 'interval', e.target.value)} style={numInput} />
                      <span style={{fontSize:'13px', marginLeft:'4px'}}>분</span>
                    </div>
                  </div>

                  {config.breaks.length > 0 && (
                    <div style={{display:'flex', flexDirection:'column', gap:'8px', marginTop:'5px'}}>
                      {config.breaks.map((brk, idx) => (
                        <div key={idx} style={breakRow}>
                          <span style={breakTag}>☕ 브레이크</span>
                          <input
                            type="time"
                            value={brk.startTime}
                            onChange={(e) => handleBreakTimeChange(dayEng, idx, 'startTime', e.target.value, e)}
                            onClick={(e) => e.target.showPicker?.()}
                            style={timeInput}
                          />
                          <span style={divider}>~</span>
                          <input
                            type="time"
                            value={brk.endTime}
                            onChange={(e) => handleBreakTimeChange(dayEng, idx, 'endTime', e.target.value, e)}
                            onClick={(e) => e.target.showPicker?.()}
                            style={timeInput}
                          />
                          <button onClick={() => removeBreak(dayEng, idx)} style={delBreakBtn}>&times;</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={() => addBreak(dayEng)} style={addBreakBtn(skyPointColor)}>+ 브레이크 추가</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- 스타일링 생략 (기존과 동일) ---
const containerStyle = { animation: 'fadeIn 0.5s ease' };
const headerSection = { marginBottom: '30px' };
const sectionTitle = { fontSize: '22px', fontWeight: '800', color: '#333' };
const cardWrapper = { display: 'flex', flexDirection: 'column', gap: '12px' };
const dayRow = (isClosed) => ({ background: isClosed ? '#f9f9f9' : '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #f0f0f0', transition: '0.3s' });
const dayHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const dayInfo = { display: 'flex', alignItems: 'center', gap: '12px' };
const dayCircle = (isOpen, color) => ({ width: '38px', height: '38px', borderRadius: '13px', background: isOpen ? color : '#eee', color: isOpen ? '#fff' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' });
const toggleBtn = (isClosed, color) => ({ padding: '8px 14px', borderRadius: '12px', border: 'none', background: isClosed ? `${color}20` : '#f5f5f5', color: isClosed ? color : '#888', fontSize: '13px', fontWeight: '700', cursor: 'pointer' });
const saveBtn = (color) => ({ padding: '8px 20px', background: color, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' });
const statusText = (isClosed) => ({ fontSize: '16px', fontWeight: '700', color: isClosed ? '#ccc' : '#333' });
const detailSettings = { marginTop: '20px', paddingLeft: '50px', display: 'flex', flexDirection: 'column', gap: '15px' };
const timeRow = { display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' };
const inputGroup = { display: 'flex', alignItems: 'center', gap: '10px', background: '#f9f9f9', padding: '10px 18px', borderRadius: '14px', border: '1px solid #f0f0f0' };
const inputLabel = { fontSize: '12px', fontWeight: '800', color: '#F0602A', marginRight: '5px' };
const timeInput = { border: 'none', background: 'transparent', fontSize: '16px', fontWeight: '700', width: '130px', outline: 'none', cursor: 'pointer', color: '#444' };
const divider = { color: '#ccc', fontWeight: '400' };
const intervalGroup = { display: 'flex', alignItems: 'center', background: '#fff', padding: '8px 15px', borderRadius: '12px', border: '1px solid #eee' };
const miniLabel = { fontSize: '12px', fontWeight: '700', color: '#999', marginRight: '8px' };
const numInput = { width: '45px', border: 'none', fontSize: '14px', fontWeight: '700', textAlign: 'center', outline: 'none' };
const breakRow = { display: 'flex', alignItems: 'center', gap: '12px', background: '#fff5f2', padding: '10px 18px', borderRadius: '14px', width: 'fit-content', border: '1px solid #ffe8e0' };
const breakTag = { fontSize: '12px', color: '#F0602A', fontWeight: '800', marginRight: '5px' };
const delBreakBtn = { background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '20px', marginLeft: '5px' };
const addBreakBtn = (color) => ({ width: 'fit-content', padding: '8px 16px', background: 'none', border: `1px dashed ${color}`, color: color, borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', marginTop: '5px' });

export default ScheduleTab;