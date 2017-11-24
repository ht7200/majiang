cc.Class({
  extends: cc.Component,

  properties: {},

  // use this for initialization
  onLoad() {
    if (!cc.vv) {
      return;
    }

    const gameChild = this.node.getChildByName('game');
    const mythis = gameChild.getChildByName('mythis');
    const pengangroot = mythis.getChildByName('penggangs');
    const realwidth = cc.director.getVisibleSize().width;
    const scale = realwidth / 1280;
    pengangroot.scaleX *= scale;
    pengangroot.scaleY *= scale;

    this.node.on('peng_notify', ({ detail: data }) => {
      // 刷新所有的牌
      this.onPengGangChanged(data);
    });

    this.node.on('gang_notify', ({ detail: data }) => {
      // 刷新所有的牌
      this.onPengGangChanged(data.seatData);
    });

    this.node.on('game_begin', () => {
      this.onGameBein();
    });

    const { seats } = cc.vv.gameNetMgr;
    for (const i in seats) {
      this.onPengGangChanged(seats[i]);
    }
  },

  onGameBein() {
    this.hideSide('mythis');
    this.hideSide('right');
    this.hideSide('up');
    this.hideSide('left');
  },

  hideSide(side) {
    const gameChild = this.node.getChildByName('game');
    const mythis = gameChild.getChildByName(side);
    const pengangroot = mythis.getChildByName('penggangs');
    if (pengangroot) {
      for (let i = 0; i < pengangroot.childrenCount; i++) {
        pengangroot.children[i].active = false;
      }
    }
  },

  onPengGangChanged(seatData) {
    if (
      seatData.angangs == null &&
      seatData.diangangs == null &&
      seatData.wangangs == null &&
      seatData.pengs == null
    ) {
      return;
    }
    const localIndex = cc.vv.gameNetMgr.getLocalIndex(seatData.seatindex);
    const side = cc.vv.mahjongmgr.getSide(localIndex);
    const pre = cc.vv.mahjongmgr.getFoldPre(localIndex);

    const gameChild = this.node.getChildByName('game');
    const mythis = gameChild.getChildByName(side);
    const pengangroot = mythis.getChildByName('penggangs');

    for (let i = 0; i < pengangroot.childrenCount; i++) {
      pengangroot.children[i].active = false;
    }
    // 初始化杠牌
    let index = 0;

    const gangs = seatData.angangs;
    for (let i = 0; i < gangs.length; i++) {
      const mjid = gangs[i];
      this.initPengAndGangs(pengangroot, side, pre, index, mjid, 'angang');
      index++;
    }
    const { diangangs } = seatData;
    for (let i = 0; i < diangangs.length; i++) {
      const mjid = diangangs[i];
      this.initPengAndGangs(pengangroot, side, pre, index, mjid, 'diangang');
      index++;
    }

    const { wangangs } = seatData;
    for (let i = 0; i < wangangs.length; i++) {
      const mjid = wangangs[i];
      this.initPengAndGangs(pengangroot, side, pre, index, mjid, 'wangang');
      index++;
    }

    // 初始化碰牌
    const { pengs } = seatData;
    if (pengs) {
      for (let i = 0; i < pengs.length; i++) {
        const mjid = pengs[i];
        this.initPengAndGangs(pengangroot, side, pre, index, mjid, 'peng');
        index++;
      }
    }
  },

  initPengAndGangs(pengangroot, side, pre, index, mjid, flag) {
    let pgroot = null;
    if (pengangroot.childrenCount <= index) {
      if (side === 'left' || side === 'right') {
        pgroot = cc.instantiate(cc.vv.mahjongmgr.pengPrefabLeft);
      } else {
        pgroot = cc.instantiate(cc.vv.mahjongmgr.pengPrefabthis);
      }

      pengangroot.addChild(pgroot);
    } else {
      pgroot = pengangroot.children[index];
      pgroot.active = true;
    }

    if (side === 'left') {
      pgroot.y = -(index * 25 * 3);
    } else if (side === 'right') {
      pgroot.y = index * 25 * 3;
      pgroot.setLocalZOrder(-index);
    } else if (side === 'mythis') {
      pgroot.x = index * 55 * 3 + index * 10;
    } else {
      pgroot.x = -(index * 55 * 3);
    }

    const sprites = pgroot.getComponentsInChildren(cc.Sprite);
    for (let s = 0; s < sprites.length; s++) {
      const sprite = sprites[s];
      if (sprite.node.name === 'gang') {
        const isGang = flag !== 'peng';
        sprite.node.active = isGang;
        sprite.node.scaleX = 1.0;
        sprite.node.scaleY = 1.0;
        if (flag === 'angang') {
          sprite.spriteFrame = cc.vv.mahjongmgr.getEmptySpriteFrame(side);
          if (side === 'mythis' || side === 'up') {
            sprite.node.scaleX = 1.4;
            sprite.node.scaleY = 1.4;
          }
        } else {
          sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, mjid);
        }
      } else {
        sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, mjid);
      }
    }
  }

  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },
});
