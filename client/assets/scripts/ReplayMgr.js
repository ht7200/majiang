const ACTION_CHUPAI = 1;
const ACTION_MOPAI = 2;
const ACTION_PENG = 3;
const ACTION_GANG = 4;
const ACTION_HU = 5;

cc.Class({
  extends: cc.Component,

  properties: {
    lastAction: null,
    actionRecords: null,
    currentIndex: 0
  },

  // use this for initialization
  onLoad() {},

  clear() {
    this.lastAction = null;
    this.actionRecords = null;
    this.currentIndex = 0;
  },

  init(data) {
    this.actionRecords = data.action_records;
    if (this.actionRecords == null) {
      this.actionRecords = {};
    }
    this.currentIndex = 0;
    this.lastAction = null;
  },

  isReplay() {
    return this.actionRecords != null;
  },

  getNextAction() {
    if (this.currentIndex >= this.actionRecords.length) {
      return null;
    }

    const si = this.actionRecords[this.currentIndex++];
    const action = this.actionRecords[this.currentIndex++];
    const pai = this.actionRecords[this.currentIndex++];
    return {
      si,
      type: action,
      pai
    };
  },

  takeAction() {
    const action = this.getNextAction();
    if (this.lastAction != null && this.lastAction.type === ACTION_CHUPAI) {
      if (
        action != null &&
        action.type !== ACTION_PENG &&
        action.type !== ACTION_GANG &&
        action.type !== ACTION_HU
      ) {
        cc.vv.gameNetMgr.doGuo(this.lastAction.si, this.lastAction.pai);
      }
    }
    this.lastAction = action;
    if (action == null) {
      return -1;
    }
    if (action.type === ACTION_CHUPAI) {
      cc.vv.gameNetMgr.doChupai(action.si, action.pai);
      return 1.0;
    } else if (action.type === ACTION_MOPAI) {
      cc.vv.gameNetMgr.doMopai(action.si, action.pai);
      cc.vv.gameNetMgr.doTurnChange(action.si);
      return 0.5;
    } else if (action.type === ACTION_PENG) {
      cc.vv.gameNetMgr.doPeng(action.si, action.pai);
      cc.vv.gameNetMgr.doTurnChange(action.si);
      return 1.0;
    } else if (action.type === ACTION_GANG) {
      cc.vv.gameNetMgr.dispatchEvent('hangang_notify', action.si);
      cc.vv.gameNetMgr.doGang(action.si, action.pai);
      cc.vv.gameNetMgr.doTurnChange(action.si);
      return 1.0;
    } else if (action.type === ACTION_HU) {
      cc.vv.gameNetMgr.doHu({
        seatindex: action.si,
        hupai: action.pai,
        iszimo: false
      });
      return 1.5;
    }
    return -1;
  }
});
