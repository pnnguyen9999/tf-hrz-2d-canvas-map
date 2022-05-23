import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_ENDPOINT } from "constant/api";
import axiosService from "services/axiosService";

export const getAllUsers = createAsyncThunk("getAllUsers", async () => {
  const res = await axiosService.get(`${API_ENDPOINT}/users`, {});
  console.log(res.data);
  return res.data.data;
});

export const getUserByid = createAsyncThunk(
  "getUserByid",
  async (id: string) => {
    const res = await axiosService.get(`${API_ENDPOINT}/users/${id}`, {});
    console.log(res.data);
    return res.data.data;
  }
);

const initialState = {
  dataUsers: [],
  dataUsersLoading: false,
  dataUserById: {} as any,
  dataUserByIdLoading: false,
};

const user = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    /**
     * @getAllUsers
     */
    builder.addCase(getAllUsers.pending, (state) => {
      state.dataUsersLoading = true;
    });
    builder.addCase(getAllUsers.fulfilled, (state, { payload }) => {
      state.dataUsersLoading = false;
      state.dataUsers = payload;
    });
    builder.addCase(getAllUsers.rejected, (state) => {
      state.dataUsersLoading = false;
    });
    /**
     * @getUserByid
     */
    builder.addCase(getUserByid.pending, (state) => {
      state.dataUserByIdLoading = true;
    });
    builder.addCase(getUserByid.fulfilled, (state, { payload }) => {
      state.dataUserByIdLoading = false;
      state.dataUserById = payload;
    });
    builder.addCase(getUserByid.rejected, (state) => {
      state.dataUserByIdLoading = false;
    });
  },
});

export const {} = user.actions;

export default user.reducer;
