cc.Class({
  extends: cc.Component,
  properties: {
    account: null,
    userId: null,
    userName: null,
    lv: 0,
    exp: 0,
    coins: 0,
    gems: 0,
    sign: 0,
    ip: '',
    sex: 0,
    roomData: null,

    oldRoomId: null
  },

  guestAuth() {
    let { account } = cc.arg;
    if (account == null) {
      account = cc.sys.localStorage.getItem('account');
    }

    if (account == null) {
      account = Date.now();
      cc.sys.localStorage.setItem('account', account);
    }

    cc.vv.http.sendRequest(
      '/guest',
      {
        account
      },
      this.onAuth
    );
  },

  onAuth(ret) {
    const self = cc.vv.userMgr;
    if (ret.errcode === 0) {
      self.account = ret.account;
      self.sign = ret.sign;
      cc.vv.http.url = `http://${cc.vv.SI.hall}`;
      self.login();
    }
  },

  login() {
    const self = this;
    const onLogin = (ret) => {
      if (ret.errcode === 0 && ret.userid) {
        self.account = ret.account;
        self.userId = ret.userid;
        self.userName = ret.name;
        self.lv = ret.lv;
        self.exp = ret.exp;
        self.coins = ret.coins;
        self.gems = ret.gems;
        self.roomData = ret.roomid;
        self.sex = ret.sex;
        self.ip = ret.ip;
        cc.director.loadScene('hall');
      } else {
        cc.director.loadScene('createrole');
      }
    };
    cc.vv.wc.show('正在登录游戏');
    cc.vv.http.sendRequest(
      '/login',
      {
        account: this.account,
        sign: this.sign
      },
      onLogin
    );
  },

  create(name) {
    const self = this;
    const onCreate = (ret) => {
      if (ret.errcode === 0) {
        self.login();
      }
    };
    const data = {
      account: this.account,
      sign: this.sign,
      name
    };
    cc.vv.http.sendRequest('/create_user', data, onCreate);
  },

  enterRoom(roomId, callback) {
    const self = this;
    const onEnter = (ret) => {
      if (ret.errcode !== 0) {
        if (ret.errcode === -1) {
          setTimeout(() => {
            self.enterRoom(roomId, callback);
          }, 5000);
        } else {
          cc.vv.wc.hide();
          if (callback != null) {
            callback(ret);
          }
        }
      } else {
        if (callback != null) {
          callback(ret);
        }
        cc.vv.gameNetMgr.connectGameServer(ret);
      }
    };

    const data = {
      account: cc.vv.userMgr.account,
      sign: cc.vv.userMgr.sign,
      roomid: roomId
    };
    cc.vv.wc.show(`正在进入房间 ${roomId}`);
    cc.vv.http.sendRequest('/enter_private_room', data, onEnter);
  },
  getHistoryList(callback) {
    const onGet = (ret) => {
      if (ret.errcode === 0) {
        callback && callback(ret.history);
      }
    };

    const data = {
      account: cc.vv.userMgr.account,
      sign: cc.vv.userMgr.sign
    };
    cc.vv.http.sendRequest('/get_history_list', data, onGet);
  },
  getGamesOfRoom(uuid, callback) {
    const onGet = (ret) => {
      ret.errcode === 0 && callback && callback(ret.data);
    };

    const data = {
      account: cc.vv.userMgr.account,
      sign: cc.vv.userMgr.sign,
      uuid
    };
    cc.vv.http.sendRequest('/get_games_of_room', data, onGet);
  },

  getDetailOfGame(uuid, index, callback) {
    const onGet = (ret) => {
      ret.errcode === 0 && callback && callback(ret.data);
    };

    const data = {
      account: cc.vv.userMgr.account,
      sign: cc.vv.userMgr.sign,
      uuid,
      index
    };
    cc.vv.http.sendRequest('/get_detail_of_game', data, onGet);
  }
});
