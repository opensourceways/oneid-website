<script lang="ts" setup>
import { useI18n } from '../i18n';
import { ref } from 'vue';
import zxcvbn from 'zxcvbn';

const i18n = useI18n();
const color = ref<string>('');
const scoreLabel = ref<string>('');
const score = ref<number>(-1);
const scoreObj: any = {
  0: {
    label: i18n.value.VERY_WEAK,
    color: '#f3524d',
  },
  1: {
    label: i18n.value.WEAK,
    color: '#ff7873',
  },
  2: {
    label: i18n.value.MIDDLE,
    color: '#ff8e36',
  },
  3: {
    label: i18n.value.STRONG,
    color: '#93e95b',
  },
  4: {
    label: i18n.value.VERY_STRONG,
    color: '#6dc335',
  },
};
const init = (password: string) => {
  if (!password) {
    color.value = '';
    scoreLabel.value = '';
    score.value = -1;
    return;
  }
  score.value = zxcvbn(password).score;
  const { label = '', color: _color = '' } = scoreObj[score.value];
  color.value = _color;
  scoreLabel.value = label;
};
defineExpose({ init });
const map = new Array(5).fill(0);
</script>

<template>
  <div class="power-body">
    {{ i18n.PWD_STRENGTH + scoreLabel }}
    <div class="power-map">
      <div
        v-for="(item, index) in map"
        :key="index"
        class="power-item"
        :class="score >= index ? 'select' : ''"
      ></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.power-body {
  width: 100%;
  .power-map {
    padding-top: var(--o-spacing-h9);
    display: flex;
    column-gap: 2px;
    .power-item {
      height: 4px;
      border: 1px solid var(--o-color-border1);
      border-radius: 2px;
      flex: 1;
    }
    .select {
      border-color: v-bind(color);
      background-color: v-bind(color);
    }
  }
}
</style>
