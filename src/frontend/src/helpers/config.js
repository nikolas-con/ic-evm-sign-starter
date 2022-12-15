import { getPrincipalText } from "./utils";

export const LOCAL_SIGNER = process.env.REACT_APP_LOCAL_SIGNER;
export const IC_URL = process.env.REACT_APP_IC_URL ?? "http://localhost:8000";
export const BACKEND_CANISTER_ID =
  process.env.REACT_APP_BACKEND_CANISTER_ID ?? getPrincipalText(1);
export const IDENTITY_CANISTER_ID =
  process.env.REACT_APP_IDENTITY_CANISTER_ID ?? getPrincipalText(3);
