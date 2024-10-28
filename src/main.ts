import App from './App.svelte';
import { mount } from 'svelte';

import 'quill/dist/quill.snow.css';

mount(App, {
  target: document.getElementById('app') as HTMLElement
});