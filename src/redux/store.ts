import { configureStore } from "@reduxjs/toolkit";
import { genreReducer } from "./genreReducer";
const store = configureStore({
    reducer: {
        genreReducer: genreReducer.slice.reducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;