import { request } from '../plugins/axios';
import type { AxiosResponse } from '../plugins/axios';
import { getHeaderConfig } from './util';

// ------oneid third-party config api------

/**
 * 获取三方选项list
 */
export function getThirdpartyList(params: { client_id: string }) {
  const url = '/oneid/third-party/list';
  return request
    .get(url, { params, $ignoreLoading: true, ...getHeaderConfig() })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 三方登录
 */
export function loginByThirdparty(
  id: string,
  params: { code: string; state: string }
) {
  const url = `/oneid/third-party/${id}/callback`;
  return request
    .get(url, { params, $doException: true, ...getHeaderConfig() })
    .then((res: AxiosResponse) => res.data);
}

/**
 * 三方注册
 */
export function registerByThirdparty(params: {
  register_token: string;
  client_id: string;
}) {
  const url = `/oneid/third-party/register`;
  return request
    .post(url, params, getHeaderConfig())
    .then((res: AxiosResponse) => res.data);
}

/**
 * 三方绑定
 */
export function bindByThirdparty(params: {
  bind_token: string;
  state: string;
}) {
  const url = `/oneid/third-party/bind`;
  return request
    .post(url, params, getHeaderConfig())
    .then((res: AxiosResponse) => res.data);
}

/**
 * 个人中心三方账号解绑
 */
 export function unbindByThirdparty(params: any) {
  const url = '/oneid/third-party/unbind';
  return request
    .get(url, { params, ...getHeaderConfig() })
    .then((res: AxiosResponse) => res.data);
}
