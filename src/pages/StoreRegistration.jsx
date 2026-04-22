import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import DaumPostcode from 'react-daum-postcode';

const StoreRegistration = () => {
  const navigate = useNavigate();
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'KOREAN',
    address: '',
    detailAddress: '',
    zipcode: '',
    phone: '',
    ownerName: '',
    businessNumber: '',
    // 위경도 필드 제거 (백엔드에서 처리하거나 필요 없는 경우)
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleComplete = (data) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') extraAddress += data.bname;
      if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
      fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
    }

    // 주소 정보만 업데이트
    setFormData(prev => ({
      ...prev,
      address: fullAddress,
      zipcode: data.zonecode,
    }));

    setIsPostcodeOpen(false);
  };

  // StoreRegistration.jsx의 handleSubmit 수정
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.businessNumber) {
      return alert("필수 정보를 입력해주세요.");
    }

    api.post("http://localhost:8081/stores", formData)
      .then(res => {
        alert("가게 정보 등록 완료!");

        // 💡 [중요] 로컬 스토리지의 유저 권한을 OWNER로 강제 업데이트
        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (currentUser) {
          currentUser.role = 'OWNER';
          localStorage.setItem("user", JSON.stringify(currentUser));
        }

        // 그 후 페이지 이동
        navigate(`/business/new-store/schedules`, { state: { storeId: res.data.id } });
      })
      .catch(err => {
        console.error(err);
        // 만약 백엔드에서 "사장님 권한이 필요합니다"라는 에러가 난다면
        // 백엔드에서 가게 등록 API는 USER도 허용하도록 설정되어 있는지 확인해야 합니다.
        alert("등록 중 오류가 발생했습니다.");
      });
  };

  // --- UI Styles ---
  const mainColor = "#F0602A";
  const skyPointColor = "#7DB3D3";

  const containerStyle = {
    maxWidth: '550px',
    margin: '60px auto',
    padding: '50px 40px',
    background: '#fff',
    borderRadius: '24px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
    border: `1px solid #f0f0f0`
  };

  const headerStyle = { textAlign: 'center', marginBottom: '40px' };
  const titleStyle = { fontSize: '1.8rem', fontWeight: '800', color: '#222', marginBottom: '8px' };
  const subTitleStyle = { color: '#999', fontSize: '0.95rem' };

  const inputGroupStyle = { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' };
  const labelStyle = { fontWeight: '700', fontSize: '0.85rem', color: '#444', marginLeft: '4px' };
  const inputStyle = {
    padding: '14px 16px',
    border: '1.5px solid #eee',
    borderRadius: '12px',
    fontSize: '1rem',
    transition: 'all 0.2s',
    outline: 'none',
    backgroundColor: '#fcfcfc',
    width: '100%',
    boxSizing: 'border-box'
  };

  const addrBtnStyle = {
    padding: '0 24px',
    background: skyPointColor,
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  const submitBtnStyle = {
    flex: 2,
    padding: '20px',
    background: mainColor,
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    fontWeight: '800',
    fontSize: '1.1rem'
  };

  const backBtnStyle = {
    flex: 1,
    padding: '20px',
    background: '#f5f5f5',
    color: '#777',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>🏪 가게 등록</h2>
        <p style={subTitleStyle}>파트너님의 소중한 매장 정보를 입력해주세요.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>가게명</label>
          <input name="name" placeholder="매장 이름을 입력하세요" onChange={handleChange} style={inputStyle} />
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>카테고리</label>
          <select name="category" value={formData.category} onChange={handleChange} style={{...inputStyle, cursor: 'pointer'}}>
            <option value="KOREAN">한식</option>
            <option value="JAPANESE">일식</option>
            <option value="CHINESE">중식</option>
            <option value="WESTERN">양식</option>
            <option value="ASIAN">아시안</option>
          </select>
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>매장 위치</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              value={formData.zipcode}
              placeholder="우편번호"
              readOnly
              style={{ ...inputStyle, width: '130px', background: '#f5f5f5' }}
            />
            <button type="button" onClick={() => setIsPostcodeOpen(!isPostcodeOpen)} style={addrBtnStyle}>
              주소 검색
            </button>
          </div>
          <input
            value={formData.address}
            placeholder="주소 검색을 완료해주세요"
            readOnly
            style={{ ...inputStyle, marginBottom: '10px', background: '#f5f5f5' }}
          />
          <input
            name="detailAddress"
            placeholder="상세 주소를 입력하세요"
            onChange={handleChange}
            style={inputStyle}
          />

          {isPostcodeOpen && (
            <div style={{ border: '1px solid #eee', marginTop: '15px', borderRadius: '12px', overflow: 'hidden' }}>
              <DaumPostcode onComplete={handleComplete} />
              <button type="button" onClick={() => setIsPostcodeOpen(false)} style={{ width: '100%', padding: '12px', background: '#eee', border: 'none', cursor: 'pointer' }}>닫기</button>
            </div>
          )}
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>연락처</label>
          <input name="phone" placeholder="010-0000-0000" onChange={handleChange} style={inputStyle} />
        </div>

        <div style={{ margin: '30px 0', height: '1px', background: '#f0f0f0' }} />

        <div style={inputGroupStyle}>
          <label style={labelStyle}>사업자 정보</label>
          <input name="ownerName" placeholder="대표자 성함" onChange={handleChange} style={{...inputStyle, marginBottom: '10px'}} />
          <input name="businessNumber" placeholder="사업자 등록번호 (10자리)" onChange={handleChange} style={inputStyle} />
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
          <button type="button" onClick={() => navigate("/business")} style={backBtnStyle}>이전</button>
          <button type="submit" style={submitBtnStyle}>가게 등록하기</button>
        </div>
      </form>
    </div>
  );
};

export default StoreRegistration;