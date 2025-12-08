import { configureStore } from "@reduxjs/toolkit";
import UserReducer from './features/UserSlice';
import PostReducer from './features/PostSlice';

export const store=configureStore({
    reducer:{
        users:UserReducer,posts:PostReducer
        
    }
});