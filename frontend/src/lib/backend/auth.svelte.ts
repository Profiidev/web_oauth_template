import { ContentType, RequestError, ResponseType } from "./types.svelte";
import { get, post } from "./util.svelte";

export const start_auth = async () => {
  let res = await get<string>("/auth/oidc/start_auth", ResponseType.Text);
  if (!Object.values(RequestError).includes(res as RequestError)) {
    return res;
  }
};

export const logout = async () => {
  return await post<undefined>(
    "/auth/logout",
    ResponseType.None,
    ContentType.Json,
    undefined,
  );
};

export const test_token = async () => {
  let res = await get<boolean>("/auth/test_token", ResponseType.Json);
  return typeof res === "boolean" && res;
};