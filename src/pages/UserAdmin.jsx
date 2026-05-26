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
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchUsers(page, size);
  }, [page]);

  useEffect(() => {
    document.body.style.overflow = (selectedUser || modalLoading) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedUser, modalLoading]);

  const fetchUsers = (currentPage = page, currentSize = size) => {
    const params = {
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
      page: currentPage,
      size: currentSize,
    };

    api.get('/admin/users', { params })
      .then(res => {
        setUsers(res.data.content);
        setPageInfo({ totalPages: res.data.totalPages, totalElements: res.data.totalElements });
        if (res.data.content.length === 0) {
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

  const fetchUserDetail = (id) => {
    setModalLoading(true);
    api.get(`/admin/users/${id}`)
      .then(res => {
        setSelectedUser(res.data);
      })
      .catch(err => {
        console.error("유저 상세 로드 실패:", err);
        Swal.fire({ icon: 'error', title: '오류', text: '유저 상세 정보를 불러오지 못했습니다.', confirmButtonColor: '#673ab7' });
      })
      .finally(() => setModalLoading(false));
  };

  const handleSearch = () => {
    setPage(0);
    fetchUsers(0, size);
  };

  const handleSizeChange = (newSize) => {
    setSize(newSize);
    setPage(0);
    fetchUsers(0, newSize);
  };

  const handleBan = async () => {
    const result = await Swal.fire({
      title: '유저 영구 정지',
      html: `<b>${selectedUser.username}</b>님을 영구 정지하시겠습니까?<br/><span style="color:#888;font-size:13px">가게, 예약, 즐겨찾기 데이터가 모두 정리됩니다.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      confirmButtonText: '영구 정지',
      cancelButtonText: '취소',
    });
    if (!result.isConfirmed) return;

    api.delete(`/admin/users/${selectedUser.id}`)
      .then(() => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: '영구 정지 완료', showConfirmButton: false, timer: 2000, timerProgressBar: true });
        setSelectedUser(null);
        fetchUsers(page, size);
      })
      .catch(err => {
        console.error("영구 정지 실패:", err);
      });
  };

  const tabStyle = (path) => ({
    padding: '15px 25px', cursor: 'pointer',
    borderBottom: window.location.pathname === path ? '3px solid #673ab7' : '3px solid transparent',
    color: window.location.pathname === path ? '#673ab7' : '#666', fontWeight: 'bold'
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' });
  };

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
        <h3 style={{ marginTop: 0 }}>유저 관리 (Admin 전용)</h3>
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '200px' }}
            placeholder="번호/아이디/닉네임/이메일"
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
            onClick={handleSearch}
            style={{ padding: '10px 20px', background: '#673ab7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            검색
          </button>
          <select
            value={size}
            onChange={e => handleSizeChange(Number(e.target.value))}
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', marginLeft: 'auto' }}
          >
            <option value={10}>10건</option>
            <option value={50}>50건</option>
            <option value={100}>100건</option>
          </select>
        </div>

        {/* 테이블 */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: '#888' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th>아이디</th>
              <th>닉네임</th>
              <th>권한</th>
              <th>상태</th>
              <th>가입일</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map(u => (
                <tr
                  key={u.id}
                  onClick={() => fetchUserDetail(u.id)}
                  style={{ borderBottom: '1px solid #f2f2f2', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f3f0fa'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '15px' }}>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.nickname}</td>
                  <td>{USER_MAP.role[u.role]}</td>
                  <td style={{ color: u.status === 'ACTIVE' ? '#2e7d32' : '#d32f2f', fontWeight: 'bold' }}>
                    {USER_MAP.status[u.status]}
                  </td>
                  <td style={{ fontSize: '13px', color: '#666' }}>{formatDate(u.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '50px', color: '#999' }}>데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 페이지네이션 */}
        {pageInfo.totalPages > 0 && (() => {
          const blockSize = 10;
          const startPage = Math.floor(page / blockSize) * blockSize;
          const endPage = Math.min(startPage + blockSize, pageInfo.totalPages);
          const isFirst = page === 0;
          const isLast = page >= pageInfo.totalPages - 1;
          const navBtn = (disabled) => ({
            padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px',
            cursor: disabled ? 'not-allowed' : 'pointer', background: '#fff', color: disabled ? '#ccc' : '#333'
          });
          return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
              <button onClick={() => setPage(0)} disabled={isFirst} style={navBtn(isFirst)}>처음</button>
              <button onClick={() => setPage(p => Math.max(0, p - 10))} disabled={isFirst} style={navBtn(isFirst)}>이전</button>
              {Array.from({ length: endPage - startPage }, (_, i) => startPage + i).map(i => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  style={{
                    padding: '6px 12px',
                    background: page === i ? '#673ab7' : '#fff',
                    color: page === i ? '#fff' : '#333',
                    border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer',
                    fontWeight: page === i ? 'bold' : 'normal',
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(pageInfo.totalPages - 1, p + 10))} disabled={isLast} style={navBtn(isLast)}>다음</button>
              <button onClick={() => setPage(pageInfo.totalPages - 1)} disabled={isLast} style={navBtn(isLast)}>끝</button>
            </div>
          );
        })()}
      </div>

      {/* 상세 모달 */}
      {(selectedUser || modalLoading) && (
        <div
          onClick={() => setSelectedUser(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '12px', padding: '32px',
              width: '480px', maxWidth: '90vw', boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
            }}
          >
            {modalLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>불러오는 중...</div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, color: '#333' }}>유저 상세 정보</h3>
                  <button
                    onClick={() => setSelectedUser(null)}
                    style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}
                  >
                    ✕
                  </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {[
                      ['ID', selectedUser.id],
                      ['아이디', selectedUser.username],
                      ['닉네임', selectedUser.nickname],
                      ['이메일', selectedUser.email || '-'],
                      ['로그인 타입', USER_MAP.loginType[selectedUser.loginType] || selectedUser.loginType],
                      ['소셜 ID', selectedUser.providerId || '-'],
                      ['권한', USER_MAP.role[selectedUser.role] || selectedUser.role],
                      ['상태', USER_MAP.status[selectedUser.status] || selectedUser.status],
                      ['가입일', formatDate(selectedUser.createdAt)],
                      ['수정일', formatDate(selectedUser.updatedAt)],
                    ].map(([label, value]) => (
                      <tr key={label} style={{ borderBottom: '1px solid #f2f2f2' }}>
                        <td style={{ padding: '10px 8px', color: '#888', fontWeight: 'bold', width: '110px', fontSize: '13px' }}>{label}</td>
                        <td style={{ padding: '10px 8px', color: '#333' }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {selectedUser.status === 'ACTIVE' && (
                  <div style={{ marginTop: '24px', textAlign: 'right' }}>
                    <button
                      onClick={handleBan}
                      style={{
                        padding: '10px 22px', background: '#d32f2f', color: '#fff',
                        border: 'none', borderRadius: '6px', fontWeight: 'bold',
                        cursor: 'pointer', fontSize: '14px'
                      }}
                    >
                      영구 정지
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserAdmin;