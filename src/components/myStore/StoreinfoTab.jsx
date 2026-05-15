import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import DaumPostcode from 'react-daum-postcode';
import Swal from 'sweetalert2';

// 부모 컴포넌트로부터 실시간 상태 반영을 위한 onStoreStatusUpdate 프롭스를 추가로 받습니다.
const StoreInfoTab = ({ storeId, onStoreStatusUpdate }) => {
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const [storeDetail, setStoreDetail] = useState({
    name: '', phone: '', address: '', detailAddress: '',
    zipcode: '', sigunguCode: '', category: 'KOREAN', status: 'READY'
  });

  const storeStatuses = [
    { key: 'READY', label: '준비중', color: '#faad14' },
    { key: 'OPEN', label: '영업중', color: '#52c41a' },
    { key: 'HIDDEN', label: '일시중지', color: '#ff4d4f' },
    { key: 'SHUTDOWN', label: '폐업', color: '#000000' }
  ];

  const categoryOptions = [
    { key: 'KOREAN', label: '한식' }, { key: 'SNACK', label: '분식' },
    { key: 'CHICKEN', label: '치킨' }, { key: 'ASIAN', label: '동양식' },
    { key: 'WESTERN', label: '서양식' }, { key: 'FASTFOOD', label: '패스트푸드' },
    { key: 'BUFFET', label: '뷔페' }, { key: 'FUSION', label: '퓨전' }
  ];

  // 성공 알림용 토스트 설정
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });

  useEffect(() => {
    if (storeId) {
      api.get(`/owners/stores/${storeId}`)
        .then(res => {
          if (res.data) setStoreDetail(res.data);
        })
        .catch(err => console.error("매장 정보 로드 실패:", err));
    }
  }, [storeId]);

  const handleComplete = (data) => {
    let fullAddress = data.address;
    if (data.addressType === 'R') {
      let extraAddress = '';
      if (data.bname !== '') extraAddress += data.bname;
      if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
      fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
    }
    setStoreDetail({ ...storeDetail, address: fullAddress, zipcode: data.zonecode, sigunguCode: data.sigunguCode });
    setIsPostcodeOpen(false);
  };

  // 운영 상태 변경 로직
  const handleUpdateStoreStatus = async (newStatus) => {
    if (newStatus === 'SHUTDOWN') {
      const result = await Swal.fire({
        title: '매장 폐업 처리',
        text: "정말로 이 매장을 폐업 처리하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#aaa',
        confirmButtonText: '폐업 처리',
        cancelButtonText: '취소'
      });

      if (result.isConfirmed) {
        api.delete(`/owners/stores`, { data: { ids: [storeId] } })
          .then(async () => {
            await Swal.fire({
              icon: 'success',
              title: '폐업 완료',
              text: '매장이 성공적으로 폐업 처리되었습니다.',
              confirmButtonColor: '#333'
            });
            window.location.reload();
          });
      }
      return;
    }

    // 일반 상태 변경 (READY, OPEN, HIDDEN)
    api.patch(`/owners/stores/${storeId}/status`, { status: newStatus })
      .then(() => {
        // 1. 자식 컴포넌트 자체 상태 변경
        setStoreDetail(prev => ({ ...prev, status: newStatus }));

        // 2. 부모 컴포넌트(MyStore)로 상태 변경을 알려 사이드바 UI를 즉시 갱신
        if (typeof onStoreStatusUpdate === 'function') {
          onStoreStatusUpdate(storeId, newStatus);
        }

        Toast.fire({
          icon: 'success',
          title: '상태가 변경되었습니다.'
        });
      })
      .catch(err => {
        console.error("상태 변경 실패:", err);
        Swal.fire({
          icon: 'error',
          title: '변경 실패',
          text: '영업 상태 수정 중 오류가 발생했습니다.',
          confirmButtonColor: '#ff4d4f'
        });
      });
  };

  // 기본 정보 수정 로직
  const handleUpdateStoreInfo = () => {
    api.patch(`/owners/stores/${storeId}`, storeDetail)
      .then(() => {
        Toast.fire({
          icon: 'success',
          title: '매장 정보가 수정되었습니다.'
        });
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: '수정 실패',
          text: '정보 업데이트 중 오류가 발생했습니다.',
          confirmButtonColor: '#ff4d4f'
        });
      });
  };

  return (
    <div style={{ display: 'grid', gap: '30px', width: '100%' }}>
      <section>
        <h4 style={{ margin: '0 0 15px', fontSize: '1rem', fontWeight: 'bold' }}>🏷️ 매장 운영 상태</h4>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', width: '100%' }}>
          {storeStatuses.map(s => {
            const isActive = storeDetail.status === s.key;
            return (
              <button
                key={s.key}
                onClick={() => handleUpdateStoreStatus(s.key)}
                style={{
                  flex: 1, maxWidth: '160px', height: '45px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer',
                  background: isActive ? s.color : '#eee', color: isActive ? '#fff' : '#666',
                  border: 'none', borderRadius: '6px', transition: '0.2s'
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </section>

      <section style={{ display: 'grid', gap: '15px' }}>
        <h4 style={{ margin: '0 0 15px', fontSize: '1rem', fontWeight: 'bold' }}>📝 기본 정보 수정</h4>

        <div>
          <label style={labelStyle}>매장 상호명</label>
          <input style={inputStyle} value={storeDetail.name || ''} onChange={e => setStoreDetail({...storeDetail, name: e.target.value})} />
        </div>

        <div>
          <label style={labelStyle}>매장 카테고리</label>
          <select style={inputStyle} value={storeDetail.category || 'KOREAN'} onChange={e => setStoreDetail({...storeDetail, category: e.target.value})}>
            {categoryOptions.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>대표 연락처</label>
          <input style={inputStyle} value={storeDetail.phone || ''} onChange={e => setStoreDetail({...storeDetail, phone: e.target.value})} />
        </div>

        <div>
          <label style={labelStyle}>위치 주소</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input style={{...inputStyle, width: '100px', background: '#f5f5f5'}} value={storeDetail.zipcode || ''} readOnly />
            <input style={{...inputStyle, flex: 1, background: '#f5f5f5'}} value={storeDetail.address || ''} readOnly />
            <button onClick={() => setIsPostcodeOpen(!isPostcodeOpen)} style={subBtnStyle}>검색</button>
          </div>
          <input style={inputStyle} value={storeDetail.detailAddress || ''} onChange={e => setStoreDetail({...storeDetail, detailAddress: e.target.value})} placeholder="상세 주소" />
          {isPostcodeOpen && (
            <div style={{ border: '1px solid #ddd', marginTop: '10px', borderRadius: '8px', overflow: 'hidden' }}>
              <DaumPostcode onComplete={handleComplete} />
              <button onClick={() => setIsPostcodeOpen(false)} style={{ width: '100%', padding: '10px', border: 'none', background: '#eee', cursor: 'pointer' }}>닫기</button>
            </div>
          )}
        </div>

        <button onClick={handleUpdateStoreInfo} style={saveBtnStyle}>정보 업데이트</button>
      </section>
    </div>
  );
};

// 정적 스타일
const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#666', marginBottom: '8px' };
const inputStyle = { width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' };
const subBtnStyle = { padding: '0 15px', background: '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const saveBtnStyle = { width: '100%', padding: '15px', background: '#1890ff', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };

export default StoreInfoTab;