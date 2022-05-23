import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_ENDPOINT } from "constant/api";

export const getInfoUser = createAsyncThunk("getInfoUser", async () => {
  const res = await axios.get(`${API_ENDPOINT}/users`);
  console.log(res);
  return res.data;
});

const initialState = {};

const user = createSlice({
  name: "user",
  initialState,
  reducers: {},
});

export const {} = user.actions;

export default user.reducer;
