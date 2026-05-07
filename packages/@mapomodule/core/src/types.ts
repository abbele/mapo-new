export interface MapoOptions {
  authLoginUrl?: string;
  userInfoApi?: string;
  logoutUrl?: string;
  loginUrl?: string;
}

export const MAPO_DEFAULTS = {
  authLoginUrl: "/api/auth/login",
  userInfoApi: "/api/profiles/me/",
  logoutUrl: "/api/auth/logout",
  loginUrl: "/login",
} satisfies Required<MapoOptions>;
