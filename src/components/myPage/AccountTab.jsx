import React from 'react';
import api from '../../api/api';
import Swal from 'sweetalert2'; // 👈 SweetAlert2 임포트

const AccountTab = () => {
  const mainColor = "#F0602A"; // 주황 포인트

  const handleDeleteAccount = async () => {
    // 1. 탈퇴 전 최종 확인 컨펌창
    const result = await Swal.fire({
      title: '정말 탈퇴하시겠습니까?',
      text: "모든 예약 기록과 개인 정보가 영구 삭제되며 되돌릴 수 없습니다.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff4d4f', // 위험을 알리는 빨간색
      cancelButtonColor: '#aaa',
      confirmButtonText: '네, 탈퇴하겠습니다',
      cancelButtonText: '아니요, 유지할게요',
      reverseButtons: true // 취소 버튼을 왼쪽, 확인 버튼을 오른쪽으로
    });

    if (result.isConfirmed) {
      // 2. 탈퇴 진행 중 로딩 표시
      Swal.fire({
        title: '탈퇴 처리 중...',
        text: '그동안 이용해주셔서 감사합니다.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        await api.delete("/users/me");

        // 3. 탈퇴 성공 알림
        await Swal.fire({
          icon: 'success',
          title: '탈퇴 완료',
          text: '그동안 이용해주셔서 감사합니다. 건강하세요!',
          confirmButtonColor: mainColor
        });

        localStorage.clear();
        window.location.href = "/";
      } catch (err) {
        // 4. 실패 시 에러 알림
        const msg = err.response?.data?.message || "탈퇴 처리 중 오류가 발생했습니다. 다시 시도해주세요.";
        Swal.fire({
          icon: 'error',
          title: '탈퇴 실패',
          text: msg,
          confirmButtonColor: '#333'
        });
      }
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={iconCircle}>⚠️</div>

        <h3 style={titleStyle}>계정을 삭제하시겠어요?</h3>

        <p style={descStyle}>
          탈퇴하시면 <strong>개인 정보 및 이용 기록</strong>이 모두 삭제됩니다.<br />
          아래 내용을 확인하신 후 신중하게 결정해 주세요.
        </p>

        <div style={infoBoxStyle}>
          <div style={infoItem}>
            <span style={bulletStyle}>•</span>
            <span>진행 중인 모든 <strong>예약은 자동으로 취소</strong>됩니다.</span>
          </div>
          <div style={infoItem}>
            <span style={bulletStyle}>•</span>
            <span>찜한 매장, 리뷰 등 <strong>활동 데이터가 영구 삭제</strong>됩니다.</span>
          </div>
          <div style={infoItem}>
            <span style={bulletStyle}>•</span>
            <span>동일한 이메일로 재가입해도 <strong>기존 데이터는 복구 불가</strong>합니다.</span>
          </div>
        </div>

        <div style={actionArea}>
          <button style={cancelBtnStyle} onClick={() => window.history.back()}>
            아니요, 더 써볼래요
          </button>
          <button style={deleteBtnStyle} onClick={handleDeleteAccount}>
            네, 탈퇴할게요
          </button>
        </div>
      </div>
    </div>
  );
};

/* --- 스타일 정의 --- */
const containerStyle = { display: 'flex', justifyContent: 'center', padding: '60px 20px' };
const cardStyle = { textAlign: 'center', maxWidth: '500px', width: '100%', padding: '40px', background: '#fff', borderRadius: '24px', border: '1px solid #f0f0f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' };
const iconCircle = { width: '60px', height: '60px', background: '#fff7e6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 20px' };
const titleStyle = { fontSize: '24px', fontWeight: '800', color: '#1a1a1a', marginBottom: '15px' };
const descStyle = { fontSize: '15px', color: '#666', lineHeight: '1.6', marginBottom: '30px' };
const infoBoxStyle = { textAlign: 'left', background: '#fafafa', padding: '20px 25px', borderRadius: '16px', marginBottom: '40px' };
const infoItem = { display: 'flex', gap: '10px', marginBottom: '12px', fontSize: '14px', color: '#555', lineHeight: '1.4' };
const bulletStyle = { color: '#F0602A', fontWeight: 'bold' };
const actionArea = { display: 'flex', gap: '12px' };
const cancelBtnStyle = { flex: 1, padding: '16px', background: '#f5f5f5', color: '#666', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' };
const deleteBtnStyle = { flex: 1, padding: '16px', background: '#fff1f0', color: '#ff4d4f', border: '1px solid #ffccc7', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' };

export default AccountTab;