import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

import svg from './assets/svg/init' // svg 图标导出，全局引入
import SVG from './components/Frame/SVG.vue'// SVG 组件

// 样式表 统一
import './assets/scss/main.scss'
const app = createApp(App)

app.component('SVG', SVG) // 注册 SVG 组件
app.config.globalProperties.svg = svg // svg 图标导出挂载全局

app.use(router)
app.mount('#app')
