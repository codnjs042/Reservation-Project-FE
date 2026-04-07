import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // 현재 URL이 어디인지 판단
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

    // ⭐ 핵심: 관리자 페이지가 아닐 때만 마지막 모드(비즈니스/사용자)를 저장함
    if (!isAdminPath) {
      localStorage.setItem("lastMode", isBusinessPath ? "business" : "user");
    }
  }, [location, isAdminPath, isBusinessPath]);

  // 버튼에 표시할 모드 결정 (마지막 모드 기억)
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

  return (
    <nav style={{ padding: '15px', background: '#222', display: 'flex', gap: '20px', alignItems: 'center' }}>

      {/* HOME 버튼: 관리자면 관리자홈, 아니면 현재 모드 유지 */}
      <Link
        to={isAdminPath ? "/admin" : (isCurrentlyBusiness ? "/business" : "/")}
        style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}
      >
        HOME
      </Link>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px', alignItems: 'center' }}>
        {isLoggedIn ? (
          <>
            {/* 1. 관리자 광장 (보라색) */}
            {userRole === 'ADMIN' && (
              <Link
                to="/admin"
                style={{
                  color: '#d1c4e9',
                  textDecoration: 'none',
                  fontSize: '14px',
                  border: '1px solid #b39ddb',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  fontWeight: 'bold'
                }}
              >
                관리자 광장
              </Link>
            )}

            {/* 2. 전환 버튼: 보라색 버튼을 눌러도 이 버튼의 텍스트/색상은 유지됨 */}
            <Link
              to={isCurrentlyBusiness ? "/" : "/business"}
              style={{
                color: isCurrentlyBusiness ? '#00e5ff' : '#ffeb3b',
                textDecoration: 'none',
                fontSize: '14px',
                border: isCurrentlyBusiness ? '1px solid #00e5ff' : '1px solid #ffeb3b',
                padding: '4px 8px',
                borderRadius: '4px'
              }}
            >
              {isCurrentlyBusiness ? "사용자 광장" : "비즈니스 광장"}
            </Link>

            {/* 3. 내 가게 관리 / 마이페이지 버튼 */}
            <button
              onClick={() => {
                if (isAdminPath) navigate("/admin");
                else navigate(isCurrentlyBusiness ? "/business/my-store" : "/my-page");
              }}
              style={{ background: '#f0f0f0', color: 'black', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
            >
              {isAdminPath ? "관리자 홈" : (isCurrentlyBusiness ? "내 가게 관리" : "마이페이지")}
            </button>

            <button onClick={handleLogout} style={{ background: '#f0f0f0', color: 'black', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>로그인</Link>
            <Link to="/signup" style={{ color: 'white', textDecoration: 'none' }}>회원가입</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;