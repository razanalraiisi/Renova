import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:5000";


// Add User (normal user & collector)
export const addUser = createAsyncThunk(
  "users/addUser",
  async (udata, { rejectWithValue }) => {
    try {
      let url = `${BASE_URL}/registerUser`;
      if (udata.role === "collector") {
        url = `${BASE_URL}/registerCollector`;
      }
      const response = await axios.post(url, udata);
      return response.data.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed."
      );
    }
  }
);

export const getUser = createAsyncThunk(
  "users/getUser",
  async (udata, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, udata);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed."
      );
    }
  }
);


const initialState = {
  user: {},
  message: "",
  isLoading: false,
  isSuccess: false,
  isError: false,
};

export const UserSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    resetState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },

    // ✅ FIX ADDED — CLEAR USER AFTER REGISTRATION
    resetUser: (state) => {
      state.user = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Add User ---
      .addCase(addUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload;
      })
      .addCase(addUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Registration failed.";
      })
      // --- Get User / Login ---
      .addCase(getUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
        state.user = action.payload.user;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Login failed.";
      });
  },
});

export const { resetState, resetUser } = UserSlice.actions;
export default UserSlice.reducer;
