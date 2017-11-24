cc.Class({
  extends: cc.Component,

  properties: {
    sprIcon: null,
    zhuang: null,
    ready: null,
    offline: null,
    lblName: null,
    lblScore: null,
    scoreBg: null,
    nddayingjia: null,
    voicemsg: null,
    chatBubble: null,
    emoji: null,
    lastChatTime: -1,
    userName: '',
    score: 0,
    dayingjia: false,
    isOffline: false,
    isReady: false,
    isZhuang: false,
    userId: null
  },

  // use this for initialization
  onLoad() {
    if (cc.vv == null) {
      return;
    }

    this.sprIcon = this.node.getChildByName('icon').getComponent('ImageLoader');
    this.lblName = this.node.getChildByName('name').getComponent(cc.Label);
    this.lblScore = this.node.getChildByName('score').getComponent(cc.Label);
    this.voicemsg = this.node.getChildByName('voicemsg');
    this.xuanpai = this.node.getChildByName('xuanpai');
    this.refreshXuanPaiState();

    if (this.voicemsg) {
      this.voicemsg.active = false;
    }

    if (this.sprIcon && this.sprIcon.getComponent(cc.Button)) {
      cc.vv.utils.addClickEvent(
        this.sprIcon,
        this.node,
        'Seat',
        'onIconClicked'
      );
    }

    this.offline = this.node.getChildByName('offline');

    this.ready = this.node.getChildByName('ready');

    this.zhuang = this.node.getChildByName('zhuang');

    this.scoreBg = this.node.getChildByName('Z_money_frame');
    this.nddayingjia = this.node.getChildByName('dayingjia');

    this.chatBubble = this.node.getChildByName('ChatBubble');
    if (this.chatBubble != null) {
      this.chatBubble.active = false;
    }

    this.emoji = this.node.getChildByName('emoji');
    if (this.emoji != null) {
      this.emoji.active = false;
    }

    this.refresh();

    if (this.sprIcon && this.userId) {
      this.sprIcon.setUserID(this.userId);
    }
  },

  onIconClicked() {
    const iconSprite = this.sprIcon.node.getComponent(cc.Sprite);
    if (this.userId != null && this.userId > 0) {
      const seat = cc.vv.gameNetMgr.getSeatByID(this.userId);
      let sex = 0;
      if (cc.vv.baseInfoMap) {
        const info = cc.vv.baseInfoMap[this.userId];
        if (info) {
          const { sex: ox } = info;
          sex = ox;
        }
      }
      cc.vv.userinfoShow.show(seat.name, seat.userid, iconSprite, sex, seat.ip);
    }
  },

  refresh() {
    if (this.lblName != null) {
      this.lblName.string = this.userName;
    }

    if (this.lblScore != null) {
      this.lblScore.string = this.score;
    }

    if (this.nddayingjia != null) {
      this.nddayingjia.active = !!this.dayingjia;
    }

    if (this.offline) {
      this.offline.active = this.isOffline && this.userName !== '';
    }

    if (this.ready) {
      this.ready.active = this.isReady && cc.vv.gameNetMgr.numOfGames > 0;
    }

    if (this.zhuang) {
      this.zhuang.active = this.isZhuang;
    }

    this.node.active = this.userName != null && this.userName !== '';
  },

  setInfo(name, score, dayingjia) {
    this.userName = name;
    this.score = score;
    if (this.score == null) {
      this.score = 0;
    }
    this.dayingjia = dayingjia;

    if (this.scoreBg != null) {
      this.scoreBg.active = this.score != null;
    }

    if (this.lblScore != null) {
      this.lblScore.node.active = this.score != null;
    }

    this.refresh();
  },

  setZhuang(value) {
    if (this.zhuang) {
      this.zhuang.active = value;
    }
  },

  setReady(isReady) {
    this.isReady = isReady;
    if (this.ready) {
      this.ready.active = this.isReady && cc.vv.gameNetMgr.numOfGames > 0;
    }
  },

  setID(id) {
    const idNode = this.node.getChildByName('id');
    if (idNode) {
      const lbl = idNode.getComponent(cc.Label);
      lbl.string = `ID:${id}`;
    }

    this.userId = id;
    if (this.sprIcon) {
      this.sprIcon.setUserID(id);
    }
  },

  setOffline(isOffline) {
    this.isOffline = isOffline;
    if (this.offline) {
      this.offline.active = this.isOffline && this.userName !== '';
    }
  },

  chat(content) {
    if (this.chatBubble == null || this.emoji == null) {
      return;
    }
    this.emoji.active = false;
    this.chatBubble.active = true;
    this.chatBubble.getComponent(cc.Label).string = content;
    this.chatBubble
      .getChildByName('New Label')
      .getComponent(cc.Label).string = content;
    this.lastChatTime = 3;
  },

  emoji(emoji) {
    // emoji = JSON.parse(emoji);
    if (this.emoji == null || this.semoji == null) {
      return;
    }
    this.chatBubble.active = false;
    this.emoji.active = true;
    this.emoji.getComponent(cc.Animation).play(emoji);
    this.lastChatTime = 3;
  },

  voiceMsg(show) {
    if (this.voicemsg) {
      this.voicemsg.active = show;
    }
  },

  refreshXuanPaiState() {
    if (this.xuanpai == null) {
      return;
    }

    this.xuanpai.active = cc.vv.gameNetMgr.isHuanSanZhang;
    if (!cc.vv.gameNetMgr.isHuanSanZhang) {
      return;
    }

    this.xuanpai.getChildByName('xz').active = false;
    this.xuanpai.getChildByName('xd').active = false;

    const seat = cc.vv.gameNetMgr.getSeatByID(this.userId);
    if (seat) {
      if (seat.huanpais == null) {
        this.xuanpai.getChildByName('xz').active = true;
      } else {
        this.xuanpai.getChildByName('xd').active = true;
      }
    }
  },

  // called every frame, uncomment this function to activate update callback
  update(dt) {
    if (this.lastChatTime > 0) {
      this.lastChatTime -= dt;
      if (this.lastChatTime < 0) {
        this.chatBubble.active = false;
        this.emoji.active = false;
        this.emoji.getComponent(cc.Animation).stop();
      }
    }
  }
});
