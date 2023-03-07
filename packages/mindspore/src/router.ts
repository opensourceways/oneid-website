import { createRouter, createWebHistory } from 'vue-router';
import TheCenter from '@/views/user-center/TheCenter.vue';
import TheLogin from '@/views/user-login/TheLogin.vue';
import TheLogout from '@/views/user-login/TheLogout.vue';
import TheRegister from '@/views/user-login/TheRegister.vue';
import NotFound from '@/components/NotFound.vue';
import { useCommon } from 'shared/stores/common';
import { LoginParams } from 'shared/@types/interface';
export const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  // {
  //   path: '/zh/profile',
  //   name: 'zh-profile',
  //   component: TheCenter,
  // },
  // {
  //   path: '/zh/mobile/profile',
  //   name: 'zh_mobile_profile',
  //   component: () => {
  //     return import('@/views/mobile/user-center/TheCenter.vue');
  //   },
  // },
  // {
  //   path: '/zh/mobile/profile/userinfo',
  //   name: 'zh_mobile_profile_userInfo',
  //   component: () => {
  //     return import('@/views/mobile/user-center/components/UserInfo.vue');
  //   },
  // },
  // {
  //   path: '/zh/mobile/profile/binding',
  //   name: 'zh_mobile_profile_binding',
  //   component: () => {
  //     return import('@/views/mobile/user-center/components/AccountBinding.vue');
  //   },
  // },
  // {
  //   path: '/zh/mobile/profile/security',
  //   name: 'zh_mobile_profile_security',
  //   component: () => {
  //     return import(
  //       '@/views/mobile/user-center/components/AccountSecurity.vue'
  //     );
  //   },
  // },
  // {
  //   path: '/en/mobile/profile',
  //   name: 'en_mobile_profile',
  //   component: () => {
  //     return import('@/views/mobile/user-center/TheCenter.vue');
  //   },
  // },
  // {
  //   path: '/en/mobile/profile/userinfo',
  //   name: 'en_mobile_profile_userInfo',
  //   component: () => {
  //     return import('@/views/mobile/user-center/components/UserInfo.vue');
  //   },
  // },
  // {
  //   path: '/en/mobile/profile/binding',
  //   name: 'en_mobile_profile_binding',
  //   component: () => {
  //     return import('@/views/mobile/user-center/components/AccountBinding.vue');
  //   },
  // },
  // {
  //   path: '/en/mobile/profile/security',
  //   name: 'en_mobile_profile_security',
  //   component: () => {
  //     return import(
  //       '@/views/mobile/user-center/components/AccountSecurity.vue'
  //     );
  //   },
  // },
  // {
  //   path: '/en/profile',
  //   name: 'en-profile',
  //   component: TheCenter,
  // },
  {
    path: '/login',
    name: 'login',
    component: TheLogin,
  },
  // {
  //   path: '/logout',
  //   name: 'logout',
  //   component: TheLogout,
  // },
  {
    path: '/register',
    name: 'register',
    component: TheRegister,
  },
  // {
  //   path: '/notfound',
  //   name: 'notfound',
  //   component: NotFound,
  // },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫，可在此处进行页面权限处理
router.beforeEach((to, from, next) => {
  const { changeLang, saveLoginParams } = useCommon();
  if (to.path.startsWith('/en/') || to.query?.lang === 'en') {
    changeLang('en');
  } else {
    changeLang('zh');
  }
  // 登录与注册需校验url参数
  if (['/login', '/register'].includes(to.path)) {
    if (to.query && to.query.redirect_uri) {
      saveLoginParams(to.query as unknown as LoginParams);
    }
  }
  next();
});
