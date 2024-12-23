import { request } from '../plugins/axios';
import type { AxiosResponse } from '../plugins/axios';
import { getHeaderConfig } from './util';
import { AxiosRequestHeaders } from 'axios';

/**
 * 获取用户信息
 */
export function queryUser(params: any) {
  const url = '/oneid/personal/center/user';

  return request
    .get(url, { global: true, params, $ignoreLoading: true, ...getHeaderConfig() })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 修改用户信息
 */
export function modifyUser(body: any, params?: any) {
  const url = '/oneid/update/baseInfo';

  return request
    .post(url, body, { params, global: true, ...getHeaderConfig() })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 修改用户信息
 */
export function modifyPhoto(params: any) {
  const url = '/oneid/update/photo';
  const headers = {
    'Content-Type': 'multipart/form-data',
  } as AxiosRequestHeaders;
  return request
    .post(url, params, {
      global: true,
      headers,
    })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 发送验证码 （完善用户信息用到这个接口）
 */
export function sendCode(params: any) {
  const url = '/oneid/sendcode';

  return request
    .get(url, { global: true, params, $ignoreLoading: true, ...getHeaderConfig() })
    .then((res: AxiosResponse) => res.data);
}
/**
 * 发送验证码, post方法
 */
export function sendCodePost(params: any) {
  const url = '/oneid/sendcode';

  return request
    .post(url, params, { global: true, $ignoreLoading: true, ...getHeaderConfig() })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 发送解绑验证码
 */
export function sendUnbindCode(params: any) {
  const url = '/oneid/sendcode/unbind';
  const param = {
    account_type: params.account_type,
    account: params.account,
  };
  if (params.community) {
    Object.assign(param, {
      community: params.community,
      client_id: params.client_id,
    });
  }
  if (params.captchaVerification) {
    Object.assign(param, {
      captchaVerification: params.captchaVerification,
    });
  }
  return request
    .get(url, {
      global: true,
      params: param,
      $ignoreLoading: true,
      ...getHeaderConfig(),
    })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 发送解绑验证码, post方法
 */
export function sendUnbindCodePost(params: any) {
  const url = '/oneid/sendcode/unbind';
  const param = {
    account_type: params.account_type,
    account: params.account,
  };
  if (params.community) {
    Object.assign(param, {
      community: params.community,
      client_id: params.client_id,
    });
  }
  if (params.captchaVerification) {
    Object.assign(param, {
      captchaVerification: params.captchaVerification,
    });
  }
  return request
    .post(url, param, {
      global: true,
      $ignoreLoading: true,
      ...getHeaderConfig(),
    })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 修改绑定邮箱或手机号
 */
export function modifyAccount(params: any) {
  const url = '/oneid/update/account';

  return request
    .get(url, { global: true, params, $ignoreLoading: true, ...getHeaderConfig() })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 修改绑定邮箱或手机号, post方法
 */
export function modifyAccountPost(params: any) {
  const url = '/oneid/update/account';

  return request
    .post(url, params, { global: true, $ignoreLoading: true, ...getHeaderConfig() })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 绑定手机号或者邮箱
 */
export function bindAccount(params: any) {
  const url = '/oneid/bind/account';
  const param = {
    account_type: params.account_type,
    account: params.account,
    code: params.code,
  };
  if (params.community) {
    Object.assign(param, {
      community: params.community,
      client_id: params.client_id,
    });
  }
  return request
    .get(url, {
      global: true,
      params: param,
      $ignoreLoading: true,
      ...getHeaderConfig(),
    })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 绑定手机号或者邮箱, post方法
 */
export function bindAccountPost(params: any) {
  const url = '/oneid/bind/account';
  const param = {
    account_type: params.account_type,
    account: params.account,
    code: params.code,
  };
  if (params.community) {
    Object.assign(param, {
      community: params.community,
      client_id: params.client_id,
    });
  }
  return request
    .post(url, param, {
      global: true,
      $ignoreLoading: true,
      ...getHeaderConfig(),
    })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 解绑手机号或者邮箱
 */
export function unbindAccount(params: any) {
  const url = '/oneid/unbind/account';
  const param = {
    account_type: params.account_type,
    account: params.account,
    code: params.code,
  };
  if (params.community) {
    Object.assign(param, {
      community: params.community,
      client_id: params.client_id,
    });
  }
  return request
    .get(url, {
      global: true,
      params: param,
      $ignoreLoading: true,
      ...getHeaderConfig(),
    })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 解绑手机号或者邮箱, post方法
 */
export function unbindAccountPost(params: any) {
  const url = '/oneid/unbind/account';
  const param = {
    account_type: params.account_type,
    account: params.account,
    code: params.code,
  };
  if (params.community) {
    Object.assign(param, {
      community: params.community,
      client_id: params.client_id,
    });
  }
  return request
    .post(url, param, {
      global: true,
      $ignoreLoading: true,
      ...getHeaderConfig(),
    })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 绑定第三方账号
 */
export function linkAccount() {
  const url = '/oneid/conn/list';

  return request
    .get(url, {
      global: true,
      $ignoreLoading: true,
      ...getHeaderConfig(),
    })
    .then((res: AxiosResponse) => res.data);
}
/**
 * 解绑第三方账号
 */
export function unlinkAccount(params: any) {
  const url = '/oneid/unlink/account';

  return request
    .get(url, {
      global: true,
      params,
      $ignoreLoading: true,
      ...getHeaderConfig(),
    })
    .then((res: AxiosResponse) => res.data);
}
/**
 * 删除账号
 */
export function deleteAccount(
  params = { community: import.meta.env?.VITE_COMMUNITY }
) {
  const url = '/oneid/delete/user';

  return request
    .get(url, { global: true, params, $ignoreLoading: true, ...getHeaderConfig() })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 修改密码
 */
export function updatePassword(params: any) {
  const url = '/oneid/update/password';
  return request
    .post(url, params, getHeaderConfig())
    .then((res: AxiosResponse) => res.data);
}

/**
 * 合并账号
 */
export function mergeUser(params: any, config = {}) {
  const url = '/oneid/merge/user'
  return request
    .post(url, params, { ...config, ...getHeaderConfig()})
    .then((res: AxiosResponse) => res.data)
}
