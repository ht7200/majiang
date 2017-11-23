const Utils = require('Utils');
cc.Class({
    extends: cc.Component,

    properties: {
        tipLabel: cc.Label,
        _stateStr: '',
        _progress: 0.0,
        _splash: null,
        _isLoading: false,
    },

    // use this for initialization
    onLoad: function () {
        if (!cc.sys.isNative && cc.sys.isMobile) {
            const cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }
        this.initMgr();
        this.tipLabel.string = this._stateStr;

        this._splash = cc.find("Canvas/splash");
        this._splash.active = true;
    },

    start: function () {
        const SHOW_TIME = 3000;
        const fadeOut = () => {
            this._splash.active = false;
            this.checkVersion();
        }
        setTimeout(fadeOut, SHOW_TIME);
    },
    initMgr: function () {
        cc.vv = {};
        const UserMgr = require("UserMgr");
        cc.vv.userMgr = new UserMgr();

        const ReplayMgr = require("ReplayMgr");
        cc.vv.replayMgr = new ReplayMgr();

        cc.vv.http = require("HTTP");
        cc.vv.global = require("Global");
        cc.vv.net = require("Net");

        const GameNetMgr = require("GameNetMgr");
        cc.vv.gameNetMgr = new GameNetMgr();
        cc.vv.gameNetMgr.initHandlers();

        const AnysdkMgr = require("AnysdkMgr");
        cc.vv.anysdkMgr = new AnysdkMgr();
        cc.vv.anysdkMgr.init();

        const VoiceMgr = require("VoiceMgr");
        cc.vv.voiceMgr = new VoiceMgr();
        cc.vv.voiceMgr.init();

        const AudioMgr = require("AudioMgr");
        cc.vv.audioMgr = new AudioMgr();
        cc.vv.audioMgr.init();

        const Utils = require("Utils");
        cc.vv.utils = new Utils();

        cc.args = cc.vv.utils.urlParse();
    },

    checkVersion: function () {
        const self = this;
        const onGetVersion = function (ret) {
            if (ret.version == null) {
                console.log("error.");
            } else {
                cc.vv.SI = ret;
                if (ret.version != cc.VERSION) {
                    cc.find("Canvas/alert").active = true;
                } else {
                    self.startPreloading();
                }
            }
        };

        let xhr = null;
        let complete = false;
        const fnRequest = function () {
            self._stateStr = "正在连接服务器";
            xhr = cc.vv.http.sendRequest("/get_serverinfo", null, function (ret) {
                xhr = null;
                complete = true;
                onGetVersion(ret);
            });
            setTimeout(fn, 5000);
        }

        const fn = function () {
            if (!complete) {
                if (xhr) {
                    xhr.abort();
                    self._stateStr = "连接失败，即将重试";
                    setTimeout(function () {
                        fnRequest();
                    }, 5000);
                } else {
                    fnRequest();
                }
            }
        };
        fn();
    },

    onBtnDownloadClicked: function () {
        cc.sys.openURL(cc.vv.SI.appweb);
    },

    startPreloading: function () {
        this._stateStr = "正在加载资源，请稍候";
        this._isLoading = true;
        const self = this;

        cc.loader.onProgress = function (completedCount, totalCount, item) {
            console.log("completedCount:" + completedCount + ",totalCount:" + totalCount );
            if (self._isLoading) {
                self._progress = completedCount / totalCount;
            }
        };

        cc.loader.loadResDir("textures", function (err, assets) {
            self.onLoadComplete();
        });
    },

    onLoadComplete: function () {
        this._isLoading = false;
        this._stateStr = "准备登陆";
        cc.director.loadScene("login");
        cc.loader.onComplete = null;
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this._stateStr.length == 0) {
            return;
        }
        this.tipLabel.string = this._stateStr + ' ';
        if (this._isLoading) {
            this.tipLabel.string += Math.floor(this._progress * 100) + "%";
        } else {
            const t = Math.floor(Date.now() / 1000) % 4;
            for (let i = 0; i < t; ++i) {
                this.tipLabel.string += '.';
            }
        }
    }
});