import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

const storedUser =
  JSON.parse(localStorage.getItem("user")) ||
  JSON.parse(sessionStorage.getItem("user"));


// =============================
// REGISTER
// =============================
export const addUser = createAsyncThunk(
  "users/addUser",
  async (udata, { rejectWithValue }) => {
    try {
      let url = `${BASE_URL}/registerUser`;
      if (udata.role === "collector") {
        url = `${BASE_URL}/registerCollector`;
      }

      const payload = { ...udata };
      delete payload.role;

      const response = await axios.post(url, payload);
      return response.data.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed."
      );
    }
  }
);


// =============================
// LOGIN
// =============================
export const getUser = createAsyncThunk(
  "users/getUser",
  async ({ email, password, rememberMe }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, {
        email,
        password,
      });

      const data = response.data;

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("user", JSON.stringify(data.user));

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed."
      );
    }
  }
);


// =============================
// UPDATE PROFILE  🔥 NEW
// =============================
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (updatedData, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/updateUser/${updatedData._id}`,
        updatedData
      );

      // Update storage
      localStorage.setItem("user", JSON.stringify(response.data.user));
      sessionStorage.setItem("user", JSON.stringify(response.data.user));

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Update failed."
      );
    }
  }
);


// =============================
// INITIAL STATE
// =============================
const initialState = {
  user: storedUser || {},
  message: "",
  isLoading: false,
  isSuccess: false,
  isError: false,
};


// =============================
// SLICE
// =============================
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

    resetUser: (state) => {
      state.user = {};
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
    },
  },

  extraReducers: (builder) => {
    builder

      // REGISTER
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

      // LOGIN
      .addCase(getUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Login failed.";
      })

      // UPDATE PROFILE 🔥
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.message = action.payload.message;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetState, resetUser } = UserSlice.actions;
export default UserSlice.reducer;
