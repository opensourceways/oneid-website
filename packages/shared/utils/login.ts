import { queryCourse, queryIDToken, refreshUser } from '../api/api-login';
import { useLogin } from '../stores/login';
import { storeToRefs } from 'pinia';

const LOGIN_KEYS = {
  USER_TOKEN: '_U_T_',
  USER_INFO: '_U_I_',
};

export function setCookie(cname: string, cvalue: string, haveMaxAge?: boolean) {
  // 过期时间统一半年
  const maxAgeStr = haveMaxAge ? 'max-age=15552000; ' : '';
  const domain = import.meta.env.VITE_COOKIE_DOMAIN || location.hostname;
  const expires = `${maxAgeStr}path=/; domain=${domain}`;
  try {
    document.cookie = `${cname}=${cvalue}; ${expires}`;
  } catch (error) {}
}
export function getCookie(cname: string) {
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

// 全量删除cookie
export function deleteCookie(cname: string) {
  const domain = location.hostname;
  const arr = domain.split('.');
  for (let i = arr.length - 1; i >= 0; i--) {
    const domain = `.${arr.slice(i).join('.')}`;
    document.cookie = `${cname}='null'; max-age=0; path=/; domain=${domain}`;
  }
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

function getLogoutUrl(param: { host: string, idToken: string, redirectUri: string }) {
  const { host, idToken, redirectUri } = param;
  return `${host}/oidc/session/end?id_token_hint=${idToken}&post_logout_redirect_uri=${redirectUri}`
}

// 退出登录
export function logout(
  param: any = { community: import.meta.env?.VITE_COMMUNITY },
  redirectUri?: string,
) {
  if (param.idToken) {
    saveUserAuth();
    const params = {
      host: import.meta.env?.VITE_OPENEULER_APPHOST,
      idToken: param.idToken,
      redirectUri: redirectUri || location.origin,
    }
    window.location.href = getLogoutUrl(params);
    return;
  }
  queryIDToken(param)
    .then((res: any) => {
      saveUserAuth();
      if (['mindspore'].includes(param.community)) {
        const appHost = res.data.client_identifier;
        const params = {
          host: `https://${appHost || 'datastat'}.authing.cn`,
          idToken: res.data.id_token,
          redirectUri: encodeURIComponent(location.href),
        }
        window.location.href = getLogoutUrl(params);
      } else {
        window.location.href = redirectUri || location.origin;
      }
    })
    .catch(() => {
      saveUserAuth();
      if (redirectUri) {
        window.location.href = redirectUri;
      } else {
        goToHome();
      }
    });
}

// 跳转首页
export function goToHome() {
  if (['/login', '/register', '/resetPwd', '/logout', '/authorization'].includes(location.pathname)) {
    const uri = new URL(location.href)
    uri.searchParams.delete('code');
    uri.searchParams.delete('state');
    window.location.href = uri.toString();
  } else {
    window.location.href = '/';
  }
}

export function showGuard() {
  const origin = import.meta.env.VITE_LOGIN_ORIGIN;
  const { lang } = getLanguage();
  location.href = `${origin}/login?redirect_uri=${encodeURIComponent(location.href)}&lang=${lang}`;
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

const setSessionInfo = (data: any) => {
  const { username, photo } = data || {};
  if (username && photo) {
    sessionStorage.setItem(
      LOGIN_KEYS.USER_INFO,
      JSON.stringify({ username, photo })
    );
  }
};
const getSessionInfo = () => {
  let username = '';
  let photo = '';
  try {
    const info = sessionStorage.getItem(LOGIN_KEYS.USER_INFO);
    if (info) {
      const obj = JSON.parse(info) || {};
      username = obj.username || '';
      photo = obj.photo || '';
    }
  } catch (error) {}
  return {
    username,
    photo,
  };
};
const removeSessionInfo = () => {
  sessionStorage.removeItem(LOGIN_KEYS.USER_INFO);
};

// 刷新后重新请求登录用户信息
export function refreshInfo(
  param: any = { community: import.meta.env?.VITE_COMMUNITY || 'openeuler' }
) {
  const { token } = getUserAuth();
  if (token) {
    const { guardAuthClient } = useStoreData();
    guardAuthClient.value = getSessionInfo();
    const query = param.community === 'opengauss' ? refreshUser : queryCourse;
    query(param).then((res) => {
      const { data } = res;
      if (Object.prototype.toString.call(data) === '[object Object]') {
        guardAuthClient.value = data;
        setSessionInfo(data);
      }
    });
  } else {
    removeSessionInfo();
  }
}

// 判断是否为有效登录状态
export function isLogined(
  param: any = { community: import.meta.env?.VITE_COMMUNITY || 'openeuler' }
) {
  return new Promise((resolve, reject) => {
    const { token } = getUserAuth();
    if (token) {
      const query = param.community === 'opengauss' ? refreshUser : queryCourse;
      query(param)
        .then((res: any) => {
          const { data } = res;
          if (data) {
            resolve(data);
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
