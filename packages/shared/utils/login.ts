import { queryCourse, queryIDToken, refreshUser } from '../api/api-login';
import { useLogin } from '../stores/login';
import { storeToRefs } from 'pinia';
import { AuthenticationClient } from 'authing-js-sdk';
import { IObject } from '../@types/interface';

const LOGIN_KEYS = {
  USER_TOKEN: '_U_T_',
};

function setCookie(cname: string, cvalue: string, isDelete?: boolean) {
  const deleteStr = isDelete ? 'max-age=0; ' : '';
  const domain = import.meta.env.VITE_COOKIE_DOMAIN;
  const expires = `${deleteStr}path=/; domain=${domain}`;
  document.cookie = `${cname}=${cvalue}; ${expires}`;
}
function getCookie(cname: string) {
  const name = `${cname}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim();
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}
function deleteCookie(cname: string) {
  setCookie(cname, 'null', true);
}

// 存储用户id及token，用于下次登录
export function saveUserAuth(code = '') {
  if (!code) {
    deleteCookie(LOGIN_KEYS.USER_TOKEN);
  } else {
    setCookie(LOGIN_KEYS.USER_TOKEN, code);
  }
}

// 获取用户id及token
export function getUserAuth() {
  const token = getCookie(LOGIN_KEYS.USER_TOKEN) || '';
  if (!token) {
    saveUserAuth();
  }
  return {
    token,
  };
}

// 退出登录
export function logout(
  param = { community: 'openeuler' },
  redirectUri = window?.location?.origin
) {
  queryIDToken(param).then((res: any) => {
    saveUserAuth();
    if (param.community === 'openeuler') {
      const idToken = res.data.id_token;
      const client1 = createClient(param.community);
      const logoutUrl = client1.buildLogoutUrl({
        expert: true,
        redirectUri,
        idToken,
      });
      window.location.href = logoutUrl;
    } else {
      window.location.href = redirectUri;
    }
  });
}

// 跳转首页
export function goToHome() {
  window?.location?.reload();
}

export function createClient(community = 'openeuler', url?: string) {
  const lang = getLanguage();
  const obj: IObject = {
    openeuler: {
      appId: '62679eab0b22b146d2ea0a3a',
      appHost: 'https://datastat.authing.cn',
      redirectUri:
        url || `${window?.location?.origin}${window?.location?.pathname}`,
      lang: lang.language,
    },
  };
  if (obj[community]) {
    return new AuthenticationClient(obj[community]);
  }
  return new AuthenticationClient(obj.openeuler);
}
export function showGuard() {
  const origin = import.meta.env.VITE_LOGIN_ORIGIN;
  const { lang } = getLanguage();
  location.href = `${origin}/login?redirect_uri=${location.href}&lang=${lang}`;
}

// token失效跳转首页
export function tokenFailIndicateLogin() {
  saveUserAuth();
  const { guardAuthClient } = useStoreData();
  guardAuthClient.value = {};
  goToHome();
}

/**
 * @callback store 将store返回，使用解构赋值接受
 */
export function useStoreData() {
  const login = useLogin();
  const stores = storeToRefs(login);
  return stores;
}

// 刷新后重新请求登录用户信息
export function refreshInfo(param = { community: 'openeuler' }) {
  const { token } = getUserAuth();
  if (token) {
    const { guardAuthClient } = useStoreData();
    const query = param.community === 'openeuler' ? queryCourse : refreshUser;
    query(param).then((res) => {
      const { data } = res;
      if (Object.prototype.toString.call(data) === '[object Object]') {
        guardAuthClient.value = data;
        saveUserAuth(token);
      }
    });
  }
}

// 判断是否为有效登录状态
export function isLogined(param = { community: 'openeuler' }) {
  return new Promise((resolve, reject) => {
    const { token } = getUserAuth();
    if (token) {
      const query = param.community === 'openeuler' ? queryCourse : refreshUser;
      query(param)
        .then((res: any) => {
          const { data } = res;
          if (data) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch(() => resolve(false));
    } else {
      resolve(false);
    }
  });
}

export function hasPermission(per: string) {
  const { guardAuthClient } = useStoreData();
  if (Array.isArray(guardAuthClient?.value?.permissions)) {
    return guardAuthClient.value.permissions.includes(per);
  }
  return false;
}

export function getLanguage() {
  if (location.pathname.includes('/zh/')) {
    return {
      lang: 'zh',
      language: 'zh-CN',
    };
  }
  return {
    lang: 'en',
    language: 'en-US',
  };
}

export function setLogoutSession(bool = false) {
  window.sessionStorage.setItem('ISLOGOUT', String(bool));
}

export function getLogoutSession(): boolean {
  const str = window.sessionStorage.getItem('ISLOGOUT');
  return str === 'true';
}
