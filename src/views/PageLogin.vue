<template>
	<div class="Page-Login _drag">
		<main class="container">
			<div class="left">
				<Logo class="logo" />
				<p class="slogan Collegiate">
					Sharp tools
					<br />
					make good work
				</p>
				<p class="_no-drag audio-button">
					<SVG :use="svg.voice" class="svg" />
					Read Aloud
				</p>
				<p class="footer">
					<span v-for="f in footer" :key="f">{{ f }}</span>
				</p>
			</div>
			<div class="right">
				<p class="en">
					If you slack off
					<br />
					and I slack off,
					<br />
					the boss's BMW
					<br />
					will turn into a bicycle.
				</p>
				<div class="login-form _no-drag">
					<input type="text" placeholder="Username" class="login-input" />
					<input type="password" placeholder="Password" class="login-input" />
				</div>
				<span class="login-button _no-drag" @click="loginClickHandle">Let's go</span>
				<span class="tips">提示：当前系统暂未开放注册，仅限内测账号登录</span>
			</div>
		</main>
		<p class="sever-status">OFFLINE</p>
	</div>
</template>

<script setup>
import Logo from '../components/Logo.vue'
import { reactive, toRefs, onBeforeMount, onMounted, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
/**
 * 路由对象
 */
const route = useRoute()
/**
 * 路由实例
 */
const router = useRouter()
/**
 * 公共挂载方法和变量
 */
const { proxy } = getCurrentInstance()
const { svg } = proxy
/**
 * 数据部分
 */
const data = reactive({})
const footer = ['CET', 'IELTS', 'GEE', 'TOEFL', 'PETS']

const loginClickHandle = async () => {
	router.push('/home')
}
onBeforeMount(() => {})
onMounted(() => {})
defineExpose({
	...toRefs(data),
})
</script>
<style scoped lang="scss">
@use '../assets/scss/login.scss';
</style>
