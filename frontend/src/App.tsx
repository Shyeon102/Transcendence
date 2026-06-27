import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import ErrorBoundary from './components/ErrorBoundary'
import InfoPage from './pages/InfoPage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'
import MediaDetailPage from './pages/MediaDetailPage'
import ChatRoomListPage from './pages/ChatRoomListPage'
import ChatRoomPage from './pages/ChatRoomPage'
import AdminPage from './pages/AdminPage';
import MyPagePage from './pages/MyPagePage';
import CommunityPage from './pages/CommunityPage';
import PostDetailPage from './pages/PostDetailPage';
import LegalPage from './pages/LegalPage';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<InfoPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/:id"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/mypage"
              element={
                <PrivateRoute>
                  <MyPagePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminPage />
                </PrivateRoute>
              }
            />
            <Route element={<PrivateRoute />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/media/:id" element={<MediaDetailPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/community/:id" element={<PostDetailPage />} />
              <Route path="/chat/rooms" element={<ChatRoomListPage />} />
              <Route path="/chat/rooms/:id" element={<ChatRoomPage />} />
            </Route>
            <Route path="/privacy" element={<LegalPage documentKey="privacy" />} />
            <Route path="/terms" element={<LegalPage documentKey="terms" />} />
            <Route path="/credits" element={<LegalPage documentKey="credits" />} />

          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
