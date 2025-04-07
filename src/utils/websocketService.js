// 使用闭包保存全局状态，实现单例模式
const instances = {};

/**
 * 创建WebSocket服务实例
 * @param {string} instanceId - 实例标识符
 * @returns {Object} - WebSocket服务实例
 */
export const createWebSocketService = (instanceId = 'default') => {
  // 如果已存在该实例，直接返回
  if (instances[instanceId]) {
    console.log(`复用已存在的WebSocket实例: ${instanceId}`);
    return instances[instanceId];
  }

  // WebSocket连接实例
  const socket = ref(null);
  // 心跳定时器
  let heartbeatTimer = null;
  // 当前连接URL
  let currentUrl = '';
  // 消息回调函数
  let messageCallback = null;
  // 是否开启心跳检测
  let enableHeartbeat = true;

  // 重连配置
  const reconnectConfig = {
    count: 0,                // 当前重连次数
    maxAttempts: 10,         // 最大重连次数
    baseDelay: 1000,         // 基础延迟时间（毫秒）
    maxDelay: 30000,         // 最大延迟时间（毫秒）
    timer: null,             // 重连定时器
    isDestroyed: false       // 是否已销毁
  };

  // 心跳配置
  const heartbeatConfig = {
    loseCount: 0,      // 失去心跳次数
    loseLimit: 3,      // 失去心跳次数达到后触发重连
    loseMultiple: 2,   // 连续失去心跳倍数
    interval: 5000,    // 心跳间隔（毫秒）
    message: 'ping'    // 心跳消息内容
  };

  /**
   * 计算重连延迟时间（指数退避策略）
   * @returns {number} - 延迟时间（毫秒）
   */
  const getReconnectDelay = () => {
    // 使用指数退避算法：baseDelay * 2^reconnectCount，并添加一些随机性
    const delay = Math.min(
      reconnectConfig.baseDelay * Math.pow(2, reconnectConfig.count) + Math.random() * 1000,
      reconnectConfig.maxDelay
    );
    console.log(`[WebSocket:${instanceId}] 重连延迟: ${delay}ms, 当前重连次数: ${reconnectConfig.count}`);
    return delay;
  };

  /**
   * 创建WebSocket连接
   */
  const createConnection = () => {
    if (socket.value) {
      closeConnection();
    }

    try {
      console.log(`[WebSocket:${instanceId}] 建立连接: ${currentUrl}`);
      socket.value = new WebSocket(currentUrl);
      
      // 设置事件处理
      socket.value.onopen = handleOpen;
      socket.value.onmessage = handleMessage;
      socket.value.onerror = handleError;
      socket.value.onclose = handleClose;
    } catch (error) {
      console.error(`[WebSocket:${instanceId}] 连接创建失败:`, error);
      attemptReconnect();
    }
  };

  /**
   * 连接打开处理
   */
  const handleOpen = () => {
    console.log(`[WebSocket:${instanceId}] 连接成功`);
    // 连接成功后重置重连计数
    reconnectConfig.count = 0;
    
    // 如果启用心跳检测，开始发送心跳
    if (enableHeartbeat) {
      startHeartbeat();
    }
  };

  /**
   * 消息接收处理
   * @param {MessageEvent} event - 接收到的消息事件
   */
  const handleMessage = (event) => {
    // 收到消息后重置心跳丢失计数
    heartbeatConfig.loseCount = 0;
    
    // 如果设置了消息回调，则调用回调处理消息
    if (messageCallback) {
      messageCallback(event.data);
    }
  };

  /**
   * 连接错误处理
   * @param {Event} event - 错误事件
   */
  const handleError = (event) => {
    console.error(`[WebSocket:${instanceId}] 连接错误:`, event);
    closeConnection();
    socket.value = null;
    attemptReconnect();
  };

  /**
   * 连接关闭处理
   * @param {CloseEvent} event - 关闭事件
   */
  const handleClose = (event) => {
    console.log(`[WebSocket:${instanceId}] 连接关闭:`, event);
    
    // 如果不是正常关闭，尝试重连
    if (!event.wasClean) {
      console.log(`[WebSocket:${instanceId}] 连接非正常关闭，尝试重连`);
      socket.value = null;
      attemptReconnect();
    }
  };

  /**
   * 尝试重新连接
   */
  const attemptReconnect = () => {
    // 如果组件已销毁，不再尝试重连
    if (reconnectConfig.isDestroyed) {
      console.log(`[WebSocket:${instanceId}] 组件已销毁，取消重连`);
      return;
    }
    
    if (reconnectConfig.count >= reconnectConfig.maxAttempts) {
      console.log(`[WebSocket:${instanceId}] 达到最大重连次数(${reconnectConfig.maxAttempts})，停止重连`);
      return;
    }
    
    reconnectConfig.count++;
    const delay = getReconnectDelay();
    
    console.log(`[WebSocket:${instanceId}] 连接失败，${delay}ms后第${reconnectConfig.count}次重连...`);
    reconnectConfig.timer = setTimeout(() => {
      // 再次检查组件是否已销毁
      if (reconnectConfig.isDestroyed) {
        console.log(`[WebSocket:${instanceId}] 组件已销毁，取消执行重连`);
        return;
      }
      createConnection();
    }, delay);
  };

  /**
   * 开始心跳检测
   */
  const startHeartbeat = () => {
    stopHeartbeat();
    
    // 如果组件已销毁，不再启动心跳
    if (reconnectConfig.isDestroyed) {
      console.log(`[WebSocket:${instanceId}] 组件已销毁，不启动心跳`);
      return;
    }
    
    // 立即发送一次心跳
    sendMessage(heartbeatConfig.message);
    
    // 设置定时发送心跳
    heartbeatTimer = setInterval(() => {
      // 检查组件是否已销毁
      if (reconnectConfig.isDestroyed) {
        console.log(`[WebSocket:${instanceId}] 组件已销毁，停止心跳`);
        stopHeartbeat();
        return;
      }
      
      // 检查连接状态
      if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
        stopHeartbeat();
        return;
      }
      
      // 发送心跳消息
      sendMessage(heartbeatConfig.message);
      
      // 增加心跳丢失计数
      heartbeatConfig.loseCount++;
      
      // 如果心跳丢失次数达到限制，尝试重连
      if (heartbeatConfig.loseCount >= heartbeatConfig.loseLimit) {
        console.log(`[WebSocket:${instanceId}] 心跳丢失(${heartbeatConfig.loseCount}次)，尝试重连`);
        stopHeartbeat();
        socket.value = null;
        attemptReconnect();
      }
    }, heartbeatConfig.interval);
  };

  /**
   * 停止心跳检测
   */
  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  };

  /**
   * 关闭连接
   */
  const closeConnection = () => {
    stopHeartbeat();
    
    if (socket.value) {
      try {
        console.log(`[WebSocket:${instanceId}] 关闭连接`);
        socket.value.close();
      } catch (error) {
        console.error(`[WebSocket:${instanceId}] 关闭连接错误:`, error);
      } finally {
        socket.value = null;
      }
    }
  };

  /**
   * 发送消息
   * @param {string} message - 要发送的消息
   * @returns {boolean} - 是否发送成功
   */
  const sendMessage = (message) => {
    if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
      console.warn(`[WebSocket:${instanceId}] 连接未打开，无法发送消息`);
      return false;
    }
    
    try {
      socket.value.send(message);
      return true;
    } catch (error) {
      console.error(`[WebSocket:${instanceId}] 发送消息错误:`, error);
      return false;
    }
  };

  /**
   * 初始化WebSocket连接
   * @param {string} url - WebSocket连接URL
   * @param {Function} callback - 消息回调函数
   * @param {boolean} useHeartbeat - 是否启用心跳检测
   */
  const connect = (url, callback, useHeartbeat = true) => {
    currentUrl = url;
    messageCallback = callback;
    enableHeartbeat = useHeartbeat;
    
    // 重置重连计数
    reconnectConfig.count = 0;
    
    // 创建连接
    createConnection();
  };

  /**
   * 重新连接
   */
  const reconnect = () => {
    // 如果组件已销毁，不再重新连接
    if (reconnectConfig.isDestroyed) {
      console.log(`[WebSocket:${instanceId}] 组件已销毁，取消手动重连`);
      return;
    }
    
    closeConnection();
    socket.value = null;
    reconnectConfig.count = 0;
    createConnection();
  };

  // 组件卸载前清理资源
  onBeforeUnmount(() => {
    console.log(`[WebSocket:${instanceId}] 组件卸载，关闭连接`);
    closeConnection();
    reconnectConfig.isDestroyed = true;
    if (reconnectConfig.timer) {
      clearTimeout(reconnectConfig.timer);
      reconnectConfig.timer = null;
    }
  });

  // 创建服务实例
  const service = {
    connect,
    sendMessage,
    closeConnection,
    reconnect,
    // 获取当前连接状态
    getStatus: () => socket.value ? socket.value.readyState : WebSocket.CLOSED
  };

  // 保存实例
  instances[instanceId] = service;
  
  return service;
};

/**
 * 获取WebSocket服务实例
 * @param {string} instanceId - 实例标识符
 * @returns {Object} - WebSocket服务实例
 */
export const getWebSocketService = (instanceId = 'default') => {
  return instances[instanceId] || createWebSocketService(instanceId);
};

/**
 * 关闭所有WebSocket连接
 */
export const closeAllWebSockets = () => {
  Object.values(instances).forEach(instance => {
    if (instance.closeConnection) {
      instance.closeConnection();
    }
  });
};

export default {
  createWebSocketService,
  getWebSocketService,
  closeAllWebSockets
};
