import { FormItemRule } from 'element-plus';
import { accountExists } from 'shared/api/api-login';
import { USERNAME_REG } from 'shared/const/common.const';
import { useI18nStr } from 'shared/i18n';
import { callBackErrMessage } from 'shared/utils/utils';

// 用户名重名校验
export function validatorSameName(rule: any, value: any): void | Promise<void> {
  if (value) {
    return new Promise((resolve, reject) => {
      accountExists({ userName: value })
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
