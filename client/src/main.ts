import '@fontsource/dseg14-modern/300';
import '@fontsource/dseg7-modern/700-italic';
import '@fontsource/overpass/500';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import './assets/main.css';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);

app.mount('#app');
