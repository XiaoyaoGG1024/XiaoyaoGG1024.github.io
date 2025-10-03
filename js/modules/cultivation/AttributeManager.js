export default class AttributeManager {
  constructor(stateManager, eventBus) {
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    // ...existing code...
  }

  growAttributes(type) {
    const state = this.stateManager.getState();
    let newAttributes = { ...state.attributes };
    switch (type) {
      case 'attack':
        newAttributes.attack += 2;
        break;
      case 'defense':
        newAttributes.defense += 2;
        break;
      case 'hp':
        newAttributes.hp += 10;
        break;
      case 'mana':
        newAttributes.mana += 8;
        break;
      case 'spirit':
        newAttributes.spirit += 1;
        break;
      default:
        break;
    }
    this.stateManager.setState({ attributes: newAttributes });
    this.eventBus.emit('attribute:grow', { type, attributes: newAttributes });
  }

  getAttributes() {
    return this.stateManager.getState().attributes;
  }
}
