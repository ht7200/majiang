cc.Class({
  extends: cc.Component,
  properties: {
    dataEventHandler: null,
    roomId: null,
    maxNumOfGames: 0,
    numOfGames: 0,
    numOfMJ: 0,
    seatIndex: -1,
    seats: null,
    turn: -1,
    button: -1,
    chupai: -1,
    gamestate: '',
    isOver: false,
    dissoveData: null
  },

  reset() {
    this.turn = -1;
    this.chupai = -1;
    this.button = -1;
    this.gamestate = '';
    this.curaction = null;
    for (let i = 0; i < this.seats.length; i++) {
      this.seats[i].holds = [];
      this.seats[i].folds = [];
      this.seats[i].pengs = [];
      this.seats[i].angangs = [];
      this.seats[i].diangangs = [];
      this.seats[i].wangangs = [];
      this.seats[i].dingque = -1;
      this.seats[i].ready = false;
      this.seats[i].hued = false;
      this.seats[i].huanpais = null;
      this.huanpaimethod = -1;
    }
  },

  clear() {
    this.dataEventHandler = null;
    if (this.isOver == null) {
      this.seats = null;
      this.roomId = null;
      this.maxNumOfGames = 0;
      this.numOfGames = 0;
    }
  },

  dispatchEvent(event, data) {
    if (this.dataEventHandler) {
      this.dataEventHandler.emit(event, data);
    }
  },

  getSeatIndexByID(userId) {
    for (let i = 0; i < this.seats.length; i++) {
      const s = this.seats[i];
      if (s.userid === userId) {
        return i;
      }
    }
    return -1;
  },

  isOwner() {
    return this.seatIndex === 0;
  },

  getSeatByID(userId) {
    const seatIndex = this.getSeatIndexByID(userId);
    const seat = this.seats[seatIndex];
    return seat;
  },

  getthisData() {
    return this.seats[this.seatIndex];
  },

  getLocalIndex(index) {
    const ret = (index - this.seatIndex + 4) % 4;
    return ret;
  },

  prepareReplay(roomInfo, detailOfGame) {
    this.roomId = roomInfo.id;
    this.seats = roomInfo.seats;
    this.turn = detailOfGame.base_info.button;
    const baseInfo = detailOfGame.base_info;
    for (let i = 0; i < this.seats.length; i++) {
      const s = this.seats[i];
      s.seatindex = i;
      s.score = null;
      s.holds = baseInfo.game_seats[i];
      s.pengs = [];
      s.angangs = [];
      s.diangangs = [];
      s.wangangs = [];
      s.folds = [];
      if (cc.vv.userMgr.userId === s.userid) {
        this.seatIndex = i;
      }
    }
    this.conf = {
      type: baseInfo.type
    };
    if (this.conf.type == null) {
      this.conf.type === 'xzdd';
    }
  },

  getWanfa() {
    const { conf } = this;
    if (conf && conf.maxGames != null && conf.maxFan != null) {
      const strArr = [];
      strArr.push(`${conf.maxGames}局`);
      strArr.push(`${conf.maxFan}番封顶`);
      if (conf.hsz) {
        strArr.push('换三张');
      }
      if (conf.zimo === 1) {
        strArr.push('自摸加番');
      } else {
        strArr.push('自摸加底');
      }
      if (conf.jiangdui) {
        strArr.push('将对');
      }
      if (conf.dianganghua === 1) {
        strArr.push('点杠花(自摸)');
      } else {
        strArr.push('点杠花(放炮)');
      }
      if (conf.menqing) {
        strArr.push('门清、中张');
      }
      if (conf.tiandihu) {
        strArr.push('天地胡');
      }
      return strArr.join(' ');
    }
    return '';
  },

  initHandlers() {
    cc.vv.net.addHandler('login_result', (data) => {
      const mData = data;
      if (data.errcode === 0) {
        const { data } = mData;
        this.roomId = data.roomid;
        this.conf = data.conf;
        this.maxNumOfGames = data.conf.maxGames;
        this.numOfGames = data.numofgames;
        this.seats = data.seats;
        this.seatIndex = this.getSeatIndexByID(cc.vv.userMgr.userId);
        this.isOver = false;
      }
    });

    cc.vv.net.addHandler('login_finished', () => {
      cc.director.loadScene('mjgame');
    });

    cc.vv.net.addHandler('exit_result', () => {
      this.roomId = null;
      this.turn = -1;
      this.seats = null;
    });

    cc.vv.net.addHandler('exit_notify_push', (data) => {
      const userId = data;
      const s = this.getSeatByID(userId);
      if (s != null) {
        s.userid = 0;
        s.name = '';
        this.dispatchEvent('user_state_changed', s);
      }
    });

    cc.vv.net.addHandler('dispress_push', () => {
      this.roomId = null;
      this.turn = -1;
      this.seats = null;
    });

    cc.vv.net.addHandler('disconnect', () => {
      if (this.roomId == null) {
        cc.director.loadScene('hall');
      } else if (!this.isOver) {
        cc.vv.userMgr.oldRoomId = this.roomId;
        this.dispatchEvent('disconnect');
      } else {
        this.roomId = null;
      }
    });

    cc.vv.net.addHandler('new_user_comes_push', (data) => {
      const seatIndex = data.seatindex;
      if (this.seats[seatIndex].userid > 0) {
        this.seats[seatIndex].online = true;
      } else {
        data.online = true;
        this.seats[seatIndex] = data;
      }
      this.dispatchEvent('new_user', this.seats[seatIndex]);
    });

    cc.vv.net.addHandler('user_state_push', (data) => {
      // console.log(data);
      const userId = data.userid;
      const seat = this.getSeatByID(userId);
      seat.online = data.online;
      this.dispatchEvent('user_state_changed', seat);
    });

    cc.vv.net.addHandler('user_ready_push', (data) => {
      // console.log(data);
      const userId = data.userid;
      const seat = this.getSeatByID(userId);
      seat.ready = data.ready;
      this.dispatchEvent('user_state_changed', seat);
    });

    cc.vv.net.addHandler('game_holds_push', (data) => {
      const seat = this.seats[this.seatIndex];
      seat.holds = data;

      for (let i = 0; i < this.seats.length; i++) {
        const s = this.seats[i];
        if (s.folds == null) {
          s.folds = [];
        }
        if (s.pengs == null) {
          s.pengs = [];
        }
        if (s.angangs == null) {
          s.angangs = [];
        }
        if (s.diangangs == null) {
          s.diangangs = [];
        }
        if (s.wangangs == null) {
          s.wangangs = [];
        }
        s.ready = false;
      }
      this.dispatchEvent('game_holds');
    });

    cc.vv.net.addHandler('game_begin_push', (data) => {
      this.button = data;
      this.turn = this.button;
      this.gamestate = 'begin';
      this.dispatchEvent('game_begin');
    });

    cc.vv.net.addHandler('game_playing_push', () => {
      this.gamestate = 'playing';
      this.dispatchEvent('game_playing');
    });

    cc.vv.net.addHandler('game_sync_push', (data) => {
      this.numOfMJ = data.numofmj;
      this.gamestate = data.state;
      if (this.gamestate === 'dingque') {
        this.isDingQueing = true;
      } else if (this.gamestate === 'huanpai') {
        this.isHuanSanZhang = true;
      }
      this.turn = data.turn;
      this.button = data.button;
      this.chupai = data.chuPai;
      this.huanpaimethod = data.huanpaimethod;
      for (let i = 0; i < 4; i++) {
        const seat = this.seats[i];
        const sd = data.seats[i];
        seat.holds = sd.holds;
        seat.folds = sd.folds;
        seat.angangs = sd.angangs;
        seat.diangangs = sd.diangangs;
        seat.wangangs = sd.wangangs;
        seat.pengs = sd.pengs;
        seat.hued = sd.hued;
        seat.iszimo = sd.iszimo;
        seat.huinfo = sd.huinfo;
        seat.huanpais = sd.huanpais;
        if (i === this.seatIndex) {
          this.dingque = sd.que;
        }
      }
    });

    cc.vv.net.addHandler('hangang_notify_push', (data) => {
      this.dispatchEvent('hangang_notify', data);
    });

    cc.vv.net.addHandler('game_action_push', (data) => {
      this.curaction = data;
      this.dispatchEvent('game_action', data);
    });

    cc.vv.net.addHandler('game_chupai_push', (data) => {
      const turnUserID = data;
      const si = this.getSeatIndexByID(turnUserID);
      this.doTurnChange(si);
    });

    cc.vv.net.addHandler('game_num_push', (data) => {
      this.numOfGames = data;
      this.dispatchEvent('game_num', data);
    });

    cc.vv.net.addHandler('game_over_push', (data) => {
      const { results } = data;
      for (let i = 0; i < this.seats.length; i++) {
        this.seats[i].score = results.length === 0 ? 0 : results[i].totalscore;
      }
      this.dispatchEvent('game_over', results);
      if (data.endinfo) {
        this.isOver = true;
        this.dispatchEvent('game_end', data.endinfo);
      }
      this.reset();
      for (let i = 0; i < this.seats.length; i++) {
        this.dispatchEvent('user_state_changed', this.seats[i]);
      }
    });

    cc.vv.net.addHandler('mj_count_push', (data) => {
      this.numOfMJ = data;
      // console.log(data);
      this.dispatchEvent('mj_count', data);
    });

    cc.vv.net.addHandler('hu_push', (data) => {
      this.doHu(data);
    });

    cc.vv.net.addHandler('game_chupai_notify_push', (data) => {
      const { userId, pai } = data;
      const si = this.getSeatIndexByID(userId);
      this.doChupai(si, pai);
    });

    cc.vv.net.addHandler('game_mopai_push', (data) => {
      this.doMopai(this.seatIndex, data);
    });

    cc.vv.net.addHandler('guo_notify_push', (data) => {
      const { userId, pai } = data;
      const si = this.getSeatIndexByID(userId);
      this.doGuo(si, pai);
    });

    cc.vv.net.addHandler('guo_result', () => {
      this.dispatchEvent('guo_result');
    });

    cc.vv.net.addHandler('guohu_push', () => {
      this.dispatchEvent('push_notice', {
        info: '过胡',
        time: 1.5
      });
    });

    cc.vv.net.addHandler('peng_notify_push', (data) => {
      const { userid: userId, pai } = data;
      const si = this.getSeatIndexByID(userId);
      this.doPeng(si, pai);
    });

    cc.vv.net.addHandler('gang_notify_push', (data) => {
      const { userid: userId, pai } = data;
      const si = this.getSeatIndexByID(userId);
      this.doGang(si, pai, data.gangtype);
    });

    cc.vv.net.addHandler('chat_push', (data) => {
      this.dispatchEvent('chat_push', data);
    });

    cc.vv.net.addHandler('quick_chat_push', (data) => {
      this.dispatchEvent('quick_chat_push', data);
    });

    cc.vv.net.addHandler('emoji_push', (data) => {
      this.dispatchEvent('emoji_push', data);
    });

    cc.vv.net.addHandler('dissolve_notice_push', (data) => {
      this.dissoveData = data;
      this.dispatchEvent('dissolve_notice', data);
    });

    cc.vv.net.addHandler('dissolve_cancel_push', (data) => {
      this.dissoveData = null;
      this.dispatchEvent('dissolve_cancel', data);
    });

    cc.vv.net.addHandler('voice_msg_push', (data) => {
      this.dispatchEvent('voice_msg', data);
    });
  },

  doGuo(seatIndex, pai) {
    const seatData = this.seats[seatIndex];
    const { folds } = seatData;
    folds.push(pai);
    this.dispatchEvent('guo_notify', seatData);
  },

  doMopai(seatIndex, pai) {
    const seatData = this.seats[seatIndex];
    if (seatData.holds) {
      seatData.holds.push(pai);
      this.dispatchEvent('game_mopai', {
        seatIndex,
        pai
      });
    }
  },

  doChupai(seatIndex, pai) {
    this.chupai = pai;
    const seatData = this.seats[seatIndex];
    if (seatData.holds) {
      const idx = seatData.holds.indexOf(pai);
      seatData.holds.splice(idx, 1);
    }
    this.dispatchEvent('game_chupai_notify', {
      seatData,
      pai
    });
  },

  doPeng(seatIndex, pai) {
    const seatData = this.seats[seatIndex];
    // 移除手牌
    if (seatData.holds) {
      for (let i = 0; i < 2; i++) {
        const idx = seatData.holds.indexOf(pai);
        seatData.holds.splice(idx, 1);
      }
    }

    // 更新碰牌数据
    const { pengs } = seatData;
    pengs.push(pai);

    this.dispatchEvent('peng_notify', seatData);
  },

  getGangType(seatData, pai) {
    if (seatData.pengs.indexOf(pai) !== -1) {
      return 'wangang';
    }
    let cnt = 0;
    for (let i = 0; i < seatData.holds.length; i++) {
      if (seatData.holds[i] === pai) {
        cnt++;
      }
    }
    if (cnt === 3) {
      return 'diangang';
    }
    return 'angang';
  },

  doGang(seatIndex, pai, gangtype) {
    const seatData = this.seats[seatIndex];

    if (!gangtype) {
      gangtype = this.getGangType(seatData, pai);
    }

    if (gangtype === 'wangang') {
      if (seatData.pengs.indexOf(pai) !== -1) {
        const idx = seatData.pengs.indexOf(pai);
        if (idx !== -1) {
          seatData.pengs.splice(idx, 1);
        }
      }
      seatData.wangangs.push(pai);
    }
    if (seatData.holds) {
      for (let i = 0; i <= 4; i++) {
        const idx = seatData.holds.indexOf(pai);
        if (idx === -1) {
          // 如果没有找到，表示移完了，直接跳出循环
          break;
        }
        seatData.holds.splice(idx, 1);
      }
    }
    if (gangtype === 'angang') {
      seatData.angangs.push(pai);
    } else if (gangtype === 'diangang') {
      seatData.diangangs.push(pai);
    }
    this.dispatchEvent('gang_notify', {
      seatData,
      gangtype
    });
  },

  doHu(data) {
    this.dispatchEvent('hupai', data);
  },

  doTurnChange(si) {
    const data = {
      last: this.turn,
      turn: si
    };
    this.turn = si;
    this.dispatchEvent('game_chupai', data);
  },

  connectGameServer(data) {
    this.dissoveData = null;
    cc.vv.net.ip = `${data.ip}:${data.port}`;

    const onConnectOK = () => {
      const sd = {
        token: data.token,
        roomid: data.roomid,
        time: data.time,
        sign: data.sign
      };
      cc.vv.net.send('login', sd);
    };

    const onConnectFailed = () => {
      cc.vv.wc.hide();
    };
    cc.vv.wc.show('正在进入房间');
    cc.vv.net.connect(onConnectOK, onConnectFailed);
  }

  // called every frame, uncomment this function to activate update callback

  // update: function (dt) {

  // },
});
