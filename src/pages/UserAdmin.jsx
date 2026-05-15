import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const USER_MAP = {
  loginType: { LOCAL: "일반", KAKAO: "카카오", NAVER: "네이버", GOOGLE: "구글" },
  role: { USER: "유저", OWNER: "점주", ADMIN: "관리자" },
  status: { ACTIVE: "활성화", DELETED: "비활성화" }
};

function UserAdmin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ keyword: '', loginType: '', role: '', status: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  // 유저 목록 가져오기
  const fetchUsers = () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));

    api.get('/admin/users', { params })
      .then(res => {
        setUsers(res.data);
        if (res.data.length === 0) {
          Swal.fire({
            icon: 'info',
            title: '검색 결과 없음',
            text: '해당 조건에 맞는 유저가 없습니다.',
            confirmButtonColor: '#673ab7'
          });
        }
      })
      .catch(err => {
        console.error("유저 로드 실패:", err);
      });
  };

  const tabStyle = (path) => ({
    padding: '15px 25px', cursor: 'pointer',
    borderBottom: window.location.pathname === path ? '3px solid #673ab7' : '3px solid transparent',
    color: window.location.pathname === path ? '#673ab7' : '#666', fontWeight: 'bold'
  });

  return (
    <div style={{ padding: '30px', background: '#f8f9fa', minHeight: '100vh' }}>
      {/* 탭 메뉴 */}
      <div style={{ display: 'flex', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <div style={tabStyle('/admin')} onClick={() => navigate('/admin')}>유저 관리</div>
        <div style={tabStyle('/admin/stores')} onClick={() => navigate('/admin/stores')}>가게 관리</div>
        <div style={tabStyle('/admin/reservations')} onClick={() => navigate('/admin/reservations')}>예약 관리</div>
      </div>

      {/* 필터 섹션 */}
      <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.03)' }}>
        <h3 style={{ marginTop: 0 }}>👤 유저 관리 (Admin 전용)</h3>
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '200px' }}
            placeholder="번호/이메일/닉네임"
            onChange={e => setFilters({...filters, keyword: e.target.value})}
          />
          <select style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} onChange={e => setFilters({...filters, loginType: e.target.value})}>
            <option value="">로그인타입(전체)</option>
            {Object.entries(USER_MAP.loginType).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} onChange={e => setFilters({...filters, role: e.target.value})}>
            <option value="">권한(전체)</option>
            {Object.entries(USER_MAP.role).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} onChange={e => setFilters({...filters, status: e.target.value})}>
            <option value="">상태(전체)</option>
            {Object.entries(USER_MAP.status).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button
            onClick={fetchUsers}
            style={{ padding: '10px 20px', background: '#673ab7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            검색
          </button>
        </div>

        {/* 테이블 */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: '#888' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th>이메일</th>
              <th>닉네임</th>
              <th>타입</th>
              <th>권한</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f2f2f2' }}>
                  <td style={{ padding: '15px' }}>{u.id}</td>
                  <td>{u.email}</td>
                  <td>{u.nickname}</td>
                  <td>{USER_MAP.loginType[u.loginType]}</td>
                  <td>{USER_MAP.role[u.role]}</td>
                  <td style={{ color: u.status === 'ACTIVE' ? '#2e7d32' : '#d32f2f', fontWeight: 'bold' }}>
                    {USER_MAP.status[u.status]}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '50px', color: '#999' }}>데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserAdmin;