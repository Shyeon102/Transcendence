// chat 도메인에서 쓰는 타입들을 모아두는 파일

export interface SimpleUser {
  id: number;
  username: string;
}

export interface ChatRoom {
  id: number; // 토론방의 고유 번호: DB행의 ID
  title: string;
  description: string; // 설명
  created_by: SimpleUser; // 방 만든 user ID, name
  max_members: number;
  is_private: boolean;
  is_active: boolean; // true = 진행중, false = 종료됨
  created_at: string; // 만들어진 시각: ISO 형식의 datetime은 string으로 받는다
  ended_at: string | null; // 종료된 시각, 아직 활성이면 null
}

export interface ChatMessage {
  id: number;
  userId: number;
  username: string;
  content: string;
  messageType: "message" | "join" | "leave";
  createdAt: string;
}
