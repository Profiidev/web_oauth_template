import type JSEncrypt from 'jsencrypt';
import { get, RequestError, ResponseType } from '@profidev/pleiades/backend';
import { browser } from '$app/environment';
import { key as getKey } from '$lib/client';

let encrypt: false | undefined | JSEncrypt = $state(browser && undefined);

export const getEncrypt = () => {
  return encrypt;
};

export const fetchKey = async () => {
  if (encrypt === false) {
    return RequestError.Other;
  }

  let { data: keyData } = await getKey();
  if (!keyData) {
    return;
  }

  const JSEncrypt = (await import('jsencrypt')).JSEncrypt;

  encrypt = new JSEncrypt({ default_key_size: '4096' });
  encrypt.setPublicKey(keyData.key);
};
fetchKey();

export const getOidcUrl = async () => {
  let res = await get<{ url: string }>('/api/auth/oidc/url', {
    res_type: ResponseType.Json
  });

  if (typeof res === 'object') {
    return res.url;
  }
};
