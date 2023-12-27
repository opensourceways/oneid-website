<script setup lang="ts">
import { getUserAuth, logout } from 'shared/utils/login';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
onMounted(() => {
  const redirectUri = route.query.redirect_uri as string;
  const idToken = route.query.id_token as string;
  if (redirectUri) {
    const { token } = getUserAuth();
    if (token) {
      logout(
        { community: import.meta.env?.VITE_COMMUNITY, idToken },
        redirectUri
      );
    } else {
      location.href = redirectUri;
    }
  }
});
</script>
<template>
  <div></div>
</template>
