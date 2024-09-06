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
import IconWeChat from '~icons/app/icon-wechat.svg';
import {
  AccountOperateKey,
  AllAccountDialogConfig,
  QueryCodeParams,
  BindAccountParams,
} from 'shared/@types/usercenter.interface';
import { useCommon, useCommonData } from 'shared/stores/common';
import {
  bindAccount,
  modifyAccount,
  sendUnbindCode,
  unbindAccount,
  linkAccount,
  unlinkAccount,
} from 'shared/api/api-center';
import { ElMessage } from 'element-plus';
import { IObject } from 'shared/@types/interface';
import { isSendCodeEmail } from 'shared/utils/utils';

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
  },
  {
    key: 'phone',
    icon: IconPhone,
    label: useI18nStr('PHONE'),
    operate: ['unbind'],
    value: '',
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
    {
      key: 'wechat',
      icon: IconWeChat,
      label: 'WeChat',
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
  (isSendCodeEmail(data?.oldaccount) ? modifyAccount : bindAccount)(data).then(
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
  bindAccount(data).then(() => {
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
  unbindAccount(data).then(() => {
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
    sendUnbindCode(data)
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
  unbind_wechat: {
    key: 'unbind_wechat',
    account_type: 'wechat',
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
  linkAccount().then((res) => {
    const { data = [] } = res;
    const obj: any = {
      github: 'social_github',
      gitee: 'enterprise_gitee',
      openatom: 'enterprise_openatom',
      wechat: 'social_wechat',
    };
    const findone = data.find((item: any) => item.name === obj[key]);
    if (findone) {
      window.open(
        findone.authorizationUrl,
        '_blank',
        `width=500,height=700,left=${(screen.width - 500) / 2},top=${
          (screen.height - 700) / 2
        }`
      );
    }
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
    // 错误处理
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
onMounted(() => {
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
  <ContentBox>
    <template #header>
      {{ i18n.IDENTITY }}
    </template>
    <template #content>
      <div class="box">
        <div class="box-title">{{ i18n.PHONE_AND_EMAIL }}</div>
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
            <span>{{ item.label }}</span>
            <span v-if="item.value">
              ：
              <span class="opt-label">{{ item.value }}</span>
            </span>
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
      <div class="box">
        <div class="box-title">{{ i18n.THIRD_ACCOUNT }}</div>
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
            <span>{{ item.label }}</span>
            <span v-if="item.value">
              ：
              <span class="opt-label">{{ item.value }}</span>
            </span>
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
  <AppDialog v-model="vilible" :config="config[operateKey]"></AppDialog>
</template>
<style lang="scss" scoped>
.box {
  margin-bottom: 48px;
  color: var(--o-color-text1);
  &-title {
    margin-bottom: var(--o-spacing-h4);
    font-size: var(--o-font-size-h7);
    line-height: var(--o-line-height-h7);
  }
  .itemGap {
    margin-top: var(--o-spacing-h3);
  }
  .opt-item {
    display: flex;
    justify-content: space-between;
    .opt-label {
      color: var(--o-color-neutral5);
    }
    .opt-btn {
      cursor: pointer;
    }
    .modify {
      margin-left: var(--o-spacing-h4);
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
</style>
