import { appVerify } from '../api/api-login';
import { useCommonData } from '../stores/common';
import { LoginParams } from '../@types/interface';

export function validLoginUrl(query?: LoginParams) {
  return new Promise((resolve, reject) => {
    const { loginParams } = useCommonData();
    const param = {
      client_id: query?.client_id || loginParams.value.client_id,
      redirect_uri: getValidUrl(query?.redirect_uri || loginParams.value.redirect_uri),
    };
    if (!import.meta.env?.VITE_IS_OPENMERLIN) {
      Object.assign(param,{
        community: import.meta.env?.VITE_COMMUNITY,
      })
    };
    appVerify(param)
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        location.replace('/notfound');
      });
  });
}

const getValidUrl = (url: any) => {
  try {
    const newUrl = new URL(url);
    if (newUrl.origin === url) {
      return `${url}/`;
    }
    return url;
  } catch (error) {
    location.replace('/notfound');
  }
}
