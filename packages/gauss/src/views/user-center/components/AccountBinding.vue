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
} from 'shared/@types/usercenter.interface';
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
  initData();
});
watch(
  () => userInfo.value,
  () => {
    initData();
  },
  { deep: true }
);

// 控制弹窗显示
const vilible = ref(false);

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
