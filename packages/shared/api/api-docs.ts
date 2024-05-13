import { request } from '../plugins/axios';
import type { AxiosResponse } from '../plugins/axios';
import { getHeaderConfig } from './util';

/**
 * 获取merlin隐私文档
 */
 export function getPrivacyDocs(str: string) {
  const url = `/statement/${str}`;
  return request
    .get(url, getHeaderConfig())
    .then((res: AxiosResponse) => res.data);
}
