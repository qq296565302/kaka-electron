<template>
    <div class="Page-Home">
        <Topbar />
        <Header />
        <router-view class="layout-container" />
    </div>
</template>

<script setup>
import Header from "./Layout/Header.vue";
import Topbar from "./Layout/Topbar.vue";
const {} = getCurrentInstance()?.proxy;
onBeforeMount(() => {});
onMounted(() => {

});
defineExpose({});
</script>
<style scoped lang="scss">
.Page-Home {
    box-sizing: border-box;
    height: 100%;
    overflow: hidden;
    position: relative;
    width: 100%;
    .layout-container {
        height: calc(100% - var(--client-topbar-height) - var(--layout-header-height) - 1px);
        width: 100%;
    }
}
</style>
