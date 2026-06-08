import { useParams } from "react-router-dom";
import Header from "../components/Header";

const ChatRoomPage = () => {
  const { id } = useParams(); // ex) URL: /chat/rooms/3 -> id = "3" (문자열)
  const roomId = Number(id); // "3" -> 3 (문자열 -> 숫자)

  return (
    <div className="bg-[#0c0c0b] min-h-screen text-white">
      <Header />
      <div className="px-[4.72vw] pt-[3vh]">
        <h1 className="font-bold">Room #{roomId}</h1>

        {/* 메시지 목록 영역: TODO */}
        <div>(Messages will appear here)</div>

        {/* 입력창 영역: TODO */}
        <div>(Input box will be here)</div>
      </div>
    </div>
  );
};

export default ChatRoomPage;
