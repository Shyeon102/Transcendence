import { useNavigate } from "react-router-dom";

const Header = () => {
  // 42로고 페이지 이동 함수
  const navigate = useNavigate();
  return (
    <div className="flex justify-between pt-[3.2vh] px-[4.72vw]">
      {/* 왼쪽: 로고 */}
      <div>
        <button onClick={() => navigate(`/home`)}>
          <img
            src="/42-logo.png"
            alt="logo"
            className="w-[2.8vw] h-[3.11vh] object-contain"
          />
        </button>
      </div>
      {/* 오른쪽: MEDIA / LIVE CHAT / FORUM / 프로필 아이콘 */}
      <div className="flex gap-[2.99vw]">
        <button className="text-[0.90vw]">MEDIA</button>
        <button className="text-[0.90vw]">LIVE CHAT</button>
        <button className="text-[0.90vw]">FORUM</button>
        <button>
          <img
            src="/profile.png"
            alt="profile"
            className="w-[1.94vw] h-[3.11vh] object-contain"
          />
        </button>
      </div>
    </div>
  );
};

export default Header;
