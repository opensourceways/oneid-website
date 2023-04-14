import { appVerify } from '../api/api-login';
import { useCommonData } from '../stores/common';
import { LoginParams } from '../@types/interface';

export function validLoginUrl(query?: LoginParams) {
  return new Promise((resolve, reject) => {
    const { loginParams } = useCommonData();
    const param = {
      client_id: query?.client_id || loginParams.value.client_id,
      redirect_uri: query?.redirect_uri || loginParams.value.redirect_uri,
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
