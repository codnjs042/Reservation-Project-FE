import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StoreRegistration = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: 'KOREAN',
    address: '',
    phone: '',
    ownerName: '',
    businessNumber: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e, shouldSkip = false) => {
    e.preventDefault();

    if (!formData.name || !formData.address || !formData.businessNumber) {
      return alert("필수 정보를 모두 입력해주세요.");
    }

    axios.post("http://localhost:8081/stores/register", formData)
      .then(res => {
        const newStoreId = res.data.id;

        // ✅ 권한 갱신 (이미 OWNER가 아닐 때만)
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.role !== 'OWNER') {
          const updatedUser = { ...user, role: 'OWNER' };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        if (shouldSkip) {
          alert("가게 기본 정보가 등록되었습니다!");
          navigate("/business");
        } else {
          alert("가게 정보 등록 완료! 다음은 영업시간 설정입니다.");
          navigate(`/business/new-store/schedules`, {
            state: { storeId: newStoreId, hasTable: false }
          });
        }
      })
      .catch(err => {
        console.error("등록 실패", err);
        alert("등록에 실패했습니다.");
      });
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>🏪 새로운 가게 등록</h2>
      <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem', marginBottom: '30px' }}>
        기본 정보를 입력하여 매장을 등록해 주세요.
      </p>

      <form style={formStyle} onSubmit={(e) => e.preventDefault()}>
        {/* 입력 필드 섹션 */}
        <div style={inputGroupStyle}><label style={labelStyle}>가게명</label><input name="name" placeholder="호식이국밥" onChange={handleChange} style={inputStyle} /></div>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>카테고리</label>
          <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
            <option value="KOREAN">한식</option>
            <option value="JAPANESE">일식</option>
            <option value="CHINESE">중식</option>
            <option value="WESTERN">양식</option>
            <option value="ASIAN">아시안</option>
          </select>
        </div>
        <div style={inputGroupStyle}><label style={labelStyle}>주소</label><input name="address" placeholder="주소를 입력하세요" onChange={handleChange} style={inputStyle} /></div>
        <div style={inputGroupStyle}><label style={labelStyle}>전화번호</label><input name="phone" placeholder="전화번호 입력" onChange={handleChange} style={inputStyle} /></div>

        <hr style={{ border: '0.5px solid #eee', margin: '15px 0' }} />
        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '10px' }}>※ 사업자 인증 정보</p>
        <div style={inputGroupStyle}><label style={labelStyle}>사업자명</label><input name="ownerName" placeholder="성함" onChange={handleChange} style={inputStyle} /></div>
        <div style={inputGroupStyle}><label style={labelStyle}>사업자등록번호</label><input name="businessNumber" placeholder="번호 10자리" onChange={handleChange} style={inputStyle} /></div>

        {/* 🔥 하단 버튼: '뒤로가기' 삭제 및 '취소' 버튼 적용 */}
        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
          <button
            type="button"
            onClick={() => navigate("/business")}
            style={backBtnStyle}
          >
            취소
          </button>

          <button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            style={submitBtnStyle}
          >
            등록 및 상세 설정
          </button>
        </div>
      </form>
    </div>
  );
};

// --- 스타일 (동일하게 유지) ---
const containerStyle = { maxWidth: '500px', margin: '40px auto', padding: '40px', background: '#fff', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const inputGroupStyle = { display: 'flex', flexDirection: 'column', gap: '5px' };
const labelStyle = { fontWeight: 'bold', fontSize: '0.9rem', color: '#555' };
const inputStyle = { padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' };
const submitBtnStyle = { flex: 2, padding: '18px', background: '#1890ff', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' };
const backBtnStyle = { flex: 1, padding: '18px', background: '#f5f5f5', color: '#666', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };

export default StoreRegistration;