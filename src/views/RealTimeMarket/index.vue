<template>
  <div class='RealTimeMarket'>
    <section class="market"></section>
    <section class="news">
        <News />
    </section>
  </div>
</template>

<script setup>
import News from "./News.vue";
const { } = getCurrentInstance()?.proxy;
onBeforeMount(() => {
})
onMounted(() => {
})
defineExpose({
})

</script>
<style scoped lang='scss'>
.RealTimeMarket{
 display: flex;
 .market{
    flex: 6;
 }
 .news{
    flex: 3;
 }
}
</style>