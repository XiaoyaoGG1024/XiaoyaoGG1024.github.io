export default class AdventureManager {
  constructor(stateManager, eventBus) {
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    // ...奇遇相关初始化...
  }

  triggerAdventure(adventures) {
    const state = this.stateManager.getState();
    if (!adventures || adventures.length === 0) return;

    const luck = state.attributes.luck || 0;
    const baseChance = 0.1;
    const luckBonus = 0.8 / (1 + Math.exp(-0.2 * (luck - 10)));
    const totalChance = Math.min(0.95, baseChance + luckBonus);

    if (Math.random() < totalChance) {
      // 简化：随机选一个奇遇
      const idx = Math.floor(Math.random() * adventures.length);
      const adventure = adventures[idx];
      // 奖励应用
      let newAttributes = { ...state.attributes };
      for (const [attr, value] of Object.entries(adventure.rewards || {})) {
        if (newAttributes.hasOwnProperty(attr)) {
          newAttributes[attr] += value;
        }
      }
      this.stateManager.setState({ attributes: newAttributes });
      this.eventBus.emit('adventure:trigger', adventure);
    }
  }
}
