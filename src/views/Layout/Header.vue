<template>
    <div class="Layout-Header"></div>
</template>

<script setup>
const {} = getCurrentInstance()?.proxy;
onBeforeMount(() => {});
onMounted(() => {});
defineExpose({});
</script>
<style scoped lang="scss">
.Layout-Header {
    height: var(--layout-header-height);
    background-color: var(--primary-color);
    transition: height 0.5s ease;
}
</style>
