import { ResponseType, get, post } from "positron-components/backend";

export const logout = async () => {
  return await post(
    "/api/auth/logout",
  );
};

export const test_token = async () => {
  let res = await get<boolean>("/api/auth/test_token", {
    res_type: ResponseType.Json,
  });
  return typeof res === "boolean" && res;
};

export const get_oidc_url = async () => {
  let res = await get<{ url: string }>('/api/auth/oidc_url', {
    res_type: ResponseType.Json,
  });
  if (typeof res === 'object' && 'url' in res) {
    return res.url;
  }
};