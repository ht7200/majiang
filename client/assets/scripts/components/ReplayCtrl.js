cc.Class({
  extends: cc.Component,

  properties: {
    nextPlayTime: 1,
    replay: null,
    isPlaying: true
  },

  // use this for initialization
  onLoad() {
    if (cc.vv == null) {
      return;
    }

    this.replay = cc.find('Canvas/replay');
    this.replay.active = cc.vv.replayMgr.isReplay();
  },

  onBtnPauseClicked() {
    this.isPlaying = false;
  },

  onBtnPlayClicked() {
    this.isPlaying = true;
  },

  onBtnBackClicked() {
    cc.vv.replayMgr.clear();
    cc.vv.gameNetMgr.reset();
    cc.vv.gameNetMgr.roomId = null;
    cc.director.loadScene('hall');
  },

  // called every frame, uncomment this function to activate update callback
  update(dt) {
    if (cc.vv) {
      if (
        this.isPlaying &&
        cc.vv.replayMgr.isReplay() &&
        this.nextPlayTime > 0
      ) {
        this.nextPlayTime -= dt;
        if (this.nextPlayTime < 0) {
          this.nextPlayTime = cc.vv.replayMgr.takeAction();
        }
      }
    }
  }
});
