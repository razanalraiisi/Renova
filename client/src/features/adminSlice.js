import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// (keep your fetchAdminStats thunk here if you already added it)

export const fetchAdminNotifications = createAsyncThunk(
  "admin/fetchNotifications",
  async () => {
    // later: GET /admin/notifications
    return [
      {
        id: "n1",
        title: "Collector Registration Request",
        message: "Collector Name: Oman environmental services holding Company",
        timeAgo: "5 hr ago",
        linkTo: "/admin/collectors",
        isRead: false,
      },
      {
        id: "n2",
        title: "Collector Registration Request",
        message: "Collector Name: Recycling Services LLC",
        timeAgo: "1 day ago",
        linkTo: "/admin/collectors",
        isRead: false,
      },
      {
        id: "n3",
        title: "Collector Registration Request",
        message: "Collector Name: Be'ah plastic recycling service",
        timeAgo: "2 days ago",
        linkTo: "/admin/collectors",
        isRead: false,
      },
    ];
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
      if (state.notifications.length === 0) {
        state.notifications = [
          {
            id: "n1",
            title: "Collector Registration Request",
            message: "Collector Name: Oman environmental services holding Company",
            timeAgo: "5 hr ago",
            linkTo: "/admin/collectors",
            isRead: false,
          },
          {
            id: "n2",
            title: "Collector Registration Request",
            message: "Collector Name: Recycling Services LLC",
            timeAgo: "1 day ago",
            linkTo: "/admin/collectors",
            isRead: false,
          },
          {
            id: "n3",
            title: "Collector Registration Request",
            message: "Collector Name: Be'ah plastic recycling service",
            timeAgo: "2 days ago",
            linkTo: "/admin/collectors",
            isRead: false,
          },
        ];
      }
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
