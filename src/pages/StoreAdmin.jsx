import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const STORE_MAP = {
  category: {
    KOREAN: "한식", SNACK: "분식", CHICKEN: "치킨", ASIAN: "동양식",
    WESTERN: "서양식", FASTFOOD: "패스트푸드", BUFFET: "뷔페", FUSION: "퓨전"
  },
  status: { READY: "준비중", OPEN: "영업중", HIDDEN: "일시중지", SHUTDOWN: "폐업" }
};

function StoreAdmin() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ keyword: '', category: '', status: '' });
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0 });
  const [selectedStore, setSelectedStore] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchStores(page, size);
  }, [page]);

  useEffect(() => {
    document.body.style.overflow = (selectedStore || modalLoading) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedStore, modalLoading]);

  const fetchStores = (currentPage = page, currentSize = size) => {
    const params = {
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
      page: currentPage,
      size: currentSize,
    };

    api.get('/admin/stores', { params })
      .then(res => {
        setStores(res.data.content);
        setPageInfo({ totalPages: res.data.totalPages, totalElements: res.data.totalElements });
        if (res.data.content.length === 0) {
          Swal.fire({
            icon: 'info',
            title: '검색 결과 없음',
            text: '조건에 맞는 가게가 존재하지 않습니다.',
            confirmButtonColor: '#673ab7'
          });
        }
      })
      .catch(err => {
        console.error("가게 정보 로드 실패:", err);
      });
  };

  const fetchStoreDetail = (id) => {
    setModalLoading(true);
    api.get(`/admin/stores/${id}`)
      .then(res => {
        setSelectedStore(res.data);
      })
      .catch(err => {
        console.error("가게 상세 로드 실패:", err);
        Swal.fire({ icon: 'error', title: '오류', text: '가게 상세 정보를 불러오지 못했습니다.', confirmButtonColor: '#673ab7' });
      })
      .finally(() => setModalLoading(false));
  };

  const handleSearch = () => {
    setPage(0);
    fetchStores(0, size);
  };

  const handleSizeChange = (newSize) => {
    setSize(newSize);
    setPage(0);
    fetchStores(0, newSize);
  };

  const tabStyle = (path) => ({
    padding: '15px 25px', cursor: 'pointer',
    borderBottom: window.location.pathname === path ? '3px solid #673ab7' : '3px solid transparent',
    color: window.location.pathname === path ? '#673ab7' : '#666', fontWeight: 'bold'
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'OPEN': return '#2e7d32';
      case 'READY': return '#f57c00';
      case 'HIDDEN': return '#d32f2f';
      default: return '#888';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <div style={{ padding: '30px', background: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ display: 'flex', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <div style={tabStyle('/admin')} onClick={() => navigate('/admin')}>유저 관리</div>
        <div style={tabStyle('/admin/stores')} onClick={() => navigate('/admin/stores')}>가게 관리</div>
        <div style={tabStyle('/admin/reservations')} onClick={() => navigate('/admin/reservations')}>예약 관리</div>
      </div>

      <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.03)' }}>
        <h3 style={{ marginTop: 0 }}>가게 관리 (Admin 전용)</h3>

        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '200px' }}
            placeholder="번호/가게명/아이디/사업자번호"
            onChange={e => setFilters({...filters, keyword: e.target.value})}
          />
          <select style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} onChange={e => setFilters({...filters, category: e.target.value})}>
            <option value="">카테고리(전체)</option>
            {Object.entries(STORE_MAP.category).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} onChange={e => setFilters({...filters, status: e.target.value})}>
            <option value="">상태(전체)</option>
            {Object.entries(STORE_MAP.status).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
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

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: '#888' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th>가게명</th>
                <th>점주 아이디</th>
                <th>점주명</th>
                <th>상태</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              {stores.length > 0 ? (
                stores.map(s => (
                  <tr
                    key={s.id}
                    onClick={() => fetchStoreDetail(s.id)}
                    style={{ borderBottom: '1px solid #f2f2f2', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f3f0fa'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ padding: '15px' }}>{s.id}</td>
                    <td style={{ fontWeight: 'bold' }}>{s.name}</td>
                    <td>{s.username}</td>
                    <td>{s.ownerName || '-'}</td>
                    <td style={{ color: getStatusColor(s.status), fontWeight: 'bold' }}>
                      {STORE_MAP.status[s.status]}
                    </td>
                    <td style={{ fontSize: '13px', color: '#666' }}>{formatDate(s.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '50px', color: '#999' }}>등록된 가게 정보가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
      {(selectedStore || modalLoading) && (
        <div
          onClick={() => setSelectedStore(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '12px', padding: '32px',
              width: '520px', maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto',
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
            }}
          >
            {modalLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>불러오는 중...</div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, color: '#333' }}>가게 상세 정보</h3>
                  <button
                    onClick={() => setSelectedStore(null)}
                    style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}
                  >
                    ✕
                  </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {[
                      ['ID', selectedStore.id],
                      ['가게명', selectedStore.name],
                      ['카테고리', STORE_MAP.category[selectedStore.category] || selectedStore.category],
                      ['주소', selectedStore.address || '-'],
                      ['상세주소', selectedStore.detailAddress || '-'],
                      ['우편번호', selectedStore.zipcode || '-'],
                      ['전화번호', selectedStore.phone || '-'],
                      ['점주명', selectedStore.ownerName || '-'],
                      ['점주 아이디', selectedStore.ownerUsername || '-'],
                      ['사업자번호', selectedStore.businessNumber || '-'],
                      ['즐겨찾기', `${selectedStore.favorites}개`],
                      ['상태', STORE_MAP.status[selectedStore.status] || selectedStore.status],
                      ['등록일', formatDate(selectedStore.createdAt)],
                      ['수정일', formatDate(selectedStore.updatedAt)],
                    ].map(([label, value]) => (
                      <tr key={label} style={{ borderBottom: '1px solid #f2f2f2' }}>
                        <td style={{ padding: '10px 8px', color: '#888', fontWeight: 'bold', width: '110px', fontSize: '13px' }}>{label}</td>
                        <td style={{ padding: '10px 8px', color: '#333' }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StoreAdmin;