const mahjongSprites = [];

cc.Class({
  extends: cc.Component,

  properties: {
    leftAtlas: {
      default: null,
      type: cc.SpriteAtlas
    },

    rightAtlas: {
      default: null,
      type: cc.SpriteAtlas
    },

    bottomAtlas: {
      default: null,
      type: cc.SpriteAtlas
    },

    bottomFoldAtlas: {
      default: null,
      type: cc.SpriteAtlas
    },

    pengPrefabSelf: {
      default: null,
      type: cc.Prefab
    },

    pengPrefabLeft: {
      default: null,
      type: cc.Prefab
    },

    emptyAtlas: {
      default: null,
      type: cc.SpriteAtlas
    },

    holdsEmpty: {
      default: [],
      type: [cc.SpriteFrame]
    },

    sides: null,
    pres: null,
    foldPres: null
  },

  onLoad() {
    if (cc.vv == null) {
      return;
    }
    this.sides = ['myself', 'right', 'up', 'left'];
    this.pres = ['M_', 'R_', 'B_', 'L_'];
    this.foldPres = ['B_', 'R_', 'B_', 'L_'];
    cc.vv.mahjongmgr = this;
    // 筒
    for (let i = 1; i < 10; i++) {
      mahjongSprites.push(`dot_${i}`);
    }

    // 条
    for (let i = 1; i < 10; i++) {
      mahjongSprites.push(`bamboo_${i}`);
    }

    // 万
    for (let i = 1; i < 10; i++) {
      mahjongSprites.push(`character_${i}`);
    }

    // 中、发、白
    mahjongSprites.push('red');
    mahjongSprites.push('green');
    mahjongSprites.push('white');

    // 东西南北风
    mahjongSprites.push('wind_east');
    mahjongSprites.push('wind_west');
    mahjongSprites.push('wind_south');
    mahjongSprites.push('wind_north');
  },

  getMahjongSpriteByID(id) {
    return mahjongSprites[id];
  },

  getMahjongType(id) {
    if (id >= 0 && id < 9) {
      return 0;
    } else if (id >= 9 && id < 18) {
      return 1;
    } else if (id >= 18 && id < 27) {
      return 2;
    }
    return -1;
  },

  getSpriteFrameByMJID(pre, mjid) {
    let spriteFrameName = this.getMahjongSpriteByID(mjid);
    spriteFrameName = pre + spriteFrameName;
    if (pre === 'M_') {
      return this.bottomAtlas.getSpriteFrame(spriteFrameName);
    } else if (pre === 'B_') {
      return this.bottomFoldAtlas.getSpriteFrame(spriteFrameName);
    } else if (pre === 'L_') {
      return this.leftAtlas.getSpriteFrame(spriteFrameName);
    } else if (pre === 'R_') {
      return this.rightAtlas.getSpriteFrame(spriteFrameName);
    }
    return null;
  },

  getAudioURLByMJID(id) {
    let realId = 0;
    if (id >= 0 && id < 9) {
      realId = id + 21;
    } else if (id >= 9 && id < 18) {
      realId = id - 8;
    } else if (id >= 18 && id < 27) {
      realId = id - 7;
    }
    return `nv/${realId}.mp3`;
  },

  getEmptySpriteFrame(side) {
    if (side === 'up') {
      return this.emptyAtlas.getSpriteFrame('e_mj_b_up');
    } else if (side === 'myself') {
      return this.emptyAtlas.getSpriteFrame('e_mj_b_bottom');
    } else if (side === 'left') {
      return this.emptyAtlas.getSpriteFrame('e_mj_b_left');
    } else if (side === 'right') {
      return this.emptyAtlas.getSpriteFrame('e_mj_b_right');
    }
    return null;
  },

  getHoldsEmptySpriteFrame(side) {
    if (side === 'up') {
      return this.emptyAtlas.getSpriteFrame('e_mj_up');
    } else if (side === 'myself') {
      return null;
    } else if (side === 'left') {
      return this.emptyAtlas.getSpriteFrame('e_mj_left');
    } else if (side === 'right') {
      return this.emptyAtlas.getSpriteFrame('e_mj_right');
    }
    return null;
  },

  sortMJ(mahjongs, dingque) {
    const self = this;
    mahjongs.sort((a, b) => {
      if (dingque >= 0) {
        const t1 = self.getMahjongType(a);
        const t2 = self.getMahjongType(b);
        if (t1 !== t2) {
          if (dingque === t1) {
            return 1;
          } else if (dingque === t2) {
            return -1;
          }
        }
      }
      return a - b;
    });
  },

  getSide(localIndex) {
    return this.sides[localIndex];
  },

  getPre(localIndex) {
    return this.pres[localIndex];
  },

  getFoldPre(localIndex) {
    return this.foldPres[localIndex];
  }
});
