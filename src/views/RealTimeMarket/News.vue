<template>
    <!-- CLS 数据 -->
    <div class="cls-container" ref="clsContainer" @scroll="handleClsScroll">
        <p class="lastUpdated PingFang">
            <span>最后更新时间：{{ data.lastUpdated }}</span>
            <span class="update" @click="RequestCollection.getClsData()">刷新</span>
        </p>
        <div class="cls-item PingFang" v-for="item in data.cls" :key="item['发布时间']">
            <div class="cls-item-content" @dblclick="copyText(item['内容'])">{{ item["内容"] }}</div>
            <span class="time">{{ dayjs(item["发布时间"]).format("YYYY 年 MM 月 DD 日 HH:mm:ss") }}</span>
        </div>
        <!-- 回到顶部 -->
        <div class="back-to-top" @click="handleBackToTop" v-if="clsBackToTop">
            <el-icon class="icon"><Top /></el-icon>
        </div>
    </div>
</template>

<script setup>
import { createWebSocketService, heartbeatConfig } from "@/utils/websocketService";
const { Service, Request, CRUD, Storage, $message } = getCurrentInstance()?.proxy;

const PAGE_NAME = "News";
const ws = createWebSocketService('market');

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

// CLS 滚动事件 如果滑动距离大于 500px 显示回到顶部按钮，点击按钮，返回顶部
const clsContainer = ref(null);
const clsBackToTop = ref(false);
const handleClsScroll = () => {
    if (clsContainer.value) {
        const scrollTop = clsContainer.value.scrollTop; // 获取滚动距离
        clsBackToTop.value = scrollTop > 500;
    }
};
const handleBackToTop = async () => {
    if (clsContainer.value) {
        clsContainer.value.scrollTop = 0; // 设置滚动距离为 0
        await RequestCollection.getClsData();
    }
};

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

// WebSocket 消息处理
const getOrderMessage = (msg) => {
    // 忽略心跳消息
    if (msg === heartbeatConfig.message) return;
    // 处理接收到的消息
    const receiveMessages = JSON.parse(msg);
    if(receiveMessages.type === 'cls_news_update'){
        data.cls = [...receiveMessages.data.newNews, ...data.cls];
        data.lastUpdated = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
    }
};

onBeforeMount(async () => {
    await RequestCollection.getClsData();
    ws.connect(import.meta.env.VITE_WS_URL, getOrderMessage, true);
});

onMounted(() => {});
defineExpose({
    ...toRefs(data),
});
</script>
<style scoped lang="scss">
.cls-container {
    box-sizing: border-box;
    height: 90%;
    overflow: auto;
    padding: 10px 30px;
    position: relative;
    width: 100%;
    .lastUpdated {
        color: #919191;
        display: flex;
        font-size: 12px;
        height: 40px;
        justify-content: space-between;
        line-height: 40px;
        .update {
            cursor: pointer;
        }
    }
    &::-webkit-scrollbar {
        display: none;
    }
    .cls-item {
        border-bottom: 1px dashed var(--neutral-color);
        box-sizing: border-box;
        color: #131313;
        margin-bottom: 10px;
        opacity: 0.8;
        padding: 10px 0;

        .cls-item-content {
            line-height: 1.8;
            text-align: justify;
            padding: 10px 0;
        }
        .time {
            color: var(--neutral-color);
            font-size: 12px;
        }
    }
    .back-to-top {
        background-color: rgba(255, 255, 255, 0.6);
        border-radius: 100%;
        bottom: 120px;
        cursor: pointer;
        color: rgba(0, 6, 32, 1);
        font-size: 32px;
        height: 50px;
        line-height: 50px;
        position: fixed;
        right: 20px;
        text-align: center;
        width: 50px;
        .icon {
            left: 0px;
            position: relative;
            top: 5px;
        }
    }
}
</style>
