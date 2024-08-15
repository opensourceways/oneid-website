import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLogin = defineStore('login', () => {
  // 登录信息
  const guardAuthClient = ref({} as any);

  // 隐私协议签署时间
  const oneidPrivacyAccepted = ref('');
  const setOneidPrivacyAccepted = (time: string) => {
    oneidPrivacyAccepted.value = time;
  };
  return { guardAuthClient, oneidPrivacyAccepted, setOneidPrivacyAccepted };
});
