import { createRouter, createWebHistory } from 'vue-router';
import TheLogin from '@/views/user-login/TheLogin.vue';
import TheLogout from '@/views/user-login/TheLogout.vue';
import TheRegister from '@/views/user-login/TheRegister.vue';
import NotFound from 'shared/components/NotFound.vue';
import TheResetPwd from '@/views/user-login/TheResetPwd.vue';
import { useCommon } from 'shared/stores/common';
import { LoginParams } from 'shared/@types/interface';
export const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: TheLogin,
  },
  {
    path: '/logout',
    name: 'logout',
    component: TheLogout,
  },
  {
    path: '/notfound',
    name: 'notfound',
    component: NotFound,
  },
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
  } else if (to.path.startsWith('/zh/') || to.query?.lang === 'zh') {
    changeLang('zh');
  }
  // 登录与注册需校验url参数
  if (['/login', '/register', '/resetPwd', '/logout'].includes(to.path)) {
    if (to.query && to.query.redirect_uri) {
      saveLoginParams(to.query as unknown as LoginParams);
    }
  }
  next();
});
