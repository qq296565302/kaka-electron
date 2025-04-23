<template>
    <!-- CLS 数据 -->
    <div class="news-container" ref="clsContainer" @scroll="handleClsScroll">
        <p class="lastUpdated PingFang">
            <span>最后更新时间：{{ data.lastUpdated }}</span>
            <span class="update" @click="RequestCollection.getClsData()">刷新</span>
        </p>
        <div class="news-item PingFang" v-for="item in data.cls" :key="item['发布时间']">
            <div class="news-item-content" @dblclick="copyText(item['内容'])">{{ item["内容"] }}</div>
            <span class="time">{{ dayjs(item["发布时间"]).format("YYYY 年 MM 月 DD 日 HH:mm:ss") }}</span>
        </div>
        <!-- 回到顶部 -->
        <div class="back-to-top" @click="handleBackToTop" v-if="clsBackToTop">
            <el-icon class="icon"><Top /></el-icon>
        </div>
    </div>
</template>

<script setup>
import WebSocketService from '@zhaoshijun/ws-service';
// 获取单例实例
const ws = WebSocketService.getInstance();
const { Service, Request, CRUD, Storage, $message } = getCurrentInstance()?.proxy;

const PAGE_NAME = "News";

Service.registerApi(PAGE_NAME, {
    fetch: {
        cls: (symbol) => Request.get(`/finance/news/cls`, { symbol }),
    },
});

/**
 * 请求集合
 */
import dayjs from "dayjs";
const RequestCollection = {
    // 获取 CLS 数据
    getClsData: async (type) => {
        const result = await CRUD.launch(() => {
            return Service.fetch(PAGE_NAME, type, "cls");
        });
        data.lastUpdated = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
        data.cls = result.data;
        data.count = result.count;
    },
};

const data = reactive({
    lastUpdated: "", // 最后更新时间
    cls: [],
    count: 0,
    posterData: {},
});

// 使用组合式函数处理滚动和回到顶部
import useScrollToTop from '@/composables/useScrollToTop';
const { 
    container: clsContainer, 
    showBackToTop: clsBackToTop, 
    handleScroll: handleClsScroll, 
    handleBackToTop 
} = useScrollToTop(() => RequestCollection.getClsData(), { threshold: 200 });

// 复制文本内容
const copyText = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        $message.success("已复制到剪贴板");
    } catch (err) {
        console.error("复制失败:", err);
        $message.error("复制失败");
    }
};



// 订阅特定类型的消息
const unsubscribe = ws.subscribe('cls_news_update', (payload, message) => {
    console.log('收到财联社消息更新:', message);
    if (message && message.newNews) {
        // 将新消息添加到列表头部
        data.cls = [...message.newNews, ...data.cls];
        data.lastUpdated = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
    }
});
onBeforeUnmount(() => {
    unsubscribe();
});

onBeforeMount(async () => {
    await RequestCollection.getClsData();
});

onMounted(() => {});


defineExpose({
    ...toRefs(data),
});
</script>
<style scoped lang="scss">
@use "@/views/RealTimeMarket/scss/news.scss";
</style>
