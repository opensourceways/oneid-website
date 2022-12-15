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
    client_id: '62679eab0b22b146d2ea0a3a',
    redirect_uri: import.meta.env.VITE_OPENEULER_WEBSITE,
    response_type: 'code',
    scope: 'openid profile',
    state: 6223573296,
    nonce: 1831288,
    lang: 'zh',
    response_mode: 'none',
  });

  const saveLoginParams = (obj: LoginParams) => {
    if (determiningType(obj, 'Object')) {
      Object.entries(obj).forEach((item: any) => {
        if (loginParams.value.hasOwnProperty(item[0])) {
          (loginParams.value as any)[item[0]] = item[1];
        }
      });
    }
  };

  const theme = ref('light');

  // 修改成功后都应刷新用户信息
  const userInfo = ref({} as IObject);
  const initUserInfo = () => {
    queryUser().then((data) => {
      userInfo.value = data?.data || {};
    });
  };
  return {
    lang,
    changeLang,
    loginParams,
    saveLoginParams,
    theme,
    userInfo,
    initUserInfo,
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
