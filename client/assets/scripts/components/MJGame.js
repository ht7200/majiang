cc.Class({
  extends: cc.Component,

  properties: {
    gameRoot: {
      default: null,
      type: cc.Node
    },

    prepareRoot: {
      default: null,
      type: cc.Node
    },

    myMJArr: [],
    options: null,
    selectedMJ: null,
    chupaiSprite: [],
    mjcount: null,
    gamecount: null,
    hupaiTips: [],
    hupaiLists: [],
    playEfxs: [],
    opts: []
  },

  onLoad() {
    if (!cc.sys.isNative && cc.sys.isMobile) {
      const cvs = this.node.getComponent(cc.Canvas);
      cvs.fitHeight = true;
      cvs.fitWidth = true;
    }
    if (!cc.vv) {
      cc.director.loadScene('loading');
      return;
    }
    this.addComponent('NoticeTip');
    this.addComponent('GameOver');
    this.addComponent('PengGangs');
    this.addComponent('MJRoom');
    this.addComponent('TimePointer');
    this.addComponent('GameResult');
    this.addComponent('Chat');
    this.addComponent('Folds');
    this.addComponent('ReplayCtrl');
    this.addComponent('PopupMgr');
    this.addComponent('ReConnect');
    this.addComponent('Voice');
    this.addComponent('UserInfoShow');

    this.initView();
    this.initEventHandlers();

    this.gameRoot.active = false;
    this.prepareRoot.active = true;
    this.initWanfaLabel();
    this.onGameBeign();
    cc.vv.audioMgr.playBGM('bgFight.mp3');
  },

  initView() {
    // 搜索需要的子节点
    const gameChild = this.node.getChildByName('game');

    this.mjcount = gameChild.getChildByName('mjcount').getComponent(cc.Label);
    this.mjcount.string = `剩余${cc.vv.gameNetMgr.numOfMJ}张`;
    this.gamecount = gameChild
      .getChildByName('gamecount')
      .getComponent(cc.Label);
    this.gamecount.string = `${cc.vv.gameNetMgr.numOfGames}/${cc.vv.gameNetMgr.maxNumOfGames}局`;

    const myselfChild = gameChild.getChildByName('myself');
    const myholds = myselfChild.getChildByName('holds');

    for (let i = 0; i < myholds.children.length; i++) {
      const sprite = myholds.children[i].getComponent(cc.Sprite);
      this.myMJArr.push(sprite);
      sprite.spriteFrame = null;
    }

    const realwidth = cc.director.getVisibleSize().width;
    myholds.scaleX *= realwidth / 1280;
    myholds.scaleY *= realwidth / 1280;

    const sides = ['myself', 'right', 'up', 'left'];
    for (let i = 0; i < sides.length; i++) {
      const side = sides[i];

      const sideChild = gameChild.getChildByName(side);
      this.hupaiTips.push(sideChild.getChildByName('HuPai'));
      this.hupaiLists.push(sideChild.getChildByName('hupailist'));
      this.playEfxs.push(sideChild.getChildByName('play_efx').getComponent(cc.Animation));
      this.chupaiSprite.push(sideChild.getChildByName('ChuPai').children[0].getComponent(cc.Sprite));

      const opt = sideChild.getChildByName('opt');
      opt.active = false;
      const sprite = opt.getChildByName('pai').getComponent(cc.Sprite);
      const data = {
        node: opt,
        sprite
      };
      this.opts.push(data);
    }

    const opts = gameChild.getChildByName('ops');
    this.options = opts;
    this.hideOptions();
    this.hideChupai();
  },

  hideChupai() {
    for (let i = 0; i < this.chupaiSprite.length; i++) {
      this.chupaiSprite[i].node.active = false;
    }
  },

  initEventHandlers() {
    cc.vv.gameNetMgr.dataEventHandler = this.node;

    // 初始化事件监听器
    const self = this;

    this.node.on('game_holds', () => {
      self.initMahjongs();
      self.checkQueYiMen();
    });

    this.node.on('game_begin', () => {
      self.onGameBeign();
    });

    this.node.on('game_sync', () => {
      self.onGameBeign();
    });

    this.node.on('game_chupai', ({ detail: data }) => {
      data = data.detail;
      self.hideChupai();
      if (data.last !== cc.vv.gameNetMgr.seatIndex) {
        self.initMopai(data.last, null);
      }
      if (
        !cc.vv.replayMgr.isReplay() && data.turn !== cc.vv.gameNetMgr.seatIndex
      ) {
        self.initMopai(data.turn, -1);
      }
    });

    this.node.on('game_mopai', ({ detail: data }) => {
      self.hideChupai();
      const { pai } = data;
      const localIndex = cc.vv.gameNetMgr.getLocalIndex(data.seatIndex);
      if (localIndex === 0) {
        const index = 13;
        const sprite = self.myMJArr[index];
        self.setSpriteFrameByMJID('M_', sprite, pai, index);
        sprite.node.mjId = pai;
      } else if (cc.vv.replayMgr.isReplay()) {
        self.initMopai(data.seatIndex, pai);
      }
    });

    this.node.on('game_action', (data) => {
      self.showAction(data.detail);
    });

    this.node.on('hupai', ({ detail: data }) => {
      // 如果不是玩家自己，则将玩家的牌都放倒
      const seatIndex = data.seatindex;
      const localIndex = cc.vv.gameNetMgr.getLocalIndex(seatIndex);
      const hupai = self.hupaiTips[localIndex];
      hupai.active = true;

      if (localIndex === 0) {
        self.hideOptions();
      }
      const seatData = cc.vv.gameNetMgr.seats[seatIndex];
      seatData.hued = true;
      if (cc.vv.gameNetMgr.conf.type === 'xlch') {
        hupai.getChildByName('sprHu').active = true;
        hupai.getChildByName('sprZimo').active = false;
        self.initHupai(localIndex, data.hupai);
        if (data.iszimo) {
          if (seatData.seatindex === cc.vv.gameNetMgr.seatIndex) {
            seatData.holds.pop();
            self.initMahjongs();
          } else {
            self.initOtherMahjongs(seatData);
          }
        }
      } else {
        hupai.getChildByName('sprHu').active = !data.iszimo;
        hupai.getChildByName('sprZimo').active = data.iszimo;

        if (!(data.iszimo && localIndex === 0)) {
          // if(cc.vv.replayMgr.isReplay() == false && localIndex != 0){
          //    self.initEmptySprites(seatIndex);
          // }
          self.initMopai(seatIndex, data.hupai);
        }
      }

      if (
        cc.vv.replayMgr.isReplay() === true &&
        cc.vv.gameNetMgr.conf.type !== 'xlch'
      ) {
        const opt = self.opts[localIndex];
        opt.node.active = true;
        opt.sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(
          'M_',
          data.hupai
        );
      }

      if (data.iszimo) {
        self.playEfx(localIndex, 'play_zimo');
      } else {
        self.playEfx(localIndex, 'play_hu');
      }

      cc.vv.audioMgr.playSFX('nv/hu.mp3');
    });

    this.node.on('mj_count', () => {
      self.mjcount.string = `剩余${cc.vv.gameNetMgr.numOfMJ}张`;
    });

    this.node.on('game_num', () => {
      self.gamecount.string = `${cc.vv.gameNetMgr.numOfGames}/${cc.vv.gameNetMgr.maxNumOfGames}局`;
    });

    this.node.on('game_over', () => {
      self.gameRoot.active = false;
      self.prepareRoot.active = true;
    });

    this.node.on('game_chupai_notify', ({ detail: data }) => {
      self.hideChupai();
      const { seatData } = data;
      // 如果是自己，则刷新手牌
      if (seatData.seatindex === cc.vv.gameNetMgr.seatIndex) {
        self.initMahjongs();
      } else {
        self.initOtherMahjongs(seatData);
      }
      self.showChupai();
      const audioUrl = cc.vv.mahjongmgr.getAudioURLByMJID(data.detail.pai);
      cc.vv.audioMgr.playSFX(audioUrl);
    });

    this.node.on('guo_notify', (data) => {
      self.hideChupai();
      self.hideOptions();
      const seatData = data.detail;
      // 如果是自己，则刷新手牌
      if (seatData.seatindex === cc.vv.gameNetMgr.seatIndex) {
        self.initMahjongs();
      }
      cc.vv.audioMgr.playSFX('give.mp3');
    });

    this.node.on('guo_result', () => {
      self.hideOptions();
    });

    this.node.on('game_dingque_finish', () => {
      self.initMahjongs();
    });

    this.node.on('peng_notify', (data) => {
      self.hideChupai();

      const seatData = data.detail;
      if (seatData.seatindex === cc.vv.gameNetMgr.seatIndex) {
        self.initMahjongs();
      } else {
        self.initOtherMahjongs(seatData);
      }
      const localIndex = self.getLocalIndex(seatData.seatindex);
      self.playEfx(localIndex, 'play_peng');
      cc.vv.audioMgr.playSFX('nv/peng.mp3');
      self.hideOptions();
    });

    this.node.on('gang_notify', ({ detail: data }) => {
      self.hideChupai();
      const { seatData, gangtype } = data;
      if (seatData.seatindex === cc.vv.gameNetMgr.seatIndex) {
        self.initMahjongs();
      } else {
        self.initOtherMahjongs(seatData);
      }

      const localIndex = self.getLocalIndex(seatData.seatindex);
      if (gangtype === 'wangang') {
        self.playEfx(localIndex, 'play_guafeng');
        cc.vv.audioMgr.playSFX('guafeng.mp3');
      } else {
        self.playEfx(localIndex, 'play_xiayu');
        cc.vv.audioMgr.playSFX('rain.mp3');
      }
    });

    this.node.on('hangang_notify', ({ detail: data }) => {
      const localIndex = self.getLocalIndex(data);
      self.playEfx(localIndex, 'play_gang');
      cc.vv.audioMgr.playSFX('nv/gang.mp3');
      self.hideOptions();
    });
  },

  showChupai() {
    const pai = cc.vv.gameNetMgr.chupai;
    if (pai >= 0) {
      //
      const localIndex = this.getLocalIndex(cc.vv.gameNetMgr.turn);
      const sprite = this.chupaiSprite[localIndex];
      sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID('M_', pai);
      sprite.node.active = true;
    }
  },

  addOption(btnName, pai) {
    for (let i = 0; i < this.options.childrenCount; i++) {
      const child = this.options.children[i];
      if (child.name === 'op' && !child.active) {
        child.active = true;
        const sprite = child.getChildByName('opTarget').getComponent(cc.Sprite);
        sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID('M_', pai);
        const btn = child.getChildByName(btnName);
        btn.active = true;
        btn.pai = pai;
        return;
      }
    }
  },

  hideOptions() {
    this.options.active = false;
    for (let i = 0; i < this.options.childrenCount; i++) {
      const child = this.options.children[i];
      if (child.name === 'op') {
        child.active = false;
        child.getChildByName('btnPeng').active = false;
        child.getChildByName('btnGang').active = false;
        child.getChildByName('btnHu').active = false;
      }
    }
  },

  showAction(data) {
    if (this.options.active) {
      this.hideOptions();
    }

    if (data && (data.hu || data.gang || data.peng)) {
      this.options.active = true;
      if (data.hu) {
        this.addOption('btnHu', data.pai);
      }
      if (data.peng) {
        this.addOption('btnPeng', data.pai);
      }

      if (data.gang) {
        for (let i = 0; i < data.gangpai.length; i++) {
          const gp = data.gangpai[i];
          this.addOption('btnGang', gp);
        }
      }
    }
  },

  initWanfaLabel() {
    const wanfa = cc.find('Canvas/infobar/wanfa').getComponent(cc.Label);
    wanfa.string = cc.vv.gameNetMgr.getWanfa();
  },

  initHupai(localIndex, pai) {
    if (cc.vv.gameNetMgr.conf.type === 'xlch') {
      const hupailist = this.hupaiLists[localIndex];
      for (let i = 0; i < hupailist.children.length; i++) {
        const hupainode = hupailist.children[i];
        if (!hupainode.active) {
          const pre = cc.vv.mahjongmgr.getFoldPre(localIndex);
          const sp = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, pai);
          hupainode.getComponent(cc.Sprite).spriteFrame = sp;
          hupainode.active = true;
          break;
        }
      }
    }
  },

  playEfx(index, name) {
    this.playEfxs[index].node.active = true;
    this.playEfxs[index].play(name);
  },

  onGameBeign() {
    for (let i = 0; i < this.playEfxs.length; i++) {
      this.playEfxs[i].node.active = false;
    }

    for (let i = 0; i < this.hupaiLists.length; i++) {
      for (let j = 0; j < this.hupaiLists[i].childrenCount; j++) {
        this.hupaiLists[i].children[j].active = false;
      }
    }

    for (let i = 0; i < cc.vv.gameNetMgr.seats.length; i++) {
      const seatData = cc.vv.gameNetMgr.seats[i];
      const localIndex = cc.vv.gameNetMgr.getLocalIndex(i);
      const hupai = this.hupaiTips[localIndex];
      hupai.active = seatData.hued;
      if (seatData.hued) {
        hupai.getChildByName('sprHu').active = !seatData.iszimo;
        hupai.getChildByName('sprZimo').active = seatData.iszimo;
      }

      if (seatData.huinfo) {
        for (let j = 0; j < seatData.huinfo.length; j++) {
          const info = seatData.huinfo[j];
          if (info.ishupai) {
            this.initHupai(localIndex, info.pai);
          }
        }
      }
    }

    this.hideChupai();
    this.hideOptions();
    const sides = ['right', 'up', 'left'];
    const gameChild = this.node.getChildByName('game');
    for (let i = 0; i < sides.length; i++) {
      const sideChild = gameChild.getChildByName(sides[i]);
      const holds = sideChild.getChildByName('holds');
      for (let j = 0; j < holds.childrenCount; j++) {
        const nc = holds.children[j];
        nc.active = true;
        nc.scaleX = 1.0;
        nc.scaleY = 1.0;
        const sprite = nc.getComponent(cc.Sprite);
        sprite.spriteFrame = cc.vv.mahjongmgr.holdsEmpty[i + 1];
      }
    }

    if (
      cc.vv.gameNetMgr.gamestate === '' && cc.vv.replayMgr.isReplay() === false
    ) {
      return;
    }

    this.gameRoot.active = true;
    this.prepareRoot.active = false;
    this.initMahjongs();
    const { seats } = cc.vv.gameNetMgr;
    for (const i in seats) {
      const seatData = seats[i];
      const localIndex = cc.vv.gameNetMgr.getLocalIndex(i);
      if (localIndex !== 0) {
        this.initOtherMahjongs(seatData);
        if (i === cc.vv.gameNetMgr.turn) {
          this.initMopai(i, -1);
        } else {
          this.initMopai(i, null);
        }
      }
    }
    this.showChupai();
    if (cc.vv.gameNetMgr.curaction != null) {
      this.showAction(cc.vv.gameNetMgr.curaction);
      cc.vv.gameNetMgr.curaction = null;
    }

    this.checkQueYiMen();
  },

  onMJClicked(event) {
    // 如果不是自己的轮子，则忽略
    if (cc.vv.gameNetMgr.turn !== cc.vv.gameNetMgr.seatIndex) {
      return;
    }

    for (let i = 0; i < this.myMJArr.length; i++) {
      if (event.target === this.myMJArr[i].node) {
        // 如果是再次点击，则出牌
        if (event.target === this.selectedMJ) {
          this.shoot(this.selectedMJ.mjId);
          this.selectedMJ.y = 0;
          this.selectedMJ = null;
          return;
        }
        if (this.selectedMJ != null) {
          this.selectedMJ.y = 0;
        }
        event.target.y = 15;
        this.selectedMJ = event.target;
        return;
      }
    }
  },

  // 出牌
  shoot(mjId) {
    if (mjId == null) {
      return;
    }
    cc.vv.net.send('chupai', mjId);
  },

  getMJIndex(side, index) {
    if (side === 'right' || side === 'up') {
      return 13 - index;
    }
    return index;
  },

  initMopai(seatIndex, pai) {
    const localIndex = cc.vv.gameNetMgr.getLocalIndex(seatIndex);
    const side = cc.vv.mahjongmgr.getSide(localIndex);
    const pre = cc.vv.mahjongmgr.getFoldPre(localIndex);

    const gameChild = this.node.getChildByName('game');
    const sideChild = gameChild.getChildByName(side);
    const holds = sideChild.getChildByName('holds');

    const lastIndex = this.getMJIndex(side, 13);
    const nc = holds.children[lastIndex];

    nc.scaleX = 1.0;
    nc.scaleY = 1.0;

    if (pai == null) {
      nc.active = false;
    } else if (pai >= 0) {
      nc.active = true;
      if (side === 'up') {
        nc.scaleX = 0.73;
        nc.scaleY = 0.73;
      }
      const sprite = nc.getComponent(cc.Sprite);
      sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, pai);
    } else if (pai != null) {
      nc.active = true;
      if (side === 'up') {
        nc.scaleX = 1.0;
        nc.scaleY = 1.0;
      }
      const sprite = nc.getComponent(cc.Sprite);
      sprite.spriteFrame = cc.vv.mahjongmgr.getHoldsEmptySpriteFrame(side);
    }
  },

  initEmptySprites(seatIndex) {
    const localIndex = cc.vv.gameNetMgr.getLocalIndex(seatIndex);
    const side = cc.vv.mahjongmgr.getSide(localIndex);
    // const pre = cc.vv.mahjongmgr.getFoldPre(localIndex);

    const gameChild = this.node.getChildByName('game');
    const sideChild = gameChild.getChildByName(side);
    const holds = sideChild.getChildByName('holds');
    const spriteFrame = cc.vv.mahjongmgr.getEmptySpriteFrame(side);
    for (let i = 0; i < holds.childrenCount; i++) {
      const nc = holds.children[i];
      nc.scaleX = 1.0;
      nc.scaleY = 1.0;

      const sprite = nc.getComponent(cc.Sprite);
      sprite.spriteFrame = spriteFrame;
    }
  },

  initOtherMahjongs(seatData) {
    // console.log("seat:" + seatData.seatindex);
    const localIndex = this.getLocalIndex(seatData.seatindex);
    if (localIndex === 0) {
      return;
    }
    const side = cc.vv.mahjongmgr.getSide(localIndex);
    const game = this.node.getChildByName('game');
    const sideRoot = game.getChildByName(side);
    const sideHolds = sideRoot.getChildByName('holds');
    let num =
      seatData.pengs.length +
      seatData.angangs.length +
      seatData.diangangs.length +
      seatData.wangangs.length;
    num *= 3;
    for (let i = 0; i < num; i++) {
      const idx = this.getMJIndex(side, i);
      sideHolds.children[idx].active = false;
    }

    const pre = cc.vv.mahjongmgr.getFoldPre(localIndex);
    const holds = this.sortHolds(seatData);
    if (holds != null && holds.length > 0) {
      for (let i = 0; i < holds.length; i++) {
        const idx = this.getMJIndex(side, i + num);
        const sprite = sideHolds.children[idx].getComponent(cc.Sprite);
        if (side === 'up') {
          sprite.node.scaleX = 0.73;
          sprite.node.scaleY = 0.73;
        }
        sprite.node.active = true;
        sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(
          pre,
          holds[i]
        );
      }

      if (holds.length + num === 13) {
        const lasetIdx = this.getMJIndex(side, 13);
        sideHolds.children[lasetIdx].active = false;
      }
    }
  },

  sortHolds(seatData) {
    const { holds } = seatData;
    if (holds == null) {
      return null;
    }
    // 如果手上的牌的数目是2,5,8,11,14，表示最后一张牌是刚摸到的牌
    let mopai = null;
    const l = holds.length;
    if (l === 2 || l === 5 || l === 8 || l === 11 || l === 14) {
      mopai = holds.pop();
    }

    const { dingque } = seatData;
    cc.vv.mahjongmgr.sortMJ(holds, dingque);

    // 将摸牌添加到最后
    if (mopai != null) {
      holds.push(mopai);
    }
    return holds;
  },

  initMahjongs() {
    const { seats } = cc.vv.gameNetMgr;
    const seatData = seats[cc.vv.gameNetMgr.seatIndex];
    const holds = this.sortHolds(seatData);
    if (holds == null) {
      return;
    }

    // 初始化手牌
    const lackingNum =
      (seatData.pengs.length +
        seatData.angangs.length +
        seatData.diangangs.length +
        seatData.wangangs.length) *
      3;
    for (let i = 0; i < holds.length; i++) {
      const mjid = holds[i];
      const sprite = this.myMJArr[i + lackingNum];
      sprite.node.mjId = mjid;
      sprite.node.y = 0;
      this.setSpriteFrameByMJID('M_', sprite, mjid);
    }
    for (let i = 0; i < lackingNum; i++) {
      const sprite = this.myMJArr[i];
      sprite.node.mjId = null;
      sprite.spriteFrame = null;
      sprite.node.active = false;
    }
    for (let i = lackingNum + holds.length; i < this.myMJArr.length; i++) {
      const sprite = this.myMJArr[i];
      sprite.node.mjId = null;
      sprite.spriteFrame = null;
      sprite.node.active = false;
    }
  },

  setSpriteFrameByMJID(pre, sprite, mjid) {
    sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, mjid);
    sprite.node.active = true;
  },

  getLocalIndex(index) {
    const ret = (index - cc.vv.gameNetMgr.seatIndex + 4) % 4;
    return ret;
  },

  onOptionClicked(event) {
    if (event.target.name === 'btnPeng') {
      cc.vv.net.send('peng');
    } else if (event.target.name === 'btnGang') {
      cc.vv.net.send('gang', event.target.pai);
    } else if (event.target.name === 'btnHu') {
      cc.vv.net.send('hu');
    } else if (event.target.name === 'btnGuo') {
      cc.vv.net.send('guo');
    }
  },
  onDestroy() {
    if (cc.vv) {
      cc.vv.gameNetMgr.clear();
    }
  }
});
