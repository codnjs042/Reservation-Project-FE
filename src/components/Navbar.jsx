import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState(() => localStorage.getItem("role"));

  // 현재 주소(경로) 상태 체크
  const isAdminPage = location.pathname.startsWith('/admin');
  const isBusinessPage = location.pathname.startsWith('/business');
  // 관리자도 아니고 비즈니스도 아니면 기본 사용자(일반) 페이지로 판단
  const isUserPage = !isAdminPage && !isBusinessPage;

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, [location]);

  const handleLogout = async () => {
    try {
        await api.post("/auth/logout");
    } catch(error){
        console.error("로그아웃 오류:", error);
    }
    finally {
        localStorage.clear();        // 전체 삭제
        window.location.href = "/"; // 메모리 완전 초기화 및 메인 이동
    }
  };

  const handleMyPageClick = () => {
    const targetPath = isBusinessPage ? "/business/my-store" : "/my-page";
    if (location.pathname === targetPath) {
      window.location.reload();
    } else {
      navigate(targetPath);
    }
  };

  // 1. 기본 네비게이션 버튼 스타일
  const navBtnStyle = {
    background: 'none', color: 'white', border: 'none', padding: '8px 16px',
    cursor: 'pointer', fontWeight: '600', fontSize: '16px', textDecoration: 'none',
    display: 'inline-flex', alignItems: 'center', borderRadius: '8px',
    transition: 'all 0.2s ease' // 마우스 올리거나 활성화될 때 부드럽게 변하도록 설정
  };

  // 2. 현재 활성화된(눌린 듯한) 광장 버튼에 부여할 입체감 스타일 고도화
  const activeSquareStyle = {
    background: 'rgba(255, 255, 255, 0.25)', // 옅은 흰색/주황빛 배경 효과
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(255, 255, 255, 0.2)', // 들어간 듯한 안쪽 그림자 + 아래쪽 옅은 빛그림자
    fontWeight: '800', // 글자 더 두껍게
  };

  return (
    <nav style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* 상단 로고 영역 */}
      <div style={{ background: 'white', padding: '15px 0', textAlign: 'center' }}>
        <Link to="/"><img src="/images/logo.png" alt="Logo" style={{ height: '50px' }} /></Link>
      </div>

      {/* 하단 주황색 메뉴 바 */}
      <div style={{ background: '#F0602A', padding: '6px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* 왼쪽 영역: 광장 시리즈 버튼들 */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* 1. 관리자 광장 (ROLE_ADMIN일 때만 노출) */}
          {userRole === 'ROLE_ADMIN' && (
            <Link
              to="/admin"
              style={{ ...navBtnStyle, ...(isAdminPage ? activeSquareStyle : {}) }}
            >
              관리자 광장
            </Link>
          )}

          {/* 2. 사용자 광장 (상시 노출) */}
          <Link
            to="/"
            style={{ ...navBtnStyle, ...(isUserPage ? activeSquareStyle : {}) }}
          >
            사용자 광장
          </Link>

          {/* 3. 비즈니스 광장 (상시 노출) */}
          <Link
            to="/business"
            style={{ ...navBtnStyle, ...(isBusinessPage ? activeSquareStyle : {}) }}
          >
            비즈니스 광장
          </Link>
        </div>

        {/* 오른쪽 영역: 마이페이지 및 로그인/로그아웃 */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {userRole ? (
            <>
              <button onClick={handleMyPageClick} style={navBtnStyle}>
                {isBusinessPage ? "내 가게 관리" : "마이페이지"}
              </button>
              <button onClick={handleLogout} style={navBtnStyle}>로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login" style={navBtnStyle}>로그인</Link>
              <Link to="/signup" style={navBtnStyle}>회원가입</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;