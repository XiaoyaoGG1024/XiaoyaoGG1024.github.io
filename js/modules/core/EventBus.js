/**
 * 事件总线系统
 * 提供模块间解耦的事件通信机制
 */
class EventBus {
  constructor() {
    this.events = new Map();
    this.onceEvents = new Map();
    this.debugMode = false;
  }

  /**
   * 订阅事件
   * @param {string} eventName 事件名称
   * @param {Function} callback 回调函数
   * @param {Object} context 上下文对象
   * @returns {Function} 取消订阅的函数
   */
  on(eventName, callback, context = null) {
    if (!eventName || typeof callback !== 'function') {
      console.error('EventBus.on: 参数无效', { eventName, callback });
      return () => {};
    }

    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }

    const listener = { callback, context, id: Date.now() + Math.random() };
    this.events.get(eventName).push(listener);

    if (this.debugMode) {
      console.log(`EventBus: 订阅事件 "${eventName}"`, listener);
    }

    // 返回取消订阅函数
    return () => this.off(eventName, listener.id);
  }

  /**
   * 订阅一次性事件
   * @param {string} eventName 事件名称
   * @param {Function} callback 回调函数
   * @param {Object} context 上下文对象
   * @returns {Function} 取消订阅的函数
   */
  once(eventName, callback, context = null) {
    if (!eventName || typeof callback !== 'function') {
      console.error('EventBus.once: 参数无效', { eventName, callback });
      return () => {};
    }

    if (!this.onceEvents.has(eventName)) {
      this.onceEvents.set(eventName, []);
    }

    const listener = { callback, context, id: Date.now() + Math.random() };
    this.onceEvents.get(eventName).push(listener);

    if (this.debugMode) {
      console.log(`EventBus: 订阅一次性事件 "${eventName}"`, listener);
    }

    // 返回取消订阅函数
    return () => this.offOnce(eventName, listener.id);
  }

  /**
   * 触发事件
   * @param {string} eventName 事件名称
   * @param {any} data 事件数据
   * @returns {number} 执行的监听器数量
   */
  emit(eventName, data = null) {
    if (!eventName) {
      console.error('EventBus.emit: 事件名称不能为空');
      return 0;
    }

    let executedCount = 0;

    if (this.debugMode) {
      console.log(`EventBus: 触发事件 "${eventName}"`, data);
    }

    // 执行普通监听器
    if (this.events.has(eventName)) {
      const listeners = [...this.events.get(eventName)]; // 创建副本避免修改问题
      for (const listener of listeners) {
        try {
          if (listener.context) {
            listener.callback.call(listener.context, data);
          } else {
            listener.callback(data);
          }
          executedCount++;
        } catch (error) {
          console.error(`EventBus: 执行监听器时发生错误 "${eventName}"`, error, listener);
        }
      }
    }

    // 执行一次性监听器
    if (this.onceEvents.has(eventName)) {
      const listeners = [...this.onceEvents.get(eventName)];
      this.onceEvents.delete(eventName); // 清除一次性监听器

      for (const listener of listeners) {
        try {
          if (listener.context) {
            listener.callback.call(listener.context, data);
          } else {
            listener.callback(data);
          }
          executedCount++;
        } catch (error) {
          console.error(`EventBus: 执行一次性监听器时发生错误 "${eventName}"`, error, listener);
        }
      }
    }

    if (this.debugMode && executedCount > 0) {
      console.log(`EventBus: 事件 "${eventName}" 执行了 ${executedCount} 个监听器`);
    }

    return executedCount;
  }

  /**
   * 取消事件订阅
   * @param {string} eventName 事件名称
   * @param {string|Function} listenerIdOrCallback 监听器ID或回调函数
   * @returns {boolean} 是否成功取消
   */
  off(eventName, listenerIdOrCallback) {
    if (!eventName) {
      console.error('EventBus.off: 事件名称不能为空');
      return false;
    }

    if (!this.events.has(eventName)) {
      return false;
    }

    const listeners = this.events.get(eventName);
    let removedCount = 0;

    if (typeof listenerIdOrCallback === 'string') {
      // 按ID移除
      const index = listeners.findIndex(listener => listener.id === listenerIdOrCallback);
      if (index !== -1) {
        listeners.splice(index, 1);
        removedCount = 1;
      }
    } else if (typeof listenerIdOrCallback === 'function') {
      // 按回调函数移除
      const originalLength = listeners.length;
      this.events.set(eventName, listeners.filter(listener => listener.callback !== listenerIdOrCallback));
      removedCount = originalLength - this.events.get(eventName).length;
    } else {
      // 移除所有监听器
      this.events.delete(eventName);
      removedCount = listeners.length;
    }

    if (this.debugMode && removedCount > 0) {
      console.log(`EventBus: 从事件 "${eventName}" 移除了 ${removedCount} 个监听器`);
    }

    return removedCount > 0;
  }

  /**
   * 取消一次性事件订阅
   * @param {string} eventName 事件名称
   * @param {string} listenerId 监听器ID
   * @returns {boolean} 是否成功取消
   */
  offOnce(eventName, listenerId) {
    if (!eventName || !listenerId) {
      return false;
    }

    if (!this.onceEvents.has(eventName)) {
      return false;
    }

    const listeners = this.onceEvents.get(eventName);
    const index = listeners.findIndex(listener => listener.id === listenerId);

    if (index !== -1) {
      listeners.splice(index, 1);
      if (listeners.length === 0) {
        this.onceEvents.delete(eventName);
      }
      return true;
    }

    return false;
  }

  /**
   * 移除所有监听器
   * @param {string} eventName 可选，指定事件名称
   */
  clear(eventName = null) {
    if (eventName) {
      this.events.delete(eventName);
      this.onceEvents.delete(eventName);
      if (this.debugMode) {
        console.log(`EventBus: 清除事件 "${eventName}" 的所有监听器`);
      }
    } else {
      this.events.clear();
      this.onceEvents.clear();
      if (this.debugMode) {
        console.log('EventBus: 清除所有监听器');
      }
    }
  }

  /**
   * 获取事件统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const stats = {
      totalEvents: this.events.size + this.onceEvents.size,
      normalEvents: this.events.size,
      onceEvents: this.onceEvents.size,
      totalListeners: 0,
      events: {}
    };

    // 统计普通事件监听器
    for (const [eventName, listeners] of this.events.entries()) {
      stats.totalListeners += listeners.length;
      stats.events[eventName] = {
        type: 'normal',
        listenerCount: listeners.length
      };
    }

    // 统计一次性事件监听器
    for (const [eventName, listeners] of this.onceEvents.entries()) {
      stats.totalListeners += listeners.length;
      if (stats.events[eventName]) {
        stats.events[eventName].onceListenerCount = listeners.length;
      } else {
        stats.events[eventName] = {
          type: 'once',
          listenerCount: listeners.length
        };
      }
    }

    return stats;
  }

  /**
   * 设置调试模式
   * @param {boolean} enabled 是否启用调试
   */
  setDebugMode(enabled = true) {
    this.debugMode = enabled;
    console.log(`EventBus: 调试模式${enabled ? '启用' : '禁用'}`);
  }

  /**
   * 检查是否有监听器
   * @param {string} eventName 事件名称
   * @returns {boolean} 是否有监听器
   */
  hasListeners(eventName) {
    const normalListeners = this.events.has(eventName) && this.events.get(eventName).length > 0;
    const onceListeners = this.onceEvents.has(eventName) && this.onceEvents.get(eventName).length > 0;
    return normalListeners || onceListeners;
  }

  /**
   * 延迟触发事件
   * @param {string} eventName 事件名称
   * @param {any} data 事件数据
   * @param {number} delay 延迟时间(ms)
   * @returns {number} 定时器ID
   */
  emitAsync(eventName, data = null, delay = 0) {
    return setTimeout(() => {
      this.emit(eventName, data);
    }, delay);
  }

  /**
   * 批量触发事件
   * @param {Array} events 事件数组 [{name, data}, ...]
   */
  emitBatch(events) {
    if (!Array.isArray(events)) {
      console.error('EventBus.emitBatch: 参数必须是数组');
      return;
    }

    let successCount = 0;
    for (const event of events) {
      if (event && event.name) {
        try {
          this.emit(event.name, event.data);
          successCount++;
        } catch (error) {
          console.error('EventBus.emitBatch: 触发事件失败', event, error);
        }
      }
    }

    if (this.debugMode) {
      console.log(`EventBus: 批量触发事件完成，成功 ${successCount}/${events.length}`);
    }
  }
}

// 创建全局单例
const eventBus = new EventBus();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EventBus, eventBus };
} else if (typeof window !== 'undefined') {
  window.EventBus = EventBus;
  window.eventBus = eventBus;
}