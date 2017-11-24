cc.Class({
  extends: cc.Component,

  properties: {
    lblRoomNo: {
      default: null,
      type: cc.Label
    },
    seats: [],
    seats2: [],
    timeLabel: null,
    voiceMsgQueue: [],
    lastPlayingSeat: null,
    playingSeat: null,
    lastPlayTime: null
  },

  // use this for initialization
  onLoad() {
    if (cc.vv == null) {
      return;
    }

    this.initView();
    this.initSeats();
    this.initEventHandlers();
  },

  initView() {
    const prepare = this.node.getChildByName('prepare');
    const seats = prepare.getChildByName('seats');
    for (let i = 0; i < seats.children.length; i++) {
      this.seats.push(seats.children[i].getComponent('Seat'));
    }

    this.refreshBtns();

    this.lblRoomNo = cc
      .find('Canvas/infobar/Z_room_txt/New Label')
      .getComponent(cc.Label);
    this.timeLabel = cc.find('Canvas/infobar/time').getComponent(cc.Label);
    this.lblRoomNo.string = cc.vv.gameNetMgr.roomId;
    const gameChild = this.node.getChildByName('game');
    const sides = ['myself', 'right', 'up', 'left'];
    for (let i = 0; i < sides.length; i++) {
      const sideNode = gameChild.getChildByName(sides[i]);
      const seat = sideNode.getChildByName('seat');
      this.seats2.push(seat.getComponent('Seat'));
    }

    const btnWechat = cc.find('Canvas/prepare/btnWeichat');
    if (btnWechat) {
      cc.vv.utils.addClickEvent(
        btnWechat,
        this.node,
        'MJRoom',
        'onBtnWeichatClicked'
      );
    }

    const titles = cc.find('Canvas/typeTitle');
    for (let i = 0; i < titles.children.length; i++) {
      titles.children[i].active = false;
    }

    if (cc.vv.gameNetMgr.conf) {
      let { type } = cc.vv.gameNetMgr.conf;
      if (type == null || type === '') {
        type = 'xzdd';
      }

      titles.getChildByName(type).active = true;
    }
  },

  refreshBtns() {
    const prepare = this.node.getChildByName('prepare');
    const btnExit = prepare.getChildByName('btnExit');
    const btnDispress = prepare.getChildByName('btnDissolve');
    const btnWeichat = prepare.getChildByName('btnWeichat');
    const btnBack = prepare.getChildByName('btnBack');
    const isIdle = cc.vv.gameNetMgr.numOfGames === 0;

    btnExit.active = !cc.vv.gameNetMgr.isOwner() && isIdle;
    btnDispress.active = cc.vv.gameNetMgr.isOwner() && isIdle;

    btnWeichat.active = isIdle;
    btnBack.active = isIdle;
  },

  initEventHandlers() {
    this.node.on('new_user', (data) => {
      this.initSingleSeat(data.detail);
    });

    this.node.on('user_state_changed', (data) => {
      this.initSingleSeat(data.detail);
    });

    this.node.on('game_begin', () => {
      this.refreshBtns();
      this.initSeats();
    });

    this.node.on('game_num', () => {
      this.refreshBtns();
    });

    this.node.on('game_huanpai', () => {
      for (const i in this.seats2) {
        this.seats2[i].refreshXuanPaiState();
      }
    });

    this.node.on('huanpai_notify', (data) => {
      const idx = data.detail.seatindex;
      const localIdx = cc.vv.gameNetMgr.getLocalIndex(idx);
      this.seats2[localIdx].refreshXuanPaiState();
    });

    this.node.on('game_huanpai_over', () => {
      for (const i in this.seats2) {
        this.seats2[i].refreshXuanPaiState();
      }
    });

    this.node.on('voice_msg', ({ detail: data }) => {
      this.voiceMsgQueue.push(data);
      this.playVoice();
    });

    this.node.on('chat_push', ({ detail: data }) => {
      const idx = cc.vv.gameNetMgr.getSeatIndexByID(data.sender);
      const localIdx = cc.vv.gameNetMgr.getLocalIndex(idx);
      this.seats[localIdx].chat(data.content);
      this.seats2[localIdx].chat(data.content);
    });

    this.node.on('quick_chat_push', ({ detail: data }) => {
      const idx = cc.vv.gameNetMgr.getSeatIndexByID(data.sender);
      const localIdx = cc.vv.gameNetMgr.getLocalIndex(idx);

      const index = data.content;
      const info = cc.vv.chat.getQuickChatInfo(index);
      this.seats[localIdx].chat(info.content);
      this.seats2[localIdx].chat(info.content);

      cc.vv.audioMgr.playSFX(info.sound);
    });

    this.node.on('emoji_push', ({ detail: data }) => {
      const idx = cc.vv.gameNetMgr.getSeatIndexByID(data.sender);
      const localIdx = cc.vv.gameNetMgr.getLocalIndex(idx);
      console.log(data);
      this.seats[localIdx].emoji(data.content);
      this.seats2[localIdx].emoji(data.content);
    });
  },

  initSeats() {
    const { seats } = cc.vv.gameNetMgr;
    for (let i = 0; i < seats.length; i++) {
      this.initSingleSeat(seats[i]);
    }
  },

  initSingleSeat(seat) {
    const index = cc.vv.gameNetMgr.getLocalIndex(seat.seatindex);
    const isOffline = !seat.online;
    const isZhuang = seat.seatindex === cc.vv.gameNetMgr.button;

    this.seats[index].setInfo(seat.name, seat.score);
    this.seats[index].setReady(seat.ready);
    this.seats[index].setOffline(isOffline);
    this.seats[index].setID(seat.userid);
    this.seats[index].voiceMsg(false);

    this.seats2[index].setInfo(seat.name, seat.score);
    this.seats2[index].setZhuang(isZhuang);
    this.seats2[index].setOffline(isOffline);
    this.seats2[index].setID(seat.userid);
    this.seats2[index].voiceMsg(false);
    this.seats2[index].refreshXuanPaiState();
  },

  onBtnSettingsClicked() {
    cc.vv.popupMgr.showSettings();
  },

  onBtnBackClicked() {
    cc.vv.alert.show(
      '返回大厅',
      '返回大厅房间仍会保留，快去邀请大伙来玩吧！',
      () => {
        cc.director.loadScene('hall');
      },
      true
    );
  },

  onBtnChatClicked() {},

  onBtnWeichatClicked() {
    let title = '<血战到底>';
    if (cc.vv.gameNetMgr.conf.type === 'xlch') {
      title = '<血流成河>';
    }
    cc.vv.anysdkMgr.share(
      `达达麻将${title}`,
      `房号:${cc.vv.gameNetMgr.roomId} 玩法:${cc.vv.gameNetMgr.getWanfa()}`
    );
  },

  onBtnDissolveClicked() {
    cc.vv.alert.show(
      '解散房间',
      '解散房间不扣房卡，是否确定解散？',
      () => {
        cc.vv.net.send('dispress');
      },
      true
    );
  },

  onBtnExit() {
    cc.vv.net.send('exit');
  },

  playVoice() {
    if (this.playingSeat == null && this.voiceMsgQueue.length) {
      const data = this.voiceMsgQueue.shift();
      const idx = cc.vv.gameNetMgr.getSeatIndexByID(data.sender);
      const localIndex = cc.vv.gameNetMgr.getLocalIndex(idx);
      this.playingSeat = localIndex;
      this.seats[localIndex].voiceMsg(true);
      this.seats2[localIndex].voiceMsg(true);

      const msgInfo = JSON.parse(data.content);

      const msgfile = 'voicemsg.amr';
      console.log(msgInfo.msg.length);
      cc.vv.voiceMgr.writeVoice(msgfile, msgInfo.msg);
      cc.vv.voiceMgr.play(msgfile);
      this.lastPlayTime = Date.now() + msgInfo.time;
    }
  },

  // called every frame, uncomment this function to activate update callback
  update() {
    const minutes = Math.floor(Date.now() / 1000 / 60);
    if (this.lastMinute !== minutes) {
      this.lastMinute = minutes;
      const date = new Date();
      let h = date.getHours();
      h = h < 10 ? `0${h}` : h;

      let m = date.getMinutes();
      m = m < 10 ? `0${m}` : m;
      this.timeLabel.string = `${h}:${m}`;
    }

    if (this.lastPlayTime != null) {
      if (Date.now() > this.lastPlayTime + 200) {
        this.onPlayerOver();
        this.lastPlayTime = null;
      }
    } else {
      this.playVoice();
    }
  },

  onPlayerOver() {
    cc.vv.audioMgr.resumeAll();
    const localIndex = this.playingSeat;
    this.playingSeat = null;
    this.seats[localIndex].voiceMsg(false);
    this.seats2[localIndex].voiceMsg(false);
  },

  onDestroy() {
    cc.vv.voiceMgr.stop();
    //        cc.vv.voiceMgr.onPlayCallback = null;
  }
});
