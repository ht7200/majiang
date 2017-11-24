cc.Class({
  extends: cc.Component,

  properties: {
    folds: null
  },

  // use this for initialization
  onLoad() {
    if (cc.vv == null) {
      return;
    }

    this.initView();
    this.initEventHandler();

    this.initAllFolds();
  },

  initView() {
    this.folds = {};
    const game = this.node.getChildByName('game');
    const sides = ['myself', 'right', 'up', 'left'];
    for (let i = 0; i < sides.length; i++) {
      const sideName = sides[i];
      const sideRoot = game.getChildByName(sideName);
      const folds = [];
      const foldRoot = sideRoot.getChildByName('folds');
      for (let j = 0; j < foldRoot.children.length; j++) {
        const n = foldRoot.children[j];
        n.active = false;
        const sprite = n.getComponent(cc.Sprite);
        sprite.spriteFrame = null;
        folds.push(sprite);
      }
      this.folds[sideName] = folds;
    }

    this.hideAllFolds();
  },

  hideAllFolds() {
    for (const k in this.folds) {
      const f = this.folds[k];
      for (const i in f) {
        f[i].node.active = false;
      }
    }
  },

  initEventHandler() {
    const self = this;
    this.node.on('game_begin', () => {
      self.initAllFolds();
    });

    this.node.on('game_sync', () => {
      self.initAllFolds();
    });

    this.node.on('game_chupai_notify', (data) => {
      self.initFolds(data.detail);
    });

    this.node.on('guo_notify', (data) => {
      self.initFolds(data.detail);
    });
  },

  initAllFolds() {
    const { seats } = cc.vv.gameNetMgr;
    for (const i in seats) {
      this.initFolds(seats[i]);
    }
  },

  initFolds(seatData) {
    const { folds } = seatData;
    if (folds == null) {
      return;
    }
    const localIndex = cc.vv.gameNetMgr.getLocalIndex(seatData.seatindex);
    const pre = cc.vv.mahjongmgr.getFoldPre(localIndex);
    const side = cc.vv.mahjongmgr.getSide(localIndex);

    const foldsSprites = this.folds[side];
    for (let i = 0; i < foldsSprites.length; i++) {
      let index = i;
      if (side === 'right' || side === 'up') {
        index = foldsSprites.length - i - 1;
      }
      const sprite = foldsSprites[index];
      sprite.node.active = true;
      this.setSpriteFrameByMJID(pre, sprite, folds[i]);
    }
    for (let i = folds.length; i < foldsSprites.length; i++) {
      let index = i;
      if (side === 'right' || side === 'up') {
        index = foldsSprites.length - i - 1;
      }
      const sprite = foldsSprites[index];

      sprite.spriteFrame = null;
      sprite.node.active = false;
    }
  },

  setSpriteFrameByMJID(pre, sprite, mjid) {
    sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, mjid);
    sprite.node.active = true;
  }

  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },
});
