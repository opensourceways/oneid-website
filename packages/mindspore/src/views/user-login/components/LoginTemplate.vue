<script setup lang="ts">
import IconGithub from '~icons/app/icon-github.svg';
import IconGitee from '~icons/app/icon-gitee.svg';
import IconOpenAtom from '~icons/app/icon-openatom.svg';
import ContentTemplate from './ContentTemplate.vue';
import CountdownButton from 'shared/components/CountdownButton.vue';
import { ElMessage, FormInstance, FormItemRule } from 'element-plus';
import { onMounted, onUnmounted, PropType, reactive, ref, toRefs } from 'vue';
import { useI18n } from 'shared/i18n';
import { formValidator, doValidatorForm, asyncBlur } from 'shared/utils/utils';
import { accountExists, sendCodeV3 } from 'shared/api/api-login';
import Verify from '@/verifition/Verify.vue';
import { callBackErrMessage, getUrlByParams } from 'shared/utils/utils';
import { getUsernammeRules } from '@/shared/utils';
import { EMAIL_REG, PHONE_REG } from 'shared/const/common.const';
import { useCommonData } from 'shared/stores/common';

type TYPE = 'login' | 'register';
const props = defineProps({
  type: {
    type: String as PropType<TYPE>,
    default: 'login',
  },
});

const emit = defineEmits(['submit', 'threePartLogin']);

const { type } = toRefs(props);
const i18n = useI18n();
const { lang, loginParams } = useCommonData();
onMounted(() => {
  listenerThreePartsLogin();
});
onUnmounted(() => {
  // 移除监听
  window.removeEventListener('message', loginFun);
});
const formRef = ref<FormInstance>();
// 表单值
const form = reactive({
  username: '',
  account: '',
  code: '',
  policy: [],
} as any);

// 验证码限制重发
const disableCode = ref(false);
const verify = ref();
// 获取验证码
const getcode = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formValidator(formEl, 'account').subscribe((valid) => {
    if (valid) {
      verify.value.show();
    } else {
      return false;
    }
  });
};

const verifySuccess = (data: any) => {
  const param = {
    channel: type.value === 'login' ? 'CHANNEL_LOGIN' : 'CHANNEL_REGISTER',
    account: form.account,
    captchaVerification: data.captchaVerification,
  };
  sendCodeV3(param).then(() => {
    disableCode.value = true;
    ElMessage.success({
      showClose: true,
      message: i18n.value.SEND_SUCCESS,
    });
  });
};

const icons = [
  {
    key: 'Gitee',
    icon: IconGitee,
    onClick: (formEl: FormInstance | undefined) => {
      threePartsLogin(formEl, 'Gitee');
    },
  },
  {
    key: 'GitHub',
    icon: IconGithub,
    onClick: (formEl: FormInstance | undefined) => {
      threePartsLogin(formEl, 'GitHub');
    },
  },
  // {
  //   key: 'OpenAtom',
  //   icon: IconOpenAtom,
  //   onClick: (formEl: FormInstance | undefined) => {
  //     threePartsLogin(formEl, 'OpenAtom');
  //   },
  // },
];

const changeCheckBox = (formEl: FormInstance | undefined) => {
  if (form.policy.length) {
    form.policy = [];
  } else {
    form.policy.push('1');
  }
  doValidatorForm(formEl, 'policy');
};

// 三方登录
const redirect_uri = `${import.meta.env.VITE_LOGIN_ORIGIN}/login`;
const threePartsLogin = (formEl: FormInstance | undefined, type: string) => {
  const url = 'https://api.authing.cn/api/v3/signin-by-extidp';
  const params = {
    client_id: loginParams.value.client_id,
    response_type: loginParams.value.response_type,
    redirect_uri,
    scope: 'openid profile username email',
    state: loginParams.value.state,
    nonce: loginParams.value.nonce,
    lang: lang.value === 'zh' ? 'zh-CN' : 'en-US',
    response_mode: 'web_message',
  };
  const ext_idp_conn_id: any = {
    Gitee: '6226d91103d81d8654673f1b',
    GitHub: '6226db30c8e30db1518cc4aa',
    OpenAtom: '63c0bfd4c88ee67bcf1959b4',
  };
  Object.assign(params, { ext_idp_conn_id: ext_idp_conn_id[type] });
  formValidator(formEl, ['policy']).subscribe((valid) => {
    if (valid) {
      window.open(
        getUrlByParams(url, params),
        '_blank',
        `width=500,height=700,left=${(screen.width - 500) / 2},top=${
          (screen.height - 700) / 2
        }`
      );
    } else {
      return false;
    }
  });
};

// 监听三方登录结果
const listenerThreePartsLogin = () => {
  window.addEventListener('message', loginFun);
};
const loginFun = (e: MessageEvent) => {
  const { type, response } = e.data;
  if (type !== 'authorization_response') {
    return;
  }
  const { code, state } = response;
  if (code && state) {
    const param = {
      code,
      redirect_uri,
    };
    emit('threePartLogin', param);
  }
};

// 手机或邮箱合法校验
const validatorAccount = (rule: any, value: any, callback: any) => {
  if (value) {
    if (type.value === 'register') {
      if (EMAIL_REG.test(value)) {
        callback();
      } else {
        callback(i18n.value.ENTER_VAILD_EMAIL);
      }
      return;
    }
    if (EMAIL_REG.test(value) || PHONE_REG.test(value)) {
      callback();
    } else {
      callback(i18n.value.ENTER_VAILD_EMAIL_OR_PHONE);
    }
  }
};
// 手机或邮箱重名校验
const validatorSameAccount = (rule: any, value: any): void | Promise<void> => {
  if (value) {
    return new Promise((resolve, reject) => {
      accountExists({ account: value })
        .then(() => {
          resolve();
        })
        .catch((err: any) => {
          reject(callBackErrMessage(err));
        });
    });
  }
};
// 手机或邮箱是否存在校验
const validatorExistAccount = (rule: any, value: any): void | Promise<void> => {
  if (value) {
    return new Promise((resolve, reject) => {
      accountExists({ account: value })
        .then(() => {
          reject(i18n.value.ACCOUNT_NOT_EXIST);
        })
        .catch(() => {
          resolve();
        });
    });
  }
};
// checkbox校验
const validatorCheckbox = (rule: any, value: any, callback: any) => {
  if (!value || !value.length) {
    callback(i18n.value.PLEASE_CHECK_PRIVACY);
  } else {
    callback();
  }
};

// 空值校验
const requiredRules: FormItemRule[] = [
  {
    required: true,
    message: i18n.value.NOT_EMPTY,
    trigger: 'blur',
  },
];
const rules = ref(requiredRules);

// 用户名校验
const userNameRules = reactive<FormItemRule[]>(getUsernammeRules());

// 账户校验
const accountRules = reactive<FormItemRule[]>([
  ...requiredRules,
  {
    validator: validatorAccount,
    trigger: 'blur',
  },
  {
    asyncValidator:
      type.value === 'register' ? validatorSameAccount : validatorExistAccount,
    trigger: 'none',
  },
]);

// 隐私声明校验
const policyRules = reactive<FormItemRule[]>([
  {
    validator: validatorCheckbox,
    trigger: 'change',
  },
]);

const submit = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formValidator(formEl).subscribe((valid) => {
    if (valid) {
      emit('submit', form);
    } else {
      return false;
    }
  });
};

const blur = (formEl: FormInstance | undefined, field: string) => {
  if (type.value === 'register') {
    asyncBlur(formEl, field);
  }
};

// 隐私政策、法律声明
const goToOtherPage = (type: string) => {
  const origin = 'https://mindspore.cn';
  const _lang = lang.value === 'en' ? `/${lang.value}` : '';
  const url = `${origin}/${type}${_lang}`;
  window.open(url, '_blank');
};
</script>
<template>
  <ContentTemplate>
    <template #headerTitle>
      <slot name="headerTitle"> {{ i18n.ACCOUNT_LOGIN }} </slot>
    </template>
    <template #switch>
      <slot name="switch"></slot>
    </template>
    <template #body>
      <el-form
        ref="formRef"
        label-width="0"
        :model="form"
        style="max-width: 460px"
      >
        <el-form-item
          v-if="type === 'register'"
          prop="username"
          :rules="userNameRules"
        >
          <OInput
            v-model="form.username"
            :placeholder="i18n.ENTER_USERNAME"
            @blur="blur(formRef, 'username')"
          />
        </el-form-item>
        <el-form-item prop="account" :rules="accountRules">
          <OInput
            v-model="form.account"
            :placeholder="
              type === 'register'
                ? i18n.ENTER_YOUR_EMAIL
                : i18n.ENTER_YOUR_EMAIL_OR_PHONE
            "
            @blur="blur(formRef, 'account')"
          />
        </el-form-item>
        <el-form-item prop="code" :rules="rules">
          <div class="code">
            <OInput
              v-model="form.code"
              :placeholder="i18n.ENTER_RECEIVED_CODE"
            />
            <CountdownButton
              v-model="disableCode"
              class="btn"
              size="small"
              @click="getcode(formRef)"
            />
          </div>
        </el-form-item>
        <el-form-item prop="policy" :rules="policyRules">
          <div class="checkbox">
            <OCheckboxGroup
              v-model="form.policy"
              @change="doValidatorForm(formRef, 'policy')"
            >
              <OCheckbox value="1"></OCheckbox>
            </OCheckboxGroup>
            <span>
              <span class="cursor" @click="changeCheckBox(formRef)">
                {{ i18n.READ_ADN_AGREE }}
              </span>
              <span>&nbsp;</span>
              <a @click="goToOtherPage('privacy')">{{ i18n.PRIVACY_POLICY }}</a>
              {{ i18n.AND }}
              <a @click="goToOtherPage('legal')">{{ i18n.LEGAL_NOTICE }}</a>
            </span>
          </div>
        </el-form-item>
        <el-form-item>
          <OButton type="primary" class="login-btn" @click="submit(formRef)">
            <slot name="btn"> {{ i18n.LOGIN }} </slot>
          </OButton>
        </el-form-item>
      </el-form>
    </template>
    <template v-if="type !== 'register'" #footer>
      <div class="app-footer">
        <div class="divider">
          <div class="line"></div>
          <div class="other">{{ i18n.THREE_PART_LOGIN }}</div>
          <div class="line"></div>
        </div>
        <div class="three-parts">
          <div
            v-for="(item, index) in icons"
            :key="item.key"
            @click="item.onClick(formRef)"
          >
            <OIcon class="icon" :class="{ gap: index }">
              <component :is="item.icon"></component>
            </OIcon>
          </div>
        </div>
      </div>
    </template>
  </ContentTemplate>
  <Verify
    ref="verify"
    mode="pop"
    captcha-type="blockPuzzle"
    :img-size="{ width: '400px', height: '200px' }"
    @success="verifySuccess"
  ></Verify>
</template>
<style lang="scss" scoped>
.gap {
  margin-left: var(--o-spacing-h2);
}
.icon {
  font-size: var(--o-font-size-h3);
  cursor: pointer;
}
.code {
  display: grid;
  grid-template-columns: auto max-content;
  width: 100%;
  grid-gap: var(--o-spacing-h9);
}
.cursor {
  cursor: pointer;
}
.btn {
  height: 38px;
}
.login-btn {
  width: 100%;
  justify-content: center;
}
.checkbox {
  display: grid;
  grid-template-columns: auto auto;
  align-items: start;
  color: var(--o-color-text1);
  font-size: var(--o-font-size-tip);
  line-height: var(--o-line-height-text);
  .o-checkbox-group {
    padding-top: 3px;
  }
}
:deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--o-color-error1) inset;
}
.el-form-item {
  margin-bottom: 24px;
}
.app-footer {
  padding-top: var(--o-spacing-h4);
  .divider {
    display: grid;
    grid-template-columns: auto max-content auto;
    justify-items: center;
    align-items: center;
    .line {
      width: 100%;
      border-top: 1px solid var(--o-color-division1);
    }
    .other {
      padding-left: var(--o-spacing-h5);
      padding-right: var(--o-spacing-h5);
      font-size: var(--o-font-size-text);
      line-height: var(--o-line-height-text);
      color: var(--o-color-text4);
    }
  }
  .three-parts {
    padding-top: var(--o-spacing-h4);
    display: flex;
    justify-content: center;
  }
}
</style>
