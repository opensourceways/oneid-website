import { useCommon, useCommonData } from '../stores/common';
import { FormInstance, FormItemRule } from 'element-plus';
import { from, Observable, reduce, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { useI18nStr } from '../i18n';
import {
  COMPANYNAME_REG,
  NICKNAME_REG,
  PWD_REG,
  PWD_REPEAT_REG,
  USERNAME_REG,
  EMAIL_REG,
} from '../const/common.const';
import { accountExists, queryPrivacyVersion } from '../api/api-login';
import { testIsPhone } from './helper';
import { useLogin } from '../stores/login';

// 返回接口报错信息
export function callBackErrMessage(err: any) {
  let _msg = '';
  if (err.response && (err.response?.data as any)?.msg) {
    const msg = (err.response?.data as any)?.msg;
    if (Object.prototype.toString.call(msg) === '[object String]') {
      _msg = msg;
    } else if (Object.prototype.toString.call(msg) === '[object Object]') {
      const { message_en, message_zh } = msg;
      const common = useCommon();
      _msg = common.lang === 'zh' ? message_zh : message_en;
    }
  }
  return _msg;
}

type TO_STRING_TYPE =
  | 'String'
  | 'Boolean'
  | 'String'
  | 'Number'
  | 'Function'
  | 'Undefined'
  | 'Null'
  | 'RegExp'
  | 'Object'
  | 'Array';
export function _toString(val: any): TO_STRING_TYPE {
  return Object.prototype.toString.call(val).slice(8, -1) as TO_STRING_TYPE;
}

// 判断类型
export function determiningType(val: any, type: TO_STRING_TYPE): boolean {
  return _toString(val) === type;
}

// 组装url
export function getUrlByParams(url: string, params: any): string {
  if (!determiningType(params, 'Object')) {
    return url;
  }
  const searh = Object.entries(params).reduce((pre, next) => {
    if (pre) {
      pre += '&';
    }
    pre += `${next[0]}=${next[1]}`;
    return pre;
  }, '');
  return `${url}${searh ? '?' : ''}${searh}`;
}

// 取出url中的param值
export function getParamsFromUrl(uri?: string) {
  const url = uri || location.href;
  const search = url.split('?')[1] || '';
  if (search) {
    return search.split('&').reduce((pre: any, next) => {
      const arr = next.split('=');
      pre[arr[0]] = arr[1];
      return pre;
    }, {});
  }
  return {};
}

/**
 *  校验表单，支持校验单个或多个对象
 * @param formEl 表单对象
 * @param fields 需要校验的表单项key
 */

export function formValidator(
  formEl: FormInstance | undefined,
  fields?: string[] | string
) {
  if (!formEl) return of(false);
  if (!fields) {
    return validate(formEl);
  } else if (Array.isArray(fields)) {
    const ob = from(fields);
    return ob.pipe(
      mergeMap((item) => validate(formEl, item)),
      reduce((pre, next) => pre && next)
    );
  } else if (typeof fields === 'string') {
    return validate(formEl, fields);
  }
  return of(false);
}

export function validate(formEl: FormInstance | undefined, field?: string) {
  return new Observable((observer) => {
    if (!formEl) {
      observer.next(false);
      observer.complete();
      return;
    }
    if (field) {
      formEl.validateField(field, (valid) => {
        observer.next(valid);
        observer.complete();
      });
    } else {
      formEl.validate((valid) => {
        observer.next(valid);
        observer.complete();
      });
    }
  });
}

// 手动触发校验
export function doValidatorForm(
  formEl: FormInstance | undefined,
  field?: string
) {
  validate(formEl, field).subscribe();
}

/**
 *  解决异步校验时，blur与按钮手动触发校验冲突，优先按钮触发
 * @param formEl 表单对象
 * @param field 需要校验的表单项key
 */
export function asyncBlur(formEl: FormInstance | undefined, field: string) {
  setTimeout(() => {
    formValidator(formEl, field).subscribe();
  }, 200);
}
export function getNicknammeRules(): FormItemRule[] {
  return [
    {
      pattern: NICKNAME_REG,
      message: useI18nStr('NICKNAME_VAILD') as unknown as string,
      trigger: 'blur',
    },
  ];
}

export function getCompanyRules(): FormItemRule[] {
  return [
    {
      min: 2,
      max: 100,
      message: useI18nStr('COMPANY_CONTAIN_CHARACTER') as unknown as string,
      trigger: 'blur',
    },
    {
      pattern: COMPANYNAME_REG,
      message: useI18nStr('COMPANY_VAILD') as unknown as string,
      trigger: 'blur',
    },
  ];
}

export function getPwdRules(): FormItemRule[] {
  return [
    {
      pattern: PWD_REG,
      message: useI18nStr('PWD_VAILD') as unknown as string,
      trigger: ['change', 'blur'],
    },
    {
      pattern: PWD_REPEAT_REG,
      message: useI18nStr('PWD_REPEAT_VAILD') as unknown as string,
      trigger: ['change', 'blur'],
    },
  ];
}

// 用户名重名校验
export function validatorSameName(rule: any, value: any): void | Promise<void> {
  if (value) {
    return new Promise((resolve, reject) => {
      const { loginParams } = useCommonData();
      const param: any = {
        username: value,
        client_id: loginParams.value.client_id,
        community: import.meta.env?.VITE_COMMUNITY,
      };
      accountExists(param)
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

// 手机或邮箱重名校验
export function validatorSameAccount(
  rule: any,
  value: any
): void | Promise<void> {
  if (value) {
    return new Promise((resolve, reject) => {
      const { loginParams } = useCommonData();
      accountExists({
        account: value,
        client_id: loginParams.value.client_id,
        community: import.meta.env?.VITE_COMMUNITY,
      })
        .then(() => {
          resolve();
        })
        .catch((err: any) => {
          reject(callBackErrMessage(err));
        });
    });
  }
}

// 手机或邮箱是否存在校验
export function validatorExistAccount(
  rule: any,
  value: any
): void | Promise<void> {
  if (value) {
    return new Promise((resolve, reject) => {
      const { loginParams } = useCommonData();
      accountExists({
        account: value,
        client_id: loginParams.value.client_id,
        community: import.meta.env?.VITE_COMMUNITY,
      })
        .then(() => {
          reject(useI18nStr('ACCOUNT_NOT_EXIST').value);
        })
        .catch(() => {
          resolve();
        });
    });
  }
}

export function getVerifyImgSize() {
  let width = 400;
  let height = 200;
  if (testIsPhone()) {
    width = 300;
    height = 150;
  }
  return {
    width: width + 'px',
    height: height + 'px',
  };
}

export function getFitWidth(width: number) {
  let _width = width;
  const innerWidth = window.innerWidth;
  if (innerWidth < _width) {
    _width = innerWidth;
  }
  return _width + 'px';
}

export function setSessionStorage(key: string, value = '') {
  window.sessionStorage?.setItem(key, value);
}

export function getSessionStorage(key: string) {
  const str = window.sessionStorage?.getItem(key);
  return str || undefined;
}

export function removeSessionStorage(key: string) {
  window.sessionStorage?.removeItem(key);
}

export function isSendCodeEmail(mail: string): boolean {
  if (!mail) return false;
  const NOT_SEND_CODE_MAIL = ['@user.noreply.osinfra.cn'];
  return !NOT_SEND_CODE_MAIL.some((item) => mail?.includes(item));
}

export function isWeChat(){
  return /MicroMessenger/i.test(window.navigator.userAgent);
}

/**
 *  对象进行脱敏
 * @param value 对象值
 * @param isMask 是否脱敏
 */
 export function maskUserInfo(value: string, isMask: boolean = false) {
  if (isMask && value) {
    if (EMAIL_REG.test(value)) {
      return value.replace(/^(.{1}).*?(@.*)$/, '$1****$2');
    }
    return value.replace(/(\+?\w{1})\w*(\w{1})/, '$1****$2');
  }
  return value;
}

export async function getPrivacyVersion() {
  const { oneidPrivacyAccepted, setOneidPrivacyAccepted } = useLogin();
  if (oneidPrivacyAccepted) {
    return oneidPrivacyAccepted;
  }
  const data = await queryPrivacyVersion()
  if (data?.data?.oneidPrivacyAccepted) {
    setOneidPrivacyAccepted(data.data.oneidPrivacyAccepted)
    return data.data.oneidPrivacyAccepted
  }
  return 'none';
}
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
