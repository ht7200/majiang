cc.Class({
  extends: cc.Component,
  properties: {
    target: cc.Node,
    isShow: false,
    lblContent: cc.Label
  },

  // use this for initialization
  onLoad() {
    if (cc.vv) {
      cc.vv.wc = this;
      this.node.active = this.isShow;
    }
  },

  // called every frame, uncomment this function to activate update callback
  update(dt) {
    this.target.rotation = this.target.rotation - dt * 45;
  },

  show(content) {
    this.isShow = true;
    if (this.node) {
      this.node.active = this.isShow;
    }
    if (this.lblContent) {
      if (content == null) {
        content = '';
      }
      this.lblContent.string = content;
    }
  },
  hide() {
    this.isShow = false;
    if (this.node) {
      this.node.active = this.isShow;
    }
  }
});
