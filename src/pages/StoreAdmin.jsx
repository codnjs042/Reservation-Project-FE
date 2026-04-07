import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const STORE_MAP = {
  category: { KOREAN: "한식", JAPANESE: "일식", CHINESE: "중식", WESTERN: "양식", ASIAN: "아시안" },
  status: { READY: "준비중", OPEN: "영업중", HIDDEN: "일시중지", SHUTDOWN: "폐업" }
};

function StoreAdmin() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ keyword: '', category: '', status: '' });

  const fetchStores = () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
    axios.get('http://localhost:8081/admin/stores', { params }).then(res => setStores(res.data));
  };

  useEffect(() => { fetchStores(); }, []);

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
        <h3 style={{ marginTop: 0 }}>🏪 가게 관리</h3>
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <input style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '200px' }} placeholder="번호/가게명/사업자번호" onChange={e => setFilters({...filters, keyword: e.target.value})} />
          <select style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} onChange={e => setFilters({...filters, category: e.target.value})}>
            <option value="">카테고리(전체)</option>
            {Object.entries(STORE_MAP.category).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} onChange={e => setFilters({...filters, status: e.target.value})}>
            <option value="">상태(전체)</option>
            {Object.entries(STORE_MAP.status).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button onClick={fetchStores} style={{ padding: '10px 20px', background: '#673ab7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>검색</button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: '#888' }}>
              <th style={{ padding: '12px' }}>ID</th><th>가게명</th><th>카테고리</th><th>주소</th><th>점주</th><th>사업자번호</th><th>상태</th>
            </tr>
          </thead>
          <tbody>
            {stores.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f2f2f2' }}>
                <td style={{ padding: '15px' }}>{s.id}</td><td>{s.name}</td><td>{STORE_MAP.category[s.category]}</td>
                <td>{s.address}</td><td>{s.ownerName}</td><td>{s.businessNumber}</td>
                <td>{STORE_MAP.status[s.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default StoreAdmin;