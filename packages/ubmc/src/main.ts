import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import ElementPlus from 'element-plus';
import OpenDesign from 'opendesign';
import '@/shared/styles/index.scss';
import 'shared/styles/index.scss';
import VueDOMPurifyHTML from 'vue-dompurify-html';

const app = createApp(App);

app.use(VueDOMPurifyHTML);
app.use(router);
app.use(createPinia());
app.use(ElementPlus);
app.use(OpenDesign);

app.mount('#app');
