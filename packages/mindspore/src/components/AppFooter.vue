<script setup>
import logoImg from '@/assets/footer-logo.png';
import qrCodeImg from '@/assets/qr-code.png';
import { useI18n } from 'shared/i18n';

const i18n = useI18n();
// 隐私政策、法律声明
const goToOtherPage = (type) => {
  const origin = 'https://mindspore.cn';
  const url = `${origin}/${type}`;
  window.open(url, '_blank');
};
</script>

<template>
  <div class="app-footer">
    <footer class="footer">
      <div class="footer-logo">
        <img :src="logoImg" alt="" srcset="" />
      </div>
      <div class="footer-content">
        <div class="above">
          <a @click="goToOtherPage('privacy')">{{ i18n.PRIVACY_POLICY }}</a>
          <div class="division"></div>
          <a @click="goToOtherPage('legal')">{{ i18n.LEGAL_NOTICE }}</a>
        </div>
        <div class="below">
          <span>{{ i18n.FOOTER.COPY_RIGHT_MINDSPORE }}</span>
        </div>
      </div>
      <div class="footer-code">
        <img :src="qrCodeImg" />
        <p>{{ i18n.FOOTER.QR_CODE_GAUSS }}</p>
      </div>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.footer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1472px;
  margin: 0 auto;
  height: 200px;
  padding: 16px 16px;
  color: rgba(255, 255, 255, 1);

  &-logo {
    display: flex;
    align-items: center;
    height: 64px;
    // cursor: pointer;
    img {
      vertical-align: top;
      height: 100%;
    }
  }

  &-content {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    .above {
      width: 202px;
      display: flex;
      justify-content: space-around;
      font-size: 14px;
      margin: 0 auto;
      .text {
        color: rgba(255, 255, 255, 1);
        height: 26px;
        line-height: 26px;
        cursor: pointer;
      }

      .division {
        width: 1px;
        height: 20px;
        background-color: rgba(255, 255, 255, 1);
        margin-top: 2px;
      }
    }

    .below {
      display: flex;
      font-size: 12px;
      margin-top: 21px;
    }
  }

  &-code {
    display: flex;
    flex-direction: column;
    align-items: center;
    img {
      width: 78px;
      height: 78px;
    }

    p {
      margin-top: 8px;
      font-size: 12px;
      color: #ffffff;
      opacity: 0.8;
      line-height: 12px;
    }
  }
}
.app-footer {
  background-color: #18191d;
  background-image: url(@/assets/footer-bg.png);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  @media screen and (max-width: 1080px) {
    .footer {
      flex-direction: column-reverse;
      height: 170px;
    }
    .footer-code {
      img {
        width: 55px;
        height: 55px;
      }
      p {
        font-size: 8px;
        line-height: 12px;
      }
    }
    .footer-logo {
      display: none;
    }
    .footer-content {
      position: static;
      transform: none;
      margin-top: 16px;
      .above {
        font-size: 12px;
        color: #ffffff;
        line-height: 26px;
        width: 116px;
        .division {
          margin: 2px 8px 0;
        }
      }
      .below {
        margin-top: 8px;
        font-size: 9px;
        color: #ffffff;
        line-height: 12px;
      }
    }
  }
  @media screen and (min-width: 1080px) {
    min-width: 1280px;
  }
}
</style>
