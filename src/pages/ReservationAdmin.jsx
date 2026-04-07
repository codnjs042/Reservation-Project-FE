import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RES_MAP = {
  status: { CONFIRMED: "수락", CANCELED: "취소", REJECTED: "거절", NO_SHOW: "노쇼", VISITED: "방문완료" }
};

function ReservationAdmin() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [filters, setFilters] = useState({ keyword: '', status: '' });

  const fetchRes = () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
    axios.get('http://localhost:8081/admin/reservations', { params }).then(res => setReservations(res.data));
  };

  useEffect(() => { fetchRes(); }, []);

  const tabStyle = (path) => ({
    padding: '15px 25px', cursor: 'pointer',
    borderBottom: window.location.pathname === path ? '3px solid #673ab7' : '3px solid transparent',
    color: window.location.pathname === path ? '#673ab7' : '#666', fontWeight: 'bold'
  });

  return (
    <div style={{ padding: '30px', background: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ display: 'flex', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <div style={tabStyle('/admin')} onClick={() => navigate('/admin')}>유저 관리</div>
        <div style={tabStyle('/admin/stores')} onClick={() => navigate('/admin/stores')}>가게 관리</div>
        <div style={tabStyle('/admin/reservations')} onClick={() => navigate('/admin/reservations')}>예약 관리</div>
      </div>

      <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.03)' }}>
        <h3 style={{ marginTop: 0 }}>📅 예약 관리</h3>
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <input style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '250px' }} placeholder="번호/예약자명/가게명" onChange={e => setFilters({...filters, keyword: e.target.value})} />
          <select style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} onChange={e => setFilters({...filters, status: e.target.value})}>
            <option value="">예약상태(전체)</option>
            {Object.entries(RES_MAP.status).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button onClick={fetchRes} style={{ padding: '10px 20px', background: '#673ab7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>검색</button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: '#888' }}>
              <th style={{ padding: '12px' }}>ID</th><th>예약자</th><th>가게명</th><th>일시</th><th>인원</th><th>테이블</th><th>상태</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f2f2f2' }}>
                <td style={{ padding: '15px' }}>{r.id}</td><td>{r.name}</td><td>{r.storeName}</td>
                <td>{new Date(r.targetDateTime).toLocaleString()}</td><td>{r.headCount}명</td><td>{r.storeTableId}번</td>
                <td>{RES_MAP.status[r.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default ReservationAdmin;