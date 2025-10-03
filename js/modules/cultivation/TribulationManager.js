export default class TribulationManager {
  constructor(stateManager, eventBus) {
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    // ...existing code...
  }

  getSuccessRate() {
    const state = this.stateManager.getState();
    const baseRate = state.tribulation?.successRate || 0.3;
    const luckBonus = Math.min(0.2, (state.attributes?.luck || 0) * 0.01);
    const spiritBonus = Math.min(0.1, (state.attributes?.spirit || 0) * 0.002);
    return Math.min(0.95, baseRate + luckBonus + spiritBonus);
  }

  getFailBonus() {
    const state = this.stateManager.getState();
    const realmFactor = (state.realmIndex || 0) + 1;
    const stageFactor = state.stageIndex === 2 ? 1.5 : 1.0;
    return {
      spirit: Math.floor(2 * realmFactor * stageFactor),
      defense: Math.floor(1 * realmFactor * stageFactor),
      exp: Math.floor(20 * realmFactor * stageFactor)
    };
  }

  tryTribulation(minutes = 0) {
    const state = this.stateManager.getState();
    if (!state.tribulation?.needed) return false;

    const finalRate = this.getSuccessRate();
    const rand = Math.random();
    const success = rand < finalRate;

    if (success) {
      // 渡劫成功，境界提升
      const oldRealmIndex = state.realmIndex;
      const newRealmIndex = Math.min(oldRealmIndex + 1, window.CULTIVATION_REALMS?.length - 1 || oldRealmIndex + 1);
      const realmFactor = newRealmIndex + 1;
      const newState = {
        realmIndex: newRealmIndex,
        stageIndex: 0,
        level: 1,
        exp: 0,
        tribulation: { needed: false, successRate: 0.3, failCount: 0 },
        attributes: {
          ...state.attributes,
          attack: state.attributes.attack + 20 * realmFactor,
          defense: state.attributes.defense + 15 * realmFactor,
          hp: state.attributes.hp + 100 * realmFactor,
          mana: state.attributes.mana + 80 * realmFactor,
          spirit: state.attributes.spirit + 25 * realmFactor,
          luck: state.attributes.luck + 1,
          spiritualStone: state.attributes.spiritualStone + 200 * realmFactor
        }
      };
      this.stateManager.setState(newState);
      this.eventBus.emit('tribulation:success', newState);
      return true;
    } else {
      // 渡劫失败，补偿
      const t = state.tribulation;
      t.failCount = (t.failCount || 0) + 1;
      t.successRate = Math.min(0.95, (t.successRate || 0.3) + 0.1);
      const bonus = this.getFailBonus();
      const newState = {
        ...state,
        tribulation: t,
        attributes: {
          ...state.attributes,
          spirit: state.attributes.spirit + bonus.spirit,
          defense: state.attributes.defense + bonus.defense
        },
        exp: state.exp + bonus.exp + (minutes > 0 ? minutes : 0)
      };
      this.stateManager.setState(newState);
      this.eventBus.emit('tribulation:fail', newState);
      return false;
    }
  }
}
