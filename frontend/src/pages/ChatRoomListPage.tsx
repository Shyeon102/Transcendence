import {
  useGetChatRoomsQuery,
  useDeleteChatRoomMutation,
} from "../store/api/chatApi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import NewRoomModal from "../components/NewRoomModal";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useI18n } from "../lib/i18n";

const ChatRoomListPage = () => {
  const { data, isLoading, error } = useGetChatRoomsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteChatRoom] = useDeleteChatRoomMutation();
  const user = useSelector((state: RootState) => state.auth.user);
  const { t } = useI18n();

  const handleDelete = async (roomId: number) => {
    if (!confirm(t("chat.deleteRoomConfirm"))) return;
    try {
      await deleteChatRoom(roomId).unwrap();
    } catch {
      alert(t("chat.deleteRoomError"))
    }
  };

  return (
    <div className="bg-[#0c0c0b] min-h-screen text-white">
      {/* 본문 */}
      <div className="px-[4.72vw] pt-[3vh]">
        {/* 페이지 내부 헤더 */}
        <div className="flex justify-between ">
          <h1 className="font-bold">{t("chat.roomList")}</h1>
          <button onClick={() => setIsModalOpen(true)}>{t("chat.newRoom")}</button>
        </div>
        {/* 토론방 목록*/}
        <div className="space-y-3 mt-4">
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
              className="cursor-pointer bg-[#151515] border border-white/10 rounded-xl p-4 transition hover:bg-[#1c1c1c] hover:border-white/20"
            >
              <h2 className="text-lg font-semibold text-white">{room.title}</h2>
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                {room.description || t("chat.nodescription")}
              </p>
              {room.created_by.id === user?.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(room.id);
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  {t("chat.delete")}
                </button>
              )}
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
