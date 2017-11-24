cc.Class({
  extends: cc.Component,

  properties: {
    queYiMen: null,
    tips: [],
    selected: [],
    dingques: []
  },

  // use this for initialization
  onLoad() {
    if (cc.vv == null) {
      return;
    }
    this.initView();
    this.initDingQue();
    this.initEventHandlers();
  },

  initView() {
    const gameChild = this.node.getChildByName('game');
    this.queYiMen = gameChild.getChildByName('dingque');
    this.queYiMen.active = cc.vv.gameNetMgr.isDingQueing;

    const arr = ['mythis', 'right', 'up', 'left'];
    for (let i = 0; i < arr.length; i++) {
      const side = gameChild.getChildByName(arr[i]);
      const seat = side.getChildByName('seat');
      const dingque = seat.getChildByName('que');
      this.dingques.push(dingque);
    }
    this.reset();

    const tips = this.queYiMen.getChildByName('tips');
    for (let i = 0; i < tips.childrenCount; i++) {
      const n = tips.children[i];
      this.tips.push(n.getComponent(cc.Label));
    }

    if (cc.vv.gameNetMgr.gamestate === 'dingque') {
      this.showDingQueChoice();
    }
  },

  initEventHandlers() {
    this.node.on('game_dingque', () => {
      this.showDingQueChoice();
    });

    this.node.on('game_dingque_notify', (data) => {
      const seatIndex = cc.vv.gameNetMgr.getSeatIndexByID(data.detail);
      const localIndex = cc.vv.gameNetMgr.getLocalIndex(seatIndex);
      this.tips[localIndex].node.active = true;
    });

    this.node.on('game_dingque_finish', () => {
      // 通知每一个玩家定缺的花色
      this.queYiMen.active = false;
      cc.vv.gameNetMgr.isDingQueing = false;
      this.initDingQue();
    });
  },

  showDingQueChoice() {
    this.queYiMen.active = true;
    const sd = cc.vv.gameNetMgr.getthisData();
    const typeCounts = [0, 0, 0];
    for (let i = 0; i < sd.holds.length; i++) {
      const pai = sd.holds[i];
      const type = cc.vv.mahjongmgr.getMahjongType(pai);
      typeCounts[type]++;
    }

    let min = 65535;
    let minIndex = 0;
    for (let i = 0; i < typeCounts.length; i++) {
      if (typeCounts[i] < min) {
        min = typeCounts[i];
        minIndex = i;
      }
    }

    const arr = ['tong', 'tiao', 'wan'];
    for (let i = 0; i < arr.length; i++) {
      const node = this.queYiMen.getChildByName(arr[i]);
      if (minIndex === i) {
        node.getComponent(cc.Animation).play('dingque_tuijian');
      } else {
        node.getComponent(cc.Animation).stop();
      }
      // this.queYiMen.getChildByName(arr[i]).getChildByName('jian').active = minIndex == i;
    }

    this.reset();
    for (let i = 0; i < this.tips.length; i++) {
      const n = this.tips[i];
      if (i > 0) {
        n.node.active = false;
      } else {
        n.node.active = true;
      }
    }
  },

  initDingQue() {
    const arr = ['tong', 'tiao', 'wan'];
    const data = cc.vv.gameNetMgr.seats;
    for (let i = 0; i < data.length; i++) {
      let que = data[i].dingque;
      if (que == null || que < 0 || que >= arr.length) {
        que = null;
      } else {
        que = arr[que];
      }

      const localIndex = cc.vv.gameNetMgr.getLocalIndex(i);
      if (que) {
        this.dingques[localIndex].getChildByName(que).active = true;
      }
    }
  },

  reset() {
    this.setInteractable(true);

    this.selected.push(this.queYiMen.getChildByName('tong_selected'));
    this.selected.push(this.queYiMen.getChildByName('tiao_selected'));
    this.selected.push(this.queYiMen.getChildByName('wan_selected'));
    for (let i = 0; i < this.selected.length; i++) {
      this.selected[i].active = false;
    }

    for (let i = 0; i < this.dingques.length; i++) {
      for (let j = 0; j < this.dingques[i].children.length; j++) {
        this.dingques[i].children[j].active = false;
      }
    }
  },

  onQueYiMenClicked(event) {
    let type = 0;
    if (event.target.name === 'tong') {
      type = 0;
    } else if (event.target.name === 'tiao') {
      type = 1;
    } else if (event.target.name === 'wan') {
      type = 2;
    }

    for (let i = 0; i < this.selected.length; i++) {
      this.selected[i].active = false;
    }
    this.selected[type].active = true;
    cc.vv.gameNetMgr.dingque = type;
    cc.vv.net.send('dingque', type);

    // this.setInteractable(false);
  },

  setInteractable(value) {
    this.queYiMen
      .getChildByName('tong')
      .getComponent(cc.Button).interactable = value;
    this.queYiMen
      .getChildByName('tiao')
      .getComponent(cc.Button).interactable = value;
    this.queYiMen
      .getChildByName('wan')
      .getComponent(cc.Button).interactable = value;
  }

  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },
});
