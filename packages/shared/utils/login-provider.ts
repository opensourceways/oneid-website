/**
 * 提供三方账号服务方法
 */

import { providerLogin } from '../api/api-login';
import { useCommon, useCommonData } from '../stores/common';
import { haveLoggedIn } from './login-success';
import {
  getParamsFromUrl,
  getSessionStorage,
  getUrlByParams,
  removeSessionStorage,
  setSessionStorage,
} from './utils';

export const LOGIN_URL_PARAMS = '_L_U_P_';
export const USERCENTER_PAGE = 'USERCENTER_PAGE';

// 三方授权
export function threePartsLogin(type: string) {
  const urlParams = getParamsFromUrl();
  setSessionStorage(LOGIN_URL_PARAMS, JSON.stringify(urlParams));
  toThreePartsUri(type);
}

// 三方授权
export function toThreePartsUri(type: string) {
  const { loginParams } = useCommonData();
  const url = `${location.origin}/oneid/provider/authorize?community=${
    import.meta.env?.VITE_COMMUNITY
  }&provider=${type}&client_id=${loginParams.value.client_id}`;
  location.href = url;
}

// 三方授权成功
export function threePartsLoginSuccess() {
  const urlParams = getParamsFromUrl();
  let query: any = {};
  try {
    query = JSON.parse(getSessionStorage(LOGIN_URL_PARAMS) || '{}');
    const { saveLoginParams } = useCommon();
    saveLoginParams(query);
    if (query.redirect_uri) {
      query.redirect_uri = encodeURIComponent(query.redirect_uri);
    }
  } catch (error) {}
  const { loginParams } = useCommonData();
  const params = {
    code: urlParams?.code,
    community: import.meta.env?.VITE_COMMUNITY,
    client_id: query?.client_id || loginParams.value.client_id,
  };
  providerLogin(params).then((data) => {
    removeSessionStorage(LOGIN_URL_PARAMS);
    if (data.msg === 'login_success') {
      haveLoggedIn();
    } else if (data.msg === 'to_bind') {
      const uri = getUrlByParams(`${location.origin}/oauth`, query);
      location.href = uri;
    }
  });
}

// 三方绑定
export function threePartsBind(type: string) {
  const { lang } = useCommonData();
  setSessionStorage(USERCENTER_PAGE, `${lang.value}_binding`);
  toThreePartsUri(type);
}
