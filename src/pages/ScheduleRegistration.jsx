import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

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

  // ✅ isClosed 속성 추가
  const [dayConfigs, setDayConfigs] = useState(
    days.reduce((acc, day) => ({
      ...acc,
      [day.key]: {
        openTime: '09:00',
        closeTime: '21:00',
        interval: 60,
        breaks: [],
        isClosed: false // 기본값: 영업 중
      }
    }), {})
  );

  const addBreak = (day) => {
    const updated = { ...dayConfigs[day] };
    updated.breaks.push({ startTime: '', endTime: '' });
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

  // ✅ [수정] 저장 로직: 휴무일은 제외하고 요청 보냄
  const handleNextStep = async () => {
    if (!storeId) return alert("매장 정보가 없습니다.");
    try {
      // isClosed가 false인 요일만 골라서 요청 생성
      const promises = Object.entries(dayConfigs)
        .filter(([_, config]) => !config.isClosed)
        .map(([day, config]) => {
          const upsertSchedules = convertToUpsertRequest(config);
          return axios.put(`http://localhost:8081/stores/${storeId}/schedules/${day}`, {
            upsertSchedules: upsertSchedules
          });
        });

      if (promises.length > 0) {
        await Promise.all(promises);
      }

      alert("영업시간 설정 완료!");
      handleGoToNext();
    } catch (err) {
      alert("저장 실패. 시간을 다시 확인해주세요.");
    }
  };

  const handleGoToNext = () => {
    if (hasTable) { navigate("/business"); }
    else {
      navigate("/business/new-store/tables", { state: { storeId, hasSchedule: true } });
    }
  };

  const convertToUpsertRequest = (config) => {
    const { openTime, closeTime, interval, breaks } = config;
    const sortedBreaks = [...breaks].filter(b => b.startTime && b.endTime)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    const result = [];
    let currentStart = openTime;
    sortedBreaks.forEach(brk => {
      if (currentStart < brk.startTime) {
        result.push({ startTime: `${currentStart}:00`, endTime: `${brk.startTime}:00`, intervalMinute: parseInt(interval) });
      }
      currentStart = brk.endTime;
    });
    if (currentStart < closeTime) {
      result.push({ startTime: `${currentStart}:00`, endTime: `${closeTime}:00`, intervalMinute: parseInt(interval) });
    }
    return result;
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>⏳ 영업시간 및 브레이크 설정</h2>
      <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem', marginBottom: '30px' }}>
        요일별 영업 시간과 쉬는 시간을 설정해 주세요.
      </p>

      {days.map(day => {
        const isClosed = dayConfigs[day.key].isClosed;
        return (
          <div key={day.key} style={{...dayCardStyle, opacity: isClosed ? 0.6 : 1}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{day.label}요일</div>

              {/* ✅ 휴무 체크박스 */}
              <label style={{ fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="checkbox"
                  checked={isClosed}
                  onChange={(e) => handleConfigChange(day.key, 'isClosed', e.target.checked)}
                />
                <span style={{ color: isClosed ? '#ff4d4f' : '#888' }}>휴무</span>
              </label>
            </div>

            {/* ✅ 휴무가 아닐 때만 입력 영역 표시 */}
            {!isClosed ? (
              <>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                  <input type="time" value={dayConfigs[day.key].openTime} onChange={(e) => handleConfigChange(day.key, 'openTime', e.target.value)} style={timeInputStyle} />
                  ~
                  <input type="time" value={dayConfigs[day.key].closeTime} onChange={(e) => handleConfigChange(day.key, 'closeTime', e.target.value)} style={timeInputStyle} />
                  <span style={{ fontSize: '0.8rem', marginLeft: '5px' }}>간격:</span>
                  <input type="number" style={{ width: '50px', padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }} value={dayConfigs[day.key].interval} onChange={(e) => handleConfigChange(day.key, 'interval', e.target.value)} />분
                </div>

                {dayConfigs[day.key].breaks.map((brk, idx) => (
                  <div key={idx} style={breakRowStyle}>
                    <span style={{ fontSize: '0.8rem', color: '#ff4d4f', fontWeight: 'bold' }}>☕ 브레이크:</span>
                    <input type="time" value={brk.startTime} onChange={(e) => handleBreakChange(day.key, idx, 'startTime', e.target.value)} style={timeInputStyle} />
                    ~
                    <input type="time" value={brk.endTime} onChange={(e) => handleBreakChange(day.key, idx, 'endTime', e.target.value)} style={timeInputStyle} />
                  </div>
                ))}
                <button onClick={() => addBreak(day.key)} style={addBreakBtn}>+ 브레이크 추가</button>
              </>
            ) : (
              <div style={{ padding: '10px 0', color: '#bbb', fontStyle: 'italic', fontSize: '0.9rem' }}>
                오늘은 쉬어가는 날입니다. 🏖️
              </div>
            )}
          </div>
        );
      })}

      <div style={{ marginTop: '40px', display: 'flex', gap: '15px' }}>
        <button onClick={handleGoToNext} style={backBtnStyle}>나중에 하기</button>
        <button onClick={handleNextStep} style={submitBtnStyle}>저장하고 다음 단계로</button>
      </div>
    </div>
  );
};

// ... 스타일 시트는 동일하게 유지 ...
const containerStyle = { maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' };
const dayCardStyle = { background: '#fff', padding: '20px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: '0.3s' };
const timeInputStyle = { padding: '5px', borderRadius: '4px', border: '1px solid #ddd' };
const breakRowStyle = { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', paddingLeft: '10px', borderLeft: '3px solid #ff4d4f' };
const addBreakBtn = { background: 'none', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', marginTop: '10px', padding: '5px 10px', color: '#666' };
const submitBtnStyle = { flex: 2, padding: '18px', background: '#1890ff', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' };
const backBtnStyle = { flex: 1, padding: '18px', background: '#f5f5f5', color: '#666', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };

export default ScheduleRegistration;