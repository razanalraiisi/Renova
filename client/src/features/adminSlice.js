import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// (keep your fetchAdminStats thunk here if you already added it)

const API_BASE = "http://localhost:5000/admin";

export const fetchAdminNotifications = createAsyncThunk(
  "admin/fetchNotifications",
  async (_, { getState, rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/notifications`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      const existing = getState()?.admin?.notifications || [];
      const readIds = new Set(existing.filter((n) => n.isRead).map((n) => n.id));
      return (Array.isArray(data) ? data : []).map((n) => ({
        ...n,
        id: String(n.id),
        isRead: readIds.has(String(n.id)),
      }));
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load notifications");
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    stats: {
      totalUsers: 315,
      collectors: 195,
      disposals: 456,
      recycles: 216,
      upcycles: 135,
    },
    notifications: [],
    status: "idle",
    error: null,
  },
  reducers: {
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    markNotificationRead: (state, action) => {
      const n = state.notifications.find((x) => x.id === action.payload);
      if (n) n.isRead = true;
    },
    seedNotificationsIfEmpty: (state) => {
      // No-op: notifications come from API. Kept for backwards compatibility.
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminNotifications.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAdminNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.notifications = action.payload;
      })
      .addCase(fetchAdminNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error?.message || "Failed to load notifications";
      });
  },
});

export const {
  clearAllNotifications,
  markNotificationRead,
  seedNotificationsIfEmpty,
} = adminSlice.actions;

export default adminSlice.reducer;
