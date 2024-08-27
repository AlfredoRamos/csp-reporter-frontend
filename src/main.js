import { createApp } from 'vue';
import { createPinia } from 'pinia';
import VueGtag from 'vue-gtag';

import App from '@/App.vue';
import router from '@/router';
import http from '@/modules/http';

import '@/assets/css/style.css';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);

const googleAnalytics = import.meta.env.VITE_GOOGLE_ANALYTICS ?? '';

if (googleAnalytics?.length > 0) {
	app.use(VueGtag, { config: { id: googleAnalytics } });
}

app.provide('http', http);
app.mount('#app');
