import '@fontsource/dseg14-modern/300';
import '@fontsource/dseg7-modern/700-italic';
import '@fontsource/overpass/300';
import '@fontsource/overpass/500';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import './assets/main.css';
import { router } from './router';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);

app.mount('#app');
