import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLogin = defineStore('login', () => {
  // 登录信息
  const guardAuthClient = ref({} as any);
  return { guardAuthClient };
});
