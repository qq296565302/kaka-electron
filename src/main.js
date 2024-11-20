import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 样式表 统一
import './assets/scss/main.scss'
const app = createApp(App)


app.use(router)
app.mount('#app')
