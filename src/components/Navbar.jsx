import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 경로가 /business로 시작하는지 체크
  const isBusinessMode = location.pathname.startsWith('/business');
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");

  const handleLogout = () => {
    axios.post("http://localhost:8081/users/logout")
      .finally(() => {
        alert("로그아웃 되었습니다.");
        localStorage.removeItem("isLoggedIn");
        setIsLoggedIn(false);
        navigate("/");
      });
  };

  return (
    <nav style={{ padding: '15px', background: '#222', display: 'flex', gap: '20px', alignItems: 'center' }}>

      {/* --- 왼쪽 영역: 언제나 HOME 버튼 --- */}
      {/* 비즈니스 모드면 /business로, 아니면 /로 이동 */}
      <Link
        to={isBusinessMode ? "/business" : "/"}
        style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}
      >
        HOME
      </Link>

      {/* --- 오른쪽 영역 --- */}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px', alignItems: 'center' }}>
        {isLoggedIn ? (
          <>
            {/* 모드 전환 버튼: 서로 반대편 세계로 보내줌 */}
            <Link
              to={isBusinessMode ? "/" : "/business"}
              style={{
                color: isBusinessMode ? '#00e5ff' : '#ffeb3b',
                textDecoration: 'none',
                fontSize: '14px',
                border: isBusinessMode ? '1px solid #00e5ff' : '1px solid #ffeb3b',
                padding: '4px 8px',
                borderRadius: '4px'
              }}
            >
              {isBusinessMode ? "사용자 광장" : "비즈니스 광장"}
            </Link>

            {/* 버튼 텍스트만 변경, 디자인은 동일 */}
            <button
              onClick={() => navigate(isBusinessMode ? "/business/my-store" : "/my-page")}
              style={{ background: '#f0f0f0', color: 'black', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
            >
              {isBusinessMode ? "내 가게 관리" : "마이페이지"}
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