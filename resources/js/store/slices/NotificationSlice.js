import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        unreadCount: 0,
    },
    reducers: {
        setUnreadCount: (state, action) => {
            state.unreadCount = action.payload;
        },
        decrementCount: (state) => {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
        },
        resetCount: (state) => {
            state.unreadCount = 0;
        }
    },
});

export const { setUnreadCount, decrementCount, resetCount } = notificationSlice.actions;
export default notificationSlice.reducer;