import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getStoredLanguage, type Language } from '../../lib/i18n';

interface UiState {
  theme: 'light' | 'dark';
  language: Language;
  sidebarOpen: boolean;
  activeModal: string | null;
}

const initialState: UiState = {
  theme: 'light',
  language: getStoredLanguage(),
  sidebarOpen: false,
  activeModal: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setLanguage: (state, action: PayloadAction<UiState['language']>) => {
      state.language = action.payload;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { toggleTheme, setLanguage, openModal, closeModal, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
