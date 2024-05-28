import { authorizeOidc } from '../api/api-login';
import { LoginParams } from '../@types/interface';
import { useCommonData } from '../stores/common';
import { ElMessage } from 'element-plus';

const oidcNeedAuthAppIds = [
  '664f32319b6c3c39a476a540'
]

function toHttps(url: string) {
  let str;
  try {
    const _url = new URL(url);
    _url.protocol = 'https:';
    str = _url.toString();
  } catch (error) {
    str = url;
  }
  return str;
}
export function haveLoggedIn() {
  const { loginParams } = useCommonData();
  switch (loginParams.value.response_mode) {
    case 'query':
      if (oidcNeedAuthAppIds.includes(loginParams.value.client_id || '')) {
        const url = new URL(window.location.href);
        url.pathname = '/authorization'
        location.href = url.toString();
      } else {
        getOidcUri(loginParams.value);
      }
      break;
    default:
      location.href = toHttps(loginParams.value.redirect_uri || '');
  }
}

export function getOidcUri(query: LoginParams) {
  const param = {
    client_id: query.client_id,
    redirect_uri: query.redirect_uri,
    response_type: query.response_type,
    scope: query.scope,
    state: query.state,
  };
  authorizeOidc(param)
    .then((data) => {
      if (data?.body) {
        location.href = toHttps(data.body);
      }
    })
    .catch((err) => {
      if (err?.response?.data?.message?.includes('No permission')) {
        const { lang } = useCommonData();
        const msg =
          lang.value === 'en'
            ? err?.response?.data?.message
            : '无权限登录该应用';
        ElMessage.error({
          showClose: true,
          message: msg,
        });
      }
    });
}
