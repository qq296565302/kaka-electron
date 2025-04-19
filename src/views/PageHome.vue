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
import { createWebSocketService, heartbeatConfig } from "@/utils/websocketService";
import eventBus from "@/utils/eventBus";

const { Service, Request, CRUD, Storage, $message } = getCurrentInstance()?.proxy;

// 创建WebSocket服务实例
const ws = createWebSocketService('market');

// WebSocket 消息处理 - 中央处理器
const handleWebSocketMessage = (msg) => {
    // 忽略心跳消息
    if (msg === heartbeatConfig.message) return;
    
    try {
        // 处理接收到的消息
        const receiveMessages = JSON.parse(msg);
        console.log('收到WebSocket消息:', receiveMessages.type);
        
        // 根据消息类型分发到不同的处理函数
        if (receiveMessages.type) {
            // 通过事件总线发送消息，让对应的组件处理
            eventBus.emit(receiveMessages.type, receiveMessages.data);
        }
    } catch (error) {
        console.error('解析WebSocket消息失败:', error);
    }
};
onBeforeMount(() => {});
onMounted(() => {
    // 连接WebSocket并设置消息处理函数
    ws.connect(import.meta.env.VITE_WS_URL, handleWebSocketMessage, true);
    console.log('WebSocket已连接，等待消息...');
});

// 组件卸载前关闭WebSocket连接
onBeforeUnmount(() => {
    ws.closeConnection();
    console.log('WebSocket连接已关闭');
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
