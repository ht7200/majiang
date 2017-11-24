cc.Class({
  extends: cc.Component,

  properties: {
    guohu: null,
    info: null,
    guohuTime: -1
  },

  // use this for initialization
  onLoad() {
    this.guohu = cc.find('Canvas/tip_notice');
    this.guohu.active = false;

    this.info = cc.find('Canvas/tip_notice/info').getComponent(cc.Label);

    this.node.on('push_notice', ({ detail: data }) => {
      this.guohu.active = true;
      this.guohuTime = data.time;
      this.info.string = data.info;
    });
  },

  // called every frame, uncomment this function to activate update callback
  update(dt) {
    if (this.guohuTime > 0) {
      this.guohuTime -= dt;
      if (this.guohuTime < 0) {
        this.guohu.active = false;
      }
    }
  }
});
