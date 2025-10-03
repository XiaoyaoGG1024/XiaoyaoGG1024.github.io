export default class RealmManager {
  constructor(stateManager, eventBus) {
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    // ...境界相关初始化...
  }

  breakthrough() {
    const state = this.stateManager.getState();
    if (state.stageIndex < 2) {
      this.stateManager.setState({
        stageIndex: state.stageIndex + 1,
        level: 1
      });
      this.eventBus.emit('realm:stageUp', this.stateManager.getState());
    } else {
      this.stateManager.setState({
        stageIndex: 0,
        tribulation: { ...state.tribulation, needed: true }
      });
      this.eventBus.emit('realm:full', this.stateManager.getState());
    }
  }

  getRealmInfo() {
    const state = this.stateManager.getState();
    return {
      realmIndex: state.realmIndex,
      stageIndex: state.stageIndex,
      level: state.level
    };
  }
}
