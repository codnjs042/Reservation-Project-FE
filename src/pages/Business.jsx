import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import BusinessStoreCard from '../components/BusinessStoreCard'; // 분리한 컴포넌트 임포트

const Business = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
      console.log("유저 정보 확인:", user); // 이게 찍히는지 보세요
      if (user && user.role === 'OWNER') {
        console.log("조건 통과! fetchStores 실행함");
        fetchStores();
      } else {
        console.log("조건 미달: 사장님이 아님");
        setLoading(false);
      }
    }, []);

  const fetchStores = () => {
    setLoading(true);
    console.log("🚀 요청 보냄: /owners/stores");
    api.get("/owners/stores")
      .then(res => {
        console.log("✅ 서버 응답 데이터:", res.data);
        if (res.data && Array.isArray(res.data)) {
          console.log("📊 데이터 개수:", res.data.length);
          setStores(res.data);
        } else {
          console.error("❌ 데이터가 배열 형식이 아닙니다:", res.data);
        }
      })
      .catch(err => {
        console.error("🔥 API 에러 상세:", err.response || err);
      })
      .finally(() => setLoading(false));
  };

  const handleUpdateStatus = async (storeId, newStatus) => {
    try {
      await api.patch(`/owners/stores/${storeId}/status`, { status: newStatus });
      fetchStores(); // 상태 업데이트 후 목록 새로고침
    } catch (err) {
      alert("상태 변경에 실패했습니다.");
    }
  };

  if (loading) return <div style={centerStyle}>정보 로딩 중...</div>;

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Business Square</h1>
        {stores.length > 0 && (
          <button onClick={() => navigate("/business/new-store")} style={addBtnStyle}>➕ 매장 추가</button>
        )}
      </header>

      <div style={gridStyle}>
        {stores.length === 0 ? (
          <div style={emptyBoxStyle}>
            <p style={{ fontSize: '1.2rem', color: '#333' }}>등록된 매장이 없습니다.</p>
            <p style={{ color: '#888', marginBottom: '20px' }}>첫 번째 매장을 등록하고 비즈니스를 시작하세요!</p>
            <button onClick={() => navigate("/business/new-store")} style={{ ...addBtnStyle, background: '#52c41a' }}>첫 매장 등록하기</button>
          </div>
        ) : (
          stores.map(store => (
            <BusinessStoreCard
              key={store.id}
              store={store}
              navigate={navigate}
              onUpdateStatus={handleUpdateStatus}
            />
          ))
        )}
      </div>
    </div>
  );
};

// 스타일은 기존과 동일 (생략)
const containerStyle = { maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' };
const centerStyle = { textAlign: 'center', padding: '100px' };
const addBtnStyle = { padding: '10px 20px', background: '#1890ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const emptyBoxStyle = { gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: '#f9f9f9', borderRadius: '20px', border: '2px dashed #eee' };

export default Business;