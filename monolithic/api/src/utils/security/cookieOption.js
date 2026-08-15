import { envs } from "../../lib/env.js";

const baseOptions = {
  httpOnly: true
};

export const getAccessTokenOptions = () => ({
  ...baseOptions,
  secure: envs.NODE_ENV === "production",
  sameSite: envs.NODE_ENV === "production" ? "Strict" : "Lax",
  expires: new Date(Date.now() + 2 * 60 * 60 * 1000)
});

export const getRefreshTokenOptions = () => ({
  ...baseOptions,
  secure: envs.NODE_ENV === "production",
  sameSite: envs.NODE_ENV === "production" ? "Strict" : "Lax",
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
});

export const getClearAccessTokenOptions = () => ({
  ...baseOptions,
  secure: envs.NODE_ENV === "production",
  sameSite: envs.NODE_ENV === "production" ? "Strict" : "Lax"
});

export const getClearRefreshTokenOptions = () => ({
  ...getClearAccessTokenOptions(),
});
