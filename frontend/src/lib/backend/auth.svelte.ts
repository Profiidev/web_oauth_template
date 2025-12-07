import { ResponseType, get, post } from "positron-components/backend";

export const logout = async () => {
  return await post<undefined>(
    "/api/auth/logout",
    ResponseType.None,
    undefined,
  );
};

export const test_token = async () => {
  let res = await get<boolean>("/api/auth/test_token", ResponseType.Json);
  return typeof res === "boolean" && res;
};

export const get_oidc_url = async () => {
  let res = await get<{ url: string }>('/api/auth/oidc_url', ResponseType.Json);
  if (typeof res === 'object' && 'url' in res) {
    return res.url;
  }
};