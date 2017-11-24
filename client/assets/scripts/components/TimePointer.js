cc.Class({
  extends: cc.Component,

  properties: {
    arrow: null,
    pointer: null,
    timeLabel: null,
    time: -1,
    alertTime: -1
  },

  // use this for initialization
  onLoad() {
    const gameChild = this.node.getChildByName('game');
    this.arrow = gameChild.getChildByName('arrow');
    this.pointer = this.arrow.getChildByName('pointer');
    this.initPointer();

    this.timeLabel = this.arrow
      .getChildByName('lblTime')
      .getComponent(cc.Label);
    this.timeLabel.string = '00';

    this.node.on('game_begin', () => {
      this.initPointer();
    });

    this.node.on('game_chupai', () => {
      this.initPointer();
      this.time = 10;
      this.alertTime = 3;
    });
  },

  initPointer() {
    if (cc.vv == null) {
      return;
    }
    this.arrow.active = cc.vv.gameNetMgr.gamestate === 'playing';
    if (!this.arrow.active) {
      return;
    }
    const { turn } = cc.vv.gameNetMgr;
    const localIndex = cc.vv.gameNetMgr.getLocalIndex(turn);
    for (let i = 0; i < this.pointer.children.length; i++) {
      this.pointer.children[i].active = i === localIndex;
    }
  },

  // called every frame, uncomment this function to activate update callback
  update(dt) {
    if (this.time > 0) {
      this.time -= dt;
      if (this.alertTime > 0 && this.time < this.alertTime) {
        cc.vv.audioMgr.playSFX('timeup_alarm.mp3');
        this.alertTime = -1;
      }
      let pre = '';
      if (this.time < 0) {
        this.time = 0;
      }

      const t = Math.ceil(this.time);
      if (t < 10) {
        pre = '0';
      }
      this.timeLabel.string = pre + t;
    }
  }
});
