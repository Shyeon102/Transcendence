import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  language: 'ko' | 'en' | 'fr'    // 현재 언어
  activeModal: string | null        // 열려있는 모달
}

const initialState: UiState = {
  language: 'ko',
  activeModal: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // 언어 변경
    setLanguage: (state, action: PayloadAction<'ko' | 'en' | 'fr'>) => {
      state.language = action.payload
    },
    // 모달 열기
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload
    },
    // 모달 닫기
    closeModal: (state) => {
      state.activeModal = null
    },
  },
})

export const { setLanguage, openModal, closeModal } = uiSlice.actions
export default uiSlice.reducer