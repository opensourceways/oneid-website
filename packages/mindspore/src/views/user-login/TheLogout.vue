<script setup lang="ts">
import { getUserAuth, logout } from 'shared/utils/login';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
onMounted(() => {
  const redirect_uri = route.query.redirect_uri as string;
  const id_token = route.query.id_token as string;
  if (redirect_uri) {
    const { token } = getUserAuth();
    if (token) {
      logout({ community: 'mindspore', id_token }, redirect_uri);
    } else {
      location.href = redirect_uri;
    }
  }
});
</script>
<template>
  <div></div>
</template>
