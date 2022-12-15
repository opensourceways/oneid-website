import { queryCourse, queryToken, queryIDToken } from '../api/api-login';
import { useLogin } from '../stores/login';
import { storeToRefs } from 'pinia';
import { AuthenticationClient } from 'authing-js-sdk';

interface IObject<T = any> {
  [key: string]: T;
}
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
  community = 'openeuler',
  redirectUri = window?.location?.origin
) {
  queryIDToken().then((res: any) => {
    const idToken = res.data.id_token;
    const client1 = createClient(community);
    const logoutUrl = client1.buildLogoutUrl({
      expert: true,
      redirectUri,
      idToken,
    });
    saveUserAuth();
    window!.location!.href = logoutUrl;
  });
}

// 跳转首页
export function goToHome() {
  window?.location?.reload();
}

export function getCodeByUrl(community = 'openeuler') {
  const query = getUrlParam();
  if (query.code && query.state) {
    const param = {
      code: query.code,
      permission: 'sigRead',
      community,
      redirect: `${window?.location?.origin}${window?.location?.pathname}`,
    };
    queryToken(param)
      .then((res: any) => {
        const { data = {} } = res;
        const { token = '' } = data;
        saveUserAuth(token);
        deleteUrlCode(query);
        window.parent.window.location.reload();
      })
      .catch(() => {
        deleteUrlCode(query);
        window.parent.window.location.reload();
      });
  }
}

// 删除url上的code
function deleteUrlCode(query: IObject) {
  const arr = Object.entries(query);
  let url = location.origin + location.pathname;
  if (arr.length > 2) {
    const _arr = arr.filter((item) => !['code', 'state'].includes(item[0]));
    const search = _arr.reduce((pre, next) => {
      pre += `${next[0]}=${next[1]}`;
      return pre;
    }, '?');
    url += search;
  }
  history.replaceState(null, '', url);
}

function getUrlParam(url = window?.location?.search) {
  const param = {} as IObject;
  const arr = url.split('?');
  if (arr[1]) {
    const _arr = arr[1].split('&') || [];
    _arr.forEach((item) => {
      const it = item.split('=');
      if (it.length === 2) {
        const obj = {
          [it[0]]: it[1],
        };
        Object.assign(param, obj);
      }
    });
  }
  return param;
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
    openeulerPlayground: {
      appId: '6219de6da01da1ce012db473',
      appHost: 'https://openeuler.authing.cn',
      redirectUri: 'https://moocstudio.openeuler.sh/',
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
  location.href = `${origin}/login?redirect_uri=${location.href}`;
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

// 刷新页面后store内参数被清除，需重新设定
export function setStoreData(community = 'openeuler') {
  refreshInfo(community);
}

// 刷新后重新请求登录用户信息
export function refreshInfo(community = 'openeuler') {
  const { token } = getUserAuth();
  if (token) {
    const { guardAuthClient } = useStoreData();
    queryCourse({ community }).then((res) => {
      const { data } = res;
      if (Object.prototype.toString.call(data) === '[object Object]') {
        guardAuthClient.value = data;
        saveUserAuth(token);
      }
    });
  }
}

// 判断是否为有效登录状态
export function isLogined() {
  return new Promise((resolve, reject) => {
    const { token } = getUserAuth();
    if (token) {
      queryCourse({ community: 'openeuler' })
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
