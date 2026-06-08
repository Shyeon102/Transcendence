import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ChatMessage } from "../../types/chat";

interface ChatState {
  messages: ChatMessage[]; // 현재 방의 메시지들이 쌓이는 배열
}

const initialState: ChatState = {
  messages: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
	// action.payload: ChatMessage 객체
    messageReceived: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    messagesCleared: (state) => {
      state.messages = [];
    },
  },
});

export const { messageReceived, messagesCleared } = chatSlice.actions;
export default chatSlice.reducer;
