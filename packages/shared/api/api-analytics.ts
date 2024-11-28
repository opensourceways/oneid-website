import { request } from '../plugins/axios';

/**
 * 上报数据
 * @return { Promise<ResponseT> } 是否上报成功
 */
export function reporAnalytics(params: any) {
  const url = '/api-dsapi/query/track/foundry';
  return request.post(url, params).then((res) => {
    return res.data;
  });
}
