String.prototype.format = (args) => {
  if (arguments.length > 0) {
    let result = this;
    if (arguments.length === 1 && typeof args === 'object') {
      for (const key in args) {
        const reg = new RegExp(`({${key}})`, 'g');
        result = result.replace(reg, args[key]);
      }
    } else {
      for (let i = 0; i < arguments.length; i++) {
        if (arguments[i] === undefined) {
          return '';
        }
        const reg = new RegExp(`({[${i}]})`, 'g');
        result = result.replace(reg, arguments[i]);
      }
    }
    return result;
  }
  return this;
};

cc.Class({
  extends: cc.Component,

  properties: {
    mima: null,
    mimaIndex: 0
  },

  // use this for initialization
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
    cc.vv.http.url = cc.vv.http.master_url;
    cc.vv.net.addHandler('push_need_create_role', () => {
      console.log('onLoad:push_need_create_role');
      cc.director.loadScene('createrole');
    });

    cc.vv.audioMgr.playBGM('bgMain.mp3');

    this.mima = [
      'A',
      'A',
      'B',
      'B',
      'A',
      'B',
      'A',
      'B',
      'A',
      'A',
      'A',
      'B',
      'B',
      'B'
    ];
    if (!cc.sys.isNative || cc.sys.os === cc.sys.OS_WINDOWS) {
      cc.find('Canvas/btn_yk').active = true;
    }
  },

  start() {
    const account = cc.sys.localStorage.getItem('wx_account');
    const sign = cc.sys.localStorage.getItem('wx_sign');
    if (account != null && sign != null) {
      const ret = {
        errcode: 0,
        account,
        sign
      };
      cc.vv.userMgr.onAuth(ret);
    }
  },

  onBtnQuickStartClicked() {
    cc.vv.userMgr.guestAuth();
  },

  onBtnWeichatClicked() {
    cc.vv.anysdkMgr.login();
  },

  onBtnMIMAClicked(event) {
    if (this.mima[this.mimaIndex] === event.target.name) {
      this.mimaIndex++;
      if (this.mimaIndex === this.mima.length) {
        cc.find('Canvas/btn_yk').active = true;
      }
    } else {
      this.mimaIndex = 0;
    }
  }

  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },
});
