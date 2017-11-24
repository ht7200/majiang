cc.Class({
  extends: cc.Component,

  properties: {

  },

  // use this for initialization
  onLoad() {
    const btn = this.node.getChildByName('btn_back');
    cc.vv.utils.addClickEvent(btn, this.node, 'OnBack', 'onBtnClicked');
  },

  onBtnClicked(event) {
    if (event.target.name === 'btn_back') {
      this.node.active = false;
    }
  }

  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },
});
