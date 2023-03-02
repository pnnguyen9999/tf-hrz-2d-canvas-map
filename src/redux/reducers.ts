import { combineReducers } from "redux";

import counter from "redux/slices/counter";
import user from "./slices/user";

const rootReducer = combineReducers({ counter, user });

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
