import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // 👈 Navigate 추가 확인!
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import MyPage from './pages/MyPage';
import Business from './pages/Business';
import MyStore from './pages/MyStore';
import StoreRegistration from './pages/StoreRegistration'
import ScheduleRegistration from './pages/ScheduleRegistration'
import StoreTableRegistration from './pages/StoreTableRegistration'
import StoreDetail from './pages/StoreDetail';
import Reservation from './pages/Reservation';
import StoreList from './pages/StoreList';
import UserAdmin from './pages/UserAdmin';
import StoreAdmin from './pages/StoreAdmin';
import ReservationAdmin from './pages/ReservationAdmin';
import Footer from './components/Footer';
import LoginCallback from './pages/LoginCallback';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login-callback" element={<LoginCallback />} />
            <Route path="/stores/:id" element={<StoreDetail />} />
            <Route path="/stores" element={<StoreList />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/my-page" element={<MyPage />} />
              <Route path="/stores/:id/reserve" element={<Reservation />} />
              <Route path="/business" element={<Business />} />
            </Route>

            <Route path="/business" element={<ProtectedRoute />}>
                <Route index element={<Business />} />
                <Route path="new-store" element={<StoreRegistration />} />
            </Route>

            <Route path="/business" element={<ProtectedRoute requiredRole="ROLE_OWNER" />}>
              <Route path="my-store" element={<MyStore />} />
              <Route path="new-store/schedules" element={<ScheduleRegistration />} />
              <Route path="new-store/tables" element={<StoreTableRegistration />} />
            </Route>

            <Route path="/admin" element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
                <Route index element={<UserAdmin />} />
                <Route path="stores" element={<StoreAdmin />} />
                <Route path="reservations" element={<ReservationAdmin />} />
            </Route>

            {/* 💡 모든 정의되지 않은 경로는 홈으로 리다이렉트 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </BrowserRouter>
  );
}

export default App;