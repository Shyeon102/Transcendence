import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ChatMessage {
  id: number;
  userId: number;
  username: string;
  content: string;
  messageType: "message" | "join" | "leave";
  createdAt: string;
}

interface ChatState {
  connected: boolean;
  currentRoomId: number | null;
  messages: ChatMessage[];
  typingUsers: string[];
}

const initialState: ChatState = {
  connected: false,
  currentRoomId: null,
  messages: [],
  typingUsers: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    wsConnected: (state, action: PayloadAction<number>) => {
      state.connected = true;
      state.currentRoomId = action.payload;
    },
    wsDisconnected: (state) => {
      state.connected = false;
      state.currentRoomId = null;
      state.messages = [];
      state.typingUsers = [];
    },
    messageReceived: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    historyLoaded: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    setTypingUsers: (state, action: PayloadAction<string[]>) => {
      state.typingUsers = action.payload;
    },
  },
});

export const {
  wsConnected,
  wsDisconnected,
  messageReceived,
  setTypingUsers,
  historyLoaded,
} = chatSlice.actions;
export default chatSlice.reducer;
