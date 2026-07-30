import App from './App.svelte';
import { mount, unmount } from 'svelte';
const app = mount(App, { target: document.querySelector('#app') });
window.__designosUnmount = () => unmount(app);
