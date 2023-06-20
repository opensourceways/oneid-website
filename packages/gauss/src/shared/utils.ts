import { useCommonData } from 'shared/stores/common';

export function getCommunityParams(more = false) {
  const param = {
    community: import.meta.env?.VITE_COMMUNITY,
  };
  if (more) {
    const { loginParams } = useCommonData();
    Object.assign(param, {
      client_id: loginParams.value.client_id,
    });
  }
  return param;
}
