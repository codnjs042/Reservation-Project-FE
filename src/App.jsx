import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
      <BrowserRouter>
        <Navbar />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/my-page" element={<MyPage />} />
            <Route path="/stores/:id" element={<StoreDetail />} />
            <Route path="/stores/:id/reserve" element={<Reservation />} />
            <Route path="/business">
                <Route index element={<Business />} />
                <Route path="my-store" element={<MyStore />} />
                <Route path="new-store" element={<StoreRegistration />} />
                <Route path="new-store/schedules" element={<ScheduleRegistration />} />
                <Route path="new-store/tables" element={<StoreTableRegistration />} />
            </Route>
        </Routes>
      </BrowserRouter>
  );
}
export default App;