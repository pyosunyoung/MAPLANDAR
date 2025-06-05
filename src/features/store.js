import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./user/userSlice";
import uiSlice from "./common/uiSlice";
import calendarSlice from "./calendar/calendarSlice"
const store = configureStore({
  reducer: {
    user: userSlice,
    calendar:calendarSlice,
    ui: uiSlice,
  },
});
export default store;
