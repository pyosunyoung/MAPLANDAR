import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./user/userSlice";
import uiSlice from "./common/uiSlice";
// import postSlice from "./post/postSlice";
// import chatSlice from "./chat/chatSlice" -> 나중에 알맞게 수정

const store = configureStore({
  reducer: {
    user: userSlice,
    // post: postSlice,
    // cart: cartSlice,
    ui: uiSlice,
    // order: orderSlice,
    // chat: chatSlice,
  },
});
export default store;
