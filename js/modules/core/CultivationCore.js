import EventBus from './EventBus.js';
import StateManager from './StateManager.js';
import RealmManager from '../Cultivation/RealmManager.js';
import AttributeManager from '../Cultivation/AttributeManager.js';
import TribulationManager from '../Cultivation/TribulationManager.js';
import AdventureManager from '../Adventure/AdventureManager.js';

// 核心入口，统一管理各模块
export class CultivationCore {
  constructor() {
    this.eventBus = new EventBus();
    this.stateManager = new StateManager(this.eventBus);

    this.realmManager = new RealmManager(this.stateManager, this.eventBus);
    this.attributeManager = new AttributeManager(this.stateManager, this.eventBus);
    this.tribulationManager = new TribulationManager(this.stateManager, this.eventBus);
    this.adventureManager = new AdventureManager(this.stateManager, this.eventBus);

    this.init();
  }

  init() {
    this.eventBus.emit('core:init');
    // 可扩展更多初始化逻辑
  }
}

if (typeof window !== 'undefined') {
  window.CultivationCore = CultivationCore;
}
