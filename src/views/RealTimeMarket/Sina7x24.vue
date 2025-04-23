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
import WebSocketService from '@zhaoshijun/ws-service';
// 获取单例实例
const ws = WebSocketService.getInstance();
const { Service, Request, CRUD, Storage, $message } = getCurrentInstance()?.proxy;

// 导入IndexedDB辅助工具
import { openDB, saveData, getAllData, clearStore, closeDB } from '@/utils/indexedDBHelper';

const PAGE_NAME = "Sina7x24";

Service.registerApi(PAGE_NAME, {
    fetch: {
        sina: () => Request.get(`/finance/news/sina`),
    },
});

// 数据库配置
const DB_NAME = 'KakaDB';
const DB_VERSION = 1;
const STORE_NAME = 'sina7x24News';
let db = null;

// 初始化IndexedDB
const initIndexedDB = async () => {
    try {
        db = await openDB(DB_NAME, DB_VERSION, (db, event) => {
            // 如果对象存储不存在，创建它
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: '时间' });
                // 创建索引以加快查询
                store.createIndex('time_idx', '时间', { unique: false });
                console.log(`创建对象存储 ${STORE_NAME} 成功`);
            }
        });
        console.log('IndexedDB初始化成功');
        return true;
    } catch (error) {
        console.error('IndexedDB初始化失败:', error);
        return false;
    }
};

// 保存新浪7x24数据到IndexedDB
const saveNewsToIndexedDB = async (newsData) => {
    if (!db) {
        console.warn('IndexedDB未初始化，无法保存数据');
        return false;
    }
    
    try {
        // 保存数据
        await saveData(db, STORE_NAME, newsData);
        console.log(`成功将 ${newsData.length} 条新浪7x24数据保存到IndexedDB`);
        return true;
    } catch (error) {
        console.error('保存新浪7x24数据到IndexedDB失败:', error);
        return false;
    }
};

// 从 IndexedDB 加载新浪7x24数据
const loadNewsFromIndexedDB = async () => {
    if (!db) {
        console.warn('IndexedDB未初始化，无法加载数据');
        return [];
    }
    
    try {
        const storedNews = await getAllData(db, STORE_NAME);
        console.log(`从 IndexedDB 加载了 ${storedNews.length} 条新浪7x24数据`);
        return storedNews;
    } catch (error) {
        console.error('从 IndexedDB 加载新浪7x24数据失败:', error);
        return [];
    }
};

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
        
        // 将新获取的数据保存到 IndexedDB
        if (result.data && result.data.length > 0) {
            await saveNewsToIndexedDB(result.data);
        }
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
// 订阅特定类型的消息
const unsubscribe = ws.subscribe('sina7x24_news_update', (payload, message) => {
    console.log('收到新浪7x24消息更新:', message);
    if (message.data && message.data.newNews) {
        // 将新消息添加到列表头部
        const newNews = message.data.newNews;
        news.sina = [...newNews, ...news.sina];
        news.lastUpdated = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
        
        // 将新收到的消息保存到 IndexedDB
        if (newNews && newNews.length > 0) {
            saveNewsToIndexedDB(newNews).then(success => {
                if (success) {
                    console.log('新收到的新浪7x24消息已保存到IndexedDB');
                }
            });
        }
    }
});
onBeforeMount(async () => {
    // 初始化 IndexedDB
    const dbInitialized = await initIndexedDB();
    
    if (dbInitialized) {
        // 尝试从 IndexedDB 加载数据
        const storedNews = await loadNewsFromIndexedDB();
        if (storedNews && storedNews.length > 0) {
            // 如果有缓存数据，先显示缓存数据
            news.sina = storedNews;
            news.count = storedNews.length;
            news.lastUpdated = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss") + ' (缓存)';
            console.log('从 IndexedDB 加载了缓存的新浪7x24数据');
        }
    }
    
    // 无论是否有缓存数据，都从服务器获取最新数据
    await RequestCollection.getSinaData();
});

onMounted(async () => {
    // TODO: 监听 ws 消息推送
});

onBeforeUnmount(() => {
    unsubscribe();
    // 关闭数据库连接
    if (db) {
        closeDB(db);
        db = null;
    }
});

defineExpose({
});
</script>

<style scoped lang="scss">
@use "@/views/RealTimeMarket/scss/news.scss";
</style>
