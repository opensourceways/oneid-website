import { useCommonData } from "../stores/common";
import { onMounted, onUnmounted, ref } from "vue";
import { getUrlByParams, setSessionStorage, removeSessionStorage } from "../utils/utils";

interface ThirdPartyConfig {
  success: Function;
}

const useThirdParty = (config?: ThirdPartyConfig) => {
  const { loginParams } = useCommonData();
  const windowOpener = ref();
  const login = (data: any) => {
    const url = `/oneid/third-party/authorize`;
    const params = {
      client_id: loginParams.value.client_id,
      connection_id: data.connection_id,
      t: new Date().getTime(),
    };
    setSessionStorage('TP_PARAM', JSON.stringify(params));
    windowOpener.value = window.open(
      getUrlByParams(url, params),
      '_blank',
      `width=500,height=700,left=${(screen.width - 500) / 2},top=${(screen.height - 700) / 2
      }`
    );
  }
  const bind = (data: any) => {
    setSessionStorage('TP_BIND', 'true');
    login(data);
  }

  const complete = (e: MessageEvent) => {
    const { type, response } = e.data;
    if (type !== 'authorization_response') {
      return;
    }
    if (response === 'success') {
      windowOpener.value?.close();
      removeSessionStorage('TP_PARAM')
      removeSessionStorage('TP_BIND')
      // 登录成功
      config?.success(e)
    }
  };

  // 监听三方登录结果
  onUnmounted(() => {
    // 移除监听
    window.removeEventListener('message', complete);
  });
  
  onMounted(() => {
    window.addEventListener('message', complete);
  });

  return {
    login,
    bind,
  }
}
export default useThirdParty;
