cc.Class({
  extends: cc.Component,

  properties: {
    tipLabel: cc.Label,
    stateStr: '',
    progress: 0.0,
    splash: null,
    isLoading: false
  },

  // use this for initialization
  onLoad() {
    if (!cc.sys.isNative && cc.sys.isMobile) {
      const cvs = this.node.getComponent(cc.Canvas);
      cvs.fitHeight = true;
      cvs.fitWidth = true;
    }
    this.initMgr();
    this.tipLabel.string = this.stateStr;

    this.splash = cc.find('Canvas/splash');
    this.splash.active = true;
  },

  start() {
    const SHOW_TIME = 3000;
    const fadeOut = () => {
      this.splash.active = false;
      this.checkVersion();
    };
    setTimeout(fadeOut, SHOW_TIME);
  },
  initMgr() {
    cc.vv = {};
    const UserMgr = require('../UserMgr');
    cc.vv.userMgr = new UserMgr();

    const ReplayMgr = require('../ReplayMgr');
    cc.vv.replayMgr = new ReplayMgr();

    cc.vv.http = require('../HTTP');
    cc.vv.global = require('../Global');
    cc.vv.net = require('../Net');

    const GameNetMgr = require('../GameNetMgr');
    cc.vv.gameNetMgr = new GameNetMgr();
    cc.vv.gameNetMgr.initHandlers();

    const AnysdkMgr = require('../AnysdkMgr');
    cc.vv.anysdkMgr = new AnysdkMgr();
    cc.vv.anysdkMgr.init();

    const VoiceMgr = require('../VoiceMgr');
    cc.vv.voiceMgr = new VoiceMgr();
    cc.vv.voiceMgr.init();

    const AudioMgr = require('../AudioMgr');
    cc.vv.audioMgr = new AudioMgr();
    cc.vv.audioMgr.init();

    const Utils = require('../Utils');
    cc.vv.utils = new Utils();

    cc.args = cc.vv.utils.urlParse();
  },

  checkVersion() {
    const onGetVersion = (ret) => {
      if (ret.version != null) {
        cc.vv.SI = ret;
        if (ret.version !== cc.VERSION) {
          cc.find('Canvas/alert').active = true;
        } else {
          this.startPreloading();
        }
      }
    };

    let xhr = null;
    let complete = false;
    let fn = () => {};
    const fnRequest = () => {
      this.stateStr = '正在连接服务器';
      xhr = cc.vv.http.sendRequest('/get_serverinfo', null, (ret) => {
        xhr = null;
        complete = true;
        onGetVersion(ret);
      });
      setTimeout(fn, 5000);
    };

    fn = () => {
      if (!complete) {
        if (xhr) {
          xhr.abort();
          this.stateStr = '连接失败，即将重试';
          setTimeout(() => {
            fnRequest();
          }, 5000);
        } else {
          fnRequest();
        }
      }
    };
    fn();
  },

  onBtnDownloadClicked() {
    cc.sys.openURL(cc.vv.SI.appweb);
  },

  startPreloading() {
    this.stateStr = '正在加载资源，请稍候';
    this.isLoading = true;

    cc.loader.onProgress = (completedCount, totalCount) => {
      if (this.isLoading) {
        this.progress = completedCount / totalCount;
      }
    };

    cc.loader.loadResDir('textures', () => {
      this.onLoadComplete();
    });
  },

  onLoadComplete() {
    this.isLoading = false;
    this.stateStr = '准备登陆';
    cc.director.loadScene('login');
    cc.loader.onComplete = null;
  },

  // called every frame, uncomment this function to activate update callback
  update() {
    if (this.stateStr.length === 0) {
      return;
    }
    this.tipLabel.string = `${this.stateStr} `;
    if (this.isLoading) {
      this.tipLabel.string += `${Math.floor(this.progress * 100)}%`;
    } else {
      const t = Math.floor(Date.now() / 1000) % 4;
      for (let i = 0; i < t; ++i) {
        this.tipLabel.string += '.';
      }
    }
  }
});
