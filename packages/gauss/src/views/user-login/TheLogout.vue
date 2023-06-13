<script setup lang="ts">
import { getCommunityParams } from '@/shared/utils';
import { getUserAuth, logout } from 'shared/utils/login';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
onMounted(() => {
  const redirectUri = route.query.redirect_uri as string;
  if (redirectUri) {
    const { token } = getUserAuth();
    if (token) {
      logout(getCommunityParams(true), redirectUri);
    } else {
      location.href = redirectUri;
    }
  }
});
</script>
<template>
  <div></div>
</template>
