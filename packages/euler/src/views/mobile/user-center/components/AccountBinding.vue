<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n, useI18nStr } from 'shared/i18n';
import ContentBox from './ContentBox.vue';
import AppDialog from './AppDialog.vue';
import IconMail from '~icons/app/icon-mail.svg';
import IconPhone from '~icons/app/icon-phone.svg';
import IconGithub from '~icons/app/icon-github.svg';
import IconGitee from '~icons/app/icon-gitee.svg';
import IconOpenAtom from '~icons/app/icon-openatom.svg';
import {
  AccountOperateKey,
  AllAccountDialogConfig,
  QueryCodeParams,
  BindAccountParams,
} from 'shared/@types/usercenter.interface';
import { useCommon, useCommonData } from 'shared/stores/common';
import {
  bindAccountPost,
  modifyAccountPost,
  sendUnbindCodePost,
  unbindAccountPost,
  linkAccount,
  unlinkAccount,
} from 'shared/api/api-center';
import { ElMessage } from 'element-plus';
import { IObject } from 'shared/@types/interface';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useRouter } from 'vue-router';
import MaskEye from 'shared/components/MaskEye.vue';
import { isSendCodeEmail, maskUserInfo } from 'shared/utils/utils';
const router = useRouter();
const i18n = useI18n();
const store = useCommon();
const { userInfo } = useCommonData();
const accountData = ref([
  {
    key: 'email',
    icon: IconMail,
    label: useI18nStr('EMAIL'),
    operate: [],
    value: '',
    isMask: true,
  },
  {
    key: 'phone',
    icon: IconPhone,
    label: useI18nStr('PHONE'),
    operate: ['unbind'],
    value: '',
    isMask: true,
  },
]);
const threeAccountData = ref([] as IObject[]);
const resetThreeAccountData = () => {
  threeAccountData.value = [
    {
      key: 'github',
      icon: IconGithub,
      label: 'Github',
      value: '',
    },
    {
      key: 'gitee',
      icon: IconGitee,
      label: 'Gitee',
      value: '',
    },
    {
      key: 'openatom',
      icon: IconOpenAtom,
      label: 'OpenAtom',
      value: '',
    },
  ];
};
const initData = () => {
  accountData.value.forEach((item: IObject) => {
    if (item.key in userInfo.value) {
      const key = item.key === 'phone' ? 'phoneCountry' : item.key;
      item.value = userInfo.value[key];
    }
  });
  resetThreeAccountData();
  if (userInfo.value?.identities?.length) {
    threeAccountData.value.forEach((item) => {
      userInfo.value?.identities.forEach((it: IObject) => {
        if (item.key === it.identity) {
          item.value = it.user_name;
          Object.assign(item, it);
        }
      });
    });
  }
};

// 控制弹窗显示
const vilible = ref(false);

// 修改绑定邮箱或手机号
const modifyAccountFuc = (data: any) => {
  (isSendCodeEmail(data?.oldaccount) ? modifyAccountPost : bindAccountPost)(data).then(
    () => {
      ElMessage.success({
        showClose: true,
        message: i18n.value.MODIFY_SUCCESS,
      });
      vilible.value = false;
      store.initUserInfo();
    }
  );
};

// 绑定手机号或者邮箱
const bindAccountFuc = (data: BindAccountParams) => {
  bindAccountPost(data).then(() => {
    ElMessage.success({
      showClose: true,
      message: i18n.value.BIND_SUCCESS,
    });
    vilible.value = false;
    store.initUserInfo();
  });
};

// 解绑手机号或者邮箱
const unbindAccountFuc = (data: BindAccountParams) => {
  unbindAccountPost(data).then(() => {
    ElMessage.success({
      showClose: true,
      message: i18n.value.UNBIND_SUCCESS,
    });
    vilible.value = false;
    store.initUserInfo();
  });
};

// 发送验证码
const sendCodeFuc = (data: QueryCodeParams) => {
  return new Promise((resolve, rejects) => {
    sendUnbindCodePost(data)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        rejects(err);
      });
  });
};

const unbindSocial = (platform: string) => {
  unlinkAccount({ platform }).then(() => {
    ElMessage.success({
      showClose: true,
      message: i18n.value.UNBIND_SUCCESS,
    });
    vilible.value = false;
    store.initUserInfo();
  });
};

// 展示所选弹窗key
const operateKey = ref('bind_email' as AccountOperateKey);
// 各个弹窗配置
const config: AllAccountDialogConfig = {
  confirm_bind_email: {
    key: 'confirm_bind_email',
    account_type: 'email',
    field: 'change',
    header: 'BIND_EMAIL',
    content: 'CONFIRM_BIND_EMAIL',
    confirm: () => {
      operateKey.value = 'bind_email';
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
        data.account = userInfo.value.phoneCountry;
        return sendCodeFuc(data);
      },
    },
    confirm: (data: BindAccountParams) => {
      data.account = userInfo.value.phoneCountry;
      unbindAccountFuc(data);
    },
  },
  unbind_github: {
    key: 'unbind_github',
    account_type: 'github',
    field: 'change',
    header: 'UNBIND_EMAIL',
    content: 'SURE_UNBIND',
    confirm: (data: BindAccountParams) => {
      unbindSocial(data.account_type);
    },
  },
  unbind_gitee: {
    key: 'unbind_gitee',
    account_type: 'gitee',
    field: 'change',
    header: 'UNBIND_EMAIL',
    content: 'SURE_UNBIND',
    confirm: (data: BindAccountParams) => {
      unbindSocial(data.account_type);
    },
  },
  unbind_openatom: {
    key: 'unbind_openatom',
    account_type: 'openatom',
    field: 'change',
    header: 'UNBIND_EMAIL',
    content: 'SURE_UNBIND',
    confirm: (data: BindAccountParams) => {
      unbindSocial(data.account_type);
    },
  },
};
const showDialog = (str: string, key: string) => {
  if (!isSendCodeEmail(userInfo.value.email) && str === 'unbind') {
    // 未绑定邮箱解绑操作时，应先绑定邮箱
    operateKey.value = 'confirm_bind_email';
  } else {
    const _key = `${str}_${key}` as AccountOperateKey;
    operateKey.value = _key;
  }
  vilible.value = true;
};

const bindSocial = (key: string) => {
  const bindWindow = window.open(
    '',
    '_blank',
    `width=500,height=700,left=${(screen.width - 500) / 2},top=${
      (screen.height - 700) / 2
    }`
  );
  linkAccount()
    .then((res) => {
      const { data = [] } = res;
      const obj: any = {
        github: 'social_github',
        gitee: 'enterprise_gitee',
        openatom: 'enterprise_openatom',
      };
      const findone = data.find((item: any) => item.name === obj[key]);
      if (findone && bindWindow) {
        bindWindow.location = findone.authorizationUrl;
      } else {
        bindWindow?.close();
      }
    })
    .catch(() => {
      bindWindow?.close();
    });
};
const bindFun = (e: MessageEvent) => {
  const { code, event, message } = e.data;
  if (event?.source !== 'authing') {
    return;
  }

  if (code === 200) {
    // 成功
    store.initUserInfo();
    return;
  }

  let parsedMessage: any;
  try {
    parsedMessage = JSON.parse(message);
  } catch (error) {
    return;
  }
  const { statusCode } = parsedMessage;
  // 可以根据错误码 执行相应的操作 提示用户
  if (statusCode === 409) {
    ElMessage.error({
      showClose: true,
      message: i18n.value.REPEAT_BIND,
    });
  } else {
    ElMessage.error({
      showClose: true,
      message: i18n.value.BIND_FAILED,
    });
  }
};

const listenerBindSocial = () => {
  window.addEventListener('message', bindFun);
};

const goToTree = () => {
  router.push(`/${store.lang}/mobile/profile`);
};
onMounted(() => {
  store.initUserInfo();
  initData();
  listenerBindSocial();
});
onUnmounted(() => {
  // 移除监听
  window.removeEventListener('message', bindFun);
});
watch(
  () => userInfo.value,
  () => {
    initData();
  },
  { deep: true }
);
</script>
<template>
  <AppHeader />
  <main>
    <div class="banner">
      <div class="center-title">
        <h1 class="center-title-in">USER CENTER</h1>
        <h1 class="center-title-out">{{ i18n.USER_CENTER }}</h1>
      </div>
    </div>
    <div class="title">
      <span class="left" @click="goToTree"></span>
      <span style="font-size: 16px">{{ i18n.IDENTITY }}</span>
    </div>
    <ContentBox>
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
              <div class="opt-label overflow">{{ maskUserInfo(item.value, item.isMask) }}</div>
              <OIcon class="icon-eye" v-if="item.value">
                <MaskEye v-model="item.isMask"></MaskEye>
              </OIcon>
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
        <div class="box_m">
          <div class="box_m-title">{{ i18n.THIRD_ACCOUNT }}</div>
          <div
            v-for="(item, index) in threeAccountData"
            :key="item.key"
            class="opt-item"
            :class="{ itemGap: index }"
          >
            <div class="center">
              <OIcon class="icon">
                <component :is="item.icon"></component>
              </OIcon>
              <span class="opt-label overflow">{{ item.value }}</span>
            </div>
            <div class="center">
              <div
                v-if="item.value"
                class="opt-btn grey-btn"
                @click="showDialog('unbind', item.key)"
              >
                {{ i18n.UNBIND_EMAIL }}
              </div>
              <div
                v-else
                class="opt-btn default-btn"
                @click="bindSocial(item.key)"
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

    .opt-label {
      color: var(--o-color-neutral5);
      font-size: 14px;
    }
    .icon-eye {
      font-size: 16px;
      margin-left: 8px;
    }
    .overflow {
      width: 44vw;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .opt-btn {
      cursor: pointer;
      font-size: 12px;
    }
    .modify {
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
  background-image: url('@/assets/banner_mobile.png');
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: left;
  background-color: var(--o-color-bg2);
  .center-title {
    padding: 0 var(--o-spacing-h6);
    position: relative;
    &-in {
      position: absolute;
      top: 38px;
      font-size: 24px;
      font-weight: bold;
      color: rgba(0, 47, 167, 0.14);
      line-height: 34px;
    }
    &-out {
      position: absolute;
      top: 28px;
      font-size: 18px;
      font-weight: 500;
      color: var(--o-color-white);
      line-height: 76px;
    }
  }
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
