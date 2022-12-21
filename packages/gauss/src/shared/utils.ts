import { WEB_COMMUNITY } from './const';
import { useCommonData } from 'shared/stores/common';

export function getCommunityParams(more = false) {
  const param = {
    community: WEB_COMMUNITY,
  };
  if (more) {
    const { loginParams } = useCommonData();
    Object.assign(param, {
      client_id: loginParams.value.client_id,
    });
  }
  return param;
}
