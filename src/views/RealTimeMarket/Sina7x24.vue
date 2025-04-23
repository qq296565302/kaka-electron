<template>
    <div class="news-container" ref="sinaContainer" @scroll="handleSinaScroll">
        <p class="lastUpdated PingFang">
            <span>最后更新时间：{{ news.lastUpdated }}</span>
            <span class="update" @click="RequestCollection.getSinaData()">刷新</span>
        </p>
        <div class="news-item PingFang" v-for="item in news.sina" :key="item['时间']">
            <div class="news-item-content" @dblclick="copyText(item['内容'])">{{ item["内容"] }}</div>
            <span class="time">{{ dayjs(item["时间"]).format("YYYY 年 MM 月 DD 日 HH:mm:ss") }}</span>
        </div>
        <!-- 回到顶部 -->
        <div class="back-to-top" @click="handleBackToTop" v-if="sinaBackToTop">
            <el-icon class="icon">
                <Top />
            </el-icon>
        </div>
    </div>
</template>

<script setup>
import dayjs from "dayjs";
const { Service, Request, CRUD, Storage, $message } = getCurrentInstance()?.proxy;

const PAGE_NAME = "Sina7x24";

Service.registerApi(PAGE_NAME, {
    fetch: {
        sina: () => Request.get(`/finance/news/sina`),
    },
});

const news = reactive({
    lastUpdated: "", // 最后更新时间
    sina: [],
    count: 0,
    posterData: {},
});

const RequestCollection = {
    // 获取 Sina 7x24 数据
    getSinaData: async () => {
        const result = await CRUD.launch(() => {
            return Service.fetch(PAGE_NAME, undefined, "sina");
        });
        news.lastUpdated = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
        news.sina = result.data;
        news.count = result.count;
        news.posterData = result.posterData;
    },
};


// 使用组合式函数处理滚动和回到顶部
import useScrollToTop from '@/composables/useScrollToTop';
const { 
    container: sinaContainer, 
    showBackToTop: sinaBackToTop, 
    handleScroll: handleSinaScroll, 
    handleBackToTop 
} = useScrollToTop(() => RequestCollection.getSinaData(), { threshold: 200 });

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

onBeforeMount(async () => {
    await RequestCollection.getSinaData();
});

onMounted(async () => {
    // TODO: 监听 ws 消息推送
});

onBeforeUnmount(() => {
    // TODO: 断开 ws 连接
});

defineExpose({
});
</script>

<style scoped lang="scss">
@use "@/views/RealTimeMarket/scss/news.scss";
</style>
