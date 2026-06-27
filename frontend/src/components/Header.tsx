import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { useLogoutMutation } from '../store/api/authApi';
import { logout as clearAuth } from '../store/slices/authSlice';

const Header = () => {
  const { isAuthenticated, user, accessToken, refreshToken } = useSelector((state: RootState) => state.auth);
  // const user = useSelector((state: RootState) => state.auth.user);
  const canAccessAdmin = Boolean(user?.isStaff) //|| import.meta.env.DEV;
  const hasSession = isAuthenticated && Boolean(user) && Boolean(accessToken);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logout] = useLogoutMutation();
  

  const requireLogin = (path: string) => {
    if (!hasSession) {
      navigate("/login");
      return;
    }
    navigate(path);
  };

  const handleLogout = async () => {
    if (refreshToken) {
      try {
        await logout(refreshToken).unwrap();
      } catch {
        // Local logout should still proceed if the server session is already invalid.
      }
    }
    dispatch(clearAuth());
    navigate('/login');
  };  

  return (
    <div className="flex justify-between px-[4.72vw] pt-[3.2vh]">
      <div>
        <button type="button" onClick={() => navigate("/home")}>
          <span className="text-white font-extrabold tracking-[0.25em] text-[1.6vw] uppercase hover:opacity-80 transition">
            IGOBA
          </span>
        </button>
      </div>

      <div className="flex gap-[2.99vw]">
        <button type="button" onClick={() => requireLogin("/chat/rooms")} className="text-[0.90vw] text-white">
          LIVE CHAT
        </button>
        <button type="button" onClick={() => requireLogin("/community")} className="text-[0.90vw] text-white">
          FORUM
        </button>
        {canAccessAdmin ? (
          <button type="button" onClick={() => navigate("/admin")} className="text-[0.90vw] text-white">
            ADMIN
          </button>
        ) : null}
        {hasSession && (
          <button
            type="button"
            onClick={handleLogout}
            className="text-[0.90vw] text-white"
          >
            LOGOUT
          </button>
        )}
        <button type="button" onClick={() => navigate(hasSession ? "/profile" : "/login")}>
          <img
            src="/profile.png"
            alt="profile"
            className="h-[3.11vh] w-[1.94vw] object-contain"
          />
        </button>
      </div>
    </div>
  );
};

export default Header;
