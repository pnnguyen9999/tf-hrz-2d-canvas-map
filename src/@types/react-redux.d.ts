import "react-redux";

import { RootState } from "../redux/reducers";

declare module "react-redux" {
  interface DefaultRootState extends RootState {}
}
