import { configureStore } from "@reduxjs/toolkit";
import authorizationReducer from '../redux/reducers/authReducer'
const store = configureStore({
    reducer: {
        authorization: authorizationReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;