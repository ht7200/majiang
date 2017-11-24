cc.Class({
  extends: cc.Component,

  properties: {
    target: cc.Node,
    sprite: cc.SpriteFrame,
    checkedSprite: cc.SpriteFrame,
    checked: false,
    groupId: -1
  },

  // use this for initialization
  onLoad() {
    if (cc.vv == null) {
      return;
    }
    if (cc.vv.radiogroupmgr == null) {
      const RadioGroupMgr = require('./RadioGroupMgr');
      cc.vv.radiogroupmgr = new RadioGroupMgr();
      cc.vv.radiogroupmgr.init();
    }
    cc.vv.radiogroupmgr.add(this);

    this.refresh();
  },

  refresh() {
    const targetSprite = this.target.getComponent(cc.Sprite);
    if (this.checked) {
      targetSprite.spriteFrame = this.checkedSprite;
    } else {
      targetSprite.spriteFrame = this.sprite;
    }
  },

  check(value) {
    this.checked = value;
    this.refresh();
  },

  onClicked() {
    cc.vv.radiogroupmgr.check(this);
  },

  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },

  onDestroy() {
    if (cc.vv && cc.vv.radiogroupmgr) {
      cc.vv.radiogroupmgr.del(this);
    }
  }
});
