<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useI18n, useI18nStr } from 'shared/i18n';
import ContentBox from './ContentBox.vue';
import AppDialog from './AppDialog.vue';
import IconMail from '~icons/app/icon-mail.svg';
import IconPhone from '~icons/app/icon-phone.svg';
import {
  AccountOperateKey,
  AllAccountDialogConfig,
  QueryCodeParams,
  BindAccountParams,
} from './interface';
import { useCommon, useCommonData } from 'shared/stores/common';
import {
  bindAccount,
  modifyAccount,
  sendUnbindCode,
  unbindAccount,
} from 'shared/api/api-center';
import { ElMessage } from 'element-plus';
import { IObject } from 'shared/@types/interface';
import { getCommunityParams } from '@/shared/utils';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const i18n = useI18n();
const store = useCommon();
const { userInfo } = useCommonData();
const accountData = ref([
  {
    key: 'email',
    icon: IconMail,
    label: useI18nStr('EMAIL'),
    operate: [''],
    value: '',
  },
  {
    key: 'phone',
    icon: IconPhone,
    label: useI18nStr('PHONE'),
    operate: [],
    value: '',
  },
]);
const initData = () => {
  accountData.value.forEach((item: IObject) => {
    if (item.key in userInfo.value) {
      item.value = userInfo.value[item.key];
    }
  });
};
onMounted(() => {
  store.initUserInfo(getCommunityParams(true));
  initData();
});
watch(
  () => userInfo.value,
  () => {
    initData();
  },
  { deep: true }
);

// 修改绑定邮箱或手机号
const modifyAccountFuc = (data: BindAccountParams) => {
  Object.assign(data, getCommunityParams(true));
  modifyAccount(data).then(() => {
    ElMessage.success({
      showClose: true,
      message: i18n.value.MODIFY_SUCCESS,
    });
    vilible.value = false;
    store.initUserInfo(getCommunityParams(true));
  });
};

// 绑定手机号或者邮箱
const bindAccountFuc = (data: BindAccountParams) => {
  Object.assign(data, getCommunityParams(true));
  bindAccount(data).then(() => {
    ElMessage.success({
      showClose: true,
      message: i18n.value.BIND_SUCCESS,
    });
    vilible.value = false;
    store.initUserInfo(getCommunityParams(true));
  });
};

// 解绑手机号或者邮箱
const unbindAccountFuc = (data: BindAccountParams) => {
  Object.assign(data, getCommunityParams(true));
  unbindAccount(data).then(() => {
    ElMessage.success({
      showClose: true,
      message: i18n.value.UNBIND_SUCCESS,
    });
    vilible.value = false;
    store.initUserInfo(getCommunityParams(true));
  });
};

// 发送验证码
const sendCodeFuc = (data: QueryCodeParams) => {
  Object.assign(data, getCommunityParams(true));
  return new Promise((resolve, rejects) => {
    sendUnbindCode(data)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        rejects(err);
      });
  });
};

// 控制弹窗显示
const vilible = ref(false);
// 展示所选弹窗key
const operateKey = ref('bind_email' as AccountOperateKey);
// 各个弹窗配置
const config: AllAccountDialogConfig = {
  confirm_bind_phone: {
    key: 'confirm_bind_phone',
    account_type: 'phone',
    field: 'change',
    header: 'BIND_PHONE',
    content: 'CONFIRM_BIND_PHONE',
    confirm: () => {
      operateKey.value = 'bind_phone';
      vilible.value = true;
    },
  },
  bind_email: {
    key: 'bind_email',
    account_type: 'email',
    field: 'change',
    header: 'BIND_EMAIL',
    account: {
      label: 'EMAIL',
    },
    code: {
      label: 'EMAIL_CODE',
    },
    confirm: (data: BindAccountParams) => {
      bindAccountFuc(data);
    },
  },
  modify_email: {
    key: 'modify_email',
    account_type: 'email',
    field: 'change',
    header: 'MODIFY_EMAIL',
    oldaccount: {
      label: 'CURRENT_EMAIL',
    },
    oldcode: {
      label: 'CURRENT_EMAIL_CODE',
    },
    account: {
      label: 'NEW_EMAIL',
    },
    code: {
      label: 'MEW_EMAIL_CODE',
    },
    confirm: (data: BindAccountParams) => {
      modifyAccountFuc(data);
    },
  },
  unbind_email: {
    key: 'unbind_email',
    account_type: 'email',
    field: 'change',
    header: 'UNBIND_EMAIL',
    code: {
      label: 'CURRENT_EMAIL_CODE',
      getCode: (data: QueryCodeParams) => {
        data.account = userInfo.value.email;
        return sendCodeFuc(data);
      },
    },
    confirm: (data: BindAccountParams) => {
      data.account = userInfo.value.email;
      unbindAccountFuc(data);
    },
  },
  bind_phone: {
    key: 'bind_phone',
    account_type: 'phone',
    field: 'change',
    header: 'BIND_PHONE',
    account: {
      label: 'PHONE',
      placeholder: 'ENTER_PHONE',
    },
    code: {
      label: 'SMS_CODE',
      placeholder: 'ENTER_RECEIVED_CODE',
    },
    confirm: (data: BindAccountParams) => {
      bindAccountFuc(data);
    },
  },
  modify_phone: {
    key: 'modify_phone',
    account_type: 'phone',
    field: 'change',
    header: 'MODIFY_PHONE',
    oldaccount: {
      label: 'CURRENT_PHONE',
    },
    oldcode: {
      label: 'OLD_PHONE_CODE',
      placeholder: 'ENTER_RECEIVED_CODE',
    },
    account: {
      label: 'NEW_PHONE',
      placeholder: 'ENTER_PHONE',
    },
    code: {
      label: 'NEW_PHONE_CODE',
      placeholder: 'ENTER_RECEIVED_CODE',
    },
    confirm: (data: BindAccountParams) => {
      modifyAccountFuc(data);
    },
  },
  unbind_phone: {
    key: 'unbind_phone',
    account_type: 'phone',
    field: 'change',
    header: 'UNBIND_EMAIL',
    code: {
      label: 'SMS_CODE',
      placeholder: 'ENTER_RECEIVED_CODE',
      getCode: (data: QueryCodeParams) => {
        data.account = userInfo.value.phone;
        return sendCodeFuc(data);
      },
    },
    confirm: (data: BindAccountParams) => {
      data.account = userInfo.value.phone;
      unbindAccountFuc(data);
    },
  },
};
const showDialog = (str: string, key: string) => {
  if (!userInfo.value.phone && str === 'unbind') {
    // 未绑定手机解绑操作时，应先绑定手机号
    operateKey.value = 'confirm_bind_phone';
  } else {
    const _key = `${str}_${key}` as AccountOperateKey;
    operateKey.value = _key;
  }
  vilible.value = true;
};
const goToTree = () => {
  router.push(`/${store.lang}/mobile/profile`);
};
</script>
<template>
  <AppHeader />
  <main>
    <div class="img_box">
      <div class="title1">
        <!-- <h1 class="title-in">USER CENTER</h1> -->
        <h1 class="title1-out">{{ i18n.USER_CENTER }}</h1>
        <img class="title1-login" src="@/assets/login_log.png" />
      </div>
    </div>
    <div class="title">
      <span class="left" @click="goToTree"></span>
      <span style="font-size: 16px">{{ i18n.IDENTITY }}</span>
    </div>
    <ContentBox>
      <!-- <template #header>
      {{ i18n.IDENTITY }}
    </template> -->
      <template #content>
        <div class="box_m">
          <div class="box_m-title">{{ i18n.PHONE_AND_EMAIL }}</div>
          <div
            v-for="(item, index) in accountData"
            :key="item.key"
            class="opt-item"
            :class="{ itemGap: index }"
          >
            <div class="center">
              <OIcon class="icon">
                <component :is="item.icon"></component>
              </OIcon>
              <div class="opt-label overflow">{{ item.value }}</div>
            </div>
            <div class="center">
              <div
                v-if="item.value && item.operate.includes('unbind')"
                class="opt-btn grey-btn"
                @click="showDialog('unbind', item.key)"
              >
                {{ i18n.UNBIND_EMAIL }}
              </div>
              <div
                v-if="item.value"
                class="opt-btn modify default-btn"
                @click="showDialog('modify', item.key)"
              >
                {{ i18n.MODIFY }}
              </div>
              <div
                v-else
                class="opt-btn default-btn"
                @click="showDialog('bind', item.key)"
              >
                {{ i18n.BIND }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </ContentBox>
  </main>

  <AppDialog v-model="vilible" :config="config[operateKey]"></AppDialog>
  <AppFooter />
</template>
<style lang="scss" scoped>
.img_box {
  width: 100%;
  height: 100px;
  background-image: url('@/assets/banner.png');
  background-size: cover;
  background-repeat: no-repeat;
  .title1 {
    margin: 0 auto;
    max-width: 1472px;
    padding: 0 var(--o-spacing-h6);
    position: relative;
    &-in {
      position: absolute;
      top: 60px;
      font-size: 68px;
      font-weight: bold;
      color: rgba(0, 47, 167, 0.14);
      line-height: 34px;
    }
    &-out {
      position: absolute;
      top: 35px;
      font-size: 24px;
      font-weight: 300;
      color: var(--o-color-white);
      line-height: 30px;
    }
    &-login {
      position: absolute;
      top: 20px;
      right: 0;
      margin-right: var(--o-spacing-h6);
      width: 90px;
      height: 60px;
    }
  }
}
.box_m {
  margin-bottom: 16px;
  color: var(--o-color-text1);
  background-color: var(--o-color-bg2);
  padding: 16px;
  &-title {
    margin-bottom: var(--o-spacing-h4);
    font-size: 14px;
    line-height: 22px;
  }
  .itemGap {
    margin-top: var(--o-spacing-h3);
  }
  .opt-item {
    display: flex;
    justify-content: space-between;
    .overflow {
      max-width: 58vw;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .opt-label {
      color: var(--o-color-neutral5);
      font-size: 14px;
    }
    .opt-btn {
      margin-left: var(--o-spacing-h6);
    }
  }
}
.icon {
  font-size: var(--o-font-size-h5);
  margin-right: var(--o-spacing-h6);
}
.center {
  display: flex;
  align-items: center;
}
.grey-btn {
  color: var(--o-color-neutral8);
}
.default-btn {
  color: var(--o-color-link1);
  &:hover {
    color: var(--o-color-link2);
  }
  &:active {
    color: var(--o-color-link3);
  }
}
.banner {
  width: 100%;
  height: 126px;
  background-image: url('@/assets/login_log.png');
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: left;
  background-color: var(--o-color-bg2);
}
.title {
  height: 48px;
  width: auto;
  background-color: var(--o-color-bg2);
  font-size: 16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--o-color-text1);
  .left {
    background-image: url('@/assets/left_down.png');
    width: 16px;
    height: 16px;
    position: absolute;
    left: 26px;
  }
}
main {
  position: relative;
  min-height: calc(100vh - 339px);
  background-color: var(--o-color-bg1);
  margin-top: 80px;
  overflow: hidden;

  @media (max-width: 1100px) {
    margin-top: 48px;
  }
}
</style>
