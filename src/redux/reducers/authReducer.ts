import { createSlice } from "@reduxjs/toolkit";
import { Token } from "../../types/authModel";

const initialState:Token | null = null as Token | null;

const authorizationReducer = createSlice({
    name: "authorizationReducer",
    initialState,
    reducers: {

    }
})

export default authorizationReducer.reducer;