cc.Class({
  extends: cc.Component,

  properties: {
    difenxuanze: null,
    zimo: null,
    wanfaxuanze: null,
    zuidafanshu: null,
    jushuxuanze: null,
    dianganghua: null,
    leixingxuanze: null
  },

  // use this for initialization
  onLoad() {
    this.leixingxuanze = [];
    const t = this.node.getChildByName('leixingxuanze');
    for (let i = 0; i < t.childrenCount; i++) {
      const n = t.children[i].getComponent('RadioButton');
      if (n != null) {
        this.leixingxuanze.push(n);
      }
    }

    this.difenxuanze = [];
    const tt = this.node.getChildByName('difenxuanze');
    for (let i = 0; i < tt.childrenCount; i++) {
      const n = tt.children[i].getComponent('RadioButton');
      if (n != null) {
        this.difenxuanze.push(n);
      }
    }
    // console.log(this._difenxuanze);

    this.zimo = [];
    const ttt = this.node.getChildByName('zimojiacheng');
    for (let i = 0; i < ttt.childrenCount; i++) {
      const n = ttt.children[i].getComponent('RadioButton');
      if (n != null) {
        this.zimo.push(n);
      }
    }
    // console.log(this._zimo);

    this.wanfaxuanze = [];
    const tttt = this.node.getChildByName('wanfaxuanze');
    for (let i = 0; i < tttt.childrenCount; i++) {
      const n = tttt.children[i].getComponent('CheckBox');
      if (n != null) {
        this.wanfaxuanze.push(n);
      }
    }
    // console.log(this._wanfaxuanze);

    this.zuidafanshu = [];
    const ttttt = this.node.getChildByName('zuidafanshu');
    for (let i = 0; i < ttttt.childrenCount; i++) {
      const n = ttttt.children[i].getComponent('RadioButton');
      if (n != null) {
        this.zuidafanshu.push(n);
      }
    }
    // console.log(this._zuidafanshu);

    this.jushuxuanze = [];
    const tttttt = this.node.getChildByName('xuanzejushu');
    for (let i = 0; i < tttttt.childrenCount; i++) {
      const n = tttttt.children[i].getComponent('RadioButton');
      if (n != null) {
        this.jushuxuanze.push(n);
      }
    }

    this.dianganghua = [];
    const ttttttt = this.node.getChildByName('dianganghua');
    for (let i = 0; i < ttttttt.childrenCount; i++) {
      const n = ttttttt.children[i].getComponent('RadioButton');
      if (n != null) {
        this.dianganghua.push(n);
      }
    }
    // console.log(this._jushuxuanze);
  },

  onBtnBack() {
    this.node.active = false;
  },

  onBtnOK() {
    this.node.active = false;
    this.createRoom();
  },

  createRoom() {
    const onCreate = (ret) => {
      if (ret.errcode !== 0) {
        cc.vv.wc.hide();
        // console.log(ret.errmsg);
        if (ret.errcode === 2222) {
          cc.vv.alert.show('提示', '房卡不足，创建房间失败!');
        } else {
          cc.vv.alert.show('提示', `创建房间失败,错误码:${ret.errcode}`);
        }
      } else {
        cc.vv.gameNetMgr.connectGameServer(ret);
      }
    };

    let difen = 0;
    for (let i = 0; i < this.difenxuanze.length; i++) {
      if (this.difenxuanze[i].checked) {
        difen = i;
        break;
      }
    }

    let zimo = 0;
    for (let i = 0; i < this.zimo.length; i++) {
      if (this.zimo[i].checked) {
        zimo = i;
        break;
      }
    }

    const huansanzhang = this.wanfaxuanze[0].checked;
    const jiangdui = this.wanfaxuanze[1].checked;
    const menqing = this.wanfaxuanze[2].checked;
    const tiandihu = this.wanfaxuanze[3].checked;

    let type = 0;
    for (let i = 0; i < this.leixingxuanze.length; i++) {
      if (this.leixingxuanze[i].checked) {
        type = i;
        break;
      }
    }

    if (type === 0) {
      type = 'xzdd';
    } else {
      type = 'xlch';
    }

    let zuidafanshu = 0;
    for (let i = 0; i < this.zuidafanshu.length; i++) {
      if (this.zuidafanshu[i].checked) {
        zuidafanshu = i;
        break;
      }
    }

    let jushuxuanze = 0;
    for (let i = 0; i < this.jushuxuanze.length; i++) {
      if (this.jushuxuanze[i].checked) {
        jushuxuanze = i;
        break;
      }
    }

    let dianganghua = 0;
    for (let i = 0; i < this.dianganghua.length; i++) {
      if (this.dianganghua[i].checked) {
        dianganghua = i;
        break;
      }
    }

    const conf = {
      type,
      difen,
      zimo,
      jiangdui,
      huansanzhang,
      zuidafanshu,
      jushuxuanze,
      dianganghua,
      menqing,
      tiandihu
    };

    const data = {
      account: cc.vv.userMgr.account,
      sign: cc.vv.userMgr.sign,
      conf: JSON.stringify(conf)
    };
    cc.vv.wc.show('正在创建房间');
    cc.vv.http.sendRequest('/create_private_room', data, onCreate);
  }

  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },
});
