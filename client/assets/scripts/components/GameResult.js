cc.Class({
  extends: cc.Component,

  properties: {
    gameresult: null,
    seats: []
  },

  // use this for initialization
  onLoad() {
    if (cc.vv == null) {
      return;
    }

    this.gameresult = this.node.getChildByName('game_result');
    // this._gameresult.active = false;

    const seats = this.gameresult.getChildByName('seats');
    for (let i = 0; i < seats.children.length; i++) {
      this.seats.push(seats.children[i].getComponent('Seat'));
    }

    const btnClose = cc.find('Canvas/game_result/btnClose');
    if (btnClose) {
      cc.vv.utils.addClickEvent(
        btnClose,
        this.node,
        'GameResult',
        'onBtnCloseClicked'
      );
    }

    const btnShare = cc.find('Canvas/game_result/btnShare');
    if (btnShare) {
      cc.vv.utils.addClickEvent(
        btnShare,
        this.node,
        'GameResult',
        'onBtnShareClicked'
      );
    }

    // 初始化网络事件监听器
    this.node.on('game_end', (data) => {
      this.onGameEnd(data.detail);
    });
  },

  showResult(seat, info, isZuiJiaPaoShou) {
    seat.node.getChildByName('zuijiapaoshou').active = isZuiJiaPaoShou;

    seat.node.getChildByName('zimocishu').getComponent(cc.Label).string =
      info.numzimo;
    seat.node.getChildByName('jiepaocishu').getComponent(cc.Label).string =
      info.numjiepao;
    seat.node.getChildByName('dianpaocishu').getComponent(cc.Label).string =
      info.numdianpao;
    seat.node.getChildByName('angangcishu').getComponent(cc.Label).string =
      info.numangang;
    seat.node.getChildByName('minggangcishu').getComponent(cc.Label).string =
      info.numminggang;
    seat.node.getChildByName('chajiaocishu').getComponent(cc.Label).string =
      info.numchadajiao;
  },

  onGameEnd(endinfo) {
    const { seats } = cc.vv.gameNetMgr;
    let maxscore = -1;
    let maxdianpao = 0;
    let dianpaogaoshou = -1;
    for (let i = 0; i < seats.length; i++) {
      const seat = seats[i];
      if (seat.score > maxscore) {
        maxscore = seat.score;
      }
      if (endinfo[i].numdianpao > maxdianpao) {
        maxdianpao = endinfo[i].numdianpao;
        dianpaogaoshou = i;
      }
    }

    for (let i = 0; i < seats.length; i++) {
      const seat = seats[i];
      let isBigwin = false;
      if (seat.score > 0) {
        isBigwin = seat.score === maxscore;
      }
      this.seats[i].setInfo(seat.name, seat.score, isBigwin);
      this.seats[i].setID(seat.userid);
      const isZuiJiaPaoShou = dianpaogaoshou === i;
      this.showResult(this.seats[i], endinfo[i], isZuiJiaPaoShou);
    }
  },

  onBtnCloseClicked() {
    cc.director.loadScene('hall');
  },

  onBtnShareClicked() {
    cc.vv.anysdkMgr.shareResult();
  }
});
