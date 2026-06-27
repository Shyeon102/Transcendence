import { store } from "../store";
import { messageReceived } from "../store/slices/chatSlice";

// WebSocket 연결 인스턴스를 ws 변수에 보관
let ws: WebSocket | null = null; // 타입: WebSocket 객체 or null
let isIntentionalClose = false; // 의도적 종료인지 표시하는 깃발
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let lastRoomId: number | null = null; // 재연결 때 어느 방이었는지 기억
let lastToken = "";

// 어느방에 연결할지, 인증토큰 필요
// 새 WebSocket 인스턴스를 만들어 ws에 저장
export const connect = (roomId: number, token: string) => {
  isIntentionalClose = false; // 새로 연결하니 깃발 내림
  lastRoomId = roomId; // 재연결용으로 저장
  lastToken = token;

  // 즉시 실행
  const url = `ws://localhost:8000/ws/chat/${roomId}/?token=${token}`; // 백엔드 url 형식: ws://localhost:8000/ws/chat/{room_id}/?token=JWT토큰
  // 즉시 실행 (연결 시도 시작)
  ws = new WebSocket(url); // 브라우저가 백엔드와 연결 시도, 반환된 인스턴스를 모듈 변수 ws에 저장, 이후 이 ws로 메시지 보내고 받음

  // 등록만. 실행 X
  // 연결 성공 직후
  ws.onopen = () => {
    console.log("WebSocket connected");
  };
  // 서버에서 메시지 도착 (서버가 우리한테 던질때마다)
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data); // JSON 문자열 -> 객체로 변환
    if (data.type === "chat_message") {
      store.dispatch(
        messageReceived({
          id: data.message_id,
          userId: data.user_id,
          username: data.username,
          content: data.message,
          messageType: "message",
          createdAt: data.created_at,
        }),
      );
    }
  };
  // 에러발생
  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
  // 연결끊김
  ws.onclose = () => {
    console.log("WebSocket closed");
    // 의도적 종료가 아니면 1초 뒤 재연결
    if (!isIntentionalClose && lastRoomId !== null) {
      reconnectTimer = setTimeout(() => {
        connect(lastRoomId!, lastToken); // 자기 자신을 다시 호출
      }, 1000);
    }
  };
};

// 인자없이 그냥 끊기
export const disconnect = () => {
  isIntentionalClose = true; // 깃발 올림 -> onclose에서 재연결 안 함
  if (reconnectTimer) {
    clearTimeout(reconnectTimer); // 예약된 재연결 취소
    reconnectTimer = null;
  }
  ws?.close(); // ws가 null이면 호출 안 하고 그냥 넘어감
  ws = null; // 다음에 connect 호출, 새 인스턴스 만들어 할당하기 위해
};

// 보낼 메세지 내용
export const sendMessage = (content: string) => {
  // JSON.stringify: websocket은 문자열(or 바이너리)만 보낼수 있어서 JS객체를 JSON 문자열로 변환
  // ex) const obj = { message: "안녕" };
  // 	 JSON.stringify(obj); -> '{"message":"안녕"}'
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ message: content }));
  }
};
