import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // 📍 현재 경로가 비즈니스 관련인지 확인
  const isBusinessPage = location.pathname.startsWith('/business');
  const isAdminPath = location.pathname.startsWith('/admin');

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        setUserRole(userData.role);
      } catch (e) {
        setUserRole(null);
      }
    }
  }, [location]);

  const handleLogout = () => {
    axios.post("http://localhost:8081/users/logout")
      .finally(() => {
        alert("로그아웃 되었습니다.");
        localStorage.clear();
        setIsLoggedIn(false);
        setUserRole(null);
        navigate("/");
      });
  };

  const navBtnStyle = {
    background: 'none',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '16px',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    letterSpacing: '-0.5px'
  };

  return (
    <nav style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* 1층: 로고 섹션 */}
      <div style={{ background: 'white', padding: '15px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {/* ⭐ 로고 클릭 시 무조건 홈("/")으로 이동 */}
        <Link to="/">
          <img
            src="/images/logo.png"
            alt="Logo"
            style={{ height: '50px', display: 'block' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </Link>
      </div>

      {/* 2층: 메뉴 바 */}
      <div style={{ background: '#F0602A', padding: '5px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

        {isLoggedIn ? (
          <>
            {/* 왼쪽 그룹 */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {userRole === 'ADMIN' && (
                <Link to="/admin" style={navBtnStyle}>관리자 광장</Link>
              )}

              <Link to={isBusinessPage ? "/" : "/business"} style={navBtnStyle}>
                {isBusinessPage ? "사용자 광장" : "비즈니스 광장"}
              </Link>
            </div>

            {/* 오른쪽 그룹 */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  if (isBusinessPage) navigate("/business/my-store");
                  else navigate("/my-page");
                }}
                style={navBtnStyle}
              >
                {isBusinessPage ? "내 가게 관리" : "마이페이지"}
              </button>

              <button onClick={handleLogout} style={navBtnStyle}>
                로그아웃
              </button>
            </div>
          </>
        ) : (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
            <Link to="/login" style={navBtnStyle}>로그인</Link>
            <Link to="/signup" style={navBtnStyle}>회원가입</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;