import { computed, onMounted, onUnmounted, ref } from "vue";

/**
 * 判断是否是移动端
 */
 export const testIsPhone = () => {
  return /Android|webOS|iPhone|iPod|iPad|BlackBerry/i.test(navigator.userAgent);
};
export const useTestIsPhone = () => {
  const bool = ref(testIsPhone())
  const onWindowResize = () => {
    bool.value = testIsPhone();
  }
  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onWindowResize);
      onWindowResize();
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', onWindowResize);
    }
  });
  return computed(() => bool.value);
};
