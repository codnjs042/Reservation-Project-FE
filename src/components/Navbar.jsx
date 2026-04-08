import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const isBusinessPath = location.pathname.startsWith('/business');
  const isAdminPath = location.pathname.startsWith('/admin');

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        setUserRole(userData.role);
      } catch (e) { setUserRole(null); }
    }

    if (!isAdminPath) {
      localStorage.setItem("lastMode", isBusinessPath ? "business" : "user");
    }
  }, [location, isAdminPath, isBusinessPath]);

  const lastMode = localStorage.getItem("lastMode") || "user";
  const isCurrentlyBusiness = isAdminPath ? (lastMode === "business") : isBusinessPath;

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

  // ⭐ 버튼 스타일 수정: fontSize를 16px로 키우고 fontWeight를 살짝 올림
  const navBtnStyle = {
    background: 'none',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: '600', // 가독성을 위해 세미볼드 정도로 변경
    fontSize: '16px',   // 14px -> 16px로 확대
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    letterSpacing: '-0.5px' // 글자가 커진 만큼 자간을 살짝 조여서 세련되게
  };

  return (
    <nav style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>

      {/* 1층: 로고 섹션 */}
      <div style={{
        background: 'white',
        padding: '15px 0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Link to={isAdminPath ? "/admin" : (isCurrentlyBusiness ? "/business" : "/")}>
          <img
            src="/images/logo.png"
            alt="Logo"
            style={{
              height: '50px',
              display: 'block'
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </Link>
      </div>

      {/* 2층: 메뉴 바 (주황색 배경) */}
      <div style={{
        background: '#F0602A',
        padding: '5px 20px', // 글씨가 커진 만큼 바 높이 자연스럽게 조절
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>

        {isLoggedIn ? (
          <>
            {/* 왼쪽 그룹 */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {userRole === 'ADMIN' && (
                <Link to="/admin" style={navBtnStyle}>
                  관리자 광장
                </Link>
              )}
              <Link to={isCurrentlyBusiness ? "/" : "/business"} style={navBtnStyle}>
                {isCurrentlyBusiness ? "사용자 광장" : "비즈니스 광장"}
              </Link>
            </div>

            {/* 오른쪽 그룹 */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  if (lastMode === "business") navigate("/business/my-store");
                  else navigate("/my-page");
                }}
                style={navBtnStyle}
              >
                {lastMode === "business" ? "내 가게 관리" : "마이페이지"}
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