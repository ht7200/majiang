cc.Class({
  extends: cc.Component,

  properties: {
    reconnect: null,
    lblTip: null,
    lastPing: 0
  },

  // use this for initialization
  onLoad() {
    this.reconnect = cc.find('Canvas/reconnect');
    this.lblTip = cc.find('Canvas/reconnect/tip').getComponent(cc.Label);

    const fnTestServerOn = () => {
      cc.vv.net.test((ret) => {
        if (ret) {
          cc.director.loadScene('hall');
        } else {
          setTimeout(fnTestServerOn, 3000);
        }
      });
    };

    const fn = () => {
      this.node.off('disconnect', fn);
      this.reconnect.active = true;
      fnTestServerOn();
    };
    this.node.on('disconnect', fn);
  },
  // called every frame, uncomment this function to activate update callback
  update() {
    if (this.reconnect.active) {
      const t = Math.floor(Date.now() / 1000) % 4;
      this.lblTip.string = '与服务器断开连接，正在尝试重连';
      for (let i = 0; i < t; i++) {
        this.lblTip.string += '.';
      }
    }
  }
});
