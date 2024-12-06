import { queryUser } from '../api/api-center';
import { LoginParams, IObject } from '../@types/interface';
import { determiningType } from '../utils/utils';
import { defineStore, storeToRefs } from 'pinia';
import { ref } from 'vue';

export const useCommon = defineStore('common', () => {
  const lang = ref('zh');
  const changeLang = (state: string) => {
    lang.value = state;
    const app = document.querySelector('html');
    app && (app.lang = state);
  };

  const loginParams = ref<LoginParams>({
    client_id: import.meta.env?.VITE_OPENEULER_APPID,
    redirect_uri: `${import.meta.env.VITE_OPENEULER_WEBSITE}/`,
    response_type: 'code',
    scope: import.meta.env?.VITE_RESPONSE_SCOPE ?? 'openid profile',
    state: import.meta.env?.VITE_RESPONSE_STATE ?? 6223573296,
    nonce: 1831288,
    lang: 'zh',
    response_mode: import.meta.env?.VITE_RESPONSE_MODE ?? 'none',
  });

  const saveLoginParams = (obj: LoginParams) => {
    if (determiningType(obj, 'Object')) {
      Object.entries(obj).forEach((item: any) => {
        if (Object.prototype.hasOwnProperty.call(loginParams.value, item[0])) {
          (loginParams.value as any)[item[0]] = item[1];
        }
      });
    }
  };

  const theme = ref('light');

  // 修改成功后都应刷新用户信息
  const userInfo = ref({} as IObject);
  const initUserInfo = (
    param = { community: import.meta.env?.VITE_COMMUNITY || 'openeuler' }
  ) => {
    queryUser(param).then((data) => {
      userInfo.value = data?.data || {};
      userInfo.value.phoneCountry = `${userInfo.value.phoneCountryCode || ''}${
        userInfo.value.phone
      }`;
    });
  };

  const selectLoginType = ref<'password' | 'code'>('password');
  const setSelectLoginType = (type: 'password' | 'code') => {
    selectLoginType.value = type === 'code' ? 'code' : 'password';
  };
  return {
    lang,
    changeLang,
    loginParams,
    saveLoginParams,
    theme,
    userInfo,
    initUserInfo,
    selectLoginType,
    setSelectLoginType,
  };
});

/**
 * @callback store 将store返回，使用解构赋值接受
 */
export function useCommonData() {
  const counter = useCommon();
  const stores = storeToRefs(counter);
  return stores;
}

export const useCookieStore = defineStore('cookie', {
  state: () => ({
    status: '0',
    version: '20240830',
  }),
  getters: {
    isAllAgreed: (state) => state.status === '1',
  },
});
