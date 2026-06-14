import Header from "../components/Header";
import { useGetChatRoomsQuery } from "../store/api/chatApi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import NewRoomModal from "../components/NewRoomModal";

const ChatRoomListPage = () => {
  const { data, isLoading, error } = useGetChatRoomsQuery(); // const {RTK Query에서 제공}
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-[#0c0c0b] min-h-screen text-white">
      <Header />
      {/* 본문 */}
      <div className="px-[4.72vw] pt-[3vh]">
        {/* 페이지 내부 헤더 */}
        <div className="flex justify-between ">
          <h1 className="font-bold">Chat Rooms</h1>
          <button onClick={() => setIsModalOpen(true)}>+ New Room</button>
        </div>
        {/* 토론방 목록*/}
        <div>
          {/* 상태에 따라 브라우저 로딩 및 에러처리 */}
          {/* 의미 있는 HTML 구조, DOM 트리에 명확히 들어가기 위해 <div>사용 */}
          {/* 조건부 && 리턴값 */}
          {isLoading && <div>Loading...</div>}
          {error && <div>Error: failed to load rooms</div>}

          {/* data?. : 옵셔널 체이닝. data가 undefined(로딩 중)면 그냥 undefined 반환하고 멈춤 (에러 안 남) */}
          {/* map(): 각 배열 요소 반환 (chatroom1 chatroom2 ...) */}
          {data?.map((room) => (
            <div
              key={room.id}
              onClick={() => navigate(`/chat/rooms/${room.id}`)}
              className="cursor-pointer"
            >
              <h2>{room.title}</h2>
              <p>{room.description}</p>
            </div>
          ))}
        </div>
        <NewRoomModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default ChatRoomListPage;
