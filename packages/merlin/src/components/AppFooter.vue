<script setup lang="ts">
import { ODivider, OLink } from '@opensig/opendesign';
import { useI18n } from 'shared/i18n';
import { useTestIsPhone } from 'shared/utils/helper';

const i18n = useI18n();
const isPhone = useTestIsPhone();
const WEB_URL = import.meta.env.VITE_OPENEULER_WEBSITE;
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer-wrap">
      <div class="footer-content">
        <div class="footer-left">
          <span class="copyright">{{ i18n.FOOTER.COPY_RIGHT_OPENMIND }}</span>
          <br v-if="isPhone"/>
          <ODivider v-else direction="v" darker />
          <OLink href="https://beian.miit.gov.cn/" target="_blank" color="normal">京ICP备2021034386号-70</OLink>
        </div>
        <div class="footer-right">
          <OLink :href="WEB_URL + '/terms-of-use'" target="_blank">{{ i18n.FOOTER.USER_SERVICE }}</OLink>
          <ODivider direction="v" darker />
          <OLink :href="WEB_URL + '/privacy'" class="privacy" target="_blank">{{ i18n.FOOTER.PRIVACY_POLICY }}</OLink>
          <ODivider direction="v" darker />
          <OLink :href="WEB_URL + '/legal'" class="legal" target="_blank">{{ i18n.FOOTER.LEGAL_NOTICE }}</OLink>
          <template v-if="isPhone">
            <br />
          </template>
          <ODivider v-else direction="v" darker />
          <OLink :href="WEB_URL + '/cookies'" class="cookie" target="_blank">{{ i18n.FOOTER.ABOUT_COOKIE }}</OLink>
          <ODivider direction="v" darker />
          <OLink :href="WEB_URL + '/review-and-complaint'" target="_blank">{{ i18n.FOOTER.INFRINGEMENT }}</OLink>
          <template v-if="isPhone">
            <br />
          </template>
          <ODivider v-else direction="v" darker />
          <OLink :href="WEB_URL + '/changelog'" target="_blank">{{ i18n.FOOTER.CHANGElOG }}</OLink>
          <ODivider direction="v" darker />
          <OLink :href="WEB_URL + '/api/swagger/index.html'" target="_blank">{{ i18n.FOOTER.API }}</OLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.app-footer {
  color: var(--o-color-info3);
  @include tip1;
  height: 100%;
  text-align: center;
}

.app-footer-wrap {
  height: 100%;
  max-width: var(--layout-content-max-width);
  margin: auto;
  padding-left: var(--layout-content-padding);
  padding-right: var(--layout-content-padding);
}

.footer-left {
  a {
    color: var(--o-color-info3);
    @include hover {
      color: var(--o-color-info1);
    }
  }
}

.footer-content {
  width: 100%;
  border-top: 1px solid var(--o-color-division1);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  @include respond-to('phone') {
    flex-direction: column-reverse;
    justify-content: space-around;
  }
}
</style>
