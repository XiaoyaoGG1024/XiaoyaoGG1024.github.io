export default class StateManager {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.state = {
      // ...初始化所有全局状态...
      realmIndex: 0,
      stageIndex: 0,
      level: 1,
      exp: 0,
      tribulation: { needed: false, successRate: 0.3, failCount: 0 },
      attributes: {
        attack: 10, defense: 8, hp: 100, mana: 50,
        spirit: 30, luck: 5, comprehension: 7, spiritualStone: 0
      },
      totalCultivationTime: 0,
      characterName: '',
      appliedMinutes: 0,
      logs: []
    };
    this.subscribers = [];
    this.STORAGE_KEYS = {
      STATE: 'cultivationState_v2',
      APPLIED_MINUTES: 'cultivationAppliedMinutes_v2',
      LOGS: 'cultivationLogs_v2'
    };
  }

  getState() {
    return { ...this.state };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.eventBus.emit('state:change', this.state);
    this.subscribers.forEach(fn => fn(this.state));
  }

  subscribe(fn) {
    this.subscribers.push(fn);
  }

  // 保存状态到localStorage
  saveState() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.STATE, JSON.stringify(this.state));
      return true;
    } catch (error) {
      console.error('保存状态失败:', error);
      return false;
    }
  }

  // 从localStorage加载状态
  loadState() {
    try {
      const savedState = localStorage.getItem(this.STORAGE_KEYS.STATE);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        this.setState(parsedState);
        return true;
      }
      return false;
    } catch (error) {
      console.error('加载状态失败:', error);
      return false;
    }
  }

  // 清除所有保存的数据
  clearAllData() {
    try {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      this.resetToDefault();
      return true;
    } catch (error) {
      console.error('清除数据失败:', error);
      return false;
    }
  }

  // 重置为默认状态
  resetToDefault() {
    this.state = {
      realmIndex: 0,
      stageIndex: 0,
      level: 1,
      exp: 0,
      tribulation: { needed: false, successRate: 0.3, failCount: 0 },
      attributes: {
        attack: 10, defense: 8, hp: 100, mana: 50,
        spirit: 30, luck: 5, comprehension: 7, spiritualStone: 0
      },
      totalCultivationTime: 0,
      characterName: '',
      appliedMinutes: 0,
      logs: []
    };
    this.eventBus.emit('state:reset', this.state);
  }

  // 导出状态数据
  exportState() {
    return {
      version: "3.0.0",
      formatVersion: 3,
      timestamp: Date.now(),
      date: new Date().toLocaleString('zh-CN'),
      gameVersion: "修仙系统 v3.0",
      cultivation: {
        state: this.state,
        appliedMinutes: this.state.appliedMinutes,
        logs: this.state.logs
      },
      compatibility: {
        minSupportedVersion: "1.0.0",
        requiredFeatures: ["基础修仙", "属性系统"],
        optionalFeatures: ["渡劫系统", "奇遇系统", "日志系统"]
      },
      metadata: {
        characterName: this.state.characterName || "道友",
        description: "修仙系统存档文件",
        exportedBy: "CultivationManager v3.0",
        platform: "Web"
      }
    };
  }

  // 导入状态数据
  importState(data) {
    try {
      if (!data || !data.cultivation) {
        throw new Error('无效的存档数据格式');
      }

      const migratedData = this.migrateSaveData(data);
      if (!migratedData) {
        throw new Error('数据迁移失败');
      }

      this.setState(migratedData.cultivation.state);
      return true;
    } catch (error) {
      console.error('导入状态失败:', error);
      return false;
    }
  }

  // 数据迁移（简化版）
  migrateSaveData(data) {
    try {
      // 如果已经是最新版本，直接返回
      if (data.formatVersion === 3) {
        return data;
      }

      // 简化迁移逻辑，实际项目中需要更复杂的处理
      const migratedData = {
        ...data,
        version: "3.0.0",
        formatVersion: 3,
        timestamp: Date.now(),
        date: new Date().toLocaleString('zh-CN')
      };

      return migratedData;
    } catch (error) {
      console.error('数据迁移失败:', error);
      return null;
    }
  }
}