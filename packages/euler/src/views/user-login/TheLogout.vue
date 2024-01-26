<script setup lang="ts">
import { getUserAuth, logout } from 'shared/utils/login';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { validLoginUrl } from 'shared/utils/login-valid-url';
const route = useRoute();
onMounted(() => {
  validLoginUrl().then(() => {
    const redirectUri = route.query.redirect_uri as string;
    if (redirectUri) {
      const { token } = getUserAuth();
      if (token) {
        logout(undefined, redirectUri);
      } else {
        location.href = redirectUri;
      }
    }
  })
});
</script>
<template>
  <div></div>
</template>
