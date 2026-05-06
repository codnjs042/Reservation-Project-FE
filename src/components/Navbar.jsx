import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api'; // api.jsx에서 default로 내보냈으므로 { } 없이 가져옵니다.

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const isBusinessPage = location.pathname.startsWith('/business');

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
  }, [location]);

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
      alert("로그아웃 되었습니다.");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    } finally {
      localStorage.clear();
      setIsLoggedIn(false);
      setUserRole(null);
      navigate("/");
    }
  };

  const navBtnStyle = {
    background: 'none', color: 'white', border: 'none', padding: '8px 12px',
    cursor: 'pointer', fontWeight: '600', fontSize: '16px', textDecoration: 'none',
    display: 'inline-flex', alignItems: 'center'
  };

  return (
    <nav style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div style={{ background: 'white', padding: '15px 0', textAlign: 'center' }}>
        <Link to="/"><img src="/images/logo.png" alt="Logo" style={{ height: '50px' }} /></Link>
      </div>
      <div style={{ background: '#F0602A', padding: '5px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isLoggedIn && userRole === 'ADMIN' && <Link to="/admin" style={navBtnStyle}>관리자 광장</Link>}
          <Link to={isBusinessPage ? "/" : "/business"} style={navBtnStyle}>
            {isBusinessPage ? "사용자 광장" : "비즈니스 광장"}
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isLoggedIn ? (
            <>
              <button
                onClick={() => navigate(isBusinessPage ? "/business/my-store" : "/my-page")}
                style={navBtnStyle}
              >
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