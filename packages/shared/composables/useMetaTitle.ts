import { isNull, isUndefined } from '@opensig/opendesign';
import { useTitle, type MaybeRef } from '@vueuse/core';

import { useI18nStr } from '../i18n';


export const useMetaTitle = (title?: MaybeRef<string | null | undefined>) => {
  const defaultTitle = useI18nStr('MODELERS');
  if (isNull(title) || isUndefined(title)) {
    return useTitle(defaultTitle);
  }
  return useTitle(title, { titleTemplate: `%s | ${defaultTitle}` });
};
