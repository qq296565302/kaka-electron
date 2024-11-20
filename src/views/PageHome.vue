<template>
	<div class="Page-Home _drag"></div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watch, computed, getCurrentInstance, h, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const { proxy } = getCurrentInstance()

const data = reactive({})

onBeforeMount(() => {})
onMounted(() => {})
defineExpose({
	...toRefs(data),
})
</script>
<style scoped lang="scss"></style>
