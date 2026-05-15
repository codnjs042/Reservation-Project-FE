import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import DaumPostcode from 'react-daum-postcode';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode'; // 💡 jwtDecode 임포트 확인
import RegistrationGuide from '../components/RegistrationGuide';

const StoreRegistration = () => {
  const navigate = useNavigate();
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category: 'KOREAN', address: '', detailAddress: '',
    zipcode: '', phone: '', ownerName: '', businessNumber: '', sigunguCode: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleComplete = (data) => {
    setFormData(prev => ({ ...prev, address: data.address, zipcode: data.zonecode, sigunguCode: data.sigunguCode }));
    setIsPostcodeOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.address || !formData.businessNumber) {
      return Swal.fire({
        icon: 'warning',
        title: '필수 입력 항목 누락',
        text: '가게명, 주소, 사업자번호는 필수입니다.',
        confirmButtonColor: '#F0602A'
      });
    }

    // 1. 질문 없이 즉시 로딩
    Swal.fire({
      title: '매장 정보 등록 중...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      const res = await api.post("/stores", formData);

      const refreshRes = await api.post('/auth/refresh', null, { withCredentials: true });
      const accessToken = refreshRes.data.accessToken;
      const decoded = jwtDecode(accessToken);

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("role", decoded.role);

      // 3. 성공 Toast 알림
      Swal.fire({
        icon: 'success',
        title: '매장 등록 완료!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true
      });

      navigate(`/business/new-store/schedules`, { state: { storeId: res.data.id } });

    } catch (err) {
      console.error("등록 실패", err);
      const msg = err.response?.data?.message || "등록 중 문제가 발생했습니다.";
      Swal.fire({
        icon: 'error',
        title: '등록 실패',
        text: msg,
        confirmButtonColor: '#F0602A'
      });
    }
  };

  const mainColor = "#F0602A";

  return (
    <div style={splitPageWrapper}>
      <RegistrationGuide step={1} />
      <div style={rightFormSide}>
        <div style={formCard}>
          <form onSubmit={handleSubmit}>
            <div style={sectionBox}>
              <h3 style={secTitle}>🏪 매장 기본 정보</h3>
              <div style={inputGroup}>
                <label style={labelStyle}>가게 이름 *</label>
                <input name="name" placeholder="광장맛집 강남점" onChange={handleChange} style={inputStyle} />
              </div>
              <div style={gridRow}>
                <div style={inputGroup}>
                  <label style={labelStyle}>카테고리 *</label>
                  <select name="category" onChange={handleChange} style={inputStyle}>
                    <option value="KOREAN">한식</option>
                    <option value="SNACK">분식</option>
                    <option value="CHICKEN">치킨</option>
                    <option value="ASIAN">동양식</option>
                    <option value="WESTERN">서양식</option>
                    <option value="FASTFOOD">패스트푸드</option>
                    <option value="BUFFET">뷔페</option>
                    <option value="FUSION">퓨전</option>
                  </select>
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>대표 연락처</label>
                  <input name="phone" placeholder="02-123-4567" onChange={handleChange} style={inputStyle} />
                </div>
              </div>
            </div>

            <div style={sectionBox}>
              <h3 style={secTitle}>📍 위치 정보</h3>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input value={formData.zipcode} placeholder="우편번호" readOnly style={{...inputStyle, flex: 0.4, backgroundColor: '#f5f5f5'}} />
                <button type="button" onClick={() => setIsPostcodeOpen(true)} style={addrBtn}>주소 검색</button>
              </div>
              <input value={formData.address} placeholder="기본 주소" readOnly style={{...inputStyle, marginBottom: '10px', backgroundColor: '#f5f5f5'}} />
              <input name="detailAddress" placeholder="나머지 상세 주소" onChange={handleChange} style={inputStyle} />

              {isPostcodeOpen && (
                <div style={postOverlay}>
                  <DaumPostcode onComplete={handleComplete} />
                  <button type="button" onClick={() => setIsPostcodeOpen(false)} style={postClose}>닫기</button>
                </div>
              )}
            </div>

            <div style={sectionBox}>
              <h3 style={secTitle}>📄 사업자 정보</h3>
              <div style={gridRow}>
                <div style={inputGroup}>
                  <label style={labelStyle}>대표자 성함</label>
                  <input name="ownerName" placeholder="홍길동" onChange={handleChange} style={inputStyle} />
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>사업자 번호 *</label>
                  <input name="businessNumber" placeholder="000-00-00000" onChange={handleChange} style={inputStyle} />
                </div>
              </div>
            </div>

            <div style={btnGroup}>
              <button type="button" onClick={() => navigate(-1)} style={cancelBtn}>이전으로</button>
              <button type="submit" style={submitBtn(mainColor)}>매장 등록 및 계속하기</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* --- 스타일 정의 --- */
const splitPageWrapper = { display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: '#f8fafc' };
const rightFormSide = { flex: 1, backgroundColor: '#f8fafc', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' };
const formCard = { width: '100%', maxWidth: '520px', padding: '0 0 60px 0', boxSizing: 'border-box' };
const sectionBox = { backgroundColor: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.02)', marginBottom: '20px' };
const secTitle = { fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: '#334155' };
const inputStyle = { padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 };
const gridRow = { display: 'flex', gap: '15px', marginBottom: '15px' };
const labelStyle = { fontSize: '13px', fontWeight: '700', color: '#64748b' };
const addrBtn = { padding: '0 20px', backgroundColor: '#7DB3D3', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' };
const btnGroup = { display: 'flex', gap: '15px', marginTop: '40px' };
const cancelBtn = { flex: 1, padding: '18px', borderRadius: '15px', border: 'none', backgroundColor: '#e2e8f0', color: '#475569', fontWeight: '700', cursor: 'pointer' };
const submitBtn = (color) => ({ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: color, color: '#fff', fontWeight: '800', fontSize: '15px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(240, 96, 42, 0.2)' });
const postOverlay = { border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden', marginTop: '10px' };
const postClose = { width: '100%', padding: '10px', backgroundColor: '#eee', border: 'none', cursor: 'pointer' };

export default StoreRegistration;