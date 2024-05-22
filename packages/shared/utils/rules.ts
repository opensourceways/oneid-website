import { RulesT, ValidatorResultT, ValidatorT } from "@opensig/opendesign/lib/form/types";
import { useI18n } from '../i18n';
import {
  COMPANYNAME_REG,
  NICKNAME_REG,
  EMAIL_REG,
  PHONE_REG,
  PWD_REG,
  PWD_REPEAT_REG,
  USERNAME_REG,
  CODE_REG,
} from '../const/common.const';
import { useCommonData } from "../stores/common";
import { accountExists } from '../api/api-login';
import { callBackErrMessage } from "./utils";
import { Observable } from "rxjs";
import { OForm } from "@opensig/opendesign";

// 空值校验
export const validatorEmpty = (str?: string) => {
  const fn: ValidatorT = (value: string) => {
    if (!value) {
      return {
        type: 'danger',
        message: str ? useI18n().value[str] : useI18n().value.NOT_EMPTY,
      };
    }
  }
  return fn;
};

// 手机号校验
export const validatorPhone: ValidatorT = (value: string) => {
  if (value && !PHONE_REG.test(value)) {
    return {
      type: 'danger',
      message: useI18n().value.ENTER_VAILD_PHONE,
    };
  }
};

// 邮箱校验
export const validatorEmail: ValidatorT = (value: string) => {
  if (value && !EMAIL_REG.test(value)) {
    return {
      type: 'danger',
      message: useI18n().value.ENTER_VAILD_EMAIL,
    };
  }
};

// 用户名重名校验
export const validatorSameName = async (value: string) => {
  if (value) {
    const { loginParams } = useCommonData();
    const param: any = {
      username: value,
      client_id: loginParams.value.client_id,
    };
    if (!import.meta.env?.VITE_IS_OPENMERLIN) {
      Object.assign(param, {
        community: import.meta.env?.VITE_COMMUNITY,
      })
    }
    const res = await accountExists(param)
      .then(() => {
        return {
          type: 'success',
        };
      })
      .catch((err: any) => {
        return {
          type: 'danger',
          message: callBackErrMessage(err),
        }
      }) as ValidatorResultT;
    return res;
  }
}

// 密码校验
export const getPwdRules = ():RulesT[] => {
  return [
    {
      validator: (value: string) => {
        if (value && !PWD_REG.test(value)) {
          return {
            type: 'danger',
            message: useI18n().value.PWD_VAILD,
          }
        }
      },
      triggers: 'change',
    },
    {
      validator: (value: string) => {
        if (value && !PWD_REPEAT_REG.test(value)) {
          return {
            type: 'danger',
            message: useI18n().value.PWD_REPEAT_VAILD,
          }
        }
      },
      triggers: 'change',
    },
  ];
}

// 用户名校验
export const getUsernammeRules = (): RulesT[] => {
  return [
    {
      validator: validatorEmpty('ENTER_USERNAME'),
      triggers: 'change',
    },
    {
      validator: (value: string) => {
        if (!value) {
          return;
        }
        if (value.length < 3 || value.length > 20) {
          return {
            type: 'danger',
            message: useI18n().value.CONTAIN_CHARACTER,
          }
        }
      },
      triggers: 'change',
    },
    {
      validator: (value: string) => {
        if (!value) {
          return;
        }
        if (!USERNAME_REG.test(value)) {
          return {
            type: 'danger',
            message: useI18n().value.USERNAME_VAILD,
          }
        }
      },
      triggers: 'change',
    },
    {
      validator: validatorSameName as unknown as ValidatorT,
      triggers: 'change',
    },
  ];
}

// 验证码校验
export const getCodeRules = ():RulesT[] => {
  return [
    {
      validator: validatorEmpty('ENTER_RECEIVED_CODE'),
      triggers: 'change',
    },
    {
      validator: (value: string) => {
        if (value && !CODE_REG.test(value)) {
          return {
            type: 'danger',
            message: useI18n().value.ENTER_SIX_CODE,
          }
        }
      },
      triggers: 'change',
    },
  ];
}


// 表单校验方法
export const formValidator = (formEl: InstanceType<typeof OForm> | undefined, field?: string | string[]) => {
  return new Observable((observer) => {
    if (!formEl) {
      observer.next(false);
      observer.complete();
      return;
    }
    formEl.validate(field).then(valid => {
      const bool = valid.every(item => !item)
      observer.next(bool);
      observer.complete();
    });
  });
}