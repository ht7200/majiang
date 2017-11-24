function loadImage(url, code, callback) {
  cc.loader.load(url, (err, tex) => {
    const spriteFrame = new cc.SpriteFrame(
      tex,
      cc.Rect(0, 0, tex.width, tex.height)
    );
    callback(code, spriteFrame);
  });
}

function getBaseInfo(userid, callback) {
  if (cc.vv.baseInfoMap == null) {
    cc.vv.baseInfoMap = {};
  }

  if (cc.vv.baseInfoMap[userid] != null) {
    callback(userid, cc.vv.baseInfoMap[userid]);
  } else {
    cc.vv.http.sendRequest(
      '/base_info',
      { userid },
      (ret) => {
        let url = null;
        if (ret.headimgurl) {
          url = `${ret.headimgurl}.jpg`;
        }
        const info = {
          name: ret.name,
          sex: ret.sex,
          url
        };
        cc.vv.baseInfoMap[userid] = info;
        callback(userid, info);
      },
      cc.vv.http.master_url
    );
  }
}

cc.Class({
  extends: cc.Component,
  properties: {
  },

  // use this for initialization
  onLoad() {
    this.setupSpriteFrame();
  },

  setUserID(userid) {
    if (cc.sys.isNative === false) {
      return;
    }
    if (!userid) {
      return;
    }
    if (cc.vv.images == null) {
      cc.vv.images = {};
    }

    getBaseInfo(userid, (code, info) => {
      if (info && info.url) {
        loadImage(info.url, userid, (err, spriteFrame) => {
          this.spriteFrame = spriteFrame;
          this.setupSpriteFrame();
        });
      }
    });
  },

  setupSpriteFrame() {
    if (this.spriteFrame) {
      const spr = this.getComponent(cc.Sprite);
      if (spr) {
        spr.spriteFrame = this.spriteFrame;
      }
    }
  }
  // called every frame, uncomment this function to activate update callback
  // update: function (dt) {

  // },
});
