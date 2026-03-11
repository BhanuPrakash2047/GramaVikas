import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/api';

// ─── Async Thunks ────────────────────────────────────────────────

export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (farmerId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/notification/${farmerId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const fetchUnreadNotifications = createAsyncThunk(
  'notification/fetchUnreadNotifications',
  async (farmerId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/notification/${farmerId}/unread`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(
        `/notification/${notificationId}/read`
      );
      return { ...response.data, notificationId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// ─── Initial State ───────────────────────────────────────────────

const initialState = {
  // All notifications
  notifications: [],
  notificationsLoading: false,
  notificationsError: null,

  // Unread notifications
  unreadNotifications: [],
  unreadLoading: false,
  unreadError: null,

  // Mark as read
  markReadLoading: false,
  markReadError: null,
};

// ─── Slice ───────────────────────────────────────────────────────

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearNotificationErrors(state) {
      state.notificationsError = null;
      state.unreadError = null;
      state.markReadError = null;
    },
    clearNotifications(state) {
      state.notifications = [];
      state.unreadNotifications = [];
    },
  },
  extraReducers: (builder) => {
    // ── Fetch All Notifications ──
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.notificationsLoading = true;
        state.notificationsError = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notificationsLoading = false;
        state.notifications = action.payload?.data || [];
        state.notificationsError = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.notificationsLoading = false;
        state.notificationsError =
          action.payload?.message || 'Failed to fetch notifications';
      });

    // ── Fetch Unread Notifications ──
    builder
      .addCase(fetchUnreadNotifications.pending, (state) => {
        state.unreadLoading = true;
        state.unreadError = null;
      })
      .addCase(fetchUnreadNotifications.fulfilled, (state, action) => {
        state.unreadLoading = false;
        state.unreadNotifications = action.payload?.data || [];
        state.unreadError = null;
      })
      .addCase(fetchUnreadNotifications.rejected, (state, action) => {
        state.unreadLoading = false;
        state.unreadError =
          action.payload?.message || 'Failed to fetch unread notifications';
      });

    // ── Mark as Read ──
    builder
      .addCase(markNotificationAsRead.pending, (state) => {
        state.markReadLoading = true;
        state.markReadError = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.markReadLoading = false;
        state.markReadError = null;
        // Optimistically update the notification in both lists
        const readId = action.payload?.notificationId;
        if (readId) {
          // Update in all notifications list
          const idx = state.notifications.findIndex((n) => n.id === readId);
          if (idx !== -1) {
            state.notifications[idx].read = true;
          }
          // Remove from unread list
          state.unreadNotifications = state.unreadNotifications.filter(
            (n) => n.id !== readId
          );
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.markReadLoading = false;
        state.markReadError =
          action.payload?.message || 'Failed to mark notification as read';
      });
  },
});

export const { clearNotificationErrors, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
