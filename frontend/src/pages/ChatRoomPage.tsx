import { useI18n } from "../lib/i18n";
import {
  useGetChatRoomsQuery,
  useInviteToRoomMutation,
} from "../store/api/chatApi";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useWebSocket } from "../hooks/useWebSocket";
import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../services/websocketService";
import { useNavigate } from "react-router-dom";
import { useGetChatMessagesQuery } from "../store/api/chatApi";
import { useDispatch } from "react-redux";
import { historyLoaded } from "../store/slices/chatSlice";
import { useJoinChatRoomMutation } from "../store/api/chatApi";

const ChatRoomPage = () => {
  const { t } = useI18n();
  const { id } = useParams(); // ex) URL: /chat/rooms/3 -> id = "3" (문자열)
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const roomId = Number(id); // "3" -> 3 (문자열 -> 숫자)
  const [joinChatRoom] = useJoinChatRoomMutation();
  const { data: history, refetch } = useGetChatMessagesQuery(roomId, {
    skip: !roomId,
    refetchOnMountOrArgChange: true,
  });
  useEffect(() => {
    if (!roomId) return;
    joinChatRoom(roomId).finally(() => {
      refetch();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);
  const dispatch = useDispatch();
  const { data: rooms } = useGetChatRoomsQuery();
  const room = rooms?.find((r) => r.id === roomId);
  useWebSocket(roomId, token ?? ""); // 우리가 만든 useWebSocket 훅을 두 인자로 호출 / A ?? B : 왼쪽 값이 null or undefined이면 오른쪽 값 사용
  useEffect(() => {
    dispatch(historyLoaded(history ?? []));
  }, [history, roomId, dispatch]);
  const messages = useSelector((state: RootState) => state.chat.messages);
  const user = useSelector((state: RootState) => state.auth.user);
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const [inviteToRoom] = useInviteToRoomMutation();
  const [inviteUserId, setInviteUserId] = useState("");
  const handleInvite = async () => {
    const userId = Number(inviteUserId);
    if (!userId) return;
    try {
      await inviteToRoom({ roomId, userId }).unwrap();
      alert(t("chat.inviteSuccess"));
      setInviteUserId("");
    } catch {
      alert(t("chat.inviteError"));
    }
  };
  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // messages 배열이 바뀔 때마다 (새 메시지 도착) 맨 아래로 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-[#0c0c0b] min-h-screen text-white">
      <div className="px-[4.72vw] pt-[3vh]">
        <button
          onClick={() => navigate("/chat/rooms")}
          className="mb-4 text-sm text-gray-400 hover:text-white transition"
        >
          ←
        </button>
        <h1 className="font-bold">{room?.title ?? `Room #${roomId}`}</h1>
        {room?.is_private && room?.created_by.id === user?.id && (
          <div>
            <input
              type="number"
              value={inviteUserId}
              onChange={(e) => setInviteUserId(e.target.value)}
              placeholder={t("chat.inviteUserIdPlaceholder")}
            />
            <button onClick={handleInvite}>{t("chat.invite")}</button>
          </div>
        )}
        <div>
          {messages.map((msg) => (
            <div key={msg.id}>
              <strong>{msg.username}</strong>: {msg.content}
            </div>
          ))}
          {/* 빈 div, 스크롤 타겟 */}
          <div ref={messagesEndRef} />
        </div>

        <div>
          <input
            value={input} // state값을 화면에 표시
            onChange={(e) => setInput(e.target.value)} // 사용자가 타이핑하면 state업데이트 (컴포넌트 재렌더링)
            className="bg-[#1a1a1a] text-white px-3 py-2 rounded"
            placeholder={t("chat.inputPlaceholder")}
          />
          <button
            onClick={handleSend}
            className="ml-2 bg-[#e8d5b7] text-black px-4 py-2 rounded"
          >{t("chat.send")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoomPage;
