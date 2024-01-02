import { request } from '../plugins/axios';
import type { AxiosResponse } from '../plugins/axios';
import { getHeaderConfig } from './util';

/**
 * 判断用户名或者账号是否存在
 */
export function accountExists(params: any) {
  const url = '/oneid/account/exists';

  return request
    .get(url, {
      global: true,
      $doException: true,
      params,
      ...getHeaderConfig(),
    })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 发送验证码
 */
export function checkLoginAccount(params: any) {
  const url = '/oneid/captcha/checkLogin';

  return request
    .get(url, { global: true, params, ...getHeaderConfig() })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 发送验证码
 */
export function sendCodeCaptcha(params: any) {
  const url = '/oneid/captcha/sendCode';

  return request
    .get(url, { global: true, params, ...getHeaderConfig() })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 邮箱或者手机号注册
 */
export function accountRegisterPost(params: any) {
  const url = '/oneid/register';

  return request.post(url, params).then((res: AxiosResponse) => res.data);
}

/**
 * 邮箱或者手机号登录
 */
export function accountLoginPost(params: any) {
  const url = '/oneid/login';

  return request.post(url, params).then((res: AxiosResponse) => res.data);
}

/**
 * 获取授权的相关回调链接
 */
export function queryCourse(params: object) {
  const url = '/oneid/user/permission';
  return request
    .get(url, { params, global: true, ...getHeaderConfig() })
    .then((res: AxiosResponse) => res.data);
}
/**
 * 获取授权的相关回调链接
 */
export function refreshUser(params: object) {
  const url = '/oneid/user/refresh';
  return request
    .get(url, { params, global: true, ...getHeaderConfig() })
    .then((res: AxiosResponse) => res.data);
}
/**
 * 获取授权token链接
 */
export function queryToken(params: object) {
  const url = '/oneid/token/apply';
  return request
    .get(url, { params, global: true, ...getHeaderConfig() })
    .then((res: AxiosResponse) => res.data);
}
/**
 * 获取idtoken用于退出
 */
export function queryIDToken(params: any) {
  const url = '/oneid/logout';
  return request
    .get(url, { params, ...getHeaderConfig() })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 获取验证图片  以及token
 */
export function reqGet(data: any) {
  const url = '/oneid/captcha/get';
  return request.post(url, data).then((res: AxiosResponse) => res.data);
}

/**
 * 滑动或者点选验证
 */
export function reqCheck(data: any) {
  const url = '/oneid/captcha/check';
  return request
    .post(url, data, { $doException: true, ...getHeaderConfig() })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 校验传入url参数
 */
export function appVerify(params: any) {
  const url = '/oneid/app/verify';
  return request
    .get(url, { params, global: true, ...getHeaderConfig() })
    .then((res: AxiosResponse) => res.data);
}

/**
 * oidc登录成功调用接口
 */
export function authorizeOidc(params: any) {
  const url = '/oneid/oidc/auth';
  return request
    .get(url, {
      params,
      global: true,
      $doException: true,
      ...getHeaderConfig(),
    })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 三方登录
 */
export function providerLogin(params: any) {
  const url = '/oneid/provider/login';
  return request.post(url, params).then((res: AxiosResponse) => res.data);
}

/**
 * 绑定到已有账户
 */
export function providerLink(params: any) {
  const url = '/oneid/provider/link';
  return request.post(url, params).then((res: AxiosResponse) => res.data);
}

/**
 * 获取三方账户用户信息
 */
export function providerRegister(params: any) {
  const url = '/oneid/provider/register';
  return request
    .get(url, { params, ...getHeaderConfig() })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 获取publickey
 */
export function getPublicKey(params: any) {
  const url = '/oneid/public/key';
  return request
    .get(url, { params, ...getHeaderConfig() })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 重置密码验证码
 */
export function resetPwdVerify(params: any) {
  const url = '/oneid/reset/password/verify';
  return request.post(url, params).then((res: AxiosResponse) => res.data);
}

/**
 * 重置密码
 */
export function resetPwd(params: any) {
  const url = '/oneid/reset/password';
  return request.post(url, params).then((res: AxiosResponse) => res.data);
}
