import { WEB_COMMUNITY } from './const';
import { useCommonData } from 'shared/stores/common';
import { accountExists } from 'shared/api/api-login';
import { callBackErrMessage } from 'shared/utils/utils';
import { FormItemRule } from 'element-plus';
import { useI18nStr } from 'shared/i18n';
import { USERNAME_REG } from 'shared/const/common.const';

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

// 用户名重名校验
export function validatorSameName(rule: any, value: any): void | Promise<void> {
  if (value) {
    return new Promise((resolve, reject) => {
      accountExists({ userName: value, ...getCommunityParams(true) })
        .then(() => {
          resolve();
        })
        .catch((err: any) => {
          reject(callBackErrMessage(err));
        });
    });
  }
}

export function getUsernammeRules(): FormItemRule[] {
  return [
    {
      required: true,
      message: useI18nStr('NOT_EMPTY') as unknown as string,
      trigger: 'blur',
    },
    {
      min: 3,
      max: 20,
      message: useI18nStr('CONTAIN_CHARACTER') as unknown as string,
      trigger: 'blur',
    },
    {
      pattern: USERNAME_REG,
      message: useI18nStr('USERNAME_VAILD') as unknown as string,
      trigger: 'blur',
    },
    {
      asyncValidator: validatorSameName,
      trigger: 'none',
    },
  ];
}
