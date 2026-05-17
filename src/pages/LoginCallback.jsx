import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2'; // 👈 SweetAlert2 임포트 추가

const LoginCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // 의존성 배열에 있으므로 명시적으로 유지

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');

    if (accessToken) {
      const decoded = jwtDecode(accessToken);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("role", decoded.role);

      // 부모 창(원래 보던 서비스 탭) 새로고침
      if (window.opener) {
        window.opener.location.assign('/');
      }

      window.close();

    } else {
      Swal.fire({
        icon: 'error',
        title: '로그인 실패',
        text: '인증 정보가 올바르지 않습니다. 다시 시도해 주세요.',
        confirmButtonColor: '#F0602A', // 서비스 메인 컬러와 맞춤
      }).then((result) => {
        if (result.isConfirmed || result.isDismissed) {
          window.close();
        }
      });
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>로그인 처리 중입니다. 잠시만 기다려주세요...</p>
    </div>
  );
};

export default LoginCallback;