cc.Class({
  extends: cc.Component,

  properties: {
    target: cc.Node,
    sprite: cc.SpriteFrame,
    checkedSprite: cc.SpriteFrame,
    checked: false
  },

  // use this for initialization
  onLoad() {
    this.refresh();
  },

  onClicked() {
    this.checked = !this.checked;
    this.refresh();
  },

  refresh() {
    const targetSprite = this.target.getComponent(cc.Sprite);
    if (this.checked) {
      targetSprite.spriteFrame = this.checkedSprite;
    } else {
      targetSprite.spriteFrame = this.sprite;
    }
  }

  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },
});
