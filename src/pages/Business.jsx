import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Business = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const isOwner = user?.role === 'OWNER';

  useEffect(() => {
    if (isOwner) fetchStores();
    else setLoading(false);
  }, [isOwner]);

  const fetchStores = () => {
    setLoading(true);
    axios.get("http://localhost:8081/owners/stores")
      .then(res => setStores(res.data || []))
      .catch(err => console.error("매장 로드 실패:", err))
      .finally(() => setLoading(false));
  };

  const handleUpdateStatus = async (storeId, newStatus) => {
    try {
      await axios.patch(`http://localhost:8081/owners/stores/${storeId}/status`, { status: newStatus });
      fetchStores();
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
            <button onClick={() => navigate("/business/new-store")} style={{ ...addBtnStyle, marginTop: '20px', background: '#52c41a' }}>첫 매장 등록하기</button>
          </div>
        ) : (
          stores.map(store => (
            <StoreCard key={store.id} store={store} navigate={navigate} onUpdateStatus={handleUpdateStatus} />
          ))
        )}
      </div>
    </div>
  );
};

// --- 매장 카드 컴포넌트 ---
const StoreCard = ({ store, navigate, onUpdateStatus }) => {
  const isReady = store.hasSchedule && store.hasTable;
  const isHidden = store.status === 'HIDDEN';
  const isOpen = store.status === 'OPEN';

  // 🔥 [핵심 수정] 안 한 페이지만 골라서 보내주는 로직
    const handleContinueSetup = () => {
      if (!store.hasSchedule) {
        // 1. 스케줄이 없으면 스케줄 페이지로 (테이블 완료 여부 hasTable을 함께 보냄)
        navigate("/business/new-store/schedules", {
          state: {
            storeId: store.id,
            hasTable: store.hasTable // 스케줄 끝난 후 테이블로 보낼지 판단용
          }
        });
      } else if (!store.hasTable) {
        // 2. ★ 중요: 스케줄은 이미 있는데 테이블만 없을 때 ★
        // 여기서 'hasSchedule: true'를 명시적으로 보내야 테이블 페이지에서 '이전' 버튼을 숨깁니다!
        navigate("/business/new-store/tables", {
          state: {
            storeId: store.id,
            hasSchedule: true  // 👈 이 녀석이 테이블 페이지의 '이전' 버튼을 죽이는 스위치입니다!
          }
        });
      }
    };

  const handleToggleOpen = () => {
    if (isHidden) return alert("숨김 상태에서는 영업을 시작할 수 없습니다. 먼저 노출 재개를 해주세요.");
    onUpdateStatus(store.id, isOpen ? 'READY' : 'OPEN');
  };

  const handleToggleHide = () => {
    const msg = isHidden ? "매장을 다시 노출하시겠습니까?" : "매장을 숨기시겠습니까? (손님 앱에서 사라집니다)";
    if (window.confirm(msg)) {
      onUpdateStatus(store.id, isHidden ? 'READY' : 'HIDDEN');
    }
  };

  return (
    <div style={{ ...cardStyle, background: isHidden ? '#f9f9f9' : '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', color: isHidden ? '#999' : '#333' }}>
            {store.name} {isHidden && <span style={tagStyle}>숨김중</span>}
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>{store.address}</p>
        </div>

        {isReady && (
          <div style={{ textAlign: 'center' }}>
            <div onClick={handleToggleOpen} style={toggleBase(isOpen && !isHidden)}>
              <div style={toggleCircle(isOpen && !isHidden)} />
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: isOpen && !isHidden ? '#52c41a' : '#bfbfbf' }}>
              {isOpen && !isHidden ? '영업 중' : '준비 중'}
            </span>
          </div>
        )}
      </div>

      <div style={divider}></div>

      {!isReady ? (
        // ✅ 무조건 스케줄로 가는 게 아니라 handleContinueSetup 실행
        <button onClick={handleContinueSetup} style={actionBtnStyle('#faad14')}>
          ⚠️ 설정 완료하기
        </button>
      ) : (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate("/business/my-store", { state: { storeId: store.id } })} style={actionBtnStyle('#1890ff')}>
            관리·예약
          </button>
          <button onClick={handleToggleHide} style={actionBtnStyle(isHidden ? '#1890ff' : '#ff4d4f', true)}>
            {isHidden ? '노출 재개' : '숨김(중지)'}
          </button>
        </div>
      )}
    </div>
  );
};

// --- Styles (동일) ---
const containerStyle = { maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '30px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' };
const cardStyle = { padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' };
const divider = { height: '1px', background: '#eee', margin: '20px 0' };
const tagStyle = { fontSize: '0.7rem', background: '#eee', color: '#888', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' };
const centerStyle = { textAlign: 'center', padding: '100px' };
const addBtnStyle = { padding: '10px 20px', background: '#1890ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const emptyBoxStyle = { gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: '#f9f9f9', borderRadius: '20px', border: '2px dashed #eee' };
const toggleBase = (active) => ({ width: '40px', height: '20px', backgroundColor: active ? '#52c41a' : '#bfbfbf', borderRadius: '20px', padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: active ? 'flex-end' : 'flex-start', transition: '0.3s', marginBottom: '4px' });
const toggleCircle = () => ({ width: '16px', height: '16px', backgroundColor: '#fff', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' });
const actionBtnStyle = (color, outline = false) => ({ flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', background: outline ? '#fff' : color, color: outline ? color : '#fff', border: `1px solid ${color}` });

export default Business;