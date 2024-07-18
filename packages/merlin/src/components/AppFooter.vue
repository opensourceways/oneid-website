<script setup lang="ts">
import { ODivider, OLink } from '@opensig/opendesign';
import { useI18n } from 'shared/i18n';
import { testIsPhone } from 'shared/utils/helper';

const i18n = useI18n();
const WEB_URL = import.meta.env.VITE_OPENEULER_WEBSITE;
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer-wrap">
      <div class="footer-content">
        <div class="footer-left">
          <span class="copyright">{{ i18n.FOOTER.COPY_RIGHT_OPENMIND }}</span>
        </div>
        <div class="footer-right">
          <OLink :href="WEB_URL + '/privacy'" class="privacy" target="_blank">{{ i18n.FOOTER.PRIVACY_POLICY }}</OLink>
          <ODivider direction="v" darker />
          <OLink :href="WEB_URL + '/legal'" class="legal" target="_blank">{{ i18n.FOOTER.LEGAL_NOTICE }}</OLink>
          <ODivider direction="v" darker />
          <OLink :href="WEB_URL + '/cookie'" class="cookie" target="_blank">{{ i18n.FOOTER.ABOUT_COOKIE }}</OLink>
          <br v-if="testIsPhone()" />
          <ODivider v-else direction="v" darker />
          <OLink :href="WEB_URL + '/review-and-complaint'" target="_blank">{{ i18n.FOOTER.INFRINGEMENT }}</OLink>
          <ODivider direction="v" darker />
          <OLink :href="WEB_URL + '/feedback'" target="_blank">{{ i18n.FOOTER.FEEDBACK }}</OLink>
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
}

.app-footer-wrap {
  height: 100%;
  max-width: var(--layout-content-max-width);
  margin: auto;
  padding-left: var(--layout-content-padding);
  padding-right: var(--layout-content-padding);
}

.footer-content {
  width: 100%;
  border-top: 1px solid var(--o-color-control1);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  @include respond-to('phone') {
    flex-direction: column;
    justify-content: space-around;
  }
}
</style>
