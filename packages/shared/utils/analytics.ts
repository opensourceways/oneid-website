import { OpenAnalytics, OpenEventKeys } from '@opensig/open-analytics';
import { reporAnalytics } from '../api/api-analytics';
import { useCookieStore } from '../stores/common';

export const oa = new OpenAnalytics({
  appKey: 'modelers',
  request: (data) => {
    reporAnalytics(data);
  },
});

/**
 * 开启上报
 */
export const enableOA = () => {
  const cookieStore = useCookieStore();
  if (cookieStore.isAllAgreed) {
    oa.enableReporting(true);
  }
};

/**
 * 关闭上报
 */
export const disableOA = () => {
  oa.enableReporting(false);
};

/**
 * 上报PV数据
 */
export const reportPV = () => {
  const cookieStore = useCookieStore();
  if (cookieStore.isAllAgreed) {
    oa.report(OpenEventKeys.PV);
  }
};

/**
 * 上报性能数据
 */
export const reportPerformance = () => {
  const cookieStore = useCookieStore();
  if (cookieStore.isAllAgreed) {
    oa.report(OpenEventKeys.LCP);
    oa.report(OpenEventKeys.INP);
    oa.report(OpenEventKeys.PageBasePerformance);
  }
};
