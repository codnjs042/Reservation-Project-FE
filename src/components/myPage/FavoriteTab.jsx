import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // 👈 SweetAlert2 임포트

const FavoriteTab = () => {
  const mainColor = "#F0602A"; // 주황 포인트
  const skyPointColor = "#7DB3D3"; // 하늘 포인트

  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  // 성공 알림용 토스트 설정
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });

  const categoryMap = {
    "KOREAN": "한식", "SNACK": "분식", "CHICKEN": "치킨",
    "ASIAN": "동양식", "WESTERN": "서양식", "FASTFOOD": "패스트푸드",
    "BUFFET": "뷔페", "FUSION": "퓨전"
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = () => {
    api.get("/users/me/favorites")
      .then(res => setFavorites(res.data))
      .catch(err => console.error("관심 매장 로딩 실패", err));
  };

  // 관심 매장 해제 로직 (Swal 적용)
  const handleUnfavorite = async (storeId, storeName) => {
    const result = await Swal.fire({
      title: '관심 매장 해제',
      text: `[${storeName}] 매장을 관심 목록에서 삭제할까요?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: mainColor,
      cancelButtonColor: '#aaa',
      confirmButtonText: '해제하기',
      cancelButtonText: '유지하기',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/favorites/${storeId}`);
        Toast.fire({
          icon: 'success',
          title: '관심 매장에서 해제되었습니다.'
        });
        fetchFavorites();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: '해제 실패',
          text: '처리 중 오류가 발생했습니다.',
          confirmButtonColor: '#333'
        });
      }
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerSection}>
        <h3 style={tabTitle(mainColor)}>
          관심 매장 <span style={{color: mainColor, marginLeft: '5px'}}>{favorites.length}</span>
        </h3>
        <p style={subTitleStyle}>자주 찾는 단골 매장들을 모아봤어요.</p>
      </div>

      <div style={listGridStyle}>
        {favorites.length > 0 ? favorites.map(fav => {
          const store = fav.storeResponse || fav.store_response;
          if (!store) return null;

          return (
            <div key={fav.id} style={favCardStyle} onClick={() => navigate(`/stores/${store.id}`)}>
              {/* 왼쪽: 카테고리 & 이름 & 정보 */}
              <div style={infoWrapper}>
                <div style={topInfoRow}>
                  <span style={categoryBadge(skyPointColor)}>
                    {categoryMap[store.category] || store.category}
                  </span>
                  <span style={statusBadge(store.status === 'OPEN')}>
                    {store.status === 'OPEN' ? '● 영업중' : '○ 준비중'}
                  </span>
                </div>

                <h4 style={storeNameStyle}>{store.name}</h4>

                <div style={addressRow}>
                  <span style={iconStyle}>📍</span>
                  <span style={addressTextStyle}>{store.address}</span>
                </div>
              </div>

              {/* 오른쪽: 하트 개수 & 해제 버튼 */}
              <div style={actionWrapper}>
                <div style={favCountBox}>
                  <span style={{fontSize: '12px', color: '#999'}}>Total</span>
                  <span style={favCountText}>❤️ {store.favorites}</span>
                </div>
                <button
                  style={unfavBtnStyle}
                  onClick={(e) => {
                    e.stopPropagation(); // 카드 클릭(이동) 방지
                    handleUnfavorite(store.id, store.name);
                  }}
                >
                  관심 해제
                </button>
              </div>
            </div>
          );
        }) : (
          <div style={noDataContainer}>
            <div style={{fontSize: '40px', marginBottom: '15px'}}>⭐</div>
            <p style={{margin: 0, fontWeight: 'bold', color: '#bbb'}}>아직 관심 매장이 없습니다.</p>
            <p style={{fontSize: '13px', color: '#ccc', marginTop: '5px'}}>마음에 드는 가게를 찜해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* --- 스타일 정의 (기존 유지) --- */
const containerStyle = { padding: '10px 20px' };
const headerSection = { marginBottom: '30px', paddingLeft: '10px' };
const tabTitle = (color) => ({ fontSize: '22px', fontWeight: '900', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '5px' });
const subTitleStyle = { fontSize: '14px', color: '#999', margin: 0 };
const listGridStyle = { display: 'flex', flexDirection: 'column', gap: '16px' };
const favCardStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderRadius: '20px', background: '#fff', border: '1px solid #f0f0f0', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', cursor: 'pointer' };
const infoWrapper = { flex: 1 };
const topInfoRow = { display: 'flex', gap: '8px', marginBottom: '12px' };
const categoryBadge = (color) => ({ fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', background: '#f0f7fb', color: color, borderRadius: '6px' });
const statusBadge = (isOpen) => ({ fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', background: isOpen ? '#f6ffed' : '#fff7e6', color: isOpen ? '#52c41a' : '#fa8c16', borderRadius: '6px' });
const storeNameStyle = { fontSize: '20px', fontWeight: '800', margin: '0 0 10px 0', color: '#1a1a1a' };
const addressRow = { display: 'flex', alignItems: 'center', gap: '5px' };
const iconStyle = { fontSize: '14px' };
const addressTextStyle = { fontSize: '14px', color: '#666' };
const actionWrapper = { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', paddingLeft: '20px', borderLeft: '1px solid #f5f5f5' };
const favCountBox = { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' };
const favCountText = { fontSize: '15px', fontWeight: 'bold', color: '#ff4d4f' };
const unfavBtnStyle = { padding: '8px 16px', background: '#fff', border: '1px solid #eee', color: '#999', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', transition: 'all 0.2s' };
const noDataContainer = { padding: '100px 0', textAlign: 'center', background: '#fafafa', borderRadius: '20px' };

export default FavoriteTab;