import type JSEncrypt from 'jsencrypt';
import { RequestError, ResponseType, get } from '@profidev/pleiades/backend';
import { browser } from '$app/environment';
import { key as getKey } from '$lib/client';

let encrypt: false | undefined | JSEncrypt = $state(browser && undefined);

export const getEncrypt = () => encrypt;

export const fetchKey = async () => {
  if (encrypt === false) {
    return RequestError.Other;
  }

  const { data: keyData } = await getKey();
  if (!keyData) {
    return undefined;
  }

  const {JSEncrypt} = (await import('jsencrypt'));

  encrypt = new JSEncrypt({ default_key_size: '4096' });
  encrypt.setPublicKey(keyData.key);

  return undefined;
};
const _ = fetchKey();

export const getOidcUrl = async () => {
  const res = await get<{ url: string }>('/api/auth/oidc/url', {
    res_type: ResponseType.Json
  });

  if (typeof res === 'object') {
    return res.url;
  }

  return undefined;
};
