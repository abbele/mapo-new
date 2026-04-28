// TODO: evaluate importing MAPO_SESSION_COOKIE from @mapomodule/core (CoreCookieEnum.Session)
// and MAPO_AUTH_* paths from MAPO_DEFAULTS once the cross-package dependency is justified.
export const MAPO_SESSION_COOKIE = "__mapo_session" as const;
export const MAPO_AUTH_LOGIN_PATH = "/api/auth/login" as const;
export const MAPO_AUTH_LOGOUT_PATH = "/api/auth/logout" as const;
export const MAPO_USER_INFO_PATH = "/api/profiles/me" as const;

export const DJANGO_SESSION_COOKIE = "sessionid" as const;
export const CSRF_COOKIE = "csrftoken" as const;

export const CAMOMILLA_COOKIES = [
  MAPO_SESSION_COOKIE,
  DJANGO_SESSION_COOKIE,
  CSRF_COOKIE,
] as const;

export const CAMOMILLA_AUTH_LOGIN_PATH = "/api/camomilla/auth/login/" as const;
export const CAMOMILLA_AUTH_LOGOUT_PATH =
  "/api/camomilla/auth/logout/" as const;
export const CAMOMILLA_USER_CURRENT_PATH =
  "/api/camomilla/users/current/" as const;
export const CAMOMILLA_MEDIA_FOLDERS_PATH =
  "/api/camomilla/media-folders" as const;
export const CAMOMILLA_MEDIA_PATH = "/api/camomilla/media" as const;

export const CAMOMILLA_AUTH_PATHS = [
  CAMOMILLA_AUTH_LOGIN_PATH,
  CAMOMILLA_AUTH_LOGOUT_PATH,
] as const;
