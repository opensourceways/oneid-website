<script setup lang="ts">
import { FunctionalComponent, ref } from "vue";
import { useI18n, useI18nStr } from "shared/i18n";
import IconInfo from "~icons/app/icon-info.svg";
import IconBinding from "~icons/app/icon-binding.svg";
import IconSecurity from "~icons/app/icon-security.svg";
import { SelectTabKey } from "./interface";
import { useCommon, useCommonData } from "shared/stores/common";
import {
  ElMessage,
  UploadProps,
  UploadRequestHandler,
  UploadRequestOptions,
} from "element-plus";
import { modifyPhoto } from "shared/api/api-center";
import { useRouter } from "vue-router";
const router = useRouter();

interface TabData {
  key: SelectTabKey;
  label: any;
  icon: FunctionalComponent;
}

const props = defineProps({
  modelValue: {
    type: () => "" as SelectTabKey,
    default: "userinfo",
  },
});
const store = useCommon();
const { userInfo } = useCommonData();

const i18n = useI18n();

// tab选项值
const tabData = ref([
  {
    key: "userinfo",
    label: useI18nStr("INFO"),
    icon: IconInfo,
  },
  {
    key: "binding",
    label: useI18nStr("IDENTITY"),
    icon: IconBinding,
  },
  {
    key: "security",
    label: useI18nStr("SECURITY"),
    icon: IconSecurity,
  },
] as TabData[]);
const emit = defineEmits(["update:modelValue"]);
const selectTab = (key: SelectTabKey) => {
  emit("update:modelValue", key);
  router.push(`/${store.lang}/mobile/profile/${key}`);
};
const beforeAvatarUpload: UploadProps["beforeUpload"] = (rawFile) => {
  if (!["image/png", "image/jpeg"].includes(rawFile.type)) {
    ElMessage.error({
      showClose: true,
      message: i18n.value.ONLY_IMAGE,
    });
    return false;
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error({
      showClose: true,
      message: i18n.value.FILE_SIZE_EXCEED,
    });
    return false;
  }
  return true;
};
const upload: UploadRequestHandler = (data: UploadRequestOptions) => {
  const formdata = new FormData();
  formdata.append("file", data.file);
  return modifyPhoto(formdata).then(() => {
    store.initUserInfo();
  });
};
</script>
<template>
  <div class="user">
    <div class="user-header">
      <el-upload
        action=""
        :http-request="upload"
        :show-file-list="false"
        :before-upload="beforeAvatarUpload"
      >
        <img v-if="userInfo.photo" class="photo" :src="userInfo.photo" />
        <div v-else class="photo"></div>
      </el-upload>

      <h5 class="nickname">{{ userInfo.userName }}</h5>
    </div>
    <ul class="user-tab">
      <li
        v-for="item in tabData"
        :key="item.key"
        class="user-tab-item"
        :class="{ selected: modelValue === item.key }"
        @click="selectTab(item.key)"
      >
        <OIcon class="icon"> <component :is="item.icon"></component> </OIcon>
        <span>{{ item.label }}</span>
        <span class="right"></span>
      </li>
    </ul>
  </div>
</template>
<style lang="scss" scoped>
.user {
  background-color: var(--o-color-bg1);
  height: 100%;
  .user-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-bottom: var(--o-spacing-h2);
    padding-top: var(--o-spacing-h2);
    background-color: var(--o-color-bg2);
    margin-bottom: 16px;
    height: 80px;
    .photo {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin-left: 12px;
    }
    .nickname {
      color: var(--o-color-text1);
      margin-left: 20px;
      font-size: 16px;
      font-weight: 300;
      line-height: 24px;
    }
  }
  .user-tab {
    .user-tab-item {
      color: var(--o-color-text1);
      padding-left: 12px;
      height: 56px;
      display: flex;
      cursor: pointer;
      align-items: center;
      font-size: 14px;
      border-left: 2px solid var(--o-color-border3);
      background-color: var(--o-color-bg2);
      margin-bottom: 16px;
      .icon {
        font-size: var(--o-font-size-h5);
        margin-right: var(--o-spacing-h6);
      }
      .right {
        background-image: url("@/assets/right_down.png");
        height: 16px;
        width: 17px;
        position: absolute;
        right: 27px;
      }
    }
    // .selected {
    //   background-color: rgba(0, 47, 167, 0.03);
    //   border-left: 2px solid var(--o-color-border3);
    //   color: var(--o-color-brand1);
    // }
  }
}
</style>
