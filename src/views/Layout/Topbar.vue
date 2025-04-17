<template>
  <div class='Layout-Topbar _drag'>
    <div class="service-time LCD">{{ serviceTime }}</div>
  </div>
</template>

<script setup>
// ====== 导入依赖 ======
import { useTradeStore } from 'stores/trade'; // 状态管理 store
import dayjs from 'dayjs'; // 日期处理库

// ====== 基础变量和API注册 ======
const tradeStore = useTradeStore(); // 获取交易状态 store
const RequestName = 'Topbar'; // API 名称标识
const { Service, Storage, Request, Utils, CRUD } = getCurrentInstance()?.proxy; // 获取全局API等
// 注册接口，分别获取服务器时间和交易日历
Service.registerApi(RequestName, {
  fetch: {
    serviceTime: () => Request.get(`/finance/time`), // 获取服务器时间
    tradeCalendar: () => Request.get(`/finance/trade-calendar`), // 获取交易日历
  },
});

const serviceTime = ref(''); // 当前服务时间字符串
let timer = null; // 定时器句柄
let currentTimestamp = null; // 当前服务时间戳（毫秒）

// ====== 工具函数 ======
// 获取距离当前日期最近且不晚于当前日期的交易日
function getNearestTradeDate(currentTimestamp, tradeCalendar) {
  const currentDateStr = dayjs(currentTimestamp).format('YYYY-MM-DD');
  const pastTradeDates = tradeCalendar.value.filter(date => dayjs(date).isSameOrBefore(currentDateStr));
  if (pastTradeDates.length > 0) {
    // 取最大（最接近当前日期）的日期
    return pastTradeDates.sort((a, b) => dayjs(b).diff(dayjs(a)))[0];
  }
  return null;
}

// 判断当前时间是否在交易时段（9:30-11:30 或 13:00-15:00）
function isInTradeTime(currentTimestamp) {
  const currentTime = dayjs(currentTimestamp);
  const morningStart = currentTime.hour(9).minute(30).second(0);
  const morningEnd = currentTime.hour(11).minute(30).second(0);
  const afternoonStart = currentTime.hour(13).minute(0).second(0);
  const afternoonEnd = currentTime.hour(15).minute(0).second(0);
  return (
    (currentTime.isAfter(morningStart) && currentTime.isBefore(morningEnd)) ||
    (currentTime.isAfter(afternoonStart) && currentTime.isBefore(afternoonEnd))
  );
}

// 获取最近一次交易时段的结束时间（上午11:30或下午15:00，且不晚于当前时间）
function getLastTradeTime(currentTimestamp) {
  const currentDateStr = dayjs(currentTimestamp).format('YYYY-MM-DD');
  const morningEnd = dayjs(`${currentDateStr} 11:30:00`);
  const afternoonEnd = dayjs(`${currentDateStr} 15:00:00`);
  if (dayjs(currentTimestamp).isAfter(afternoonEnd)) {
    return afternoonEnd.format('YYYY-MM-DD HH:mm:ss');
  } else if (dayjs(currentTimestamp).isAfter(morningEnd)) {
    return morningEnd.format('YYYY-MM-DD HH:mm:ss');
  }
  return null;
}

// ====== 主业务逻辑：更新时间和交易状态 ======
/**
 * 1. 每秒更新时间 currentTimestamp 和 serviceTime
 * 2. 判断当前日期是否为交易日
 *    - 不是：查找最近的交易日并打印，交易状态设为0（休市）
 *    - 是：判断是否在交易时段
 *        - 在：交易状态设为1（开市）
 *        - 不在：交易状态设为2（已收盘），并打印最近一次交易时间
 */
const updateServiceTime = () => {
  if (currentTimestamp === null) return;
  currentTimestamp += 1000;
  serviceTime.value = dayjs(currentTimestamp).format('YYYY-MM-DD HH:mm:ss');
  const currentDateStr = dayjs(currentTimestamp).format('YYYY-MM-DD');
  // 1. 判断是否为交易日
  if (!tradeCalendar.value.includes(currentDateStr)) {
    const nearestTradeDate = getNearestTradeDate(currentTimestamp, tradeCalendar);
    if (nearestTradeDate) {
      tradeStore.updateNearestTradeDate(nearestTradeDate);
    }
    tradeStore.updateTradeStatus('0');
    return;
  }
  // 2. 判断是否在交易时段
  if (isInTradeTime(currentTimestamp)) {
    tradeStore.updateTradeStatus('1');
  } else {
    tradeStore.updateTradeStatus('2');
    const lastTradeTime = getLastTradeTime(currentTimestamp);
    if (lastTradeTime) {
      tradeStore.updateLastTradeTime(lastTradeTime);
    }
  }
};

// ====== 交易状态响应式变量及监听 ======
const tradeStatus = ref(''); // 当前交易状态名称
let lastTradeOpenTime = null; // 最近一次交易状态为1的时间（可扩展用）

// 监听交易状态变化，实时更新 tradeStatus
watch(() => tradeStore.tradeStatus, () => {
  tradeStatus.value = tradeStore.tradeStatusName;
});

// ====== 交易日历获取 ======
const tradeCalendar = ref([]); // 交易日历数组
const getTradeCalendar = async () => {
  const result = await CRUD.launch(() => {
    return Service.fetch(RequestName, undefined, "tradeCalendar");
  });
  // 格式化为 'YYYY-MM-DD' 字符串数组
  tradeCalendar.value = result.data.map(item => {
    return dayjs(item.trade_date).format('YYYY-MM-DD');
  });
};

// ====== 生命周期：初始化和清理 ======
onMounted(async () => {
  // 获取服务器当前时间
  const result = await CRUD.launch(() => {
    return Service.fetch(RequestName, undefined, "serviceTime");
  });
  currentTimestamp = dayjs(result.data).valueOf();
  serviceTime.value = dayjs(currentTimestamp).format('YYYY-MM-DD HH:mm:ss');
  // 启动定时器每秒更新时间和交易状态
  timer = setInterval(updateServiceTime, 1000);
  // 获取交易日历
  await getTradeCalendar();
});

// 组件卸载时清理定时器
onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});

defineExpose({
  // 可根据需要暴露方法
});

</script>

<style scoped lang='scss'>
.Layout-Topbar {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 0 10px;

  height: var(--client-topbar-height);
  background-color: var(--main-c-dark);

  .service-time {
    color: #fff;
    letter-spacing: 2px;
  }
}
</style>