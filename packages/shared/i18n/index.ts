import { computed } from 'vue';
import zh from './common-zh';
import en from './common-en';
import { useCommon } from '../stores/common';

const i18n: { [key: string]: any } = {
  zh,
  en,
};

export function useI18n() {
  const common = useCommon();
  return computed(() => i18n[common.lang]);
}

export function useI18nStr(str: string, arr?: Array<string | number>) {
  const common = useCommon();
  return computed(() => {
    const I18N = i18n[common.lang][str];
    if (!I18N) {
      return str;
    }
    if (arr && Array.isArray(arr)) {
      const _I18N = arr.reduce((pre, next, index) => {
        return pre.replace(`[${index}]`, next);
      }, I18N);
      return _I18N;
    } else {
      return I18N;
    }
  });
}

export default i18n;
