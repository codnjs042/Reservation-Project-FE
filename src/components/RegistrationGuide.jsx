import React from 'react';

const RegistrationGuide = ({ step }) => {
  return (
    <div style={leftInfoSide}>
      <div style={brandTag}>Business Intelligence</div>
      <h1 style={leftTitle}>
        {step === 1 && <>매장 등록을 위한<br/>정보를 확인합니다.</>}
        {step === 2 && <>영업 정책을<br/>설정합니다.</>}
        {step === 3 && <>테이블 배치를<br/>구성합니다.</>}
      </h1>
      <p style={leftDesc}>
        {step === 1 && "입력하신 정보는 매장 검색 및 예약 노출에 활용됩니다."}
        {step === 2 && "요일별 영업 시간과 브레이크 타임을 설정하세요."}
        {step === 3 && "매장 내 테이블 종류와 수량을 입력하세요."}
      </p>

      <div style={stepList}>
        <div style={step === 1 ? stepItemActive : stepItem}>
          <span style={stepNum}>01</span>
          <div><strong>매장 기본 정보</strong><br/><small>운영 권한 확보 정보 입력</small></div>
        </div>
        <div style={step === 2 ? stepItemActive : stepItem}>
          <span style={stepNum}>02</span>
          <div><strong>영업 정책 설정</strong><br/><small>예약 시간 및 슬롯 구성</small></div>
        </div>
        <div style={step === 3 ? stepItemActive : stepItem}>
          <span style={stepNum}>03</span>
          <div><strong>레이아웃 배치</strong><br/><small>좌석 및 테이블 관리 설정</small></div>
        </div>
      </div>
    </div>
  );
};

/* --- 좌측 레이아웃 전용 스타일 --- */
const leftInfoSide = { flex: '0 0 320px', backgroundColor: '#F0602A', padding: '40px 30px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box' };
const brandTag = { fontSize: '11px', fontWeight: '700', marginBottom: '12px', letterSpacing: '1.5px', opacity: 0.7, color: '#fff', border: '1px solid rgba(255,255,255,0.4)', display: 'inline-block', padding: '2px 8px', borderRadius: '4px' };
const leftTitle = { fontSize: '24px', fontWeight: '800', lineHeight: '1.3', marginBottom: '12px', color: '#fff' };
const leftDesc = { fontSize: '13px', opacity: 0.7, lineHeight: '1.6', marginBottom: '35px', color: '#fff' };
const stepList = { display: 'flex', flexDirection: 'column', gap: '25px' };
const stepItem = { display: 'flex', alignItems: 'center', gap: '15px', opacity: 0.5 };
const stepItemActive = { ...stepItem, opacity: 1 };
const stepNum = { width: '24px', height: '24px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '11px' };

export default RegistrationGuide;