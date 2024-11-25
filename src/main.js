import { createApp } from 'vue'
import App from './App.vue'
const app = createApp(App)

// 样式表 统一
import './assets/scss/main.scss'

/* 引入 ElementPlus 组件库 */
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.min.js'
import 'element-plus/dist/index.css'
app.use(ElementPlus, {
  locale: zhCn,
})

/* 引入 ElementPlusIcons 图标 */
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

/* 引入 kaka-axios 网络请求 */
import kakaAxios from './request/kaka-axios'
const request = kakaAxios('/api')

app.config.globalProperties.request = request;

/* 引入 kaka-localstorage 本地存储 */
import kakaLocalStorage from 'kaka-localstorage'
app.config.globalProperties.storage = kakaLocalStorage;

/* 引入 pinia 状态管理 */
import { createPinia } from 'pinia'
const pinia = createPinia()
app.use(pinia)

/* 引入 vue-router@4 路由 */
import router from './router'
app.use(router)

app.mount('#app')
