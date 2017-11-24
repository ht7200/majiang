cc.Class({
  extends: cc.Component,

  properties: {
    isCapturing: false,
  },

  // use this for initialization
  onLoad() {},

  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },

  init() {
    this.ANDROID_API = 'com/vivigames/scmj/WXAPI';
    this.IOS_API = 'AppController';
  },

  login() {
    if (cc.sys.os === cc.sys.OS_ANDROID) {
      jsb.reflection.callStaticMethod(this.ANDROID_API, 'Login', '()V');
    } else if (cc.sys.os === cc.sys.OS_IOS) {
      jsb.reflection.callStaticMethod(this.IOS_API, 'login');
    } else {
      console.log(`platform:${cc.sys.os} dosn't implement share.`);
    }
  },

  share(title, desc) {
    if (cc.sys.os === cc.sys.OS_ANDROID) {
      jsb.reflection.callStaticMethod(
        this.ANDROID_API,
        'Share',
        '(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V',
        cc.vv.SI.appweb,
        title,
        desc,
      );
    } else if (cc.sys.os === cc.sys.OS_IOS) {
      jsb.reflection.callStaticMethod(
        this.IOS_API,
        'share:shareTitle:shareDesc:',
        cc.vv.SI.appweb,
        title,
        desc,
      );
    } else {
      console.log(`platform:${cc.sys.os} dosn't implement share.`);
    }
  },

  shareResult() {
    if (this.isCapturing) {
      return;
    }
    this.isCapturing = true;
    const size = cc.director.getWinSize();
    const fileName = 'result_share.jpg';
    const fullPath = jsb.fileUtils.getWritablePath() + fileName;
    if (jsb.fileUtils.isFileExist(fullPath)) {
      jsb.fileUtils.removeFile(fullPath);
    }
    const texture = new cc.RenderTexture(
      Math.floor(size.width),
      Math.floor(size.height),
    );
    texture.setPosition(cc.p(size.width / 2, size.height / 2));
    texture.begin();
    cc.director.getRunningScene().visit();
    texture.end();
    texture.saveToFile(fileName, cc.IMAGE_FORMAT_JPG);

    let tryTimes = 0;
    const fn = () => {
      if (jsb.fileUtils.isFileExist(fullPath)) {
        const height = 100;
        const scale = height / size.height;
        const width = Math.floor(size.width * scale);

        if (cc.sys.os === cc.sys.OS_ANDROID) {
          jsb.reflection.callStaticMethod(
            this.ANDROID_API,
            'ShareIMG',
            '(Ljava/lang/String;II)V',
            fullPath,
            width,
            height,
          );
        } else if (cc.sys.os === cc.sys.OS_IOS) {
          jsb.reflection.callStaticMethod(
            this.IOS_API,
            'shareIMG:width:height:',
            fullPath,
            width,
            height,
          );
        } else {
          console.log(`platform:${cc.sys.os} dosn't implement share.`);
        }
        this.isCapturing = false;
      } else {
        tryTimes++;
        if (tryTimes > 10) {
          return;
        }
        setTimeout(fn, 50);
      }
    };
    setTimeout(fn, 50);
  },

  onLoginResp(code) {
    const fn = (ret) => {
      if (ret.errcode === 0) {
        cc.sys.localStorage.setItem('wx_account', ret.account);
        cc.sys.localStorage.setItem('wx_sign', ret.sign);
      }
      cc.vv.userMgr.onAuth(ret);
    };
    cc.vv.http.sendRequest(
      '/wechat_auth',
      {
        code,
        os: cc.sys.os,
      },
      fn,
    );
  },
});
