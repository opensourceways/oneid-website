import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import OpenDesign from 'opendesign';
import VueDOMPurifyHTML from 'vue-dompurify-html';
import '@/shared/style/base.scss';
import '@opensig/opendesign/es/index.css';
import '@/shared/style/theme/default-light.token.css';
import '@/shared/style/theme/dark.token.css';
import '@/shared/style/theme/index.scss';
import '@/shared/style/markdown.scss';
import '@/shared/styles/index.scss';

const app = createApp(App);

app.use(VueDOMPurifyHTML);
app.use(router);
app.use(createPinia());
app.use(OpenDesign);

app.mount('#app');
