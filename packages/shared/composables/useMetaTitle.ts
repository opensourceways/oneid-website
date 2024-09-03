import { isNull, isUndefined } from '@opensig/opendesign';

import { useI18nStr } from '../i18n';


export const useMetaTitle = (title?: string | null | undefined) => {
  const defaultTitle = useI18nStr('MODELERS');
  if (isNull(title) || isUndefined(title)) {
    document.title = defaultTitle.value;
  } else {
    document.title = title;
  }
};
