import { useEffect } from "react";
import { connect, disconnect, sendMessage } from "../services/websocketService";

/* websocketService는 React를 전혀 모르는 순수 모듈: 그 함수들을 React 컴포넌트가 쓰기 좋게 감싸주는 어댑터 useWebSocket */
export const useWebSocket = (roomId: number, token: string) => {
  useEffect(() => {
    if (!Number.isInteger(roomId) || roomId <= 0 || !token.trim()) {
      disconnect();
      return;
    }

    connect(roomId, token);

    return () => { // 인자 없는 화살표 함수: 호출되면 disconnect() 실행: 바로 함수 반환
      disconnect();
    };
  }, [roomId, token]);

  return { sendMessage };
};
