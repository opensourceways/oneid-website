import { accountExists } from '../api/api-login';
import { useI18nStr } from '../i18n';
import { useCommon } from '../stores/common';
import { FormInstance, FormItemRule } from 'element-plus';
import { from, Observable, reduce, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { USERNAME_REG } from '../const/common.const';

// iframe的刷新回调
export function iframeRefreshCallback() {
  window.parent.postMessage(
    {
      key: 'refresh',
    },
    'https://openeuler-website.test.osinfra.cn'
  );
}

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
