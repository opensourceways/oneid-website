import { authorizeOidc } from '../api/api-login';
import { LoginParams } from '../@types/interface';
import { useCommonData } from '../stores/common';

export function haveLoggedIn() {
  const { loginParams } = useCommonData();
  switch (loginParams.value.response_mode) {
    case 'query':
      getOidcUri(loginParams.value);
      break;
    default:
      location.href = loginParams.value.redirect_uri || '';
  }
}

function getOidcUri(query: LoginParams) {
  const param = {
    client_id: query.client_id,
    redirect_uri: query.redirect_uri,
    response_type: query.response_type,
    scope: query.scope,
    state: query.state,
  };
  authorizeOidc(param).then((data) => {
    if (data?.body) {
      location.href = data.body;
    }
  });
}
