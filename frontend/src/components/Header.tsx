import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

const Header = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const canAccessAdmin = Boolean(user?.isStaff) || import.meta.env.DEV;

  return (
    <div className="flex justify-between px-[4.72vw] pt-[3.2vh]">
      <div>
        <button type="button" onClick={() => navigate("/home")}>
          <img
            src="/42-logo.png"
            alt="logo"
            className="h-[3.11vh] w-[2.8vw] object-contain"
          />
        </button>
      </div>

      <div className="flex gap-[2.99vw]">
        <button type="button" className="text-[0.90vw] text-white">
          MEDIA
        </button>
        <button type="button" onClick={() => navigate("/chat/rooms")} className="text-[0.90vw] text-white">
          LIVE CHAT
        </button>
        <button type="button" className="text-[0.90vw] text-white">
          FORUM
        </button>
        {canAccessAdmin ? (
          <button type="button" onClick={() => navigate("/admin")} className="text-[0.90vw] text-white">
            ADMIN
          </button>
        ) : null}
        <button type="button" onClick={() => navigate("/profile")}>
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
